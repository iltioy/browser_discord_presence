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

const sendTabInfo = async () => {
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

        let additionalTabInfo = storage[tabUrl];
        let settings = {
            pinnedPage: storage.pinnedPage,
            whiteList: storage.whiteList,
            blackList: storage.blackList,
        };

        // let additionalInfo = await chrome.storage.sync.get(tabUrl);
        // let addInfo = additionalInfo[Object.keys(additionalInfo)[0]];

        const data = {
            tab,
            roomId,
            additionalTabInfo,
            settings,
        };

        const res = await fetch("http://localhost:5000/tabChanged", {
            headers: {
                "Content-Type": "application/json",
            },
            method: "POST",

            body: JSON.stringify(data),
        });
    } catch (error) {
        console.log(error);
    }
};

chrome.tabs.onActivated.addListener(sendTabInfo);
chrome.tabs.onUpdated.addListener(sendTabInfo);
