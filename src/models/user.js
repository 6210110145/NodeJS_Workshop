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
    email: {
        type: String,
        required: [true, "E-mail is required"],
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
        unique: true,
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
    birthdate: { type: Date },
    age: { type: Number },
    gender: { type: String }
})

module.exports = mongoose.model("users", users)