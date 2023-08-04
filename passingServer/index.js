const { Server } = require("socket.io");
const cors = require("cors");
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const { uid } = require("uid");

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

    socket.on("join_room", (body) => {
        socket.join(body.roomId);
    });
});

app.post("/tabChanged", (req, res) => {
    console.log(req.body);
    const { roomId, tab } = req.body;

    io.to(roomId).emit("tabChanged", {
        roomId,
        tab,
    });

    res.status(200).send("tabChanged");
});

app.get("/getUniqueRoomId", (req, res) => {
    const roomId = uid(16);

    res.status(200).json({ roomId });
});

const PORT = 5000;

server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
