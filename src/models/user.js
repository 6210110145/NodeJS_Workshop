const mongoose = require('mongoose')
const users = new mongoose.Schema({
    role: {
        type: String,
        required: [true, "Role is required"],
    },
    username: {
        type: String,
        required: [true, "Username is required"],
    },
    password: { type: String },
    firstname: { type: String },
    surname: { type: String },
    age: { type: Number },
    gender: { type: String }
})

module.exports = mongoose.model("users", users)