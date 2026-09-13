const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { generateToken, comparePassword, hashPassword } = require('../utils/jwt');
const { authenticateToken } = require('../middlewares/auth');

// Demo accounts for quick-switch testing in frontend (Clearly labeled as Demo Simulations)
const DEMO_ACCOUNTS = [
  { role: 'super_admin', label: 'Super Admin', email: 'superadmin@rvscet.ac.in', password: 'Admin@123', desc: 'RVS Trust Board & Secretariat' },
  { role: 'college_admin', label: 'College Admin', email: 'admin@rvscet.ac.in', password: 'Admin@123', desc: 'Prof. (Dr.) Rajesh Kumar Tiwari — Principal (Admin)' },
  { role: 'director', label: 'Director / Dean', email: 'director@rvscet.ac.in', password: 'Director@123', desc: 'Dr. R. N. Gupta — Campus Dean & Director' },
  { role: 'hod', label: 'HOD (CSE)', email: 'hod.cse@rvscet.ac.in', password: 'Hod@123', desc: 'Prof. Jeevan Kumar — HOD Computer Science' },
  { role: 'faculty', label: 'Faculty Member', email: 'faculty.cse@rvscet.ac.in', password: 'Faculty@123', desc: 'Prof. Rajesh Sharma — Assistant Professor' },
  { role: 'student', label: 'Enrolled Student', email: 'student.rvs@rvscet.ac.in', password: 'Student@123', desc: 'Rahul Kumar Verma — B.Tech CSE Student' }
];


// GET /api/auth/demo-accounts
router.get('/demo-accounts', (req, res) => {
  res.json({ success: true, accounts: DEMO_ACCOUNTS });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const result = await query('SELECT * FROM users WHERE LOWER(email) = $1', [cleanEmail]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const user = result.rows[0];

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account is currently inactive. Contact your administrator.'
      });
    }

    // Token creation
    const token = generateToken(user);

    // Audit log
    await query('INSERT INTO audit_logs (user_id, action, details, ip_address) VALUES ($1, $2, $3, $4)', [
      user.id,
      'USER_LOGIN',
      `User ${user.email} (${user.role}) logged in successfully`,
      req.ip || '127.0.0.1'
    ]);

    // Don't send password hash back
    const { password_hash, ...userProfile } = user;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userProfile
    });
  } catch (err) {
    console.error('[Login Error]:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.',
      error: err.message
    });
  }
});

// GET /api/auth/me (Get profile of logged in user)
router.get('/me', authenticateToken, async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// POST /api/auth/register (Public/Student self registration)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'student', college_id = 1, department = 'Computer Science', phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required.'
      });
    }

    const existing = await query('SELECT id FROM users WHERE LOWER(email) = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    const hashedPassword = await hashPassword(password);
    const result = await query(
      `INSERT INTO users (name, email, password_hash, role, college_id, department, phone, avatar)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, name, email, role, college_id, department, phone, avatar`,
      [
        name,
        email.toLowerCase().trim(),
        hashedPassword,
        role,
        college_id ? Number(college_id) : null,
        department,
        phone || null,
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
      ]
    );

    const newUser = result.rows[0];
    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: newUser
    });
  } catch (err) {
    console.error('[Registration Error]:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create account.',
      error: err.message
    });
  }
});

// POST /api/auth/change-password (Authenticated user changes password)
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters in length.'
      });
    }

    // Fetch user with password_hash
    const userRes = await query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = userRes.rows[0];
    const isMatch = await comparePassword(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password does not match.'
      });
    }

    const newHash = await hashPassword(newPassword);
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, user.id]);

    await query('INSERT INTO audit_logs (user_id, action, details, ip_address) VALUES ($1, $2, $3, $4)', [
      user.id,
      'PASSWORD_CHANGED',
      `User ${user.email} successfully updated their password`,
      req.ip || '127.0.0.1'
    ]);

    res.json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (err) {
    console.error('[Password Change Error]:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error while changing password.',
      error: err.message
    });
  }
});

// POST /api/auth/forgot-password (Public self-service reset / ticket generator)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const userRes = await query('SELECT id, name, email FROM users WHERE LOWER(email) = $1', [cleanEmail]);

    // Constant-time message to prevent email enumeration
    res.json({
      success: true,
      message: 'If an active institutional account exists for this address, password reset instructions have been logged. You may also contact RVSCET IT Cell (info@rvscet.com / 7033000777).'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to process request.',
      error: err.message
    });
  }
});

module.exports = router;
