const http = require('http');

const accounts = [
  { role: 'student', email: 'student.rvs@rvscet.ac.in', password: 'Student@123' },
  { role: 'faculty', email: 'faculty.cse@rvscet.ac.in', password: 'Faculty@123' },
  { role: 'hod', email: 'hod.cse@rvscet.ac.in', password: 'Hod@123' },
  { role: 'admin', email: 'admin@rvscet.ac.in', password: 'Admin@123' },
  { role: 'director', email: 'director@rvscet.ac.in', password: 'Director@123' }
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

async function runTests() {
  console.log('🧪 Testing End-to-End Role Navigation & Authentication...\n');

  for (const acc of accounts) {
    try {
      const loginRes = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { email: acc.email, password: acc.password });

      if (loginRes.data?.success && loginRes.data?.token) {
        console.log(`✅ [${acc.role.toUpperCase()}] Login Successful: ${acc.email}`);
        
        const profileRes = await makeRequest({
          hostname: 'localhost',
          port: 5000,
          path: '/api/auth/me',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loginRes.data.token}`
          }
        });

        if (profileRes.data?.success) {
          console.log(`   └─ Authenticated profile retrieved: ${profileRes.data.user.name} (${profileRes.data.user.role})\n`);
        }
      } else {
        console.error(`❌ [${acc.role.toUpperCase()}] Login failed:`, loginRes.data?.message || loginRes.data);
      }
    } catch (err) {
      console.error(`❌ [${acc.role.toUpperCase()}] Error:`, err.message);
    }
  }
}

runTests();
