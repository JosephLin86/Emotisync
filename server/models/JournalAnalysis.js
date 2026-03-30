const mongoose = require('mongoose');

const journalAnalysisSchema = new mongoose.Schema({
    journalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JournalEntry',
        required: true
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    sentiment: {
        type: Number,
        required: true,
        min: -1,
        max: 1
    },
    emotions: [{
        type: String
    }],
    intensity: {
        type: Number,
        required: true,
        min: 1,
        max: 10
    },
    riskFlags: [{
        type: String
    }],
    suggestedFollowUp: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
journalAnalysisSchema.index({ roomId: 1, createdAt: -1 });
journalAnalysisSchema.index({ journalId: 1 });

module.exports = mongoose.model('JournalAnalysis', journalAnalysisSchema);