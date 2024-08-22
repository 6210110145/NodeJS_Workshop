const mongoose = require('mongoose')

const imageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    }
});

const products = new mongoose.Schema({
    product_code: {
        type: Number,
        required: true
    },
    product_name: {
        type: String,
        required: true
    },
    product_img: [imageSchema],
    price: {
        type: Number,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    detail: { type: Object }
});

module.exports = mongoose.model("products", products)