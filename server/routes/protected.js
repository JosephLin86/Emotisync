const express = require('express');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

router.get('/me', verifyToken, (req, res) => {
    res.json({
        message: 'Protected route accessed!!!!',
        user: req.user, //attached by verifyToken
    });
});

module.exports = router;