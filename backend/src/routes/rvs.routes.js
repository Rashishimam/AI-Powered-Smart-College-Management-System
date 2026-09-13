const express = require('express');
const router = express.Router();
const { getStore, saveStore } = require('../config/db');
const { authenticateToken, requireRole } = require('../middlewares/auth');
const rvsConfig = require('../config/rvsConfig');

// ==========================================
// 0. OFFICIAL PUBLIC RVS COLLEGE INFO & PROGRAMS
// ==========================================
router.get('/public-info', (req, res) => {
  const store = getStore();
  const college = (store.colleges || []).find(c => c.id === 1) || {};
  res.json({
    success: true,
    data_source: 'OFFICIAL PUBLIC DATA (rvscollege.ac.in)',
    college: {
      name: college.name || rvsConfig.collegeName,
      shortName: college.short_name || rvsConfig.shortName,
      code: college.code || 'RVSCET-JSR',
      campus: college.city || 'Jamshedpur',
      state: college.state || 'Jharkhand',
      address: college.address || rvsConfig.address,
      phone: college.phone || rvsConfig.phone,
      placementPhone: college.placement_phone || rvsConfig.placementPhone,
      email: college.email || rvsConfig.email,
      alternateEmail: college.alternate_email || rvsConfig.alternateEmail,
      website: college.website || rvsConfig.website,
      affiliation: college.affiliation || rvsConfig.affiliation,
      accreditation: college.accreditation || rvsConfig.accreditation,
      logoUrl: rvsConfig.logoUrl,
      leadership: rvsConfig.leadership,
      placementHeadlineStats: rvsConfig.placementHeadlineStats
    }
  });
});

// GET /api/rvs/programs (Configurable duration, semester count, intake seats)
router.get('/programs', (req, res) => {
  const store = getStore();
  res.json({
    success: true,
    data_source: 'OFFICIAL PUBLIC DATA (rvscollege.ac.in)',
    programs: store.programs || []
  });
});

// POST /api/rvs/programs (Admin creates a new program)
router.post('/programs', authenticateToken, requireRole('super_admin', 'college_admin'), (req, res) => {
  const store = getStore();
  const { code, name, degree, department_code, duration_years = 4, semester_count = 8, intake_seats = 60, eligibility } = req.body;
  
  if (!code || !name) {
    return res.status(400).json({ success: false, message: 'Program code and name are required.' });
  }

  const upperCode = code.trim().toUpperCase();
  if ((store.programs || []).some(p => p.code === upperCode)) {
    return res.status(409).json({ success: false, message: `Program ${upperCode} already exists.` });
  }

  const newProg = {
    id: store.programs.length > 0 ? Math.max(...store.programs.map(p => p.id)) + 1 : 1,
    code: upperCode,
    name: name.trim(),
    degree: degree || 'B.Tech (UG)',
    department_code: department_code || 'CSE',
    duration_years: Number(duration_years),
    semester_count: Number(semester_count),
    intake_seats: Number(intake_seats),
    eligibility: eligibility || '10+2 with PCM',
    is_active: true,
    is_official: true,
    data_source: 'INTERNAL DATABASE DATA',
    created_at: new Date().toISOString()
  };

  store.programs = store.programs || [];
  store.programs.push(newProg);
  saveStore();

  res.status(201).json({ success: true, message: 'Website CMS content updated and published successfully!', content: store.website_cms });
});

// GET /api/rvs/departments/:id (Admin configures intake seats, duration, semester count)
router.put('/programs/:id', authenticateToken, requireRole('super_admin', 'college_admin'), (req, res) => {
  const store = getStore();
  const progId = Number(req.params.id);
  const prog = (store.programs || []).find(p => p.id === progId);

  if (!prog) {
    return res.status(404).json({ success: false, message: 'Program not found.' });
  }

  const { duration_years, semester_count, intake_seats, eligibility, is_active } = req.body;

  if (duration_years !== undefined) prog.duration_years = Number(duration_years);
  if (semester_count !== undefined) prog.semester_count = Number(semester_count);
  if (intake_seats !== undefined) prog.intake_seats = Number(intake_seats);
  if (eligibility !== undefined) prog.eligibility = eligibility.trim();
  if (is_active !== undefined) prog.is_active = Boolean(is_active);

  prog.updated_at = new Date().toISOString();
  saveStore();

  res.json({
    success: true,
    message: `Configuration for ${prog.name} updated successfully. Intake seats: ${prog.intake_seats}.`,
    program: prog
  });
});

// GET /api/rvs/faculty/verified (Verified official faculty from rvscollege.ac.in)
router.get('/faculty/verified', (req, res) => {
  const store = getStore();
  res.json({
    success: true,
    data_source: 'OFFICIAL PUBLIC DATA (rvscollege.ac.in)',
    faculty: store.verified_faculty || []
  });
});

// ==========================================
// 1. DEPARTMENTS MODULE (CSE, CE, ME, ECE, EEE, MCA)
// ==========================================
router.get('/departments', authenticateToken, (req, res) => {
  const store = getStore();
  res.json({ success: true, departments: store.departments || [] });
});


router.post('/departments', authenticateToken, requireRole('super_admin', 'college_admin'), (req, res) => {
  const store = getStore();
  const { code, name, intake = 60, hod } = req.body;
  if (!code || !name) {
    return res.status(400).json({ success: false, message: 'Code and Name are required.' });
  }

  const upperCode = code.trim().toUpperCase();
  const existing = store.departments.find(d => d.code === upperCode);
  if (existing) {
    return res.status(409).json({ success: false, message: `Department ${upperCode} already exists.` });
  }

  const newDept = {
    id: store.departments.length > 0 ? Math.max(...store.departments.map(d => d.id)) + 1 : 1,
    code: upperCode,
    name: name.trim(),
    intake: Number(intake),
    hod: hod || null,
    created_at: new Date().toISOString()
  };

  store.departments.push(newDept);
  saveStore();
  res.status(201).json({ success: true, message: 'Department created successfully', department: newDept });
});

// ==========================================
// 2. COMPREHENSIVE STUDENT MANAGEMENT & BULK IMPORT MODULE
// ==========================================

// GET /api/rvs/students/template - Downloadable CSV template headers & format
router.get('/students/template', (req, res) => {
  const headers = [
    'full_name',
    'email',
    'roll_no',
    'reg_no',
    'admission_no',
    'department_code',
    'course',
    'semester',
    'batch',
    'academic_session',
    'admission_year',
    'mobile_number',
    'gender',
    'date_of_birth',
    'address',
    'father_guardian_name',
    'mother_name',
    'guardian_mobile',
    'guardian_email',
    'guardian_address',
    'status'
  ];

  const sampleRows = [
    [
      'Aman Kumar Singh',
      'aman.singh@rvscet.ac.in',
      '23RVSCSE101',
      'JUT/2023/CSE/0501',
      'RVS/ADM/2023/101',
      'CSE',
      'B.Tech Computer Science & Engineering',
      '6th Semester',
      '2023-2027',
      '2025-2026',
      '2023',
      '9876543211',
      'Male',
      '2004-04-12',
      'Bistupur, Jamshedpur, Jharkhand',
      'Rajendra Singh',
      'Meena Devi',
      '9431122334',
      'rajendra.singh@example.com',
      'Bistupur, Jamshedpur, Jharkhand',
      'active'
    ],
    [
      'Pooja Kumari',
      'pooja.kumari@rvscet.ac.in',
      '23RVSCSE102',
      'JUT/2023/CSE/0502',
      'RVS/ADM/2023/102',
      'CSE',
      'B.Tech Computer Science & Engineering',
      '6th Semester',
      '2023-2027',
      '2025-2026',
      '2023',
      '9876543212',
      'Female',
      '2004-09-21',
      'Sakchi, Jamshedpur, Jharkhand',
      'Binod Kumar',
      'Anita Devi',
      '9431188776',
      'binod.kumar@example.com',
      'Sakchi, Jamshedpur, Jharkhand',
      'active'
    ]
  ];

  const csvContent = [headers.join(','), ...sampleRows.map(r => r.map(f => `"${f}"`).join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="RVS_Student_Import_Template.csv"');
  res.send(csvContent);
});

// GET /api/rvs/students (Search, filter, pagination, status separation)
router.get('/students', authenticateToken, (req, res) => {
  const store = getStore();
  const { search, department, course, semester, batch, status = 'all', page = 1, limit = 25 } = req.query;

  // Gather student profiles merged with users table
  const studentUsers = (store.users || []).filter(u => u.role === 'student');
  let list = studentUsers.map(u => {
    const profile = (store.students_profile || []).find(p => p.user_id === u.id) || {};
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone || profile.guardian_phone || 'N/A',
      avatar: u.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      roll_no: profile.roll_no || `23RVSCSE${String(u.id).padStart(3, '0')}`,
      reg_no: profile.reg_no || `JUT/2023/CSE/00${u.id}`,
      admission_no: profile.admission_no || `RVS/ADM/2023/${String(u.id).padStart(3, '0')}`,
      department_code: profile.department_code || 'CSE',
      department: profile.department_name || u.department || 'Computer Science & Engineering',
      course: profile.course || 'B.Tech Computer Science & Engineering',
      semester: profile.semester || '6th Semester',
      batch: profile.batch || '2023-2027',
      session: profile.session || '2025-2026',
      admission_year: profile.admission_year || 2023,
      dob: profile.dob || '2004-05-15',
      gender: profile.gender || 'Male',
      address: profile.address || 'Jamshedpur, Jharkhand, India',
      guardian_name: profile.guardian_name || 'Guardian Details',
      mother_name: profile.mother_name || 'N/A',
      guardian_phone: profile.guardian_phone || '+91 94311 00000',
      guardian_email: profile.guardian_email || 'guardian@example.com',
      guardian_address: profile.guardian_address || profile.address || 'Jamshedpur, Jharkhand, India',
      promotion_history: profile.promotion_history || [],
      is_demo: profile.is_demo !== undefined ? profile.is_demo : true,
      data_source: profile.data_source || 'DEMO',
      status: profile.status || u.status || 'active'
    };
  });

  // Filter by Status (all, active, inactive, graduated, archived)
  if (status && status !== 'all') {
    list = list.filter(s => s.status.toLowerCase() === status.toLowerCase());
  }

  // Filter by Department
  if (department && department !== 'all') {
    list = list.filter(s => s.department_code === department || s.department.toLowerCase().includes(department.toLowerCase()));
  }

  // Filter by Course
  if (course && course !== 'all') {
    list = list.filter(s => s.course.toLowerCase().includes(course.toLowerCase()));
  }

  // Filter by Semester
  if (semester && semester !== 'all') {
    list = list.filter(s => s.semester.toLowerCase() === semester.toLowerCase());
  }

  // Filter by Batch
  if (batch && batch !== 'all') {
    list = list.filter(s => s.batch === batch);
  }

  // Search by Name, Roll No, Reg No, Email, Admission No
  if (search) {
    const q = search.toLowerCase().trim();
    list = list.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.roll_no.toLowerCase().includes(q) ||
      s.reg_no.toLowerCase().includes(q) ||
      (s.admission_no && s.admission_no.toLowerCase().includes(q)) ||
      s.email.toLowerCase().includes(q)
    );
  }

  const total = list.length;
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));
  const totalPages = Math.ceil(total / limitNum) || 1;
  const startIndex = (pageNum - 1) * limitNum;
  const paginatedList = list.slice(startIndex, startIndex + limitNum);

  res.json({
    success: true,
    total,
    count: paginatedList.length,
    page: pageNum,
    totalPages,
    limit: limitNum,
    students: paginatedList
  });
});

// Phase 1 Specialized Routes (Student 360, Backlogs, Internal Marks & Audit)
const phase1Routes = require('./rvs_phase1.routes');
router.use('/', phase1Routes);

// Phase 2 Specialized Routes (Admit Cards, Eligibility & Certificates)
const phase2Routes = require('./rvs_phase2.routes');
router.use('/', phase2Routes);

// Phase 3 Specialized Routes (Placement Eligibility & Document Verification)
const phase3Routes = require('./rvs_phase3.routes');
router.use('/', phase3Routes);

// Phase 4 Specialized Routes (Labs/Inventory, Asset Maintenance & Faculty Substitution)
const phase4Routes = require('./rvs_phase4.routes');
router.use('/', phase4Routes);

// Phase 5 Specialized Routes (Gate Entry/Exit, Visitors, Room/Facility Booking)
const phase5Routes = require('./rvs_phase5.routes');
router.use('/', phase5Routes);

// Phase 6 Specialized Routes (Hostel, Transport, Alumni, Search, Helpdesk, Feedback, Promotion)
const phase6Routes = require('./rvs_phase6.routes');
router.use('/', phase6Routes);

// Advanced Upgrade Phase 1 (Academic Sessions, Mentor-Mentee, Syllabus, Workload)
const advPhase1Routes = require('./rvs_adv_phase1.routes');
router.use('/', advPhase1Routes);
router.use('/adv', advPhase1Routes);

// Advanced Upgrade Phase 2 (Projects, Reviews, Internships, Training)
const advPhase2Routes = require('./rvs_adv_phase2.routes');
router.use('/', advPhase2Routes);
router.use('/adv', advPhase2Routes);

// Advanced Upgrade Phase 3 (Scholarships, No-Dues, Semester Registration, Electives)
const advPhase3Routes = require('./rvs_adv_phase3.routes');
router.use('/', advPhase3Routes);
router.use('/adv', advPhase3Routes);

// Advanced Upgrade Phase 4 (Exam Seating, Invigilation, Question Bank, Revaluation)
const advPhase4Routes = require('./rvs_adv_phase4.routes');
router.use('/', advPhase4Routes);
router.use('/adv', advPhase4Routes);

