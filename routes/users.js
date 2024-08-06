var express = require('express');
var router = express.Router();
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
var userModel = require('../models/user');

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
    console.log(data)
    next() //return to router

  }catch (err) {
    return res.status(401).send({
      message: err.message
    })
  }
}

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
      // user_id: body.user_id,
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
  // let password = req.body.password

  // let hash_password = await bcrypt.hash(password, 10) // วนเข้ารหัส  10 รอบ

  // let check_password = await bcrypt.compare(password, hash_password) //ตรวจสอบ password ที่ login

  // return res.send({ //passwordหลัก บันทึกเข้า database
  //   hash_password,
  //   check_password
  // })
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

    // console.log(user)

    let payload = {
      username: user.username,
      password: user.password,
      role: user.role
    }
    
    let token = jwt.sign(payload, process.env.TOKEN_KEY)

    return res.status(200).send({
      message: "login success",
      token: token
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

    await userModel.updateOne(
      { _id: id },
      { $set: {
        // user_id: body.user_id,
        username: body.username,
        password: body.password,
        firstname: body.firstname,
        surname: body.surname,
        age: body.age,
        gender: body.gender,
        role: body.role
      }}
    );

    let user = await userModel.findById(id);

    if(user == null) {
      throw {
        message: `user ${id} is not found`,
        status: 404
      }
    }

    return res.status(200).send({
      data: user,
      message: `update user id ${id} success`,
      success: true
    })

  } catch (err) {
    return res.status(err.status || 500).send(err.message)
  }
})

// deleteById
router.delete('/:id', detoken, async (req, res, next) => {
  try {
    let id = req.params.id

    let userID = await userModel.findById(id)

    if(userID == null) {
      throw {
        message: `delete fail, user ${id} is not found`,
        status: 404
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

/*
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images")
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
});

const upload = multer({ storage: storage })

router.post('/upload', upload.fields([{ name: "file"}, { name: "img"}]), (req, res, next) => {
  return res.send({
    message: "upload success"
  })
})
*/

/*
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
    console.log(data)
    next() //return to router

  }catch (err) {
    return res.status(401).send({
      message: err.message
    })
  }
}
*/

// decode token
// router.get('/token', detoken, (req, res) => {
//   return res.send({
//     message: `hello `
//   })
// })

module.exports = router;
