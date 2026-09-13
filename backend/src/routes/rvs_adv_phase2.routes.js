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
// 1. FINAL YEAR PROJECT MANAGEMENT & REVIEWS
// =========================================================================

// Check similarity / duplicate project title
router.get('/projects/check-title', authenticateToken, (req, res) => {
  const store = getStore();
  const queryTitle = (req.query.title || '').trim().toLowerCase();
  if (!queryTitle) return res.json({ success: true, is_duplicate: false, similar: [] });

  const projects = store.projects || [];
  const similar = projects.filter(p => {
    const t = p.title.toLowerCase();
    return t === queryTitle || t.includes(queryTitle) || queryTitle.includes(t);
  });

  res.json({
    success: true,
    is_duplicate: similar.length > 0,
    similar: similar.map(s => ({ id: s.id, title: s.title, session: s.academic_session, department: s.department }))
  });
});

// List all projects
router.get('/projects', authenticateToken, (req, res) => {
  const store = getStore();
  const user = req.user;
  let projects = store.projects || [];

  const { department, session, status, search } = req.query;

  if (department && department !== 'ALL') {
    projects = projects.filter(p => (p.department || '').toLowerCase() === department.toLowerCase());
  }
  if (session && session !== 'ALL') {
    projects = projects.filter(p => (p.academic_session || '').toLowerCase() === session.toLowerCase());
  }
  if (status && status !== 'ALL') {
    projects = projects.filter(p => (p.status || '').toLowerCase() === status.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    projects = projects.filter(p =>
      (p.title || '').toLowerCase().includes(q) ||
      (p.guide_name || '').toLowerCase().includes(q) ||
      (p.group_name || '').toLowerCase().includes(q)
    );
  }

  // Tag user's involvement
  const enriched = projects.map(p => {
    const isMember = (p.members || []).some(m => m.student_id === user.id);
    const isGuide = p.guide_id === user.id || (p.guide_name && p.guide_name.toLowerCase().includes(user.name.toLowerCase()));
    return {
      ...p,
      is_user_project: isMember || isGuide
    };
  });

  res.json({
    success: true,
    total: enriched.length,
    projects: enriched
  });
});

// Propose a new project (Student / Group Leader or Admin)
router.post('/projects', authenticateToken, (req, res) => {
  const store = getStore();
  const user = req.user;
  const { title, category, department, abstract, technologies, group_name, members = [] } = req.body;

  if (!title || !abstract) {
    return res.status(400).json({ success: false, message: 'Project title and abstract are mandatory.' });
  }

  store.projects = store.projects || [];

  // Check duplicate title
  const isDuplicate = store.projects.some(p => p.title.trim().toLowerCase() === title.trim().toLowerCase());
  if (isDuplicate) {
    return res.status(409).json({ success: false, message: 'A project with an identical title already exists in the system.' });
  }

  const currentSession = (store.academic_sessions || []).find(s => s.is_current)?.session_code || '2025-26';

  // Ensure submitting user is included in members if student
  const finalMembers = [...members];
  if (user.role === 'student' && !finalMembers.some(m => m.student_id === user.id)) {
    finalMembers.unshift({
      student_id: user.id,
      name: user.name,
      roll_no: user.roll_no || `23RVSCSE${String(user.id).padStart(3, '0')}`,
      role: 'Project Leader'
    });
  }

  const newProject = {
    id: store.projects.length > 0 ? Math.max(...store.projects.map(p => p.id)) + 1 : 1,
    title: title.trim(),
    category: category || 'Capstone / Major Project',
    department: department || user.department || 'CSE',
    academic_session: currentSession,
    abstract: abstract.trim(),
    technologies: Array.isArray(technologies) ? technologies : (technologies || '').split(',').map(s => s.trim()).filter(Boolean),
    group_name: group_name ? group_name.trim() : `Group-${title.slice(0, 8)}`,
    guide_id: null,
    guide_name: 'Unassigned',
    co_guide_name: null,
    leader_student_id: user.id,
    leader_student_name: user.name,
    members: finalMembers,
    status: 'PROPOSED',
    documents: [],
    reviews: [
      {
        id: 1,
        review_number: 'Review 1 (Synopsis & Problem Definition)',
        scheduled_date: null,
        panel: [],
        status: 'Scheduled',
        criteria: {},
        max_marks: 100,
        total_marks: null,
        comments: 'Initial review will be scheduled once guide is allocated.'
      }
    ],
    created_at: new Date().toISOString().split('T')[0]
  };

  store.projects.unshift(newProject);
  saveStore(store);

  res.status(201).json({
    success: true,
    message: 'Project proposed successfully. Awaiting guide assignment and HOD topic approval.',
    project: newProject
  });
});

// Assign Guide & Approve Topic (Admin / HOD / Faculty)
router.post('/projects/:id/assign-guide', authenticateToken, requireRole('super_admin', 'college_admin', 'faculty'), (req, res) => {
  const store = getStore();
  const projectId = Number(req.params.id);
  const { guide_id, guide_name, co_guide_name, status } = req.body;

  store.projects = store.projects || [];
  const project = store.projects.find(p => p.id === projectId);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

  if (guide_name) {
    project.guide_name = guide_name.trim();
    project.guide_id = Number(guide_id || 6);
  }
  if (co_guide_name !== undefined) {
    project.co_guide_name = co_guide_name ? co_guide_name.trim() : null;
  }
  if (status) {
    project.status = status;
  } else if (project.status === 'PROPOSED') {
    project.status = 'GUIDE ASSIGNED';
  }

  saveStore(store);

  res.json({
    success: true,
    message: `Guide ${project.guide_name} assigned to "${project.title}".`,
    project
  });
});

// Update Project Status
router.post('/projects/:id/status', authenticateToken, requireRole('super_admin', 'college_admin', 'faculty'), (req, res) => {
  const store = getStore();
  const projectId = Number(req.params.id);
  const { status } = req.body;

  store.projects = store.projects || [];
  const project = store.projects.find(p => p.id === projectId);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

  project.status = status;
  saveStore(store);

  res.json({
    success: true,
    message: `Project status updated to ${status}.`,
    project
  });
});

// Add / Record Project Review
router.post('/projects/:id/reviews', authenticateToken, requireRole('super_admin', 'college_admin', 'faculty'), (req, res) => {
  const store = getStore();
  const projectId = Number(req.params.id);
  const {
    review_number,
    scheduled_date,
    panel = [],
    criteria = {},
    comments,
    status = 'Completed'
  } = req.body;

  store.projects = store.projects || [];
  const project = store.projects.find(p => p.id === projectId);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

  project.reviews = project.reviews || [];

  // Compute total marks from configurable criteria
  let totalMarks = 0;
  Object.values(criteria).forEach(val => {
    if (typeof val === 'number') totalMarks += val;
  });

  const newReview = {
    id: project.reviews.length > 0 ? Math.max(...project.reviews.map(r => r.id)) + 1 : 1,
    review_number: review_number || `Review ${project.reviews.length + 1}`,
    scheduled_date: scheduled_date || new Date().toISOString().split('T')[0],
    panel: Array.isArray(panel) ? panel : [req.user.name],
    status,
    criteria,
    max_marks: 100,
    total_marks: totalMarks || null,
    comments: comments ? comments.trim() : 'Review completed satisfactorily.'
  };

  project.reviews.push(newReview);
  
  // Advance project milestone status
  if (review_number && review_number.includes('1')) {
    project.status = 'REVIEW 1';
  } else if (review_number && review_number.includes('2')) {
    project.status = 'REVIEW 2';
  } else if (review_number && (review_number.toLowerCase().includes('final') || review_number.toLowerCase().includes('viva'))) {
    project.status = 'COMPLETED';
  }

  saveStore(store);

  res.status(201).json({
    success: true,
    message: `Recorded evaluation for ${newReview.review_number}.`,
    review: newReview,
    project
  });
});

// Upload / Attach Project Document
router.post('/projects/:id/documents', authenticateToken, (req, res) => {
  const store = getStore();
  const projectId = Number(req.params.id);
  const { name, url } = req.body;

  if (!name || !url) return res.status(400).json({ success: false, message: 'Document name and url required.' });

  store.projects = store.projects || [];
  const project = store.projects.find(p => p.id === projectId);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

  project.documents = project.documents || [];
  const doc = {
    name: name.trim(),
    url: url.trim(),
    uploaded_at: new Date().toISOString().split('T')[0]
  };
  project.documents.push(doc);
  saveStore(store);

  res.status(201).json({ success: true, message: 'Document attached successfully.', document: doc });
});

// =========================================================================
// 2. INTERNSHIP MANAGEMENT
// =========================================================================

// List Internships
router.get('/internships', authenticateToken, (req, res) => {
  const store = getStore();
  const user = req.user;
  let list = store.internships || [];

  if (user.role === 'student') {
    list = list.filter(i => i.student_id === user.id);
  } else {
    const { status, department, search } = req.query;
    if (status && status !== 'ALL') {
      list = list.filter(i => (i.status || '').toLowerCase() === status.toLowerCase());
    }
    if (department && department !== 'ALL') {
      list = list.filter(i => (i.department || '').toLowerCase() === department.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(i =>
        (i.student_name || '').toLowerCase().includes(q) ||
        (i.company || '').toLowerCase().includes(q) ||
        (i.role || '').toLowerCase().includes(q)
      );
    }
  }

  res.json({ success: true, total: list.length, internships: list });
});

// Submit Internship (Student)
router.post('/internships', authenticateToken, (req, res) => {
  const store = getStore();
  const user = req.user;
  const {
    company,
    role,
    internship_type,
    mode,
    start_date,
    end_date,
    stipend_amount,
    offer_letter_url,
    completion_cert_url,
    description
  } = req.body;

  if (!company || !role || !start_date || !end_date) {
    return res.status(400).json({ success: false, message: 'Company, role, start date and end date are required.' });
  }

  store.internships = store.internships || [];

  const newInternship = {
    id: store.internships.length > 0 ? Math.max(...store.internships.map(i => i.id)) + 1 : 1,
    student_id: user.id,
    student_name: user.name,
    roll_no: user.roll_no || `23RVSCSE${String(user.id).padStart(3, '0')}`,
    department: user.department || 'CSE',
    company: company.trim(),
    role: role.trim(),
    internship_type: internship_type || 'Industrial Training',
    mode: mode || 'In-Office',
    start_date,
    end_date,
    stipend_amount: stipend_amount ? stipend_amount.trim() : 'Unpaid / Credit Basis',
    description: description ? description.trim() : '',
    offer_letter_url: offer_letter_url || '/uploads/internships/sample_offer.pdf',
    completion_cert_url: completion_cert_url || null,
    status: 'SUBMITTED',
    verification_history: [
      {
        verified_by: user.name,
        role: user.role,
        date: new Date().toISOString().split('T')[0],
        action: 'SUBMITTED',
        remarks: 'Application submitted for departmental verification.'
      }
    ],
    created_at: new Date().toISOString().split('T')[0]
  };

  store.internships.unshift(newInternship);
  saveStore(store);

  res.status(201).json({
    success: true,
    message: 'Internship record submitted for faculty / T&P verification.',
    internship: newInternship
  });
});

// Verify Internship (Faculty / Placement / Admin)
router.post('/internships/:id/verify', authenticateToken, requireRole('super_admin', 'college_admin', 'faculty'), (req, res) => {
  const store = getStore();
  const internshipId = Number(req.params.id);
  const { action, remarks } = req.body;

  if (!action) return res.status(400).json({ success: false, message: 'Action (APPROVED/REJECTED/UNDER REVIEW) is required.' });

  store.internships = store.internships || [];
  const internship = store.internships.find(i => i.id === internshipId);
  if (!internship) return res.status(404).json({ success: false, message: 'Internship not found.' });

  internship.status = action;
  internship.verification_history = internship.verification_history || [];
  internship.verification_history.push({
    verified_by: req.user.name,
    role: req.user.role,
    date: new Date().toISOString().split('T')[0],
    action,
    remarks: remarks ? remarks.trim() : `Internship status transitioned to ${action}.`
  });

  saveStore(store);

  res.json({
    success: true,
    message: `Internship successfully marked as ${action}.`,
    internship
  });
});

// =========================================================================
// 3. TRAINING MANAGEMENT (Placement & Career Readiness)
// =========================================================================

// List Trainings
router.get('/trainings', authenticateToken, (req, res) => {
  const store = getStore();
  const user = req.user;
  const list = store.trainings || [];

  const enriched = list.map(tr => {
    const isRegistered = (tr.registered_students || []).some(s => s.student_id === user.id);
    const myReg = (tr.registered_students || []).find(s => s.student_id === user.id);
    return {
      ...tr,
      registered_count: (tr.registered_students || []).length,
      is_user_registered: isRegistered,
      attended: myReg?.attended || false
    };
  });

  res.json({ success: true, total: enriched.length, trainings: enriched });
});

// Create Training Session (Admin / Placement)
router.post('/trainings', authenticateToken, requireRole('super_admin', 'college_admin', 'faculty'), (req, res) => {
  const store = getStore();
  const { title, training_type, trainer_name, venue, date, time, departments = [], eligible_semesters = [], capacity = 100, description } = req.body;

  if (!title || !trainer_name || !date) {
    return res.status(400).json({ success: false, message: 'Title, trainer and date are required.' });
  }

  store.trainings = store.trainings || [];

  const newTraining = {
    id: store.trainings.length > 0 ? Math.max(...store.trainings.map(t => t.id)) + 1 : 1,
    title: title.trim(),
    training_type: training_type || 'Technical',
    trainer_name: trainer_name.trim(),
    venue: venue ? venue.trim() : 'Auditorium Block A',
    date,
    time: time || '10:00 AM - 01:00 PM',
    departments: Array.isArray(departments) ? departments : ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE'],
    eligible_semesters: Array.isArray(eligible_semesters) ? eligible_semesters : ['6th Semester', '8th Semester'],
    capacity: Number(capacity) || 100,
    registered_students: [],
    status: 'Upcoming',
    description: description ? description.trim() : ''
  };

  store.trainings.unshift(newTraining);
  saveStore(store);

  res.status(201).json({
    success: true,
    message: 'Training session created successfully.',
    training: newTraining
  });
});

// Student Register for Training
router.post('/trainings/:id/register', authenticateToken, (req, res) => {
  const store = getStore();
  const trainingId = Number(req.params.id);
  const user = req.user;

  store.trainings = store.trainings || [];
  const training = store.trainings.find(t => t.id === trainingId);
  if (!training) return res.status(404).json({ success: false, message: 'Training session not found.' });

  training.registered_students = training.registered_students || [];

  if (training.registered_students.some(s => s.student_id === user.id)) {
    return res.status(400).json({ success: false, message: 'You are already registered for this training session.' });
  }

  if (training.registered_students.length >= training.capacity) {
    return res.status(400).json({ success: false, message: 'Training session has reached maximum capacity.' });
  }

  const regEntry = {
    student_id: user.id,
    name: user.name,
    roll_no: user.roll_no || `23RVSCSE${String(user.id).padStart(3, '0')}`,
    registered_at: new Date().toISOString().split('T')[0],
    attended: false
  };

  training.registered_students.push(regEntry);
  saveStore(store);

  res.json({
    success: true,
    message: `Registered successfully for "${training.title}".`,
    registration: regEntry
  });
});

// Mark Training Attendance (Admin / Faculty)
router.post('/trainings/:id/attendance', authenticateToken, requireRole('super_admin', 'college_admin', 'faculty'), (req, res) => {
  const store = getStore();
  const trainingId = Number(req.params.id);
  const { student_id, attended } = req.body;

  store.trainings = store.trainings || [];
  const training = store.trainings.find(t => t.id === trainingId);
  if (!training) return res.status(404).json({ success: false, message: 'Training session not found.' });

  training.registered_students = training.registered_students || [];
  const student = training.registered_students.find(s => s.student_id === Number(student_id));
  if (!student) return res.status(404).json({ success: false, message: 'Student is not registered for this training.' });

  student.attended = Boolean(attended);
  saveStore(store);

  res.json({
    success: true,
    message: `Attendance updated for ${student.name}.`,
    training
  });
});

module.exports = router;
