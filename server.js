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
app.get('/health', (req, res) => res.json({ status: 'ok' }));

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

// Keep-alive ping to prevent cold starts
const https = require('https');
setInterval(() => {
    https.get('https://friendlystay-backend-production.up.railway.app/health', (res) => {
        console.log('Keep-alive ping:', res.statusCode);
    }).on('error', (err) => {
        console.log('Ping failed:', err.message);
    });
}, 4 * 60 * 1000); // every 4 minutes

app.listen(5000, () => {
    console.log("Server running on port 5000");
});