const express = require('express');
const router = express.Router();
const { getStore, saveStore } = require('../config/db');
const { authenticateToken, requireRole } = require('../middlewares/auth');
const rvsConfig = require('../config/rvsConfig');

// =========================================================================
// 1. ADMIT CARD ELIGIBILITY & GENERATOR
// =========================================================================

// GET /api/rvs/admit-cards/config - Configurable eligibility criteria
router.get('/admit-cards/config', authenticateToken, (req, res) => {
  const store = getStore();
  const config = store.admit_card_config || {
    min_attendance_pct: 75,
    require_fee_clearance: true,
    require_exam_registration: true,
    require_active_status: true,
    allow_admin_override: true
  };
  res.json({ success: true, config });
});

// POST /api/rvs/admit-cards/config - Admin modifies eligibility criteria
router.post('/admit-cards/config', authenticateToken, requireRole('super_admin', 'college_admin'), (req, res) => {
  const store = getStore();
  const { min_attendance_pct, require_fee_clearance, require_exam_registration, require_active_status } = req.body;

  store.admit_card_config = {
    min_attendance_pct: min_attendance_pct !== undefined ? Number(min_attendance_pct) : 75,
    require_fee_clearance: Boolean(require_fee_clearance),
    require_exam_registration: Boolean(require_exam_registration),
    require_active_status: Boolean(require_active_status),
    allow_admin_override: true,
    updated_at: new Date().toISOString(),
    updated_by: req.user.name
  };

  saveStore();
  res.json({ success: true, message: 'Admit card eligibility rules updated.', config: store.admit_card_config });
});

// Helper: Check student eligibility for admit card
function evaluateAdmitCardEligibility(studentUser, studentProfile, store, examId) {
  const config = store.admit_card_config || {
    min_attendance_pct: 75,
    require_fee_clearance: true,
    require_exam_registration: true,
    require_active_status: true
  };

  // 1. Check if overridden by admin
  const override = (store.admit_card_overrides || []).find(
    o => (o.student_id === studentUser.id || o.roll_no === studentProfile.roll_no) && o.exam_id === examId
  );
  if (override) {
    return {
      is_eligible: true,
      is_overridden: true,
      override_reason: override.reason,
      overridden_by: override.overridden_by,
      reasons: []
    };
  }

  const reasons = [];

  // 2. Active status check
  if (config.require_active_status && studentProfile.status !== 'active' && studentUser.status !== 'active') {
    reasons.push(`Student account status is ${studentProfile.status || studentUser.status} (Must be Active)`);
  }

  // 3. Attendance check
  if (config.min_attendance_pct > 0) {
    const stuAttRecords = (store.attendance_records || []).filter(
      r => r.student_id === studentUser.id || r.roll_no === studentProfile.roll_no
    );
    const total = stuAttRecords.length;
    const present = stuAttRecords.filter(r => r.status === 'Present' || r.status === 'Late').length;
    const pct = total > 0 ? (present / total) * 100 : 85.0; // Default to 85% if no records yet
    if (pct < config.min_attendance_pct) {
      reasons.push(`Attendance (${pct.toFixed(1)}%) is below mandatory threshold (${config.min_attendance_pct}%)`);
    }
  }

  // 4. Fee clearance check
  if (config.require_fee_clearance) {
    const fees = (store.student_fees || []).filter(f => f.student_id === studentUser.id);
    const totalPending = fees.reduce((sum, f) => sum + Number(f.pending_amount || 0), 0);
    if (totalPending > 0) {
      reasons.push(`Fee dues outstanding: ₹${totalPending.toLocaleString('en-IN')}`);
    }
  }

  return {
    is_eligible: reasons.length === 0,
    is_overridden: false,
    reasons
  };
}

// GET /api/rvs/admit-cards/eligibility - Check eligibility list for a class
router.get('/admit-cards/eligibility', authenticateToken, (req, res) => {
  const store = getStore();
  const { department = 'CSE', semester = '6th Semester', exam_id = 'EXAM-2026-EVEN' } = req.query;

  const studentsInClass = (store.students_profile || []).filter(
    p => p.department_code === department && p.semester === semester
  );
  const users = store.users || [];

  const list = studentsInClass.map(prof => {
    const u = users.find(usr => usr.id === prof.user_id) || {};
    const evalResult = evaluateAdmitCardEligibility(u, prof, store, exam_id);
    return {
      student_id: prof.user_id,
      name: u.name || prof.student_name || 'Student',
      roll_no: prof.roll_no,
      reg_no: prof.reg_no,
      department_code: prof.department_code,
      semester: prof.semester,
      batch: prof.batch,
      ...evalResult
    };
  });

  res.json({ success: true, exam_id, students: list });
});

