const mongoose = require('mongoose');

/*
0 for general chat, 1 for private chat and 2 for group chat
*/
const roomSchema = new mongoose.Schema({
    type: {type: Number, required: true}
}, {collection: 'rooms', timestamps: true,})

const room = mongoose.model('room', roomSchema)

module.exports = room