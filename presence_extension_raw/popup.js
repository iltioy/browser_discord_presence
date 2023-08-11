const roomIdContainer = document.querySelector(".roomIdContainer");
let navbarItems = document.querySelectorAll(".navbarItem");
const pageItems = document.querySelectorAll(".page");
const restoreRoomIdButton = document.querySelector(".restoreRoomIdButton");
const imageUpload = document.querySelector("#imageUpload");
const uploadedFileInfo = document.querySelector(".uploadedFileInfo");

const setRoomId = async () => {
    storage = await chrome.storage.sync.get();
    roomIdContainer.innerText = storage.roomId;
};

setRoomId();

navbarItems.forEach((element) => {
    element.addEventListener("click", () => {
        handleNavigation(element);
    });
});

const getTabInfo = async () => {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];

    if (!tab) return;

    const storage = await chrome.storage.sync.get();

    let tabUrl = tab.url.split("://")[1].split("/")[0];
    if (tabUrl.startsWith("www.")) {
        tabUrl = tabUrl.slice(4);
    }

    return storage[tabUrl];
};

const loadPageInfo = async () => {
    const tabInfo = await getTabInfo();
    console.log(tabInfo);
    if (!tabInfo) return;

    const { imagePath, imageName } = tabInfo;

    if (imageName) {
        uploadedFileInfo.innerText = imageName;
    }
};

const handleNavigation = (element) => {
    const pageId = element.getAttribute("pageId");

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

loadPageInfo();

restoreRoomIdButton.addEventListener("click", async () => {
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

imageUpload.addEventListener("change", async () => {
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
                imageName: image.name,
            },
        });
    } catch (error) {
        console.log(error);
    }
});