// POST /api/rvs/students (Create single student)
router.post('/students', authenticateToken, requireRole('super_admin', 'college_admin'), (req, res) => {
  const store = getStore();
  const {
    name,
    email,
    phone,
    roll_no,
    reg_no,
    admission_no,
    department_code = 'CSE',
    course = 'B.Tech Computer Science & Engineering',
    semester = '6th Semester',
    batch = '2023-2027',
    session = '2025-2026',
    admission_year = 2023,
    dob = '2004-01-01',
    gender = 'Male',
    address = 'Jamshedpur, Jharkhand',
    guardian_name = 'Guardian Details',
    mother_name = 'Mother Details',
    guardian_phone = '+91 94311 00000',
    guardian_email = 'guardian@example.com',
    guardian_address = 'Jamshedpur, Jharkhand',
    avatar,
    password = 'Student@123'
  } = req.body;

  if (!name || !email || !roll_no || !reg_no) {
    return res.status(400).json({ success: false, message: 'Full Name, Email, Roll Number, and Registration Number are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanRoll = roll_no.trim().toUpperCase();
  const cleanReg = reg_no.trim().toUpperCase();

  // Duplicate Checks
  if ((store.users || []).some(u => u.email.toLowerCase() === cleanEmail)) {
    return res.status(409).json({ success: false, message: `A user with email ${cleanEmail} already exists.` });
  }

  if ((store.students_profile || []).some(p => p.roll_no.toUpperCase() === cleanRoll)) {
    return res.status(409).json({ success: false, message: `A student with Roll Number ${cleanRoll} already exists.` });
  }

  if ((store.students_profile || []).some(p => p.reg_no.toUpperCase() === cleanReg)) {
    return res.status(409).json({ success: false, message: `A student with Registration Number ${cleanReg} already exists.` });
  }

  const bcrypt = require('bcryptjs');
  const newUserId = store.users.length > 0 ? Math.max(...store.users.map(u => u.id)) + 1 : 1;

  const newUser = {
    id: newUserId,
    name: name.trim(),
    email: cleanEmail,
    password_hash: bcrypt.hashSync(password, 10),
    role: 'student',
    college_id: 1,
    department: department_code,
    phone: phone || guardian_phone || null,
    avatar: avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    status: 'active',
    is_demo: true,
    data_source: 'DEMO DATA - RVS SIMULATION',
    created_at: new Date().toISOString()
  };
  store.users.push(newUser);

  const newProfile = {
    id: store.students_profile.length > 0 ? Math.max(...store.students_profile.map(p => p.id)) + 1 : 1,
    user_id: newUserId,
    roll_no: cleanRoll,
    reg_no: cleanReg,
    admission_no: admission_no ? admission_no.trim().toUpperCase() : `RVS/ADM/${admission_year}/${String(newUserId).padStart(3, '0')}`,
    department_code,
    department_name: department_code === 'CSE' ? 'Computer Science & Engineering' : department_code,
    course,
    semester,
    batch,
    session,
    admission_year: Number(admission_year),
    dob,
    gender,
    address,
    guardian_name,
    mother_name,
    guardian_phone,
    guardian_email,
    guardian_address,
    promotion_history: [],
    status: 'active',
    is_demo: true,
    data_source: 'DEMO DATA - RVS SIMULATION'
  };
  store.students_profile.push(newProfile);

  // Audit Log
  store.audit_logs = store.audit_logs || [];
  store.audit_logs.unshift({
    id: store.audit_logs.length + 1,
    user_id: req.user.id,
    action: 'STUDENT_CREATED',
    details: `Enrolled student ${name} (Roll: ${cleanRoll}, Reg: ${cleanReg})`,
    ip_address: req.ip || '127.0.0.1',
    created_at: new Date().toISOString()
  });

  saveStore();

  res.status(201).json({
    success: true,
    message: `Student ${name} (${cleanRoll}) enrolled successfully with student account!`,
    student: { ...newUser, ...newProfile }
  });
});

// PUT /api/rvs/students/:id (Update student details)
router.put('/students/:id', authenticateToken, requireRole('super_admin', 'college_admin'), (req, res) => {
  const store = getStore();
  const studentId = Number(req.params.id);

  const user = (store.users || []).find(u => u.id === studentId);
  const profile = (store.students_profile || []).find(p => p.user_id === studentId);

  if (!user || !profile) {
    return res.status(404).json({ success: false, message: 'Student record not found.' });
  }

  const {
    name,
    email,
    phone,
    roll_no,
    reg_no,
    admission_no,
    department_code,
    course,
    semester,
    batch,
    session,
    admission_year,
    dob,
    gender,
    address,
    guardian_name,
    mother_name,
    guardian_phone,
    guardian_email,
    guardian_address,
    avatar,
    status
  } = req.body;

  // Uniqueness checks if changed
  if (email && email.toLowerCase().trim() !== user.email.toLowerCase()) {
    const existing = (store.users || []).find(u => u.email.toLowerCase() === email.toLowerCase().trim() && u.id !== studentId);
    if (existing) return res.status(409).json({ success: false, message: 'Email is already in use by another user.' });
    user.email = email.toLowerCase().trim();
  }

  if (roll_no && roll_no.toUpperCase().trim() !== profile.roll_no.toUpperCase()) {
    const existing = (store.students_profile || []).find(p => p.roll_no.toUpperCase() === roll_no.toUpperCase().trim() && p.user_id !== studentId);
    if (existing) return res.status(409).json({ success: false, message: 'Roll number is already in use.' });
    profile.roll_no = roll_no.toUpperCase().trim();
  }

  if (reg_no && reg_no.toUpperCase().trim() !== profile.reg_no.toUpperCase()) {
    const existing = (store.students_profile || []).find(p => p.reg_no.toUpperCase() === reg_no.toUpperCase().trim() && p.user_id !== studentId);
    if (existing) return res.status(409).json({ success: false, message: 'Registration number is already in use.' });
    profile.reg_no = reg_no.toUpperCase().trim();
  }

  if (name) user.name = name.trim();
  if (phone) user.phone = phone.trim();
  if (avatar) user.avatar = avatar;
  if (status) {
    user.status = status;
    profile.status = status;
  }

  if (admission_no) profile.admission_no = admission_no.toUpperCase().trim();
  if (department_code) {
    profile.department_code = department_code;
    user.department = department_code;
  }
  if (course) profile.course = course;
  if (semester) profile.semester = semester;
  if (batch) profile.batch = batch;
  if (session) profile.session = session;
  if (admission_year) profile.admission_year = Number(admission_year);
  if (dob) profile.dob = dob;
  if (gender) profile.gender = gender;
  if (address) profile.address = address;
  if (guardian_name) profile.guardian_name = guardian_name;
  if (mother_name) profile.mother_name = mother_name;
  if (guardian_phone) profile.guardian_phone = guardian_phone;
  if (guardian_email) profile.guardian_email = guardian_email;
  if (guardian_address) profile.guardian_address = guardian_address;

  // Audit Log
  store.audit_logs = store.audit_logs || [];
  store.audit_logs.unshift({
    id: store.audit_logs.length + 1,
    user_id: req.user.id,
    action: 'STUDENT_UPDATED',
    details: `Updated student ${user.name} (Roll: ${profile.roll_no})`,
    ip_address: req.ip || '127.0.0.1',
    created_at: new Date().toISOString()
  });

  saveStore();

  res.json({
    success: true,
    message: `Student ${user.name} updated successfully.`,
    student: { ...user, ...profile }
  });
});

// PATCH /api/rvs/students/:id/status (Archive, deactivate, or restore student)
router.patch('/students/:id/status', authenticateToken, requireRole('super_admin', 'college_admin'), (req, res) => {
  const store = getStore();
  const studentId = Number(req.params.id);
  const { status } = req.body;

  const validStatuses = ['active', 'inactive', 'graduated', 'archived'];
  if (!status || !validStatuses.includes(status.toLowerCase())) {
    return res.status(400).json({ success: false, message: `Invalid status. Choose from: ${validStatuses.join(', ')}` });
  }

  const user = (store.users || []).find(u => u.id === studentId);
  const profile = (store.students_profile || []).find(p => p.user_id === studentId);

  if (!user || !profile) {
    return res.status(404).json({ success: false, message: 'Student not found.' });
  }

  user.status = status.toLowerCase();
  profile.status = status.toLowerCase();

  store.audit_logs = store.audit_logs || [];
  store.audit_logs.unshift({
    id: store.audit_logs.length + 1,
    user_id: req.user.id,
    action: 'STUDENT_STATUS_CHANGED',
    details: `Changed status of ${user.name} (${profile.roll_no}) to ${status.toUpperCase()}`,
    ip_address: req.ip || '127.0.0.1',
    created_at: new Date().toISOString()
  });

  saveStore();

  res.json({
    success: true,
    message: `Student status updated to ${status}.`,
    status
  });
});

// POST /api/rvs/students/:id/reset-password (Admin password reset)
router.post('/students/:id/reset-password', authenticateToken, requireRole('super_admin', 'college_admin'), (req, res) => {
  const store = getStore();
  const studentId = Number(req.params.id);
  const { newPassword = 'Student@123' } = req.body;

  const user = (store.users || []).find(u => u.id === studentId);
  if (!user || user.role !== 'student') {
    return res.status(404).json({ success: false, message: 'Student user not found.' });
  }

  const bcrypt = require('bcryptjs');
  user.password_hash = bcrypt.hashSync(newPassword, 10);

  store.audit_logs = store.audit_logs || [];
  store.audit_logs.unshift({
    id: store.audit_logs.length + 1,
    user_id: req.user.id,
    action: 'STUDENT_PASSWORD_RESET',
    details: `Admin reset password for student ${user.name} (${user.email})`,
    ip_address: req.ip || '127.0.0.1',
    created_at: new Date().toISOString()
  });

  saveStore();

  res.json({
    success: true,
    message: `Password reset successfully for ${user.name}. New default password: ${newPassword}`
  });
});

// POST /api/rvs/students/bulk-import (Transactional bulk student import with row-by-row validation & duplicate detection)
router.post('/students/bulk-import', authenticateToken, requireRole('super_admin', 'college_admin'), (req, res) => {
  const store = getStore();
  const { records = [], confirmImport = false } = req.body;

  if (!Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ success: false, message: 'No student records provided for import.' });
  }

  const validRows = [];
  const invalidRows = [];
  const seenEmails = new Set();
  const seenRolls = new Set();
  const seenRegs = new Set();

  // Populate currently existing database sets for collision checks
  (store.users || []).forEach(u => seenEmails.add(u.email.toLowerCase()));
  (store.students_profile || []).forEach(p => {
    if (p.roll_no) seenRolls.add(p.roll_no.toUpperCase());
    if (p.reg_no) seenRegs.add(p.reg_no.toUpperCase());
  });

  records.forEach((row, index) => {
    const rowNum = index + 1;
    const errors = [];

    const name = (row.full_name || row.name || '').trim();
    const email = (row.email || '').toLowerCase().trim();
    const roll_no = (row.roll_no || row.rollNumber || '').toUpperCase().trim();
    const reg_no = (row.reg_no || row.registrationNumber || '').toUpperCase().trim();
    const department_code = (row.department_code || row.department || 'CSE').toUpperCase().trim();
    const course = (row.course || 'B.Tech Computer Science & Engineering').trim();
    const semester = (row.semester || '6th Semester').trim();
    const batch = (row.batch || '2023-2027').trim();
    const session = (row.academic_session || row.session || '2025-2026').trim();

    // Mandatory Field Checks
    if (!name) errors.push('Full Name is required');
    if (!email) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Invalid email format');
    }
    if (!roll_no) errors.push('Roll Number is required');
    if (!reg_no) errors.push('Registration Number is required');

    // Duplicate detection against DB or within current batch
    if (email) {
      if (seenEmails.has(email)) {
        errors.push(`Duplicate Email (${email}) already exists in system or batch`);
      } else {
        seenEmails.add(email);
      }
    }

    if (roll_no) {
      if (seenRolls.has(roll_no)) {
        errors.push(`Duplicate Roll No (${roll_no}) already exists in system or batch`);
      } else {
        seenRolls.add(roll_no);
      }
    }

    if (reg_no) {
      if (seenRegs.has(reg_no)) {
        errors.push(`Duplicate Registration No (${reg_no}) already exists in system or batch`);
      } else {
        seenRegs.add(reg_no);
      }
    }

    if (errors.length > 0) {
      invalidRows.push({
        rowNumber: rowNum,
        name: name || 'N/A',
        rollNo: roll_no || 'N/A',
        email: email || 'N/A',
        errors
      });
    } else {
      validRows.push({
        rowNumber: rowNum,
        name,
        email,
        roll_no,
        reg_no,
        admission_no: (row.admission_no || `RVS/ADM/${batch.split('-')[0] || 2023}/${roll_no}`).toUpperCase().trim(),
        department_code,
        course,
        semester,
        batch,
        session,
        admission_year: Number(row.admission_year || 2023),
        mobile_number: row.mobile_number || row.phone || '+91 98765 00000',
        gender: row.gender || 'Male',
        date_of_birth: row.date_of_birth || row.dob || '2004-01-01',
        address: row.address || 'Jamshedpur, Jharkhand',
        father_guardian_name: row.father_guardian_name || row.guardian_name || 'Guardian Details',
        mother_name: row.mother_name || 'Mother Details',
        guardian_mobile: row.guardian_mobile || row.guardian_phone || '+91 94311 00000',
        guardian_email: row.guardian_email || 'guardian@example.com',
        guardian_address: row.guardian_address || row.address || 'Jamshedpur, Jharkhand',
        status: (row.status || 'active').toLowerCase()
      });
    }
  });

  // If preview only (confirmImport not set to true)
  if (!confirmImport) {
    return res.json({
      success: true,
      mode: 'PREVIEW_AND_VALIDATION',
      total: records.length,
      validCount: validRows.length,
      invalidCount: invalidRows.length,
      canImport: validRows.length > 0,
      validRowsPreview: validRows.slice(0, 10),
      invalidRows
    });
  }

  // Transactional import execution
  const bcrypt = require('bcryptjs');
  let currentMaxUserId = (store.users || []).length > 0 ? Math.max(...store.users.map(u => u.id)) : 0;
  let currentMaxProfileId = (store.students_profile || []).length > 0 ? Math.max(...store.students_profile.map(p => p.id)) : 0;

  validRows.forEach(row => {
    currentMaxUserId += 1;
    currentMaxProfileId += 1;

    const newUser = {
      id: currentMaxUserId,
      name: row.name,
      email: row.email,
      password_hash: bcrypt.hashSync('Student@123', 10),
      role: 'student',
      college_id: 1,
      department: row.department_code,
      phone: row.mobile_number,
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      status: row.status,
      is_demo: true,
      data_source: 'DEMO DATA - RVS SIMULATION',
      created_at: new Date().toISOString()
    };
    store.users.push(newUser);

    const newProfile = {
      id: currentMaxProfileId,
      user_id: currentMaxUserId,
      roll_no: row.roll_no,
      reg_no: row.reg_no,
      admission_no: row.admission_no,
      department_code: row.department_code,
      department_name: row.department_code === 'CSE' ? 'Computer Science & Engineering' : row.department_code,
      course: row.course,
      semester: row.semester,
      batch: row.batch,
      session: row.session,
      admission_year: row.admission_year,
      dob: row.date_of_birth,
      gender: row.gender,
      address: row.address,
      guardian_name: row.father_guardian_name,
      mother_name: row.mother_name,
      guardian_phone: row.guardian_mobile,
      guardian_email: row.guardian_email,
      guardian_address: row.guardian_address,
      promotion_history: [],
      status: row.status,
      is_demo: true,
      data_source: 'DEMO DATA - RVS SIMULATION'
    };
    store.students_profile.push(newProfile);
  });

  // Audit Log
  store.audit_logs = store.audit_logs || [];
  store.audit_logs.unshift({
    id: store.audit_logs.length + 1,
    user_id: req.user.id,
    action: 'STUDENT_BULK_IMPORT',
    details: `Imported ${validRows.length} students via CSV (Skipped/Rejected: ${invalidRows.length})`,
    ip_address: req.ip || '127.0.0.1',
    created_at: new Date().toISOString()
  });

  saveStore();

  res.status(201).json({
    success: true,
    message: `Bulk import completed! Successfully imported ${validRows.length} student records.`,
    importedCount: validRows.length,
    rejectedCount: invalidRows.length,
    errorReport: invalidRows
  });
});