// POST /api/rvs/admit-cards/override - Admin overrides ineligibility with audit reason
router.post('/admit-cards/override', authenticateToken, requireRole('super_admin', 'college_admin'), (req, res) => {
  const store = getStore();
  const { student_id, roll_no, exam_id = 'EXAM-2026-EVEN', reason } = req.body;

  if (!reason || !reason.trim()) {
    return res.status(400).json({ success: false, message: 'Mandatory justification audit reason is required for override.' });
  }

  store.admit_card_overrides = store.admit_card_overrides || [];
  const existing = store.admit_card_overrides.find(
    o => (o.student_id === Number(student_id) || o.roll_no === roll_no) && o.exam_id === exam_id
  );

  if (existing) {
    existing.reason = reason.trim();
    existing.overridden_by = req.user.name;
    existing.timestamp = new Date().toISOString();
  } else {
    store.admit_card_overrides.push({
      id: store.admit_card_overrides.length > 0 ? Math.max(...store.admit_card_overrides.map(o => o.id)) + 1 : 1,
      student_id: Number(student_id),
      roll_no: roll_no || `23RVSCSE${student_id}`,
      exam_id,
      overridden_by: req.user.name,
      reason: reason.trim(),
      timestamp: new Date().toISOString()
    });
  }

  saveStore();
  res.json({ success: true, message: 'Eligibility override granted and recorded in audit ledger.' });
});

// GET /api/rvs/admit-cards/generate - Generate admit card data (single or bulk)
router.get('/admit-cards/generate', authenticateToken, (req, res) => {
  const store = getStore();
  const { student_id, department = 'CSE', semester = '6th Semester', exam_id = 'EXAM-2026-EVEN' } = req.query;

  const exam = (store.exam_schedules || []).find(e => e.exam_id === exam_id) || (store.exam_schedules || [])[0];
  if (!exam) {
    return res.status(404).json({ success: false, message: 'Examination schedule not found.' });
  }

  const users = store.users || [];
  const profiles = store.students_profile || [];

  let targetStudents = [];
  if (student_id) {
    const prof = profiles.find(p => p.user_id === Number(student_id));
    const u = users.find(usr => usr.id === Number(student_id));
    if (prof && u) targetStudents.push({ user: u, profile: prof });
  } else {
    targetStudents = profiles
      .filter(p => p.department_code === department && p.semester === semester)
      .map(p => ({ user: users.find(u => u.id === p.user_id) || {}, profile: p }));
  }

  const admitCards = targetStudents.map(({ user, profile }) => {
    const evalResult = evaluateAdmitCardEligibility(user, profile, store, exam_id);
    const verificationToken = `RVSCET-ADMIT-${exam_id}-${profile.roll_no}`;

    return {
      admit_card_number: `RVSCET/AC/${exam.session.split('-')[0]}/${profile.roll_no}`,
      college_name: rvsConfig.collegeName,
      campus: rvsConfig.campus,
      affiliation: 'Approved by AICTE &bull; Affiliated to Jharkhand University of Technology (JUT), Ranchi &bull; NAAC Accredited',
      examination_name: exam.exam_name,
      session: exam.session,
      reporting_time: exam.reporting_time,
      exam_centre: exam.exam_centre,
      student: {
        id: user.id,
        name: user.name || profile.student_name,
        roll_no: profile.roll_no,
        reg_no: profile.reg_no,
        course: profile.course,
        department: profile.department_name || 'Computer Science & Engineering',
        department_code: profile.department_code,
        semester: profile.semester,
        batch: profile.batch,
        avatar: user.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'
      },
      subjects: exam.subjects,
      eligibility: evalResult,
      qr_verification_url: `/verify/admit-card/${verificationToken}`,
      qr_payload: `RVSCET:ADMIT:${profile.roll_no}:${exam.exam_id}:${evalResult.is_eligible ? 'ELIGIBLE' : 'INELIGIBLE'}`,
      signatory_title: 'Controller of Examinations',
      signatory_office: 'RVSCET Examination Directorate, Jamshedpur',
      rules: [
        'Candidates must carry their original RVS Student ID Card along with this Admit Card.',
        'Entry into the examination hall is prohibited after 15 minutes of commencement.',
        'Mobile phones, programmable calculators, smart watches and study materials are strictly banned.',
        'Ensure the Room Superintendent endorses your presence against each paper code.'
      ]
    };
  });

  res.json({ success: true, count: admitCards.length, admitCards });
});

