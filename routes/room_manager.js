const express = require('express');
const router = express.Router();
const roomRepository = require('../repository/room_repository');

const activeRooms = [];

module.exports = function (io) {
    io.on('connection', socket => {
        socket.on('player', async (player) => {
            socket.join(player.roomID);

            if(activeRooms.includes(player.roomID)) {
                roomRepository.addPlayerToRoom(player.roomID, player.id, player.name);
            }
            else {
                await roomRepository.createRoom(player.roomID, player.id, player.name);
                activeRooms.push(player.roomID);
            }
            
            const currentPlayers = await roomRepository.getPlayersInRoom(player.roomID);
            io.sockets.in(player.roomID).emit('allUsers', currentPlayers);
        })

        // if (!users[socket.id]) {
        //     users[socket.id] = socket.id;
        // }

        socket.on('remove', async (player) => {
            await roomRepository.assignNewHostIfNecessary(player.roomID, player.id);

            roomRepository.removePlayerFromRoom(player.roomID, player.id);

            const currentPlayers = await roomRepository.getPlayersInRoom(player.roomID);
            io.sockets.in(player.roomID).emit('allUsers', currentPlayers);

            if(await roomRepository.isRoomEmpty(player.roomID)) {
                roomRepository.closeRoom(player.roomID);
            }
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
