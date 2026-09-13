const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticateToken, requireRole } = require('../middlewares/auth');

// GET /api/courses - List courses
router.get('/', authenticateToken, async (req, res) => {
  try {
    let sql = 'SELECT * FROM courses';
    let params = [];

    if (req.user.role === 'faculty') {
      sql += ' WHERE faculty_id = $1';
      params.push(req.user.id);
    } else if (req.user.role === 'college_admin' || req.user.role === 'student') {
      if (req.user.college_id) {
        sql += ' WHERE college_id = $1';
        params.push(req.user.college_id);
      }
    }

    const result = await query(sql, params);
    res.json({ success: true, courses: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch courses', error: err.message });
  }
});

// POST /api/courses - Create course (College Admin & Super Admin)
router.post('/', authenticateToken, requireRole('super_admin', 'college_admin'), async (req, res) => {
  try {
    const { code, title, department, credits = 3, semester = 'Fall 2026', faculty_id } = req.body;
    const college_id = req.user.role === 'college_admin' ? req.user.college_id : (req.body.college_id || 1);

    if (!code || !title || !department) {
      return res.status(400).json({ success: false, message: 'Code, title, and department are required.' });
    }

    const result = await query(
      `INSERT INTO courses (code, title, college_id, faculty_id, department, credits, semester)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [code.trim().toUpperCase(), title.trim(), college_id, faculty_id || null, department, credits, semester]
    );

    res.status(201).json({ success: true, message: 'Course created successfully', course: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create course', error: err.message });
  }
});

// GET /api/courses/:id/students - List students enrolled in a course
router.get('/:id/students', authenticateToken, requireRole('super_admin', 'college_admin', 'faculty'), async (req, res) => {
  try {
    const courseId = req.params.id;
    const result = await query('SELECT * FROM enrollments WHERE course_id = $1', [courseId]);
    res.json({ success: true, enrollments: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch enrolled students', error: err.message });
  }
});

// PUT /api/courses/enrollments/:id - Update student grade & attendance (Faculty)
router.put('/enrollments/:id', authenticateToken, requireRole('faculty', 'college_admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { grade, attendance_pct } = req.body;

    const result = await query(
      'UPDATE enrollments SET grade = $1, attendance_pct = $2 WHERE id = $3 RETURNING *',
      [grade, attendance_pct, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Enrollment record not found' });
    }

    res.json({ success: true, message: 'Student record updated successfully', enrollment: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update enrollment record', error: err.message });
  }
});

// POST /api/courses/enroll - Student enrollment
router.post('/enroll', authenticateToken, async (req, res) => {
  try {
    const { course_id } = req.body;
    const student_id = req.user.id;

    if (!course_id) {
      return res.status(400).json({ success: false, message: 'course_id is required' });
    }

    const result = await query(
      'INSERT INTO enrollments (course_id, student_id, grade, attendance_pct) VALUES ($1, $2, $3, $4) RETURNING *',
      [course_id, student_id, 'In Progress', 95.0]
    );

    res.status(201).json({ success: true, message: 'Successfully enrolled in course', enrollment: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to enroll in course', error: err.message });
  }
});

module.exports = router;
