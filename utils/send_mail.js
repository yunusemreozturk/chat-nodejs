const nodeMailer = require("nodemailer");
const {CRASH_WHEN_SEND_EMAIL} = require("./response_string");

const sendEmail = async (emailOptions) => {
    const transporter = nodeMailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    transporter.sendMail(emailOptions, (err, info) => {
        if (err) {
            console.log(CRASH_WHEN_SEND_EMAIL, err)
        }

        return true;
    });
}

module.exports = sendEmail