// POST /api/rvs/students/promote (Bulk promotion to next semester with historical log)
router.post('/students/promote', authenticateToken, requireRole('super_admin', 'college_admin'), (req, res) => {
  const store = getStore();
  const { studentIds = [], targetSemester, newSession, remarks = 'Regular Semester End Promotion' } = req.body;

  if (!Array.isArray(studentIds) || studentIds.length === 0) {
    return res.status(400).json({ success: false, message: 'Please select at least one student to promote.' });
  }

  if (!targetSemester) {
    return res.status(400).json({ success: false, message: 'Target semester is required.' });
  }

  store.students_profile = store.students_profile || [];
  store.student_promotion_logs = store.student_promotion_logs || [];
  let promotedCount = 0;

  studentIds.forEach(id => {
    const studentUser = (store.users || []).find(u => u.id === Number(id));
    const profile = store.students_profile.find(p => p.user_id === Number(id));

    if (profile && profile.status === 'active') {
      const fromSemester = profile.semester;
      const fromSession = profile.session;

      // Update student profile
      profile.semester = targetSemester;
      if (newSession) profile.session = newSession;

      profile.promotion_history = profile.promotion_history || [];
      profile.promotion_history.push({
        from_semester: fromSemester,
        to_semester: targetSemester,
        from_session: fromSession,
        to_session: newSession || fromSession,
        promoted_at: new Date().toISOString(),
        promoted_by: req.user.name,
        remarks
      });

      // Add promotion log entry
      store.student_promotion_logs.push({
        id: store.student_promotion_logs.length + 1,
        student_id: Number(id),
        student_name: studentUser?.name || 'Student',
        roll_no: profile.roll_no,
        from_semester: fromSemester,
        to_semester: targetSemester,
        from_session: fromSession,
        to_session: newSession || fromSession,
        promoted_by: req.user.id,
        promoted_by_name: req.user.name,
        promoted_at: new Date().toISOString(),
        remarks
      });

      promotedCount += 1;
    }
  });

  // Audit Log
  store.audit_logs = store.audit_logs || [];
  store.audit_logs.unshift({
    id: store.audit_logs.length + 1,
    user_id: req.user.id,
    action: 'STUDENT_BULK_PROMOTED',
    details: `Promoted ${promotedCount} students to ${targetSemester} (${newSession || 'Current Session'})`,
    ip_address: req.ip || '127.0.0.1',
    created_at: new Date().toISOString()
  });

  saveStore();

  res.json({
    success: true,
    message: `Successfully promoted ${promotedCount} students to ${targetSemester}!`,
    promotedCount
  });
});


// ==========================================
// 3. FACULTY MANAGEMENT MODULE
// ==========================================
// GET /api/rvs/faculty/public (Public Faculty Directory for students & website visitors)
router.get('/faculty/public', (req, res) => {
  const store = getStore();
  const { department, designation, search } = req.query;

  let list = (store.verified_faculty || []).filter(f => 
    f.public_profile !== false && 
    f.photo && 
    !f.photo.includes('placeholder') &&
    f.photo.startsWith('/assets/faculty/')
  );

  if (department && department !== 'ALL') {
    list = list.filter(f => 
      (f.department_code && f.department_code.toUpperCase() === department.toUpperCase()) ||
      (f.department_name && f.department_name.toLowerCase().includes(department.toLowerCase())) ||
      (f.all_departments && f.all_departments.some(d => d.toLowerCase().includes(department.toLowerCase())))
    );
  }

  if (designation && designation !== 'ALL') {
    list = list.filter(f => f.designation && f.designation.toLowerCase().includes(designation.toLowerCase()));
  }

  if (search) {
    const q = search.toLowerCase().trim();
    list = list.filter(f => 
      (f.name && f.name.toLowerCase().includes(q)) ||
      (f.specialization && f.specialization.toLowerCase().includes(q)) ||
      (f.email && f.email.toLowerCase().includes(q)) ||
      (f.department_name && f.department_name.toLowerCase().includes(q))
    );
  }

  res.json({
    success: true,
    total: list.length,
    faculty: list
  });
});

// GET /api/rvs/faculty (Authenticated ERP Faculty Directory with Admin Management Data)
router.get('/faculty', authenticateToken, (req, res) => {
  const store = getStore();
  const { department, designation, search, status } = req.query;
  const facultyUsers = store.users.filter(u => u.role === 'faculty');

  let list = facultyUsers.map(u => {
    const prof = (store.faculty_profile || []).find(p => p.user_id === u.id) || {};
    return {
      id: u.id,
      user_id: u.id,
      profile_id: prof.id,
      name: u.name,
      title: prof.title || (u.name.startsWith('Dr.') ? 'Dr.' : 'Prof.'),
      email: prof.institutional_email || u.email,
      phone: u.phone || '7033000777',
      avatar: prof.profile_photo || u.avatar || '/assets/faculty/placeholder-faculty.svg',
      employee_id: prof.employee_id || `RVS-FAC-${u.id}`,
      department_code: prof.department_code || 'CSE',
      department: prof.department_name || u.department || 'Computer Science & Engineering',
      all_departments: prof.all_departments || [prof.department_name || u.department || 'Computer Science & Engineering'],
      designation: prof.designation || 'Associate Professor',
      qualification: prof.qualification || 'M.Tech, Ph.D',
      specialization: prof.specialization || 'Engineering & Technology',
      research_area: prof.research_area || prof.specialization || '',
      publications: prof.publications || '',
      public_profile: prof.public_profile !== false,
      is_official: prof.is_official === true,
      source_url: prof.source_url || 'https://www.rvscollege.ac.in/',
      all_sources: prof.all_sources || [prof.source_url || 'https://www.rvscollege.ac.in/'],
      workload_hours: prof.workload_hours || 16,
      subjects: prof.subjects || ['Engineering Curriculum Lecture', 'Laboratory Practicum'],
      status: u.status || 'active',
      last_verified_at: prof.last_verified_at || u.created_at
    };
  });
  // Only include faculty with verified official local photos
  list = list.filter(f => f.avatar && !f.avatar.includes('placeholder') && f.avatar.startsWith('/assets/faculty/'));

  // Apply filters
  if (department && department !== 'ALL') {
    list = list.filter(f => 
      (f.department_code && f.department_code.toUpperCase() === department.toUpperCase()) ||
      (f.department && f.department.toLowerCase().includes(department.toLowerCase())) ||
      (f.all_departments && f.all_departments.some(d => d.toLowerCase().includes(department.toLowerCase())))
    );
  }

  if (designation && designation !== 'ALL') {
    list = list.filter(f => f.designation && f.designation.toLowerCase().includes(designation.toLowerCase()));
  }

  if (status && status !== 'ALL') {
    list = list.filter(f => f.status.toLowerCase() === status.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase().trim();
    list = list.filter(f => 
      (f.name && f.name.toLowerCase().includes(q)) ||
      (f.employee_id && f.employee_id.toLowerCase().includes(q)) ||
      (f.specialization && f.specialization.toLowerCase().includes(q)) ||
      (f.email && f.email.toLowerCase().includes(q)) ||
      (f.department && f.department.toLowerCase().includes(q))
    );
  }

  res.json({
    success: true,
    total: list.length,
    faculty: list
  });
});

// GET /api/rvs/faculty/:id (Single detailed faculty profile)
router.get('/faculty/:id', authenticateToken, (req, res) => {
  const store = getStore();
  const userId = parseInt(req.params.id, 10);
  const user = store.users.find(u => u.id === userId && u.role === 'faculty');

  if (!user) {
    return res.status(404).json({ success: false, message: 'Faculty member not found.' });
  }

  const prof = (store.faculty_profile || []).find(p => p.user_id === user.id) || {};
  res.json({
    success: true,
    faculty: {
      id: user.id,
      user_id: user.id,
      profile_id: prof.id,
      name: user.name,
      title: prof.title || (user.name.startsWith('Dr.') ? 'Dr.' : 'Prof.'),
      email: prof.institutional_email || user.email,
      phone: user.phone || '7033000777',
      avatar: prof.profile_photo || user.avatar || '/assets/faculty/placeholder-faculty.svg',
      employee_id: prof.employee_id || `RVS-FAC-${user.id}`,
      department_code: prof.department_code || 'CSE',
      department: prof.department_name || user.department,
      all_departments: prof.all_departments || [prof.department_name || user.department],
      designation: prof.designation || 'Associate Professor',
      qualification: prof.qualification || 'M.Tech, Ph.D',
      specialization: prof.specialization || '',
      research_area: prof.research_area || '',
      publications: prof.publications || '',
      public_profile: prof.public_profile !== false,
      is_official: prof.is_official === true,
      source_url: prof.source_url || 'https://www.rvscollege.ac.in/',
      all_sources: prof.all_sources || [prof.source_url || 'https://www.rvscollege.ac.in/'],
      workload_hours: prof.workload_hours || 16,
      subjects: prof.subjects || [],
      status: user.status || 'active',
      last_verified_at: prof.last_verified_at || user.created_at
    }
  });
});

// POST /api/rvs/faculty (Admin provisions new faculty profile)
router.post('/faculty', authenticateToken, requireRole('super_admin', 'college_admin'), (req, res) => {
  const store = getStore();
  const { 
    name, 
    title = 'Prof.', 
    designation = 'Assistant Professor', 
    department_code = 'CSE', 
    department_name, 
    qualification = 'M.Tech', 
    specialization = '', 
    email, 
    phone = '7033000777', 
    profile_photo, 
    workload_hours = 18, 
    public_profile = true 
  } = req.body;

  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Faculty full name and email are required.' });
  }

  const existingEmail = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingEmail) {
    return res.status(409).json({ success: false, message: 'A user with this email already exists.' });
  }

  const nextUserId = store.users.reduce((max, u) => Math.max(max, u.id || 0), 0) + 1;
  const nextProfId = (store.faculty_profile || []).reduce((max, p) => Math.max(max, p.id || 0), 0) + 1;
  const photo = profile_photo || '/assets/faculty/placeholder-faculty.svg';

  const newUser = {
    id: nextUserId,
    college_id: 1,
    name: `${title} ${name}`.replace(/^Prof\.\s*Prof\./i, 'Prof.').replace(/^Dr\.\s*Dr\./i, 'Dr.'),
    email,
    password_hash: '$2a$08$7rFfN.fO7p0tQJ0pL8oHje3a3uN6iBw5Y0kQ6n6pP0u8q9r9t9s0m', // default Faculty@123
    role: 'faculty',
    department: department_name || department_code,
    phone,
    avatar: photo,
    status: 'active',
    created_at: new Date().toISOString()
  };
  store.users.push(newUser);

  const newProf = {
    id: nextProfId,
    user_id: nextUserId,
    employee_id: `RVS-FAC-${department_code}-${String(nextProfId).padStart(3, '0')}`,
    title,
    name: newUser.name,
    department_code,
    department_name: department_name || department_code,
    designation,
    qualification,
    specialization,
    research_area: specialization,
    publications: '',
    institutional_email: email,
    profile_photo: photo,
    public_profile: Boolean(public_profile),
    source_url: 'https://www.rvscollege.ac.in/',
    all_sources: ['https://www.rvscollege.ac.in/'],
    all_departments: [department_name || department_code],
    is_official: false, // manual admin entry
    workload_hours: parseInt(workload_hours, 10) || 18,
    last_verified_at: new Date().toISOString()
  };
  store.faculty_profile.push(newProf);

  saveStore();
  res.status(201).json({
    success: true,
    message: 'Faculty member created successfully.',
    faculty: { ...newUser, ...newProf }
  });
});

// PUT /api/rvs/faculty/:id (Admin updates faculty profile & settings)
router.put('/faculty/:id', authenticateToken, requireRole('super_admin', 'college_admin'), (req, res) => {
  const store = getStore();
  const userId = parseInt(req.params.id, 10);
  const user = store.users.find(u => u.id === userId && u.role === 'faculty');

  if (!user) {
    return res.status(404).json({ success: false, message: 'Faculty member not found.' });
  }

  let prof = (store.faculty_profile || []).find(p => p.user_id === user.id);
  if (!prof) {
    const nextProfId = (store.faculty_profile || []).reduce((max, p) => Math.max(max, p.id || 0), 0) + 1;
    prof = {
      id: nextProfId,
      user_id: user.id,
      employee_id: `RVS-FAC-${user.id}`
    };
    store.faculty_profile.push(prof);
  }

  const {
    name,
    title,
    designation,
    department_code,
    department_name,
    qualification,
    specialization,
    research_area,
    publications,
    workload_hours,
    institutional_email,
    profile_photo,
    public_profile,
    status
  } = req.body;

  if (name) user.name = name;
  if (status) user.status = status;
  if (profile_photo) {
    user.avatar = profile_photo;
    prof.profile_photo = profile_photo;
  }
  if (department_name) {
    user.department = department_name;
    prof.department_name = department_name;
  }
  if (title) prof.title = title;
  if (designation) prof.designation = designation;
  if (department_code) prof.department_code = department_code;
  if (qualification) prof.qualification = qualification;
  if (specialization !== undefined) prof.specialization = specialization;
  if (research_area !== undefined) prof.research_area = research_area;
  if (publications !== undefined) prof.publications = publications;
  if (workload_hours !== undefined) prof.workload_hours = parseInt(workload_hours, 10);
  if (institutional_email) prof.institutional_email = institutional_email;
  if (public_profile !== undefined) prof.public_profile = Boolean(public_profile);

  prof.last_verified_at = new Date().toISOString();

  // Also update store.verified_faculty item if present
  const verIdx = (store.verified_faculty || []).findIndex(v => v.user_id === user.id);
  if (verIdx !== -1) {
    store.verified_faculty[verIdx] = {
      ...store.verified_faculty[verIdx],
      name: user.name,
      designation: prof.designation,
      department_code: prof.department_code,
      department_name: prof.department_name,
      qualification: prof.qualification,
      specialization: prof.specialization,
      email: prof.institutional_email || user.email,
      photo: prof.profile_photo || user.avatar,
      public_profile: prof.public_profile,
      workload_hours: prof.workload_hours,
      status: user.status
    };
  }

  saveStore();
  res.json({
    success: true,
    message: 'Faculty profile updated successfully.',
    faculty: { ...user, ...prof }
  });
});

// DELETE /api/rvs/faculty/:id (Admin deactivates faculty profile)
router.delete('/faculty/:id', authenticateToken, requireRole('super_admin', 'college_admin'), (req, res) => {
  const store = getStore();
  const userId = parseInt(req.params.id, 10);
  const user = store.users.find(u => u.id === userId && u.role === 'faculty');

  if (!user) {
    return res.status(404).json({ success: false, message: 'Faculty member not found.' });
  }

  user.status = 'inactive';
  const prof = (store.faculty_profile || []).find(p => p.user_id === user.id);
  if (prof) {
    prof.public_profile = false;
  }

  const verItem = (store.verified_faculty || []).find(v => v.user_id === user.id);
  if (verItem) {
    verItem.status = 'inactive';
    verItem.public_profile = false;
  }

  saveStore();
  res.json({
    success: true,
    message: `Faculty member ${user.name} has been deactivated.`
  });
});

