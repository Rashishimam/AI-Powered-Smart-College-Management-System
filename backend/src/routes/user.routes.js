const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { hashPassword } = require('../utils/jwt');
const { authenticateToken, requireRole } = require('../middlewares/auth');

// GET /api/users - List users with optional role & college filtering
router.get('/', authenticateToken, requireRole('super_admin', 'college_admin'), async (req, res) => {
  try {
    const { role } = req.query;
    let sql = 'SELECT id, name, email, role, college_id, department, phone, avatar, status, created_at FROM users';
    let params = [];

    if (req.user.role === 'college_admin') {
      sql += ' WHERE college_id = $1';
      params.push(req.user.college_id);
      if (role) {
        sql += ' AND role = $2';
        params.push(role);
      }
    } else if (role) {
      sql += ' WHERE role = $1';
      params.push(role);
    }

    const result = await query(sql, params);
    res.json({ success: true, users: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch users', error: err.message });
  }
});

// POST /api/users - Provision new faculty or student (Admin only)
router.post('/', authenticateToken, requireRole('super_admin', 'college_admin'), async (req, res) => {
  try {
    const { name, email, password = 'Password@123', role, college_id, department, phone } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ success: false, message: 'Name, email, and role are required.' });
    }

    // Role restrictions: College admin can only create faculty or student in their own college
    let targetCollegeId = college_id;
    if (req.user.role === 'college_admin') {
      targetCollegeId = req.user.college_id;
      if (!['faculty', 'student'].includes(role)) {
        return res.status(403).json({ success: false, message: 'College Admin can only provision faculty or student accounts.' });
      }
    }

    const hashedPassword = await hashPassword(password);
    const result = await query(
      `INSERT INTO users (name, email, password_hash, role, college_id, department, phone, avatar)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, name, email, role, college_id, department, phone, status`,
      [
        name.trim(),
        email.trim().toLowerCase(),
        hashedPassword,
        role,
        targetCollegeId ? Number(targetCollegeId) : null,
        department || 'General',
        phone || null,
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
      ]
    );

    res.status(201).json({ success: true, message: 'User provisioned successfully', user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to provision user', error: err.message });
  }
});

module.exports = router;
