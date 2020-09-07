const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const router = require("./routes/router");

const PORT = process.env.PORT || 5000;
const app = express();
app.use(router);

const server = http.createServer(app);
const io = socketio(server);

io.on("connect", socket => {
    //socket represents a client side socket.
    console.log("We have a new connection");

    socket.on("disconnect", () => {
        console.log("User has left room");
    });

    socket.on("join", ({name, room}, callback) => {
        console.log(name, room);
        callback();
    })
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
