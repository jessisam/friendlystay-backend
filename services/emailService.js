const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEnquiryEmail = async (data) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: "New FriendlyStay Enquiry",
    html: `
      <h2>New Enquiry Received</h2>

      <p><b>Name:</b> ${data.name}</p>
      <p><b>Email:</b> ${data.email}</p>
      <p><b>Phone:</b> ${data.phone}</p>

      <p><b>Message:</b></p>
      <p>${data.message}</p>
    `
  });
};

module.exports = sendEnquiryEmail;