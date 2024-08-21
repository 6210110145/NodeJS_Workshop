const nodemailer = require('nodemailer')

const mailSender = async (email, title, body) => {
    try {
        let transporter = nodemailer.createTransport({
            host: "imap.ethereal.email",
            port: 993,
            secure: false,
            auth: {
                user: "solon.lind87@ethereal.email",
                pass: "",
                // "1KT5nYz1u8mbMhqJG1",
            }
        });

        // Send emails to users
        let info = await transporter.sendMail({
            from: '"solon lind87" <solon.lind87@ethereal.email>',
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