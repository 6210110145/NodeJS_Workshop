var express = require('express');
var router = express.Router();
var productModel = require('../models/product');
const detoken = require('../middleware/jwt_decode')
const upload = require('../middleware/upload')

const { default: mongoose } = require('mongoose');

// create
router.post('/', upload,detoken, async (req, res, next) => {
    try {
        let payload = req.token
        let role = payload.role

        if(role.toLocaleLowerCase() != 'admin') {
            throw {
                message: `${payload.username} can not handle`,
                status: 400
            }
        }
        const body = req.body 
        const file = req.file

        console.log(file)
        console.log(body)

        let productCode = body.product_code
        let productName = body.product_name

        if(await productModel.findOne({ product_code: productCode }) || 
           await productModel.findOne({ product_name: productName })) {
            throw {
                message: 'Invalid product',
                status: 400
            }
        }

        let newProduct = new productModel({
            product_code: body.product_code,
            product_name: body.product_name,
            product_img: file.filename,
            price: body.price,
            amount: body.amount,
            detail: body.detail
        });

        let product = await newProduct.save()  //บันทึกลง Database

        return res.status(201).send({
            data: product,
            message: "create success",
            success: true
        });
    } catch(err) {
        return res.status(err.status || 500).send(err.message)
    }
})

//upload image
router.put('/upload/:id', upload, async (req, res, next) => {
    try {
        const id = req.params.id
        const file = req.file

        console.log(file)

        await productModel.updateOne(
            { _id: id }, 
            { $set: {
                product_img: file.filename,
            }}
        );

        let product = await productModel.findById(id)

        return res.status(200).send({
            data: product,
            message: `${id} upload success`
        })
        
    } catch (err) {
        return res.status(err.status || 500).send(err.message)
    }
})

// getAll
router.get('/', async (req, res, next) => {
    try {
        let product = await productModel.find() // SELECT * FROM Products

        return res.status(200).send({
            data: product,
            message: "send success",
            success: true
        }); 
    }catch (err) {
        return res.status(err.status || 500).send(err.message)
    }
})


// getByID
router.get('/:id', detoken, async (req, res, next) => {
    try {
        let id = req.params.id

        if(!mongoose.Types.ObjectId.isValid(id)) {
            throw {
                message: `product ${id} id is not found`,
                status: 404,
            }
        }

        return res.status(200).send({
            data: product,
            message: "send success",
            success: true
        });
    }catch (err) {
        return res.status(err.status || 500).send(err.message)
    }
});

// update
router.put('/:id', detoken, upload, async (req, res, next) => {
    try{
        const id = req.params.id
        const body = req.body

        let payload = req.token
        let role = payload.role

        const file = req.file

        if(role.toLocaleLowerCase() != 'admin') {
            throw {
                message: `${payload.username} can not handle`,
                status: 400
            }
        }

        if(!mongoose.Types.ObjectId.isValid(id)) {
            throw {
                message: `product ${id} id is not found`,
                status: 404,
            }
        }

        await productModel.updateOne(
            { _id: id }, 
            { $set: {
                product_code: body.product_code,
                product_name: body.product_name,
                product_img: file.filename,
                price: body.price,
                amount: body.amount,
                detail: body.detail
            }}
        );
        
        return res.status(200).send({
            message: "update success",
            success: true
        }); 

    }catch (err) {
        return res.status(err.status || 500).send(err.message)
    }
});

//updateByName amount
router.put('/', detoken, async (req, res, next) => {
    try {
        const {product_name, amount} = req.body
        let payload = req.token
        let role = payload.role
        console.log(payload)

        if(role.toLocaleLowerCase() != 'admin') {
            throw {
                message: `${payload.username} can not handle`,
                status: 400
            }
        }

        if(!mongoose.Types.ObjectId.isValid(id)) {
            throw {
                message: `product ${id} id is not found`,
                status: 404,
            }
        }

        if(amount <= 0) {
            throw {
                message: "amount must be > 0",
                status: 400
            }
        }
        let new_amount = amount + product.amount
        await productModel.updateOne(
            { product_name: product_name},
            { $set: {
                amount: new_amount
            }}
        );
        
        return res.status(200).send({
            data: product,
            message: `update ${product_name} success`
        })
    } catch (err) {
        return res.status(err.status || 500).send(err.message)
    }
})

// deleteById
router.delete('/:id', detoken, async (req, res, next) => {
    try{
        let id = req.params.id

        let payload = req.token
        let role = payload.role

        if(role.toLocaleLowerCase() != 'admin') {
            throw {
                message: `${payload.username} can not handle`,
                status: 400
            }
        }

        if(!mongoose.Types.ObjectId.isValid(id)) {
            throw {
                message: `product ${id} id is not found`,
                status: 404,
            }
        }

        await productModel.deleteOne({ _id: id })

        return res.send({
            message: "delete success",
            success: true
        })
    }catch (err) {
        return res.status(err.status || 500).send(err.message)
    }
});

module.exports = router