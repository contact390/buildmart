const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');

const router = express.Router();

// ==============================
// 📁 File Upload Setup
// ==============================
const uploadsDir = path.join(__dirname, '../uploads/workforce');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Created uploads/workforce directory');
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`)
});

const upload = multer({
    storage,
    limits: { fileSize: 6 * 1024 * 1024 }, // 6MB max
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
        cb(null, allowedTypes.includes(file.mimetype));
    }
});

// ==============================
// 🧾 TABLE QUERY (inside api.js)
// ==============================
const createTableQuery = `
CREATE TABLE IF NOT EXISTS workers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    full_name VARCHAR(100) NOT NULL,
    mobile VARCHAR(15) NOT NULL,
    area VARCHAR(100) NOT NULL,

    works TEXT,

    experience INT,
    languages VARCHAR(150),

    id_proof VARCHAR(255),

    ready_from DATE,
    available_from DATE,
    available_to DATE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

console.log("🧾 TABLE QUERY:\n", createTableQuery);

db.query(createTableQuery, (err) => {
    if (err) {
        console.error('❌ Error creating workers table:', err.message);
    } else {
        console.log('✅ workers table ready');
        // Add new columns if they are missing in older schema (MySQL < 8.0 compatibility)
        const columnsToAdd = [
            {name: 'available_from', type: 'DATE'},
            {name: 'available_to', type: 'DATE'}
        ];
        columnsToAdd.forEach(col => {
            const alterSQL = `ALTER TABLE workers ADD COLUMN ${col.name} ${col.type}`;
            db.query(alterSQL, (alterErr) => {
                if (alterErr) {
                    if (alterErr.code === 'ER_DUP_FIELDNAME') {
                        // already exists in this table, ignore
                        return;
                    }
                    console.error(`❌ Error altering workers table for ${col.name}:`, alterErr.message);
                } else {
                    console.log(`✅ ${col.name} column ensured`);
                }
            });
        });
    }
});

// ==============================
// 🚀 API: Register Worker
// ==============================
router.post('/register-worker', upload.single('idProof'), (req, res) => {

    const {
        fullName,
        mobile,
        area,
        works,
        experience,
        languages,
        readyFrom,
        availableFrom,
        availableTo
    } = req.body;

    // Normalize work selection: allow comma-separated string, JSON array string, or array
    let worksValue = works;
    if (typeof worksValue === 'string') {
        try {
            const parsed = JSON.parse(worksValue);
            if (Array.isArray(parsed)) {
                worksValue = parsed.join(', ');
            }
        } catch (e) {
            // not JSON, keep as-is
        }
    }
    if (Array.isArray(worksValue)) {
        worksValue = worksValue.join(', ');
    }

    const idProof = req.file ? req.file.filename : null;

    if (!fullName || !mobile || !area) {
        if (req.file) fs.unlink(req.file.path, () => {});
        return res.status(400).json({ success: false, error: 'fullName, mobile and area are required' });
    }

    const insertQuery = `
INSERT INTO workers (full_name, mobile, area, works, experience, languages, id_proof, ready_from, available_from, available_to)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

    db.query(
        insertQuery,
        [
            fullName,
            mobile,
            area,
            works || null,
            experience || null,
            languages || null,
            idProof,
            readyFrom || null,
            availableFrom || null,
            availableTo || null
        ],
        (err, result) => {
            if (err) {
                console.error('❌ Worker insert error:', err);
                if (req.file) fs.unlink(req.file.path, () => {});
                return res.status(500).json({ success: false, error: err.message });
            }

            res.json({ success: true, message: 'Worker saved', id: result.insertId });
        }
    );
});

// ==============================
// 🌐 API: View Table Query
// ==============================
router.get('/table-query', (req, res) => {
    res.send(`<pre>${createTableQuery}</pre>`);
});

module.exports = router;