const mongoose = require('mongoose')
const users = new mongoose.Schema({
    role: {
        type: String,
        required: [true, "Role is required"],
        enum: ["admin", "user"],
        default: "user",
    },
    username: {
        type: String,
        required: [true, "Username is required"],
    },
    password: { type: String },
    firstname: {
        type: String,
        required: [true, "The Firstname is required"],
        validate: {
            validator: function(v) {
                return /^[A-Za-z]+$/.test(v);
            },
            message: props => `${props.value} contains invalid characters. Only alphabetic characters are allowed.`
        },
    },
    surname: {
        type: String,
        required: [true, "The Lastname is required"],
        validate: {
            validator: function(v) {
                return /^[A-Za-z]+$/.test(v);
            },
            message: props => `${props.value} contains invalid characters. Only alphabetic characters are allowed.`
        },
    },
    age: { type: Number },
    gender: { type: String }
})

module.exports = mongoose.model("users", users)