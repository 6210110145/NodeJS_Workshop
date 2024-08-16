var express = require('express');
var router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const detoken = require('../middleware/jwt_decode')
const validateRegister = require('../middleware/password_validate')
var userModel = require('../models/user');

// register
router.post('/register', validateRegister, async (req, res, next) => {
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

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw {
        status: 400,
        message: errors.mapped().password.msg
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
    .catch((err) => {
      throw {
        status: 400,
        message: err.message
      }
    })

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

    let user = await userModel.findById(id)

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

    let hash_password = await bcrypt.hash(body.password, 10)

    await userModel.updateOne(
      { _id: id },
      { $set: {
        username: body.username,
        password: hash_password,
        firstname: body.firstname,
        surname: body.surname,
        age: body.age,
        gender: body.gender,
        role: body.role
      }}
    );

    let user = await userModel.findById(id)

    return res.status(200).send({
      data: user,
      message: `update user id ${id} success`,
      success: true
    })

  } catch (err) {
    return res.status(err.status || 500).send(err.message)
  }
})

// forget password
router.post('/password', async (req, res) => {
  try {
    let { username, password } = req.body
  
    let user = await userModel.findOne({ username })
    // .select("password")

    console.log(user)

    if(!user) {
      throw {
        status: 404,
        message: `${username} is not found`
      }
    }

    let hash_password = await bcrypt.hash(password, 10)

    await userModel.updateOne(
      { _id: user._id},
      { $set: {
        password: hash_password
      }}
    )

    return res.status(200).send({
      message: "change passworg success"
    })

  }catch (err) {
    return res.status(err.status || 500).send(err.message)
  }
})

//change password
router.put('/password/:id', detoken, async (req, res, next) => {
  try {
    let id = req.params.id
    let { old_password, new_password } = req.body

    if(!mongoose.Types.ObjectId.isValid(id)) {
      throw {
          message: `user ${id} id is not found`,
          status: 404,
      }
    }

    let user = await userModel.findById(id)

    let compare_password = await bcrypt.compare(old_password, user.password)

    if(compare_password == false) {
      throw {
        status: 400,
        message: "Invalid the old Password "
      }
    }

    let hash_new_password = await bcrypt.hash(new_password, 10)

    await userModel.updateOne(
      { _id: id},
      { $set: {
        password: hash_new_password
      }}
    )

    return res.status(200).send({
      message: "change password success"
    })

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