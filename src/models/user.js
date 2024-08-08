const mongoose = require('mongoose')
const users = new mongoose.Schema({
    // user_id: { type: Number },
    role: { type: String},
    username: { type: String },
    password: { type: String },
    firstname: { type: String },
    surname: { type: String },
    age: { type: Number },
    gender: { type: String }
})

module.exports = mongoose.model("users", users)