var express = require('express');
var router = express.Router();
var orderModel = require('../models/order');
var productModel = require('../models/product');
const detoken = require('../middleware/jwt_decode')

// create
router.post('/', detoken, async (req, res, next) => {
    try {
        let priceTotal = 0
        const {product} = req.body

        let payload = req.token
        const username = payload.username

        console.log(username)
        console.log(product)

        for (let products of product) {
            let new_amount = 0
            let name = products.product_name

            var allproduct = await productModel.findOne({product_name: name})

            if (!allproduct) {
                throw {
                    message: `${name} is Invalid`,
                    status: 401
                }
            }

            if(products.amount <= 0) {
                throw {
                    message: `Quantity of ${name} is Invalid`,
                    status: 400
                }
            }

            new_amount = allproduct.amount - products.amount

            if(new_amount < 0) {
                throw {
                    message: `Quantity of ${name} is not enough`,
                    status: 400
                }
            }

            priceTotal += (products.amount * allproduct.price)            

            await productModel.updateOne(
                { product_name: name },
                { $set: {
                    amount: new_amount
                }}
            );
        }

        let newOrder = new orderModel({
            username: username,
            product: product,
            priceTotal: priceTotal
        });

        let order = await newOrder.save()

        return res.status(201).send({
            data: order,
            message: `${username} order success`
        });

    } catch (err) {
        return res.status(err.status || 500).send(err.message)
    }
})

// getAll
router.get('/', detoken, async (req, res, next) => {
    try{
        let order = await orderModel.find()

        return res.status(200).send({
            data: order,
            message: "send success",
            success: true
        });

    } catch (err) {
        return res.status(err.status || 500).send(err.message)
    }
})

//getByID
router.get('/:id', detoken, async (req, res, next) => {
    try {
        let orderID = req.params.id
        let order = await orderModel.findById(orderID)

        if(order == null) {
            throw {
                message: `order ${id} is not found`,
                status: 404
            }
        }

        return res.status(200).send({
            data: order,
            message: "send success",
            success: true
        });

    } catch (err) {
        return res.status(err.status || 500).send(err.message)
    }
})

module.exports = router