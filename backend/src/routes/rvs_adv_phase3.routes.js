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
// 1. SCHOLARSHIP MANAGEMENT
// =========================================================================

// List Scholarship Schemes
router.get('/scholarships/schemes', authenticateToken, (req, res) => {
  const store = getStore();
  res.json({ success: true, schemes: store.scholarship_schemes || [] });
});

// Admin Add Scheme
router.post('/scholarships/schemes', authenticateToken, requireRole('super_admin', 'college_admin'), (req, res) => {
  const store = getStore();
  const { name, eligibility_criteria, amount_description, deadline, required_documents = [] } = req.body;

  if (!name || !eligibility_criteria) {
    return res.status(400).json({ success: false, message: 'Scholarship name and eligibility criteria required.' });
  }

  store.scholarship_schemes = store.scholarship_schemes || [];
  const currentSession = (store.academic_sessions || []).find(s => s.is_current)?.session_code || '2025-26';

  const newScheme = {
    id: store.scholarship_schemes.length > 0 ? Math.max(...store.scholarship_schemes.map(s => s.id)) + 1 : 1,
    name: name.trim(),
    academic_session: currentSession,
    eligibility_criteria: eligibility_criteria.trim(),
    amount_description: amount_description ? amount_description.trim() : 'Tuition fee concession as applicable',
    deadline: deadline || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    required_documents: Array.isArray(required_documents) ? required_documents : ['Semester Marksheet', 'Income Proof'],
    status: 'Active',
    created_at: new Date().toISOString().split('T')[0]
  };

  store.scholarship_schemes.unshift(newScheme);
  saveStore(store);

  res.status(201).json({ success: true, message: 'Scholarship scheme published.', scheme: newScheme });
});

// List Applications
router.get('/scholarships/applications', authenticateToken, (req, res) => {
  const store = getStore();
  const user = req.user;
  let apps = store.scholarship_applications || [];

  if (user.role === 'student') {
    apps = apps.filter(a => a.student_id === user.id);
  } else {
    const { status, scheme_id } = req.query;
    if (status && status !== 'ALL') {
      apps = apps.filter(a => a.status === status);
    }
    if (scheme_id) {
      apps = apps.filter(a => a.scheme_id === Number(scheme_id));
    }
  }

  res.json({ success: true, total: apps.length, applications: apps });
});

// Student Apply for Scholarship
router.post('/scholarships/apply', authenticateToken, (req, res) => {
  const store = getStore();
  const user = req.user;
  const { scheme_id, documents_submitted = [] } = req.body;

  store.scholarship_schemes = store.scholarship_schemes || [];
  const scheme = store.scholarship_schemes.find(s => s.id === Number(scheme_id));
  if (!scheme) return res.status(404).json({ success: false, message: 'Scholarship scheme not found.' });

  store.scholarship_applications = store.scholarship_applications || [];

  // Check if student already applied for this scheme
  const existing = store.scholarship_applications.find(a => a.student_id === user.id && a.scheme_id === Number(scheme_id));
  if (existing) {
    return res.status(400).json({ success: false, message: 'You have already submitted an application for this scholarship scheme.' });
  }

  const newApp = {
    id: store.scholarship_applications.length > 0 ? Math.max(...store.scholarship_applications.map(a => a.id)) + 1 : 1,
    scheme_id: scheme.id,
    scheme_name: scheme.name,
    student_id: user.id,
    student_name: user.name,
    roll_no: user.roll_no || `23RVSCSE${String(user.id).padStart(3, '0')}`,
    department: user.department || 'CSE',
    academic_session: scheme.academic_session,
    cgpa: 8.4,
    attendance_pct: 86,
    status: 'SUBMITTED',
    remarks: 'Application submitted for institutional verification.',
    documents_submitted: documents_submitted.length > 0 ? documents_submitted : [{ name: 'Academic_Grade_Card.pdf', url: '/uploads/docs/grade_card.pdf' }],
    applied_at: new Date().toISOString().split('T')[0],
    updated_at: new Date().toISOString().split('T')[0]
  };

  store.scholarship_applications.unshift(newApp);
  saveStore(store);

  res.status(201).json({ success: true, message: 'Scholarship application submitted successfully.', application: newApp });
});

// Update Application Status (Admin / Faculty)
router.post('/scholarships/applications/:id/status', authenticateToken, requireRole('super_admin', 'college_admin', 'faculty'), (req, res) => {
  const store = getStore();
  const appId = Number(req.params.id);
  const { status, remarks } = req.body;

  store.scholarship_applications = store.scholarship_applications || [];
  const app = store.scholarship_applications.find(a => a.id === appId);
  if (!app) return res.status(404).json({ success: false, message: 'Scholarship application not found.' });

  app.status = status;
  if (remarks) app.remarks = remarks.trim();
  app.updated_at = new Date().toISOString().split('T')[0];

  saveStore(store);

  res.json({ success: true, message: `Application status updated to ${status}.`, application: app });
});

