const nodemailer = require('nodemailer');

const sendMail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
      }
    });

    await transporter.sendMail({
      from: `"Coffee Store" <${process.env.SMTP_EMAIL}>`,
      to,
      subject,
      html
    });

    console.log('Mail sent to:', to);
  } catch (error) {
    console.error('Mail error:', error.message);
  }
};

module.exports = sendMail;
