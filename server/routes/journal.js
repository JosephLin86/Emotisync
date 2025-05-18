const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const JournalEntry = require('../models/JournalEntry');

const router = express.Router();

router.post('/', verifyToken, async (req, res) => {
    try {
        const {title, content} = req.body;

        const newEntry = new JournalEntry({
            title,
            content,
            user: req.user.id //set by verifyToken middleware
        });

        const savedEntry = await newEntry.save();
        res.status(201).json(savedEntry);
    } catch (error) {
        res.status(400).json({message: 'Failed to create journal entry', error: error.message});
    }
});

router.get('/', verifyToken, async (req, res) => {
    try {
        const entries = await JournalEntry.find({user: req.user.id}).sort({createdAt: -1});
        res.json(entries);
    } catch (error) {
        res.status(500).json({message: 'Failed to fetch journal entries', error: error.message});
    }
});

//share a journal entry with therapist by linking it to a room
router.post('/:id/share', verifyToken, async (req, res) => {
    const {roomId} = req.body;

    try {
        const entry = await JournalEntry.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!entry) {
            return res.status(404).json({message: 'Journal entry not found'});
        }

        entry.roomId = roomId;
        entry.isShared = true;
        await entry.save();
        
        res.json({message: 'Journal entry shared with therapist'}); 
    } catch (error) {
        res.status(500).json({message: 'Failed to share journal entry', error: error.message});
    }
});


module.exports = router;