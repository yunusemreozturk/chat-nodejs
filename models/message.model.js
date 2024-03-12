const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    message: {type: String, trim: true, required: true},
    userToken: {type: String, required: true},
    roomId: {type: String, required: true}
}, {collection: 'messages', timestamps: true,})

const message = mongoose.model('messages', messageSchema)

module.exports = message