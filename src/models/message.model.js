const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const messageSchema = new mongoose.Schema({
    message: {type: String, trim: true, required: true},
    clientOffset: {type: String, unique: true},
}, {collection: 'messages', timestamps: true,})
messageSchema.plugin(AutoIncrement, {inc_field: 'id'});

const message = mongoose.model('messages', messageSchema)

module.exports = message