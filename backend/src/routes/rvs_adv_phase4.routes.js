const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const storePath = path.resolve(__dirname, '../../data/campusiq_store.json');

function getStore() {
  return JSON.parse(fs.readFileSync(storePath, 'utf8'));
}

function saveStore(store) {
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');
}

const JWT_SECRET = process.env.JWT_SECRET || 'campusiq_jwt_secret_dev_2024';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Authentication token required.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
    req.user = user;
    next();
  });
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Unauthorized: Access restricted to authorized personnel.' });
    }
    next();
  };
}

// =========================================================================
// 1. EXAM SEATING PLANNER
// =========================================================================

router.get('/exam-seating', authenticateToken, (req, res) => {
  const store = getStore();
  const user = req.user;
  const plans = store.exam_seating_plans || [];

  if (user.role === 'student') {
    // Return plans and highlight student's assigned seat
    const mySeatings = plans.map(p => {
      const mySeat = (p.allocated_students || []).find(s =>
        s.roll_no === user.roll_no || s.name.toLowerCase() === user.name.toLowerCase()
      );
      return {
        ...p,
        my_seat: mySeat || null
      };
    });
    return res.json({ success: true, total: mySeatings.length, seating_plans: mySeatings });
  }

  res.json({ success: true, total: plans.length, seating_plans: plans });
});

router.post('/exam-seating', authenticateToken, requireRole('super_admin', 'college_admin'), (req, res) => {
  const store = getStore();
  const { exam_name, date, shift, subject_code, subject_name, room_number, total_capacity = 40, departments = ['CSE', 'ECE'] } = req.body;

  if (!exam_name || !date || !room_number) {
    return res.status(400).json({ success: false, message: 'Exam name, date, and room number required.' });
  }

  store.exam_seating_plans = store.exam_seating_plans || [];

  // Generate alternating seating arrangement
  const allocated = [];
  const rows = 6;
  const cols = 6;
  let count = 0;

  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      if (count >= Number(total_capacity)) break;
      count++;
      const isEven = (r + c) % 2 === 0;
      const dept = isEven ? departments[0] : (departments[1] || departments[0]);
      allocated.push({
        seat: `R${r}-C${c}`,
        roll_no: `23RVS${dept}${String(count).padStart(3, '0')}`,
        name: `Candidate ${count}`,
        dept,
        subject: subject_code || 'CS701'
      });
    }
  }

  const newPlan = {
    id: store.exam_seating_plans.length > 0 ? Math.max(...store.exam_seating_plans.map(p => p.id)) + 1 : 1,
    exam_name: exam_name.trim(),
    date,
    shift: shift || 'Morning (09:30 AM - 12:30 PM)',
    subject_code: subject_code || 'CS701',
    subject_name: subject_name || 'Artificial Intelligence & Machine Learning',
    room_number: room_number.trim(),
    total_capacity: Number(total_capacity),
    allocated_count: allocated.length,
    rows,
    cols,
    departments,
    allocated_students: allocated
  };

  store.exam_seating_plans.unshift(newPlan);
  saveStore(store);

  res.status(201).json({ success: true, message: 'Exam seating plan generated.', plan: newPlan });
});

// =========================================================================
// 2. INVIGILATION DUTY MANAGEMENT
// =========================================================================

router.get('/invigilation', authenticateToken, (req, res) => {
  const store = getStore();
  const user = req.user;
  let duties = store.invigilation_duties || [];

  if (user.role === 'faculty') {
    duties = duties.filter(d =>
      d.faculty_id === user.id ||
      d.faculty_name.toLowerCase().includes(user.name.toLowerCase())
    );
  }

  res.json({ success: true, total: duties.length, duties });
});

