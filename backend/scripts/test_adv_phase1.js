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
  console.log('--- STARTING ADVANCED UPGRADE PHASE 1 TESTS ---');

  // 1. Admin login
  const loginRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@rvscet.ac.in', password: 'Admin@123' });

  const adminToken = loginRes.data.token;
  const adminHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` };
  console.log('✅ Admin authenticated');

  // 2. Academic Sessions
  console.log('\n[1] Testing GET /api/rvs/sessions...');
  const sessRes = await request({ hostname: 'localhost', port: 5000, path: '/api/rvs/sessions', method: 'GET', headers: adminHeaders });
  console.log(`Current session: ${sessRes.data?.current_session}, Total sessions: ${sessRes.data?.sessions?.length}`);
  if (!sessRes.data?.success) throw new Error('Sessions test failed');

  // 3. Mentor-Mentee assignments
  console.log('\n[2] Testing GET /api/rvs/mentor-mentee/assignments...');
  const mentorRes = await request({ hostname: 'localhost', port: 5000, path: '/api/rvs/mentor-mentee/assignments', method: 'GET', headers: adminHeaders });
  console.log(`Total mentor assignments: ${mentorRes.data?.total_assignments}`);
  if (!mentorRes.data?.success) throw new Error('Mentor assignments test failed');

  // 4. Record a mentor meeting
  console.log('\n[3] Testing POST /api/rvs/mentor-mentee/meetings...');
  const meetingRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/rvs/mentor-mentee/meetings',
    method: 'POST',
    headers: adminHeaders
  }, {
    assignment_id: 1,
    meeting_type: 'One-on-One Academic Mentoring',
    topic: 'Continuous Internal Assessment Improvement Session',
    notes: 'Reviewed student quiz and lab assignment marks. Recommended practice sets for mid-sem exams.',
    is_private: true
  });
  console.log('Meeting recorded:', meetingRes.data?.message);
  if (!meetingRes.data?.success) throw new Error('Meeting recording failed');

  // 5. Syllabus Tracker
  console.log('\n[4] Testing GET /api/rvs/syllabus...');
  const sylRes = await request({ hostname: 'localhost', port: 5000, path: '/api/rvs/syllabus', method: 'GET', headers: adminHeaders });
  console.log(`Tracked subjects count: ${sylRes.data?.total}`);
  if (!sylRes.data?.success) throw new Error('Syllabus tracker test failed');

  // 6. Syllabus Analytics
  console.log('\n[5] Testing GET /api/rvs/syllabus/analytics...');
  const sylAnalytics = await request({ hostname: 'localhost', port: 5000, path: '/api/rvs/syllabus/analytics', method: 'GET', headers: adminHeaders });
  console.log(`Overall syllabus completion: ${sylAnalytics.data?.overall_completion_pct}%`);
  if (!sylAnalytics.data?.success) throw new Error('Syllabus analytics test failed');

  // 7. Faculty Workload Analytics
  console.log('\n[6] Testing GET /api/rvs/workload/analytics...');
  const wlRes = await request({ hostname: 'localhost', port: 5000, path: '/api/rvs/workload/analytics', method: 'GET', headers: adminHeaders });
  console.log(`Total faculty evaluated: ${wlRes.data?.total_faculty}, Overloaded: ${wlRes.data?.overloaded_count}`);
  if (!wlRes.data?.success) throw new Error('Workload analytics test failed');

  console.log('\n🎉 ALL ADVANCED PHASE 1 BACKEND TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('❌ Advanced Phase 1 Test Failure:', err);
  process.exit(1);
});
