const fs = require('fs');
const path = require('path');

const storePath = path.join(__dirname, '../../data/campusiq_store.json');
const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));

console.log('Seeding Phase 2: Admit Cards & Certificates...');

// 1. Admit Card Eligibility Configuration
store.admit_card_config = store.admit_card_config || {
  min_attendance_pct: 75,
  require_fee_clearance: true,
  require_exam_registration: true,
  require_active_status: true,
  allow_admin_override: true,
  updated_at: new Date().toISOString()
};

// 2. Exam Schedules for Admit Cards
store.exam_schedules = store.exam_schedules || [
  {
    exam_id: 'EXAM-2026-EVEN',
    exam_name: 'B.Tech 6th Semester End-Term Theory & Lab Examination (Even Sem 2025-26)',
    session: '2025-2026',
    department_code: 'CSE',
    semester: '6th Semester',
    start_date: '2026-05-15',
    end_date: '2026-05-28',
    reporting_time: '09:30 AM',
    exam_centre: 'RVSCET Main Examination Wing, Academic Block A, Jamshedpur',
    subjects: [
      { code: 'CS-601', name: 'Compiler Design', date: '2026-05-15', time: '10:00 AM - 01:00 PM', room: 'Exam Hall 101' },
      { code: 'CS-602', name: 'Computer Networks', date: '2026-05-18', time: '10:00 AM - 01:00 PM', room: 'Exam Hall 101' },
      { code: 'CS-603', name: 'Cloud & Distributed Computing', date: '2026-05-21', time: '10:00 AM - 01:00 PM', room: 'Exam Hall 102' },
      { code: 'CS-604L', name: 'Advanced Networks Laboratory', date: '2026-05-25', time: '09:00 AM - 12:00 PM', room: 'Computing Lab 3' }
    ]
  }
];

// 3. Admit Card Overrides (Audit Trail)
store.admit_card_overrides = store.admit_card_overrides || [
  {
    id: 1,
    student_id: 10,
    student_name: 'Vikramaditya Sharma',
    roll_no: '23RVSCSE045',
    exam_id: 'EXAM-2026-EVEN',
    overridden_by: 'Prof. (Dr.) Rajesh Kumar Tiwari, Principal',
    reason: 'Medical Leave application approved for hospitalization; granted conditional eligibility for 6th Sem End-Term.',
    timestamp: '2026-05-01T10:00:00Z'
  }
];

// 4. Certificates Collection
store.certificates = store.certificates || [
  {
    id: 1,
    certificate_no: 'RVSCET/CERT/2026/001',
    template_type: 'Bonafide Certificate',
    student_id: 7,
    student_name: 'Rahul Kumar Verma',
    roll_no: '23RVSCSE042',
    reg_no: 'JUT/2023/CSE/0189',
    course: 'B.Tech Computer Science & Engineering',
    department: 'Computer Science & Engineering',
    session: '2025-2026',
    issue_date: '2026-02-15',
    purpose: 'Education Loan Renewal & National Scholarship Portal (NSP)',
    status: 'VALID',
    signatory: 'Prof. (Dr.) Rajesh Kumar Tiwari, Principal RVSCET',
    verification_token: 'VTOKEN-RVS-CERT-2026-001',
    content_text: 'This is to certify that Rahul Kumar Verma (Roll No. 23RVSCSE042, University Registration No. JUT/2023/CSE/0189) is a bonafide full-time student of B.Tech Computer Science & Engineering at RVS College of Engineering & Technology, Jamshedpur for the academic session 2025-2026. He bears good moral character and conduct.',
    created_at: '2026-02-15T10:00:00Z'
  },
  {
    id: 2,
    certificate_no: 'RVSCET/CERT/2026/002',
    template_type: 'Character Certificate',
    student_id: 7,
    student_name: 'Rahul Kumar Verma',
    roll_no: '23RVSCSE042',
    reg_no: 'JUT/2023/CSE/0189',
    course: 'B.Tech Computer Science & Engineering',
    department: 'Computer Science & Engineering',
    session: '2025-2026',
    issue_date: '2026-02-20',
    purpose: 'Summer Internship Screening at Tata Steel Jamshedpur',
    status: 'VALID',
    signatory: 'Dr. Surya Bahadur, Dean Student Welfare',
    verification_token: 'VTOKEN-RVS-CERT-2026-002',
    content_text: 'This is to certify that Rahul Kumar Verma is known to this institution since August 2023. During his tenure at RVS College of Engineering & Technology, Jamshedpur, his conduct, discipline, and moral character have been found exemplary.',
    created_at: '2026-02-20T11:30:00Z'
  },
  {
    id: 3,
    certificate_no: 'RVSCET/CERT/2025/089',
    template_type: 'Student Verification Certificate',
    student_id: 10,
    student_name: 'Vikramaditya Sharma',
    roll_no: '23RVSCSE045',
    reg_no: 'JUT/2023/CSE/0192',
    course: 'B.Tech Computer Science & Engineering',
    department: 'Computer Science & Engineering',
    session: '2024-2025',
    issue_date: '2025-11-10',
    purpose: 'Passport Application Verification',
    status: 'REVOKED',
    revocation_reason: 'Superseded by updated address record issuance upon student request.',
    revoked_at: '2025-11-20T14:00:00Z',
    revoked_by: 'Registrar Academic Office',
    signatory: 'Prof. (Dr.) Rajesh Kumar Tiwari, Principal RVSCET',
    verification_token: 'VTOKEN-RVS-CERT-2025-089',
    content_text: 'Student identity verification record.',
    created_at: '2025-11-10T10:00:00Z'
  }
];

fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');
console.log('Phase 2 collections seeded successfully!');
