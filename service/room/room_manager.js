const roomRepo = require('../../repository/room_repository');

const activeRooms = [];

async function addNewPlayer(player) {
    if (activeRooms.includes(player.roomID)) {
        roomRepo.addPlayerToRoom(player.roomID, false, player.id, player.name);
    } else {
        roomRepo.createRoom(player.roomID);
        roomRepo.addPlayerToRoom(player.roomID, true, player.id, player.name);
        activeRooms.push(player.roomID);
    }

    return await roomRepo.getPlayersInRoom(player.roomID);
}

async function removePlayer(player) {
    changeRoomHostIfNecessary(player.roomID, player.id);

    roomRepo.removePlayerFromRoom(player.roomID, player.id);

    if (await roomRepo.isRoomEmpty(player.roomID)) {
        closeRoom(player.roomID);
    } else {
        return await roomRepo.getPlayersInRoom(player.roomID);
    }
}

async function changeRoomHostIfNecessary(roomID, id) {
    if (await roomRepo.isRoomHost(roomID, id)) {
        roomRepo.reassignRoomHost(roomID, id);
    }
}

function closeRoom(roomID) {
    roomRepo.deleteRoomData(roomID);
    activeRooms.splice(activeRooms.indexOf(roomID), 1);
}


module.exports = {
    activeRooms: activeRooms,
    addNewPlayer: addNewPlayer,
    removePlayer: removePlayer
}