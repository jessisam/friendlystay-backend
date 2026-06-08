require("dotenv").config();

const express = require("express");
const cors = require("cors");
const https = require("https");

const app = express();
const pool = require("./db");

// Middleware - must come first
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
const enquiryRoutes = require("./routes/enquiry");
const reviewRoutes = require("./routes/reviews");
const adminRoutes = require("./routes/admin");

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.get("/", (req, res) => res.send("FriendlyStay Backend Running"));

app.get('/api/properties', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM properties ORDER BY id');
        res.json({ success: true, properties: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.use("/api/enquiry", enquiryRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);

// Database Connection Test
pool.query("SELECT NOW()", (err, result) => {
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("Database connected!");
    }
});

// Keep-alive ping
setInterval(() => {
    https.get('https://friendlystay-backend-production.up.railway.app/health', (res) => {
        console.log('Keep-alive ping:', res.statusCode);
    }).on('error', (err) => {
        console.log('Ping failed:', err.message);
    });
}, 4 * 60 * 1000);

app.listen(5000, () => {
    console.log("Server running on port 5000");
});