const express = require('express');
const router = express.Router();
const { getStore, saveStore } = require('../config/db');
const { authenticateToken, requireRole } = require('../middlewares/auth');

// =========================================================================
// 1. PLACEMENT ELIGIBILITY ENGINE
// =========================================================================

// Helper: Evaluate student against drive criteria
function evaluateDriveEligibility(user, profile, store, criteria) {
  const reasons = [];

  // 1. Department check
  const allowedDepts = criteria.allowed_departments || ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL'];
  if (!allowedDepts.includes(profile.department_code)) {
    reasons.push(`Department not eligible (${profile.department_code} not in [${allowedDepts.join(', ')}])`);
  }

  // 2. CGPA check
  const examResults = (store.exam_results || []).filter(r => r.student_id === user.id || r.roll_no === profile.roll_no);
  const sgpas = examResults.map(r => Number(r.sgpa || 0)).filter(s => s > 0);
  const studentCgpa = sgpas.length > 0 ? Number((sgpas.reduce((a, b) => a + b, 0) / sgpas.length).toFixed(2)) : 8.54;
  const minCgpa = Number(criteria.min_cgpa || 6.0);
  if (studentCgpa < minCgpa) {
    reasons.push(`CGPA below requirement (${studentCgpa} < ${minCgpa})`);
  }

  // 3. Active Backlogs check
  const studentBacklogs = (store.backlogs || []).filter(b => b.student_id === user.id || b.roll_no === profile.roll_no);
  const activeBacklogs = studentBacklogs.filter(b => b.status === 'Pending').length;
  const maxBacklogs = Number(criteria.max_active_backlogs !== undefined ? criteria.max_active_backlogs : 0);
  if (activeBacklogs > maxBacklogs) {
    reasons.push(`Active backlogs exceed limit (${activeBacklogs} active > ${maxBacklogs} allowed)`);
  }

  // 4. Attendance check
  const minAtt = Number(criteria.min_attendance || 75);
  const stuAtt = (store.attendance_records || []).filter(r => r.student_id === user.id || r.roll_no === profile.roll_no);
  const total = stuAtt.length;
  const present = stuAtt.filter(r => r.status === 'Present' || r.status === 'Late').length;
  const attPct = total > 0 ? Number(((present / total) * 100).toFixed(1)) : 85.0;
  if (attPct < minAtt) {
    reasons.push(`Attendance below requirement (${attPct}% < ${minAtt}%)`);
  }

  return {
    is_eligible: reasons.length === 0,
    reasons,
    metrics: {
      cgpa: studentCgpa,
      activeBacklogs,
      attendancePct: attPct,
      department: profile.department_code
    }
  };
}

// GET /api/rvs/placements/drives - List all drives
router.get('/placements/drives', authenticateToken, (req, res) => {
  const store = getStore();
  res.json({ success: true, drives: store.placement_drives || [] });
});

// POST /api/rvs/placements/drives - Admin creates new drive with criteria
router.post('/placements/drives', authenticateToken, requireRole('super_admin', 'college_admin'), (req, res) => {
  const store = getStore();
  const {
    company_name,
    job_role,
    package: cPackage,
    drive_date,
    venue,
    min_cgpa = 6.5,
    max_active_backlogs = 0,
    min_attendance = 75,
    allowed_departments = ['CSE', 'ECE'],
    passing_year = 2027
  } = req.body;

  if (!company_name || !job_role) {
    return res.status(400).json({ success: false, message: 'Company name and job role are required.' });
  }

  store.placement_drives = store.placement_drives || [];
  const newDrive = {
    id: store.placement_drives.length > 0 ? Math.max(...store.placement_drives.map(d => d.id)) + 1 : 1,
    company_name,
    job_role,
    package: cPackage || 'Competitive Salary',
    drive_date: drive_date || '2026-05-10',
    venue: venue || 'RVSCET Main Auditorium',
    criteria: {
      min_cgpa: Number(min_cgpa),
      max_active_backlogs: Number(max_active_backlogs),
      min_attendance: Number(min_attendance),
      allowed_departments: Array.isArray(allowed_departments) ? allowed_departments : [allowed_departments],
      passing_year: Number(passing_year)
    },
    status: 'Active Registration',
    registered_students: [],
    created_at: new Date().toISOString(),
    created_by: req.user.name
  };

  store.placement_drives.push(newDrive);
  saveStore();

  res.status(201).json({ success: true, message: `Placement drive for ${company_name} created.`, drive: newDrive });
});

