// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    contact: { type: String, required: true },
    profilePicture: { type: String },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
