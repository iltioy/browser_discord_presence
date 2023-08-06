const { io } = require("socket.io-client");
const socket = io("http://localhost:5000/");
const imageConversion = require("image-conversion");

const RPC = require("discord-rpc");

const clientId = "1136297214516400269";
// 1136297214516400269
const client = new RPC.Client({
    transport: "ipc",
});

client.on("ready", async () => {
    console.log("ready!");

    socket.emit("join_room", {
        roomId: "617ee43e0acd91de",
    });

    socket.on("tabChanged", async (body) => {
        console.log(body);

        try {
            if (!body || !body.tab) return;
            const { tab } = body;

            console.log(tab);

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

            await client.setActivity({
                // largeImageKey: tab.favIconUrl,
                largeImageKey: `${
                    isIconAvailable
                        ? tab.favIconUrl
                        : "https://discord.hb.ru-msk.vkcs.cloud/internet.jpg"
                }`,
                // partySize: 10,
                // partyMax: 5,
                // partyId: "123",
                state: `Visiting ${tabUrl}`,
                startTimestamp: Date.now(),
            });
        } catch (error) {
            console.log(error);
        }
    });
});

client.login({ clientId });

socket.emit("hew");