router.post('/invigilation', authenticateToken, requireRole('super_admin', 'college_admin'), (req, res) => {
  const store = getStore();
  const { faculty_id, faculty_name, department, exam_name, date, shift, room_number, reporting_time, role, instructions } = req.body;

  if (!faculty_name || !exam_name || !date || !room_number) {
    return res.status(400).json({ success: false, message: 'Faculty, exam, date, and room are required.' });
  }

  store.invigilation_duties = store.invigilation_duties || [];

  // Detect conflict: faculty already assigned on same date and shift
  const conflict = store.invigilation_duties.find(d =>
    d.faculty_name.toLowerCase() === faculty_name.toLowerCase() &&
    d.date === date &&
    d.shift === shift
  );

  if (conflict) {
    return res.status(409).json({
      success: false,
      message: `Conflict detected: ${faculty_name} is already assigned to ${conflict.room_number} on ${date} during ${shift}.`
    });
  }

  const newDuty = {
    id: store.invigilation_duties.length > 0 ? Math.max(...store.invigilation_duties.map(d => d.id)) + 1 : 1,
    faculty_id: Number(faculty_id || 6),
    faculty_name: faculty_name.trim(),
    department: department || 'Academics',
    exam_name: exam_name.trim(),
    date,
    shift: shift || 'Morning (09:30 AM - 12:30 PM)',
    room_number: room_number.trim(),
    reporting_time: reporting_time || '08:45 AM',
    role: role || 'Chief Invigilator',
    instructions: instructions ? instructions.trim() : 'Collect sealed question paper packets 45 minutes prior.',
    status: 'Confirmed'
  };

  store.invigilation_duties.unshift(newDuty);
  saveStore(store);

  res.status(201).json({ success: true, message: 'Invigilation duty allocated.', duty: newDuty });
});

// =========================================================================
// 3. QUESTION BANK MANAGEMENT
// =========================================================================

router.get('/question-bank', authenticateToken, requireRole('super_admin', 'college_admin', 'faculty'), (req, res) => {
  const store = getStore();
  let questions = store.question_bank || [];

  const { department, semester, subject_code, difficulty, question_type, search } = req.query;

  if (department && department !== 'ALL') {
    questions = questions.filter(q => (q.department || '').toLowerCase() === department.toLowerCase());
  }
  if (semester && semester !== 'ALL') {
    questions = questions.filter(q => (q.semester || '').toLowerCase() === semester.toLowerCase());
  }
  if (subject_code) {
    questions = questions.filter(q => (q.subject_code || '').toLowerCase() === subject_code.toLowerCase());
  }
  if (difficulty && difficulty !== 'ALL') {
    questions = questions.filter(q => (q.difficulty || '').toLowerCase() === difficulty.toLowerCase());
  }
  if (question_type && question_type !== 'ALL') {
    questions = questions.filter(q => (q.question_type || '').toLowerCase() === question_type.toLowerCase());
  }
  if (search) {
    const s = search.toLowerCase();
    questions = questions.filter(q =>
      (q.question || '').toLowerCase().includes(s) ||
      (q.topic || '').toLowerCase().includes(s) ||
      (q.subject_name || '').toLowerCase().includes(s)
    );
  }

  res.json({ success: true, total: questions.length, questions });
});

router.post('/question-bank', authenticateToken, requireRole('super_admin', 'college_admin', 'faculty'), (req, res) => {
  const store = getStore();
  const {
    course = 'B.Tech',
    department,
    semester,
    subject_code,
    subject_name,
    unit,
    topic,
    question,
    marks = 10,
    difficulty = 'MEDIUM',
    question_type = 'LONG'
  } = req.body;

  if (!question || !subject_code || !unit) {
    return res.status(400).json({ success: false, message: 'Question text, subject code, and unit are required.' });
  }

  store.question_bank = store.question_bank || [];

  const newQ = {
    id: store.question_bank.length > 0 ? Math.max(...store.question_bank.map(q => q.id)) + 1 : 1,
    course,
    department: department || req.user.department || 'CSE',
    semester: semester || '7th Semester',
    subject_code: subject_code.trim(),
    subject_name: subject_name ? subject_name.trim() : 'Core Engineering',
    unit: unit.trim(),
    topic: topic ? topic.trim() : 'General Topic',
    question: question.trim(),
    marks: Number(marks),
    difficulty: difficulty.toUpperCase(),
    question_type: question_type.toUpperCase(),
    author: req.user.name,
    created_at: new Date().toISOString().split('T')[0]
  };

  store.question_bank.unshift(newQ);
  saveStore(store);

  res.status(201).json({ success: true, message: 'Question contributed to curriculum repository.', question: newQ });
});

