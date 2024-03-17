const mongoose = require('mongoose');
const {v4: uuidv4} = require('uuid');

const userSchema = new mongoose.Schema({
    // userId: {
    //     default: uuidv4,
    //     type: String,
    // },
    // name: {
    //     type: String,
    //     required: true,
    //     trim: true,
    //     max: 40,
    //     min: 4,
    // },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        max: 100,
        min: 3,
    },
    password: {
        type: String,
        required: true,
        trim: true,
        max: 36,
        min: 6,
    },
    // photo_url: {
    //     type: String,
    //     trim: true,
    //     max: 1000,
    //     min: 4,
    // },
    // sign_up_time: {
    //     type: Date,
    // },
    // last_sign_in: {
    //     type: Date,
    // },
    // is_sign_in: {
    //     type: Boolean,
    //     default: false
    // },
    // is_google_sign_in: {
    //     type: Boolean,
    //     default: false,
    //     required: true
    // },
    // token: {
    //     type: String,
    //     required: true,
    //     max: 1000,
    //     min: 4
    // },
    // device_id: {
    //     type: String,
    // },
    // is_verified: {
    //     type: Boolean,
    //     default: null,
    // },
}, {collection: "users", timestamps: true})

const user = mongoose.model('users', userSchema)

module.exports = user