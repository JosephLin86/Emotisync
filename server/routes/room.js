const express = require('express');
const Room = require('../models/Room');
const JournalEntry = require('../models/JournalEntry');
const verifyToken = require('../middleware/verifyToken');
const router = express.Router();

//Therapist creates room with a client
router.post('/', verifyToken, async (req, res) => {
    const {clientId} = req.body;

    if (req.user.role !== 'therapist') {
        return res.status(403).json({ message: 'Only therapists can create rooms!' });
    }

    try {
        //check if room already exists
        const existing = await Room.findOne({therapistId: req.user.id, clientId});
        if (existing) return res.status(409).json({message: 'Room already exists' });

        const newRoom = new Room ({
            therapistId: req.user.id,
            clientId,
        });

        const savedRoom = await newRoom.save();
        res.status(201).json(savedRoom);
    } catch (error) {
        res.status(500).json({message: 'Failed to create room', error: error.message});
    }
});

//Therapist gets list of all exisiting rooms
router.get("/", verifyToken, async(req, res) => {
    try{
        if(req.user.role !== "therapist"){
            return res.status(403).json({ message: "Only therapists can view all rooms" });
        }

        const rooms = await Room.find({ therapistId: req.user.id})
            .populate("clientId", "username email")
            .sort({ updatedAt: -1 });
        
        res.json(rooms);
    } catch(err) {
        res.status(500).json({ message: "Failed to fetch rooms", error: err.message});
    }
});


//client dashboard view
router.get("/my", verifyToken, async(req, res) => {
    try{
        if (req.user.role !== "client"){
            return res.status(403).json({ message: "Only Clients can use this endpoint"})
        }

        const room = await Room.findOne({ clientId: req.user.id })
            .populate("therapistId", "username email");
        
        if(!room) return res.status(404).json({ message:"No room found for this client" });

        res.json(room);
    } catch(err) {
        res.status(500).json({ message: "Failed to fetch client room", error: err.message });
    }
});



//Journal Entry POST
router.post("/:roomId/journal", verifyToken, async(req, res) => {
    try{
        const { roomId } = req.params;
        const { title, content } = req.body;
        const userId = String(req.user.id);

        if(!content || !content.trim()) {
            return res.status(400).json({ message: 'content is required' });
        }

        const room = await Room.findById(roomId)

        if(!room) return res.status(404).json({ message: 'Room Not Found' });

        const isMember = 
            String(room.therapistId) === userId ||
            String(room.clientId) === userId;
        
        if(!isMember) return res.status(403).json({ message: 'Forbidden' });

        //only clients can create new journal entries
        if(req.user.role !== 'client') {
            return res.status(403).json({ message: 'Only clients can create journal entries'});
        }

        //create the entry in a separate database collection for scalability
        const newEntry = new JournalEntry({
            title: title || 'Untitled',
            content: content.trim(),
            user: userId,
            roomId: roomId,
            isShared: true,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await newEntry.save();

        // Update room's updatedAt timestamp
        room.updatedAt = new Date();
        await room.save();

        // Populate user info before returning
        await newEntry.populate('user', 'username email role');

        return res.status(201).json(newEntry);

    } catch (error){
        console.error('Journal entry creation error:', error);
        return res.status(500).json({ message: 'Failed to add Journal Entry', error: error.message });
    }
});

//Journal Entry GET (fetch from separate collection)
router.get("/:roomId/journal", verifyToken, async(req, res) => {
    try{
        const { roomId } = req.params;
        const userId = String(req.user.id);

        // Verify room exists and user is a member
        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ message: "Room not found" });

        const isMember = 
            String(room.therapistId) === String(userId) ||
            String(room.clientId) === String(userId);

        if (!isMember) return res.status(403).json({ message: "Forbidden"});

        // Fetch journal entries from separate collection
        const entries = await JournalEntry.find({ roomId: roomId, isShared: true })
            .populate('user', 'username email role')
            .sort({ createdAt: -1 });

        return res.status(200).json(entries);

    } catch(error) {
        console.error('Journal fetch error:', error);
        return res.status(500).json({ message: "Failed to fetch journal entries", error: error.message });
    }
});

router.get("/:roomId", verifyToken, async(req, res) =>{
    const room = await Room.findById(req.params.roomId);
    if(!room) return res.status(404).json({message: "Room Not Found"});

    const userId = String(req.user.id);
    const isMember = String(room.therapistId) === userId || String(room.clientId) === userId;

    if(!isMember) return res.status(403).json({ message: "Forbidden" });

    res.json(room);

});

module.exports = router;

