const mongoose = require('mongoose')
const products = new mongoose.Schema({
    product_code: { type: Number },
    product_name: { type: String },
    product_img: { type: String },
    price: { type: Number },
    amount: { type: Number },
    amount_order: { type: Number },
    detail: { type: Object }
});

module.exports = mongoose.model("products", products)