const http = require('http');

function request(options, postData) {
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
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING ADVANCED UPGRADE PHASE 3 AUTOMATED TESTS ---');

  // 1. Authenticate Admin
  const adminLogin = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@rvscet.ac.in', password: 'Admin@123' });

  const adminToken = adminLogin.data.token;
  const adminHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` };
  console.log('✅ Admin authenticated');

  // 2. Authenticate Student
  const studentLogin = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'student.rvs@rvscet.ac.in', password: 'Student@123' });

  const studentToken = studentLogin.data.token;
  const studentHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${studentToken}` };
  console.log('✅ Student authenticated');

  // 3. Test Scholarship Schemes
  console.log('\n[1] Testing Scholarship Schemes & Application...');
  const schemesRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/rvs/adv/scholarships/schemes',
    method: 'GET',
    headers: studentHeaders
  });
  console.log(`Available scholarship schemes: ${schemesRes.data?.schemes?.length}`);
  if (!schemesRes.data?.schemes?.length) throw new Error('No scholarship schemes found');

  // Student applies for scheme 3
  const applyRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/rvs/adv/scholarships/apply',
    method: 'POST',
    headers: studentHeaders
  }, {
    scheme_id: 3,
    documents_submitted: [{ name: 'Sports_Certificate.pdf', url: '/uploads/scholarships/sports.pdf' }]
  });
  console.log(`Scholarship applied. ID: ${applyRes.data?.application?.id}, Status: ${applyRes.data?.application?.status}`);
  const appId = applyRes.data?.application?.id;

  // Admin approves scholarship
  const appStatusRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/rvs/adv/scholarships/applications/${appId}/status`,
    method: 'POST',
    headers: adminHeaders
  }, {
    status: 'APPROVED',
    remarks: 'State badminton championship certificate verified.'
  });
  console.log(`Scholarship status updated: ${appStatusRes.data?.application?.status}`);
  if (appStatusRes.data?.application?.status !== 'APPROVED') throw new Error('Scholarship approval failed');

  // 4. Test No-Dues Clearance Request
  console.log('\n[2] Testing No-Dues Clearance Workflow...');
  // Student requests no dues
  const noDuesReq = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/rvs/adv/no-dues/request',
    method: 'POST',
    headers: studentHeaders
  }, {
    purpose: 'Degree Clearance & Final Exit'
  });
  console.log(`No dues requested. ID: ${noDuesReq.data?.request?.id}, Overall Status: ${noDuesReq.data?.request?.overall_status}`);
  const reqId = noDuesReq.data?.request?.id;

  // Department units clear one by one
  const units = ['Accounts / Finance', 'Central Library', 'Department / Lab', 'Hostel Administration', 'Transport Division', 'Training & Placement'];
  for (const unit of units) {
    const unitRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/rvs/adv/no-dues/${reqId}/unit-clearance`,
      method: 'POST',
      headers: adminHeaders
    }, {
      unit_name: unit,
      status: 'CLEARED',
      remarks: `${unit} audit verified and clear.`
    });
  }

  // Check final status
  const finalCheck = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/rvs/adv/no-dues',
    method: 'GET',
    headers: studentHeaders
  });
  const myCleared = finalCheck.data?.requests?.find(r => r.id === reqId);
  console.log(`Final No-Dues Status: ${myCleared?.overall_status}, Certificate No: ${myCleared?.certificate_no}`);
  if (myCleared?.overall_status !== 'CLEARED' || !myCleared?.certificate_no) {
    throw new Error('No-Dues final clearance calculation failed');
  }

  // 5. Test Semester Registration
  console.log('\n[3] Testing Semester Registration...');
  const winRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/rvs/adv/semester-registration/windows',
    method: 'GET',
    headers: studentHeaders
  });
  const activeWin = winRes.data?.windows?.[0];
  console.log(`Active registration window for: ${activeWin?.semester}, Status: ${activeWin?.status}`);

  const regRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/rvs/adv/semester-registration/register',
    method: 'POST',
    headers: studentHeaders
  }, {
    window_id: activeWin.id,
    selected_electives: [
      { group: 'Professional Elective 1', subject_code: 'CS704A', subject_name: 'Natural Language Processing' }
    ]
  });
  console.log(`Semester registration result: ${regRes.data?.message}, Status: ${regRes.data?.registration?.status}`);
  if (!regRes.data?.success) throw new Error('Semester registration failed');

  // 6. Test Elective Selection & Capacity
  console.log('\n[4] Testing Elective Selection & Capacity Protection...');
  const electivesRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/rvs/adv/electives/groups',
    method: 'GET',
    headers: studentHeaders
  });
  console.log(`Elective Groups found: ${electivesRes.data?.groups?.length}`);

  const pickElective = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/rvs/adv/electives/select',
    method: 'POST',
    headers: studentHeaders
  }, {
    group_id: 1,
    subject_code: 'CS704B'
  });
  console.log(`Elective Selection: ${pickElective.data?.message}`);
  if (!pickElective.data?.success) throw new Error('Elective selection failed');

  console.log('\n======================================================');
  console.log('🎉 ALL ADVANCED UPGRADE PHASE 3 TESTS PASSED (100%)');
  console.log('======================================================\n');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
