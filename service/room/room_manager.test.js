const roomManager = require('./room_manager');
const roomRepo = require('../../repository/room_repository');
const { Client } = require('pg');
const { ExpectationFailed } = require('http-errors');

jest.mock('pg', () => {
    const mockClient = {
        connect: jest.fn(),
        query: jest.fn()
    };

    return { Client: jest.fn(() => mockClient) };
});

jest.spyOn(roomRepo, 'createRoom');
jest.spyOn(roomRepo, 'getPlayersInRoom');

describe('Should add player should make DB operations in certain order', () => {
    let client;

    beforeEach(() => {
        client = new Client();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('succesfully', async () => {
        client.query.mockResolvedValue({ rows: [{ name: 'Viguelon', host: true }], rowCount: 1 });

        const newPlayer = {
            roomID: 'a3zrgy58d9o',
            name: 'Viguelon',
            id: 'XI1gJG-8YGrZP2ZqAAAA'
        };

        await roomManager.addNewPlayer(newPlayer);

        expect(roomRepo.createRoom).toHaveBeenCalledTimes(1);
        expect(roomRepo.getPlayersInRoom).toHaveBeenCalledTimes(1);

        expect(roomRepo.createRoom).toHaveBeenCalledWith(newPlayer.roomID, newPlayer.id, newPlayer.name);
        expect(roomRepo.getPlayersInRoom).toHaveBeenCalledWith(newPlayer.roomID);
    });

})