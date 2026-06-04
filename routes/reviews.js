const express = require("express");
const pool = require("../db");

const router = express.Router();

/*
POST REVIEW
*/
router.post("/", async (req, res) => {
    try {

        const { name, rating, review } = req.body;

        await pool.query(
            `INSERT INTO reviews
            (name, rating, review)
            VALUES ($1, $2, $3)`,
            [name, rating, review]
        );

        res.json({
            success: true,
            message: "Review submitted successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
});

/*
GET APPROVED REVIEWS
*/
router.get("/", async (req, res) => {
    try {

        const reviews = await pool.query(
            `SELECT *
             FROM reviews
             WHERE approved = true
             ORDER BY created_at DESC`
        );

        res.json(reviews.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
});

module.exports = router;