const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    product_name: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
});

const orders = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    product: [ productSchema ],
    priceTotal: { type: Number },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("orders", orders)