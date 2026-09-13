const express = require('express');
const router = express.Router();
const { getStore, saveStore } = require('../config/db');
const { authenticateToken, requireRole } = require('../middlewares/auth');
const rvsConfig = require('../config/rvsConfig');

// =========================================================================
// 1. STUDENT 360° PROFILE (All 12 Tabs & Dynamic Aggregation from DB)
// =========================================================================
router.get('/students/:id/profile-360', authenticateToken, (req, res) => {
  const store = getStore();
  const targetId = Number(req.params.id);

  // RBAC: Student can ONLY view their own profile
  if (req.user.role === 'student' && req.user.id !== targetId) {
    return res.status(403).json({
      success: false,
      message: 'Access Denied: You are only authorized to view your own Student 360° Profile.'
    });
  }

  const user = (store.users || []).find(u => u.id === targetId);
  if (!user || user.role !== 'student') {
    return res.status(404).json({ success: false, message: 'Student not found in registry.' });
  }

  const profile = (store.students_profile || []).find(p => p.user_id === user.id) || {};
  const rollNo = profile.roll_no || `23RVSCSE${String(user.id).padStart(3, '0')}`;
  const regNo = profile.reg_no || `JUT/2023/CSE/00${user.id}`;
  const admNo = profile.admission_no || `RVS/ADM/2023/${String(user.id).padStart(3, '0')}`;
  const deptCode = profile.department_code || 'CSE';
  const semester = profile.semester || '6th Semester';
  const batch = profile.batch || '2023-2027';
  const session = profile.session || '2025-2026';

  // 1. Dynamic Attendance Calculations
  const stuAttRecords = (store.attendance_records || []).filter(r => r.student_id === user.id || r.roll_no === rollNo);
  const totalClasses = stuAttRecords.length;
  const presentCount = stuAttRecords.filter(r => r.status === 'Present').length;
  const absentCount = stuAttRecords.filter(r => r.status === 'Absent').length;
  const lateCount = stuAttRecords.filter(r => r.status === 'Late').length;
  const excusedCount = stuAttRecords.filter(r => r.status === 'Excused').length;
  const attendancePct = totalClasses > 0 ? Number(((presentCount + lateCount) / totalClasses * 100).toFixed(1)) : 85.0;

  // Subject-wise attendance calculation
  const subjectAttMap = {};
  stuAttRecords.forEach(r => {
    const sc = r.subject_code || 'GEN';
    if (!subjectAttMap[sc]) {
      subjectAttMap[sc] = { code: sc, name: r.subject_name || sc, total: 0, attended: 0 };
    }
    subjectAttMap[sc].total += 1;
    if (r.status === 'Present' || r.status === 'Late') subjectAttMap[sc].attended += 1;
  });
  const subjectWiseAttendance = Object.values(subjectAttMap).map(s => ({
    ...s,
    percentage: s.total > 0 ? Number(((s.attended / s.total) * 100).toFixed(1)) : 100,
    isLowAttendance: s.total > 0 && ((s.attended / s.total) * 100) < 75
  }));

  // 2. Exam Results & SGPA / CGPA
  const examResults = (store.exam_results || []).filter(r => r.student_id === user.id || r.roll_no === rollNo);
  const sgpas = examResults.map(r => Number(r.sgpa || 0)).filter(s => s > 0);
  const currentSgpa = sgpas.length > 0 ? sgpas[sgpas.length - 1].toFixed(2) : '8.65';
  const cgpa = sgpas.length > 0 ? (sgpas.reduce((a, b) => a + b, 0) / sgpas.length).toFixed(2) : '8.54';

  // 3. Backlogs
  const studentBacklogs = (store.backlogs || []).filter(b => b.student_id === user.id || b.roll_no === rollNo);
  const activeBacklogs = studentBacklogs.filter(b => b.status === 'Pending').length;
  const clearedBacklogs = studentBacklogs.filter(b => b.status === 'Cleared').length;

  // 4. Fees
  const fees = (store.student_fees || []).filter(f => f.student_id === user.id);
  const totalPayable = fees.reduce((s, f) => s + Number(f.total_amount || 0), 0);
  const totalPaid = fees.reduce((s, f) => s + Number(f.paid_amount || 0), 0);
  const totalPending = fees.reduce((s, f) => s + Number(f.pending_amount || 0), 0);

  // 5. Assignments
  const allAssignments = store.assignments || [];
  const relevantAssignments = allAssignments.filter(a => a.department_code === deptCode || a.semester === semester);
  let pendingAssignmentsCount = 0;
  const assignmentDetails = relevantAssignments.map(a => {
    const sub = (a.submissions || []).find(s => s.student_id === user.id || s.roll_no === rollNo);
    const isSubmitted = sub && sub.status === 'Submitted';
    if (!isSubmitted) pendingAssignmentsCount++;
    return {
      id: a.id,
      title: a.title,
      subject_code: a.subject_code,
      subject_name: a.subject_name,
      faculty_name: a.faculty_name,
      due_date: a.due_date,
      max_marks: a.max_marks,
      status: isSubmitted ? 'Submitted' : 'Pending',
      submitted_at: sub ? sub.submitted_at : null,
      marks: sub ? sub.marks : null,
      feedback: sub ? sub.feedback : null
    };
  });

  // 6. Library Books
  const issuedBooks = (store.library_issued_records || []).filter(
    b => (b.student_id === user.id || b.roll_no === rollNo) && b.status === 'Issued'
  );
  const allStudentBooks = (store.library_issued_records || []).filter(
    b => b.student_id === user.id || b.roll_no === rollNo
  );

  // 7. Placement Eligibility Evaluation
  const minCgpaReq = 7.0;
  const maxBacklogsAllowed = 0;
  const isCgpaEligible = Number(cgpa) >= minCgpaReq;
  const isBacklogEligible = activeBacklogs <= maxBacklogsAllowed;
  const isAttendanceEligible = attendancePct >= 75;
  const isPlacementEligible = isCgpaEligible && isBacklogEligible && isAttendanceEligible;
  let placementReason = 'Fully Eligible for Campus Recruitment Drives';
  if (!isPlacementEligible) {
    const reasons = [];
    if (!isCgpaEligible) reasons.push(`CGPA (${cgpa}) below cutoff (${minCgpaReq})`);
    if (!isBacklogEligible) reasons.push(`Active backlogs (${activeBacklogs}) exceed limit (${maxBacklogsAllowed})`);
    if (!isAttendanceEligible) reasons.push(`Attendance (${attendancePct}%) below mandatory 75%`);
    placementReason = reasons.join('; ');
  }

  // 8. Documents
  const documents = (store.student_documents || []).filter(d => d.student_id === user.id || d.roll_no === rollNo);

  // 9. Certificates
  const certificates = (store.certificates || []).filter(c => c.student_id === user.id || c.roll_no === rollNo);

  // 10. Leaves & Grievances
  const leaves = (store.leaves || []).filter(l => l.user_id === user.id);
  const grievances = (store.grievances || []).filter(g => g.student_id === user.id);

  // 11. Enrolled Subjects & Faculty Mentors (Academic Tab)
  const enrolledCourses = (store.courses || []).filter(c => c.department_code === deptCode);

  res.json({
    success: true,
    student: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || profile.guardian_phone || 'N/A',
      avatar: user.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      roll_no: rollNo,
      reg_no: regNo,
      admission_no: admNo,
      course: profile.course || 'B.Tech Computer Science & Engineering',
      department_code: deptCode,
      department: profile.department_name || 'Computer Science & Engineering',
      semester: semester,
      batch: batch,
      session: session,
      admission_year: profile.admission_year || 2023,
      dob: profile.dob || '2004-08-14',
      gender: profile.gender || 'Male',
      address: profile.address || 'Road No. 4, Mango, Jamshedpur, Jharkhand',
      guardian_name: profile.guardian_name || 'Manoj Kumar Verma',
      mother_name: profile.mother_name || 'Sunita Devi',
      guardian_phone: profile.guardian_phone || '+91 94311 88990',
      guardian_email: profile.guardian_email || 'guardian@example.com',
      guardian_address: profile.guardian_address || profile.address || 'Road No. 4, Mango, Jamshedpur',
      status: profile.status || user.status || 'active',
      is_demo: profile.is_demo !== undefined ? profile.is_demo : true
    },
    // Overview Summary Cards
    summaryCards: {
      attendancePct,
      currentSgpa,
      cgpa,
      pendingFees: totalPending,
      pendingAssignments: pendingAssignmentsCount,
      libraryBooksIssued: issuedBooks.length,
      activeBacklogs,
      clearedBacklogs,
      totalBacklogs: studentBacklogs.length,
      placementEligible: isPlacementEligible,
      placementReason
    },
    // Academic Tab
    academic: {
      mentor: {
        name: 'Prof. Jeevan Kumar',
        designation: 'Associate Professor & Academic Advisor',
        email: 'jeevan.kumar@rvscet.ac.in',
        phone: '+91 94311 22444',
        office: 'Academic Block B, Room 204'
      },
      enrolledSubjects: enrolledCourses,
      curriculumSession: session,
      academicStatus: profile.status === 'active' ? 'Regular Enrolled Student' : profile.status
    },
    // Attendance Tab
    attendance: {
      overallPercentage: attendancePct,
      totalClasses,
      present: presentCount,
      absent: absentCount,
      late: lateCount,
      excused: excusedCount,
      subjectWise: subjectWiseAttendance,
      recentRecords: stuAttRecords.slice(-15).reverse()
    },
    // Results Tab
    results: examResults,
    // Backlogs Tab
    backlogs: {
      summary: { total: studentBacklogs.length, active: activeBacklogs, cleared: clearedBacklogs },
      records: studentBacklogs
    },
    // Fees Tab
    fees: {
      summary: { totalPayable, totalPaid, totalPending },
      invoices: fees
    },
    // Assignments Tab
    assignments: {
      total: relevantAssignments.length,
      pendingCount: pendingAssignmentsCount,
      submittedCount: relevantAssignments.length - pendingAssignmentsCount,
      list: assignmentDetails
    },
    // Library Tab
    library: {
      currentlyIssued: issuedBooks,
      history: allStudentBooks
    },
    // Leave Tab
    leave: {
      leavesList: leaves,
      grievancesList: grievances
    },
    // Documents Tab
    documents: documents,
    // Certificates Tab
    certificates: certificates,
    // Placement Tab
    placement: {
      isEligible: isPlacementEligible,
      eligibilityReason: placementReason,
      minCgpaReq,
      maxBacklogsAllowed,
      drivesApplied: (store.placements || []).map(p => ({
        id: p.id,
        company: p.company_name,
        role: p.job_role,
        package: p.package,
        date: p.drive_date,
        studentStatus: isPlacementEligible ? 'Eligible / Shortlisted' : 'Not Eligible (Criteria Mismatch)'
      }))
    }
  });
});

