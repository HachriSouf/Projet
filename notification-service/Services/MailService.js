const nodemailer = require("nodemailer");

const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT) || 465;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: true, // true for port 465, false for other ports
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
});

async function sendMail(
  textMessage,
  htmlMessage,
  subject,
  toMailAddress,
  fromMailAddress,
  fromLabel
) {
  try {
    if (!fromLabel) fromLabel = fromMailAddress;

    const info = await transporter.sendMail({
      from: `${fromLabel} <${fromMailAddress}>`,
      to: toMailAddress,
      subject: subject,
      text: textMessage,
      html: `<p>${htmlMessage}</p>`,
    });

    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

module.exports = sendMail;