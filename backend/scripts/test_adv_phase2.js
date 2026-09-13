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
  console.log('--- STARTING ADVANCED UPGRADE PHASE 2 AUTOMATED TESTS ---');

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

  // 3. Test Project Duplicate Title Checker
  console.log('\n[1] Testing Title Similarity Check...');
  const titleCheck = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/rvs/adv/projects/check-title?title=Autonomous%20Campus%20Electric%20Shuttle',
    method: 'GET',
    headers: studentHeaders
  });
  console.log(`Duplicate detected: ${titleCheck.data?.is_duplicate}, Similar count: ${titleCheck.data?.similar?.length}`);
  if (!titleCheck.data?.is_duplicate) throw new Error('Duplicate check failed to detect existing project title');

  // 4. Test Student Proposing a New Project
  console.log('\n[2] Testing Student Project Proposal...');
  const newProjRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/rvs/adv/projects',
    method: 'POST',
    headers: studentHeaders
  }, {
    title: 'AI Smart Irrigation & Soil Quality Drone for Jharkhand Agriculture',
    category: 'Innovation / Rural Tech',
    department: 'CSE',
    abstract: 'Multispectral drone imagery and soil IoT sensors to automate water and nutrient delivery for farmers in East Singhbhum.',
    technologies: ['PyTorch', 'IoT', 'Raspberry Pi', 'FastAPI'],
    group_name: 'AgriTech RVS',
    members: [{ student_id: 2, name: 'Aarav Sharma', roll_no: '23RVSCSE002', role: 'Team Leader' }]
  });
  console.log(`Proposed project ID: ${newProjRes.data?.project?.id}, Status: ${newProjRes.data?.project?.status}`);
  if (!newProjRes.data?.success) throw new Error('Failed to propose project');
  const createdProjectId = newProjRes.data.project.id;

  // 5. Test Guide Assignment & Approval by Admin/Faculty
  console.log('\n[3] Testing Guide Assignment & Status Advancement...');
  const assignRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/rvs/adv/projects/${createdProjectId}/assign-guide`,
    method: 'POST',
    headers: adminHeaders
  }, {
    guide_id: 6,
    guide_name: 'Dr. Vikramaditya Sharma',
    co_guide_name: 'Prof. Ananya Sen',
    status: 'TOPIC APPROVED'
  });
  console.log(`Assigned Guide: ${assignRes.data?.project?.guide_name}, New Status: ${assignRes.data?.project?.status}`);
  if (assignRes.data?.project?.status !== 'TOPIC APPROVED') throw new Error('Guide assignment failed');

  // 6. Test Review Marks & Evaluation
  console.log('\n[4] Testing Project Review Evaluation with Configurable Criteria...');
  const reviewRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/rvs/adv/projects/${createdProjectId}/reviews`,
    method: 'POST',
    headers: adminHeaders
  }, {
    review_number: 'Review 1 (Synopsis & Feasibility)',
    scheduled_date: '2025-09-28',
    panel: ['Dr. Vikramaditya Sharma', 'Dr. Rajesh Kumar'],
    criteria: {
      problem_definition: 18,
      technical_progress: 19,
      implementation: 28,
      documentation: 13,
      presentation: 14
    },
    comments: 'Strong presentation and clear problem statement. Prototype phase approved.'
  });
  console.log(`Review recorded. Total marks: ${reviewRes.data?.review?.total_marks}/100, Project Status: ${reviewRes.data?.project?.status}`);
  if (reviewRes.data?.review?.total_marks !== 92) throw new Error('Review marks calculation mismatch');

  // 7. Test Student Internship Submission
  console.log('\n[5] Testing Student Internship Submission...');
  const internSub = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/rvs/adv/internships',
    method: 'POST',
    headers: studentHeaders
  }, {
    company: 'Jindal Steel & Power Ltd',
    role: 'SCADA Systems Trainee',
    internship_type: 'Industrial Training',
    mode: 'In-Office',
    start_date: '2025-06-01',
    end_date: '2025-07-15',
    stipend_amount: '₹ 15,000 / month',
    description: 'Worked on automated telemetry data acquisition from PLC modules.'
  });
  console.log(`Internship submitted. ID: ${internSub.data?.internship?.id}, Status: ${internSub.data?.internship?.status}`);
  if (!internSub.data?.success) throw new Error('Internship submission failed');
  const internId = internSub.data.internship.id;

  // 8. Test Internship Verification by Admin/Placement
  console.log('\n[6] Testing Internship Verification & Audit Trail...');
  const verifyRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/rvs/adv/internships/${internId}/verify`,
    method: 'POST',
    headers: adminHeaders
  }, {
    action: 'APPROVED',
    remarks: 'Offer letter and completion certificate validated against official corporate HR registry.'
  });
  console.log(`Internship verification action: ${verifyRes.data?.internship?.status}, History count: ${verifyRes.data?.internship?.verification_history?.length}`);
  if (verifyRes.data?.internship?.status !== 'APPROVED') throw new Error('Internship verification failed');

  // 9. Test Placement Training Session Creation & Registration
  console.log('\n[7] Testing Training Session Creation, Registration, & Attendance...');
  const newTrain = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/rvs/adv/trainings',
    method: 'POST',
    headers: adminHeaders
  }, {
    title: 'Cloud Native Microservices with Docker & Kubernetes',
    training_type: 'Technical',
    trainer_name: 'Er. Amit Verma (Principal Cloud Architect)',
    venue: 'CS Lab 3 & Google Meet',
    date: '2025-09-28',
    time: '09:30 AM - 12:30 PM',
    departments: ['CSE', 'ECE', 'EEE'],
    capacity: 80,
    description: 'Containerizing full stack apps, writing Kubernetes deployment manifests and Helm charts.'
  });
  console.log(`Created Training: "${newTrain.data?.training?.title}", ID: ${newTrain.data?.training?.id}`);
  const trainId = newTrain.data.training.id;

  // Student registers for this training
  const regRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/rvs/adv/trainings/${trainId}/register`,
    method: 'POST',
    headers: studentHeaders
  });
  console.log(`Student registration result: ${regRes.data?.message}`);
  if (!regRes.data?.success) throw new Error('Student training registration failed');

  // Faculty marks attendance for the student
  const attRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/rvs/adv/trainings/${trainId}/attendance`,
    method: 'POST',
    headers: adminHeaders
  }, {
    student_id: studentLogin.data.user.id,
    attended: true
  });
  console.log(`Attendance marked: ${attRes.data?.message}`);
  if (!attRes.data?.success) throw new Error('Failed to mark attendance');

  console.log('\n======================================================');
  console.log('🎉 ALL ADVANCED UPGRADE PHASE 2 TESTS PASSED (100%)');
  console.log('======================================================\n');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
