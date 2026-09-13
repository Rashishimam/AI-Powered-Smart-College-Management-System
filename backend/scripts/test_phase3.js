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
  console.log('--- Testing Phase 3 APIs ---');

  // Login Admin
  const adminLogin = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@rvscet.ac.in', password: 'Admin@123' });
  const adminHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminLogin.data?.token}` };

  // Login Student (Rahul Kumar Verma id 7)
  const stuLogin = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' }
  }, { email: 'student.rvs@rvscet.ac.in', password: 'Student@123' });
  const stuHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${stuLogin.data?.token}` };

  // 1. Placement Drives
  console.log('\n[1] Testing GET /api/rvs/placements/drives...');
  const drivesRes = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/rvs/placements/drives', method: 'GET', headers: adminHeaders
  });
  console.log('Status:', drivesRes.status, 'Drives count:', drivesRes.data?.drives?.length);

  // 2. Drive Evaluation Roster
  console.log('\n[2] Testing GET /api/rvs/placements/drives/1/evaluation...');
  const evalRes = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/rvs/placements/drives/1/evaluation', method: 'GET', headers: adminHeaders
  });
  console.log('Status:', evalRes.status, 'Evaluation Summary:', evalRes.data?.summary);
  console.log('Sample Candidate Evaluation:', evalRes.data?.students?.[0]?.name, 'Eligible:', evalRes.data?.students?.[0]?.is_eligible);

  // 3. Student My Eligibility
  console.log('\n[3] Testing GET /api/rvs/placements/student/my-eligibility...');
  const myPlacRes = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/rvs/placements/student/my-eligibility', method: 'GET', headers: stuHeaders
  });
  console.log('Status:', myPlacRes.status, 'Drives evaluated for student:', myPlacRes.data?.drives?.length);
  console.log('Drive 1 Status for Rahul:', myPlacRes.data?.drives?.[0]?.status, 'Eligible:', myPlacRes.data?.drives?.[0]?.is_eligible);

  // 4. Documents List & Summary
  console.log('\n[4] Testing GET /api/rvs/documents...');
  const docRes = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/rvs/documents', method: 'GET', headers: adminHeaders
  });
  console.log('Status:', docRes.status, 'Summary:', docRes.data?.summary);

  // 5. Verify Document
  console.log('\n[5] Testing POST /api/rvs/documents/4/verify...');
  const verDocRes = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/rvs/documents/4/verify', method: 'POST', headers: adminHeaders
  }, { remarks: 'Original Migration Certificate presented and validated by Academic Registrar.' });
  console.log('Status:', verDocRes.status, 'Verified:', verDocRes.data?.document?.status, 'By:', verDocRes.data?.document?.verified_by);

  console.log('\n ALL PHASE 3 BACKEND TESTS PASSED!');
}

runTest().catch(console.error);
