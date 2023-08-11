const saveButton = document.querySelector(".saveButton");
const codeInput = document.querySelector(".codeInput");
const codePage = document.querySelector(".codePage");
const loadingPage = document.querySelector(".loadingPage");
const reconnectButton = document.querySelector(".reconnectButton");
const loadingError = document.querySelector(".loadingError");
const loading = document.querySelector(".loading");

ipcRenderer.on("connection:success", () => {
    codePage.classList.remove("hidden");
    loadingPage.classList.add("hidden");
});

ipcRenderer.on("connection:failed", () => {
    loadingError.classList.remove("hidden");
    loading.classList.add("hidden");
});

ipcRenderer.on("code:retrieve", (event, message) => {
    codeInput.value = message.code;
});

reconnectButton.addEventListener("click", () => {
    ipcRenderer.send("connection:reconnect");
});

saveButton.addEventListener("click", () => {
    const code = codeInput.value;

    if (!code) {
        console.log(error);
        return;
    }

    ipcRenderer.send("code:save", {
        code,
    });
});
