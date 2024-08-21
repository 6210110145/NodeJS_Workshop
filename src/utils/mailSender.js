const nodemailer = require('nodemailer')

const mailSender = async (email, title, body) => {
    try {
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            }
        });

        // Send emails to users
        let info = await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: email,
            subject: title,
            html: body,
        });

        console.log("Email info: ", info)

        return info
    } catch (err) {
        console.log(err.message)
    }
}

module.exports = mailSender