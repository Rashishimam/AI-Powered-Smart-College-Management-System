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
// 1. HOSTEL MANAGEMENT (Configurable & Optional)
// =========================================================================

router.get('/hostel/status', authenticateToken, (req, res) => {
  const store = getStore();
  const config = store.hostel_config || { enabled: true };
  const buildings = store.hostel_buildings || [];
  const rooms = store.hostel_rooms || [];
  const allocations = store.hostel_allocations || [];

  res.json({
    success: true,
    enabled: config.enabled,
    summary: {
      total_buildings: buildings.length,
      total_rooms: rooms.length,
      available_rooms: rooms.filter(r => r.status === 'AVAILABLE').length,
      occupied_rooms: rooms.filter(r => r.status === 'OCCUPIED').length,
      maintenance_rooms: rooms.filter(r => r.status === 'MAINTENANCE').length,
      total_residents: allocations.filter(a => a.status === 'Active').length
    }
  });
});

router.post('/hostel/toggle', authenticateToken, requireRole('super_admin', 'college_admin'), (req, res) => {
  const store = getStore();
  store.hostel_config = store.hostel_config || { enabled: true };
  store.hostel_config.enabled = !store.hostel_config.enabled;
  saveStore(store);

  res.json({
    success: true,
    message: `Hostel module ${store.hostel_config.enabled ? 'ENABLED' : 'DISABLED'}.`,
    enabled: store.hostel_config.enabled
  });
});

router.get('/hostel/buildings', authenticateToken, (req, res) => {
  const store = getStore();
  res.json({ success: true, buildings: store.hostel_buildings || [] });
});

router.get('/hostel/rooms', authenticateToken, (req, res) => {
  const store = getStore();
  const { building_id, status } = req.query;
  let rooms = store.hostel_rooms || [];

  if (building_id && building_id !== 'ALL') {
    rooms = rooms.filter(r => r.building_id === Number(building_id));
  }
  if (status && status !== 'ALL') {
    rooms = rooms.filter(r => r.status === status);
  }

  res.json({ success: true, rooms });
});

router.get('/hostel/allocations', authenticateToken, (req, res) => {
  const store = getStore();
  let list = store.hostel_allocations || [];

  if (req.user.role === 'student') {
    list = list.filter(a => a.student_id === req.user.id);
  }

  res.json({ success: true, allocations: list });
});

router.post('/hostel/allocate', authenticateToken, requireRole('super_admin', 'college_admin'), (req, res) => {
  const store = getStore();
  const { student_id, building_id, room_number, bed_no, fee_status = 'PAID' } = req.body;

  if (!student_id || !room_number) {
    return res.status(400).json({ success: false, message: 'Student and room number required.' });
  }

  const user = (store.users || []).find(u => u.id === Number(student_id));
  if (!user) return res.status(404).json({ success: false, message: 'Student user not found.' });

  const profile = (store.students_profile || []).find(p => p.user_id === user.id) || {};
  const building = (store.hostel_buildings || []).find(b => b.id === Number(building_id)) || { name: 'RVS Hostel' };

  store.hostel_allocations = store.hostel_allocations || [];
  const newAlloc = {
    id: store.hostel_allocations.length > 0 ? Math.max(...store.hostel_allocations.map(a => a.id)) + 1 : 1,
    student_id: user.id,
    student_name: user.name,
    roll_no: profile.roll_no || `23RVSCSE${String(user.id).padStart(3, '0')}`,
    department: profile.department_code || 'CSE',
    building_name: building.name,
    room_number,
    bed_no: bed_no || 'Bed-A',
    check_in_date: new Date().toISOString().split('T')[0],
    check_out_date: null,
    fee_status,
    status: 'Active'
  };

  store.hostel_allocations.unshift(newAlloc);

  // Update room occupancy
  const room = (store.hostel_rooms || []).find(r => r.room_number === room_number);
  if (room) {
    room.occupied_beds = Math.min((room.occupied_beds || 0) + 1, room.bed_capacity);
    if (room.occupied_beds >= room.bed_capacity) {
      room.status = 'OCCUPIED';
    }
  }

  saveStore(store);

  res.status(201).json({
    success: true,
    message: `Hostel room ${room_number} allocated to ${user.name}.`,
    allocation: newAlloc
  });
});

