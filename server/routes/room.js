const express = require('express');
const Room = require('../models/Room');
const verifyToken = require('../middleware/verifyToken');
const router = express.Router();

//Therapist creates room with a client
router.post('/', verifyToken, async (req, res) => {
    const {clientId} = req.body;

    if (req.user.role !== 'therapist') {
        return res.status(403).json({ message: 'Only therapists can create rooms!' });
    }

    try {

        // Retrieve therapistProfile from authenticated user
        const therapistProfileId = req.user.therapistProfile;
        if (!therapistProfileId) {
            return res.status(400).json({ message: 'Therapist profile not found for this user.' });
        }
        //check if room already exists
        const existing = await Room.findOne({therapistId: req.user.id, clientId});
        if (existing) return res.status(400).json({message: 'Room already exists' });

        const newRoom = new Room ({
            therapistId: therapistProfileId,
            clientId,
        });

        const savedRoom = await newRoom.save();
        res.status(201).json(savedRoom);
    } catch (error) {
        res.status(500).json({message: 'Failed to create room', error: error.message});
    }
});

module.exports = router;

