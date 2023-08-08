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

document.querySelector("#imageUpload").addEventListener("change", async () => {
    try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const tab = tabs[0];

        const input = document.querySelector("#imageUpload");
        const image = input.files[0];

        const formData = new FormData();
        formData.append("image", image);
        formData.append("tab", JSON.stringify(tab));

        const options = {
            method: "POST",
            body: formData,
        };

        const res = await fetch("http://localhost:5000/uploadPageIcon", options);
        const data = await res.json();

        if (!data.tabUrl) return;

        let { tabUrl, imagePath, imageKey } = data;

        await chrome.storage.sync.set({
            [tabUrl]: {
                imagePath,
                imageKey,
            },
        });
    } catch (error) {
        console.log(error);
    }
});
