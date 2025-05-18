// models/Client.js
const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  journalVisibility: { type: Boolean, default: true },
  moodLogs: [
    {
      date: Date,
      mood: String,
      note: String
    }
  ],
  therapistId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('Client', ClientSchema);
