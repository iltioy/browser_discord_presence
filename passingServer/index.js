const { Server } = require("socket.io");
const cors = require("cors");
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

app.use(
    cors({
        origin: "*",
        methods: "GET,POST,PUT,DELETE",
        credentials: true,
    })
);

io.on("connection", (socket) => {
    console.log("connected!");

    socket.on("hew", () => {
        console.log("hey");
    });
});

const PORT = 5000;

server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