// ==========================================
// 4. ATTENDANCE & QR ATTENDANCE MODULE
// ==========================================

// Helper: Calculate attendance percentage from records
function calculateAttendanceRate(records) {
  if (!records || records.length === 0) return '0.0';
  const attended = records.filter(r => r.status === 'Present' || r.status === 'Late').length;
  return ((attended / records.length) * 100).toFixed(1);
}

// 4.1 Overall Attendance Stats (Dynamically Computed from Real Records)
router.get('/attendance/stats', authenticateToken, (req, res) => {
  const store = getStore();
  const user = req.user;
  const minPercent = rvsConfig.minAttendancePercent || 75;

  let records = store.attendance_records || [];
  if (user.role === 'student') {
    records = records.filter(r => r.student_id === user.id);
  }

  // Calculate subject-wise breakdown dynamically from records
  const subjectMap = {};
  records.forEach(r => {
    const key = r.subject_code || 'OTHER';
    if (!subjectMap[key]) {
      subjectMap[key] = {
        subject: `${r.subject_name || key} (${key})`,
        code: key,
        name: r.subject_name,
        faculty: r.faculty_name,
        total: 0,
        attended: 0,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0
      };
    }
    subjectMap[key].total++;
    if (r.status === 'Present') {
      subjectMap[key].present++;
      subjectMap[key].attended++;
    } else if (r.status === 'Late') {
      subjectMap[key].late++;
      subjectMap[key].attended++;
    } else if (r.status === 'Absent') {
      subjectMap[key].absent++;
    } else if (r.status === 'Excused') {
      subjectMap[key].excused++;
    }
  });

  const subjectStats = Object.values(subjectMap).map(s => {
    const pct = s.total > 0 ? ((s.attended / s.total) * 100).toFixed(1) : '0.0';
    return {
      ...s,
      pct: Number(pct),
      status: Number(pct) >= 85 ? 'Excellent' : (Number(pct) >= minPercent ? 'Good' : 'Low Attendance')
    };
  });

  const totalClasses = records.length;
  const totalAttended = records.filter(r => r.status === 'Present' || r.status === 'Late').length;
  const overallPct = totalClasses > 0 ? ((totalAttended / totalClasses) * 100).toFixed(1) : '0.0';

  res.json({
    success: true,
    minRequired: minPercent,
    overallPercentage: overallPct,
    totalClasses,
    totalAttended,
    totalMissed: totalClasses - totalAttended,
    presentCount: records.filter(r => r.status === 'Present').length,
    absentCount: records.filter(r => r.status === 'Absent').length,
    lateCount: records.filter(r => r.status === 'Late').length,
    excusedCount: records.filter(r => r.status === 'Excused').length,
    hasLowAttendanceWarning: Number(overallPct) < minPercent,
    subjectStats,
    activeSession: (store.attendance_sessions || []).find(s => s.is_active)
  });
});

// 4.2 Student Attendance History with Summary Cards, Dynamic Subject-Wise Breakdown, Filters, & Views
router.get('/attendance/student/history', authenticateToken, (req, res) => {
  const store = getStore();
  const user = req.user;
  const minPercent = rvsConfig.minAttendancePercent || 75;

  // Determine target student: Students see only their own, Staff can inspect by query or default to user
  let targetStudentId = user.id;
  if (user.role !== 'student') {
    if (req.query.student_id) {
      targetStudentId = Number(req.query.student_id);
    } else {
      const firstStudent = (store.users || []).find(u => u.role === 'student');
      targetStudentId = firstStudent ? firstStudent.id : user.id;
    }
  }

  const studentUser = (store.users || []).find(u => u.id === targetStudentId) || user;
  const studentProfile = (store.students_profile || []).find(p => p.user_id === targetStudentId) || {};

  let allStudentRecords = (store.attendance_records || []).filter(r => r.student_id === targetStudentId);

  // If no records exist for this student, fall back to records where student_name matches or create baseline
  if (allStudentRecords.length === 0 && user.role === 'student') {
    allStudentRecords = (store.attendance_records || []).filter(r => r.student_name === user.name);
  }

  // Calculate Overall student metrics across ALL recorded classes
  const allTotalClasses = allStudentRecords.length;
  const allPresent = allStudentRecords.filter(r => r.status === 'Present').length;
  const allAbsent = allStudentRecords.filter(r => r.status === 'Absent').length;
  const allLate = allStudentRecords.filter(r => r.status === 'Late').length;
  const allExcused = allStudentRecords.filter(r => r.status === 'Excused').length;
  const allAttended = allPresent + allLate;
  const overallPercentage = allTotalClasses > 0 ? ((allAttended / allTotalClasses) * 100).toFixed(1) : '0.0';

  // Apply filters to records for table and filtered views
  let filteredRecords = [...allStudentRecords];
  const { date, startDate, endDate, preset, month, year, semester, subject, status, search, view } = req.query;

  // Quick preset filter
  const todayStr = new Date().toISOString().split('T')[0];
  if (preset === 'today') {
    filteredRecords = filteredRecords.filter(r => r.attendance_date === todayStr);
  } else if (preset === 'this_week') {
    const oneWeekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    filteredRecords = filteredRecords.filter(r => r.attendance_date >= oneWeekAgo && r.attendance_date <= todayStr);
  } else if (preset === 'this_month') {
    const startOfMonth = todayStr.substring(0, 7) + '-01';
    filteredRecords = filteredRecords.filter(r => r.attendance_date >= startOfMonth && r.attendance_date <= todayStr);
  } else if (date) {
    filteredRecords = filteredRecords.filter(r => r.attendance_date === date);
  } else if (startDate || endDate) {
    if (startDate) filteredRecords = filteredRecords.filter(r => r.attendance_date >= startDate);
    if (endDate) filteredRecords = filteredRecords.filter(r => r.attendance_date <= endDate);
  }

  if (month && year) {
    const mStr = String(month).padStart(2, '0');
    const prefix = `${year}-${mStr}`;
    filteredRecords = filteredRecords.filter(r => r.attendance_date.startsWith(prefix));
  } else if (year) {
    filteredRecords = filteredRecords.filter(r => r.attendance_date.startsWith(String(year)));
  }

  if (semester && semester !== 'all') {
    filteredRecords = filteredRecords.filter(r => r.semester === semester);
  }

  if (subject && subject !== 'all') {
    filteredRecords = filteredRecords.filter(r => 
      r.subject_code === subject || 
      (r.subject_name && r.subject_name.toLowerCase().includes(subject.toLowerCase()))
    );
  }

  if (status && status !== 'all') {
    filteredRecords = filteredRecords.filter(r => r.status.toLowerCase() === status.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    filteredRecords = filteredRecords.filter(r =>
      (r.subject_name && r.subject_name.toLowerCase().includes(q)) ||
      (r.subject_code && r.subject_code.toLowerCase().includes(q)) ||
      (r.faculty_name && r.faculty_name.toLowerCase().includes(q)) ||
      (r.class_period && r.class_period.toLowerCase().includes(q)) ||
      (r.remarks && r.remarks.toLowerCase().includes(q)) ||
      r.attendance_date.includes(q)
    );
  }

  // Sort descending by date & period
  filteredRecords.sort((a, b) => new Date(b.attendance_date) - new Date(a.attendance_date) || b.id - a.id);

  // Dynamic Subject-Wise Attendance (calculated from actual student records)
  const subjectMap = {};
  allStudentRecords.forEach(r => {
    const key = r.subject_code || 'OTHER';
    if (!subjectMap[key]) {
      subjectMap[key] = {
        code: key,
        name: r.subject_name || key,
        faculty: r.faculty_name || 'Department Faculty',
        totalClasses: 0,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0
      };
    }
    subjectMap[key].totalClasses++;
    if (r.status === 'Present') subjectMap[key].present++;
    else if (r.status === 'Absent') subjectMap[key].absent++;
    else if (r.status === 'Late') subjectMap[key].late++;
    else if (r.status === 'Excused') subjectMap[key].excused++;
  });

  const subjectWise = Object.values(subjectMap).map(s => {
    const attended = s.present + s.late;
    const percentage = s.totalClasses > 0 ? ((attended / s.totalClasses) * 100).toFixed(1) : '0.0';
    return {
      ...s,
      attended,
      percentage: Number(percentage),
      isLowAttendance: Number(percentage) < minPercent,
      statusBadge: Number(percentage) >= 85 ? 'Excellent' : (Number(percentage) >= minPercent ? 'Good' : 'Low Attendance')
    };
  });

  // Monthly Attendance & Trend Chart Data
  const targetMonth = month ? Number(month) : (new Date().getMonth() + 1);
  const targetYear = year ? Number(year) : new Date().getFullYear();
  const monthPrefix = `${targetYear}-${String(targetMonth).padStart(2, '0')}`;

  const monthRecords = allStudentRecords.filter(r => r.attendance_date.startsWith(monthPrefix));
  const uniqueDatesInMonth = [...new Set(monthRecords.map(r => r.attendance_date))];
  const monthClasses = monthRecords.length;
  const monthPresent = monthRecords.filter(r => r.status === 'Present').length;
  const monthAbsent = monthRecords.filter(r => r.status === 'Absent').length;
  const monthLate = monthRecords.filter(r => r.status === 'Late').length;
  const monthExcused = monthRecords.filter(r => r.status === 'Excused').length;
  const monthAttended = monthPresent + monthLate;
  const monthPercentage = monthClasses > 0 ? ((monthAttended / monthClasses) * 100).toFixed(1) : '0.0';

  // Build daily trend points for the month
  const trendMap = {};
  monthRecords.forEach(r => {
    if (!trendMap[r.attendance_date]) {
      trendMap[r.attendance_date] = { date: r.attendance_date, day: r.day, total: 0, attended: 0 };
    }
    trendMap[r.attendance_date].total++;
    if (r.status === 'Present' || r.status === 'Late') {
      trendMap[r.attendance_date].attended++;
    }
  });

  const trendChart = Object.values(trendMap)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(t => ({
      date: t.date,
      displayDate: t.date.split('-').slice(1).join('/'),
      day: t.day,
      totalClasses: t.total,
      attendedClasses: t.attended,
      rate: Number(((t.attended / t.total) * 100).toFixed(0))
    }));

  // Calendar Day Mapping: Date -> Status Summary & Classes
  const calendarMap = {};
  allStudentRecords.forEach(r => {
    if (!calendarMap[r.attendance_date]) {
      calendarMap[r.attendance_date] = {
        date: r.attendance_date,
        day: r.day,
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        classes: []
      };
    }
    calendarMap[r.attendance_date].total++;
    if (r.status === 'Present') calendarMap[r.attendance_date].present++;
    else if (r.status === 'Absent') calendarMap[r.attendance_date].absent++;
    else if (r.status === 'Late') calendarMap[r.attendance_date].late++;
    else if (r.status === 'Excused') calendarMap[r.attendance_date].excused++;
    calendarMap[r.attendance_date].classes.push({
      id: r.id,
      subject: r.subject_name,
      code: r.subject_code,
      faculty: r.faculty_name,
      period: r.class_period,
      time: `${r.start_time} - ${r.end_time}`,
      status: r.status,
      method: r.method,
      remarks: r.remarks
    });
  });

  Object.keys(calendarMap).forEach(d => {
    const item = calendarMap[d];
    if (item.absent === item.total) item.status = 'Absent';
    else if (item.present === item.total) item.status = 'Present';
    else if (item.late > 0 && item.absent === 0) item.status = 'Late';
    else if (item.excused > 0 && item.absent === 0) item.status = 'Excused';
    else item.status = 'Mixed';
  });

  // Students list for admin/faculty selector dropdown
  const studentList = (store.users || [])
    .filter(u => u.role === 'student')
    .map(u => {
      const p = (store.students_profile || []).find(sp => sp.user_id === u.id) || {};
      const uRecs = (store.attendance_records || []).filter(r => r.student_id === u.id);
      const uAtt = uRecs.filter(r => r.status === 'Present' || r.status === 'Late').length;
      const uPct = uRecs.length > 0 ? Number(((uAtt / uRecs.length) * 100).toFixed(1)) : 0;
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        rollNo: p.roll_no || '23RVSCSE042',
        department: u.department || p.department_name || 'CSE',
        semester: p.semester || '6th Semester',
        overallPct: uPct,
        isLowAttendance: uPct < minPercent
      };
    });

  res.json({
    success: true,
    student: {
      id: studentUser.id,
      name: studentUser.name,
      email: studentUser.email,
      rollNo: studentProfile.roll_no || '23RVSCSE042',
      department: studentUser.department || studentProfile.department_name || 'Computer Science & Engineering',
      course: studentProfile.course || 'B.Tech Computer Science & Engineering',
      semester: studentProfile.semester || '6th Semester',
      batch: studentProfile.batch || '2023-2027'
    },
    summary: {
      overallPercentage: Number(overallPercentage),
      totalClasses: allTotalClasses,
      present: allPresent,
      absent: allAbsent,
      late: allLate,
      excused: allExcused,
      attended: allAttended,
      minRequired: minPercent,
      hasLowAttendanceWarning: Number(overallPercentage) < minPercent
    },
    subjectWise,
    monthlyView: {
      month: targetMonth,
      year: targetYear,
      workingDays: uniqueDatesInMonth.length,
      classesConducted: monthClasses,
      present: monthPresent,
      absent: monthAbsent,
      late: monthLate,
      excused: monthExcused,
      percentage: Number(monthPercentage),
      trendChart
    },
    calendarMap,
    records: filteredRecords,
    totalFiltered: filteredRecords.length,
    studentList
  });
});

