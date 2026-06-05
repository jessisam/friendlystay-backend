const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  family: 4,  // Force IPv4
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

const sendEnquiryEmail = async ({ name, email, phone, message }) => {
  const mailOptions = {
    from: `"FriendlyStay" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: `New Enquiry from ${name} – FriendlyStay`,
    html: `
            <h2>New Enquiry Received</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Message:</strong> ${message}</p>
        `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendEnquiryEmail };