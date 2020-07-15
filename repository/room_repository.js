const { Client } = require('pg');
const client = new Client();
client.connect();

module.exports = {
    createRoom: async (roomID, hostID, hostName) => {
        try {
            await client.query(
                `CREATE TABLE ROOM_${roomID} ( ` +
                'id VARCHAR(20) PRIMARY KEY, ' +
                'host BOOLEAN NOT NULL, ' +
                'name VARCHAR(20) NOT NULL, ' +
                'points INT DEFAULT 0, ' +
                'ranking INT DEFAULT 1 );');

            await client.query(
                `INSERT INTO ROOM_${roomID} (host, id, name) ` +
                'VALUES(TRUE, $1, $2);', [hostID, hostName]);
        }
        catch (err) {
            throw err;
        }
    },

    addPlayerToRoom: async (roomID, playerID, playerName) => {
        try {
            await client.query(
                `INSERT INTO ROOM_${roomID} (host, id, name) ` +
                'VALUES(FALSE, $1, $2);', [playerID, playerName]);
        }
        catch (err) {
            throw err;
        }
    },
    
    getPlayersInRoom: async (roomID) => {
        try {
            const players = await client.query(`SELECT name, host FROM ROOM_${roomID};`);

            return players.rows;
        }
        catch (err) {
            throw err;
        }
    },


    removePlayerFromRoom: async (roomID, playerID) => {
        try {
            await client.query(
                `DELETE FROM ROOM_${roomID} ` +
                'WHERE id = $1;', [playerID]);
        }
        catch (err) {
            throw err;
        }
    },

    closeRoom: async (roomID) => {
        try {
            await client.query(`DROP TABLE ROOM_${roomID};`);
        }
        catch (err) {
            throw err;
        }
    },

    isRoomEmpty: async (roomID) => {
        try {
            const isTableEmpty = await client.query(
                'SELECT CASE ' +
                `WHEN EXISTS (SELECT * FROM ROOM_${roomID} LIMIT 1) THEN FALSE ` +
                'ELSE TRUE ' +
                'END');

            return isTableEmpty.rows[0].case;
        }
        catch (err) {
            throw err;
        }
    },

    assignNewHostIfNecessary: async (roomID, playerID) => {
        try {
            const isHost = await client.query(
                `SELECT host FROM ROOM_${roomID} ` +
                'WHERE id = $1;', [playerID]
            );

            if (isHost.rows[0].host) {
                await client.query(
                    `UPDATE ROOM_${roomID} ` +
                    'SET host = TRUE ' +
                    'WHERE id = ' +
                    `(SELECT id FROM ROOM_${roomID} WHERE id != $1 LIMIT 1 );`, [playerID]
                );
            }
        }
        catch (err) {
            throw err;
        }
    }
}