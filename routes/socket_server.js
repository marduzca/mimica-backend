const express = require('express');
const router = express.Router();
const roomManager = require('../service/room/room_manager');

module.exports = function (io) {
    io.on('connection', socket => {

        socket.on('newPlayer', async (player) => {
            socket.join(player.roomID);

            const updatedPlayersList = await roomManager.addNewPlayer(player);

            io.sockets.in(player.roomID).emit('currentPlayers', updatedPlayersList);
        });

        socket.on('remove', async (player) => {
            const updatedPlayersList = await roomManager.removePlayer(player);

            io.sockets.in(player.roomID).emit('currentPlayers', updatedPlayersList);

        });

        // if (!users[socket.id]) {
        //     users[socket.id] = socket.id;
        // }

        // socket.on('callUser', (data) => {
        //     io.to(data.userToCall).emit('hey', {signal: data.signalData, from: data.from});
        // })

        // socket.on('acceptCall', (data) => {
        //     io.to(data.to).emit('callAccepted', data.signal);
        // })
    });

    return router;
}