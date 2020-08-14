const express = require('express');
let Peer = require('simple-peer')
const wrtc=require('wrtc')

const router = express.Router();
const roomManager = require('../service/room/room_manager');

const users = {};

const socketToRoom = {};

var Streamer={}
var Receiver={}


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

        socket.on('startGame', (gameSettings) => {
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


        socket.on('NewClientStreamer', function () {
            socket.emit('CreateClientStreamerPeer')
        })

        function InitializeReceiver(offer) {
            var receiver = {}
            let peer = new Peer({
                initiator: false,
                // config: configuration,
                // iceTransportPolicy: 'any',
                wrtc: wrtc,
                trickle: true
            })
            peer.on('signal', (data) => {
                socket.emit('Answer', data)
            })
            peer.on('close', function () {
                //
            })
            peer.on('stream', function (stream) {
                receiver.stream = stream
                receiver.peer = peer
                Receiver = receiver
            })
            peer.signal(offer)
        }

        socket.on('Offer', function (offer) {
            InitializeReceiver(offer)
        })

        socket.on('NewClientReceiver', function () {
            var streamer = {}
            streamer.gotAnswer = false
            let peer = new Peer({
                initiator: true,
                // config: configuration,
                // iceTransportPolicy: 'any',
                wrtc: wrtc,
                stream: Receiver.stream,
                trickle: true
            })
            peer.on('signal', function (offer) {
                if (!streamer.gotAnswer)
                    socket.emit('Offer', offer)
            })
            peer.on('connect', function () {
                Streamer = streamer
            })
            streamer.peer = peer

            socket.on('ClientAnswer', function (data) {
                streamer.gotAnswer = true
                streamer.peer.signal(data)
            })
        })
    });

    return router;
}