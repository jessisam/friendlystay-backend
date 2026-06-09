const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { verifyToken, JWT_SECRET } = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: { folder: 'friendlystay-docs', resource_type: 'raw', allowed_formats: ['pdf'] },
});
const upload = multer({ storage });

// ─── LOGIN ───────────────────────────────────────────
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query(
            'SELECT * FROM admin_users WHERE username = $1', [username]
        );
        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        const admin = result.rows[0];
        const match = await bcrypt.compare(password, admin.password_hash);
        if (!match) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ success: true, token });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ─── DASHBOARD ───────────────────────────────────────
router.get('/dashboard', verifyToken, async (req, res) => {
    try {
        const [totalEnquiries, weekEnquiries, pendingReviews, approvedReviews, totalReviews] = await Promise.all([
            pool.query('SELECT COUNT(*) FROM enquiries'),
            pool.query("SELECT COUNT(*) FROM enquiries WHERE created_at >= NOW() - INTERVAL '7 days'"),
            pool.query('SELECT COUNT(*) FROM reviews WHERE approved = false'),
            pool.query('SELECT COUNT(*) FROM reviews WHERE approved = true'),
            pool.query('SELECT COUNT(*) FROM reviews')
        ]);
        res.json({
            success: true,
            stats: {
                totalEnquiries: parseInt(totalEnquiries.rows[0].count),
                weekEnquiries: parseInt(weekEnquiries.rows[0].count),
                pendingReviews: parseInt(pendingReviews.rows[0].count),
                approvedReviews: parseInt(approvedReviews.rows[0].count),
                totalReviews: parseInt(totalReviews.rows[0].count)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ─── REVIEWS ─────────────────────────────────────────
router.get('/reviews', verifyToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM reviews ORDER BY created_at DESC');
        res.json({ success: true, reviews: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/reviews/:id/approve', verifyToken, async (req, res) => {
    try {
        await pool.query('UPDATE reviews SET approved = true WHERE id = $1', [req.params.id]);
        res.json({ success: true, message: 'Review approved' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/reviews/:id/reject', verifyToken, async (req, res) => {
    try {
        await pool.query('UPDATE reviews SET approved = false WHERE id = $1', [req.params.id]);
        res.json({ success: true, message: 'Review rejected' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/reviews/:id/reply', verifyToken, async (req, res) => {
    const { reply } = req.body;
    try {
        await pool.query('UPDATE reviews SET admin_reply = $1 WHERE id = $2', [reply, req.params.id]);
        res.json({ success: true, message: 'Reply saved' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/reviews/:id', verifyToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM reviews WHERE id = $1', [req.params.id]);
        res.json({ success: true, message: 'Review deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ─── PROPERTIES ──────────────────────────────────────
router.get('/properties', verifyToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM properties ORDER BY id');
        res.json({ success: true, properties: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/properties/:id', verifyToken, async (req, res) => {
    const { name, description, address, price_min, price_max, amenities, whatsapp_link } = req.body;
    try {
        await pool.query(
            `UPDATE properties SET 
                name = $1, description = $2, address = $3,
                price_min = $4, price_max = $5, amenities = $6,
                whatsapp_link = $7
             WHERE id = $8`,
            [name, description, address, price_min, price_max, amenities, whatsapp_link, req.params.id]
        );
        res.json({ success: true, message: 'Property updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ─── DOCUMENT UPLOAD ─────────────────────────────────
router.post('/properties/:id/document', verifyToken, upload.single('document'), async (req, res) => {
    try {
        const url = req.file.path;
        await pool.query('UPDATE properties SET document_url = $1 WHERE id = $2', [url, req.params.id]);
        res.json({ success: true, document_url: url });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ─── ENQUIRIES EXPORT ────────────────────────────────
router.get('/enquiries/export', verifyToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM enquiries ORDER BY created_at DESC');
        const rows = result.rows;

        let csv = 'ID,Name,Email,Phone,Message,Date\n';
        rows.forEach(r => {
            csv += `${r.id},"${r.name}","${r.email}","${r.phone}","${r.message.replace(/"/g, '""')}","${r.created_at}"\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=enquiries.csv');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ─── RECENT ENQUIRIES ────────────────────────────────
router.get('/enquiries', verifyToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM enquiries ORDER BY created_at DESC LIMIT 20');
        res.json({ success: true, enquiries: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;