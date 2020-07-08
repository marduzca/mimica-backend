const express = require('express');
const router = express.Router();
const roomRepository = require('../repository/room_repository');

let players = [];
const activeRooms = [];
let currentRoom;

module.exports = function (io) {
    io.on('connection', socket => {
        socket.on('player', (player) => {
            currentRoom = player.roomID;
            socket.join(player.roomID);

            players.push({ name: player.name, room: currentRoom });

            if(activeRooms.includes(player.roomID)) {
                roomRepository.addPlayerToRoom(player.roomID, player.id, player.name);
            }
            else {
                roomRepository.createRoom(player.roomID, player.id, player.name);
                activeRooms.push(player.roomID);
            }
            
            io.sockets.in(currentRoom).emit('allUsers', players.filter(player => player.room === currentRoom));
        })

        // if (!users[socket.id]) {
        //     users[socket.id] = socket.id;
        // }

        console.log(players);
        console.log(activeRooms);

        socket.on('remove', (player) => {
            roomRepository.removePlayerFromRoom(player.roomID, player.id);
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
