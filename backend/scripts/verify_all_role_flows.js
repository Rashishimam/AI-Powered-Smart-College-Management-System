const http = require('http');

const rolesToTest = [
  {
    role: 'STUDENT',
    email: 'student.rvs@rvscet.ac.in',
    password: 'Student@123',
    endpoints: [
      '/api/dashboard/stats',
      '/api/rvs/attendance/student/history',
      '/api/rvs/timetable',
      '/api/rvs/assignments',
      '/api/rvs/exams',
      '/api/rvs/results/student',
      '/api/rvs/fees',
      '/api/rvs/library/books',
      '/api/rvs/notices?category=all',
      '/api/rvs/placements'
    ]
  },
  {
    role: 'FACULTY',
    email: 'faculty.cse@rvscet.ac.in',
    password: 'Faculty@123',
    endpoints: [
      '/api/dashboard/stats',
      '/api/courses',
      '/api/rvs/attendance/faculty/history',
      '/api/rvs/assignments',
      '/api/rvs/internal-marks/config',
      '/api/rvs/timetable',
      '/api/rvs/notices?category=all'
    ]
  },
  {
    role: 'HOD',
    email: 'hod.cse@rvscet.ac.in',
    password: 'Hod@123',
    endpoints: [
      '/api/dashboard/stats',
      '/api/students',
      '/api/faculty',
      '/api/rvs/attendance/admin/overview',
      '/api/rvs/results/summary',
      '/api/rvs/timetable',
      '/api/rvs/notices?category=all'
    ]
  },
  {
    role: 'ADMIN',
    email: 'admin@rvscet.ac.in',
    password: 'Admin@123',
    endpoints: [
      '/api/dashboard/stats',
      '/api/students',
      '/api/faculty',
      '/api/departments',
      '/api/rvs/programs',
      '/api/rvs/fees',
      '/api/rvs/library/books',
      '/api/rvs/placements',
      '/api/rvs/notices?category=all',
      '/api/rvs/cms/content'
    ]
  },
  {
    role: 'DIRECTOR',
    email: 'director@rvscet.ac.in',
    password: 'Director@123',
    endpoints: [
      '/api/dashboard/stats',
      '/api/students',
      '/api/faculty',
      '/api/rvs/results/summary',
      '/api/rvs/placements',
      '/api/rvs/notices?category=all'
    ]
  }
];

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: body });
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

async function runRoleAudit() {
  console.log('====================================================');
  console.log('🚀 RUNNING COMPLETE END-TO-END ROLE AUDIT & INTEGRITY CHECK');
  console.log('====================================================\n');

  let totalEndpointsTested = 0;
  let totalSuccesses = 0;
  let totalFailures = 0;

  for (const item of rolesToTest) {
    console.log(`📌 Auditing Role: [${item.role}] (${item.email})`);
    
    // 1. Authenticate
    const loginRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: item.email, password: item.password });

    if (!loginRes.data?.success || !loginRes.data?.token) {
      console.error(`❌ Authentication failed for ${item.role}`);
      totalFailures++;
      continue;
    }

    const token = loginRes.data.token;
    console.log(`   ✅ Authentication Successful (User ID: ${loginRes.data.user.id}, Role: ${loginRes.data.user.role})`);

    // 2. Test permitted endpoints for this role
    for (const endpoint of item.endpoints) {
      totalEndpointsTested++;
      try {
        const res = await makeRequest({
          hostname: 'localhost',
          port: 5000,
          path: endpoint,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.statusCode >= 200 && res.statusCode < 300) {
          totalSuccesses++;
          console.log(`   🟢 HTTP ${res.statusCode} | ${endpoint}`);
        } else {
          totalFailures++;
          console.error(`   🔴 HTTP ${res.statusCode} | ${endpoint} — Error:`, res.data?.message || 'Failed');
        }
      } catch (err) {
        totalFailures++;
        console.error(`   🔴 HTTP ERROR | ${endpoint} — ${err.message}`);
      }
    }
    console.log('');
  }

  console.log('====================================================');
  console.log(`📊 FINAL SUMMARY: Tested ${totalEndpointsTested} Endpoints`);
  console.log(`   ✅ Successful (2xx): ${totalSuccesses}`);
  console.log(`   ❌ Failed (Non-2xx): ${totalFailures}`);
  console.log('====================================================');

  if (totalFailures > 0) {
    process.exit(1);
  }
}

runRoleAudit();