// =========================================================================
// 4. RESULT SCRUTINY & REVALUATION REQUESTS
// =========================================================================

router.get('/revaluation', authenticateToken, (req, res) => {
  const store = getStore();
  const user = req.user;
  let requests = store.revaluation_requests || [];

  if (user.role === 'student') {
    requests = requests.filter(r => r.student_id === user.id);
  }

  res.json({ success: true, total: requests.length, requests });
});

router.post('/revaluation/request', authenticateToken, (req, res) => {
  const store = getStore();
  const user = req.user;
  const { exam_name, subject_code, subject_name, request_type = 'Revaluation', original_marks, original_grade } = req.body;

  if (!exam_name || !subject_code) {
    return res.status(400).json({ success: false, message: 'Exam name and subject code required.' });
  }

  store.revaluation_requests = store.revaluation_requests || [];

  const fee = request_type === 'Revaluation' ? '₹ 500' : '₹ 250';

  const newReq = {
    id: store.revaluation_requests.length > 0 ? Math.max(...store.revaluation_requests.map(r => r.id)) + 1 : 1,
    student_id: user.id,
    student_name: user.name,
    roll_no: user.roll_no || `23RVSCSE${String(user.id).padStart(3, '0')}`,
    department: user.department || 'CSE',
    exam_name: exam_name.trim(),
    subject_code: subject_code.trim(),
    subject_name: subject_name ? subject_name.trim() : 'Semester Paper',
    request_type,
    fee_paid: fee,
    original_marks: Number(original_marks || 65),
    original_grade: original_grade || 'B',
    revised_marks: null,
    revised_grade: null,
    status: 'SUBMITTED',
    examiner_remarks: 'Application logged. Script requisition sent to confidential evaluation cell.',
    applied_at: new Date().toISOString().split('T')[0],
    resolved_at: null
  };

  store.revaluation_requests.unshift(newReq);
  saveStore(store);

  res.status(201).json({ success: true, message: `${request_type} request submitted.`, request: newReq });
});

router.post('/revaluation/:id/evaluate', authenticateToken, requireRole('super_admin', 'college_admin', 'faculty'), (req, res) => {
  const store = getStore();
  const reqId = Number(req.params.id);
  const { status, revised_marks, revised_grade, examiner_remarks } = req.body;

  store.revaluation_requests = store.revaluation_requests || [];
  const reqItem = store.revaluation_requests.find(r => r.id === reqId);
  if (!reqItem) return res.status(404).json({ success: false, message: 'Revaluation request not found.' });

  reqItem.status = status || 'COMPLETED';
  if (revised_marks !== undefined && revised_marks !== null && revised_marks !== '') {
    reqItem.revised_marks = Number(revised_marks);
  }
  if (revised_grade) {
    reqItem.revised_grade = revised_grade;
  }
  if (examiner_remarks) {
    reqItem.examiner_remarks = examiner_remarks.trim();
  }
  if (reqItem.status === 'COMPLETED') {
    reqItem.resolved_at = new Date().toISOString().split('T')[0];
  }

  saveStore(store);

  res.json({
    success: true,
    message: `Evaluation completed. Original marks preserved: ${reqItem.original_marks}, Revised: ${reqItem.revised_marks || 'Unchanged'}.`,
    request: reqItem
  });
});

module.exports = router;
