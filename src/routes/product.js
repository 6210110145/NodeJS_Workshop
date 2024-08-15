var express = require('express');
var router = express.Router();
var productModel = require('../models/product');
const detoken = require('../middleware/jwt_decode');
const upload = require('../middleware/upload');

const { default: mongoose } = require('mongoose');
// "http://localhost:3000/images/{username}/"
const path = "images/"

// create
router.post('/', detoken, upload, async (req, res, next) => {
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
        const files = req.files

        if(!files) {
            throw {
                status: 500,
                message: "Please upload image"
            }
        }

        const images = files.map((file) => ({
            name: file.filename,
            url: path + req.body.username + '/' + file.filename,
        }));

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
            product_img: images,
            price: body.price,
            amount: body.amount,
            detail: body.detail
        });

        let product = await newProduct.save()

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
router.put('/images/:id', upload, async (req, res, next) => {
    try {
        const id = req.params.id
        const files = req.files

        if(!mongoose.Types.ObjectId.isValid(id)) {
            throw {
                message: `product ${id} id is not found`,
                status: 404,
            }
        }
        
        if(!files) {
            throw {
                status: 500,
                message: "upload image fail"
            }
        }

        let product = await productModel.findById(id)

        let dataImage = product.product_img

        const images = files.map((file) => ({
            name: file.filename,
            url: path + req.body.username + '/' + file.filename,
        }));

        for(let i=0; i<images.length; i++){
            let existImage = await productModel.findOne({"product_img.url": images[i].url})
            if(existImage !== null) {
                throw {
                    status: 400,
                    message: `${images[i].name} image already exists in the database.`
                }
            }
        }

        dataImage.push(...images)
    
        await productModel.updateOne(
            { _id: id }, 
            { $set: {
                product_img: dataImage
            }}
        );

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
        // let mainImage = []

        // for(let i=0; i<product.length; i++){
        //     mainImage.push(product[i].product_img[0])
        // }

        let products = product.map((item) => ({
            _id: item._id,
            code: item.product_code,
            name: item.product_name,
            image: item.product_img[0],
            price: item.price,
            amount: item.amount,
            detail: item.detail
        }))
        
        return res.status(200).send({
            data: products,
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

        let product = await productModel.findById(id)

        return res.status(200).send({
            data: product,
            message: "send success",
            success: true
        });
    }catch (err) {
        return res.status(err.status || 500).send(err.message)
    }
});

//getImageByID
router.get('/image/:id', detoken, async (req, res, next) => {
    try {
        let id = req.params.id

        if(!mongoose.Types.ObjectId.isValid(id)) {
            throw {
                message: `product ${id} id is not found`,
                status: 404,
            }
        }

        let product = await productModel.findById(id)
        let dataImage = product.product_img

        return res.status(200).send({
            data: dataImage,
            message: "send success",
            success: true
        });
    }catch(err) {
        return res.status(err.status || 500).send(err.message)
    }
})

//deleteImageByID
router.put('/image/:id', detoken, async (req, res, next) => {
    try {
        let id = req.params.id
        let body = req.body

        if(!mongoose.Types.ObjectId.isValid(id)) {
            throw {
                message: `image ${id} is not found`,
                status: 404,
            }
        }

        let product = await productModel.findById(id)
        let dataImage = product.product_img

        dataImage.pull({ _id: body._id})

        // console.log(dataImage)

        await productModel.updateOne(
            { _id: id }, 
            { $set: {
                product_img: dataImage
            }}
        );

        return res.status(200).send({
            data: product,
            message: "delete image success"
        })
    }catch(err) {
        return res.status(err.status || 500).send(err.message)
    }
})

// update
router.put('/:id', detoken, upload, async (req, res, next) => {
    try{
        const id = req.params.id
        const body = req.body
        const files = req.files

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

        if(files){
            const images = files.map((file) => ({
                name: file.filename,
                url: path + req.body.username + '/' + file.filename,
            }));
            await productModel.updateOne(
                { _id: id }, 
                { $set: {
                    product_code: body.product_code,
                    product_name: body.product_name,
                    product_img: images,
                    price: body.price,
                    amount: body.amount,
                    detail: body.detail
                }}
            );
        }else {
            await productModel.updateOne(
                { _id: id }, 
                { $set: {
                    product_code: body.product_code,
                    product_name: body.product_name,
                    price: body.price,
                    amount: body.amount,
                    detail: body.detail
                }}
            );
        }
        
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