const mongoose = require('mongoose')

const imageSchema = new mongoose.Schema({
    name: { type: String },
    url: { type: String }
})

const products = new mongoose.Schema({
    product_code: { type: Number },
    product_name: { type: String },
    product_img: [imageSchema],
    price: { type: Number },
    amount: { type: Number },
    detail: { type: Object }
});

module.exports = mongoose.model("products", products)