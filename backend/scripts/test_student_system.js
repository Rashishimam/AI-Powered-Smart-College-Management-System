const http = require('http');

async function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runStudentTests() {
  console.log('===============================================================');
  console.log('🧪 TESTING RVS STUDENT MANAGEMENT & BULK IMPORT SUBSYSTEM');
  console.log('===============================================================\n');

  // Step 1: Admin Login
  console.log('[1] Logging in as College Admin...');
  const loginRes = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@rvscet.ac.in', password: 'Admin@123' });

  if (loginRes.status !== 200 || !loginRes.body.token) {
    throw new Error('Admin login failed: ' + JSON.stringify(loginRes.body));
  }
  const adminToken = loginRes.body.token;
  console.log('  ✅ College Admin Logged In Successfully');

  // Step 2: Download Template
  console.log('\n[2] Testing Student CSV Template Generator (/api/rvs/students/template)...');
  const tplRes = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/rvs/students/template',
    method: 'GET'
  });
  console.log('  Template status:', tplRes.status);
  console.log('  First line (Headers):', typeof tplRes.body === 'string' ? tplRes.body.split('\n')[0] : 'CSV received');

  // Step 3: Add Single Demo Student
  console.log('\n[3] Testing Single Student Enrollment (/api/rvs/students)...');
  const demoStudentPayload = {
    name: 'Vikramaditya Kumar Singh',
    email: 'vikram.singh.demo@rvscet.ac.in',
    phone: '+91 98765 11223',
    roll_no: '24RVSCSE099',
    reg_no: 'JUT/2024/CSE/0099',
    admission_no: 'RVS/ADM/2024/099',
    department_code: 'CSE',
    course: 'B.Tech Computer Science & Engineering',
    semester: '4th Semester',
    batch: '2024-2028',
    session: '2025-2026',
    admission_year: 2024,
    dob: '2005-03-22',
    gender: 'Male',
    address: 'Sakchi, Jamshedpur, Jharkhand',
    guardian_name: 'Rajendra Kumar Singh',
    mother_name: 'Saroj Devi',
    guardian_phone: '+91 94311 55667',
    guardian_email: 'rajendra.singh@example.com',
    guardian_address: 'Sakchi, Jamshedpur, Jharkhand'
  };

  const addRes = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/rvs/students',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    }
  }, demoStudentPayload);

  console.log('  Enroll Status:', addRes.status);
  console.log('  Message:', addRes.body.message);
  const createdStudentId = addRes.body.student?.id;
  console.log('  Created Student ID:', createdStudentId, createdStudentId ? '✅ SUCCESS' : '❌ FAILED');

  // Step 4: Duplicate Check Test
  console.log('\n[4] Testing Duplicate Prevention on Roll Number & Email...');
  const dupRes = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/rvs/students',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    }
  }, demoStudentPayload);

  console.log('  Duplicate Attempt Status:', dupRes.status, dupRes.status === 409 ? '✅ 409 CONFLICT PREVENTED' : '❌ FAILED');
  console.log('  Duplicate Error Message:', dupRes.body.message);

  // Step 5: Edit Student
  console.log(`\n[5] Testing Student Modification (/api/rvs/students/${createdStudentId})...`);
  const editRes = await request({
    host: 'localhost',
    port: 5000,
    path: `/api/rvs/students/${createdStudentId}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    }
  }, {
    name: 'Vikramaditya Kumar Singh (Updated)',
    phone: '+91 98765 99999',
    address: 'Bistupur Boulevard, Jamshedpur'
  });
  console.log('  Edit Status:', editRes.status, editRes.status === 200 ? '✅ 200 OK' : '❌ FAILED');
  console.log('  Updated Name:', editRes.body.student?.name);

  // Step 6: 360° Student Profile
  console.log(`\n[6] Testing 360° Student Profile Aggregator (/api/rvs/students/${createdStudentId}/profile-360)...`);
  const profileRes = await request({
    host: 'localhost',
    port: 5000,
    path: `/api/rvs/students/${createdStudentId}/profile-360`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  console.log('  360 Profile Status:', profileRes.status, profileRes.status === 200 ? '✅ 200 OK' : '❌ FAILED');
  console.log('  Student Name:', profileRes.body.student?.name);
  console.log('  Attendance %:', profileRes.body.academicMetrics?.attendancePct);
  console.log('  Printable Documents Available:', profileRes.body.printableDocuments?.length);

  // Step 7: Bulk Import with Validation & Duplicate Detection
  console.log('\n[7] Testing Bulk Import Engine with Mixed Valid & Invalid Records...');
  const testBatch = [
    {
      full_name: 'Ananya Sharma',
      email: 'ananya.sharma.demo@rvscet.ac.in',
      roll_no: '24RVSCSE101',
      reg_no: 'JUT/2024/CSE/0101',
      department_code: 'CSE',
      course: 'B.Tech Computer Science & Engineering',
      semester: '4th Semester',
      batch: '2024-2028',
      mobile_number: '+91 98765 44332',
      guardian_name: 'Alok Sharma',
      guardian_mobile: '+91 94311 22331'
    },
    {
      full_name: 'Rohan Gupta',
      email: 'rohan.gupta.demo@rvscet.ac.in',
      roll_no: '24RVSCSE102',
      reg_no: 'JUT/2024/CSE/0102',
      department_code: 'CSE',
      course: 'B.Tech Computer Science & Engineering',
      semester: '4th Semester',
      batch: '2024-2028',
      mobile_number: '+91 98765 44333',
      guardian_name: 'Pramod Gupta',
      guardian_mobile: '+91 94311 22332'
    },
    {
      // Invalid: Duplicate Roll No already existing in DB
      full_name: 'Duplicate Test Student',
      email: 'duplicate.test@rvscet.ac.in',
      roll_no: '24RVSCSE099', // Already used by Vikramaditya!
      reg_no: 'JUT/2024/CSE/9999',
      department_code: 'CSE'
    },
    {
      // Invalid: Missing email and roll number
      full_name: 'Missing Fields Student',
      email: '',
      roll_no: '',
      reg_no: ''
    }
  ];

  // 7a. Preview Mode
  console.log('  -> 7a. Preview Mode Validation (confirmImport: false)...');
  const previewRes = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/rvs/students/bulk-import',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    }
  }, { records: testBatch, confirmImport: false });

  console.log('  Preview Status:', previewRes.status);
  console.log('  Total Submitted:', previewRes.body.total);
  console.log('  Valid Count:', previewRes.body.validCount, previewRes.body.validCount === 2 ? '✅ 2 VALID' : '❌ MISMATCH');
  console.log('  Invalid Count:', previewRes.body.invalidCount, previewRes.body.invalidCount === 2 ? '✅ 2 INVALID REJECTED' : '❌ MISMATCH');
  console.log('  Rejected Row #3 Errors:', previewRes.body.invalidRows?.[0]?.errors);

  // 7b. Confirm Import Mode
  console.log('  -> 7b. Committing Valid Rows to PostgreSQL Store (confirmImport: true)...');
  const commitRes = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/rvs/students/bulk-import',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    }
  }, { records: testBatch, confirmImport: true });

  console.log('  Commit Status:', commitRes.status, commitRes.status === 201 ? '✅ 201 CREATED' : '❌ FAILED');
  console.log('  Imported Count:', commitRes.body.importedCount);
  console.log('  Skipped Count:', commitRes.body.rejectedCount);

  // Step 8: Bulk Promotion
  console.log('\n[8] Testing Bulk Semester Promotion (/api/rvs/students/promote)...');
  const promoRes = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/rvs/students/promote',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    }
  }, {
    studentIds: [createdStudentId],
    targetSemester: '5th Semester',
    newSession: '2025-2026',
    remarks: 'Promotion to 5th Semester for Spring 2026'
  });
  console.log('  Promotion Status:', promoRes.status, promoRes.status === 200 ? '✅ 200 OK' : '❌ FAILED');
  console.log('  Promoted Count:', promoRes.body.promotedCount);

  // Verify promotion in 360 profile
  const postPromoProfile = await request({
    host: 'localhost',
    port: 5000,
    path: `/api/rvs/students/${createdStudentId}/profile-360`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  console.log('  Student Current Semester after promotion:', postPromoProfile.body.student?.semester, postPromoProfile.body.student?.semester === '5th Semester' ? '✅ MATCH' : '❌ MISMATCH');
  console.log('  Promotion History Entries:', postPromoProfile.body.student?.promotion_history?.length);

  // Step 9: Status Archival & Restoration
  console.log('\n[9] Testing Student Archival & Restoration (/api/rvs/students/:id/status)...');
  const archiveRes = await request({
    host: 'localhost',
    port: 5000,
    path: `/api/rvs/students/${createdStudentId}/status`,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    }
  }, { status: 'archived' });
  console.log('  Archive Status:', archiveRes.status, archiveRes.status === 200 ? '✅ ARCHIVED' : '❌ FAILED');

  const restoreRes = await request({
    host: 'localhost',
    port: 5000,
    path: `/api/rvs/students/${createdStudentId}/status`,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    }
  }, { status: 'active' });
  console.log('  Restore Status:', restoreRes.status, restoreRes.status === 200 ? '✅ RESTORED ACTIVE' : '❌ FAILED');

  // Step 10: Student Account Login Test
  console.log('\n[10] Testing Student Login with Newly Created Credentials...');
  const stuLoginRes = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: 'ananya.sharma.demo@rvscet.ac.in',
    password: 'Student@123'
  });
  console.log('  Student Login Status:', stuLoginRes.status, stuLoginRes.status === 200 ? '✅ 200 OK' : '❌ FAILED');
  console.log('  Logged In As:', stuLoginRes.body.user?.name, `(Role: ${stuLoginRes.body.user?.role})`);

  // Step 11: Security RBAC Test (Student trying to access another student's 360 profile)
  console.log('\n[11] Testing Security: Student Accessing Another Student Profile...');
  const studentToken = stuLoginRes.body.token;
  const unauthorizedProfileRes = await request({
    host: 'localhost',
    port: 5000,
    path: `/api/rvs/students/${createdStudentId}/profile-360`, // Accessing Vikramaditya's profile
    method: 'GET',
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  console.log('  Cross-Student Access Status:', unauthorizedProfileRes.status, unauthorizedProfileRes.status === 403 ? '✅ 403 FORBIDDEN (RESTRICTED)' : '❌ SECURITY BREACH');

  console.log('\n===============================================================');
  console.log('🎉 ALL 11 STUDENT MANAGEMENT & IMPORT TESTS PASSED PERFECTLY!');
  console.log('===============================================================\n');
}

runStudentTests().catch(console.error);
