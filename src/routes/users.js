var express = require('express');
var router = express.Router();
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const otpGenerator = require('otp-generator')

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

    let newUser = new userModel({
      role: body.role,
      username: body.username,
      email: body.email,
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
    });

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

    // let hash_password = await bcrypt.hash(body.password, 10)

    await userModel.updateOne(
      { _id: id },
      { $set: {
        username: body.username,
        // password: hash_password,
        email: body.email,
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
      message: `update ${body.username} user success`,
      success: true
    });
  } catch (err) {
    return res.status(err.status || 500).send(err.message)
  }
})

// forget password
router.post('/password', async (req, res) => {
  try {
    let { email } = req.body
  
    let user = await userModel.findOne({email: email})

    if(!user) {
      throw {
        status: 404,
        message: `${email} is not found`
      }
    }

    const resetToken = crypto.randomUUID(20).toString('hex')
    user.reset_token = resetToken;
    const resetTokenExpiration = Date.now() + 3600000; // Token expires in 1 hour
    user.reset_token_expiration = resetTokenExpiration
    // await user.save();

    console.log(resetToken)
    console.log(resetTokenExpiration)

    // let hash_password = await bcrypt.hash(password, 10)

    // await userModel.updateOne(
    //   { _id: user._id},
    //   { $set: {
    //     password: hash_password
    //   }}
    // )

    return res.status(200).send({
      message: 'Password reset token sent'
    })

  }catch (err) {
    return res.status(err.status || 500).send(err.message)
  }
})

// //change password
// router.put('/newpassword', detoken, async (req, res, next) => {
//   try {
//     // let id = req.params.id
//     let { reset_token, new_password } = req.body

//     const user = await userModel.findOne({
//       reset_token,
//       reset_token_expiration: { $gt: Date.now() },
//     });

//     if(!user) {
//       throw {
//         status: 401,
//         message: "Invalid or expired reset token"
//       }
//     }

//     let hash_new_password = await bcrypt.hash(new_password, 10)

//     await userModel.updateOne(
//       { _id: user._id},
//       { $set: {
//         password: hash_new_password,
//         reset_token: undefined,
//         reset_token_expiration: undefined,
//       }}
//     );

//     return res.status(200).send({
//       message: "change password success"
//     })

//   }catch (err) {
//     return res.status(err.status || 500).send(err.message)
//   }
// })

// send otp
router.post('/otp', async (req, res) => {
  try {
    let email = req.body.email

    const user = await userModel.findOne({ email: req.body.email })
    if(!user) {
      throw {
        message: `${email} is not found`,
        status: 404
      }
    }

    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    let result = await otpModel.findOne({ otp: otp })

    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
      });
      result = await otpModel.findOne({ otp: otp })
    }

    let otpPayload = { email, otp }
    let otpBody = await otpModel.create(otpPayload)
    console.log(otpBody)

    res.status(200).send({
      data: otpBody,
      message: 'OTP sent successfully',
      otp: otp
    })
  }catch (err) {
    return res.status(err.status || 500).send(err.message)
  }
})

// check otp
router.post('/check-otp/:id', async (req, res, next) => {
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
    })
  }catch (err) {
    return res.status(err.status || 500).send(err.message)
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