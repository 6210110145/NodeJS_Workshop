var express = require('express');
var mongoose = require('mongoose')
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

        let order = await newOrder.save().catch((err) => {
            throw {
                status: 400,
                message: err.message
            }
        });

        return res.status(201).send({
            data: order,
            message: `${username} order success`
        });

    } catch (err) {
        return res.status(err.status || 500).send({
            message: err.message
        })
    }
})

// getAll
router.get('/', detoken, async (req, res, next) => {
    try{
        const payload = req.token
        const role = payload.role

        if(role.toLocaleLowerCase() != 'admin') {
            throw {
                message: `${payload.username} can not handle`,
                status: 403
            }
        }

        let order = await orderModel.find()

        return res.status(200).send({
            data: order,
            message: "send success",
            success: true
        });

    } catch (err) {
        return res.status(err.status || 500).send({
            message: err.message
        })
    }
})

//getByID
router.get('/:id', detoken, async (req, res, next) => {
    try {
        let orderID = req.params.id

        const payload = req.token
        const role = payload.role

        if(!mongoose.Types.ObjectId.isValid(orderID)) {
            throw {
                message: `product ${orderID} id is not found`,
                status: 404,
            }
        }

        if(role.toLocaleLowerCase() != 'admin') {
            throw {
                message: `${payload.username} can not handle`,
                status: 403
            }
        }

        let order = await orderModel.findById(orderID)

        return res.status(200).send({
            data: order,
            message: "send success",
            success: true
        });

    } catch (err) {
        return res.status(err.status || 500).send({
            message: err.message
        })
    }
});

router.delete('/:id', detoken, async (req, res, next) => {
    try {
        const id = req.params.id

        const payload = req.token
        const role = payload.role

        if(!mongoose.Types.ObjectId.isValid(id)) {
            throw {
                message: `product ${id} id is not found`,
                status: 404,
            }
        }

        if(role.toLocaleLowerCase() != 'admin') {
            throw {
                message: `${payload.username} can not handle`,
                status: 403
            }
        }

        await orderModel.deleteOne({_id: id})

        return res.status(200).send({
            message: 'delete order success'
        })
    } catch (err) {
        return res.status(err.status || 500).send({
            message: err.message
        })
    }
})

module.exports = router