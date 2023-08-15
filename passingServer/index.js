const { Server } = require("socket.io");
const cors = require("cors");
const express = require("express");
require("express-async-errors");
const http = require("http");
const app = express();
const server = http.createServer(app);
const { uid } = require("uid");
const fs = require("fs");
const upload = require("./services/fileUpload");
const { uploadFile, deleteFile } = require("./services/bucket");

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
    const { roomId, tab, additionalTabInfo, settings, pageInterface } = req.body;

    io.to(roomId).emit("tabChanged", {
        roomId,
        tab,
        additionalTabInfo,
        settings,
        pageInterface,
    });

    res.status(200).send("tabChanged");
});

app.get("/getUniqueRoomId", (req, res) => {
    const roomId = uid(16);

    res.status(200).json({ roomId });
});

app.delete("/deletePageIcon", async (req, res) => {
    const { imageKey } = req.body;

    if (!imageKey) {
        res.send("image key required!");
        return;
    }

    await deleteFile(imageKey);
    res.status(200).send("image deleted!");
});

app.post("/uploadPageIcon", upload.single("image"), async (req, res) => {
    setTimeout(() => {
        fs.unlinkSync(req.file.path);
    }, 5000);

    let tabUrl;

    const tab = JSON.parse(req.body.tab);

    if (tab.url) {
        tabUrl = tab.url.split("://")[1].split("/")[0];

        if (tabUrl.startsWith("www.")) {
            tabUrl = tabUrl.slice(4);
        }
    }

    const file = req.file;
    const result = await uploadFile(file);

    res.status(200).json({
        imagePath: result.Location,
        imageKey: result.Key,
        tabUrl,
    });
});

const PORT = 5000;

server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