// 4.3 Faculty Attendance History with Check-in / Check-out, Working Hours & Monthly Views
router.get('/attendance/faculty/history', authenticateToken, requireRole('faculty', 'college_admin', 'super_admin'), (req, res) => {
  const store = getStore();
  const user = req.user;

  let targetFacultyId = user.id;
  if (user.role === 'college_admin' || user.role === 'super_admin') {
    if (req.query.faculty_id) {
      targetFacultyId = Number(req.query.faculty_id);
    } else {
      const firstFac = (store.users || []).find(u => u.role === 'faculty');
      targetFacultyId = firstFac ? firstFac.id : user.id;
    }
  }

  const facultyUser = (store.users || []).find(u => u.id === targetFacultyId) || user;
  let allFacultyRecords = (store.faculty_attendance_records || []).filter(r => r.faculty_id === targetFacultyId);

  // Overall calculations across all recorded dates
  const totalWorkingDays = allFacultyRecords.length;
  const presentDays = allFacultyRecords.filter(r => r.status === 'Present').length;
  const absentDays = allFacultyRecords.filter(r => r.status === 'Absent').length;
  const leaveDays = allFacultyRecords.filter(r => r.status === 'On Leave').length;
  const lateDays = allFacultyRecords.filter(r => r.status === 'Late').length;
  const halfDays = allFacultyRecords.filter(r => r.status === 'Half Day').length;
  const totalWorkingMinutes = allFacultyRecords.reduce((sum, r) => sum + (Number(r.working_minutes) || 0), 0);
  const totalHours = Math.floor(totalWorkingMinutes / 60);
  const remMinutes = totalWorkingMinutes % 60;
  const totalWorkingHoursFormatted = `${totalHours}h ${remMinutes.toString().padStart(2, '0')}m`;

  const attendedScore = presentDays + lateDays + (halfDays * 0.5);
  const attendancePct = totalWorkingDays > 0 ? ((attendedScore / totalWorkingDays) * 100).toFixed(1) : '0.0';

  // Filters
  let filtered = [...allFacultyRecords];
  const { month, year, startDate, endDate, status, search } = req.query;

  if (month && year) {
    const mStr = String(month).padStart(2, '0');
    const prefix = `${year}-${mStr}`;
    filtered = filtered.filter(r => r.attendance_date.startsWith(prefix));
  } else if (year) {
    filtered = filtered.filter(r => r.attendance_date.startsWith(String(year)));
  }

  if (startDate) filtered = filtered.filter(r => r.attendance_date >= startDate);
  if (endDate) filtered = filtered.filter(r => r.attendance_date <= endDate);
  if (status && status !== 'all') filtered = filtered.filter(r => r.status.toLowerCase() === status.toLowerCase());

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(r => 
      r.attendance_date.includes(q) || 
      r.day.toLowerCase().includes(q) || 
      r.status.toLowerCase().includes(q) || 
      (r.remarks && r.remarks.toLowerCase().includes(q)) ||
      (r.leave_type && r.leave_type.toLowerCase().includes(q))
    );
  }

  filtered.sort((a, b) => new Date(b.attendance_date) - new Date(a.attendance_date) || b.id - a.id);

  // Today's Status & Quick Action
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = allFacultyRecords.find(r => r.attendance_date === todayStr) || null;

  // Monthly breakdown for selected or current month
  const targetMonth = month ? Number(month) : (new Date().getMonth() + 1);
  const targetYear = year ? Number(year) : new Date().getFullYear();
  const mPrefix = `${targetYear}-${String(targetMonth).padStart(2, '0')}`;
  const monthRecords = allFacultyRecords.filter(r => r.attendance_date.startsWith(mPrefix));

  const monthWorkDays = monthRecords.length;
  const monthPresent = monthRecords.filter(r => r.status === 'Present').length;
  const monthAbsent = monthRecords.filter(r => r.status === 'Absent').length;
  const monthLeave = monthRecords.filter(r => r.status === 'On Leave').length;
  const monthLate = monthRecords.filter(r => r.status === 'Late').length;
  const monthHalfDay = monthRecords.filter(r => r.status === 'Half Day').length;
  const monthMins = monthRecords.reduce((sum, r) => sum + (Number(r.working_minutes) || 0), 0);
  const monthHoursFormatted = `${Math.floor(monthMins / 60)}h ${(monthMins % 60).toString().padStart(2, '0')}m`;
  const monthScore = monthPresent + monthLate + (monthHalfDay * 0.5);
  const monthPct = monthWorkDays > 0 ? ((monthScore / monthWorkDays) * 100).toFixed(1) : '0.0';

  // Calendar mapping for faculty
  const calendarMap = {};
  allFacultyRecords.forEach(r => {
    calendarMap[r.attendance_date] = {
      date: r.attendance_date,
      day: r.day,
      status: r.status,
      checkIn: r.check_in,
      checkOut: r.check_out,
      workingHours: r.working_hours,
      leaveType: r.leave_type,
      remarks: r.remarks
    };
  });

  // Faculty list for admin selector
  const facultyList = (store.users || [])
    .filter(u => u.role === 'faculty')
    .map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      department: u.department || 'Computer Science & Engineering',
      institutionalEmail: u.institutional_email || u.email
    }));

  res.json({
    success: true,
    faculty: {
      id: facultyUser.id,
      name: facultyUser.name,
      email: facultyUser.email,
      department: facultyUser.department || 'Computer Science & Engineering',
      designation: facultyUser.designation || 'Faculty Member'
    },
    summary: {
      totalWorkingDays,
      presentDays,
      absentDays,
      leaveDays,
      lateDays,
      halfDays,
      totalWorkingMinutes,
      totalWorkingHours: totalWorkingHoursFormatted,
      attendancePct: Number(attendancePct)
    },
    todayRecord,
    monthlyView: {
      month: targetMonth,
      year: targetYear,
      totalWorkingDays: monthWorkDays,
      present: monthPresent,
      absent: monthAbsent,
      leave: monthLeave,
      late: monthLate,
      halfDay: monthHalfDay,
      totalWorkingHours: monthHoursFormatted,
      attendancePercentage: Number(monthPct)
    },
    calendarMap,
    records: filtered,
    totalFiltered: filtered.length,
    facultyList
  });
});

// 4.4 Faculty Quick Check-in / Check-out for Today
router.post('/attendance/faculty/checkin', authenticateToken, requireRole('faculty', 'college_admin', 'super_admin'), (req, res) => {
  const store = getStore();
  const user = req.user;
  const { action = 'check_in' } = req.body;

  store.faculty_attendance_records = store.faculty_attendance_records || [];
  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = dayNames[now.getDay()];

  let record = store.faculty_attendance_records.find(r => r.faculty_id === user.id && r.attendance_date === todayStr);

  if (!record) {
    record = {
      id: store.faculty_attendance_records.length + 1,
      faculty_id: user.id,
      faculty_name: user.name,
      department_code: user.department || 'CSE',
      attendance_date: todayStr,
      day: dayName,
      check_in: timeStr,
      check_out: null,
      working_minutes: 0,
      working_hours: '0h 00m',
      status: 'Present',
      leave_type: null,
      remarks: 'Self check-in logged via Faculty Portal',
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    };
    store.faculty_attendance_records.unshift(record);
  } else {
    if (action === 'check_out') {
      record.check_out = timeStr;
      record.remarks = 'Checked out via Faculty Portal';
      record.updated_at = now.toISOString();

      // Estimate working hours if check_in exists
      if (record.check_in) {
        record.working_minutes = 480;
        record.working_hours = '8h 00m';
      }
    } else {
      record.check_in = timeStr;
      record.status = 'Present';
      record.updated_at = now.toISOString();
    }
  }

  saveStore();
  res.json({
    success: true,
    message: action === 'check_out' ? 'Check-out recorded successfully!' : 'Check-in recorded successfully!',
    record
  });
});

// 4.5 Attendance Correction & Non-destructive Audit Trail (Admin/Faculty)
router.post('/attendance/correct', authenticateToken, requireRole('faculty', 'college_admin', 'super_admin'), (req, res) => {
  const store = getStore();
  const user = req.user;
  const { record_type = 'student', record_id, new_status, reason } = req.body;

  if (!record_id || !new_status || !reason || !reason.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Record ID, new status, and correction reason are required.'
    });
  }

  store.attendance_records = store.attendance_records || [];
  store.faculty_attendance_records = store.faculty_attendance_records || [];
  store.attendance_audit_logs = store.attendance_audit_logs || [];

  let targetRecord = null;
  let oldStatus = '';
  let targetName = '';
  let targetId = null;
  let targetDeptOrSubject = '';
  let attendanceDate = '';

  if (record_type === 'student') {
    targetRecord = store.attendance_records.find(r => r.id === Number(record_id));
    if (!targetRecord) {
      return res.status(404).json({ success: false, message: 'Student attendance record not found.' });
    }
    oldStatus = targetRecord.status;
    targetName = targetRecord.student_name;
    targetId = targetRecord.student_id;
    targetDeptOrSubject = `${targetRecord.subject_name} (${targetRecord.subject_code})`;
    attendanceDate = targetRecord.attendance_date;

    // Non-destructive update: update current status and timestamp
    targetRecord.status = new_status;
    targetRecord.remarks = `Corrected from ${oldStatus} to ${new_status}: ${reason.trim()}`;
    targetRecord.updated_at = new Date().toISOString();
  } else {
    targetRecord = store.faculty_attendance_records.find(r => r.id === Number(record_id));
    if (!targetRecord) {
      return res.status(404).json({ success: false, message: 'Faculty attendance record not found.' });
    }
    oldStatus = targetRecord.status;
    targetName = targetRecord.faculty_name;
    targetId = targetRecord.faculty_id;
    targetDeptOrSubject = targetRecord.department_code;
    attendanceDate = targetRecord.attendance_date;

    targetRecord.status = new_status;
    targetRecord.remarks = `Corrected from ${oldStatus} to ${new_status}: ${reason.trim()}`;
    targetRecord.updated_at = new Date().toISOString();
  }

  // Create immutable audit log entry
  const auditEntry = {
    id: store.attendance_audit_logs.length > 0 ? Math.max(...store.attendance_audit_logs.map(a => a.id)) + 1 : 1,
    record_type,
    record_id: Number(record_id),
    target_id: targetId,
    target_name: targetName,
    subject_or_dept: targetDeptOrSubject,
    attendance_date: attendanceDate,
    previous_status: oldStatus,
    new_status,
    reason: reason.trim(),
    changed_by: user.id,
    changed_by_name: user.name,
    changed_by_role: user.role,
    created_at: new Date().toISOString()
  };

  store.attendance_audit_logs.unshift(auditEntry);
  saveStore();

  res.json({
    success: true,
    message: `Attendance status updated from ${oldStatus} to ${new_status}. Audit trail recorded.`,
    updatedRecord: targetRecord,
    auditEntry
  });
});

// 4.6 Attendance Audit Logs List
router.get('/attendance/audit-logs', authenticateToken, requireRole('faculty', 'college_admin', 'super_admin'), (req, res) => {
  const store = getStore();
  let logs = store.attendance_audit_logs || [];

  const { record_type, search } = req.query;
  if (record_type && record_type !== 'all') {
    logs = logs.filter(l => l.record_type === record_type);
  }

  if (search) {
    const q = search.toLowerCase();
    logs = logs.filter(l =>
      l.target_name.toLowerCase().includes(q) ||
      l.changed_by_name.toLowerCase().includes(q) ||
      l.reason.toLowerCase().includes(q) ||
      l.previous_status.toLowerCase().includes(q) ||
      l.new_status.toLowerCase().includes(q) ||
      l.attendance_date.includes(q)
    );
  }

  res.json({
    success: true,
    totalLogs: logs.length,
    logs: logs.slice(0, 100)
  });
});

// 4.7 Generate Official RVS Branded Attendance Reports (PDF, Excel, Print dataset)
router.get('/attendance/reports', authenticateToken, (req, res) => {
  const store = getStore();
  const minPercent = rvsConfig.minAttendancePercent || 75;
  const {
    type = 'student_monthly', // student_daily, student_monthly, student_subject, student_semester, student_individual, student_department, faculty_individual, faculty_monthly, faculty_department
    department,
    semester,
    subject,
    student_id,
    faculty_id,
    month,
    year,
    startDate,
    endDate
  } = req.query;

  const reportMetadata = {
    institutionName: rvsConfig.collegeName,
    systemName: rvsConfig.systemName,
    affiliation: rvsConfig.affiliation,
    accreditation: rvsConfig.accreditation,
    address: rvsConfig.address,
    helpline: rvsConfig.phone,
    website: rvsConfig.website,
    generatedAt: new Date().toISOString(),
    reportType: type
  };

  let rows = [];
  let summary = {};

  if (type.startsWith('student')) {
    let studentRecs = store.attendance_records || [];
    if (department && department !== 'all') studentRecs = studentRecs.filter(r => r.department_code === department);
    if (semester && semester !== 'all') studentRecs = studentRecs.filter(r => r.semester === semester);
    if (subject && subject !== 'all') studentRecs = studentRecs.filter(r => r.subject_code === subject || r.subject_name.includes(subject));
    if (student_id) studentRecs = studentRecs.filter(r => r.student_id === Number(student_id));
    if (startDate) studentRecs = studentRecs.filter(r => r.attendance_date >= startDate);
    if (endDate) studentRecs = studentRecs.filter(r => r.attendance_date <= endDate);
    if (month && year) {
      const prefix = `${year}-${String(month).padStart(2, '0')}`;
      studentRecs = studentRecs.filter(r => r.attendance_date.startsWith(prefix));
    }

    const total = studentRecs.length;
    const present = studentRecs.filter(r => r.status === 'Present').length;
    const absent = studentRecs.filter(r => r.status === 'Absent').length;
    const late = studentRecs.filter(r => r.status === 'Late').length;
    const excused = studentRecs.filter(r => r.status === 'Excused').length;
    const attended = present + late;
    const overallPct = total > 0 ? ((attended / total) * 100).toFixed(1) : '0.0';

    summary = {
      totalRecords: total,
      present,
      absent,
      late,
      excused,
      attended,
      overallPercentage: Number(overallPct),
      minRequired: minPercent,
      hasLowAttendanceWarning: Number(overallPct) < minPercent
    };

    rows = studentRecs.map(r => ({
      date: r.attendance_date,
      day: r.day,
      studentName: r.student_name,
      rollNo: r.roll_no,
      department: r.department_code,
      semester: r.semester,
      subject: `${r.subject_name} (${r.subject_code})`,
      faculty: r.faculty_name,
      period: r.class_period,
      time: `${r.start_time} - ${r.end_time}`,
      status: r.status,
      method: r.method,
      remarks: r.remarks
    }));
  } else {
    // Faculty reports
    let facultyRecs = store.faculty_attendance_records || [];
    if (faculty_id) facultyRecs = facultyRecs.filter(r => r.faculty_id === Number(faculty_id));
    if (department && department !== 'all') facultyRecs = facultyRecs.filter(r => r.department_code === department);
    if (startDate) facultyRecs = facultyRecs.filter(r => r.attendance_date >= startDate);
    if (endDate) facultyRecs = facultyRecs.filter(r => r.attendance_date <= endDate);
    if (month && year) {
      const prefix = `${year}-${String(month).padStart(2, '0')}`;
      facultyRecs = facultyRecs.filter(r => r.attendance_date.startsWith(prefix));
    }

    const totalDays = facultyRecs.length;
    const present = facultyRecs.filter(r => r.status === 'Present').length;
    const absent = facultyRecs.filter(r => r.status === 'Absent').length;
    const leave = facultyRecs.filter(r => r.status === 'On Leave').length;
    const late = facultyRecs.filter(r => r.status === 'Late').length;
    const halfDay = facultyRecs.filter(r => r.status === 'Half Day').length;
    const totalMinutes = facultyRecs.reduce((sum, r) => sum + (Number(r.working_minutes) || 0), 0);
    const score = present + late + (halfDay * 0.5);
    const pct = totalDays > 0 ? ((score / totalDays) * 100).toFixed(1) : '0.0';

    summary = {
      totalWorkingDays: totalDays,
      presentDays: present,
      absentDays: absent,
      leaveDays: leave,
      lateDays: late,
      halfDays: halfDay,
      totalWorkingHours: `${Math.floor(totalMinutes / 60)}h ${(totalMinutes % 60).toString().padStart(2, '0')}m`,
      attendancePercentage: Number(pct)
    };

    rows = facultyRecs.map(r => ({
      date: r.attendance_date,
      day: r.day,
      facultyName: r.faculty_name,
      department: r.department_code,
      checkIn: r.check_in || 'N/A',
      checkOut: r.check_out || 'N/A',
      workingHours: r.working_hours,
      status: r.status,
      leaveType: r.leave_type || '-',
      remarks: r.remarks
    }));
  }

  res.json({
    success: true,
    metadata: reportMetadata,
    summary,
    rows
  });
});

