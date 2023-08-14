const reservedUrls = ["chess.com"];

const setInterfaces = async () => {
    chrome.storage.sync.set({
        interfaces: {
            chess: {},
        },
    });
};

chrome.runtime.onInstalled.addListener(async () => {
    try {
        await setInterfaces();

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
            const { site, tabUrl, info, passTheSameUrl } = message;

            sendTabInfo({
                site,
                tabUrl,
                info,
                passTheSameUrl,
            });
        }
    } catch (error) {
        console.log(error);
    }
});

const sendTabInfo = async (pageInterface = {}) => {
    try {
        // Get current tab and room id
        const tabs = await chrome.tabs.query({
            active: true,
            currentWindow: true,
        });
        const tab = tabs[0];

        if (!tab) return;

        const storage = await chrome.storage.sync.get();
        const roomId = storage.roomId;

        // Get core url
        let tabUrl = tab.url.split("://")[1].split("/")[0];
        if (tabUrl.startsWith("www.")) {
            tabUrl = tabUrl.slice(4);
        }

        // Check if pinned page passes
        const { isPinnedPageExists, isTabPinnedPage } = await handlePinnedPage(
            tab
        );
        if (isPinnedPageExists && !isTabPinnedPage) return;

        // Check if black/white lists pass

        const { isBlackListEnabled, isPageInBlackList } = await handleBlacklist(
            tabUrl
        );
        const { isPageInWhiteList, isWhiteListEnabled } = await handleWhitelist(
            tabUrl
        );

        if (isBlackListEnabled && isPageInBlackList) return;

        if (isWhiteListEnabled && !isPageInWhiteList) return;

        // Check url in reserved urls and return. If page interface send, keep to fetching
        if (reservedUrls.includes(tabUrl) && !pageInterface.site) {
            return;
        }

        // Gathering data to send
        let additionalTabInfo = storage[tabUrl];

        const data = {
            tab,
            roomId,
            additionalTabInfo,
            pageInterface,
        };

        // If url is the same as previous send, do not send it
        if (storage.lastSendUrl === tab.url && !pageInterface.passTheSameUrl) {
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

chrome.tabs.onActivated.addListener(() => sendTabInfo());
chrome.tabs.onUpdated.addListener(() => sendTabInfo());
