const express = require('express');
const Room = require('../models/Room');
const JournalEntry = require('../models/JournalEntry');
const verifyToken = require('../middleware/verifyToken');
const router = express.Router();
const { analyzeJournalEntry } = require('../services/aiAnalysis');
const JournalAnalysis = require('../models/JournalAnalysis');

//Journal Entry POST
router.post("/:roomId", verifyToken, async(req, res) => {
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

        // Trigger AI analysis asynchronously (in background)
        analyzeJournalEntry(content)
            .then(async (analysis) => {
                const journalAnalysis = new JournalAnalysis({
                    journalId: newEntry._id,
                    roomId,
                    summary: analysis.summary,
                    sentiment: analysis.sentiment,
                    emotions: analysis.emotions,
                    intensity: analysis.intensity,
                    riskFlags: analysis.riskFlags || [],
                    suggestedFollowUp: analysis.suggestedFollowUp || ''
                });
                
                await journalAnalysis.save();
                console.log(`✅ Analysis completed for journal ${newEntry._id}`);
            })
            .catch(err => {
                console.error('⚠️ Background analysis failed:', err);
                // Don't fail the request - analysis happens in background
            });

        return res.status(201).json(newEntry);

    } catch (error){
        console.error('Journal entry creation error:', error);
        return res.status(500).json({ message: 'Failed to add Journal Entry', error: error.message });
    }
});

//Journal Entry GET (fetch from separate collection)
router.get("/:roomId", verifyToken, async(req, res) => {
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

//Journal Entry Edit
router.put("/:roomId/:entryId", verifyToken, async(req, res) => {
    try{
        const {roomId, entryId} = req.params;
        const {title, content} = req.body;
        const userId = String(req.user.id);



        // Verify room exists and user is a member
        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ message: 'Room not found' });
        
        const isMember = 
            String(room.clientId) === String(userId);

        if (!isMember) return res.status(403).json({ message: "Forbidden"});
        //find journal entry
        const entry = await JournalEntry.findById(entryId);
        if(!entry) return res.status(404).json({message: 'Journal Entry Not Found'});


        if (String(entry.user) !== String(userId)) {
            return res.status(403).json({ message: 'You can only edit your own entries' });
        }

        entry.title = title || entry.title;
        entry.content = content.trim();
        entry.updatedAt = new Date();
        
        await entry.save();
        await entry.populate('user', 'username email role');
        return res.status(200).json(entry);
    } catch (err) {
        console.error('Journal entry update error', err);
        return res.status(500).json({message: 'failed to update journal entry', error: err.message})
    }
    

});

module.exports = router;
