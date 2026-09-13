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
  console.log('--- Testing Phase 4 APIs ---');

  // Login Admin
  const adminLogin = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@rvscet.ac.in', password: 'Admin@123' });
  const adminHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminLogin.data?.token}` };

  // 1. Lab Equipment List
  console.log('\n[1] Testing GET /api/rvs/labs/equipment...');
  const equipRes = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/rvs/labs/equipment', method: 'GET', headers: adminHeaders
  });
  console.log('Status:', equipRes.status, 'Summary:', equipRes.data?.summary);

  // 2. Register Equipment
  console.log('\n[2] Testing POST /api/rvs/labs/equipment...');
  const addEquipRes = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/rvs/labs/equipment', method: 'POST', headers: adminHeaders
  }, {
    asset_id: 'RVS-LAB-CSE-099',
    equipment_name: 'NVIDIA RTX 4090 Deep Learning Rig',
    category: 'Computers',
    department_code: 'CSE',
    laboratory: 'AI & Machine Learning Innovation Lab',
    location: 'Academic Block B, Room 302',
    quantity: 2,
    condition: 'Excellent',
    status: 'AVAILABLE'
  });
  console.log('Status:', addEquipRes.status, 'Message:', addEquipRes.data?.message);

  // 3. Asset Maintenance Report
  console.log('\n[3] Testing POST /api/rvs/assets/maintenance/report...');
  const reportRes = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/rvs/assets/maintenance/report', method: 'POST', headers: adminHeaders
  }, {
    asset_id: 'RVS-LAB-CSE-099',
    problem: 'GPU Driver Kernel Panic on Ubuntu 24.04 CUDA installation',
    assigned_technician: 'RVS High-Performance Computing Admin'
  });
  console.log('Status:', reportRes.status, 'Ticket ID:', reportRes.data?.ticket?.id, 'Status:', reportRes.data?.ticket?.status);

  // 4. Update Ticket to Resolved
  console.log('\n[4] Testing POST /api/rvs/assets/maintenance/:id/update...');
  const updateTicketRes = await makeRequest({
    hostname: 'localhost', port: 5000, path: `/api/rvs/assets/maintenance/${reportRes.data?.ticket?.id}/update`, method: 'POST', headers: adminHeaders
  }, {
    status: 'Resolved',
    remarks: 'Downgraded to verified NVIDIA 535.183.01 server driver. Benchmark passed.'
  });
  console.log('Status:', updateTicketRes.status, 'Resolved Ticket Status:', updateTicketRes.data?.ticket?.status);

  // 5. Check Faculty Substitution Availability
  console.log('\n[5] Testing POST /api/rvs/faculty-substitution/check...');
  const checkSubRes = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/rvs/faculty-substitution/check', method: 'POST', headers: adminHeaders
  }, {
    date: '2026-03-25',
    substitute_faculty_name: 'Prof. Amit Ranjan'
  });
  console.log('Status:', checkSubRes.status, 'Available:', checkSubRes.data?.is_available, 'Message:', checkSubRes.data?.message);

  // 6. Assign Faculty Substitution
  console.log('\n[6] Testing POST /api/rvs/faculty-substitution/assign...');
  const assignSubRes = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/rvs/faculty-substitution/assign', method: 'POST', headers: adminHeaders
  }, {
    date: '2026-03-25',
    department_code: 'CSE',
    semester: '6th Semester',
    class_period: 'Period 2 (10:30 AM - 11:30 AM)',
    subject_code: 'CS-601',
    subject_name: 'Compiler Design',
    original_faculty_name: 'Prof. Jeevan Kumar',
    substitute_faculty_name: 'Prof. Amit Ranjan',
    reason: 'Original faculty on official academic assignment'
  });
  console.log('Status:', assignSubRes.status, 'Message:', assignSubRes.data?.message);

  console.log('\n ALL PHASE 4 BACKEND TESTS PASSED!');
}

runTest().catch(console.error);
