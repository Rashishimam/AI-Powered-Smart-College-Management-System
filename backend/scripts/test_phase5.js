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
  console.log('--- STARTING PHASE 5 AUTOMATED VERIFICATION ---');

  // 1. Authenticate as Admin
  const loginRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@rvscet.ac.in', password: 'Admin@123' });

  const adminToken = loginRes.data.token;
  console.log('✅ Admin Authenticated. Token acquired.');

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  };

  // 2. Gate Stats
  console.log('\n[1] Testing GET /api/rvs/gate/stats...');
  const statsRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/rvs/gate/stats',
    method: 'GET',
    headers: authHeaders
  });
  console.log('Gate Stats:', statsRes.data);
  if (!statsRes.data?.success) throw new Error('Failed to get gate stats');

  // 3. Gate Scan (Student Entry)
  console.log('\n[2] Testing POST /api/rvs/gate/scan (Entry)...');
  const scanEntryRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/rvs/gate/scan',
    method: 'POST',
    headers: authHeaders
  }, {
    identifier: '7',
    gate: 'Main Gate 1',
    action: 'entry',
    method: 'Smart Card RFID'
  });
  console.log('Scan Entry Result:', scanEntryRes.data);
  if (!scanEntryRes.data?.success) throw new Error('Gate entry scan failed');

  // 4. Gate Scan (Exit)
  console.log('\n[3] Testing POST /api/rvs/gate/scan (Exit)...');
  const scanExitRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/rvs/gate/scan',
    method: 'POST',
    headers: authHeaders
  }, {
    identifier: '7',
    gate: 'Main Gate 1',
    action: 'exit',
    method: 'Smart Card RFID'
  });
  console.log('Scan Exit Result:', scanExitRes.data);
  if (!scanExitRes.data?.success) throw new Error('Gate exit scan failed');

  // 5. Visitor Pass Generation
  console.log('\n[4] Testing POST /api/rvs/visitors/check-in...');
  const visitorCheckinRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/rvs/visitors/check-in',
    method: 'POST',
    headers: authHeaders
  }, {
    visitor_name: 'Dr. Debasis Sengupta',
    phone: '+91 94311 77889',
    company_or_org: 'National Board of Accreditation (NBA)',
    purpose: 'Campus Infrastructure & Research Lab Inspection',
    person_to_meet: 'Principal RVSCET',
    department_to_meet: 'Principal Office',
    id_proof_type: 'Govt Official ID'
  });
  console.log('Visitor Check-in:', visitorCheckinRes.data);
  if (!visitorCheckinRes.data?.success) throw new Error('Visitor check-in failed');
  const visitorId = visitorCheckinRes.data.visitor.id;

  // 6. Visitor Checkout
  console.log(`\n[5] Testing POST /api/rvs/visitors/${visitorId}/check-out...`);
  const visitorCheckoutRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/rvs/visitors/${visitorId}/check-out`,
    method: 'POST',
    headers: authHeaders
  });
  console.log('Visitor Checkout:', visitorCheckoutRes.data);
  if (!visitorCheckoutRes.data?.success) throw new Error('Visitor checkout failed');

  // 7. Facilities List
  console.log('\n[6] Testing GET /api/rvs/facilities...');
  const facRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/rvs/facilities',
    method: 'GET',
    headers: authHeaders
  });
  console.log(`Retrieved ${facRes.data?.facilities?.length} facilities.`);
  if (!facRes.data?.success) throw new Error('Failed to retrieve facilities');

  // 8. Clash Detection
  console.log('\n[7] Testing POST /api/rvs/facilities/check-clash...');
  const clashRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/rvs/facilities/check-clash',
    method: 'POST',
    headers: authHeaders
  }, {
    facility_id: 1,
    date: '2026-09-18' // Already approved in seed
  });
  console.log('Clash Check (Expected Clash):', clashRes.data);
  if (!clashRes.data?.has_clash) throw new Error('Clash check failed to identify existing booking!');

  // 9. Book Free Facility
  console.log('\n[8] Testing POST /api/rvs/facilities/book (Booking Free Facility)...');
  const bookRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/rvs/facilities/book',
    method: 'POST',
    headers: authHeaders
  }, {
    facility_id: 2, // Seminar Hall
    date: '2026-10-05',
    start_time: '11:00 AM',
    end_time: '02:00 PM',
    purpose: 'RVS Alumni Mentorship Colloquium',
    department: 'CSE',
    expected_attendees: 100
  });
  console.log('Facility Booking Result:', bookRes.data);
  if (!bookRes.data?.success) throw new Error('Facility booking failed');
  const bookingId = bookRes.data.booking.id;

  // 10. Update Booking Status
  console.log(`\n[9] Testing POST /api/rvs/facilities/bookings/${bookingId}/status...`);
  const statusRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/rvs/facilities/bookings/${bookingId}/status`,
    method: 'POST',
    headers: authHeaders
  }, {
    status: 'APPROVED',
    remarks: 'Approved by Dean Academics. Facilities team notified.'
  });
  console.log('Booking Status Update Result:', statusRes.data);
  if (!statusRes.data?.success) throw new Error('Booking status update failed');

  console.log('\n🎉 ALL PHASE 5 BACKEND TESTS PASSED SUCESSFULLY!');
}

runTests().catch(err => {
  console.error('❌ Phase 5 Test Failure:', err);
  process.exit(1);
});