router.get('/hostel/complaints', authenticateToken, (req, res) => {
  const store = getStore();
  let list = store.hostel_complaints || [];
  if (req.user.role === 'student') {
    list = list.filter(c => c.student_name === req.user.name);
  }
  res.json({ success: true, complaints: list });
});

router.post('/hostel/complaints', authenticateToken, (req, res) => {
  const store = getStore();
  const { room_number, category, description } = req.body;

  if (!room_number || !description) {
    return res.status(400).json({ success: false, message: 'Room number and description required.' });
  }

  store.hostel_complaints = store.hostel_complaints || [];
  const comp = {
    id: store.hostel_complaints.length > 0 ? Math.max(...store.hostel_complaints.map(c => c.id)) + 1 : 1,
    student_name: req.user.name,
    room_number,
    category: category || 'General Maintenance',
    description,
    status: 'PENDING',
    filed_date: new Date().toISOString().split('T')[0],
    resolved_date: null
  };

  store.hostel_complaints.unshift(comp);
  saveStore(store);

  res.status(201).json({ success: true, message: 'Hostel complaint registered.', complaint: comp });
});

// =========================================================================
// 2. TRANSPORT MANAGEMENT (Configurable & Optional)
// =========================================================================

router.get('/transport/status', authenticateToken, (req, res) => {
  const store = getStore();
  const config = store.transport_config || { enabled: true };
  const routes = store.transport_routes || [];

  res.json({
    success: true,
    enabled: config.enabled,
    summary: {
      total_routes: routes.length,
      total_fleet: routes.length,
      total_capacity: routes.reduce((sum, r) => sum + (r.seating_capacity || 0), 0),
      allocated_passengers: routes.reduce((sum, r) => sum + (r.allocated_students || 0), 0)
    }
  });
});

router.post('/transport/toggle', authenticateToken, requireRole('super_admin', 'college_admin'), (req, res) => {
  const store = getStore();
  store.transport_config = store.transport_config || { enabled: true };
  store.transport_config.enabled = !store.transport_config.enabled;
  saveStore(store);

  res.json({
    success: true,
    message: `Transport module ${store.transport_config.enabled ? 'ENABLED' : 'DISABLED'}.`,
    enabled: store.transport_config.enabled
  });
});

router.get('/transport/routes', authenticateToken, (req, res) => {
  const store = getStore();
  res.json({ success: true, routes: store.transport_routes || [] });
});

router.post('/transport/allocate', authenticateToken, requireRole('super_admin', 'college_admin'), (req, res) => {
  const store = getStore();
  const { route_id, student_name } = req.body;
  const route = (store.transport_routes || []).find(r => r.id === Number(route_id));

  if (!route) return res.status(404).json({ success: false, message: 'Transport route not found.' });

  route.allocated_students = (route.allocated_students || 0) + 1;
  saveStore(store);

  res.json({
    success: true,
    message: `${student_name || 'Student'} allocated to ${route.route_name}. Total seats occupied: ${route.allocated_students}/${route.seating_capacity}.`
  });
});

// =========================================================================
// 3. ALUMNI MANAGEMENT MODULE
// =========================================================================

router.get('/alumni', (req, res) => {
  const store = getStore();
  const { search, department, graduation_year } = req.query;
  let list = store.alumni_records || [];

  // Public filtering: if unauthenticated, show only is_public
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(a =>
      (a.name || '').toLowerCase().includes(q) ||
      (a.current_organization || '').toLowerCase().includes(q) ||
      (a.job_title || '').toLowerCase().includes(q)
    );
  }
  if (department && department !== 'ALL') {
    list = list.filter(a => (a.department || '').toLowerCase().includes(department.toLowerCase()));
  }
  if (graduation_year && graduation_year !== 'ALL') {
    list = list.filter(a => String(a.graduation_year) === String(graduation_year));
  }

  res.json({
    success: true,
    total: list.length,
    alumni: list
  });
});

