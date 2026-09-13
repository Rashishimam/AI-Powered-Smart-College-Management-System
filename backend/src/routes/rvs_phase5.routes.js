const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const storePath = path.resolve(__dirname, '../../data/campusiq_store.json');

function getStore() {
  return JSON.parse(fs.readFileSync(storePath, 'utf8'));
}

function saveStore() {
  // Store is read on demand
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
// 1. GATE ENTRY / EXIT MODULE
// =========================================================================

// GET /api/rvs/gate/stats - Summary metrics
router.get('/gate/stats', authenticateToken, (req, res) => {
  const store = getStore();
  const today = new Date().toISOString().split('T')[0];
  const logs = (store.gate_logs || []).filter(l => l.date === today);

  const currentlyInside = logs.filter(l => l.status === 'Inside Campus').length;
  const totalEntries = logs.length;
  const studentEntries = logs.filter(l => l.user_type === 'student').length;
  const facultyEntries = logs.filter(l => l.user_type === 'faculty').length;

  res.json({
    success: true,
    stats: {
      date: today,
      currently_inside: currentlyInside,
      total_entries_today: totalEntries,
      student_entries: studentEntries,
      faculty_entries: facultyEntries
    }
  });
});

// GET /api/rvs/gate/logs - Filtered gate access logs
router.get('/gate/logs', authenticateToken, (req, res) => {
  const store = getStore();
  const { date, user_type, department, status, search } = req.query;
  let logs = store.gate_logs || [];

  if (date) {
    logs = logs.filter(l => l.date === date);
  }
  if (user_type && user_type !== 'ALL') {
    logs = logs.filter(l => l.user_type === user_type);
  }
  if (department && department !== 'ALL') {
    logs = logs.filter(l => (l.department || '').toLowerCase().includes(department.toLowerCase()));
  }
  if (status && status !== 'ALL') {
    logs = logs.filter(l => l.status === status);
  }
  if (search) {
    const q = search.toLowerCase();
    logs = logs.filter(l =>
      (l.person_name || '').toLowerCase().includes(q) ||
      (l.roll_or_emp_id || '').toLowerCase().includes(q) ||
      (l.gate || '').toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    total: logs.length,
    logs
  });
});

// POST /api/rvs/gate/scan - Scan ID / QR for Gate Entry or Exit
router.post('/gate/scan', authenticateToken, requireRole('super_admin', 'college_admin', 'security', 'faculty'), (req, res) => {
  const store = getStore();
  const { identifier, gate = 'Main Gate 1', action = 'auto', method = 'QR Code Scanner' } = req.body;

  if (!identifier) {
    return res.status(400).json({ success: false, message: 'Student Roll No / Faculty Employee ID is required for gate scan.' });
  }

  const queryId = identifier.trim().toLowerCase();
  const today = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  // 1. Look up student profile in store
  const studentProfile = (store.students_profile || []).find(p =>
    (p.roll_no || '').toLowerCase() === queryId ||
    (p.reg_no || '').toLowerCase() === queryId ||
    (p.admission_no || '').toLowerCase() === queryId
  );

  let student = null;
  if (studentProfile) {
    const u = (store.users || []).find(user => user.id === studentProfile.user_id);
    student = {
      id: studentProfile.user_id,
      name: u ? u.name : (studentProfile.name || 'Student'),
      roll_no: studentProfile.roll_no || `23RVSCSE${String(studentProfile.user_id).padStart(3, '0')}`,
      department: studentProfile.department_code || 'CSE'
    };
  } else {
    // Check students in users table
    const stuUser = (store.users || []).find(u =>
      (u.role === 'student') && (
        String(u.id) === queryId ||
        (u.email || '').toLowerCase() === queryId ||
        (u.name || '').toLowerCase().includes(queryId) ||
        `23rvscse${String(u.id).padStart(3, '0')}` === queryId ||
        queryId.includes(String(u.id))
      )
    );
    if (stuUser) {
      student = {
        id: stuUser.id,
        name: stuUser.name,
        roll_no: `23RVSCSE${String(stuUser.id).padStart(3, '0')}`,
        department: stuUser.department || 'CSE'
      };
    }
  }

  // 2. Look up faculty
  const faculty = !student ? (
    (store.faculty || []).find(f =>
      (f.name || '').toLowerCase().includes(queryId) ||
      (f.employee_code || '').toLowerCase() === queryId ||
      (f.email || '').toLowerCase() === queryId
    ) ||
    (store.users || []).find(u =>
      u.role === 'faculty' && (
        String(u.id) === queryId ||
        (u.name || '').toLowerCase().includes(queryId) ||
        (u.email || '').toLowerCase() === queryId
      )
    )
  ) : null;

  // 3. Fallback to any user
  const generalUser = (!student && !faculty) ? (store.users || []).find(u =>
    String(u.id) === queryId ||
    (u.email || '').toLowerCase() === queryId ||
    (u.name || '').toLowerCase().includes(queryId)
  ) : null;

  if (!student && !faculty && !generalUser) {
    return res.status(404).json({
      success: false,
      message: `No active student or faculty record matches "${identifier}". Please verify ID or direct to Security Desk for visitor pass.`
    });
  }

  store.gate_logs = store.gate_logs || [];

  let personName = '';
  let userType = 'student';
  let rollOrEmp = '';
  let dept = 'Campus General';
  let personId = 1;

  if (student) {
    personName = student.name;
    userType = 'student';
    rollOrEmp = student.roll_no;
    dept = student.department;
    personId = student.id;
  } else if (faculty) {
    personName = faculty.name;
    userType = 'faculty';
    rollOrEmp = faculty.employee_code || `EMP-00${faculty.id}`;
    dept = faculty.department || 'Academics';
    personId = faculty.id;
  } else {
    personName = generalUser.name;
    userType = generalUser.role === 'faculty' ? 'faculty' : 'student';
    rollOrEmp = generalUser.email;
    dept = generalUser.department || 'Administration';
    personId = generalUser.id;
  }

  // Find if person is currently inside campus today
  const activeEntry = store.gate_logs.find(l =>
    l.date === today &&
    l.roll_or_emp_id.toLowerCase() === rollOrEmp.toLowerCase() &&
    l.status === 'Inside Campus'
  );

  let resultStatus = '';
  let eventType = '';

  if (action === 'exit' || (action === 'auto' && activeEntry)) {
    // Record exit
    eventType = 'Campus Exit';
    if (activeEntry) {
      activeEntry.exit_time = currentTime;
      activeEntry.status = 'Exited';
      resultStatus = `Exit recorded for ${personName} at ${gate}. Status: Exited.`;
    } else {
      // Create retroactive exited log
      const newLog = {
        id: store.gate_logs.length > 0 ? Math.max(...store.gate_logs.map(l => l.id)) + 1 : 1,
        person_id: personId,
        person_name: personName,
        user_type: userType,
        roll_or_emp_id: rollOrEmp,
        department: dept,
        date: today,
        entry_time: '08:00 AM',
        exit_time: currentTime,
        gate,
        verification_method: method,
        status: 'Exited'
      };
      store.gate_logs.unshift(newLog);
      resultStatus = `Exit recorded for ${personName} at ${gate}.`;
    }
  } else {
    // Record entry
    eventType = 'Campus Entry';
    const newLog = {
      id: store.gate_logs.length > 0 ? Math.max(...store.gate_logs.map(l => l.id)) + 1 : 1,
      person_id: personId,
      person_name: personName,
      user_type: userType,
      roll_or_emp_id: rollOrEmp,
      department: dept,
      date: today,
      entry_time: currentTime,
      exit_time: null,
      gate,
      verification_method: method,
      status: 'Inside Campus'
    };
    store.gate_logs.unshift(newLog);
    resultStatus = `Authorized Entry recorded for ${personName} (${rollOrEmp}) at ${gate}. Welcome to RVSCET.`;
  }

  fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');

  res.json({
    success: true,
    event: eventType,
    message: resultStatus,
    person: {
      name: personName,
      user_type: userType,
      roll_or_emp_id: rollOrEmp,
      department: dept,
      time: currentTime,
      gate
    }
  });
});

// =========================================================================
// 2. VISITOR MANAGEMENT MODULE
// =========================================================================

// GET /api/rvs/visitors - List all visitors
router.get('/visitors', authenticateToken, requireRole('super_admin', 'college_admin', 'faculty', 'security'), (req, res) => {
  const store = getStore();
  const { status, search } = req.query;
  let list = store.visitors || [];

  if (status && status !== 'all') {
    list = list.filter(v => (v.pass_status || '').toLowerCase() === status.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(v =>
      (v.visitor_name || '').toLowerCase().includes(q) ||
      (v.pass_number || '').toLowerCase().includes(q) ||
      (v.company_or_org || '').toLowerCase().includes(q) ||
      (v.person_to_meet || '').toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    total: list.length,
    active_count: (store.visitors || []).filter(v => v.pass_status === 'Active').length,
    visitors: list
  });
});

// POST /api/rvs/visitors/check-in - Issue visitor pass
router.post('/visitors/check-in', authenticateToken, requireRole('super_admin', 'college_admin', 'faculty', 'security'), (req, res) => {
  const store = getStore();
  const {
    visitor_name,
    phone,
    company_or_org,
    purpose,
    person_to_meet,
    department_to_meet,
    id_proof_type = 'Aadhaar Card',
    id_proof_number = 'Verified'
  } = req.body;

  if (!visitor_name || !phone || !purpose || !person_to_meet) {
    return res.status(400).json({
      success: false,
      message: 'Visitor name, contact phone, purpose, and person to meet are mandatory.'
    });
  }

  store.visitors = store.visitors || [];
  const nextSerial = store.visitors.length + 1;
  const passNumber = `RVS-VIS-${new Date().getFullYear()}-${String(nextSerial).padStart(3, '0')}`;

  const newVisitor = {
    id: store.visitors.length > 0 ? Math.max(...store.visitors.map(v => v.id)) + 1 : 1,
    pass_number: passNumber,
    visitor_name: visitor_name.trim(),
    phone: phone.trim(),
    company_or_org: company_or_org ? company_or_org.trim() : 'Individual Visitor',
    purpose: purpose.trim(),
    person_to_meet: person_to_meet.trim(),
    department_to_meet: department_to_meet || 'Campus Administration',
    check_in: new Date().toISOString(),
    check_out: null,
    id_proof_type,
    id_proof_number,
    pass_status: 'Active',
    issued_by: req.user.name || 'Security Desk'
  };

  store.visitors.unshift(newVisitor);
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');

  res.status(201).json({
    success: true,
    message: `Visitor pass ${passNumber} generated successfully for ${visitor_name}.`,
    visitor: newVisitor
  });
});

// POST /api/rvs/visitors/:id/check-out - Record visitor checkout
router.post('/visitors/:id/check-out', authenticateToken, requireRole('super_admin', 'college_admin', 'faculty', 'security'), (req, res) => {
  const store = getStore();
  const visitorId = Number(req.params.id);
  store.visitors = store.visitors || [];
  const visitor = store.visitors.find(v => v.id === visitorId);

  if (!visitor) {
    return res.status(404).json({ success: false, message: 'Visitor record not found.' });
  }

  visitor.check_out = new Date().toISOString();
  visitor.pass_status = 'Checked Out';

  fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');

  res.json({
    success: true,
    message: `Visitor pass ${visitor.pass_number} checked out successfully.`,
    visitor
  });
});

// GET /api/rvs/visitors/:id/pass - Printable visitor pass
router.get('/visitors/:id/pass', authenticateToken, (req, res) => {
  const store = getStore();
  const visitorId = Number(req.params.id);
  const visitor = (store.visitors || []).find(v => v.id === visitorId);

  if (!visitor) {
    return res.status(404).json({ success: false, message: 'Visitor not found.' });
  }

  res.json({
    success: true,
    pass: {
      ...visitor,
      college_name: 'RVS College of Engineering & Technology',
      campus_address: 'Edalbera, P.O. Bhilai Pahari, NH-33, Jamshedpur - 831012',
      verification_url: `https://www.rvscollege.ac.in/verify/visitor/${visitor.pass_number}`
    }
  });
});

// =========================================================================
// 3. ROOM / FACILITY BOOKING MODULE
// =========================================================================

// GET /api/rvs/facilities - Available facilities roster
router.get('/facilities', authenticateToken, (req, res) => {
  const store = getStore();
  res.json({
    success: true,
    facilities: store.facilities || []
  });
});

// GET /api/rvs/facilities/bookings - List all bookings
router.get('/facilities/bookings', authenticateToken, (req, res) => {
  const store = getStore();
  const { facility_id, status, date } = req.query;
  let list = store.facility_bookings || [];

  if (facility_id && facility_id !== 'ALL') {
    list = list.filter(b => b.facility_id === Number(facility_id));
  }
  if (status && status !== 'ALL') {
    list = list.filter(b => b.status === status);
  }
  if (date) {
    list = list.filter(b => b.date === date);
  }

  res.json({
    success: true,
    total: list.length,
    bookings: list
  });
});

// POST /api/rvs/facilities/check-clash - Conflict detection
router.post('/facilities/check-clash', authenticateToken, (req, res) => {
  const store = getStore();
  const { facility_id, date, start_time, end_time } = req.body;

  if (!facility_id || !date) {
    return res.status(400).json({ success: false, message: 'Facility ID and date are required.' });
  }

  const facility = (store.facilities || []).find(f => f.id === Number(facility_id));
  if (!facility) {
    return res.status(404).json({ success: false, message: 'Facility not found.' });
  }

  // 1. Check existing approved bookings on the same date and facility
  const existingApproved = (store.facility_bookings || []).filter(b =>
    b.facility_id === Number(facility_id) &&
    b.date === date &&
    b.status === 'APPROVED'
  );

  if (existingApproved.length > 0) {
    const clash = existingApproved[0];
    return res.json({
      success: true,
      has_clash: true,
      message: `Schedule Conflict: ${facility.name} is already booked and APPROVED for "${clash.purpose}" by ${clash.requested_by} on ${date} (${clash.start_time} - ${clash.end_time}).`
    });
  }

  // 2. Check regular timetable if it's a classroom or lab
  if (facility.facility_type === 'Classroom' || facility.facility_type === 'Lab') {
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    const timetableClash = (store.timetables || []).find(t =>
      t.day.toLowerCase() === dayOfWeek.toLowerCase() &&
      (t.room_no || '').toLowerCase() === (facility.code || '').toLowerCase()
    );

    if (timetableClash) {
      return res.json({
        success: true,
        has_clash: true,
        message: `Timetable Conflict: Regular academic class ${timetableClash.subject_name} is scheduled in ${facility.name} on ${dayOfWeek}s.`
      });
    }
  }

  res.json({
    success: true,
    has_clash: false,
    message: `${facility.name} is FREE and AVAILABLE on ${date} with zero schedule conflicts.`
  });
});

// POST /api/rvs/facilities/book - Create booking request
router.post('/facilities/book', authenticateToken, (req, res) => {
  const store = getStore();
  const {
    facility_id,
    date,
    start_time = '10:00 AM',
    end_time = '01:00 PM',
    purpose,
    department,
    expected_attendees = 50
  } = req.body;

  if (!facility_id || !date || !purpose) {
    return res.status(400).json({ success: false, message: 'Facility, date, and purpose are required.' });
  }

  const facility = (store.facilities || []).find(f => f.id === Number(facility_id));
  if (!facility) {
    return res.status(404).json({ success: false, message: 'Facility not found.' });
  }

  // Conflict validation
  const existingApproved = (store.facility_bookings || []).filter(b =>
    b.facility_id === Number(facility_id) &&
    b.date === date &&
    b.status === 'APPROVED'
  );

  if (existingApproved.length > 0) {
    return res.status(409).json({
      success: false,
      message: `Cannot book: ${facility.name} already has an approved reservation on ${date}.`
    });
  }

  store.facility_bookings = store.facility_bookings || [];
  const nextSerial = store.facility_bookings.length + 1;
  const bookingRef = `RVS-BK-${new Date().getFullYear()}-${String(nextSerial).padStart(3, '0')}`;

  const isAdmin = req.user.role === 'super_admin' || req.user.role === 'college_admin';

  const newBooking = {
    id: store.facility_bookings.length > 0 ? Math.max(...store.facility_bookings.map(b => b.id)) + 1 : 1,
    booking_reference: bookingRef,
    facility_id: facility.id,
    facility_name: facility.name,
    facility_type: facility.facility_type,
    date,
    start_time,
    end_time,
    requested_by: req.user.name,
    requested_by_role: req.user.role,
    department: department || req.user.department || 'Academics',
    purpose: purpose.trim(),
    expected_attendees: Number(expected_attendees),
    status: isAdmin ? 'APPROVED' : 'REQUESTED',
    approved_by: isAdmin ? req.user.name : null,
    remarks: isAdmin ? 'Instant admin sanction.' : 'Awaiting administrative sanction.',
    created_at: new Date().toISOString()
  };

  store.facility_bookings.unshift(newBooking);
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');

  res.status(201).json({
    success: true,
    message: isAdmin
      ? `Facility ${facility.name} booked & approved successfully (${bookingRef}).`
      : `Reservation request for ${facility.name} submitted successfully (${bookingRef}). Pending admin approval.`,
    booking: newBooking
  });
});

// POST /api/rvs/facilities/bookings/:id/status - Approve / Reject / Cancel
router.post('/facilities/bookings/:id/status', authenticateToken, requireRole('super_admin', 'college_admin', 'faculty'), (req, res) => {
  const store = getStore();
  const bookingId = Number(req.params.id);
  store.facility_bookings = store.facility_bookings || [];
  const booking = store.facility_bookings.find(b => b.id === bookingId);

  if (!booking) {
    return res.status(404).json({ success: false, message: 'Facility booking record not found.' });
  }

  const { status, remarks } = req.body;
  const validStatuses = ['APPROVED', 'REJECTED', 'CANCELLED'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  booking.status = status;
  if (remarks) booking.remarks = remarks;
  if (status === 'APPROVED') {
    booking.approved_by = req.user.name;
  }

  fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');

  res.json({
    success: true,
    message: `Booking ${booking.booking_reference} status updated to ${status}.`,
    booking
  });
});

module.exports = router;
