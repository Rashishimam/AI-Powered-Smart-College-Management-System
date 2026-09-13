const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting CampusIQ Full-Stack Platform...\n');

// Start backend
const backend = spawn('node', ['src/server.js'], {
  cwd: path.join(__dirname, 'backend'),
  shell: true,
  env: process.env
});

backend.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[36m[Backend]\x1b[0m ${data}`);
});

backend.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[31m[Backend Error]\x1b[0m ${data}`);
});

// Start frontend
const frontend = spawn('npm.cmd', ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  shell: true,
  env: process.env
});

frontend.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[35m[Frontend]\x1b[0m ${data}`);
});

frontend.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[33m[Frontend Info]\x1b[0m ${data}`);
});

process.on('SIGINT', () => {
  console.log('\nStopping servers...');
  backend.kill();
  frontend.kill();
  process.exit();
});
