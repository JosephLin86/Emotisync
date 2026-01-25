const mongoose = require('mongoose');

const JournalEntrySchema = new mongoose.Schema({
    title: { type: String, required: true},
    content: { type: String, required: true},
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},


    //to make journal entry shareable:
    roomId: {type: mongoose.Schema.Types.ObjectId, ref: 'Room', default: null},
    isShared: { type: Boolean, default: false },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('JournalEntry', JournalEntrySchema);