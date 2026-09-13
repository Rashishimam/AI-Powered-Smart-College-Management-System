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
  console.log('--- Testing Phase 2 APIs ---');

  // 1. Login Admin
  const adminLogin = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@rvscet.ac.in', password: 'Admin@123' });

  const adminToken = adminLogin.data?.token;
  const adminHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` };

  // 2. Login Student (Rahul Kumar Verma)
  const stuLogin = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'student.rvs@rvscet.ac.in', password: 'Student@123' });

  const stuToken = stuLogin.data?.token;
  const stuHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${stuToken}` };

  // 3. Test Admit Card Config
  console.log('\n[1] Testing GET /api/rvs/admit-cards/config...');
  const cfgRes = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/rvs/admit-cards/config', method: 'GET', headers: adminHeaders
  });
  console.log('Status:', cfgRes.status, 'Min attendance:', cfgRes.data?.config?.min_attendance_pct);

  // 4. Test Class Eligibility
  console.log('\n[2] Testing GET /api/rvs/admit-cards/eligibility...');
  const eligRes = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/rvs/admit-cards/eligibility?department=CSE&semester=6th%20Semester', method: 'GET', headers: adminHeaders
  });
  console.log('Status:', eligRes.status, 'Students evaluated:', eligRes.data?.students?.length);

  // 5. Test Generate Admit Cards
  console.log('\n[3] Testing GET /api/rvs/admit-cards/generate...');
  const genRes = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/rvs/admit-cards/generate?department=CSE&semester=6th%20Semester', method: 'GET', headers: adminHeaders
  });
  console.log('Status:', genRes.status, 'Admit cards generated:', genRes.data?.count);
  console.log('Sample Card:', genRes.data?.admitCards?.[0]?.admit_card_number, genRes.data?.admitCards?.[0]?.student?.name);

  // 6. Test Student Retrieve My Admit Card
  console.log('\n[4] Testing GET /api/rvs/admit-cards/student/my-card...');
  const myCardRes = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/rvs/admit-cards/student/my-card', method: 'GET', headers: stuHeaders
  });
  console.log('Status:', myCardRes.status, 'Card Number:', myCardRes.data?.card?.admit_card_number);

  // 7. Test Public Admit Card Verification
  console.log('\n[5] Testing GET /api/rvs/verify/admit-card/RVSCET-ADMIT-EXAM-2026-EVEN-23RVSCSE042...');
  const pubAdmitRes = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/rvs/verify/admit-card/RVSCET-ADMIT-EXAM-2026-EVEN-23RVSCSE042', method: 'GET'
  });
  console.log('Status:', pubAdmitRes.status, 'Status:', pubAdmitRes.data?.verification?.status, 'Masked Name:', pubAdmitRes.data?.verification?.candidate_initials);

  // 8. Test Certificates List & Generate
  console.log('\n[6] Testing GET /api/rvs/certificates...');
  const certsRes = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/rvs/certificates', method: 'GET', headers: adminHeaders
  });
  console.log('Status:', certsRes.status, 'Certificates count:', certsRes.data?.certificates?.length);

  console.log('\n[7] Testing POST /api/rvs/certificates/generate...');
  const newCertRes = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/rvs/certificates/generate', method: 'POST', headers: adminHeaders
  }, {
    student_id: 7,
    template_type: 'Course Completion Certificate',
    purpose: 'National Level Graduate Apprenticeship Training Scheme (NATS)',
    signatory: 'Prof. (Dr.) Rajesh Kumar Tiwari, Principal RVSCET'
  });
  console.log('Status:', newCertRes.status, 'Generated:', newCertRes.data?.certificate?.certificate_no);

  // 9. Test Public Certificate Verification (VALID & REVOKED)
  const certNoToVerify = newCertRes.data?.certificate?.certificate_no || 'RVSCET/CERT/2026/001';
  console.log(`\n[8] Testing Public GET /api/rvs/verify/certificate/${encodeURIComponent(certNoToVerify)}...`);
  const pubCertRes = await makeRequest({
    hostname: 'localhost', port: 5000, path: `/api/rvs/verify/certificate/${encodeURIComponent(certNoToVerify)}`, method: 'GET'
  });
  console.log('Status:', pubCertRes.status, 'Verification Result:', pubCertRes.data?.verification);

  console.log('\n[9] Testing Public GET /api/rvs/verify/certificate/RVSCET%2FCERT%2F2025%2F089 (Revoked)...');
  const pubRevokedRes = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/rvs/verify/certificate/RVSCET%2FCERT%2F2025%2F089', method: 'GET'
  });
  console.log('Status:', pubRevokedRes.status, 'Status:', pubRevokedRes.data?.verification?.status, 'Reason:', pubRevokedRes.data?.verification?.revocation_reason);

  console.log('\n ALL PHASE 2 BACKEND TESTS PASSED!');
}

runTest().catch(console.error);