// =========================================================================
// 2. NO-DUES CLEARANCE SYSTEM
// =========================================================================

// List No-Dues Requests
router.get('/no-dues', authenticateToken, (req, res) => {
  const store = getStore();
  const user = req.user;
  let requests = store.no_dues_requests || [];

  if (user.role === 'student') {
    requests = requests.filter(r => r.student_id === user.id);
  }

  res.json({ success: true, total: requests.length, requests });
});

// Student Request No-Dues Clearance
router.post('/no-dues/request', authenticateToken, (req, res) => {
  const store = getStore();
  const user = req.user;
  const { purpose } = req.body;

  store.no_dues_requests = store.no_dues_requests || [];

  // Check if student has pending or active request
  const existingActive = store.no_dues_requests.find(r => r.student_id === user.id && r.overall_status !== 'CLEARED');
  if (existingActive) {
    return res.status(400).json({ success: false, message: 'You already have an active No-Dues clearance request in progress.' });
  }

  const currentSession = (store.academic_sessions || []).find(s => s.is_current)?.session_code || '2025-26';

  const defaultUnits = [
    { name: 'Accounts / Finance', status: 'PENDING', remarks: 'Tuition and examination fees audit pending', cleared_by: null, updated_at: null },
    { name: 'Central Library', status: 'PENDING', remarks: 'Book return & dues verification pending', cleared_by: null, updated_at: null },
    { name: 'Department / Lab', status: 'PENDING', remarks: 'Departmental lab equipment & project clearance', cleared_by: null, updated_at: null },
    { name: 'Hostel Administration', status: 'PENDING', remarks: 'Mess and room clearance', cleared_by: null, updated_at: null },
    { name: 'Transport Division', status: 'PENDING', remarks: 'Bus pass return and clearance', cleared_by: null, updated_at: null },
    { name: 'Training & Placement', status: 'PENDING', remarks: 'Placement survey & internship documents', cleared_by: null, updated_at: null }
  ];

  const newRequest = {
    id: store.no_dues_requests.length > 0 ? Math.max(...store.no_dues_requests.map(r => r.id)) + 1 : 1,
    student_id: user.id,
    student_name: user.name,
    roll_no: user.roll_no || `23RVSCSE${String(user.id).padStart(3, '0')}`,
    department: user.department || 'CSE',
    academic_session: currentSession,
    program: 'B.Tech Computer Science & Engineering',
    purpose: purpose ? purpose.trim() : 'Semester Clearance / Final Examination',
    requested_at: new Date().toISOString().split('T')[0],
    overall_status: 'PENDING',
    completed_at: null,
    certificate_no: null,
    units: defaultUnits
  };

  store.no_dues_requests.unshift(newRequest);
  saveStore(store);

  res.status(201).json({ success: true, message: 'No-Dues clearance application submitted.', request: newRequest });
});

// Clearance Unit Officer updates unit status
router.post('/no-dues/:id/unit-clearance', authenticateToken, requireRole('super_admin', 'college_admin', 'faculty'), (req, res) => {
  const store = getStore();
  const reqId = Number(req.params.id);
  const { unit_name, status, remarks } = req.body;

  store.no_dues_requests = store.no_dues_requests || [];
  const clearanceReq = store.no_dues_requests.find(r => r.id === reqId);
  if (!clearanceReq) return res.status(404).json({ success: false, message: 'No-Dues request not found.' });

  const targetUnit = (clearanceReq.units || []).find(u => u.name.toLowerCase() === (unit_name || '').toLowerCase());
  if (!targetUnit) return res.status(404).json({ success: false, message: 'Clearance department unit not found.' });

  targetUnit.status = status; // CLEARED, HOLD, PENDING
  targetUnit.remarks = remarks ? remarks.trim() : `Status marked as ${status}`;
  targetUnit.cleared_by = req.user.name;
  targetUnit.updated_at = new Date().toISOString().split('T')[0];

  // Recalculate overall status
  const anyHold = clearanceReq.units.some(u => u.status === 'HOLD');
  const allCleared = clearanceReq.units.every(u => u.status === 'CLEARED');

  if (allCleared) {
    clearanceReq.overall_status = 'CLEARED';
    clearanceReq.completed_at = new Date().toISOString().split('T')[0];
    clearanceReq.certificate_no = `RVS-NODUES-${new Date().getFullYear()}-${String(clearanceReq.id).padStart(3, '0')}`;
  } else if (anyHold) {
    clearanceReq.overall_status = 'HOLD';
  } else {
    clearanceReq.overall_status = 'PENDING';
  }

  saveStore(store);

  res.json({
    success: true,
    message: `Unit "${unit_name}" updated to ${status}. Overall status: ${clearanceReq.overall_status}.`,
    request: clearanceReq
  });
});