// 4.8 Admin & Leadership Attendance Overview Dashboard KPI Endpoint
router.get('/attendance/admin/overview', authenticateToken, requireRole('faculty', 'hod', 'director', 'dean', 'college_admin', 'super_admin'), (req, res) => {
  const store = getStore();
  const minPercent = rvsConfig.minAttendancePercent || 75;
  const todayStr = new Date().toISOString().split('T')[0];

  const studentRecs = store.attendance_records || [];
  const facultyRecs = store.faculty_attendance_records || [];

  // Today's student attendance
  const todayStudentRecs = studentRecs.filter(r => r.attendance_date === todayStr);
  const todayStudentPresent = todayStudentRecs.filter(r => r.status === 'Present' || r.status === 'Late').length;
  const todayStudentTotal = todayStudentRecs.length || 1;
  const todayStudentRate = todayStudentRecs.length > 0 ? ((todayStudentPresent / todayStudentRecs.length) * 100).toFixed(1) : '94.2';

  // Today's faculty attendance
  const todayFacRecs = facultyRecs.filter(r => r.attendance_date === todayStr);
  const todayFacPresent = todayFacRecs.filter(r => r.status === 'Present' || r.status === 'Late' || r.status === 'Half Day').length;
  const todayFacRate = todayFacRecs.length > 0 ? ((todayFacPresent / todayFacRecs.length) * 100).toFixed(1) : '95.5';

  // Find students with Low Attendance (< minPercent)
  const studentMap = {};
  studentRecs.forEach(r => {
    if (!studentMap[r.student_id]) {
      studentMap[r.student_id] = {
        id: r.student_id,
        name: r.student_name,
        rollNo: r.roll_no,
        department: r.department_code,
        semester: r.semester,
        total: 0,
        attended: 0
      };
    }
    studentMap[r.student_id].total++;
    if (r.status === 'Present' || r.status === 'Late') {
      studentMap[r.student_id].attended++;
    }
  });

  const lowAttendanceStudents = Object.values(studentMap)
    .map(s => {
      const pct = s.total > 0 ? Number(((s.attended / s.total) * 100).toFixed(1)) : 0;
      return { ...s, overallPct: pct };
    })
    .filter(s => s.overallPct < minPercent)
    .sort((a, b) => a.overallPct - b.overallPct);

  // Today's Absent Students
  const todayAbsentStudents = todayStudentRecs
    .filter(r => r.status === 'Absent')
    .map(r => ({
      id: r.student_id,
      name: r.student_name,
      rollNo: r.roll_no,
      department: r.department_code,
      subject: `${r.subject_name} (${r.subject_code})`,
      period: r.class_period
    }));

  // Today's Absent / On Leave Faculty
  const todayAbsentFaculty = todayFacRecs
    .filter(r => r.status === 'Absent' || r.status === 'On Leave')
    .map(r => ({
      id: r.faculty_id,
      name: r.faculty_name,
      department: r.department_code,
      status: r.status,
      leaveType: r.leave_type,
      remarks: r.remarks
    }));

  res.json({
    success: true,
    todayDate: todayStr,
    minAttendanceThreshold: minPercent,
    todayStudentAttendance: {
      rate: `${todayStudentRate}%`,
      presentCount: todayStudentPresent,
      totalClassesConducted: todayStudentRecs.length
    },
    todayFacultyAttendance: {
      rate: `${todayFacRate}%`,
      presentCount: todayFacPresent,
      totalFacultyRecorded: todayFacRecs.length
    },
    lowAttendanceStudents,
    todayAbsentStudents,
    todayAbsentFaculty,
    recentAudits: (store.attendance_audit_logs || []).slice(0, 5)
  });
});

// 4.9 Faculty generates a temporary QR code session
router.post('/attendance/qr/generate', authenticateToken, requireRole('faculty', 'college_admin'), (req, res) => {
  const store = getStore();
  const { course_id = 101, department_code = 'CSE', semester = '6th Semester', validityMinutes = 3 } = req.body;

  const course = store.courses.find(c => c.id === Number(course_id)) || store.courses[0];
  const token = `RVS-ATT-${department_code}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const expiresAt = new Date(Date.now() + validityMinutes * 60 * 1000).toISOString();

  // Deactivate prior active sessions for this course
  store.attendance_sessions = store.attendance_sessions || [];
  store.attendance_sessions.forEach(s => {
    if (s.course_id === Number(course_id)) s.is_active = false;
  });

  const session = {
    id: store.attendance_sessions.length > 0 ? Math.max(...store.attendance_sessions.map(s => s.id)) + 1 : 1,
    faculty_id: req.user.id,
    faculty_name: req.user.name,
    course_id: course.id,
    course_code: course.code,
    course_title: course.title,
    department_code,
    semester,
    date: new Date().toISOString().split('T')[0],
    qr_token: token,
    qr_expires_at: expiresAt,
    is_active: true,
    attendees: []
  };

  store.attendance_sessions.unshift(session);
  saveStore();

  res.status(201).json({
    success: true,
    message: `QR Attendance Session generated for ${course.code}`,
    session
  });
});

// 4.10 Student scans / submits QR attendance token (with persistent attendance_records writing)
router.post('/attendance/qr/scan', authenticateToken, (req, res) => {
  const store = getStore();
  const { qr_token } = req.body;
  const student = req.user;

  if (!qr_token) {
    return res.status(400).json({ success: false, message: 'QR token is required' });
  }

  const session = (store.attendance_sessions || []).find(s => s.qr_token === qr_token.trim());
  if (!session) {
    return res.status(404).json({ success: false, message: 'Invalid or unrecognized QR Attendance token.' });
  }

  if (!session.is_active || new Date(session.qr_expires_at) < new Date()) {
    return res.status(400).json({ success: false, message: 'This QR code has expired. Request faculty for a fresh code or manual sign-in.' });
  }

  session.attendees = session.attendees || [];
  if (session.attendees.some(a => a.student_id === student.id)) {
    return res.status(409).json({ success: false, message: 'Duplicate attendance prevented! You have already checked into this session.' });
  }

  const checkin = {
    student_id: student.id,
    student_name: student.name,
    email: student.email,
    checked_in_at: new Date().toISOString(),
    status: 'Present',
    verification: 'QR_SCANNED'
  };

  session.attendees.push(checkin);

  // Write permanent record to store.attendance_records
  store.attendance_records = store.attendance_records || [];
  const studentProfile = (store.students_profile || []).find(p => p.user_id === student.id) || {};
  const todayStr = new Date().toISOString().split('T')[0];
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = daysOfWeek[new Date().getDay()];

  const newRecord = {
    id: store.attendance_records.length > 0 ? Math.max(...store.attendance_records.map(r => r.id)) + 1 : 1,
    session_id: session.id,
    student_id: student.id,
    student_name: student.name,
    roll_no: studentProfile.roll_no || '23RVSCSE042',
    course_id: session.course_id,
    subject_name: session.course_title,
    subject_code: session.course_code,
    faculty_id: session.faculty_id,
    faculty_name: session.faculty_name || 'Prof. Jeevan Kumar',
    department_code: session.department_code,
    semester: session.semester,
    attendance_date: todayStr,
    day: dayName,
    class_period: 'Live QR Session',
    start_time: 'Current Period',
    end_time: 'Current Period',
    status: 'Present',
    method: 'QR',
    remarks: `Verified by QR token: ${qr_token.trim()}`,
    marked_by: session.faculty_id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  store.attendance_records.unshift(newRecord);
  saveStore();

  res.json({
    success: true,
    message: `Attendance marked successfully for ${session.course_code}: ${session.course_title}!`,
    checkin,
    record: newRecord
  });
});

// 4.11 Faculty Batch Manual Roll-Call Submission
router.post('/attendance/manual', authenticateToken, requireRole('faculty', 'college_admin'), (req, res) => {
  const store = getStore();
  const {
    course_id = 101,
    subject_code = 'CS-601',
    subject_name = 'Compiler Design',
    department_code = 'CSE',
    semester = '6th Semester',
    attendance_date,
    class_period = 'Period 1',
    roster = []
  } = req.body;

  if (!roster || roster.length === 0) {
    return res.status(400).json({ success: false, message: 'Roster is empty.' });
  }

  store.attendance_records = store.attendance_records || [];
  const dateStr = attendance_date || new Date().toISOString().split('T')[0];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = dayNames[new Date(dateStr).getDay()];

  let addedCount = 0;
  roster.forEach(item => {
    const existingIndex = store.attendance_records.findIndex(r => 
      r.student_id === item.id && 
      r.subject_code === subject_code && 
      r.attendance_date === dateStr
    );

    if (existingIndex >= 0) {
      store.attendance_records[existingIndex].status = item.status || 'Present';
      store.attendance_records[existingIndex].remarks = item.remarks || 'Updated via manual roll-call';
      store.attendance_records[existingIndex].updated_at = new Date().toISOString();
    } else {
      const newRec = {
        id: store.attendance_records.length > 0 ? Math.max(...store.attendance_records.map(r => r.id)) + 1 : 1,
        session_id: null,
        student_id: item.id,
        student_name: item.name,
        roll_no: item.roll || item.roll_no || '23RVSCSE042',
        course_id: Number(course_id),
        subject_name,
        subject_code,
        faculty_id: req.user.id,
        faculty_name: req.user.name,
        department_code,
        semester,
        attendance_date: dateStr,
        day: dayName,
        class_period,
        start_time: '09:00 AM',
        end_time: '10:00 AM',
        status: item.status || 'Present',
        method: 'Manual',
        remarks: item.remarks || 'Manual roll call',
        marked_by: req.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      store.attendance_records.unshift(newRec);
      addedCount++;
    }
  });

  saveStore();
  res.json({
    success: true,
    message: `Manual roll-call recorded for ${roster.length} students (${addedCount} new records created/updated).`
  });
});

// ==========================================
// 5. FEES MODULE & BRANDED PDF RECEIPT
// ==========================================
router.get('/fees', authenticateToken, (req, res) => {
  const store = getStore();
  const user = req.user;

  let feeRecords = store.student_fees || [];
  if (user.role === 'student') {
    feeRecords = feeRecords.filter(f => f.student_id === user.id);
  }

  const totalCollected = (store.student_fees || []).reduce((sum, f) => sum + Number(f.paid_amount || 0), 0);
  const totalPending = (store.student_fees || []).reduce((sum, f) => sum + Number(f.pending_amount || 0), 0);

  res.json({
    success: true,
    totalCollected,
    totalPending,
    feeRecords,
    fees: feeRecords
  });
});

// POST /api/rvs/fees/pay - Record student fee payment
router.post('/fees/pay', authenticateToken, (req, res) => {
  const store = getStore();
  const { fee_id, amount, payment_mode = 'Online UPI / NetBanking', transaction_ref } = req.body;
  const user = req.user;

  store.student_fees = store.student_fees || [];
  let record = store.student_fees.find(f => f.id === Number(fee_id));

  if (!record && user.role === 'student') {
    record = store.student_fees.find(f => f.student_id === user.id);
  }

  if (!record && store.student_fees.length > 0) {
    record = store.student_fees[0];
  }

  if (!record) {
    return res.status(404).json({ success: false, message: 'Fee ledger record not found.' });
  }

  const payAmount = Number(amount) || Number(record.pending_amount) || 25000;
  record.paid_amount = (Number(record.paid_amount) || 0) + payAmount;
  record.pending_amount = Math.max(0, (Number(record.total_amount) || 50000) - record.paid_amount);
  record.status = record.pending_amount === 0 ? 'PAID' : 'PARTIAL';
  record.payment_mode = payment_mode;
  record.receipt_no = record.receipt_no || `RVS/REC/2026/${String(record.id).padStart(4, '0')}`;
  record.payment_date = new Date().toISOString();
  record.transaction_ref = transaction_ref || `TXN-${Date.now()}`;

  saveStore();

  res.json({
    success: true,
    message: `Payment of ₹${payAmount.toLocaleString('en-IN')} recorded successfully. Receipt: ${record.receipt_no}`,
    record
  });
});

router.get('/fees/receipt/:id', authenticateToken, (req, res) => {
  const store = getStore();
  const feeId = Number(req.params.id);
  const record = (store.student_fees || []).find(f => f.id === feeId) || store.student_fees[0];

  if (!record) {
    return res.status(404).json({ success: false, message: 'Fee record not found' });
  }

  const receipt = {
    college: {
      name: rvsConfig.collegeName,
      address: rvsConfig.address,
      affiliation: rvsConfig.affiliation,
      phone: rvsConfig.phone,
      email: rvsConfig.email,
      website: rvsConfig.website
    },
    receiptNumber: record.receipt_no || `RVS/FEE/2026/${String(record.id).padStart(4, '0')}`,
    date: record.payment_date ? new Date(record.payment_date).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'),
    student: {
      name: record.student_name,
      rollNumber: record.roll_no,
      department: record.department,
      semester: record.semester,
      session: record.academic_session || '2025-2026'
    },
    breakdown: [
      { item: 'Tuition Fee', amount: 45000 },
      { item: 'Examination Fee (JUT)', amount: 2500 },
      { item: 'Campus Development Fee', amount: 5000 },
      { item: 'Scholarship / Fee Concession', amount: -Number(record.scholarship_discount || 0) },
      { item: 'Late Fine', amount: Number(record.fine_amount || 0) }
    ],
    totalPayable: record.total_amount,
    paidAmount: record.paid_amount,
    pendingBalance: record.pending_amount,
    status: record.status,
    paymentMode: record.payment_mode || 'Online Bank Transfer / JUT Portal',
    authorizedSignatory: 'Accounts Officer, RVS CET Jamshedpur'
  };

  res.json({ success: true, receipt });
});

// ==========================================
// 6. EXAMS, RESULTS & REPORT CARDS
// ==========================================
router.get('/results/report-card/:studentId', authenticateToken, (req, res) => {
  const store = getStore();
  const studentId = Number(req.params.studentId);
  const student = store.users.find(u => u.id === studentId) || req.user;
  const profile = (store.students_profile || []).find(p => p.user_id === student.id) || {};

  const results = (store.exam_results || []).filter(r => r.student_id === student.id || r.roll_no === profile.roll_no);

  let totalCredits = 0;
  let totalGradePoints = 0;

  const gradePointsMap = { 'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'P': 4, 'F': 0 };

  results.forEach(r => {
    const cred = r.credits || 4;
    const gp = gradePointsMap[r.grade] || 8;
    totalCredits += cred;
    totalGradePoints += (gp * cred);
  });

  const sgpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : '8.85';

  const reportCard = {
    college: {
      name: rvsConfig.collegeName,
      address: rvsConfig.address,
      affiliation: rvsConfig.affiliation
    },
    student: {
      name: student.name,
      rollNo: profile.roll_no || '23RVSCSE042',
      regNo: profile.reg_no || 'JUT/2023/CSE/0189',
      course: profile.course || 'B.Tech',
      department: profile.department_name || 'Computer Science & Engineering',
      semester: '5th Semester Examination',
      academicSession: '2025-2026'
    },
    subjects: results.length > 0 ? results : [
      { course_code: 'CS-501', course_title: 'Database Management Systems', internal: 27, mid_sem: 28, end_sem: 39, total: 94, grade: 'A+', credits: 4 },
      { course_code: 'CS-502', course_title: 'Operating Systems Internals', internal: 26, mid_sem: 26, end_sem: 38, total: 90, grade: 'A', credits: 4 },
      { course_code: 'CS-503', course_title: 'Theory of Computation', internal: 25, mid_sem: 24, end_sem: 36, total: 85, grade: 'A', credits: 4 },
      { course_code: 'CS-504', course_title: 'Software Engineering & Agile', internal: 28, mid_sem: 29, end_sem: 35, total: 92, grade: 'A+', credits: 3 },
      { course_code: 'CS-505P', course_title: 'DBMS & OS Laboratory', internal: 48, mid_sem: 0, end_sem: 48, total: 96, grade: 'O', credits: 2 }
    ],
    sgpa: sgpa,
    cgpa: '8.72',
    resultStatus: 'PASSED WITH DISTINCTION',
    issueDate: new Date().toLocaleDateString('en-IN'),
    controllerOfExaminations: 'Controller of Examinations, RVS CET & JUT'
  };

  res.json({ success: true, reportCard });
});

// ==========================================
// 7. TRAINING & PLACEMENTS MODULE
// ==========================================
router.get('/placements', authenticateToken, (req, res) => {
  const store = getStore();
  const drives = store.placements || [];

  const highestPackage = drives.length > 0 ? Math.max(...drives.map(d => d.package_lpa)) : 12.0;
  const avgPackage = drives.length > 0 ? (drives.reduce((a, b) => a + b.package_lpa, 0) / drives.length).toFixed(1) : 4.2;
  const totalPlaced = drives.reduce((a, b) => a + (b.selected_count || 0), 0) + 32;

  res.json({
    success: true,
    officialMarketingHeadline: rvsConfig.placementHeadlineStats,
    stats: {
      totalPlaced,
      highestPackage: `${highestPackage} LPA`,
      avgPackage: `${avgPackage} LPA`,
      totalDrives: drives.length,
      topRecruiters: ['Tata Steel', 'TCS', 'Capgemini', 'Vedanta', 'Wipro']
    },
    drives
  });
});


// ==========================================
// 8. STUDENT & FACULTY ID CARDS
// ==========================================
router.get('/id-card/:type/:id', authenticateToken, (req, res) => {
  const store = getStore();
  const { type, id } = req.params;
  const targetId = Number(id) || req.user.id;
  const targetUser = store.users.find(u => u.id === targetId) || req.user;

  if (type === 'student') {
    const prof = (store.students_profile || []).find(p => p.user_id === targetUser.id) || {};
    return res.json({
      success: true,
      card: {
        collegeName: rvsConfig.collegeName,
        campus: rvsConfig.campus,
        title: 'STUDENT IDENTITY CARD',
        photo: targetUser.avatar,
        name: targetUser.name,
        rollNo: prof.roll_no || '23RVSCSE042',
        regNo: prof.reg_no || 'JUT/2023/CSE/0189',
        department: prof.department_name || targetUser.department || 'Computer Science & Engineering',
        course: prof.course || 'B.Tech',
        batch: prof.batch || '2023-2027',
        validThru: 'July 2027',
        bloodGroup: 'B+',
        emergencyContact: prof.guardian_phone || '+91 94311 00000',
        qrData: `RVSCET:STU:${prof.roll_no || '23RVSCSE042'}:${targetUser.name}`
      }
    });
  }

  // Faculty ID card
  const fProf = (store.faculty_profile || []).find(p => p.user_id === targetUser.id) || {};
  return res.json({
    success: true,
    card: {
      collegeName: rvsConfig.collegeName,
      campus: rvsConfig.campus,
      title: 'FACULTY IDENTITY CARD',
      photo: targetUser.avatar,
      name: targetUser.name,
      employeeId: fProf.employee_id || 'RVS-EMP-CSE-104',
      department: targetUser.department || 'Computer Science & Engineering',
      designation: fProf.designation || 'Associate Professor & HOD',
      validThru: 'Permanent Academic Faculty',
      bloodGroup: 'O+',
      emergencyContact: targetUser.phone || '+91 94311 22444',
      qrData: `RVSCET:FAC:${fProf.employee_id || 'RVS-EMP-CSE-104'}:${targetUser.name}`
    }
  });
});

// ==========================================
// 9. LIBRARY MANAGEMENT
// ==========================================
router.get('/library/books', authenticateToken, (req, res) => {
  const store = getStore();
  res.json({ success: true, books: store.library_books || [] });
});

// POST /api/rvs/library/books - Add book to catalog (Admin / Librarian)
router.post('/library/books', authenticateToken, requireRole('super_admin', 'college_admin', 'faculty'), (req, res) => {
  const store = getStore();
  const { title, author, category = 'Computer Science', isbn, total_copies = 5, shelf = 'Stack A' } = req.body;

  if (!title || !author) {
    return res.status(400).json({ success: false, message: 'Title and author are required.' });
  }

  store.library_books = store.library_books || [];
  const count = Number(total_copies) || 5;

  const newBook = {
    id: store.library_books.length > 0 ? Math.max(...store.library_books.map(b => b.id)) + 1 : 1,
    title: title.trim(),
    author: author.trim(),
    category: category.trim(),
    isbn: isbn ? isbn.trim() : `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    total_copies: count,
    available_copies: count,
    shelf: shelf.trim(),
    created_at: new Date().toISOString()
  };

  store.library_books.unshift(newBook);
  saveStore();

  res.status(201).json({ success: true, message: `Book "${newBook.title}" added to central library catalog.`, book: newBook });
});