// GET /api/rvs/admit-cards/student/my-card - Student retrieves their own eligible admit card
router.get('/admit-cards/student/my-card', authenticateToken, (req, res) => {
  const store = getStore();
  const userId = req.user.id;
  const user = (store.users || []).find(u => u.id === userId);
  const profile = (store.students_profile || []).find(p => p.user_id === userId);

  if (!profile) {
    return res.status(404).json({ success: false, message: 'Student profile not found.' });
  }

  const exam = (store.exam_schedules || []).find(e => e.semester === profile.semester) || (store.exam_schedules || [])[0];
  const evalResult = evaluateAdmitCardEligibility(user, profile, store, exam?.exam_id || 'EXAM-2026-EVEN');

  if (!evalResult.is_eligible) {
    return res.status(403).json({
      success: false,
      message: 'You are currently not eligible to download the Examination Admit Card.',
      reasons: evalResult.reasons,
      instructions: 'Please clear your institutional dues or contact the Head of Department for attendance regularization.'
    });
  }

  const verificationToken = `RVSCET-ADMIT-${exam.exam_id}-${profile.roll_no}`;
  const card = {
    admit_card_number: `RVSCET/AC/${exam.session.split('-')[0]}/${profile.roll_no}`,
    college_name: rvsConfig.collegeName,
    campus: rvsConfig.campus,
    affiliation: 'Approved by AICTE &bull; Affiliated to Jharkhand University of Technology (JUT), Ranchi &bull; NAAC Accredited',
    examination_name: exam.exam_name,
    session: exam.session,
    reporting_time: exam.reporting_time,
    exam_centre: exam.exam_centre,
    student: {
      id: user.id,
      name: user.name,
      roll_no: profile.roll_no,
      reg_no: profile.reg_no,
      course: profile.course,
      department: profile.department_name || 'Computer Science & Engineering',
      department_code: profile.department_code,
      semester: profile.semester,
      batch: profile.batch,
      avatar: user.avatar
    },
    subjects: exam.subjects,
    eligibility: evalResult,
    qr_verification_url: `/verify/admit-card/${verificationToken}`,
    qr_payload: `RVSCET:ADMIT:${profile.roll_no}:${exam.exam_id}:ELIGIBLE`,
    signatory_title: 'Controller of Examinations',
    signatory_office: 'RVSCET Examination Directorate, Jamshedpur',
    rules: [
      'Candidates must carry their original RVS Student ID Card along with this Admit Card.',
      'Entry into the examination hall is prohibited after 15 minutes of commencement.',
      'Mobile phones, programmable calculators, smart watches and study materials are strictly banned.',
      'Ensure the Room Superintendent endorses your presence against each paper code.'
    ]
  };

  res.json({ success: true, card });
});

// GET /api/rvs/verify/admit-card/:token - Public QR verification of admit card
router.get('/verify/admit-card/:token', (req, res) => {
  const store = getStore();
  const { token } = req.params;

  const profile = (store.students_profile || []).find(p => token.includes(p.roll_no) || p.roll_no === token);
  const exam = (store.exam_schedules || [])[0];

  if (!profile) {
    return res.status(404).json({
      success: false,
      status: 'INVALID_OR_NOT_FOUND',
      message: 'Admit Card verification token not recognized in official RVS Examination Registry.'
    });
  }

  // Mask student name: "R**** K**** V****"
  const maskedName = profile.student_name
    ? profile.student_name.split(' ').map(part => part[0] + '*'.repeat(Math.max(1, part.length - 1))).join(' ')
    : 'Authorized Student';

  res.json({
    success: true,
    verification: {
      status: 'VALID_AUTHENTIC_ADMIT_CARD',
      institution: 'RVS College of Engineering & Technology, Jamshedpur',
      roll_no: profile.roll_no,
      candidate_initials: maskedName,
      examination: exam.exam_name,
      session: exam.session,
      verified_at: new Date().toISOString()
    }
  });
});

