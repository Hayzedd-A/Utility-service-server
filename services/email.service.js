const nodemailer = require("nodemailer");
require("dotenv").config();
console.log(process.env.NODE_MAILER_EMAIL);
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: process.env.NODE_MAILER_EMAIL,
    pass: process.env.NODE_MAILER_PASSCODE,
  },
});

async function sendEmail(receiverEmail, subject, body) {
  try {
    // send mail with defined transport object
    const message = await transporter.sendMail({
      from: `"PayBill Utility Service" <adebayoazeez37@yahoo.com>`, // sender address
      to: receiverEmail, // list of receivers, can accept an array
      subject: subject, // Subject line
      text: body.text, // plain text body
      html: body.html, // html body
    });
    return message.response;
  } catch (error) {
    return error;
  }

  // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
}

module.exports = { sendEmail };
