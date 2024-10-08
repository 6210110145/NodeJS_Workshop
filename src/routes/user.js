var express = require('express');
var router = express.Router();
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const otpGenerator = require('otp-generator')
const moment = require('moment')
const { AgeFromDateString } = require('age-calculator');

const limiter = require('../middleware/limiter')
const detoken = require('../middleware/jwt_decode')
const validateRegister = require('../middleware/password_validate')
var userModel = require('../models/user');
var otpModel = require('../models/otp')

// register
router.post('/register', validateRegister, async (req, res, next) => {
  try {
    let body = req.body

    const existingUser = await userModel.findOne({ username: body.username });
    if(existingUser) {
      throw {
        message: `register fail, ${body.username} username is used!`,
        status: 409
      }
    }

    const existingEmail = await userModel.findOne({ email: body.email })
    if(existingEmail) {
      throw {
        message: `register fail, ${body.email} email is used!`,
        status: 409
      }
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw {
        status: 400,
        message: errors.mapped().password.msg
      }
    }

    let password = body.password
    let hash_password = await bcrypt.hash(password, 10)

    const birthdate = body.birthdate
    let date = moment(birthdate, "DD-MM-YYYY").format('YYYY-MM-DD')
    let age = new AgeFromDateString(date).age;
    let dateFormat = moment(birthdate, "DD-MM-YYYY").toDate()

    let newUser = new userModel({
      role: body.role,
      username: body.username,
      email: body.email,
      password: hash_password,
      firstname: body.firstname,
      surname: body.surname,
      birthdate: dateFormat,
      age: age,
      gender: body.gender
    })

    let user = await newUser.save()
    .catch((err) => {
      throw {
        status: 400,
        message: err.message
      }
    });

    return res.status(201).send({
      data: user,
      message: "register success",
      success: true
    });
  }catch (err) {
    return res.status(err.status || 500).send({
      message: err.message
    })
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
    return res.status(err.status || 500).send({
      message: err.message
    })
  }
});

// findByQuerry
router.get('/search', async (req, res, next) => {
  try {
    let searchUser = req.query.search

    if(!searchUser) {
      throw {
        status: 400,
        message: 'no search'
      }
    }

    let user = await userModel.find({username: searchUser})

    return res.status(200).send({
      data: user,
      message: 'search success'
    })
  }catch(err) {
    return res.status(err.status || 500).send({
      message: err.message
    })
  }
});

//getByID
router.get('/:id', detoken, async (req, res, next) => {
  try {
    let id = req.params.id

    let user = await userModel.findById(id)

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
    return res.status(err.status || 500).send({
      message: err.message
    })
  }
});

// login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    let user = {}

    let userName = await userModel.findOne({ username: username })
    let userMail = await userModel.findOne({ email: username })
    if (!userName) {
      if(!userMail) {
        throw {
          message: 'Incorrect username or email',
          status: 401
        }
      }else {
        user = userMail
      }   
    }else{
      user = userName
    }

    let compare_password = await bcrypt.compare(password, user.password)

    if (compare_password == false) {
      throw {
        message: 'Incorrect password',
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
    return res.status(err.status || 500).send({
      message: err.message
    })
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
    
    const birthdate = body.birthdate
    let date = moment(birthdate, "DD-MM-YYYY").format('YYYY-MM-DD')
    let age = new AgeFromDateString(date).age;
    let dateFormat = moment(birthdate, "DD-MM-YYYY").toDate()

    await userModel.updateOne(
      { _id: id },
      { $set: {
        username: body.username,
        email: body.email,
        firstname: body.firstname,
        surname: body.surname,
        birthdate: dateFormat,
        age: age,
        gender: body.gender,
        role: body.role
      }}
    );

    let user = await userModel.findById(id)

    return res.status(200).send({
      data: user,
      message: `update ${body.username} user success`,
      success: true
    });
  } catch (err) {
    return res.status(err.status || 500).send({
      message: err.message
    })
  }
})

// forget password
//     const resetTokenExpiration = Date.now() + 3600000; // Token expires in 1 hour
//     user.reset_token_expiration = resetTokenExpiration;

// send otp
router.post('/otp', async (req, res) => {
  try {
    let email = req.body.email

    if(!email) {
      throw {
        status: 400,
        message: "email must be required"
      }
    }

    const user = await userModel.findOne({ email: req.body.email })
    if(!user) {
      throw {
        message: `${email} is not found`,
        status: 404
      }
    }

    let otp = otpGenerator.generate(6, // default length = 10
      { 
        // No Alphabet, Only number
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      }
    );

    let result = await otpModel.findOne({ otp: otp })

    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
      });
      result = await otpModel.findOne({ otp: otp })
    }

    let otpPayload = { email, otp }
    let otpBody = await otpModel.create(otpPayload)
    // console.log(otpBody)

    res.status(200).send({
      data: otpBody,
      message: 'OTP sent successfully',
      otp: otp
    })
  }catch (err) {
    return res.status(err.status || 500).send({
      message: err.message
    })
  }
})

// check otp
router.post('/check-otp/:id', limiter, async (req, res, next) => {
  try {
    const id = req.params.id  // id of otp
    const otp = req.body.otp

    let otpData = await otpModel.findById(id)

    if(otp != otpData.otp) {
      throw {
        status: 400,
        message: "OTP is not correct"
      }
    }

    return res.status(200).send({
      data: otpData,
      message: "OTP is match, 5 minutes for change password"
    });
  }catch (err) {
    return res.status(err.status || 500).send(err)
  }
})

// change password
router.put('/newpassword/:id', validateRegister, async (req, res, next) => {
  try{
    const id = req.params.id  // otp id
    const password = req.body.password

    if(!password) {
      throw {
        status: 403,
        message: 'New password is required'
      }  
    }
    
    let otpData = await otpModel.findById(id)

    if(!otpData) {
      throw {
        status: 410,
        message: "otp is expired"
      }
    }

    const user = await userModel.findOne({ email: otpData.email })
    if(!user) {
      throw {
        message: `${otpData.email} is not found`,
        status: 404
      }
    }

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw {
        status: 400,
        message: errors.mapped().password.msg
      }
    }

    let hash_new_password = await bcrypt.hash(password, 10)

    await userModel.updateOne(
      { _id: user._id},
      { $set: {
        password: hash_new_password
      }}
    );

    return res.status(200).send({
      message: "change password success"
    })
  }catch (err) {
    return res.status(err.status || 500).send({
      message: err.message
    })
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
    return res.status(err.status || 500).send({
      message: err.message
    })
  }
})

module.exports = router;