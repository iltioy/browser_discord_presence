(async () => {
    storage = await chrome.storage.sync.get();
    console.log(storage);
    document.querySelector(".roomIdContainer").innerText = storage.roomId;

    console.log(document.querySelector(".navbarItem"));
})();

document.getElementsByClassName("navbarItem").addEventListener("click", () => {
    console.log("add");
});