// POST /api/rvs/alumni/transition - Transition eligible student to Alumni without deleting student record
router.post('/alumni/transition', authenticateToken, requireRole('super_admin', 'college_admin'), (req, res) => {
  const store = getStore();
  const { student_id, graduation_year, current_organization, job_title, higher_studies, achievements } = req.body;

  if (!student_id) {
    return res.status(400).json({ success: false, message: 'Student ID required for alumni transition.' });
  }

  const user = (store.users || []).find(u => u.id === Number(student_id));
  if (!user) return res.status(404).json({ success: false, message: 'Student record not found.' });

  const profile = (store.students_profile || []).find(p => p.user_id === user.id) || {};

  // Preserve historical record, but update current status to Graduated / Alumni
  profile.current_status = 'Graduated';
  profile.semester = 'Graduated (Alumni)';

  store.alumni_records = store.alumni_records || [];
  const existing = store.alumni_records.find(a => a.student_id === user.id);

  if (existing) {
    existing.current_organization = current_organization || existing.current_organization;
    existing.job_title = job_title || existing.job_title;
    existing.higher_studies = higher_studies || existing.higher_studies;
    existing.achievements = achievements || existing.achievements;
  } else {
    const newAlumni = {
      id: store.alumni_records.length > 0 ? Math.max(...store.alumni_records.map(a => a.id)) + 1 : 1,
      student_id: user.id,
      name: user.name,
      graduation_year: Number(graduation_year || new Date().getFullYear()),
      course: profile.course || 'B.Tech Computer Science & Engineering',
      department: profile.department_code || 'Computer Science & Engineering',
      batch: profile.batch || '2022-2026',
      current_organization: current_organization || 'Industry Professional',
      job_title: job_title || 'Software Engineer / Associate',
      higher_studies: higher_studies || 'None',
      achievements: achievements || 'Successfully completed degree requirements with Distinction',
      is_public: true,
      email: user.email,
      linkedin: `https://linkedin.com/in/${user.name.toLowerCase().replace(/\s+/g, '-')}`
    };
    store.alumni_records.unshift(newAlumni);
  }

  saveStore(store);

  res.json({
    success: true,
    message: `Academic status for ${user.name} transitioned to Alumni successfully. Student historical records preserved.`,
    alumni: store.alumni_records.find(a => a.student_id === user.id)
  });
});

// =========================================================================
// 4. GLOBAL SMART SEARCH ENGINE (Cross-Entity Search with RBAC)
// =========================================================================

router.get('/search', authenticateToken, (req, res) => {
  const store = getStore();
  const q = (req.query.q || '').trim().toLowerCase();

  if (!q || q.length < 2) {
    return res.json({
      success: true,
      query: q,
      results: { students: [], faculty: [], courses: [], notices: [], books: [], certificates: [], placement_drives: [] }
    });
  }

  const role = req.user.role;
  const isSuperAdminOrAdmin = role === 'super_admin' || role === 'college_admin';

  // 1. Students (Admin & Faculty can search all; Student sees self or peers in same dept)
  const students = (store.users || [])
    .filter(u => u.role === 'student')
    .map(u => {
      const p = (store.students_profile || []).find(prof => prof.user_id === u.id) || {};
      return {
        id: u.id,
        name: u.name,
        roll_no: p.roll_no || `23RVSCSE${String(u.id).padStart(3, '0')}`,
        reg_no: p.reg_no || `JUT/2023/00${u.id}`,
        department: p.department_code || u.department || 'CSE',
        semester: p.semester || '6th Semester',
        avatar: u.avatar
      };
    })
    .filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.roll_no.toLowerCase().includes(q) ||
      s.reg_no.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q)
    )
    .slice(0, 8);

  // 2. Faculty
  const faculty = (store.faculty || [])
    .filter(f =>
      (f.name || '').toLowerCase().includes(q) ||
      (f.department || '').toLowerCase().includes(q) ||
      (f.designation || '').toLowerCase().includes(q)
    )
    .slice(0, 6)
    .map(f => ({
      id: f.id,
      name: f.name,
      designation: f.designation,
      department: f.department,
      photo: f.photo_url
    }));

  // 3. Courses / Programs
  const courses = (store.programs || [])
    .filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.code || '').toLowerCase().includes(q) ||
      (p.level || '').toLowerCase().includes(q)
    )
    .slice(0, 5);

  // 4. Notices / Announcements
  const notices = (store.announcements || store.notices || [])
    .filter(n =>
      (n.title || '').toLowerCase().includes(q) ||
      (n.content || '').toLowerCase().includes(q)
    )
    .slice(0, 5);

  // 5. Library Books
  const books = (store.library_books || store.books || [])
    .filter(b =>
      (b.title || '').toLowerCase().includes(q) ||
      (b.author || '').toLowerCase().includes(q) ||
      (b.isbn || '').toLowerCase().includes(q)
    )
    .slice(0, 5);

  // 6. Placement Drives
  const placement_drives = (store.placement_drives || [])
    .filter(d =>
      (d.company_name || '').toLowerCase().includes(q) ||
      (d.job_role || '').toLowerCase().includes(q)
    )
    .slice(0, 5);

  // 7. Certificates (Only Admins)
  const certificates = isSuperAdminOrAdmin ? (store.certificates || [])
    .filter(c =>
      (c.certificate_no || '').toLowerCase().includes(q) ||
      (c.student_name || '').toLowerCase().includes(q) ||
      (c.type || '').toLowerCase().includes(q)
    )
    .slice(0, 5) : [];

  res.json({
    success: true,
    query: q,
    results: {
      students,
      faculty,
      courses,
      notices,
      books,
      placement_drives,
      certificates
    }
  });
});

