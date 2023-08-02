const { io } = require("socket.io-client");
const socket = io("http://localhost:5000/");

const RPC = require("discord-rpc");

const clientId = "1136297214516400269";
// 1136297214516400269
const client = new RPC.Client({
    transport: "ipc",
});

client.on("ready", async () => {
    console.log("ready!");

    socket.on("event_emitted", async (body) => {
        console.log("got event!");

        try {
            await client.setActivity({
                largeImageKey:
                    "https://a6d5a5g3.rocketcdn.me/wp-content/uploads/2022/12/chess-play-learn-logo-2048x2048.jpg",
                // partySize: 10,
                // partyMax: 5,
                // partyId: "123",
                details: body.details,
                state: body.state,
                startTimestamp: Date.now(),
            });
        } catch (error) {
            console.log(error);
        }
    });
});

client.login({ clientId });

socket.emit("hew");
