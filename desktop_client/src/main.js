const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const Store = require("electron-store");

const store = new Store();

const { setupConnection, joinRoom } = require("./utils/discord");

if (require("electron-squirrel-startup")) {
    app.quit();
}

let mainWindow;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 400,
        height: 500,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: true,
        },
        autoHideMenuBar: true,
        resizable: false,
    });

    mainWindow.loadFile(path.join(__dirname, "index.html"));
    // mainWindow.webContents.openDevTools();
    mainWindow.webContents.send("code:retrieve");
};

app.on("ready", async () => {
    createWindow();

    ipcMain.on("code:save", (e, message) => {
        const { code } = message;
        store.set("code", code);
        joinRoom(code);
    });

    setupConnection()
        .then(() => {
            console.log("connected");
        })
        .catch(() => {
            console.log("error");
        });

    const code = store.get("code");

    if (code) {
        joinRoom(code);
        mainWindow.webContents.send("code:retrieve", {
            code,
        });
    }
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }

    mainWindow = null;
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
