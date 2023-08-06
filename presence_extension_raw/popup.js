const setRoomId = async () => {
    storage = await chrome.storage.sync.get();
    document.querySelector(".roomIdContainer").innerText = storage.roomId;
};

setRoomId();

let navbarItems = document.querySelectorAll(".navbarItem");

navbarItems.forEach((element) => {
    element.addEventListener("click", () => {
        handleNavigation(element);
    });
});

const handleNavigation = (element) => {
    const pageId = element.getAttribute("pageId");

    const pageItems = document.querySelectorAll(".page");

    pageItems.forEach((el) => {
        if (el.getAttribute("pageId") !== pageId) {
            el.classList.add("disabled");
        } else {
            el.classList.remove("disabled");
        }
    });

    navbarItems.forEach((el) => {
        if (el.getAttribute("pageId") === pageId) {
            el.classList.add("activeNavbarItem");
        } else {
            el.classList.remove("activeNavbarItem");
        }
    });
};

document.querySelector(".restoreRoomIdButton").addEventListener("click", async () => {
    try {
        const res = await fetch("http://localhost:5000/getUniqueRoomId");
        const { roomId } = await res.json();

        if (!roomId) return;

        await chrome.storage.sync.set({ roomId });

        await setRoomId();
    } catch (error) {
        console.log(error);
    }
});
