module.exports = (req, res, next) => {
    try {
        let password = req.body.password

        if(password == "") {
            throw {
                message: "password is required!"
            }
        }

        console.log( req.body('password'))

        // req.body('password')
        //     .exists({ checkFalsy: true }).withMessage('Password is required')
        //     .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
        next()
    } catch (err) {
        return res.status(400).send({
            message: err.message
        })
    }
    
}