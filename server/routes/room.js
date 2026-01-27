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
        const userId = String(req.user.id);
        const { content } = req.body;

        if(!content || !content.trim()) {
            return res.status(400).json({ message: 'content is required' });
        }

        const room = await Room.findById(roomId)

        if(!room) return res.status(404).json({ message: 'Room Not Found' });

        const isMember = 
            String(room.therapistId) === userId ||
            String(room.clientId) === userId;
        
        if(!isMember) return res.status(403).json({ message: 'Forbidden' });

        const newEntry = {
            author: userId,
            content: content.trim(),
            createdAt: new Date()
        };

        room.sharedJournal.push(newEntry);

        room.updatedAt = new Date(); //updates the time for when the room was last touched

        await room.save();

        //return the newest entry
        return res.status(201).json(room.sharedJournal[room.sharedJournal.length-1]);

    } catch (error){
        return res.status(500).json({ message: 'Failed to add Journal Entry', error: error.message });
    }
});

//Journal Entry GET
router.get("/:roomId/journal", verifyToken, async(req, res) => {
    try{
        const { roomId } = req.params;
        const userId = String(req.user.id);

        const room = await Room.findById(roomId)
            .populate("sharedJournal.author", "username email role");

        if(!room) return res.status(404).json({ message: "Room Not Found"});

        const isMember = 
            String(room.therapistId) === userId ||
            String(room.clientId) === userId;

        if (!isMember) return res.status(403).json({ message: "Forbidden"});

        return res.status(200).json(room.sharedJournal);

    } catch(error) {
        return res.status(500).json({ message: "Failed to Fetch Journal Entries", error: error.message });
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

