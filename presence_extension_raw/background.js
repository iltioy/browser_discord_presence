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
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const tab = tabs[0];

        const storage = await chrome.storage.sync.get();
        const roomId = storage.roomId;

        const data = {
            tab,
            roomId,
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
