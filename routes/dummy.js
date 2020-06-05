const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
    res.send('Greetings from Backend');
})

module.exports = router;