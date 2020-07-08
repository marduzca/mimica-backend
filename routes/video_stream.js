const express = require('express');
const router = express.Router();

let users = [];
let currentRoom;

module.exports = function (io) {
    io.on('connection', socket => {
        socket.on('room', (room) => {
            currentRoom = room;
            socket.join(room);
        })

        // if (!users[socket.id]) {
        //     users[socket.id] = socket.id;
        // }

        users.push({ name: socket.id, room: currentRoom });

        console.log(users);

        io.sockets.in(currentRoom).emit('allUsers', users.filter(user => user.room === currentRoom));

        // socket.emit('yourID', socket.id);
        // io.sockets.emit('allUsers', users);
        socket.on('disconnect', () => {
            console.log('Current id:' + socket.id);
            users = users.filter(user => user.name !== socket.id)
            console.log('Length: ' + users.length)
        })

        // socket.on('callUser', (data) => {
        //     io.to(data.userToCall).emit('hey', {signal: data.signalData, from: data.from});
        // })

        // socket.on('acceptCall', (data) => {
        //     io.to(data.to).emit('callAccepted', data.signal);
        // })
    });

    return router;
};
