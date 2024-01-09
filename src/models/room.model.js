const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    senderId: {type: String, required: true},
}, {collection: 'rooms', timestamps: true,})

const room = mongoose.model('room', roomSchema)

module.exports = room