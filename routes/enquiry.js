const express = require("express");
const pool = require("../db");
const sendEnquiryEmail = require("../services/emailService");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    await pool.query(
      `INSERT INTO enquiries
       (name, email, phone, message)
       VALUES ($1, $2, $3, $4)`,
      [name, email, phone, message]
    );

    await sendEnquiryEmail({
      name,
      email,
      phone,
      message
    });

    res.json({
      success: true,
      message: "Enquiry saved successfully"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

module.exports = router;