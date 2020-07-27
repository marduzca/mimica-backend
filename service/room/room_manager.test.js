const roomManager = require('./room_manager');
const roomRepoMock = require('../../repository/room_repository');

jest.mock('../../repository/room_repository', () => {
    return {
        createRoom: jest.fn(),
        addPlayerToRoom: jest.fn(),
        getPlayersInRoom: jest.fn(),
        removePlayerFromRoom: jest.fn(),
        deleteRoomData: jest.fn(),
        isRoomEmpty: jest.fn(),
        isRoomHost: jest.fn(),
        reassignRoomHost: jest.fn()
    }
})

describe('Add new player', () => {

    afterEach(() => {
        roomManager.activeRooms.length = 0;
        jest.clearAllMocks();
    });


    it('Should create new room and add player', async () => {
        const hostPlayer = {
            roomID: 'a3zrgy58d9o',
            name: 'Viguelon',
            id: 'XI1gJG-8YGrZP2ZqAAAA'
        };
        await roomManager.addNewPlayer(hostPlayer);

        expect(roomRepoMock.createRoom).toHaveBeenCalledTimes(1);
        expect(roomRepoMock.addPlayerToRoom).toHaveBeenCalledTimes(1);
        expect(roomRepoMock.getPlayersInRoom).toHaveBeenCalledTimes(1);

        expect(roomRepoMock.createRoom).toHaveBeenCalledWith(hostPlayer.roomID);
        expect(roomRepoMock.addPlayerToRoom).toHaveBeenCalledWith(hostPlayer.roomID, true, hostPlayer.id, hostPlayer.name);
    });

    it('Should find existing room and add player to existing ones', async () => {
        roomManager.activeRooms.push('a3zrgy58d9o');

        const nonHostPlayer = {
            roomID: 'a3zrgy58d9o',
            name: 'Amigo',
            id: 'k28dm4-8YGrZP2ms51l9'
        };

        await roomManager.addNewPlayer(nonHostPlayer);

        expect(roomRepoMock.addPlayerToRoom).toHaveBeenCalledTimes(1);
        expect(roomRepoMock.getPlayersInRoom).toHaveBeenCalledTimes(1);

        expect(roomRepoMock.addPlayerToRoom).toHaveBeenCalledWith(nonHostPlayer.roomID, false, nonHostPlayer.id, nonHostPlayer.name);
    });
})

describe('Remove player', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('Should remove non-host player from room', async () => {
        roomRepoMock.isRoomHost.mockResolvedValue(false);
        roomRepoMock.isRoomEmpty.mockResolvedValue(false);

        const nonHostPlayer = {
            roomID: 'a3zrgy58d9o',
            name: 'Amigo',
            id: 'k28dm4-8YGrZP2ms51l9'
        };
        await roomManager.removePlayer(nonHostPlayer);

        expect(roomRepoMock.reassignRoomHost).toHaveBeenCalledTimes(0);
        expect(roomRepoMock.deleteRoomData).toHaveBeenCalledTimes(0);

        expect(roomRepoMock.isRoomHost).toHaveBeenCalledWith(nonHostPlayer.roomID, nonHostPlayer.id);
        expect(roomRepoMock.removePlayerFromRoom).toHaveBeenCalledWith(nonHostPlayer.roomID, nonHostPlayer.id);
        expect(roomRepoMock.isRoomEmpty).toHaveBeenCalledWith(nonHostPlayer.roomID);
        expect(roomRepoMock.getPlayersInRoom).toHaveBeenLastCalledWith(nonHostPlayer.roomID);
    });

    it('Should reassign host to another player and remove it from the room', async () => {
        roomRepoMock.isRoomHost.mockResolvedValue(true);
        roomRepoMock.isRoomEmpty.mockResolvedValue(false);

        const hostPlayer = {
            roomID: 'a3zrgy58d9o',
            name: 'Amigo',
            id: 'k28dm4-8YGrZP2ms51l9'
        };
        await roomManager.removePlayer(hostPlayer);

        expect(roomRepoMock.deleteRoomData).toHaveBeenCalledTimes(0);

        expect(roomRepoMock.isRoomHost).toHaveBeenCalledWith(hostPlayer.roomID, hostPlayer.id);
        expect(roomRepoMock.reassignRoomHost).toHaveBeenLastCalledWith(hostPlayer.roomID, hostPlayer.id);
        expect(roomRepoMock.removePlayerFromRoom).toHaveBeenCalledWith(hostPlayer.roomID, hostPlayer.id);
        expect(roomRepoMock.isRoomEmpty).toHaveBeenCalledWith(hostPlayer.roomID);
        expect(roomRepoMock.getPlayersInRoom).toHaveBeenLastCalledWith(hostPlayer.roomID);
    });

    it('Should remove host player and close room', async () => {
        roomManager.activeRooms.push('a3zrgy58d9o');
        roomRepoMock.isRoomHost.mockResolvedValue(true);
        roomRepoMock.isRoomEmpty.mockResolvedValue(true);

        const hostPlayer = {
            roomID: 'a3zrgy58d9o',
            name: 'Amigo',
            id: 'k28dm4-8YGrZP2ms51l9'
        };
        await roomManager.removePlayer(hostPlayer);

        expect(roomManager.activeRooms.length).toEqual(0);
        expect(roomRepoMock.getPlayersInRoom).toHaveBeenCalledTimes(0);

        expect(roomRepoMock.isRoomHost).toHaveBeenCalledWith(hostPlayer.roomID, hostPlayer.id);
        expect(roomRepoMock.reassignRoomHost).toHaveBeenLastCalledWith(hostPlayer.roomID, hostPlayer.id);
        expect(roomRepoMock.removePlayerFromRoom).toHaveBeenCalledWith(hostPlayer.roomID, hostPlayer.id);
        expect(roomRepoMock.isRoomEmpty).toHaveBeenCalledWith(hostPlayer.roomID);
        expect(roomRepoMock.deleteRoomData).toHaveBeenCalledWith(hostPlayer.roomID);
    });
})