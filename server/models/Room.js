const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  therapistId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Shared files/resources (PDFs, links, audio, etc.)
  resources: [
    {
      type:       { type: String, enum: ['pdf', 'link', 'audio', 'video', 'image'], required: true },
      url:        { type: String, required: true },
      uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      uploadedAt: { type: Date, default: Date.now }
    }
  ],

  // Shared messages (text thread)
  messages: [
    {
      sender:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      text:      String,
      timestamp: { type: Date, default: Date.now }
    }
  ],

  // Shared journaling from either party
  sharedJournal: [
    {
      author:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      content:   String,
      createdAt: { type: Date, default: Date.now }
    }
  ],

  // Shared session notes with comments
  sessionNotes: [
    {
      content:    { type: String, required: true },
      createdAt:  { type: Date, default: Date.now },
      createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      comments: [
        {
          commenter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
          text:      String,
          timestamp: { type: Date, default: Date.now }
        }
      ]
    }
  ],

  // Client check-ins (seen by both)
  checkIns: [
    {
      mood:        String, // e.g., "anxious", "good", etc.
      submittedAt: { type: Date, default: Date.now }
    }
  ],

  // Therapist-only private notes (restricted by route logic)
  therapistNotes: [
    {
      content:   String,
      createdAt: { type: Date, default: Date.now }
    }
  ],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Room', RoomSchema);
