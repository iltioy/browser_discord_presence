const RPC = require("discord-rpc");
const { io } = require("socket.io-client");

const clientId = "585164140947963924";
// 585164140947963924
// 1136297214516400269
let socket;

const joinRoom = (roomId) => {
    socket.emit("join_room", {
        roomId: roomId,
    });
};

const getTabInfo = (tab) => {
    let tabUrl;
    let isIconAvailable = true;
    if (
        !tab.favIconUrl ||
        !(
            tab.favIconUrl.endsWith(".jpg") ||
            tab.favIconUrl.endsWith(".jpeg") ||
            tab.favIconUrl.endsWith(".png")
        )
    ) {
        isIconAvailable = false;
    }

    if (tab.url) {
        tabUrl = tab.url.split("://")[1].split("/")[0];

        if (tabUrl.startsWith("www.")) {
            tabUrl = tabUrl.slice(4);
        }
    }

    return { tabUrl, isIconAvailable };
};

const setupListeners = (client, socket) => {
    client.on("ready", async () => {
        socket.on("tabChanged", async (body) => {
            console.log(body);
            try {
                if (!body || !body.tab) return;
                const { tab } = body;

                const { tabUrl, isIconAvailable } = getTabInfo(tab);

                await client.setActivity({
                    largeImageKey: `${
                        isIconAvailable
                            ? tab.favIconUrl
                            : "https://discord.hb.ru-msk.vkcs.cloud/internet.jpg"
                    }`,
                    state: `Visiting ${tabUrl}`,
                    startTimestamp: Date.now(),
                });
            } catch (error) {
                console.log(error);
            }
        });
    });
};

const setupConnection = () => {
    return new Promise((resolve, reject) => {
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

        setupListeners(client, socket);

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
