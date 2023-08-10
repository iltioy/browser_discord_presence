const saveButton = document.querySelector(".saveButton");
const codeInput = document.querySelector(".codeInput");

ipcRenderer.on("code:retrieve", (event, message) => {
    console.log("lalalla");
    console.log(message);
    codeInput.value = message.code;
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
