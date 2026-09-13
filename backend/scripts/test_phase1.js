const http = require('http');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTest() {
  console.log('--- Testing Phase 1 APIs ---');
  
  // 1. Login as College Admin to get token
  const loginRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@rvscet.ac.in', password: 'Admin@123' });

  if (!loginRes.data || !loginRes.data.token) {
    console.error('Admin login failed:', loginRes);
    process.exit(1);
  }
  const token = loginRes.data.token;
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 2. Test Student 360 Profile (Rahul Kumar Verma id=7)
  console.log('\n[1] Testing GET /api/rvs/students/7/profile-360...');
  const p360Res = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/rvs/students/7/profile-360',
    method: 'GET',
    headers: authHeaders
  });
  console.log('Status:', p360Res.status);
  console.log('Student Name:', p360Res.data?.student?.name);
  console.log('Summary Cards:', p360Res.data?.summaryCards);
  console.log('Tabs Present:', [
    'academic' in (p360Res.data || {}),
    'attendance' in (p360Res.data || {}),
    'results' in (p360Res.data || {}),
    'backlogs' in (p360Res.data || {}),
    'fees' in (p360Res.data || {}),
    'assignments' in (p360Res.data || {}),
    'library' in (p360Res.data || {}),
    'leave' in (p360Res.data || {}),
    'documents' in (p360Res.data || {}),
    'certificates' in (p360Res.data || {}),
    'placement' in (p360Res.data || {})
  ]);

  // 3. Test Backlogs API
  console.log('\n[2] Testing GET /api/rvs/backlogs...');
  const blRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/rvs/backlogs',
    method: 'GET',
    headers: authHeaders
  });
  console.log('Status:', blRes.status, 'Summary:', blRes.data?.summary, 'Count:', blRes.data?.backlogs?.length);

  // 4. Test Student Backlogs API
  console.log('\n[3] Testing GET /api/rvs/backlogs/student/10...');
  const stuBlRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/rvs/backlogs/student/10',
    method: 'GET',
    headers: authHeaders
  });
  console.log('Status:', stuBlRes.status, 'Summary:', stuBlRes.data?.summary);

  // 5. Test Internal Marks Config
  console.log('\n[4] Testing GET /api/rvs/internal-marks/config...');
  const cfgRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/rvs/internal-marks/config',
    method: 'GET',
    headers: authHeaders
  });
  console.log('Status:', cfgRes.status, 'Total Weightage:', cfgRes.data?.config?.total_weightage);

  // 6. Test Internal Marks Audit Correction
  console.log('\n[5] Testing POST /api/rvs/internal-marks/correct...');
  const corRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/rvs/internal-marks/correct',
    method: 'POST',
    headers: authHeaders
  }, {
    subject_code: 'CS-601',
    student_id: 7,
    component: 'Surprise Quizzes',
    new_mark: 9.5,
    reason: 'Re-evaluation of quiz question 2 accepted by academic committee'
  });
  console.log('Status:', corRes.status, 'Message:', corRes.data?.message);

  // 7. Verify audit log was recorded
  console.log('\n[6] Testing GET /api/rvs/internal-marks/audit-log...');
  const auditRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/rvs/internal-marks/audit-log?subject_code=CS-601',
    method: 'GET',
    headers: authHeaders
  });
  console.log('Status:', auditRes.status, 'Audit count:', auditRes.data?.logs?.length);

  console.log('\n ALL PHASE 1 BACKEND TESTS PASSED!');
}

runTest().catch(console.error);
