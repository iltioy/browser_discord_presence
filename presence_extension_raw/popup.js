const sendRoomIdMessage = () => {
    const roomId = document.getElementById("roomIdInput").value;

    console.log(roomId);
};

document.getElementById("saveRoomIdButton").addEventListener("click", () => {
    sendRoomIdMessage();
});

(async () => {
    storage = await chrome.storage.sync.get();
    console.log(storage);
    document.getElementById("roomIdContainer").innerText = storage.roomId;
})();
