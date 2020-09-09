const express = require("express");
const cors = require("cors");
const http = require("http");
const socketio = require("socket.io");
const router = require("./routes/router");
const {getUsersInRoom, getUser, removeUser, addUser} = require("./utils/users");

const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(router);

const server = http.createServer(app);
const io = socketio(server);

io.on("connect", socket => {
    //socket represents a client side socket that just logged in.
    // console.log("We have a new connection");

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if(user) {
            io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} has left.` });
            io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
        }
    })

    socket.on('join', ({ name, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, name, room });

        if(error) return callback(error);

        socket.join(user.room);

        socket.emit('message', { user: 'admin', text: `${user.name}, welcome to room ${user.room}.`});
        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` });

        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);

        io.to(user.room).emit('message', { user: user.name, text: message });

        callback();
    });

});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
