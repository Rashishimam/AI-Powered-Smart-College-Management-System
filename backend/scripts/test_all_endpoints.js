const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'campusiq_super_secret_jwt_key_2026_production_grade_token';

// Create test tokens
const tokens = {
  super_admin: jwt.sign({ id: 1, email: 'superadmin@rvscet.ac.in', role: 'super_admin', college_id: null, name: 'RVS Trust Board' }, JWT_SECRET, { expiresIn: '1h' }),
  college_admin: jwt.sign({ id: 2, email: 'admin@rvscet.ac.in', role: 'college_admin', college_id: 1, name: 'Dr. R. N. Gupta' }, JWT_SECRET, { expiresIn: '1h' }),
  faculty: jwt.sign({ id: 3, email: 'faculty.cse@rvscet.ac.in', role: 'faculty', college_id: 1, name: 'Prof. Rajesh Sharma' }, JWT_SECRET, { expiresIn: '1h' }),
  student: jwt.sign({ id: 4, email: 'student.rvs@rvscet.ac.in', role: 'student', college_id: 1, name: 'Rahul Kumar Verma' }, JWT_SECRET, { expiresIn: '1h' })
};

async function testEndpoint(name, url, method = 'GET', body = null, role = 'college_admin') {
  const token = tokens[role];
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`http://localhost:5000${url}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    return { name, url, status: res.status, ok: res.ok };
  } catch (e) {
    return { name, url, status: 0, error: e.message };
  }
}

async function runTests() {
  const tests = [
    // Health & Info
    ['Health', '/api/health', 'GET', null, null],
    ['Public Info', '/api/rvs/public-info', 'GET', null, null],
    ['Programs', '/api/rvs/programs', 'GET', null, null],
    ['Departments', '/api/rvs/departments', 'GET', null, 'college_admin'],
    ['Students List', '/api/rvs/students', 'GET', null, 'college_admin'],
    ['Faculty List', '/api/rvs/faculty', 'GET', null, 'college_admin'],
    ['Attendance Stats', '/api/rvs/attendance/stats', 'GET', null, 'faculty'],
    ['Student Attendance Hist', '/api/rvs/attendance/student/history', 'GET', null, 'student'],
    ['Faculty Attendance Hist', '/api/rvs/attendance/faculty/history', 'GET', null, 'faculty'],
    ['Fees', '/api/rvs/fees', 'GET', null, 'college_admin'],
    ['Placements', '/api/rvs/placements', 'GET', null, 'student'],
    ['Library Books', '/api/rvs/library/books', 'GET', null, 'student'],
    ['Notices', '/api/rvs/notices', 'GET', null, 'student'],
    ['Timetable', '/api/rvs/timetable', 'GET', null, 'student'],
    ['Grievances', '/api/rvs/grievances', 'GET', null, 'student'],

    // Phase 1-6
    ['Student 360', '/api/rvs/students/4/profile-360', 'GET', null, 'college_admin'],
    ['Backlogs', '/api/rvs/backlogs', 'GET', null, 'college_admin'],
    ['Internal Marks', '/api/rvs/internal-marks', 'GET', null, 'college_admin'],
    ['Admit Cards', '/api/rvs/admit-cards/eligibility', 'GET', null, 'college_admin'],
    ['Certificates', '/api/rvs/certificates/4', 'GET', null, 'student'],
    ['Documents', '/api/rvs/documents', 'GET', null, 'college_admin'],
    ['Labs Equipment', '/api/rvs/labs/equipment', 'GET', null, 'faculty'],
    ['Substitution Check', '/api/rvs/faculty-substitution/recommendations', 'GET', null, 'college_admin'],
    ['Gate Passes', '/api/rvs/gate/passes', 'GET', null, 'college_admin'],
    ['Facility Bookings', '/api/rvs/facilities/bookings', 'GET', null, 'faculty'],
    ['Hostel Rooms', '/api/rvs/hostel/rooms', 'GET', null, 'student'],
    ['Transport Routes', '/api/rvs/transport/routes', 'GET', null, 'student'],
    ['Alumni', '/api/rvs/alumni', 'GET', null, 'college_admin'],
    ['Helpdesk Tickets', '/api/rvs/helpdesk/tickets', 'GET', null, 'student'],
    ['Feedback Surveys', '/api/rvs/feedback/surveys', 'GET', null, 'student'],

    // Adv Phase 1-4
    ['Adv Sessions', '/api/rvs/adv/sessions', 'GET', null, 'college_admin'],
    ['Adv Workload Analytics', '/api/rvs/adv/workload/analytics', 'GET', null, 'college_admin'],
    ['Adv Projects', '/api/rvs/adv/projects', 'GET', null, 'faculty'],
    ['Adv Internships', '/api/rvs/adv/internships', 'GET', null, 'college_admin'],
    ['Adv Trainings', '/api/rvs/adv/trainings', 'GET', null, 'college_admin'],
    ['Adv Scholarships', '/api/rvs/adv/scholarships/schemes', 'GET', null, 'college_admin'],
    ['Adv No Dues', '/api/rvs/adv/no-dues', 'GET', null, 'college_admin'],
    ['Adv Exam Seating', '/api/rvs/exam-seating', 'GET', null, 'college_admin'],
    ['Adv Invigilation', '/api/rvs/invigilation', 'GET', null, 'college_admin'],
    ['Adv Question Bank', '/api/rvs/question-bank', 'GET', null, 'faculty'],
    ['Adv Revaluation', '/api/rvs/revaluation', 'GET', null, 'student']
  ];

  console.log(`Testing ${tests.length} representative API endpoints across all phases...`);
  const results = [];
  for (const t of tests) {
    const r = await testEndpoint(t[0], t[1], t[2], t[3], t[4]);
    results.push(r);
    console.log(`${r.status === 200 || r.status === 201 ? '✅' : '❌'} [${r.status}] ${r.name} -> ${r.url}`);
  }

  const failures = results.filter(r => r.status !== 200 && r.status !== 201);
  console.log(`\nResults: ${results.length - failures.length}/${results.length} passed.`);
  if (failures.length > 0) {
    console.log('Failed endpoints:');
    failures.forEach(f => console.log(`  - ${f.name} (${f.url}): Status ${f.status}`));
  }
}

runTests();