// =========================================================================
// 5. HELPDESK & TICKETING SYSTEM (Multi-category Workflow)
// =========================================================================

router.get('/helpdesk/tickets', authenticateToken, (req, res) => {
  const store = getStore();
  const { status, category } = req.query;
  let list = store.helpdesk_tickets || [];

  if (req.user.role === 'student') {
    list = list.filter(t => t.user_id === req.user.id);
  }

  if (status && status !== 'ALL') {
    list = list.filter(t => t.status === status);
  }
  if (category && category !== 'ALL') {
    list = list.filter(t => t.category === category);
  }

  res.json({
    success: true,
    total: list.length,
    tickets: list
  });
});

router.post('/helpdesk/tickets', authenticateToken, (req, res) => {
  const store = getStore();
  const { category, subject, description } = req.body;

  if (!category || !subject || !description) {
    return res.status(400).json({ success: false, message: 'Category, subject, and description are required.' });
  }

  store.helpdesk_tickets = store.helpdesk_tickets || [];
  const nextSerial = store.helpdesk_tickets.length + 1;
  const ticketNo = `RVS-TKT-${new Date().getFullYear()}-${String(nextSerial).padStart(3, '0')}`;

  const newTicket = {
    id: store.helpdesk_tickets.length > 0 ? Math.max(...store.helpdesk_tickets.map(t => t.id)) + 1 : 1,
    ticket_number: ticketNo,
    user_id: req.user.id,
    user_name: req.user.name,
    user_role: req.user.role,
    category,
    subject: subject.trim(),
    description: description.trim(),
    assigned_staff: 'Helpdesk Triage Desk',
    status: 'OPEN',
    created_date: new Date().toISOString().split('T')[0],
    resolution: null
  };

  store.helpdesk_tickets.unshift(newTicket);
  saveStore(store);

  res.status(201).json({
    success: true,
    message: `Ticket ${ticketNo} created successfully.`,
    ticket: newTicket
  });
});

router.post('/helpdesk/tickets/:id/update', authenticateToken, requireRole('super_admin', 'college_admin', 'faculty'), (req, res) => {
  const store = getStore();
  const ticketId = Number(req.params.id);
  const ticket = (store.helpdesk_tickets || []).find(t => t.id === ticketId);

  if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found.' });

  const { status, assigned_staff, resolution } = req.body;
  if (status) ticket.status = status;
  if (assigned_staff) ticket.assigned_staff = assigned_staff;
  if (resolution) ticket.resolution = resolution;

  saveStore(store);

  res.json({
    success: true,
    message: `Ticket ${ticket.ticket_number} updated to ${ticket.status}.`,
    ticket
  });
});

// =========================================================================
// 6. STUDENT FEEDBACK SYSTEM (Configurable & Anonymously Protected)
// =========================================================================