// GET /api/rvs/library/borrowed - List borrowed books
router.get('/library/borrowed', authenticateToken, (req, res) => {
  const store = getStore();
  const user = req.user;
  let issues = store.book_issues || [];

  if (user.role === 'student') {
    issues = issues.filter(b => b.user_id === user.id);
  }

  res.json({ success: true, borrowed: issues });
});

// POST /api/rvs/library/issue - Issue book to student
router.post('/library/issue', authenticateToken, requireRole('super_admin', 'college_admin', 'faculty'), (req, res) => {
  const store = getStore();
  const { book_id, student_id, student_name, roll_no, days = 14 } = req.body;

  store.library_books = store.library_books || [];
  const book = store.library_books.find(b => b.id === Number(book_id));

  if (!book) {
    return res.status(404).json({ success: false, message: 'Book not found in library inventory.' });
  }

  if (Number(book.available_copies) <= 0) {
    return res.status(400).json({ success: false, message: 'No copies currently available for issue.' });
  }

  book.available_copies = Math.max(0, Number(book.available_copies) - 1);

  store.book_issues = store.book_issues || [];
  const issueDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + Number(days));

  const newIssue = {
    id: store.book_issues.length > 0 ? Math.max(...store.book_issues.map(i => i.id)) + 1 : 1,
    book_id: book.id,
    book_title: book.title,
    user_id: Number(student_id) || req.user.id,
    user_name: student_name || 'Enrolled Student',
    roll_no: roll_no || '23RVSCSE042',
    issue_date: issueDate.toISOString().split('T')[0],
    due_date: dueDate.toISOString().split('T')[0],
    return_date: null,
    fine_amount: 0,
    status: 'ACTIVE'
  };

  store.book_issues.unshift(newIssue);
  saveStore();

  res.status(201).json({
    success: true,
    message: `"${book.title}" issued successfully. Due on ${newIssue.due_date}.`,
    issue: newIssue,
    available_copies: book.available_copies
  });
});

// POST /api/rvs/library/return - Return book
router.post('/library/return', authenticateToken, requireRole('super_admin', 'college_admin', 'faculty'), (req, res) => {
  const store = getStore();
  const { issue_id, book_id } = req.body;

  store.book_issues = store.book_issues || [];
  const issue = store.book_issues.find(i => i.id === Number(issue_id));

  if (!issue) {
    return res.status(404).json({ success: false, message: 'Borrowing transaction record not found.' });
  }

  issue.status = 'RETURNED';
  issue.return_date = new Date().toISOString().split('T')[0];

  store.library_books = store.library_books || [];
  const book = store.library_books.find(b => b.id === (issue.book_id || Number(book_id)));
  if (book) {
    book.available_copies = Math.min(Number(book.total_copies), Number(book.available_copies) + 1);
  }

  saveStore();

  res.json({
    success: true,
    message: `Book "${issue.book_title || (book ? book.title : 'Book')}" returned and inventory copy replenished.`,
    issue
  });
});

// ==========================================
// 10. NOTICE BOARD (Categorized)
// ==========================================
router.get('/notices', authenticateToken, (req, res) => {
  const store = getStore();
  const { category } = req.query;
  let list = store.announcements || [];

  if (category && category !== 'all') {
    list = list.filter(n => (n.category || 'General').toLowerCase() === category.toLowerCase());
  }

  res.json({ success: true, notices: list });
});

// ==========================================
// 11. TIMETABLES WITH CLASH DETECTION
// ==========================================
router.get('/timetable', authenticateToken, (req, res) => {
  const store = getStore();
  const { department = 'CSE', semester = '6th Semester' } = req.query;
  const list = (store.timetables || []).filter(t => t.department_code === department);
  res.json({ success: true, timetable: list });
});

router.post('/timetable', authenticateToken, requireRole('super_admin', 'college_admin'), (req, res) => {
  const store = getStore();
  const { department_code, semester, day, start_time, end_time, subject_code, subject_name, faculty_name, room_no } = req.body;

  // Clash Detection
  store.timetables = store.timetables || [];
  const roomClash = store.timetables.find(t => t.day === day && t.start_time === start_time && t.room_no === room_no);
  if (roomClash) {
    return res.status(409).json({
      success: false,
      message: `Classroom Clash detected! Room ${room_no} is already booked for ${roomClash.subject_name} (${roomClash.faculty_name}) at ${start_time}.`
    });
  }

  const facultyClash = store.timetables.find(t => t.day === day && t.start_time === start_time && t.faculty_name.toLowerCase() === faculty_name.toLowerCase());
  if (facultyClash) {
    return res.status(409).json({
      success: false,
      message: `Faculty Clash detected! ${faculty_name} is already scheduled in room ${facultyClash.room_no} at ${start_time}.`
    });
  }

  const newEntry = {
    id: store.timetables.length > 0 ? Math.max(...store.timetables.map(t => t.id)) + 1 : 1,
    department_code,
    semester,
    day,
    start_time,
    end_time,
    subject_code,
    subject_name,
    faculty_name,
    room_no
  };

  store.timetables.push(newEntry);
  saveStore();
  res.status(201).json({ success: true, message: 'Lecture scheduled without clashes', entry: newEntry });
});

// ==========================================
// 12. GRIEVANCES & LEAVES
// ==========================================
router.get('/grievances', authenticateToken, (req, res) => {
  const store = getStore();
  res.json({ success: true, grievances: store.grievances || [] });
});

router.post('/grievances', authenticateToken, (req, res) => {
  const store = getStore();
  const { category, subject, description } = req.body;
  if (!subject || !description) {
    return res.status(400).json({ success: false, message: 'Subject and description are required' });
  }

  const newG = {
    id: (store.grievances || []).length > 0 ? Math.max(...store.grievances.map(g => g.id)) + 1 : 1,
    student_id: req.user.id,
    student_name: req.user.name,
    category: category || 'General',
    subject,
    description,
    status: 'Open',
    admin_reply: null,
    created_at: new Date().toISOString()
  };

  store.grievances = store.grievances || [];
  store.grievances.unshift(newG);
  saveStore();
  res.status(201).json({ success: true, message: 'Grievance ticket registered', grievance: newG });
});

// ==========================================
// 13. ACADEMIC ASSIGNMENTS & SUBMISSIONS (PHASE 18)
// ==========================================

// GET /api/rvs/assignments
router.get('/assignments', authenticateToken, (req, res) => {
  const store = getStore();
  const user = req.user;
  let assignments = store.assignments || [];

  // If store.assignments is empty, initialize with default curriculum tasks
  if (assignments.length === 0) {
    assignments = [
      {
        id: 1,
        course_code: 'CS-601',
        title: 'Compiler Lexical Analyzer Implementation (Lex / Flex)',
        department: 'CSE',
        semester: '6th Semester',
        description: 'Construct DFA state transition tables and token stream handlers in C/Flex.',
        deadline: '2026-10-18',
        max_marks: 25,
        created_by_name: 'Prof. Rajesh Sharma',
        submissions: [
          {
            student_id: 4,
            student_name: 'Rahul Kumar Verma',
            roll_no: '23RVSCSE042',
            submitted_at: '2026-10-12T10:30:00.000Z',
            file_name: 'Lexical_Analyzer_23RVSCSE042.zip',
            marks: 24,
            feedback: 'Excellent DFA state transition table and token handling.',
            status: 'GRADED'
          }
        ]
      },
      {
        id: 2,
        course_code: 'CS-602',
        title: 'Simulation of Distance Vector Routing in NS-3',
        department: 'CSE',
        semester: '6th Semester',
        description: 'Simulate packet transmission, count-to-infinity problem and split horizon.',
        deadline: '2026-10-25',
        max_marks: 20,
        created_by_name: 'Prof. Smita Dash',
        submissions: []
      },
      {
        id: 3,
        course_code: 'CS-603',
        title: 'Docker Containerization & Kubernetes Deployment Lab',
        department: 'CSE',
        semester: '6th Semester',
        description: 'Multi-stage Dockerfile and deployment manifest with ClusterIP service.',
        deadline: '2026-11-02',
        max_marks: 30,
        created_by_name: 'Prof. Jeevan Kumar',
        submissions: []
      }
    ];
    store.assignments = assignments;
    saveStore();
  }

  // Format assignments for student view (include their submission status)
  const formatted = assignments.map(a => {
    const mySub = (a.submissions || []).find(s => s.student_id === user.id);
    return {
      ...a,
      submitted: Boolean(mySub),
      submission: user.role === 'student' ? mySub : undefined,
      submissions_count: (a.submissions || []).length,
      marks: mySub ? mySub.marks : null,
      feedback: mySub ? mySub.feedback : null
    };
  });

  res.json({ success: true, assignments: formatted, raw_submissions: user.role !== 'student' });
});

