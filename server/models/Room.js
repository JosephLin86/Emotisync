 const mongoose = require('mongoose');

 const RoomSchema = new mongoose.Schema({
    therapistId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    clientId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
 });

 module.exports = mongoose.model('Room', RoomSchema);