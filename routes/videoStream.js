const express = require('express');
const router = express.Router();

const users = {};

module.exports = function (io) {
    io.on('connection', socket => {
        if (!users[socket.id]) {
            users[socket.id] = socket.id;
        }
        socket.emit("yourID", socket.id);
        io.sockets.emit("allUsers", users);
        socket.on('disconnect', () => {
            delete users[socket.id];
        })
    
        socket.on("callUser", (data) => {
            io.to(data.userToCall).emit('hey', {signal: data.signalData, from: data.from});
        })
    
        socket.on("acceptCall", (data) => {
            io.to(data.to).emit('callAccepted', data.signal);
        })
    });

    return router;
};
