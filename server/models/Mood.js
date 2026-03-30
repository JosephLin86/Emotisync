const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    moodScore: {
        type: Number,
        required: true,
        min: 1,
        max: 10
    },
    moodLabel: {
        type: String,
        enum: ['very_sad', 'sad', 'neutral', 'happy', 'very_happy'],
        required: true
    },
    stressLevel: {
        type: Number,
        required: true,
        min: 1,
        max: 10
    },
    energyLevel: {
        type: Number,
        required: true,
        min: 1,
        max: 10
    },
    optionalNote: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
moodSchema.index({ roomId: 1, createdAt: -1 });
moodSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Mood', moodSchema);