// =========================================================================
// 2. CERTIFICATE GENERATOR & PUBLIC VERIFICATION
// =========================================================================

const CERT_TEMPLATES = [
  {
    id: 'bonafide',
    name: 'Bonafide Certificate',
    default_purpose: 'Education Loan Renewal & Scholarship Application',
    template_text: 'This is to certify that [STUDENT_NAME] (Roll No. [ROLL_NO], Registration No. [REG_NO]) is a bonafide student of [COURSE], Department of [DEPARTMENT] at RVS College of Engineering & Technology, Jamshedpur for the academic session [SESSION]. He/She bears good moral character and conduct.'
  },
  {
    id: 'character',
    name: 'Character Certificate',
    default_purpose: 'Internship / Employment Screening',
    template_text: 'This is to certify that [STUDENT_NAME] has been a regular student of [COURSE] at this institution. During his/her tenure at RVS College of Engineering & Technology, his/her academic conduct and discipline have been found exemplary.'
  },
  {
    id: 'course_completion',
    name: 'Course Completion Certificate',
    default_purpose: 'Higher Studies & Industrial Employment',
    template_text: 'This is to certify that [STUDENT_NAME] has successfully completed all academic and curricular requirements for the award of [COURSE] from Jharkhand University of Technology (JUT), Ranchi through RVS College of Engineering & Technology, Jamshedpur.'
  },
  {
    id: 'student_verification',
    name: 'Student Verification Certificate',
    default_purpose: 'Official Background Verification & Passport Clearance',
    template_text: 'Official institutional verification confirming that [STUDENT_NAME] is an enrolled bona fide candidate of RVS College of Engineering & Technology, Jamshedpur.'
  },
  {
    id: 'event_participation',
    name: 'Event Participation Certificate',
    default_purpose: 'Annual Technical Festival (Technovate) & Symposium',
    template_text: 'This certificate of appreciation is proudly presented to [STUDENT_NAME] for active participation and technical contributions during the Annual National Technical Symposium held at RVSCET Campus.'
  },
  {
    id: 'achievement',
    name: 'Achievement Certificate',
    default_purpose: 'Merit Academic Excellence & Project Presentation',
    template_text: 'This certificate of academic distinction is awarded to [STUDENT_NAME] in recognition of outstanding academic performance and scholastic achievement at RVSCET Jamshedpur.'
  }
];

// GET /api/rvs/certificates/templates
router.get('/certificates/templates', authenticateToken, (req, res) => {
  res.json({ success: true, templates: CERT_TEMPLATES });
});

