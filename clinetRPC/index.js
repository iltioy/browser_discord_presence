const { io } = require("socket.io-client");
const socket = io("http://localhost:5000/");

const RPC = require("discord-rpc");

const clientId = "1135614807823876096";

const client = new RPC.Client({
    transport: "ipc",
});

client.on("ready", async () => {
    console.log("ready!");

    await client.setActivity({
        details: "sadasd",
    });
});

client.login({ clientId });

socket.emit("hew");