// =========================================================================
// 3. SEMESTER REGISTRATION
// =========================================================================

// Windows list
router.get('/semester-registration/windows', authenticateToken, (req, res) => {
  const store = getStore();
  res.json({ success: true, windows: store.semester_registration_windows || [] });
});

// Student Semester Registration status
router.get('/semester-registration/my-status', authenticateToken, (req, res) => {
  const store = getStore();
  const user = req.user;
  const regs = store.semester_registrations || [];
  const myReg = regs.find(r => r.student_id === user.id) || null;
  const activeWindow = (store.semester_registration_windows || []).find(w => w.status === 'OPEN') || null;

  res.json({
    success: true,
    has_registered: !!myReg,
    active_window: activeWindow,
    registration: myReg
  });
});

// Student Register for Semester
router.post('/semester-registration/register', authenticateToken, (req, res) => {
  const store = getStore();
  const user = req.user;
  const { window_id, selected_electives = [] } = req.body;

  store.semester_registration_windows = store.semester_registration_windows || [];
  const win = store.semester_registration_windows.find(w => w.id === Number(window_id));
  if (!win || win.status !== 'OPEN') {
    return res.status(400).json({ success: false, message: 'Semester registration window is currently closed.' });
  }

  store.semester_registrations = store.semester_registrations || [];
  const existing = store.semester_registrations.find(r => r.student_id === user.id && r.registered_semester === win.semester);
  if (existing) {
    return res.status(400).json({ success: false, message: 'You have already completed semester registration.' });
  }

  const newReg = {
    id: store.semester_registrations.length > 0 ? Math.max(...store.semester_registrations.map(r => r.id)) + 1 : 1,
    window_id: win.id,
    student_id: user.id,
    student_name: user.name,
    roll_no: user.roll_no || `23RVSCSE${String(user.id).padStart(3, '0')}`,
    department: user.department || 'CSE',
    academic_session: win.academic_session,
    registered_semester: win.semester,
    core_subjects: win.required_core_subjects.map(s => s.code),
    selected_electives,
    status: 'SUBMITTED',
    registered_at: new Date().toISOString().split('T')[0],
    approved_by: null,
    remarks: 'Semester enrollment submitted. Awaiting HOD academic clearance.'
  };

  store.semester_registrations.unshift(newReg);
  saveStore(store);

  res.status(201).json({ success: true, message: `Successfully registered for ${win.semester}!`, registration: newReg });
});

// Admin / HOD approve registration
router.post('/semester-registration/:id/approve', authenticateToken, requireRole('super_admin', 'college_admin', 'faculty'), (req, res) => {
  const store = getStore();
  const regId = Number(req.params.id);
  const { status, remarks } = req.body;

  store.semester_registrations = store.semester_registrations || [];
  const reg = store.semester_registrations.find(r => r.id === regId);
  if (!reg) return res.status(404).json({ success: false, message: 'Registration record not found.' });

  reg.status = status || 'APPROVED';
  reg.approved_by = req.user.name;
  if (remarks) reg.remarks = remarks.trim();

  saveStore(store);

  res.json({ success: true, message: `Registration ${reg.status}.`, registration: reg });
});

// =========================================================================
// 4. ELECTIVE SUBJECT SELECTION
// =========================================================================

// List Elective Groups
router.get('/electives/groups', authenticateToken, (req, res) => {
  const store = getStore();
  res.json({ success: true, groups: store.elective_groups || [] });
});

// Student Selects Elective
router.post('/electives/select', authenticateToken, (req, res) => {
  const store = getStore();
  const user = req.user;
  const { group_id, subject_code } = req.body;

  store.elective_groups = store.elective_groups || [];
  const group = store.elective_groups.find(g => g.id === Number(group_id));
  if (!group) return res.status(404).json({ success: false, message: 'Elective group not found.' });

  const subject = (group.subjects || []).find(s => s.code === subject_code);
  if (!subject) return res.status(404).json({ success: false, message: 'Subject not found in this elective group.' });

  if (subject.enrolled_count >= subject.capacity) {
    return res.status(400).json({ success: false, message: `Seat limit reached for "${subject.name}" (${subject.enrolled_count}/${subject.capacity}). Please choose another elective.` });
  }

  subject.enrolled_count++;
  saveStore(store);

  res.json({
    success: true,
    message: `Elective "${subject.name}" selected successfully. Seats remaining: ${subject.capacity - subject.enrolled_count}.`,
    subject
  });
});

module.exports = router;