// GET /api/rvs/placements/drives/:id/evaluation - Admin evaluates all students for a drive
router.get('/placements/drives/:id/evaluation', authenticateToken, requireRole('super_admin', 'college_admin', 'faculty'), (req, res) => {
  const store = getStore();
  const driveId = Number(req.params.id);
  const drive = (store.placement_drives || []).find(d => d.id === driveId);

  if (!drive) {
    return res.status(404).json({ success: false, message: 'Placement drive not found.' });
  }

  const users = store.users || [];
  const profiles = store.students_profile || [];

  const evaluationRoster = profiles.map(prof => {
    const u = users.find(usr => usr.id === prof.user_id) || {};
    const evalResult = evaluateDriveEligibility(u, prof, store, drive.criteria);
    const hasApplied = (drive.registered_students || []).includes(prof.user_id);

    return {
      student_id: prof.user_id,
      name: u.name || prof.student_name,
      roll_no: prof.roll_no,
      department_code: prof.department_code,
      semester: prof.semester,
      batch: prof.batch,
      has_applied: hasApplied,
      ...evalResult
    };
  });

  res.json({
    success: true,
    drive: {
      id: drive.id,
      company: drive.company_name,
      role: drive.job_role,
      criteria: drive.criteria
    },
    summary: {
      total_students: evaluationRoster.length,
      eligible_count: evaluationRoster.filter(e => e.is_eligible).length,
      not_eligible_count: evaluationRoster.filter(e => !e.is_eligible).length,
      applied_count: evaluationRoster.filter(e => e.has_applied).length
    },
    students: evaluationRoster
  });
});

// GET /api/rvs/placements/student/my-eligibility - Student gets personalized eligibility across all drives
router.get('/placements/student/my-eligibility', authenticateToken, (req, res) => {
  const store = getStore();
  const userId = req.user.id;
  const user = (store.users || []).find(u => u.id === userId);
  const profile = (store.students_profile || []).find(p => p.user_id === userId);

  if (!profile) {
    return res.status(404).json({ success: false, message: 'Student profile not found.' });
  }

  const evaluatedDrives = (store.placement_drives || []).map(drive => {
    const evalResult = evaluateDriveEligibility(user, profile, store, drive.criteria);
    const hasApplied = (drive.registered_students || []).includes(userId);
    return {
      drive_id: drive.id,
      company_name: drive.company_name,
      job_role: drive.job_role,
      package: drive.package,
      drive_date: drive.drive_date,
      venue: drive.venue,
      criteria: drive.criteria,
      is_eligible: evalResult.is_eligible,
      reasons: evalResult.reasons,
      my_metrics: evalResult.metrics,
      has_applied: hasApplied,
      status: hasApplied ? 'Applied / Registered' : (evalResult.is_eligible ? 'Eligible to Apply' : 'Ineligible')
    };
  });

  res.json({ success: true, drives: evaluatedDrives });
});

// POST /api/rvs/placements/drives/:id/apply - Student applies for a drive
router.post('/placements/drives/:id/apply', authenticateToken, (req, res) => {
  const store = getStore();
  const driveId = Number(req.params.id);
  const drive = (store.placement_drives || []).find(d => d.id === driveId);

  if (!drive) {
    return res.status(404).json({ success: false, message: 'Placement drive not found.' });
  }

  const userId = req.user.id;
  const user = (store.users || []).find(u => u.id === userId);
  const profile = (store.students_profile || []).find(p => p.user_id === userId);

  if (!profile) {
    return res.status(404).json({ success: false, message: 'Student profile not found.' });
  }

  // Validate eligibility
  const evalResult = evaluateDriveEligibility(user, profile, store, drive.criteria);
  if (!evalResult.is_eligible) {
    return res.status(403).json({
      success: false,
      message: 'Application rejected: You do not meet the minimum eligibility criteria for this recruitment drive.',
      reasons: evalResult.reasons
    });
  }

  drive.registered_students = drive.registered_students || [];
  if (drive.registered_students.includes(userId)) {
    return res.status(409).json({ success: false, message: 'You have already applied for this placement drive.' });
  }

  drive.registered_students.push(userId);
  saveStore();

  res.json({
    success: true,
    message: `Application submitted successfully for ${drive.company_name} - ${drive.job_role}.`,
    driveId
  });
});

