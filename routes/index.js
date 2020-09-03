const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.status(200).json({
        message: 'Welcome to Mimica Backend v2.0!'
    });
});

module.exports = router;
