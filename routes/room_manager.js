const express = require('express');
const router = express.Router();
const roomRepo = require('../repository/room_repository');

const activeRooms = [];

module.exports = function (io) {
    io.on('connection', socket => {

        socket.on('newPlayer', async (player) => {
            socket.join(player.roomID);

            if (activeRooms.includes(player.roomID)) {
                roomRepo.addPlayerToRoom(player.roomID, player.id, player.name);
            }
            else {
                await roomRepo.createRoom(player.roomID, player.id, player.name);
                activeRooms.push(player.roomID);
            }

            const currentPlayers = await roomRepo.getPlayersInRoom(player.roomID);
            io.sockets.in(player.roomID).emit('currentPlayers', currentPlayers);
        });

        socket.on('remove', async (player) => {
            await roomRepo.assignNewHostIfNecessary(player.roomID, player.id);

            roomRepo.removePlayerFromRoom(player.roomID, player.id);

            const currentPlayers = await roomRepo.getPlayersInRoom(player.roomID);
            io.sockets.in(player.roomID).emit('currentPlayers', currentPlayers);

            if (await roomRepo.isRoomEmpty(player.roomID)) {
                roomRepo.closeRoom(player.roomID);
            }
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
};
