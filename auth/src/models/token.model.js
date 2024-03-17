const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tokenSchema = new Schema({
    token: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    userId: {
        type: String,
        required: true,
        ref: "user",
    },
});

const token = mongoose.model("tokens", tokenSchema);

module.exports = token;