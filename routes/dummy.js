const express = require('express');
const router = express.Router();
const dummyRepo = require('../repository/dummy_repository');
const roomRepo = require('../repository/room_repository');

router.get('/', async function(req, res, next) {
    const users = await dummyRepo.getUsers();
    res.status(200).json(users[0]);
})

module.exports = router;