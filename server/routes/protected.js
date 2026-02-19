const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const User = require('../models/User');

const router = express.Router();

router.get('/me', verifyToken, async (req, res) => {
    try{
        const user = await User.findById(req.user.id).select('-password -refreshToken');
        if(!user) {
            return res.status(404).json({error: 'User Not Found'});
        }

        res.json({
            user:{
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch(err) {
        res.status(500).json({error: "Failed to get user info"});
    }
});

module.exports = router;