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
  console.log('--- STARTING PHASE 6 AUTOMATED VERIFICATION ---');

  // 1. Authenticate as Admin
  const loginRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@rvscet.ac.in', password: 'Admin@123' });

  const adminToken = loginRes.data.token;
  console.log('✅ Admin Authenticated.');

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  };

  // 2. Hostel Module
  console.log('\n[1] Testing GET /api/rvs/hostel/status...');
  const hostelStatus = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/rvs/hostel/status',
    method: 'GET',
    headers: authHeaders
  });
  console.log('Hostel Status:', hostelStatus.data);
  if (!hostelStatus.data?.success) throw new Error('Hostel status failed');

  // 3. Transport Module
  console.log('\n[2] Testing GET /api/rvs/transport/routes...');
  const transportRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/rvs/transport/routes',
    method: 'GET',
    headers: authHeaders
  });
  console.log(`Transport Routes Count: ${transportRes.data?.routes?.length}`);
  if (!transportRes.data?.success) throw new Error('Transport routes failed');

  // 4. Alumni Transition
  console.log('\n[3] Testing POST /api/rvs/alumni/transition (Student 7 -> Alumni)...');
  const alumniTransRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/rvs/alumni/transition',
    method: 'POST',
    headers: authHeaders
  }, {
    student_id: 7,
    graduation_year: 2026,
    current_organization: 'Tata Steel Jamshedpur',
    job_title: 'Junior Automation Engineer',
    achievements: 'President of RVSCET Robotics Club'
  });
  console.log('Alumni Transition Result:', alumniTransRes.data?.message);
  if (!alumniTransRes.data?.success) throw new Error('Alumni transition failed');

  // 5. Global Smart Search
  console.log('\n[4] Testing GET /api/rvs/search?q=Vikram...');
  const searchRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/rvs/search?q=Vikram',
    method: 'GET',
    headers: authHeaders
  });
  console.log('Search Results Groups:', Object.keys(searchRes.data?.results || {}));
  console.log('Faculty matches:', searchRes.data?.results?.faculty?.map(f => f.name));
  if (!searchRes.data?.success) throw new Error('Global search failed');

  // 6. Helpdesk Ticketing
  console.log('\n[5] Testing POST /api/rvs/helpdesk/tickets...');
  const ticketRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/rvs/helpdesk/tickets',
    method: 'POST',
    headers: authHeaders
  }, {
    category: 'IT / Wi-Fi',
    subject: 'Campus High-Speed Optical Fiber Latency Check',
    description: 'Ping spike observed on Computer Lab 3 gateway router.'
  });
  console.log('Ticket Created:', ticketRes.data?.ticket?.ticket_number);
  if (!ticketRes.data?.success) throw new Error('Helpdesk ticket failed');
  const ticketId = ticketRes.data.ticket.id;

  // 7. Update Ticket Status
  console.log(`\n[6] Testing POST /api/rvs/helpdesk/tickets/${ticketId}/update...`);
  const updateTicketRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/rvs/helpdesk/tickets/${ticketId}/update`,
    method: 'POST',
    headers: authHeaders
  }, {
    status: 'RESOLVED',
    assigned_staff: 'Campus IT Infrastructure Team',
    resolution: 'Core switch firmware patched and MTU configured.'
  });
  console.log('Ticket Update:', updateTicketRes.data?.message);
  if (!updateTicketRes.data?.success) throw new Error('Helpdesk update failed');

  // 8. Feedback Surveys & Reports
  console.log('\n[7] Testing GET /api/rvs/feedback/reports/1...');
  const feedbackReportRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/rvs/feedback/reports/1',
    method: 'GET',
    headers: authHeaders
  });
  console.log('Feedback Report Overall Score:', feedbackReportRes.data?.report?.overall_average_score);
  console.log('Submissions Count:', feedbackReportRes.data?.report?.total_submissions);
  if (!feedbackReportRes.data?.success) throw new Error('Feedback report failed');

  // 9. Student Promotion Evaluation
  console.log('\n[8] Testing POST /api/rvs/promotion/evaluate...');
  const evalRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/rvs/promotion/evaluate',
    method: 'POST',
    headers: authHeaders
  }, {
    department: 'CSE',
    current_semester: '6th Semester'
  });
  console.log(`Evaluated: ${evalRes.data?.total_evaluated} students. Eligible: ${evalRes.data?.eligible_count}`);
  if (!evalRes.data?.success) throw new Error('Promotion evaluation failed');

  console.log('\n🎉 ALL PHASE 6 BACKEND TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('❌ Phase 6 Test Failure:', err);
  process.exit(1);
});
