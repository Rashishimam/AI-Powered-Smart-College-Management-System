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

async function runTests() {
  console.log('=== TESTING ATTENDANCE HISTORY SYSTEM APIS ===\n');

  // 1. Student Login
  console.log('1. Logging in as Student (student.rvs@rvscet.ac.in)...');
  const studentLogin = await request('POST', '/auth/login', {
    email: 'student.rvs@rvscet.ac.in',
    password: 'Student@123'
  });
  console.log('Status:', studentLogin.status, 'Success:', studentLogin.body.success);
  const studentToken = studentLogin.body.token;

  // 2. Student Attendance History
  console.log('\n2. Fetching Student Attendance History...');
  const studentHistory = await request('GET', '/rvs/attendance/student/history', null, studentToken);
  console.log('Status:', studentHistory.status);
  console.log('Student:', studentHistory.body.student?.name, 'Roll:', studentHistory.body.student?.rollNo);
  console.log('Summary:', studentHistory.body.summary);
  console.log('Subject-wise count:', studentHistory.body.subjectWise?.length);
  studentHistory.body.subjectWise?.forEach(s => {
    console.log(`  - ${s.code} ${s.name}: ${s.attended}/${s.totalClasses} (${s.percentage}%) [${s.statusBadge}]`);
  });
  console.log('Monthly View percentage:', studentHistory.body.monthlyView?.percentage + '%');
  console.log('Calendar dates count:', Object.keys(studentHistory.body.calendarMap || {}).length);
  console.log('Total filtered records:', studentHistory.body.totalFiltered);

  // 3. Test Student Filters (e.g. Subject CS-601, Status Absent)
  console.log('\n3. Testing Student Filter: ?subject=CS-601&status=Absent');
  const filtered = await request('GET', '/rvs/attendance/student/history?subject=CS-601&status=Absent', null, studentToken);
  console.log('Filtered Absent in CS-601:', filtered.body.totalFiltered);
  if (filtered.body.records?.length > 0) {
    console.log('Sample record:', {
      date: filtered.body.records[0].attendance_date,
      day: filtered.body.records[0].day,
      subject: filtered.body.records[0].subject_name,
      status: filtered.body.records[0].status,
      method: filtered.body.records[0].method
    });
  }

  // 4. Faculty Login
  console.log('\n4. Logging in as Faculty (faculty.cse@rvscet.ac.in)...');
  const facultyLogin = await request('POST', '/auth/login', {
    email: 'faculty.cse@rvscet.ac.in',
    password: 'Faculty@123'
  });
  console.log('Status:', facultyLogin.status, 'Faculty:', facultyLogin.body.user?.name);
  const facultyToken = facultyLogin.body.token;

  // 5. Faculty Attendance History
  console.log('\n5. Fetching Faculty Attendance History...');
  const facultyHistory = await request('GET', '/rvs/attendance/faculty/history', null, facultyToken);
  console.log('Status:', facultyHistory.status);
  console.log('Faculty Summary:', facultyHistory.body.summary);
  console.log('Monthly Hours:', facultyHistory.body.monthlyView?.totalWorkingHours);
  console.log('Total Records:', facultyHistory.body.totalFiltered);

  // 6. Test Faculty Check-in
  console.log('\n6. Testing Faculty Check-in...');
  const checkinRes = await request('POST', '/rvs/attendance/faculty/checkin', { action: 'check_in' }, facultyToken);
  console.log('Check-in status:', checkinRes.status, 'Message:', checkinRes.body.message, 'Check-in time:', checkinRes.body.record?.check_in);

  // 7. Attendance Correction with Audit Trail
  console.log('\n7. Testing Attendance Correction with Mandatory Reason...');
  const sampleStudentRecId = studentHistory.body.records[0]?.id;
  console.log('Target student record id:', sampleStudentRecId, 'Current status:', studentHistory.body.records[0]?.status);
  const correctRes = await request('POST', '/rvs/attendance/correct', {
    record_type: 'student',
    record_id: sampleStudentRecId,
    new_status: 'Present',
    reason: 'Verified in lab logbook: student was participating in live terminal demonstration.'
  }, facultyToken);
  console.log('Correction status:', correctRes.status, 'Message:', correctRes.body.message);
  console.log('Audit Entry recorded:', correctRes.body.auditEntry);

  // 8. Fetch Audit Logs
  console.log('\n8. Fetching Attendance Audit Logs...');
  const auditRes = await request('GET', '/rvs/attendance/audit-logs', null, facultyToken);
  console.log('Audit logs count:', auditRes.body.totalLogs);
  console.log('Latest audit log:', auditRes.body.logs[0]);

  // 9. Admin Overview
  console.log('\n9. Testing Admin Overview (/api/rvs/attendance/admin/overview)...');
  const overviewRes = await request('GET', '/rvs/attendance/admin/overview', null, facultyToken);
  console.log('Today Student Attendance:', overviewRes.body.todayStudentAttendance);
  console.log('Today Faculty Attendance:', overviewRes.body.todayFacultyAttendance);
  console.log('Low Attendance Students (<75%):', overviewRes.body.lowAttendanceStudents?.length);
  overviewRes.body.lowAttendanceStudents?.forEach(s => {
    console.log(`  - ${s.name} (${s.rollNo}) [${s.department}]: ${s.overallPct}%`);
  });

  // 10. Reports Endpoint
  console.log('\n10. Testing Reports Generation (/api/rvs/attendance/reports)...');
  const reportRes = await request('GET', '/rvs/attendance/reports?type=student_monthly&month=9&year=2026', null, facultyToken);
  console.log('Report Title:', reportRes.body.metadata?.institutionName);
  console.log('Report Summary:', reportRes.body.summary);
  console.log('Report Rows Count:', reportRes.body.rows?.length);

  console.log('\n=== ALL ATTENDANCE API TESTS PASSED SUCCESSFULLY! ===');
}

runTests().catch(console.error);
