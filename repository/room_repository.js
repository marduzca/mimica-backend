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
    }
}