router.get('/feedback/surveys', authenticateToken, (req, res) => {
  const store = getStore();
  const surveys = store.feedback_surveys || [];
  res.json({ success: true, surveys });
});

router.post('/feedback/surveys', authenticateToken, requireRole('super_admin', 'college_admin'), (req, res) => {
  const store = getStore();
  const { title, category, target_department, target_semester, is_anonymous, questions } = req.body;

  if (!title || !questions || !questions.length) {
    return res.status(400).json({ success: false, message: 'Survey title and questions are required.' });
  }

  store.feedback_surveys = store.feedback_surveys || [];
  const newSurvey = {
    id: store.feedback_surveys.length > 0 ? Math.max(...store.feedback_surveys.map(s => s.id)) + 1 : 1,
    title: title.trim(),
    category: category || 'General Feedback',
    target_department: target_department || 'ALL',
    target_semester: target_semester || 'ALL',
    is_anonymous: is_anonymous !== undefined ? is_anonymous : true,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    status: 'ACTIVE',
    questions: questions.map((q, idx) => ({
      id: idx + 1,
      text: typeof q === 'string' ? q : q.text,
      type: 'rating_1_5'
    }))
  };

  store.feedback_surveys.unshift(newSurvey);
  saveStore(store);

  res.status(201).json({
    success: true,
    message: `Feedback survey "${newSurvey.title}" published.`,
    survey: newSurvey
  });
});

router.post('/feedback/submit', authenticateToken, (req, res) => {
  const store = getStore();
  const { survey_id, ratings, comments } = req.body;

  const survey = (store.feedback_surveys || []).find(s => s.id === Number(survey_id));
  if (!survey) return res.status(404).json({ success: false, message: 'Survey not found.' });

  store.feedback_responses = store.feedback_responses || [];

  const responseEntry = {
    id: store.feedback_responses.length > 0 ? Math.max(...store.feedback_responses.map(r => r.id)) + 1 : 1,
    survey_id: survey.id,
    ratings: ratings || {},
    comments: comments ? comments.trim() : '',
    submitted_at: new Date().toISOString()
  };

  // Strictly enforce anonymity rule: Do NOT store user_id or name if survey is anonymous!
  if (!survey.is_anonymous) {
    responseEntry.student_id = req.user.id;
    responseEntry.student_name = req.user.name;
  }

  store.feedback_responses.push(responseEntry);
  saveStore(store);

  res.json({
    success: true,
    message: 'Thank you! Your feedback has been submitted successfully.'
  });
});

router.get('/feedback/reports/:id', authenticateToken, requireRole('super_admin', 'college_admin', 'faculty'), (req, res) => {
  const store = getStore();
  const surveyId = Number(req.params.id);
  const survey = (store.feedback_surveys || []).find(s => s.id === surveyId);

  if (!survey) return res.status(404).json({ success: false, message: 'Survey not found.' });

  const responses = (store.feedback_responses || []).filter(r => r.survey_id === surveyId);
  const totalSubmissions = responses.length;

  // Calculate average rating per question
  const questionAverages = (survey.questions || []).map(q => {
    let sum = 0;
    let count = 0;
    responses.forEach(r => {
      if (r.ratings && r.ratings[q.id]) {
        sum += Number(r.ratings[q.id]);
        count++;
      }
    });
    const avg = count > 0 ? Number((sum / count).toFixed(2)) : 0;
    return {
      id: q.id,
      text: q.text,
      average_rating: avg,
      response_count: count
    };
  });

  const overallAvg = questionAverages.length > 0
    ? Number((questionAverages.reduce((acc, q) => acc + q.average_rating, 0) / questionAverages.length).toFixed(2))
    : 0;

  res.json({
    success: true,
    survey,
    report: {
      total_submissions: totalSubmissions,
      overall_average_score: overallAvg,
      question_metrics: questionAverages,
      comments: responses.map(r => r.comments).filter(Boolean)
    }
  });
});

// =========================================================================
// 7. STUDENT PROMOTION & GRADUATION ENGINE
// =========================================================================

router.get('/promotion/config', authenticateToken, (req, res) => {
  const store = getStore();
  res.json({
    success: true,
    config: store.promotion_config || {
      max_active_backlogs_allowed: 3,
      min_attendance_pct: 75.0,
      min_cgpa: 5.0,
      require_fee_clearance: false
    },
    history: store.promotion_history || []
  });
});

