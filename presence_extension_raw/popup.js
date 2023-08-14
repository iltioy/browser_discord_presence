const roomIdContainer = document.querySelector(".roomIdContainer");
let navbarItems = document.querySelectorAll(".navbarItem");
const pageItems = document.querySelectorAll(".page");
const restoreRoomIdButton = document.querySelector(".restoreRoomIdButton");
const imageUpload = document.querySelector("#imageUpload");
const uploadedFileInfo = document.querySelector(".uploadedFileInfo");
const pinPageCheckbox = document.querySelector(".pinPageCheckbox");

const addPageWhiteList = document.querySelector(".addPageWhiteList");
const addPageBlackList = document.querySelector(".addPageBlackList");

const listItemsContainterWhiteList = document.querySelector(".listItemsContainterWhiteList");
const listItemsContainterBlackList = document.querySelector(".listItemsContainterBlackList");

const settingsSubPages = document.querySelectorAll(".settingsSubPage");
const settingsNavigationItems = document.querySelectorAll(".settingsNav");

const changeEnabledButtons = document.querySelectorAll(".changeEnabledButton");

const pinPageIdDiv = document.querySelector(".pinPageIdDiv");
const clearPinnedPageButton = document.querySelector(".clearPinnedPage");

const getStorageAndTab = async () => {
    let storage = await chrome.storage.sync.get();

    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];

    return { tab, storage };
};

navbarItems.forEach((element) => {
    element.addEventListener("click", () => {
        handleNavigation(element);
    });
});

settingsNavigationItems.forEach((element) => {
    element.addEventListener("click", () => {
        handleSettingsNavigation(element);
    });
});

const getTabUrl = (tab) => {
    let tabUrl = tab.url.split("://")[1].split("/")[0];
    if (tabUrl.startsWith("www.")) {
        tabUrl = tabUrl.slice(4);
    }

    return tabUrl;
};

const getTabInfo = async () => {
    const { storage, tab } = await getStorageAndTab();

    if (!tab) return;
    const tabUrl = getTabUrl(tab);

    return storage[tabUrl];
};

const setRoomId = async () => {
    const { storage, tab } = await getStorageAndTab();
    roomIdContainer.innerText = storage.roomId;
};

