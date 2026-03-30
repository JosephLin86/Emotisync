const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Room = require('../models/Room');
const verifyToken = require('../middleware/verifyToken');

// Get all messages for a room
router.get('/:roomId/messages', verifyToken, async (req, res) => {
    try {
        const { roomId } = req.params;
        
        // Verify room exists and user has access
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        
        const isTherapist = room.therapistId.toString() === req.user.id;
        const isClient = room.clientId.toString() === req.user.id;
        
        if (!isTherapist && !isClient) {
            return res.status(403).json({ message: 'You do not have access to this room' });
        }
        
        // Fetch messages
        const messages = await Message.find({ roomId })
            .sort({ timestamp: 1 }); // Oldest first
        
        res.json(messages);
        
    } catch (err) {
        console.error('Fetch messages error:', err);
        res.status(500).json({ message: 'Failed to fetch messages', error: err.message });
    }
});

// Save a message (called after socket.io sends it)
router.post('/:roomId/messages', verifyToken, async (req, res) => {
    try {
        const { roomId } = req.params;
        const { text } = req.body;
        
        // Verify room exists and user has access
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        
        const isTherapist = room.therapistId.toString() === req.user.id;
        const isClient = room.clientId.toString() === req.user.id;
        
        if (!isTherapist && !isClient) {
            return res.status(403).json({ message: 'You do not have access to this room' });
        }
        
        // Create message
        const message = new Message({
            roomId,
            senderId: req.user.id,
            senderName: req.user.username,
            text,
            timestamp: new Date()
        });
        
        await message.save();
        
        res.status(201).json(message);
        
    } catch (err) {
        console.error('Save message error:', err);
        res.status(500).json({ message: 'Failed to save message', error: err.message });
    }
});

module.exports = router;