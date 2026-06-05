const express = require('express');
const router = express.Router();
const pool = require('../db');
const { sendEnquiryEmail } = require('../services/emailService');

router.post('/', async (req, res) => {
    const { name, email, phone, message } = req.body;

    try {
        // Save to database
        await pool.query(
            'INSERT INTO enquiries (name, email, phone, message) VALUES ($1, $2, $3, $4)',
            [name, email, phone, message]
        );

        // Try to send email — but don't crash if it fails
        try {
            await sendEnquiryEmail({ name, email, phone, message });
        } catch (emailError) {
            console.error('Email sending failed:', emailError.message);
            // We still return success because data was saved
        }

        res.json({ success: true, message: 'Enquiry submitted successfully' });

    } catch (error) {
        console.error('Enquiry error:', error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;