// =========================================================================
// 2. STUDENT DOCUMENT VERIFICATION SYSTEM
// =========================================================================

// GET /api/rvs/documents - List documents for admin verification
router.get('/documents', authenticateToken, (req, res) => {
  const store = getStore();
  const { status, doc_type, department, search } = req.query;
  let list = store.student_documents || [];

  if (status && status !== 'all') {
    list = list.filter(d => (d.status || '').toUpperCase() === status.toUpperCase());
  }
  if (doc_type && doc_type !== 'all') {
    list = list.filter(d => (d.doc_type || '').toLowerCase() === doc_type.toLowerCase());
  }
  if (department && department !== 'all') {
    list = list.filter(d => d.department_code === department);
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(d =>
      (d.student_name || '').toLowerCase().includes(q) ||
      (d.roll_no || '').toLowerCase().includes(q) ||
      (d.file_name || '').toLowerCase().includes(q) ||
      (d.doc_type || '').toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    summary: {
      total: (store.student_documents || []).length,
      verified: (store.student_documents || []).filter(d => d.status === 'VERIFIED').length,
      pending: (store.student_documents || []).filter(d => d.status === 'PENDING').length,
      rejected: (store.student_documents || []).filter(d => d.status === 'REJECTED').length
    },
    documents: list
  });
});

// GET /api/rvs/documents/student/:id - Student or admin views documents for one student
router.get('/documents/student/:id', authenticateToken, (req, res) => {
  const store = getStore();
  const targetId = Number(req.params.id);

  if (req.user.role === 'student' && req.user.id !== targetId) {
    return res.status(403).json({ success: false, message: 'Unauthorized. You can only view your own documents.' });
  }

  const list = (store.student_documents || []).filter(d => d.student_id === targetId);
  res.json({ success: true, documents: list });
});

// POST /api/rvs/documents/:id/verify - Admin verifies document
router.post('/documents/:id/verify', authenticateToken, requireRole('super_admin', 'college_admin'), (req, res) => {
  const store = getStore();
  const docId = Number(req.params.id);
  const { remarks } = req.body;

  store.student_documents = store.student_documents || [];
  const doc = store.student_documents.find(d => d.id === docId);

  if (!doc) {
    return res.status(404).json({ success: false, message: 'Document record not found.' });
  }

  doc.status = 'VERIFIED';
  doc.verified_by = req.user.name;
  doc.verified_at = new Date().toISOString();
  doc.remarks = remarks || 'Document verified against original credentials presented.';

  saveStore();
  res.json({ success: true, message: `Document "${doc.doc_type}" verified successfully.`, document: doc });
});

// POST /api/rvs/documents/:id/reject - Admin rejects document with remarks
router.post('/documents/:id/reject', authenticateToken, requireRole('super_admin', 'college_admin'), (req, res) => {
  const store = getStore();
  const docId = Number(req.params.id);
  const { remarks } = req.body;

  if (!remarks || !remarks.trim()) {
    return res.status(400).json({ success: false, message: 'Rejection remarks are required explaining the deficiency.' });
  }

  store.student_documents = store.student_documents || [];
  const doc = store.student_documents.find(d => d.id === docId);

  if (!doc) {
    return res.status(404).json({ success: false, message: 'Document record not found.' });
  }

  doc.status = 'REJECTED';
  doc.verified_by = req.user.name;
  doc.verified_at = new Date().toISOString();
  doc.remarks = remarks.trim();

  saveStore();
  res.json({ success: true, message: `Document "${doc.doc_type}" rejected. Remarks recorded.`, document: doc });
});

module.exports = router;
