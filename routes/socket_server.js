const express = require('express');
const router = express.Router();
const roomManager = require('../service/room/room_manager');

const users = {};

const socketToRoom = {};

let gameStarted = false;

let usedSettings;

module.exports = function (io) {
    io.on('connection', socket => {

        socket.on('newPlayer', async (player) => {
            socket.join(player.roomID);

            const updatedPlayersList = await roomManager.addNewPlayer(player);

            io.sockets.in(player.roomID).emit('currentPlayers', updatedPlayersList);

            if (gameStarted) {
                io.sockets.in(player.roomID).emit('startGame', usedSettings);
            }
        });

        socket.on('remove', async (player) => {
            const updatedPlayersList = await roomManager.removePlayer(player);
            gameStarted = false;
            console.log('LEAVING WITH ID ' + player.id)

            io.sockets.in(player.roomID).emit('user left', player);
            io.sockets.in(player.roomID).emit('currentPlayers', updatedPlayersList);
        });

        socket.on('startGame', (gameSettings) => {
            gameStarted = true;
            usedSettings = gameSettings;
            io.sockets.in(gameSettings.roomID).emit('startGame', gameSettings);
        });


        socket.on("join room", roomID => {
            if (users[roomID]) {
                users[roomID].push(socket.id);
            } else {
                users[roomID] = [socket.id];
            }

            socketToRoom[socket.id] = roomID;
            const usersInThisRoom = users[roomID].filter(id => id !== socket.id);

            console.log('USERS IN THIS ROOM');
            console.log(usersInThisRoom);
            socket.emit("all users", usersInThisRoom);
        });

        socket.on("sending signal", payload => {
            io.to(payload.userToSignal).emit('user joined', {signal: payload.signal, callerID: payload.callerID});
        });

        socket.on("returning signal", payload => {
            io.to(payload.callerID).emit('receiving returned signal', {signal: payload.signal, id: socket.id});
        });

        socket.on('disconnect', () => {
            const roomID = socketToRoom[socket.id];
            let room = users[roomID];
            if (room) {
                room = room.filter(id => id !== socket.id);
                users[roomID] = room;
            }
        });

    });

    return router;
}