const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticateToken, requireRole } = require('../middlewares/auth');

// GET /api/colleges - List all colleges
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query('SELECT * FROM colleges ORDER BY id ASC');
    res.json({ success: true, colleges: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch colleges', error: err.message });
  }
});

// POST /api/colleges - Create a new college (Super Admin only)
router.post('/', authenticateToken, requireRole('super_admin'), async (req, res) => {
  try {
    const { name, code, city, state } = req.body;
    if (!name || !code || !city || !state) {
      return res.status(400).json({ success: false, message: 'All fields (name, code, city, state) are required.' });
    }

    const result = await query(
      'INSERT INTO colleges (name, code, city, state) VALUES ($1, $2, $3, $4) RETURNING *',
      [name.trim(), code.trim().toUpperCase(), city.trim(), state.trim()]
    );

    await query('INSERT INTO audit_logs (user_id, action, details, ip_address) VALUES ($1, $2, $3, $4)', [
      req.user.id,
      'CREATE_COLLEGE',
      `Super Admin created college: ${name} (${code})`,
      req.ip || '127.0.0.1'
    ]);

    res.status(201).json({ success: true, message: 'College registered successfully', college: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create college', error: err.message });
  }
});

module.exports = router;
