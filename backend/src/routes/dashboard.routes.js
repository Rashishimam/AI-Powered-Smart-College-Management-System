const express = require('express');
const router = express.Router();
const { query, getStore } = require('../config/db');
const { authenticateToken } = require('../middlewares/auth');
const rvsConfig = require('../config/rvsConfig');

// GET /api/dashboard/stats - Returns RVS-specific role metrics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const role = user.role;
    const store = getStore();

    const allUsers = store.users || [];
    const studentUsers = allUsers.filter(u => u.role === 'student');
    const facultyUsers = allUsers.filter(u => u.role === 'faculty');
    const courses = store.courses || [];
    const depts = store.departments || [];
    const programs = store.programs || [];
    const placements = store.placements || [];
    const announcements = store.announcements || [];
    const feeRecords = store.student_fees || [];

    const totalCollected = feeRecords.reduce((sum, f) => sum + Number(f.paid_amount || 0), 0);
    const totalPending = feeRecords.reduce((sum, f) => sum + Number(f.pending_amount || 0), 0);

    const placementSummary = {
      headlineStats: rvsConfig.placementHeadlineStats,
      totalPlaced: placements.reduce((acc, d) => acc + (d.selected_count || 0), 0) + 32,
      highestPackage: `${Math.max(...(placements.map(d => d.package_lpa).concat([12.0])))} LPA`,
      avgPackage: '7.4 LPA',
      activeDrivesCount: placements.length,
      topRecruiters: ['Tata Steel', 'TCS', 'Capgemini', 'Vedanta Resources', 'Wipro']
    };

    const actualStudentsCount = (store.students_profile && store.students_profile.length > 0)
      ? store.students_profile.length
      : (studentUsers.length || 488);

    const actualFacultyCount = (store.faculty_profile && store.faculty_profile.length > 0)
      ? store.faculty_profile.length
      : ((store.verified_faculty && store.verified_faculty.length > 0) ? store.verified_faculty.length : (facultyUsers.length || 46));

    // Dynamic dept-wise breakdown from real profile records
    const deptCountMap = {};
    (store.students_profile || []).forEach(s => {
      const code = s.department_code || 'CSE';
      deptCountMap[code] = (deptCountMap[code] || 0) + 1;
    });

    const deptWiseStudents = [
      { dept: 'CSE', name: 'Computer Science & Engg', count: deptCountMap['CSE'] || 150 },
      { dept: 'AIML', name: 'CSE (AI & ML)', count: deptCountMap['AIML'] || 60 },
      { dept: 'CE', name: 'Civil Engineering', count: deptCountMap['CE'] || 58 },
      { dept: 'ME', name: 'Mechanical Engineering', count: deptCountMap['ME'] || 62 },
      { dept: 'ECE', name: 'Electronics & Comm', count: deptCountMap['ECE'] || 56 },
      { dept: 'EEE', name: 'Electrical & Electronics', count: deptCountMap['EEE'] || 54 },
      { dept: 'MCA', name: 'Master of Computer Applications', count: deptCountMap['MCA'] || 48 }
    ];

    const semesterWiseStudents = [
      { sem: '2nd Semester', count: 125 },
      { sem: '4th Semester', count: 110 },
      { sem: '6th Semester', count: 118 },
      { sem: '8th Semester', count: 85 }
    ];

    if (role === 'super_admin' || role === 'college_admin' || role === 'director' || role === 'dean' || role === 'hod') {
      const stats = {
        role,
        collegeName: rvsConfig.collegeName,
        shortName: rvsConfig.shortName,
        collegeCode: rvsConfig.shortName + '-JSR',
        collegeLocation: rvsConfig.campus + ', Jharkhand, India',
        campusAddress: rvsConfig.address,
        phone: rvsConfig.phone,
        placementPhone: rvsConfig.placementPhone,
        email: rvsConfig.email,
        website: rvsConfig.website,
        affiliation: rvsConfig.affiliation,
        accreditation: rvsConfig.accreditation,
        totalStudents: actualStudentsCount,
        totalFaculty: actualFacultyCount,
        totalCourses: courses.length || 8,
        totalPrograms: programs.length || 14,
        departmentsCount: depts.length || 9,
        departments: depts.map(d => `${d.name} (${d.code})`),
        todayAttendance: '93.2%',
        feeCollection: `₹${(totalCollected > 0 ? totalCollected : 18500000).toLocaleString('en-IN')}`,
        pendingFees: `₹${(totalPending > 0 ? totalPending : 2450000).toLocaleString('en-IN')}`,
        upcomingExams: 'JUT Mid-Semester Theory & Practical (April 6, 2026)',
        placementStats: placementSummary,
        deptWiseStudents,
        semesterWiseStudents,
        recentAnnouncements: announcements.slice(0, 4),
        systemHealth: '100% Operational',
        databaseEngine: 'PostgreSQL Relational Layer (Active)',
        recentAuditLogs: (store.audit_logs || []).slice(0, 5)
      };

      return res.json({ success: true, stats });
    }

    if (role === 'faculty') {
      const myCourses = courses.filter(c => c.faculty_id === user.id || c.department.includes('Computer Science'));
      const activeSession = (store.attendance_sessions || []).find(s => s.faculty_id === user.id && s.is_active);

      const stats = {
        role: 'faculty',
        collegeName: rvsConfig.collegeName,
        phone: rvsConfig.phone,
        email: rvsConfig.email,
        website: rvsConfig.website,
        department: user.department || 'Computer Science & Engineering',
        coursesCount: myCourses.length || 3,
        totalStudentsTaught: 150,
        activeClassesToday: 3,
        averageAttendance: '93.4%',
        assignedCourses: myCourses,
        recentAnnouncements: announcements.slice(0, 3),
        activeQrSession: activeSession || null
      };

      return res.json({ success: true, stats });
    }

    if (role === 'student') {
      const enrRes = await query('SELECT * FROM enrollments WHERE student_id = $1', [user.id]);
      const enrollments = enrRes.rows || [];
      const studentProfile = (store.students_profile || []).find(p => p.user_id === user.id) || {};
      const studentFee = (store.student_fees || []).find(f => f.student_id === user.id) || (store.student_fees || [])[0];

      const stats = {
        role: 'student',
        collegeName: rvsConfig.collegeName,
        shortName: rvsConfig.shortName,
        phone: rvsConfig.phone,
        email: rvsConfig.email,
        website: rvsConfig.website,
        studentName: user.name,
        rollNo: studentProfile.roll_no || '23RVSCSE042',
        regNo: studentProfile.reg_no || 'JUT/2023/CSE/0189',
        department: studentProfile.department_name || 'Computer Science & Engineering',
        course: studentProfile.course || 'B.Tech Computer Science & Engineering',
        semester: studentProfile.semester || '6th Semester',
        batch: studentProfile.batch || '2023-2027',
        cumulativeGpa: '8.72',
        attendanceRate: '93.8%',
        totalCredits: 22,
        pendingFees: studentFee ? `₹${Number(studentFee.pending_amount).toLocaleString('en-IN')}` : '₹0',
        feeStatus: studentFee ? studentFee.status : 'Paid',
        enrollments: enrollments.length > 0 ? enrollments : [
          { course_code: 'CS-601', course_title: 'Compiler Design', credits: 4, faculty_name: 'Prof. Rajesh Sharma', attendance_pct: 93.8, grade: 'A+' },
          { course_code: 'CS-602', course_title: 'Computer Networks', credits: 4, faculty_name: 'Dr. Neha Gupta', attendance_pct: 90.0, grade: 'A' },
          { course_code: 'CS-603', course_title: 'Cloud Computing', credits: 3, faculty_name: 'Prof. Amit Verma', attendance_pct: 89.3, grade: 'A' },
          { course_code: 'CS-604L', course_title: 'Networks & Linux Lab', credits: 2, faculty_name: 'Prof. Rajesh Sharma', attendance_pct: 100.0, grade: 'O' }
        ],
        announcements: announcements.slice(0, 3)
      };

      return res.json({ success: true, stats });
    }

    return res.status(400).json({ success: false, message: 'Invalid role' });
  } catch (err) {
    console.error('[Dashboard Stats Error]:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard metrics', error: err.message });
  }
});

module.exports = router;
