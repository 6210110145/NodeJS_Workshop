var express = require('express');
var router = express.Router();
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const detoken = require('../middleware/jwt_decode')
var userModel = require('../models/user');

// register
router.post('/register', async (req, res, next) => {
  try {
    let body = req.body
    let users = await userModel.find()

    for (let user of users) {
      if(body.username == user.username) {
        throw {
          message: `register fail, ${user.username} username is used!`,
          status: 409
        }
      }else if((body.firstname == user.firstname) && (body.surname == user.surname)) {
        throw {
          message: `register fail, ${user.firstname} ${user.surname} is registered!`,
          status: 409
        }
      }
    }

    let password = req.body.password
    let hash_password = await bcrypt.hash(password, 10) // วนเข้ารหัส  10 รอบ

    let newUser = new userModel({
      role: body.role,
      username: body.username,
      password: hash_password,
      firstname: body.firstname,
      surname: body.surname,
      age: body.age,
      gender: body.gender
    })

    let user = await newUser.save()

    return res.status(201).send({
      data: user,
      message: "create user success",
      success: true
    });
  }catch (err) {
    return res.status(err.status || 500).send(err.message)
  }
});

// getAll
router.get('/', detoken, async (req, res, next) => {
  try {
    let user = await userModel.find()

    return res.status(200).send({
      data: user,
      message: "send success",
      success: true
    })
  }catch (err) {
    return res.status(err.status || 500).send(err.message)
  }
});

//getByID
router.get('/:id', detoken, async (req, res, next) => {
  try {
    let id = req.params.id
    let userId = new mongoose.Types.ObjectId(id)

    let user = await userModel.findById(userId)

    console.log(user)

    if(!user) {
      throw {
        message: `user ${id} id is not found`,
        status: 404
      }
    }

    return res.status(200).send({
      data: user,
      message: "send success",
      success: true
  });

  } catch (err) {
    return res.status(err.status || 500).send(err.message)
  }
});

// login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    let user = await userModel.findOne({ username });

    if (!user) {
      throw {
        message: 'Invalid username',
        status: 401
      }
    }

    let compare_password = await bcrypt.compare(password, user.password)

    if (compare_password == false) {
      throw {
        message: 'Invalid password',
        status: 401
      }
    }

    let payload = {
      username: user.username,
      role: user.role
    }
    
    let token = jwt.sign(payload, process.env.TOKEN_KEY, { expiresIn: '3600s' })

    return res.status(200).send({
      data: user,
      token: token,
      message: "login success",
    });

  } catch (err) {
    return res.status(err.status || 500).send(err.message)
  }
})

// updateById
router.put('/:id', detoken, async (req, res, next) => {
  try {
    let id = req.params.id
    let body = req.body

    if(!mongoose.Types.ObjectId.isValid(id)) {
      throw {
        message: `user ${id} id is not found`,
        status: 404,
      }
    }

    await userModel.updateOne(
      { _id: id },
      { $set: {
        username: body.username,
        password: body.password,
        firstname: body.firstname,
        surname: body.surname,
        age: body.age,
        gender: body.gender,
        role: body.role
      }}
    );

    let user = userModel.findById(id)

    return res.status(200).send({
      data: user,
      message: `update user id ${id} success`,
      success: true
    })

  } catch (err) {
    return res.status(err.status || 500).send(err.message)
  }
})

// change password
router.put('/password/:id', detoken, async (req, res) => {
  try {
    const id = req.params.id
    let  = req.body.password

    if(!mongoose.Types.ObjectId.isValid(id)) {
      throw {
          message: `user ${id} id is not found`,
          status: 404,
      }
    }

    let user = await userModel.findById(id)
  }catch (err) {
    return res.status(err.status || 500).send(err.message)
  }
})

// deleteById
router.delete('/:id', detoken, async (req, res, next) => {
  try {
    let id = req.params.id

    if(!mongoose.Types.ObjectId.isValid(id)) {
      throw {
          message: `user ${id} id is not found`,
          status: 404,
      }
    }

    await userModel.deleteOne({ _id: id })

    return res.send({
      message: `delete user ${id} success`,
      success: true
    })
  } catch (err) {
    return res.status(err.status || 500).send(err.message)
  }
})

module.exports = router;