const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    if(!req.headers.authorization) {
      throw {
        message: "require token"
      }
    }
    let token = req.headers.authorization.replace('Bearer ', '')
    let data = jwt.verify(token, process.env.TOKEN_KEY)
    req.token = data
    // console.log(data)
    next()
  }catch (err) {
    return res.status(401).send({
      message: err.message
    })
  }
}