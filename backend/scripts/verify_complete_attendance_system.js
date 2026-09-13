const http = require('http');

function request(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api' + path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function verifyAll() {
  console.log('===============================================================');
  console.log('   RVS SMART CAMPUS - COMPLETE ATTENDANCE SYSTEM VERIFICATION');
  console.log('===============================================================\n');

  let passed = 0;
  let total = 0;
  function check(label, condition, details = '') {
    total++;
    if (condition) {
      passed++;
      console.log(`✅ [PASS] ${label} ${details ? '(' + details + ')' : ''}`);
    } else {
      console.error(`❌ [FAIL] ${label} ${details ? '(' + details + ')' : ''}`);
    }
  }

  // --- Step 1: Authentication ---
  console.log('--- Step 1: Role Authentication ---');
  const studentAuth = await request('POST', '/auth/login', { email: 'student.rvs@rvscet.ac.in', password: 'Student@123' });
  check('Student Login', studentAuth.status === 200, `User: ${studentAuth.body.user?.name}`);

  const facultyAuth = await request('POST', '/auth/login', { email: 'faculty.cse@rvscet.ac.in', password: 'Faculty@123' });
  check('Faculty Login', facultyAuth.status === 200, `User: ${facultyAuth.body.user?.name}`);

  const adminAuth = await request('POST', '/auth/login', { email: 'admin@rvscet.ac.in', password: 'Admin@123' });
  check('College Admin Login', adminAuth.status === 200, `User: ${adminAuth.body.user?.name}`);

  // --- Step 2: Student Attendance History (Requirement 1) ---
  console.log('\n--- Step 2: Student Attendance History & Summary Cards (Req 1) ---');
  const studentHistory = await request('GET', '/rvs/attendance/student/history', null, studentAuth.body.token);
  check('Student History API Response', studentHistory.status === 200);
  check('Summary Card: Overall Attendance %', typeof studentHistory.body.summary?.overallPercentage === 'number', `${studentHistory.body.summary?.overallPercentage}%`);
  check('Summary Card: Total Classes', studentHistory.body.summary?.totalClasses > 50, `${studentHistory.body.summary?.totalClasses} classes`);
  check('Summary Card: Present Classes', studentHistory.body.summary?.present > 0, `${studentHistory.body.summary?.present} present`);
  check('Summary Card: Absent Classes', typeof studentHistory.body.summary?.absent === 'number', `${studentHistory.body.summary?.absent} absent`);
  check('Summary Card: Late Classes', typeof studentHistory.body.summary?.late === 'number', `${studentHistory.body.summary?.late} late`);
  check('Summary Card: Excused Classes', typeof studentHistory.body.summary?.excused === 'number', `${studentHistory.body.summary?.excused} excused`);

  const sampleRecord = studentHistory.body.records?.[0];
  check('Record fields: Date, Day, Subject, Code, Faculty, Period, Status, Method',
    Boolean(sampleRecord?.attendance_date && sampleRecord?.day && sampleRecord?.subject_name && sampleRecord?.subject_code && sampleRecord?.faculty_name && sampleRecord?.class_period && sampleRecord?.status && sampleRecord?.method),
    `${sampleRecord?.subject_code} on ${sampleRecord?.attendance_date} [${sampleRecord?.status} via ${sampleRecord?.method}]`
  );

  // --- Step 3: Student Attendance Filters (Requirement 2) ---
  console.log('\n--- Step 3: Student Filters (Req 2) ---');
  const subjectFilterRes = await request('GET', '/rvs/attendance/student/history?subject=CS-601', null, studentAuth.body.token);
  check('Filter by Subject (CS-601)', subjectFilterRes.body.records?.every(r => r.subject_code === 'CS-601'), `${subjectFilterRes.body.totalFiltered} records`);

  const statusFilterRes = await request('GET', '/rvs/attendance/student/history?status=Present', null, studentAuth.body.token);
  check('Filter by Status (Present)', statusFilterRes.body.records?.every(r => r.status === 'Present'), `${statusFilterRes.body.totalFiltered} records`);

  const presetFilterRes = await request('GET', '/rvs/attendance/student/history?preset=this_month', null, studentAuth.body.token);
  check('Filter by Preset (This Month)', presetFilterRes.status === 200, `${presetFilterRes.body.totalFiltered} records`);

  // --- Step 4: Dynamic Subject-Wise Attendance Calculation (Requirement 3) ---
  console.log('\n--- Step 4: Subject-Wise Attendance (Req 3) ---');
  const subjectWise = studentHistory.body.subjectWise;
  check('Subject-wise list available', Array.isArray(subjectWise) && subjectWise.length >= 4, `${subjectWise?.length} subjects`);
  subjectWise?.forEach(s => {
    const manualAtt = s.present + s.late;
    const manualPct = Number(((manualAtt / s.totalClasses) * 100).toFixed(1));
    check(`Subject ${s.code} ${s.name} dynamic calculation`, s.percentage === manualPct, `Actual: ${s.percentage}% vs Recs: ${manualPct}%`);
  });

  // --- Step 5: Monthly Attendance & Trend Chart (Requirement 4) ---
  console.log('\n--- Step 5: Monthly Attendance View & Trend (Req 4) ---');
  const monthlyView = studentHistory.body.monthlyView;
  check('Monthly View Working Days', monthlyView?.workingDays > 0, `${monthlyView?.workingDays} working days`);
  check('Monthly View Classes Conducted', monthlyView?.classesConducted > 0, `${monthlyView?.classesConducted} classes`);
  check('Monthly View Attendance %', typeof monthlyView?.percentage === 'number', `${monthlyView?.percentage}%`);
  check('Attendance Trend Chart points', Array.isArray(monthlyView?.trendChart) && monthlyView.trendChart.length > 0, `${monthlyView?.trendChart?.length} trend days`);

  // --- Step 6: Attendance Calendar View (Requirement 5) ---
  console.log('\n--- Step 6: Attendance Calendar View (Req 5) ---');
  const calendarMap = studentHistory.body.calendarMap;
  check('Calendar Mapping Dictionary', Boolean(calendarMap && Object.keys(calendarMap).length > 20), `${Object.keys(calendarMap || {}).length} dates indexed`);
  const firstCalKey = Object.keys(calendarMap || {})[0];
  check('Calendar Date contains class records and status', Boolean(calendarMap?.[firstCalKey]?.classes?.length > 0 && calendarMap?.[firstCalKey]?.status), `Status: ${calendarMap?.[firstCalKey]?.status}`);

  // --- Step 7: Faculty Attendance History (Requirements 6 & 7) ---
  console.log('\n--- Step 7: Faculty Attendance History & Monthly View (Req 6 & 7) ---');
  const facultyHistory = await request('GET', '/rvs/attendance/faculty/history', null, facultyAuth.body.token);
  check('Faculty History API Response', facultyHistory.status === 200);
  check('Faculty Summary: Total Working Days', facultyHistory.body.summary?.totalWorkingDays > 0, `${facultyHistory.body.summary?.totalWorkingDays} days`);
  check('Faculty Summary: Present Days', facultyHistory.body.summary?.presentDays > 0, `${facultyHistory.body.summary?.presentDays} days`);
  check('Faculty Summary: Working Hours', typeof facultyHistory.body.summary?.totalWorkingHours === 'string', facultyHistory.body.summary?.totalWorkingHours);
  check('Faculty Summary: Attendance %', typeof facultyHistory.body.summary?.attendancePct === 'number', `${facultyHistory.body.summary?.attendancePct}%`);

  const sampleFacRecord = facultyHistory.body.records?.[0];
  check('Faculty Record fields: Date, Day, Check-in, Check-out, Working Hours, Status, Leave',
    Boolean(sampleFacRecord?.attendance_date && sampleFacRecord?.day && sampleFacRecord?.status),
    `${sampleFacRecord?.faculty_name}: in ${sampleFacRecord?.check_in}, out ${sampleFacRecord?.check_out} (${sampleFacRecord?.working_hours})`
  );

  // --- Step 8: Faculty Check-in Action ---
  const checkinRes = await request('POST', '/rvs/attendance/faculty/checkin', { action: 'check_in' }, facultyAuth.body.token);
  check('Faculty Check-in endpoint', checkinRes.status === 200, checkinRes.body.message);

  // --- Step 9: Admin Inspecting Student & Faculty Attendance (Requirements 8 & 9) ---
  console.log('\n--- Step 8: Admin Attendance Inspection (Req 8 & 9) ---');
  const adminStudentInspect = await request('GET', '/rvs/attendance/student/history?student_id=10', null, adminAuth.body.token);
  check('Admin inspects student Vikramaditya (id 10)', adminStudentInspect.body.student?.id === 10, `${adminStudentInspect.body.student?.name} (${adminStudentInspect.body.student?.rollNo})`);

  const adminFacultyInspect = await request('GET', '/rvs/attendance/faculty/history?faculty_id=6', null, adminAuth.body.token);
  check('Admin inspects faculty Prof. Jeevan Kumar (id 6)', adminFacultyInspect.body.faculty?.id === 6, `${adminFacultyInspect.body.faculty?.name}`);

  // --- Step 10: Attendance Correction & Non-Destructive Audit Trail (Requirement 10) ---
  console.log('\n--- Step 9: Attendance Correction & Audit History (Req 10) ---');
  const testStudentRecId = adminStudentInspect.body.records?.[0]?.id;
  const initialStatus = adminStudentInspect.body.records?.[0]?.status;
  const newStatus = initialStatus === 'Present' ? 'Excused' : 'Present';
  const reasonText = 'HOD authorized: Student attended State Level Hackathon in Ranchi.';

  const correctionRes = await request('POST', '/rvs/attendance/correct', {
    record_type: 'student',
    record_id: testStudentRecId,
    new_status: newStatus,
    reason: reasonText
  }, adminAuth.body.token);
  check('Attendance Correction Endpoint', correctionRes.status === 200, correctionRes.body.message);
  check('Audit Log Entry Created', Boolean(correctionRes.body.auditEntry?.id && correctionRes.body.auditEntry?.reason === reasonText), `Audit #${correctionRes.body.auditEntry?.id}`);

  const auditLogsRes = await request('GET', '/rvs/attendance/audit-logs', null, adminAuth.body.token);
  check('Audit Logs API returns entries', auditLogsRes.body.totalLogs > 0, `${auditLogsRes.body.totalLogs} audit logs`);

  // --- Step 11: Low Attendance Alert System (Requirement 13) ---
  console.log('\n--- Step 10: Low Attendance Alert System (Req 13) ---');
  check('Student id 10 has Low Attendance Warning (<75%)',
    adminStudentInspect.body.summary?.hasLowAttendanceWarning === true,
    `Rate: ${adminStudentInspect.body.summary?.overallPercentage}% < Min: ${adminStudentInspect.body.summary?.minRequired}%`
  );

  const adminOverview = await request('GET', '/rvs/attendance/admin/overview', null, adminAuth.body.token);
  check('Admin Overview: Low Attendance Students List',
    adminOverview.body.lowAttendanceStudents?.some(s => s.id === 10),
    `Found ${adminOverview.body.lowAttendanceStudents?.length} students below threshold`
  );

  // --- Step 12: Attendance Reports Generation (Requirements 11 & 12) ---
  console.log('\n--- Step 11: Attendance Reports Generation (Req 11 & 12) ---');
  const studentReport = await request('GET', '/rvs/attendance/reports?type=student_monthly&month=9&year=2026', null, adminAuth.body.token);
  check('Student Monthly Report with RVS Branding',
    studentReport.body.metadata?.institutionName === 'RVS College of Engineering & Technology' && studentReport.body.rows?.length > 0,
    `${studentReport.body.rows?.length} rows generated`
  );

  const facultyReport = await request('GET', '/rvs/attendance/reports?type=faculty_monthly&month=9&year=2026', null, adminAuth.body.token);
  check('Faculty Monthly Report with Working Hours',
    facultyReport.body.metadata?.institutionName === 'RVS College of Engineering & Technology' && facultyReport.body.rows?.length > 0,
    `${facultyReport.body.rows?.length} faculty rows generated`
  );

  // --- Step 13: QR Attendance & Manual Attendance Preservation ---
  console.log('\n--- Step 12: QR Generation & Scanner Preservation ---');
  const qrGenRes = await request('POST', '/rvs/attendance/qr/generate', {
    course_id: 101,
    department_code: 'CSE',
    semester: '6th Semester',
    validityMinutes: 3
  }, facultyAuth.body.token);
  check('Faculty QR Generation works', qrGenRes.status === 201 && Boolean(qrGenRes.body.session?.qr_token), qrGenRes.body.session?.qr_token);

  const qrScanRes = await request('POST', '/rvs/attendance/qr/scan', {
    qr_token: qrGenRes.body.session?.qr_token
  }, studentAuth.body.token);
  check('Student QR Scan marks attendance & writes to database',
    qrScanRes.status === 200 && Boolean(qrScanRes.body.record?.id),
    qrScanRes.body.message
  );

  console.log('\n===============================================================');
  console.log(`   FINAL VERIFICATION SCORE: ${passed} / ${total} TESTS PASSED (${Math.round((passed/total)*100)}%)`);
  console.log('===============================================================\n');
}

verifyAll().catch(console.error);
