/**
 * seedAdvPhase4.js
 * Seeds Phase 4 data into campusiq_store.json:
 * - exam_seating_plans (room-wise seating plans, shifts, roll number ranges)
 * - invigilation_duties (faculty exam duties, reporting times, conflict checks)
 * - question_bank (curriculum questions, types, marks, difficulty)
 * - revaluation_requests (scrutiny/rechecking requests with original vs revised marks audit)
 */

const fs = require('fs');
const path = require('path');

const storePath = path.resolve(__dirname, '../../data/campusiq_store.json');
const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));

// 1. Exam Seating Plans
store.exam_seating_plans = [
  {
    id: 1,
    exam_name: 'B.Tech End Semester Theory Examination - Dec 2025',
    date: '2025-12-05',
    shift: 'Morning (09:30 AM - 12:30 PM)',
    subject_code: 'CS701',
    subject_name: 'Artificial Intelligence & Machine Learning',
    room_number: 'Hall A-101 (Academic Block A)',
    total_capacity: 40,
    allocated_count: 36,
    rows: 6,
    cols: 6,
    departments: ['CSE', 'ECE'],
    allocated_students: [
      { seat: 'R1-C1', roll_no: '23RVSCSE001', name: 'Aakash Verma', dept: 'CSE', subject: 'CS701' },
      { seat: 'R1-C2', roll_no: '23RVSECE001', name: 'Amit Roy', dept: 'ECE', subject: 'EC701' },
      { seat: 'R1-C3', roll_no: '23RVSCSE002', name: 'Aarav Sharma', dept: 'CSE', subject: 'CS701' },
      { seat: 'R1-C4', roll_no: '23RVSECE002', name: 'Ankita Das', dept: 'ECE', subject: 'EC701' },
      { seat: 'R1-C5', roll_no: '23RVSCSE003', name: 'Priya Mukherjee', dept: 'CSE', subject: 'CS701' },
      { seat: 'R1-C6', roll_no: '23RVSECE003', name: 'Bikram Paul', dept: 'ECE', subject: 'EC701' },
      { seat: 'R2-C1', roll_no: '23RVSCSE004', name: 'Rohan Gupta', dept: 'CSE', subject: 'CS701' },
      { seat: 'R2-C2', roll_no: '23RVSECE004', name: 'Deepak Soren', dept: 'ECE', subject: 'EC701' },
      { seat: 'R2-C3', roll_no: '23RVSCSE005', name: 'Sneha Patel', dept: 'CSE', subject: 'CS701' }
    ]
  },
  {
    id: 2,
    exam_name: 'B.Tech End Semester Theory Examination - Dec 2025',
    date: '2025-12-07',
    shift: 'Morning (09:30 AM - 12:30 PM)',
    subject_code: 'CS702',
    subject_name: 'Information Security & Cryptography',
    room_number: 'Hall B-204 (IT Block)',
    total_capacity: 50,
    allocated_count: 42,
    rows: 7,
    cols: 6,
    departments: ['CSE', 'MECH'],
    allocated_students: [
      { seat: 'R1-C1', roll_no: '23RVSCSE002', name: 'Aarav Sharma', dept: 'CSE', subject: 'CS702' },
      { seat: 'R1-C2', roll_no: '23RVSMEC001', name: 'Karan Mahato', dept: 'MECH', subject: 'ME702' },
      { seat: 'R1-C3', roll_no: '23RVSCSE003', name: 'Priya Mukherjee', dept: 'CSE', subject: 'CS702' }
    ]
  }
];

// 2. Invigilation Duties
store.invigilation_duties = [
  {
    id: 1,
    faculty_id: 6,
    faculty_name: 'Dr. Vikramaditya Sharma',
    department: 'CSE',
    exam_name: 'B.Tech End Semester Theory Examination - Dec 2025',
    date: '2025-12-05',
    shift: 'Morning (09:30 AM - 12:30 PM)',
    room_number: 'Hall A-101 (Academic Block A)',
    reporting_time: '08:45 AM (45 mins prior to commencement)',
    role: 'Chief Invigilator',
    instructions: 'Collect sealed question paper packets from Exam Control Cell at 08:50 AM. Verify admit cards and prohibit electronic smart devices.',
    status: 'Confirmed'
  },
  {
    id: 2,
    faculty_id: 6,
    faculty_name: 'Dr. Vikramaditya Sharma',
    department: 'CSE',
    exam_name: 'B.Tech End Semester Theory Examination - Dec 2025',
    date: '2025-12-09',
    shift: 'Evening (01:30 PM - 04:30 PM)',
    room_number: 'Hall B-204 (IT Block)',
    reporting_time: '12:45 PM',
    role: 'Assistant Invigilator',
    instructions: 'Monitor attendance registry and supervise barcode answer script collection.',
    status: 'Confirmed'
  }
];