// GET /api/rvs/certificates - List all generated certificates
router.get('/certificates', authenticateToken, (req, res) => {
  const store = getStore();
  const { template_type, status, search } = req.query;
  let list = store.certificates || [];

  if (template_type && template_type !== 'all') {
    list = list.filter(c => c.template_type.toLowerCase() === template_type.toLowerCase());
  }
  if (status && status !== 'all') {
    list = list.filter(c => c.status.toLowerCase() === status.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(c =>
      c.certificate_no.toLowerCase().includes(q) ||
      c.student_name.toLowerCase().includes(q) ||
      c.roll_no.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, certificates: list });
});

// POST /api/rvs/certificates/generate - Admin generates a certificate
router.post('/certificates/generate', authenticateToken, requireRole('super_admin', 'college_admin'), (req, res) => {
  const store = getStore();
  const { student_id, template_type, purpose, custom_text, signatory } = req.body;

  const studentUser = (store.users || []).find(u => u.id === Number(student_id));
  const studentProfile = (store.students_profile || []).find(p => p.user_id === Number(student_id));

  if (!studentProfile || !studentUser) {
    return res.status(404).json({ success: false, message: 'Student record not found.' });
  }

  const template = CERT_TEMPLATES.find(t => t.name.toLowerCase() === (template_type || '').toLowerCase()) || CERT_TEMPLATES[0];

  const currentYear = new Date().getFullYear();
  store.certificates = store.certificates || [];
  const certCountThisYear = store.certificates.filter(c => c.certificate_no.includes(`/${currentYear}/`)).length + 1;
  const certNo = `RVSCET/CERT/${currentYear}/${String(certCountThisYear).padStart(3, '0')}`;
  const verificationToken = `VTOKEN-RVS-CERT-${currentYear}-${String(certCountThisYear).padStart(3, '0')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  let finalContent = custom_text || template.template_text;
  finalContent = finalContent
    .replace(/\[STUDENT_NAME\]/g, studentUser.name)
    .replace(/\[ROLL_NO\]/g, studentProfile.roll_no)
    .replace(/\[REG_NO\]/g, studentProfile.reg_no)
    .replace(/\[COURSE\]/g, studentProfile.course)
    .replace(/\[DEPARTMENT\]/g, studentProfile.department_name || 'Computer Science & Engineering')
    .replace(/\[SESSION\]/g, studentProfile.session || '2025-2026');

  const newCert = {
    id: store.certificates.length > 0 ? Math.max(...store.certificates.map(c => c.id)) + 1 : 1,
    certificate_no: certNo,
    template_type: template.name,
    student_id: studentUser.id,
    student_name: studentUser.name,
    roll_no: studentProfile.roll_no,
    reg_no: studentProfile.reg_no,
    course: studentProfile.course,
    department: studentProfile.department_name || 'Computer Science & Engineering',
    session: studentProfile.session || '2025-2026',
    issue_date: new Date().toISOString().split('T')[0],
    purpose: purpose || template.default_purpose,
    status: 'VALID',
    signatory: signatory || 'Prof. (Dr.) Rajesh Kumar Tiwari, Principal RVSCET',
    verification_token: verificationToken,
    content_text: finalContent,
    created_at: new Date().toISOString(),
    created_by: req.user.name
  };

  store.certificates.unshift(newCert);
  saveStore();

  res.status(201).json({ success: true, message: `Certificate ${certNo} generated successfully.`, certificate: newCert });
});

// POST /api/rvs/certificates/:id/revoke - Revoke certificate
router.post('/certificates/:id/revoke', authenticateToken, requireRole('super_admin', 'college_admin'), (req, res) => {
  const store = getStore();
  const certId = Number(req.params.id);

  store.certificates = store.certificates || [];
  const cert = store.certificates.find(c => c.id === certId);

  if (!cert) {
    return res.status(404).json({ success: false, message: 'Certificate record not found.' });
  }

  const { reason } = req.body;
  if (!reason || !reason.trim()) {
    return res.status(400).json({ success: false, message: 'A mandatory revocation reason is required.' });
  }

  cert.status = 'REVOKED';
  cert.revocation_reason = reason.trim();
  cert.revoked_at = new Date().toISOString();
  cert.revoked_by = req.user.name;

  saveStore();
  res.json({ success: true, message: `Certificate ${cert.certificate_no} has been REVOKED.`, certificate: cert });
});

// GET /api/rvs/verify/certificate/* - Strictly Non-Sensitive Public Verification
router.use('/verify/certificate', (req, res) => {
  const store = getStore();
  const rawPath = (req.path || '').replace(/^\//, '');
  const cleanCertNo = decodeURIComponent(rawPath || req.query.certNo || req.query.no || '').trim();

  const cert = (store.certificates || []).find(
    c => c.certificate_no.toLowerCase() === cleanCertNo.toLowerCase() ||
         c.verification_token.toLowerCase() === cleanCertNo.toLowerCase() ||
         cleanCertNo.includes(c.certificate_no.toLowerCase()) ||
         c.certificate_no.replace(/\//g, '-').toLowerCase() === cleanCertNo.replace(/\//g, '-').toLowerCase()
  );

  if (!cert) {
    return res.status(404).json({
      success: false,
      status: 'NOT_FOUND',
      message: 'Certificate number not found in official RVSCET Institutional Registry.'
    });
  }

  // PUBLIC INFORMATION ONLY (No personal address, phone, parent details or grades exposed)
  res.json({
    success: true,
    verification: {
      certificate_no: cert.certificate_no,
      template_type: cert.template_type,
      issue_date: cert.issue_date,
      status: cert.status, // VALID or REVOKED
      institution: 'RVS College of Engineering & Technology, Jamshedpur',
      affiliation: 'Approved by AICTE, Affiliated to Jharkhand University of Technology (JUT), NAAC Accredited',
      signatory: cert.signatory,
      revocation_reason: cert.status === 'REVOKED' ? cert.revocation_reason : undefined,
      verified_at: new Date().toISOString()
    }
  });
});

module.exports = router;
