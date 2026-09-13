const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticateToken, requireRole } = require('../middlewares/auth');

// GET /api/announcements
router.get('/', authenticateToken, async (req, res) => {
  try {
    const collegeId = req.user.college_id || 1;
    const result = await query('SELECT * FROM announcements WHERE college_id = $1', [collegeId]);
    res.json({ success: true, announcements: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch announcements', error: err.message });
  }
});

// POST /api/announcements (Super Admin, College Admin, Faculty)
router.post('/', authenticateToken, requireRole('super_admin', 'college_admin', 'faculty'), async (req, res) => {
  try {
    const { title, content, category = 'Academic', priority = 'normal', target_role = 'all' } = req.body;
    const college_id = req.user.college_id || 1;
    const author_id = req.user.id;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required.' });
    }

    const result = await query(
      `INSERT INTO announcements (title, content, category, college_id, author_id, target_role, priority)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title.trim(), content.trim(), category, college_id, author_id, target_role, priority]
    );

    res.status(201).json({ success: true, message: 'Announcement posted successfully', announcement: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to post announcement', error: err.message });
  }
});

module.exports = router;