// POST /api/rvs/assignments - Create assignment (Faculty / Admin)
router.post('/assignments', authenticateToken, requireRole('super_admin', 'college_admin', 'faculty'), (req, res) => {
  const store = getStore();
  const { course_code, title, description, deadline, max_marks = 25, department = 'CSE', semester = '6th Semester' } = req.body;

  if (!course_code || !title) {
    return res.status(400).json({ success: false, message: 'Course code and assignment title are required.' });
  }

  store.assignments = store.assignments || [];
  const newAssignment = {
    id: store.assignments.length > 0 ? Math.max(...store.assignments.map(a => a.id)) + 1 : 1,
    course_code: course_code.trim().toUpperCase(),
    title: title.trim(),
    department: department || req.user.department || 'CSE',
    semester: semester || '6th Semester',
    description: description ? description.trim() : 'Complete coursework and submit lab archive.',
    deadline: deadline || '2026-11-15',
    max_marks: Number(max_marks) || 25,
    created_by_id: req.user.id,
    created_by_name: req.user.name,
    created_at: new Date().toISOString(),
    submissions: []
  };

  store.assignments.unshift(newAssignment);
  saveStore();

  res.status(201).json({ success: true, message: 'Assignment published to RVS LMS.', assignment: newAssignment });
});

// POST /api/rvs/assignments/:id/submit - Student submits assignment
router.post('/assignments/:id/submit', authenticateToken, (req, res) => {
  const store = getStore();
  const user = req.user;
  const assignmentId = Number(req.params.id);
  const { file_name, submission_text } = req.body;

  store.assignments = store.assignments || [];
  const assignment = store.assignments.find(a => a.id === assignmentId);

  if (!assignment) {
    return res.status(404).json({ success: false, message: 'Assignment not found.' });
  }

  assignment.submissions = assignment.submissions || [];
  // Remove prior submission if re-submitting before deadline
  assignment.submissions = assignment.submissions.filter(s => s.student_id !== user.id);

  const newSub = {
    student_id: user.id,
    student_name: user.name,
    roll_no: user.roll_no || `23RVSCSE${String(user.id).padStart(3, '0')}`,
    file_name: file_name || `Submission_${user.name.replace(/\s+/g, '_')}_Assgn${assignmentId}.pdf`,
    submission_text: submission_text || 'Completed as instructed.',
    submitted_at: new Date().toISOString(),
    status: 'SUBMITTED',
    marks: null,
    feedback: null
  };

  assignment.submissions.push(newSub);
  saveStore();

  res.status(201).json({ success: true, message: 'Assignment submitted successfully to course faculty!', submission: newSub });
});

// POST /api/rvs/assignments/:id/grade - Faculty reviews & grades submission
router.post('/assignments/:id/grade', authenticateToken, requireRole('super_admin', 'college_admin', 'faculty'), (req, res) => {
  const store = getStore();
  const assignmentId = Number(req.params.id);
  const { student_id, marks, feedback } = req.body;

  store.assignments = store.assignments || [];
  const assignment = store.assignments.find(a => a.id === assignmentId);

  if (!assignment) {
    return res.status(404).json({ success: false, message: 'Assignment not found.' });
  }

  const sub = (assignment.submissions || []).find(s => s.student_id === Number(student_id));
  if (!sub) {
    return res.status(404).json({ success: false, message: 'Student submission not found.' });
  }

  sub.marks = Number(marks);
  sub.feedback = feedback ? feedback.trim() : 'Good work.';
  sub.status = 'GRADED';
  sub.graded_by = req.user.name;
  sub.graded_at = new Date().toISOString();

  saveStore();

  res.json({ success: true, message: 'Marks and qualitative feedback saved.', submission: sub });
});

// ==========================================
// 14. ADMISSIONS PIPELINE & CONVERSION (PHASE 24)
// ==========================================

// POST /api/rvs/admissions/apply (Public Prospective Applicant Inquiry)
router.post('/admissions/apply', (req, res) => {
  const store = getStore();
  const {
    applicant_name,
    email,
    phone,
    program_code = 'BTECH-CSE',
    department_code = 'CSE',
    marks_12th_or_diploma = 85.5,
    entrance_exam = 'JEE Main',
    entrance_score = '88.5 Percentile',
    father_guardian_name,
    address
  } = req.body;

  if (!applicant_name || !email || !phone) {
    return res.status(400).json({ success: false, message: 'Applicant name, valid email, and contact phone are required.' });
  }

  store.admission_applications = store.admission_applications || [];
  const seq = store.admission_applications.length + 1;
  const application_no = `RVS-APP-2026-${String(seq).padStart(4, '0')}`;

  const newApp = {
    id: store.admission_applications.length > 0 ? Math.max(...store.admission_applications.map(a => a.id)) + 1 : 1,
    application_no,
    applicant_name: applicant_name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    program_code: program_code.trim().toUpperCase(),
    department_code: department_code.trim().toUpperCase(),
    marks_12th_or_diploma: Number(marks_12th_or_diploma) || 80.0,
    entrance_exam: entrance_exam || 'JEE Main',
    entrance_score: entrance_score || 'Qualified',
    father_guardian_name: father_guardian_name || 'Guardian',
    address: address || 'Jharkhand, India',
    status: 'SUBMITTED', // SUBMITTED, UNDER_REVIEW, OFFERED, ADMITTED, REJECTED
    documents_submitted: true,
    created_at: new Date().toISOString()
  };

  store.admission_applications.unshift(newApp);
  saveStore();

  res.status(201).json({
    success: true,
    message: `Application submitted successfully! Your official application reference is ${application_no}.`,
    application: newApp
  });
});

// GET /api/rvs/admissions/applications (Admin View)
router.get('/admissions/applications', authenticateToken, requireRole('super_admin', 'college_admin'), (req, res) => {
  const store = getStore();
  res.json({
    success: true,
    total: (store.admission_applications || []).length,
    applications: store.admission_applications || []
  });
});

// POST /api/rvs/admissions/applications/:id/status
router.post('/admissions/applications/:id/status', authenticateToken, requireRole('super_admin', 'college_admin'), (req, res) => {
  const store = getStore();
  const appId = Number(req.params.id);
  const { status, remarks } = req.body;

  store.admission_applications = store.admission_applications || [];
  const app = store.admission_applications.find(a => a.id === appId);

  if (!app) {
    return res.status(404).json({ success: false, message: 'Application not found.' });
  }

  app.status = status || app.status;
  app.remarks = remarks || app.remarks;
  app.reviewed_by = req.user.name;
  app.updated_at = new Date().toISOString();

  saveStore();

  res.json({ success: true, message: `Application status updated to ${app.status}.`, application: app });
});

// POST /api/rvs/admissions/applications/:id/convert-to-student (Convert Applicant to Student without duplicate)
router.post('/admissions/applications/:id/convert-to-student', authenticateToken, requireRole('super_admin', 'college_admin'), (req, res) => {
  const store = getStore();
  const appId = Number(req.params.id);
  const app = (store.admission_applications || []).find(a => a.id === appId);

  if (!app) {
    return res.status(404).json({ success: false, message: 'Application record not found.' });
  }

  if (app.status === 'ADMITTED' || app.converted_student_id) {
    return res.status(409).json({ success: false, message: 'This applicant has already been converted into an enrolled student.' });
  }

  store.users = store.users || [];
  store.students_profile = store.students_profile || [];

  // Check if email already enrolled
  const existingUser = store.users.find(u => u.email.toLowerCase() === app.email.toLowerCase());
  if (existingUser) {
    return res.status(409).json({ success: false, message: `A user with email ${app.email} is already registered.` });
  }

  const bcrypt = require('bcryptjs');
  const newUserId = store.users.length > 0 ? Math.max(...store.users.map(u => u.id)) + 1 : 1;
  const dept = app.department_code || 'CSE';
  const cleanRoll = `23RVS${dept}${String(newUserId).padStart(3, '0')}`;
  const cleanReg = `JUT/2026/${dept}/${String(newUserId).padStart(4, '0')}`;

  const newUser = {
    id: newUserId,
    name: app.applicant_name,
    email: app.email,
    password_hash: bcrypt.hashSync('Student@123', 10),
    role: 'student',
    college_id: 1,
    department: dept,
    phone: app.phone,
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    status: 'active',
    created_at: new Date().toISOString()
  };
  store.users.push(newUser);

  const newProfile = {
    id: store.students_profile.length > 0 ? Math.max(...store.students_profile.map(p => p.id)) + 1 : 1,
    user_id: newUserId,
    roll_no: cleanRoll,
    reg_no: cleanReg,
    admission_no: app.application_no,
    department_code: dept,
    department_name: dept === 'CSE' ? 'Computer Science & Engineering' : dept,
    course: `B.Tech ${dept}`,
    semester: '1st Semester',
    batch: '2026-2030',
    session: '2026-2027',
    admission_year: 2026,
    dob: '2005-01-01',
    gender: 'Male',
    address: app.address || 'Jamshedpur, Jharkhand',
    guardian_name: app.father_guardian_name || 'Guardian',
    guardian_phone: app.phone,
    guardian_email: app.email,
    guardian_address: app.address || 'Jamshedpur, Jharkhand',
    promotion_history: [],
    status: 'active'
  };
  store.students_profile.push(newProfile);

  app.status = 'ADMITTED';
  app.converted_student_id = newUserId;
  app.converted_at = new Date().toISOString();

  saveStore();

  res.status(201).json({
    success: true,
    message: `Applicant ${app.applicant_name} converted to enrolled student! Roll No: ${cleanRoll}, Reg: ${cleanReg}. Default password: Student@123`,
    student: { ...newUser, ...newProfile }
  });
});

// ==========================================
// 15. WEBSITE CMS MANAGEMENT (PHASE 28)
// ==========================================

// GET /api/rvs/cms/content - Public & Admin access
router.get('/cms/content', (req, res) => {
  const store = getStore();
  const cms = store.website_cms || {
    bannerHeadline: 'Empowering Engineering Excellence Since 1993',
    bannerSubtitle: 'Approved by AICTE, New Delhi & Affiliated to Jharkhand University of Technology (JUT), Ranchi. NAAC Accredited institution on NH-33 Jamshedpur.',
    admissionsNotice: 'Admissions Open for B.Tech & MCA 2026-2027 Session. Apply online or contact admissions desk at 7033000777.',
    placementHighlight: '86% Placed in 2025-26 with ₹9.0 LPA Top Package at Tata Steel, TCS & Vedanta.',
    campusAlert: 'JUT Odd Semester Examination Form Filling active through campus portal.',
    galleryImages: [
      { id: 1, title: 'Academic Block A & Admin Complex', url: 'https://images.unsplash.com/photo-1562774053-701939374585?w=600' },
      { id: 2, title: 'Computing Center & AI Lab', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600' },
      { id: 3, title: 'Central Library & DELNET E-Resource Hub', url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600' },
      { id: 4, title: 'Advanced Robotics & Automation Lab', url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600' }
    ]
  };
  res.json({ success: true, content: cms });
});

// POST /api/rvs/cms/content - Admin updates CMS content
router.post('/cms/content', authenticateToken, requireRole('super_admin', 'college_admin'), (req, res) => {
  const store = getStore();
  const updates = req.body;

  store.website_cms = { ...(store.website_cms || {}), ...updates, updated_at: new Date().toISOString() };
  saveStore();

  res.json({ success: true, message: 'Website CMS content updated and published successfully!', content: store.website_cms });
});

// GET /api/rvs/departments
router.get('/departments', (req, res) => {
  const store = getStore();
  res.json({ success: true, departments: store.departments || [] });
});

// GET /api/rvs/students (Admin, HOD, Director & Faculty access)
router.get('/students', authenticateToken, requireRole('faculty', 'hod', 'director', 'dean', 'college_admin', 'super_admin'), (req, res) => {
  const store = getStore();
  const students = (store.users || []).filter(u => u.role === 'student');
  res.json({ success: true, students, profiles: store.students_profile || [] });
});

// GET /api/rvs/faculty (Admin, HOD & Director access)
router.get('/faculty', authenticateToken, requireRole('faculty', 'hod', 'director', 'dean', 'college_admin', 'super_admin'), (req, res) => {
  const store = getStore();
  const faculty = (store.users || []).filter(u => u.role === 'faculty' || u.role === 'hod');
  res.json({ success: true, faculty, profiles: store.faculty_profile || [] });
});

// GET /api/rvs/exams
router.get('/exams', authenticateToken, (req, res) => {
  const store = getStore();
  const exams = store.exams || [
    { id: 1, name: 'JUT Odd Semester Mid-Term Examination 2026', type: 'Mid-Term', start_date: '2026-10-15', status: 'Scheduled' },
    { id: 2, name: 'JUT Odd Semester End-Term Practical Examination', type: 'Practical', start_date: '2026-11-20', status: 'Upcoming' },
    { id: 3, name: 'JUT End-Semester Theory Examination 2026', type: 'End-Term', start_date: '2026-12-05', status: 'Scheduled' }
  ];
  res.json({ success: true, exams });
});

// GET /api/rvs/results/summary
router.get('/results/summary', authenticateToken, (req, res) => {
  res.json({
    success: true,
    summary: {
      overallPassPercentage: 94.8,
      totalExamsConducted: 42,
      averageSgpa: 8.45,
      gradeDistribution: [
        { grade: 'O (90-100%)', count: 48 },
        { grade: 'A+ (80-89%)', count: 124 },
        { grade: 'A (70-79%)', count: 140 },
        { grade: 'B+ (60-69%)', count: 66 }
      ]
    }
  });
});

// GET /api/rvs/results/student
router.get('/results/student', authenticateToken, (req, res) => {
  const store = getStore();
  const user = req.user;
  const results = (store.exam_results || []).filter(r => r.student_id === user.id);
  res.json({
    success: true,
    studentName: user.name,
    cgpa: '8.72',
    sgpa: '8.80',
    results: results.length > 0 ? results : [
      { subject_code: 'CS-601', subject_name: 'Compiler Design', credits: 4, internal_marks: 28, external_marks: 62, total: 90, grade: 'O' },
      { subject_code: 'CS-602', subject_name: 'Computer Networks', credits: 4, internal_marks: 26, external_marks: 58, total: 84, grade: 'A+' },
      { subject_code: 'CS-603', subject_name: 'Cloud Computing', credits: 3, internal_marks: 25, external_marks: 55, total: 80, grade: 'A+' }
    ]
  });
});

// GET /api/rvs/results
router.get('/results', authenticateToken, (req, res) => {
  const store = getStore();
  res.json({ success: true, results: store.exam_results || [] });
});

module.exports = router;

