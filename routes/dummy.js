const express = require('express');
const router = express.Router();
const dummyRepo = require('../repository/dummy_repository');
const roomRepo = require('../repository/room_repository');

router.get('/', async function(req, res, next) {
    await roomRepo.createRoom('an32ms3', 'sfiu23nc', 'Viguelon');
    await roomRepo.addPlayerToRoom('an32ms3', '2kc9cs', 'Elotro');
    const users = await dummyRepo.getUsers();
    res.status(200).json(users[0]);
})

module.exports = router;