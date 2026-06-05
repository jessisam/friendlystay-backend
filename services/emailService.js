const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEnquiryEmail = async ({ name, email, phone, message }) => {
    await resend.emails.send({
        from: 'FriendlyStay <onboarding@resend.dev>',
        to: 'appy49824@gmail.com',
        subject: `New Enquiry from ${name} – FriendlyStay`,
        html: `
            <h2>New Enquiry Received</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Message:</strong> ${message}</p>
        `
    });
};

module.exports = { sendEnquiryEmail };