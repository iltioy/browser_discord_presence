const RPC = require("discord-rpc");
const { io } = require("socket.io-client");
const { getCustomInterfaceInfo } = require("./interfaces");

const clientId = "1136297214516400269";
// 585164140947963924
// 1136297214516400269

// Chess.com
const chessClientId = "1140399707093479576";

let socket;

const joinRoom = (roomId) => {
    socket.emit("join_room", {
        roomId: roomId,
    });
};

const clearCustomInterfacesActivity = async (customInterfaces) => {
    if (!customInterfaces) return;
    const keys = Object.keys(customInterfaces);

    for (let i = 0; i < keys.length; i++) {
        await customInterfaces[keys[i]].clearActivity();
    }
};

const getIconUrl = (tab, additionalTabInfo) => {
    if (additionalTabInfo && additionalTabInfo.imagePath) {
        return additionalTabInfo.imagePath;
    }

    let iconUrl = "https://discord.hb.ru-msk.vkcs.cloud/internet.jpg";

    if (
        tab.favIconUrl &&
        (tab.favIconUrl.endsWith(".jpg") ||
            tab.favIconUrl.endsWith(".jpeg") ||
            tab.favIconUrl.endsWith(".png"))
    ) {
        iconUrl = tab.favIconUrl;
    }

    return iconUrl;
};

const getTabInfo = (tab, additionalTabInfo) => {
    let tabUrl;
    const iconUrl = getIconUrl(tab, additionalTabInfo);

    if (tab.url) {
        tabUrl = tab.url.split("://")[1].split("/")[0];

        if (tabUrl.startsWith("www.")) {
            tabUrl = tabUrl.slice(4);
        }
    }

    return { tabUrl, iconUrl };
};

const setupListeners = (client, socket, customClients) => {
    client.on("ready", async () => {
        socket.on("tabChanged", async (body) => {
            console.log(body);
            try {
                if (!body || !body.tab) return;
                const { tab, additionalTabInfo } = body;

                let { tabUrl, iconUrl } = getTabInfo(tab, additionalTabInfo);
                let state = `Visiting ${tabUrl}`;
                let details;
                let buttons;
                let customClientId;

                if (body.pageInterface && body.pageInterface.site) {
                    let info = getCustomInterfaceInfo(body);
                    state = info.status;
                    iconUrl = info.iconUrl;
                    details = info.details;
                    buttons = info.buttons;
                    customClientId = info.customClientId;
                }

                if (
                    customClientId &&
                    customClients &&
                    customClients[customClientId]
                ) {
                    const cutomCleint = customClients[customClientId];
                    await client.clearActivity();
                    await cutomCleint.setActivity({
                        largeImageKey: iconUrl,
                        state,
                        details,
                        buttons,
                        startTimestamp: Date.now(),
                    });
                } else {
                    await clearCustomInterfacesActivity(customClients);
                    await client.setActivity({
                        largeImageKey: iconUrl,
                        state,
                        details,
                        buttons,
                        startTimestamp: Date.now(),
                    });
                }
            } catch (error) {
                console.log(error);
            }
        });
    });
};

const createCustomClients = async () => {
    const chessClient = new RPC.Client({
        transport: "ipc",
    });

    await chessClient.login({ clientId: chessClientId }).catch(() => {
        console.log("chess error");
    });

    const customCliets = {
        chess: chessClient,
    };

    return customCliets;
};

const setupConnection = () => {
    return new Promise(async (resolve, reject) => {
        let discordConnected = false;
        let socketConnected = false;

        socket = io("http://localhost:5000/");

        setInterval(() => {
            if (socket.connected === true) {
                socketConnected = true;
                discordConnected && socketConnected
                    ? resolve("connected")
                    : null;
            }
        }, 1000);

        const client = new RPC.Client({
            transport: "ipc",
        });

        const customClients = await createCustomClients();

        setupListeners(client, socket, customClients);

        client.login({ clientId }).then(() => {
            discordConnected = true;
            discordConnected && socketConnected ? resolve("connected") : null;
        });

        setTimeout(() => {
            if (discordConnected && socketConnected) {
                resolve("connected");
            } else {
                reject("error");
            }
        }, 5000);
    });
};

module.exports = { setupConnection, joinRoom };