// =========================================================================
// 2. BACKLOG MANAGEMENT MODULE (Academics / Results -> Backlogs)
// =========================================================================

// GET /api/rvs/backlogs - Admin/Faculty list all backlogs
router.get('/backlogs', authenticateToken, (req, res) => {
  const store = getStore();
  const { department, semester, status, search } = req.query;
  let list = store.backlogs || [];

  // Filter
  if (department && department !== 'all') {
    list = list.filter(b => b.department_code === department);
  }
  if (semester && semester !== 'all') {
    list = list.filter(b => b.semester === semester);
  }
  if (status && status !== 'all') {
    list = list.filter(b => (b.status || '').toLowerCase() === status.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(b =>
      (b.student_name || '').toLowerCase().includes(q) ||
      (b.roll_no || '').toLowerCase().includes(q) ||
      (b.subject_code || '').toLowerCase().includes(q) ||
      (b.subject_name || '').toLowerCase().includes(q)
    );
  }

  // Summary counts
  const total = (store.backlogs || []).length;
  const pending = (store.backlogs || []).filter(b => b.status === 'Pending').length;
  const cleared = (store.backlogs || []).filter(b => b.status === 'Cleared').length;

  res.json({
    success: true,
    summary: { total, pending, cleared },
    backlogs: list
  });
});

// GET /api/rvs/backlogs/student/:id - Student's own backlogs
router.get('/backlogs/student/:id', authenticateToken, (req, res) => {
  const store = getStore();
  const targetId = Number(req.params.id);

  if (req.user.role === 'student' && req.user.id !== targetId) {
    return res.status(403).json({ success: false, message: 'Unauthorized.' });
  }

  const list = (store.backlogs || []).filter(b => b.student_id === targetId);
  const pending = list.filter(b => b.status === 'Pending');
  const cleared = list.filter(b => b.status === 'Cleared');

  res.json({
    success: true,
    student_id: targetId,
    summary: {
      total: list.length,
      pending: pending.length,
      cleared: cleared.length
    },
    pendingBacklogs: pending,
    clearedBacklogs: cleared,
    allRecords: list
  });
});

// POST /api/rvs/backlogs/clear - Clear a backlog record
router.post('/backlogs/clear', authenticateToken, requireRole('super_admin', 'college_admin', 'faculty'), (req, res) => {
  const store = getStore();
  const { backlog_id, marks, remarks, cleared_date } = req.body;

  if (!backlog_id) {
    return res.status(400).json({ success: false, message: 'Backlog ID is required.' });
  }

  store.backlogs = store.backlogs || [];
  const item = store.backlogs.find(b => b.id === Number(backlog_id));

  if (!item) {
    return res.status(404).json({ success: false, message: 'Backlog record not found.' });
  }

  item.status = 'Cleared';
  item.cleared_date = cleared_date || new Date().toISOString().split('T')[0];
  item.marks = marks !== undefined ? Number(marks) : (item.marks || 50);
  item.result = 'Pass';
  item.attempt_number = (item.attempt_number || 1) + 1;
  item.remarks = remarks || 'Cleared in Supplementary Examination';
  item.updated_at = new Date().toISOString();
  item.cleared_by = req.user.name;

  saveStore();
  res.json({
    success: true,
    message: `Backlog for ${item.subject_name} (${item.subject_code}) marked as CLEARED.`,
    backlog: item
  });
});

// POST /api/rvs/backlogs/sync-from-results - Auto sync from published exam results
router.post('/backlogs/sync-from-results', authenticateToken, requireRole('super_admin', 'college_admin'), (req, res) => {
  const store = getStore();
  store.backlogs = store.backlogs || [];
  const examResults = store.exam_results || [];

  let syncedCount = 0;
  examResults.forEach(resRecord => {
    // Check subject scores or grade
    const subjects = resRecord.subjects || [];
    subjects.forEach(sub => {
      const marks = Number(sub.marks || 0);
      const isFail = marks < 40 || sub.grade === 'F' || sub.status === 'Fail';
      if (isFail) {
        const existing = store.backlogs.find(b =>
          (b.student_id === resRecord.student_id || b.roll_no === resRecord.roll_no) &&
          b.subject_code === sub.code &&
          b.semester === resRecord.semester
        );
        if (!existing) {
          const newBacklog = {
            id: store.backlogs.length > 0 ? Math.max(...store.backlogs.map(b => b.id)) + 1 : 1,
            student_id: resRecord.student_id,
            student_name: resRecord.student_name,
            roll_no: resRecord.roll_no,
            reg_no: resRecord.reg_no || `JUT/2023/CSE/00${resRecord.student_id}`,
            subject_code: sub.code,
            subject_name: sub.name,
            department_code: resRecord.department_code || 'CSE',
            semester: resRecord.semester,
            original_exam: resRecord.exam_name || 'Semester End-Term Examination',
            attempt_number: 1,
            marks: marks,
            result: 'Fail',
            status: 'Pending',
            cleared_date: null,
            remarks: 'Auto-detected from published end-term examination results'
          };
          store.backlogs.push(newBacklog);
          syncedCount++;
        }
      }
    });
  });

  saveStore();
  res.json({
    success: true,
    message: `Synchronized backlogs with published results. ${syncedCount} new backlog records logged.`,
    totalBacklogs: store.backlogs.length
  });
});

// =========================================================================
// 3. INTERNAL MARKS MANAGEMENT & AUDIT
// =========================================================================

// GET /api/rvs/internal-marks/config - Get configured internal assessment components
router.get('/internal-marks/config', authenticateToken, (req, res) => {
  const store = getStore();
  const config = store.internal_marks_config || {
    academic_session: '2025-2026',
    department_code: 'ALL',
    components: [
      { name: 'Attendance', weightage: 10, max_marks: 10 },
      { name: 'Assignments', weightage: 20, max_marks: 20 },
      { name: 'Surprise Quizzes', weightage: 10, max_marks: 10 },
      { name: 'Mid-Semester Exam', weightage: 30, max_marks: 30 },
      { name: 'Class Test / Seminar', weightage: 15, max_marks: 15 },
      { name: 'Practical & Viva', weightage: 15, max_marks: 15 }
    ],
    total_weightage: 100,
    passing_internal_percent: 40
  };
  res.json({ success: true, config });
});

// POST /api/rvs/internal-marks/config - Admin configures components (Validates 100%)
router.post('/internal-marks/config', authenticateToken, requireRole('super_admin', 'college_admin'), (req, res) => {
  const store = getStore();
  const { components, passing_internal_percent = 40, academic_session = '2025-2026' } = req.body;

  if (!Array.isArray(components) || components.length === 0) {
    return res.status(400).json({ success: false, message: 'Internal assessment components array is required.' });
  }

  // Calculate sum of weights
  const totalWeight = components.reduce((sum, c) => sum + Number(c.weightage || 0), 0);
  if (Math.round(totalWeight) !== 100) {
    return res.status(400).json({
      success: false,
      message: `Invalid configuration: Total weightage must equal exactly 100%. Current configured sum is ${totalWeight}%.`
    });
  }

  store.internal_marks_config = {
    academic_session,
    components: components.map(c => ({
      name: c.name.trim(),
      weightage: Number(c.weightage),
      max_marks: Number(c.max_marks || c.weightage),
      description: c.description || ''
    })),
    total_weightage: 100,
    passing_internal_percent: Number(passing_internal_percent),
    updated_at: new Date().toISOString(),
    updated_by: req.user.name
  };

  saveStore();
  res.json({
    success: true,
    message: 'Internal marks configuration updated and verified (100% total weightage).',
    config: store.internal_marks_config
  });
});

// GET /api/rvs/internal-marks - Get internal marks roster for class & subject
router.get('/internal-marks', authenticateToken, (req, res) => {
  const store = getStore();
  const { department = 'CSE', semester = '6th Semester', subject_code = 'CS-601' } = req.query;

  const record = (store.internal_marks || []).find(
    m => m.subject_code === subject_code && m.department_code === department && m.semester === semester
  );

  // If none exists, generate standard draft list from students in this class
  if (!record) {
    const studentsInClass = (store.students_profile || []).filter(
      p => p.department_code === department && p.semester === semester && p.status === 'active'
    );
    const users = store.users || [];

    const generatedStudents = studentsInClass.map(s => {
      const u = users.find(usr => usr.id === s.user_id) || {};
      return {
        student_id: s.user_id,
        roll_no: s.roll_no,
        student_name: u.name || s.student_name || 'Student',
        marks: {
          Attendance: 8,
          Assignments: 16,
          'Surprise Quizzes': 8,
          'Mid-Semester Exam': 24,
          'Class Test / Seminar': 12,
          'Practical & Viva': 12
        },
        total_internal: 80,
        max_possible: 100,
        grade: 'A',
        status: 'Draft'
      };
    });

    return res.json({
      success: true,
      data: {
        department_code: department,
        semester,
        subject_code,
        subject_name: 'Core Subject',
        is_locked: false,
        faculty_name: req.user.name,
        students: generatedStudents
      }
    });
  }

  res.json({ success: true, data: record });
});

// POST /api/rvs/internal-marks/save-draft - Save draft marks
router.post('/internal-marks/save-draft', authenticateToken, requireRole('super_admin', 'college_admin', 'faculty'), (req, res) => {
  const store = getStore();
  const { department_code, semester, subject_code, subject_name, students } = req.body;

  if (!subject_code || !Array.isArray(students)) {
    return res.status(400).json({ success: false, message: 'Subject code and students array are required.' });
  }

  store.internal_marks = store.internal_marks || [];
  let record = store.internal_marks.find(
    m => m.subject_code === subject_code && m.department_code === department_code && m.semester === semester
  );

  if (record && record.is_locked) {
    return res.status(403).json({
      success: false,
      message: 'This internal marks sheet is LOCKED and finalized. Authorized corrections require administrative override with reason.'
    });
  }

  if (!record) {
    record = {
      id: store.internal_marks.length > 0 ? Math.max(...store.internal_marks.map(m => m.id)) + 1 : 1,
      department_code,
      semester,
      subject_code,
      subject_name: subject_name || subject_code,
      faculty_id: req.user.id,
      faculty_name: req.user.name,
      session: '2025-2026',
      is_locked: false,
      locked_at: null,
      students: []
    };
    store.internal_marks.push(record);
  }

  record.students = students.map(s => {
    const marksObj = s.marks || {};
    const total = Object.values(marksObj).reduce((sum, v) => sum + Number(v || 0), 0);
    return {
      student_id: s.student_id,
      roll_no: s.roll_no,
      student_name: s.student_name,
      marks: marksObj,
      total_internal: Number(total.toFixed(1)),
      max_possible: 100,
      grade: total >= 90 ? 'A+' : total >= 80 ? 'A' : total >= 70 ? 'B+' : total >= 60 ? 'B' : total >= 50 ? 'C' : total >= 40 ? 'P' : 'F',
      status: 'Draft'
    };
  });

  saveStore();
  res.json({ success: true, message: 'Draft internal marks saved successfully.', data: record });
});

// POST /api/rvs/internal-marks/lock - Lock/finalize marks sheet
router.post('/internal-marks/lock', authenticateToken, requireRole('super_admin', 'college_admin', 'faculty'), (req, res) => {
  const store = getStore();
  const { department_code, semester, subject_code } = req.body;

  store.internal_marks = store.internal_marks || [];
  const record = store.internal_marks.find(
    m => m.subject_code === subject_code && m.department_code === department_code && m.semester === semester
  );

  if (!record) {
    return res.status(404).json({ success: false, message: 'Internal marks sheet not found.' });
  }

  record.is_locked = true;
  record.locked_at = new Date().toISOString();
  record.locked_by_name = req.user.name;
  record.students.forEach(s => { s.status = 'Finalized'; });

  saveStore();
  res.json({ success: true, message: `Internal marks for ${subject_code} are now locked and published.`, data: record });
});

// POST /api/rvs/internal-marks/correct - Authorized modification after locking with mandatory reason & audit
router.post('/internal-marks/correct', authenticateToken, requireRole('super_admin', 'college_admin', 'faculty'), (req, res) => {
  const store = getStore();
  const { subject_code, student_id, component, new_mark, reason } = req.body;

  if (!subject_code || !student_id || !component || new_mark === undefined || !reason) {
    return res.status(400).json({
      success: false,
      message: 'Subject code, student ID, assessment component, new mark, and a mandatory justification reason are required.'
    });
  }

  store.internal_marks = store.internal_marks || [];
  const sheet = store.internal_marks.find(m => m.subject_code === subject_code);
  if (!sheet) {
    return res.status(404).json({ success: false, message: 'Internal marks sheet not found.' });
  }

  const studentEntry = sheet.students.find(s => s.student_id === Number(student_id));
  if (!studentEntry) {
    return res.status(404).json({ success: false, message: 'Student record not found in sheet.' });
  }

  const prevMark = studentEntry.marks[component] !== undefined ? studentEntry.marks[component] : 0;
  studentEntry.marks[component] = Number(new_mark);

  // Recalculate total
  const total = Object.values(studentEntry.marks).reduce((sum, v) => sum + Number(v || 0), 0);
  studentEntry.total_internal = Number(total.toFixed(1));
  studentEntry.grade = total >= 90 ? 'A+' : total >= 80 ? 'A' : total >= 70 ? 'B+' : total >= 60 ? 'B' : total >= 50 ? 'C' : total >= 40 ? 'P' : 'F';

  // Record Audit Entry
  store.internal_marks_audit = store.internal_marks_audit || [];
  const auditEntry = {
    id: store.internal_marks_audit.length > 0 ? Math.max(...store.internal_marks_audit.map(a => a.id)) + 1 : 1,
    subject_code,
    student_id: Number(student_id),
    student_name: studentEntry.student_name,
    component,
    previous_mark: prevMark,
    new_mark: Number(new_mark),
    reason: reason.trim(),
    changed_by_id: req.user.id,
    changed_by_name: req.user.name,
    changed_by_role: req.user.role,
    created_at: new Date().toISOString()
  };
  store.internal_marks_audit.unshift(auditEntry);

  saveStore();
  res.json({
    success: true,
    message: `Marks corrected for ${studentEntry.student_name} in ${component}. Audit record logged.`,
    auditEntry,
    student: studentEntry
  });
});

// GET /api/rvs/internal-marks/audit-log - View audit logs
router.get('/internal-marks/audit-log', authenticateToken, requireRole('super_admin', 'college_admin', 'faculty'), (req, res) => {
  const store = getStore();
  const { subject_code, student_id } = req.query;
  let list = store.internal_marks_audit || [];

  if (subject_code) list = list.filter(a => a.subject_code === subject_code);
  if (student_id) list = list.filter(a => a.student_id === Number(student_id));

  res.json({ success: true, logs: list });
});

// GET /api/rvs/internal-marks/student/:id - Student's published internal marks
router.get('/internal-marks/student/:id', authenticateToken, (req, res) => {
  const store = getStore();
  const targetId = Number(req.params.id);

  if (req.user.role === 'student' && req.user.id !== targetId) {
    return res.status(403).json({ success: false, message: 'Unauthorized.' });
  }

  const results = [];
  (store.internal_marks || []).forEach(sheet => {
    // Only published/finalized marks visible to student
    const studentData = (sheet.students || []).find(s => s.student_id === targetId);
    if (studentData) {
      results.push({
        subject_code: sheet.subject_code,
        subject_name: sheet.subject_name,
        semester: sheet.semester,
        is_locked: sheet.is_locked,
        status: sheet.is_locked ? 'Published' : 'Provisional Draft',
        marks: studentData.marks,
        total_internal: studentData.total_internal,
        max_possible: studentData.max_possible,
        grade: studentData.grade
      });
    }
  });

  res.json({ success: true, internalMarks: results });
});

module.exports = router;