// 3. Question Bank Management
store.question_bank = [
  {
    id: 1,
    course: 'B.Tech',
    department: 'CSE',
    semester: '7th Semester',
    subject_code: 'CS701',
    subject_name: 'Artificial Intelligence & Machine Learning',
    unit: 'Unit 2: Heuristic Search & Game Playing',
    topic: 'A* Search & Admissibility',
    question: 'Formulate the mathematical condition for the admissibility of a heuristic function h(n) in A* search. Prove that A* with an admissible tree search is guaranteed to find an optimal solution.',
    marks: 10,
    difficulty: 'MEDIUM',
    question_type: 'LONG',
    author: 'Dr. Vikramaditya Sharma',
    created_at: '2025-08-12'
  },
  {
    id: 2,
    course: 'B.Tech',
    department: 'CSE',
    semester: '7th Semester',
    subject_code: 'CS701',
    subject_name: 'Artificial Intelligence & Machine Learning',
    unit: 'Unit 4: Supervised Learning',
    topic: 'Support Vector Machines',
    question: 'Explain the concept of maximum margin hyperplane in SVM. How does the kernel trick allow linear classification in high-dimensional feature spaces?',
    marks: 15,
    difficulty: 'HARD',
    question_type: 'LONG',
    author: 'Dr. Vikramaditya Sharma',
    created_at: '2025-08-15'
  },
  {
    id: 3,
    course: 'B.Tech',
    department: 'CSE',
    semester: '7th Semester',
    subject_code: 'CS701',
    subject_name: 'Artificial Intelligence & Machine Learning',
    unit: 'Unit 1: Introduction to Agents',
    topic: 'Rational Agents',
    question: 'Differentiate between an Omniscient Agent and a Rational Agent with a suitable example.',
    marks: 5,
    difficulty: 'EASY',
    question_type: 'SHORT',
    author: 'Prof. Ananya Sen',
    created_at: '2025-08-18'
  },
  {
    id: 4,
    course: 'B.Tech',
    department: 'CSE',
    semester: '7th Semester',
    subject_code: 'CS702',
    subject_name: 'Information Security & Cryptography',
    unit: 'Unit 3: Public Key Cryptography',
    topic: 'RSA Algorithm',
    question: 'In an RSA cryptosystem, given prime numbers p = 11 and q = 13 with public exponent e = 7, compute the private key d and encrypt the plaintext message M = 9.',
    marks: 10,
    difficulty: 'MEDIUM',
    question_type: 'NUMERICAL',
    author: 'Dr. Rajesh Kumar',
    created_at: '2025-08-20'
  }
];

// 4. Result Scrutiny & Revaluation Requests
store.revaluation_requests = [
  {
    id: 1,
    student_id: 2,
    student_name: 'Aarav Sharma',
    roll_no: '23RVSCSE002',
    department: 'CSE',
    exam_name: '6th Semester Regular Examination - May 2025',
    subject_code: 'CS601',
    subject_name: 'Compiler Design',
    request_type: 'Revaluation',
    fee_paid: '₹ 500',
    original_marks: 68,
    original_grade: 'B+',
    revised_marks: 76,
    revised_grade: 'A',
    status: 'COMPLETED',
    examiner_remarks: 'Recounting and re-assessment of Question 4 (LALR Parser Table) found 8 uncredited marks. Grade revised upward.',
    applied_at: '2025-06-15',
    resolved_at: '2025-07-02'
  },
  {
    id: 2,
    student_id: 4,
    student_name: 'Rohan Gupta',
    roll_no: '23RVSCSE004',
    department: 'CSE',
    exam_name: '6th Semester Regular Examination - May 2025',
    subject_code: 'CS602',
    subject_name: 'Computer Networks',
    request_type: 'Scrutiny & Retotalling',
    fee_paid: '₹ 250',
    original_marks: 48,
    original_grade: 'C',
    revised_marks: null,
    revised_grade: null,
    status: 'UNDER REVIEW',
    examiner_remarks: 'Script pulled from confidential archive. Under review by subject expert panel.',
    applied_at: '2025-06-18',
    resolved_at: null
  }
];

fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');
console.log('✅ Phase 4 data seeded successfully into campusiq_store.json:');
console.log(`- Exam Seating Plans: ${store.exam_seating_plans.length}`);
console.log(`- Invigilation Duties: ${store.invigilation_duties.length}`);
console.log(`- Question Bank: ${store.question_bank.length}`);
console.log(`- Revaluation Requests: ${store.revaluation_requests.length}`);
