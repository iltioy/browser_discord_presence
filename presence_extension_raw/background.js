const reservedUrls = ["chess.com"];

chrome.runtime.onInstalled.addListener(async () => {
    try {
        const res = await fetch("http://localhost:5000/getUniqueRoomId");
        const { roomId } = await res.json();

        if (!roomId) return;

        await chrome.storage.sync.set({ roomId });
    } catch (error) {
        console.log(error);
    }
});

chrome.runtime.onMessage.addListener(async (message) => {
    try {
        const tabs = await chrome.tabs.query({
            active: true,
            currentWindow: true,
        });
        const tab = tabs[0];
        if (!tab) return;

        if (tab.url !== message.tabUrl) {
            return;
        }

        if (message.site) {
            const { site, tabUrl, info } = message;

            sendTabInfo({
                site,
                tabUrl,
                info,
            });
        }
    } catch (error) {
        console.log(error);
    }
});

const handleBlacklist = async (tabUrl) => {
    const storage = await chrome.storage.sync.get();
    const isBlackListEnabled = storage.blackListEnabled;

    let isPageInBlackList = false;
    const blackList = storage.blackList;
    if (blackList && blackList.includes(tabUrl)) {
        isPageInBlackList = true;
    }

    return { isBlackListEnabled, isPageInBlackList };
};

const handleWhitelist = async (tabUrl) => {
    const storage = await chrome.storage.sync.get();
    const isWhiteListEnabled = storage.whiteListEnabled;

    let isPageInWhiteList = false;
    const whiteList = storage.whiteList;
    if (whiteList && whiteList.includes(tabUrl)) {
        isPageInWhiteList = true;
    }

    return { isWhiteListEnabled, isPageInWhiteList };
};

const handlePinnedPage = async (tab) => {
    let isPinnedPageExists = false;
    let isTabPinnedPage = false;

    const openedTabs = await chrome.tabs.query({});
    const sameTabs = openedTabs.filter((t) => t.id === tab.id);
    if (sameTabs.length === 0) {
        await chrome.storage.sync.set({
            pinnedPage: null,
        });

        return { isPinnedPageExists, isTabPinnedPage };
    }

    const storage = await chrome.storage.sync.get();
    const pinnedPage = storage.pinnedPage;
    if (pinnedPage) {
        isPinnedPageExists = true;

        if (pinnedPage === tab.id) {
            isTabPinnedPage = true;
        }
    }

    return { isPinnedPageExists, isTabPinnedPage };
};

const sendTabInfo = async (pageInterface = {}) => {
    try {
        const tabs = await chrome.tabs.query({
            active: true,
            currentWindow: true,
        });
        const tab = tabs[0];

        if (!tab) return;

        const storage = await chrome.storage.sync.get();
        const roomId = storage.roomId;

        let tabUrl = tab.url.split("://")[1].split("/")[0];
        if (tabUrl.startsWith("www.")) {
            tabUrl = tabUrl.slice(4);
        }

        const { isPinnedPageExists, isTabPinnedPage } = await handlePinnedPage(tab);
        if (isPinnedPageExists && !isTabPinnedPage) return;
        console.log("passed 1");

        const { isBlackListEnabled, isPageInBlackList } = await handleBlacklist(tabUrl);
        const { isPageInWhiteList, isWhiteListEnabled } = await handleWhitelist(tabUrl);

        if (isBlackListEnabled && isPageInBlackList) return;
        console.log("passed 2");

        if (isWhiteListEnabled && !isPageInWhiteList) return;
        console.log("passed 3");

        if (reservedUrls.includes(tabUrl) && !pageInterface.site) {
            return;
        }

        console.log("passed 4");

        let additionalTabInfo = storage[tabUrl];

        const data = {
            tab,
            roomId,
            additionalTabInfo,
            pageInterface,
        };

        if (storage.lastSendUrl === tab.url) {
            console.log("not passed(");

            return;
        }

        const res = await fetch("http://localhost:5000/tabChanged", {
            headers: {
                "Content-Type": "application/json",
            },
            method: "POST",

            body: JSON.stringify(data),
        });

        await chrome.storage.sync.set({
            lastSendUrl: tab.url,
        });
    } catch (error) {
        console.log(error);
    }
};

chrome.tabs.onActivated.addListener(() => sendTabInfo());
chrome.tabs.onUpdated.addListener(() => sendTabInfo());
