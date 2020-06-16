const express = require('express');
const router = express.Router();
const dummyRepo = require('../repository/dummyRepository');

router.get('/', async function(req, res, next) {
    const users = await dummyRepo.getUsers();
    // res.send('Greetings from Backend');
    res.status(200).json(users[0]);
})

module.exports = router;