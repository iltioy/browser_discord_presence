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

app.use(express.json());

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
        io.emit("event_emitted", {
            details: "Visiting Chess.com",
            state: "Not in game",
        });
    });

    socket.on("ext", () => {
        console.log("extension connected!");
    });
});

app.post("/check", (req, res) => {
    console.log(req.body);
    res.send("check");
});

const PORT = 5000;

server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
