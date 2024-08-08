const mongoose = require('mongoose')
const orders = new mongoose.Schema({
    // order_id: { type : Number },
    username: { type: String },
    product:[{ 
        product_name: { type: String },
        amount: { type: Number },
    }],
    priceTotal: { type: Number },
})

module.exports = mongoose.model("orders", orders)

/*
product: [
    {
        product_name: "xxx",
        amount: a,
    },

    {
        product_name: "qqq",
        amount: b,
    }
    ]
*/