const roomRepo = require('../../repository/room_repository');

const activeRooms = [];

module.exports = {

    addNewPlayer: async (player) => {
        if (activeRooms.includes(player.roomID)) {
            roomRepo.addPlayerToRoom(player.roomID, player.id, player.name);
        }
        else {
            await roomRepo.createRoom(player.roomID, player.id, player.name);
            activeRooms.push(player.roomID);
        }

        return await roomRepo.getPlayersInRoom(player.roomID);
    },

    removePlayer: async (player) => {
        await roomRepo.assignNewHostIfNecessary(player.roomID, player.id);

        roomRepo.removePlayerFromRoom(player.roomID, player.id);

        if (await roomRepo.isRoomEmpty(player.roomID)) {
            roomRepo.closeRoom(player.roomID);
            activeRooms.splice(activeRooms.indexOf(player.roomID), 1);
        }
        else {
            return await roomRepo.getPlayersInRoom(player.roomID);
        }

    }

}