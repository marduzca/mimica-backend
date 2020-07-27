const { Client } = require('pg');
const client = new Client();
client.connect();

async function createRoom(roomID, hostID, hostName) {
    try {
        await client.query(
            `CREATE TABLE ROOM_${roomID} ( ` +
            'id VARCHAR(20) PRIMARY KEY, ' +
            'host BOOLEAN NOT NULL, ' +
            'name VARCHAR(20) NOT NULL, ' +
            'points INT DEFAULT 0, ' +
            'ranking INT DEFAULT 1 );'
        );
    }
    catch (err) {
        throw err;
    }
}

async function addPlayerToRoom(roomID, isHost, playerID, playerName) {
    try {
        await client.query(
            `INSERT INTO ROOM_${roomID} (host, id, name) ` +
            'VALUES($1, $2, $3);', [isHost, playerID, playerName]
        );
    }
    catch (err) {
        throw err;
    }
}

async function getPlayersInRoom(roomID) {
    try {
        const players = await client.query(`SELECT name, host FROM ROOM_${roomID};`);

        return players.rows;
    }
    catch (err) {
        throw err;
    }
}

async function removePlayerFromRoom(roomID, playerID) {
    try {
        await client.query(
            `DELETE FROM ROOM_${roomID} ` +
            'WHERE id = $1;', [playerID]
            );
    }
    catch (err) {
        throw err;
    }
}

async function closeRoom(roomID) {
    try {
        await client.query(`DROP TABLE ROOM_${roomID};`);
    }
    catch (err) {
        throw err;
    }
}

async function isRoomEmpty(roomID) {
    try {
        const isTableEmpty = await client.query(
            'SELECT CASE ' +
            `WHEN EXISTS (SELECT * FROM ROOM_${roomID} LIMIT 1) THEN FALSE ` +
            'ELSE TRUE ' +
            'END'
            );

        return isTableEmpty.rows[0].case;
    }
    catch (err) {
        throw err;
    }
}

async function isRoomHost(roomID, playerID) {
    try {
        const isHost = await client.query(
            `SELECT host FROM ROOM_${roomID} ` +
            'WHERE id = $1;', [playerID]
        );

        return isHost.rows[0].host;
    }
    catch (err) {
        throw err;
    }
}

async function reassignRoomHost(roomID, playerID) {
    try {
        await client.query(
            `UPDATE ROOM_${roomID} ` +
            'SET host = TRUE ' +
            'WHERE id = ' +
            `(SELECT id FROM ROOM_${roomID} WHERE id != $1 LIMIT 1 );`, [playerID]
        );
    }
    catch (err) {
        throw err;
    }
}

module.exports = {
    createRoom: createRoom,
    addPlayerToRoom: addPlayerToRoom,
    getPlayersInRoom: getPlayersInRoom,
    removePlayerFromRoom: removePlayerFromRoom,
    deleteRoomData: closeRoom,
    isRoomEmpty: isRoomEmpty,
    isRoomHost: isRoomHost,
    reassignRoomHost: reassignRoomHost
}