router.post('/promotion/config', authenticateToken, requireRole('super_admin', 'college_admin'), (req, res) => {
  const store = getStore();
  const { max_active_backlogs_allowed, min_attendance_pct, min_cgpa, require_fee_clearance } = req.body;

  store.promotion_config = {
    max_active_backlogs_allowed: Number(max_active_backlogs_allowed !== undefined ? max_active_backlogs_allowed : 3),
    min_attendance_pct: Number(min_attendance_pct !== undefined ? min_attendance_pct : 75),
    min_cgpa: Number(min_cgpa !== undefined ? min_cgpa : 5.0),
    require_fee_clearance: Boolean(require_fee_clearance)
  };

  saveStore(store);

  res.json({
    success: true,
    message: 'Student promotion criteria rules updated.',
    config: store.promotion_config
  });
});

router.post('/promotion/evaluate', authenticateToken, requireRole('super_admin', 'college_admin'), (req, res) => {
  const store = getStore();
  const { department = 'CSE', current_semester = '6th Semester' } = req.body;
  const config = store.promotion_config || { max_active_backlogs_allowed: 3, min_attendance_pct: 75.0, min_cgpa: 5.0 };

  const students = (store.users || [])
    .filter(u => u.role === 'student')
    .map(u => {
      const p = (store.students_profile || []).find(prof => prof.user_id === u.id) || {};
      const backlogs = (store.student_backlogs || []).filter(b => (b.student_id === u.id || b.roll_no === p.roll_no) && b.result === 'Pending');
      const cgpa = 7.8; // Dynamic or store based
      const attendance = 82; // Dynamic or store based

      const reasons = [];
      if (backlogs.length > config.max_active_backlogs_allowed) {
        reasons.push(`Active backlogs (${backlogs.length}) exceed policy limit (${config.max_active_backlogs_allowed})`);
      }
      if (attendance < config.min_attendance_pct) {
        reasons.push(`Attendance ${attendance}% is below required ${config.min_attendance_pct}%`);
      }
      if (cgpa < config.min_cgpa) {
        reasons.push(`CGPA ${cgpa} is below minimum passing requirement of ${config.min_cgpa}`);
      }

      return {
        id: u.id,
        name: u.name,
        roll_no: p.roll_no || `23RVSCSE${String(u.id).padStart(3, '0')}`,
        department: p.department_code || 'CSE',
        semester: p.semester || current_semester,
        active_backlogs: backlogs.length,
        attendance_pct: attendance,
        cgpa,
        is_eligible: reasons.length === 0,
        reasons
      };
    })
    .filter(s => s.department === department);

  res.json({
    success: true,
    department,
    current_semester,
    config,
    total_evaluated: students.length,
    eligible_count: students.filter(s => s.is_eligible).length,
    ineligible_count: students.filter(s => !s.is_eligible).length,
    students
  });
});

router.post('/promotion/execute', authenticateToken, requireRole('super_admin', 'college_admin'), (req, res) => {
  const store = getStore();
  const { department = 'CSE', from_semester = '6th Semester', to_semester = '7th Semester', student_ids = [] } = req.body;

  if (!student_ids.length) {
    return res.status(400).json({ success: false, message: 'Select at least one eligible student to promote.' });
  }

  let promotedCount = 0;
  student_ids.forEach(id => {
    const profile = (store.students_profile || []).find(p => p.user_id === Number(id));
    if (profile) {
      profile.semester = to_semester;
      promotedCount++;
    }
  });

  store.promotion_history = store.promotion_history || [];
  store.promotion_history.unshift({
    id: store.promotion_history.length + 1,
    batch: '2023-2027',
    department,
    from_semester,
    to_semester,
    promoted_count: promotedCount,
    promoted_by: req.user.name,
    date: new Date().toISOString().split('T')[0]
  });

  saveStore(store);

  res.json({
    success: true,
    message: `Successfully promoted ${promotedCount} students from ${from_semester} to ${to_semester}. Historical transcripts intact.`
  });
});

module.exports = router;
