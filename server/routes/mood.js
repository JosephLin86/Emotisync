const express = require('express');
const router = express.Router();
const Mood = require('../models/Mood');
const Room = require('../models/Room');
const verifyToken = require('../middleware/verifyToken');

// Create mood entry
router.post('/:roomId/mood', verifyToken, async (req, res) => {
    try {
        const { roomId } = req.params;
        const { moodScore, moodLabel, stressLevel, energyLevel, optionalNote } = req.body;
        
        // Verify room access
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        
        const isClient = room.clientId.toString() === req.user.id;
        
        if (!isClient) {
            return res.status(403).json({ message: 'Only clients can create mood entries' });
        }
        
        // Create mood entry
        const mood = new Mood({
            userId: req.user.id,
            roomId,
            moodScore,
            moodLabel,
            stressLevel,
            energyLevel,
            optionalNote: optionalNote || ''
        });
        
        await mood.save();
        
        res.status(201).json(mood);
        
    } catch (err) {
        console.error('Create mood error:', err);
        res.status(500).json({ message: 'Failed to create mood entry', error: err.message });
    }
});

// Get mood history for a room
router.get('/:roomId/mood', verifyToken, async (req, res) => {
    try {
        const { roomId } = req.params;
        const { days = 30 } = req.query;
        
        // Verify room access
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        
        const isTherapist = room.therapistId.toString() === req.user.id;
        const isClient = room.clientId.toString() === req.user.id;
        
        if (!isTherapist && !isClient) {
            return res.status(403).json({ message: 'Access denied' });
        }
        
        // Calculate date range
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - parseInt(days));
        
        // Fetch mood entries
        const moods = await Mood.find({
            roomId,
            createdAt: { $gte: dateLimit }
        }).sort({ createdAt: -1 });
        
        res.json(moods);
        
    } catch (err) {
        console.error('Fetch mood error:', err);
        res.status(500).json({ message: 'Failed to fetch mood entries', error: err.message });
    }
});

module.exports = router;