const loadPageInfo = async () => {
    const { storage, tab } = await getStorageAndTab();
    console.log(storage);
    roomIdContainer.innerText = storage.roomId;

    if (storage.pinnedPage === tab.id) {
        pinPageCheckbox.checked = true;
    }

    if (storage.pinnedPage) {
        pinPageIdDiv.innerHTML = `id: ${storage.pinnedPage}`;
        pinPageIdDiv.classList.remove("disabled");
        clearPinnedPageButton.classList.remove("disabled");
    }

    const tabInfo = await getTabInfo();
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

const handleSettingsNavigation = (element) => {
    const pageId = element.getAttribute("pageId");

    settingsSubPages.forEach((el) => {
        if (el.getAttribute("pageId") !== pageId) {
            el.classList.add("disabled");
        } else {
            el.classList.remove("disabled");
        }
    });

    if (pageId === "2") {
        updateList("whiteList");
    } else if (pageId === "3") {
        updateList("blackList");
    }
};

loadPageInfo();

const updateList = async (listName) => {
    const { storage } = await getStorageAndTab();

    let listItems;
    let container;
    if (listName === "whiteList") {
        listItems = storage.whiteList;
        container = listItemsContainterWhiteList;
    } else {
        listItems = storage.blackList;
        container = listItemsContainterBlackList;
    }

    if (!listItems) return;

    container.innerHTML = "";

    for (let i = 0; i < listItems.length; i++) {
        let listItemDiv = document.createElement("div");
        listItemDiv.classList.add("listItem");

        let listNameDiv = document.createElement("div");
        listNameDiv.classList.add("listName");
        listNameDiv.innerText = listItems[i];

        const deleteIconContainterDiv = document.createElement("div");
        deleteIconContainterDiv.classList.add("deleteIconContainter");
        const img = document.createElement("img");
        img.src = "./assets/delete.png";
        img.classList.add("deleteIcon");
        img.addEventListener("click", async () => {
            await handleDeleteListItem(listItems[i], listItemDiv, listName);
        });

        deleteIconContainterDiv.appendChild(img);

        listItemDiv.appendChild(listNameDiv);
        listItemDiv.appendChild(deleteIconContainterDiv);

        container.appendChild(listItemDiv);
    }
};

const handleDeleteListItem = async (tabUrl, domElement, listName) => {
    try {
        const { storage } = await getStorageAndTab();
        let list;
        if (listName === "whiteList") {
            list = storage.whiteList;
        } else {
            list = storage.blackList;
        }

        if (!list) return;

        await chrome.storage.sync.set({
            [listName]: list.filter((el) => el !== tabUrl),
        });

        domElement.remove();
    } catch (error) {
        console.log(error);
    }
};

const handleAddItemToList = async (listName) => {
    const { storage, tab } = await getStorageAndTab();
    const tabUrl = getTabUrl(tab);
    let list;

    if (listName === "whiteList") {
        list = storage.whiteList;
    } else {
        list = storage.blackList;
    }

    if (list) {
        if (list.includes(tabUrl)) {
            return;
        }

        await chrome.storage.sync.set({
            [listName]: [...list, tabUrl],
        });
    } else {
        await chrome.storage.sync.set({
            [listName]: [tabUrl],
        });
    }

    await updateList(listName);
};

const handleChangeListEnabled = async (element) => {
    if (!element) return;
    const list = element.getAttribute("list");
    if (!list) return;
    let enabled = element.innerHTML === "Enabled" ? true : false;

    if (enabled) {
        element.innerHTML = "Disabled";
        element.classList.add("disableButton");
        element.classList.remove("enableButton");
    } else {
        element.innerHTML = "Enabled";
        element.classList.remove("disableButton");
        element.classList.add("enableButton");
    }

    if (list === "whiteList") {
        await chrome.storage.sync.set({
            whiteListEnabled: !enabled,
        });
    } else if (list === "blackList") {
        await chrome.storage.sync.set({
            blackListEnabled: !enabled,
        });
    }
};

changeEnabledButtons.forEach(async (button) => {
    const { storage } = await getStorageAndTab();
    let list = button.getAttribute("list");
    if (list === "whiteList") {
        if (storage.whiteListEnabled) {
            button.innerHTML = "Enabled";
            button.classList.add("enableButton");
            button.classList.remove("disableButton");
        }
    } else if (list === "blackList") {
        if (storage.blackListEnabled) {
            button.innerHTML = "Enabled";
            button.classList.add("enableButton");
            button.classList.remove("disableButton");
        }
    }

    button.addEventListener("click", () => {
        handleChangeListEnabled(button);
    });
});

addPageWhiteList.addEventListener("click", async () => {
    await handleAddItemToList("whiteList");
});

addPageBlackList.addEventListener("click", async () => {
    await handleAddItemToList("blackList");
});

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
        const tabs = await chrome.tabs.query({
            active: true,
            currentWindow: true,
        });
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

clearPinnedPageButton.addEventListener("click", async () => {
    try {
        await chrome.storage.sync.set({
            pinnedPage: null,
        });

        pinPageIdDiv.classList.add("disabled");
        clearPinnedPageButton.classList.add("disabled");
    } catch (error) {
        console.log(error);
    }
});

pinPageCheckbox.addEventListener("change", async (e) => {
    console.log(e.target.checked);
    const { storage, tab } = await getStorageAndTab();

    const isCheched = e.target.checked;

    if (isCheched) {
        console.log("checked");
        if (storage.pinnedPage !== tab.id) {
            await chrome.storage.sync.set({
                pinnedPage: tab.id,
            });
        }
    } else {
        if (storage.pinnedPage === tab.id) {
            console.log("changed2");
            await chrome.storage.sync.set({
                pinnedPage: null,
            });
        }
    }
});
