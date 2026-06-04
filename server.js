require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

// Routes
const enquiryRoutes = require("./routes/enquiry");
const reviewRoutes = require("./routes/reviews");

// Database
const pool = require("./db");

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
}));
app.use(express.json());

// Routes
app.use("/api/enquiry", enquiryRoutes);
app.use("/api/reviews", reviewRoutes);

app.get("/", (req, res) => {
    res.send("FriendlyStay Backend Running");
});

// Database Connection Test
pool.query("SELECT NOW()", (err, result) => {
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("Database connected!");
        console.log(result.rows[0]);
    }
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});