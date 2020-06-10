const express = require('express');
const router = express.Router();

const users = {};

module.exports = function (io) {
    io.on('connection', socket => {
        if (!users[socket.id]) {
            console.log('ON CONNECTION ' + socket.id);
            users[socket.id] = socket.id;
        }
        console.log('BREAKPOINT 1, USERS: ' + users);

        socket.emit("yourID", socket.id);
        io.sockets.emit("allUsers", users);
        console.log('BREAKPOINT 2, USERS: ' + users);

        socket.on('disconnect', () => {
            console.log('ON disconnect ');
            delete users[socket.id];
        })
    
        console.log('BREAKPOINT 3, USERS: ' + users);


        socket.on("callUser", (data) => {
            console.log('ON callUSER ' + data);
            io.to(data.userToCall).emit('hey', {signal: data.signalData, from: data.from});
        })
    
        console.log('BREAKPOINT 4, USERS: ' + users);


        socket.on("acceptCall", (data) => {
            console.log('ON acceptCall ' + data);
            io.to(data.to).emit('callAccepted', data.signal);
        })

        console.log('BREAKPOINT 5, USERS: ' + users);

    });

    return router;
};
