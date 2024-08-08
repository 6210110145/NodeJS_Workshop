var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken')
var orderModel = require('../models/order');
var productModel = require('../models/product');
var userModel = require('../models/user')

// middleware decode token function
const detoken = (req, res, next) => {
    try {
        if(!req.headers.authorization) {
            throw {
                message: "require token"
            }
        }
        let token = req.headers.authorization.replace('Bearer ', '')
        let data = jwt.verify(token, process.env.TOKEN_KEY)
        req.token = data
        next() //return to router
    }catch (err) {
      return res.status(401).send({
        message: err.message
      })
    }
}

// create
router.post('/', detoken, async (req, res, next) => {
    try {
        let priceTotal = 0
        const {username, product} = req.body

        // let user = await userModel.findOne({ username });

        // if (!user) {
        //     throw {
        //       message: 'Invalid username',
        //       status: 401
        //     }
        // }

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
        // console.log(priceTotal)

        let newOrder = new orderModel({
            // order_id: order_id,
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

//update
// router.put('/update/:id', detoken, async (req, res, next) => {
//     try {
//         const id = req.params.id
//         const {product} = req.body

//         for (let products of product) {
//             let order = await orderModel.findById(id)
//             for (let orders of order.product) {
//                 console.log(orders.product_name)
//                 if(products.product_name == orders.product_name) {
//                     orders.amount += products.amount
//                 }
//             }
//         }

//     } catch (err) {
//         return res.status(err.status || 500).send(err.message)
//     }
// })

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