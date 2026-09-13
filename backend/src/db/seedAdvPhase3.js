/**
 * seedAdvPhase3.js
 * Seeds Phase 3 data into campusiq_store.json:
 * - scholarships (schemes and student applications)
 * - no_dues_requests (multi-department clearance requests and logs)
 * - semester_registrations (registration windows and student records)
 * - elective_groups (elective baskets, seat limits, choices, and allocations)
 */

const fs = require('fs');
const path = require('path');

const storePath = path.resolve(__dirname, '../../data/campusiq_store.json');
const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));

// 1. Scholarship Schemes & Applications
store.scholarship_schemes = [
  {
    id: 1,
    name: 'RVS Merit & Academic Excellence Scholarship',
    academic_session: '2025-26',
    eligibility_criteria: 'Minimum 8.5 CGPA in previous semesters and minimum 80% class attendance with no standing backlogs.',
    amount_description: '₹ 25,000 per academic year / 50% semester tuition waiver',
    deadline: '2025-10-31',
    required_documents: ['Semester Grade Sheets', 'Attendance Certificate', 'Character Certificate'],
    status: 'Active',
    created_at: '2025-08-01'
  },
  {
    id: 2,
    name: 'E-Kalyan Jharkhand State Post-Matric Support Facilitation',
    academic_session: '2025-26',
    eligibility_criteria: 'Domicile of Jharkhand state belonging to SC / ST / BC categories with family annual income under government prescribed limits.',
    amount_description: 'Full tuition fee reimbursement as approved by Jharkhand Welfare Dept',
    deadline: '2025-11-15',
    required_documents: ['Income Certificate (Recent)', 'Caste Certificate', 'Residential Domicile Certificate', 'College Bonafide Certificate'],
    status: 'Active',
    created_at: '2025-08-10'
  },
  {
    id: 3,
    name: 'RVS Sports & Extra-Curricular Talent Grant',
    academic_session: '2025-26',
    eligibility_criteria: 'Representation at Inter-University, State, or National sports / technical competitions with valid podium certification.',
    amount_description: '₹ 15,000 one-time special achievement grant',
    deadline: '2025-10-15',
    required_documents: ['Sports / Competition Certificates', 'HOD Recommendation Letter'],
    status: 'Active',
    created_at: '2025-08-15'
  }
];

store.scholarship_applications = [
  {
    id: 1,
    scheme_id: 1,
    scheme_name: 'RVS Merit & Academic Excellence Scholarship',
    student_id: 2,
    student_name: 'Aarav Sharma',
    roll_no: '23RVSCSE002',
    department: 'CSE',
    academic_session: '2025-26',
    cgpa: 8.8,
    attendance_pct: 88,
    status: 'APPROVED',
    remarks: 'Verified by Dean Academics. High academic performance confirmed.',
    documents_submitted: [
      { name: 'Semester_Markssheet.pdf', url: '/uploads/scholarships/marks_aarav.pdf' },
      { name: 'Attendance_Cert.pdf', url: '/uploads/scholarships/att_aarav.pdf' }
    ],
    applied_at: '2025-08-25',
    updated_at: '2025-09-02'
  },
  {
    id: 2,
    scheme_id: 2,
    scheme_name: 'E-Kalyan Jharkhand State Post-Matric Support Facilitation',
    student_id: 3,
    student_name: 'Priya Mukherjee',
    roll_no: '23RVSCSE003',
    department: 'CSE',
    academic_session: '2025-26',
    cgpa: 8.4,
    attendance_pct: 85,
    status: 'UNDER REVIEW',
    remarks: 'College welfare desk reviewing submitted domicile and income certificates.',
    documents_submitted: [
      { name: 'Income_Certificate_2025.pdf', url: '/uploads/scholarships/income_priya.pdf' },
      { name: 'Domicile_Jharkhand.pdf', url: '/uploads/scholarships/domicile_priya.pdf' }
    ],
    applied_at: '2025-09-01',
    updated_at: '2025-09-03'
  }
];

// 2. No-Dues Clearance Requests
store.no_dues_requests = [
  {
    id: 1,
    student_id: 2,
    student_name: 'Aarav Sharma',
    roll_no: '23RVSCSE002',
    department: 'CSE',
    academic_session: '2025-26',
    program: 'B.Tech Computer Science & Engineering',
    purpose: 'Semester Exam Clearance & Final Project Submission',
    requested_at: '2025-09-01',
    overall_status: 'CLEARED',
    completed_at: '2025-09-08',
    certificate_no: 'RVS-NODUES-2025-001',
    units: [
      { name: 'Accounts / Finance', status: 'CLEARED', remarks: 'All semester fees paid in full. No outstanding balance.', cleared_by: 'Accounts Officer', updated_at: '2025-09-02' },
      { name: 'Central Library', status: 'CLEARED', remarks: 'All 4 issued books returned in good condition. Zero fine.', cleared_by: 'Chief Librarian', updated_at: '2025-09-03' },
      { name: 'Department / Lab', status: 'CLEARED', remarks: 'Software lab and microprocessor kit clearance granted.', cleared_by: 'CSE Lab In-Charge', updated_at: '2025-09-04' },
      { name: 'Hostel Administration', status: 'CLEARED', remarks: 'Hostel mess dues settled.', cleared_by: 'Chief Warden', updated_at: '2025-09-05' },
      { name: 'Transport Division', status: 'CLEARED', remarks: 'Bus pass surrendered.', cleared_by: 'Transport Manager', updated_at: '2025-09-06' },
      { name: 'Training & Placement', status: 'CLEARED', remarks: 'Placement survey and internship verification complete.', cleared_by: 'T&P Officer', updated_at: '2025-09-08' }
    ]
  },
  {
    id: 2,
    student_id: 4,
    student_name: 'Rohan Gupta',
    roll_no: '23RVSCSE004',
    department: 'CSE',
    academic_session: '2025-26',
    program: 'B.Tech Computer Science & Engineering',
    purpose: 'Provisional Degree & Migration Clearance',
    requested_at: '2025-09-05',
    overall_status: 'HOLD',
    completed_at: null,
    certificate_no: null,
    units: [
      { name: 'Accounts / Finance', status: 'CLEARED', remarks: 'Fee clearance verified.', cleared_by: 'Accounts Officer', updated_at: '2025-09-06' },
      { name: 'Central Library', status: 'HOLD', remarks: 'Overdue book: "Operating System Concepts" by Silberschatz pending return.', cleared_by: 'Chief Librarian', updated_at: '2025-09-07' },
      { name: 'Department / Lab', status: 'PENDING', remarks: 'Awaiting lab log submission.', cleared_by: null, updated_at: null },
      { name: 'Hostel Administration', status: 'CLEARED', remarks: 'No dues.', cleared_by: 'Hostel Warden', updated_at: '2025-09-06' },
      { name: 'Transport Division', status: 'CLEARED', remarks: 'No dues.', cleared_by: 'Transport Manager', updated_at: '2025-09-06' },
      { name: 'Training & Placement', status: 'PENDING', remarks: 'Pending placement feedback form.', cleared_by: null, updated_at: null }
    ]
  }
];

// 3. Semester Registration
store.semester_registration_windows = [
  {
    id: 1,
    academic_session: '2025-26',
    semester: '7th Semester',
    department: 'CSE',
    start_date: '2025-08-01',
    end_date: '2025-09-30',
    status: 'OPEN',
    required_core_subjects: [
      { code: 'CS701', name: 'Artificial Intelligence & Machine Learning', credits: 4 },
      { code: 'CS702', name: 'Information Security & Cryptography', credits: 4 },
      { code: 'CS703', name: 'Cloud Computing & Virtualization', credits: 3 },
      { code: 'CS791', name: 'AI & Security Laboratory', credits: 2 }
    ],
    elective_rules: 'Students must choose exactly one Elective Group-1 subject and one Open Elective subject.'
  }
];

store.semester_registrations = [
  {
    id: 1,
    window_id: 1,
    student_id: 2,
    student_name: 'Aarav Sharma',
    roll_no: '23RVSCSE002',
    department: 'CSE',
    academic_session: '2025-26',
    registered_semester: '7th Semester',
    core_subjects: ['CS701', 'CS702', 'CS703', 'CS791'],
    selected_electives: [
      { group: 'Professional Elective 1', subject_code: 'CS704A', subject_name: 'Natural Language Processing' },
      { group: 'Open Elective 1', subject_code: 'OE701B', subject_name: 'Intellectual Property Rights & Cyber Laws' }
    ],
    status: 'APPROVED',
    registered_at: '2025-08-10',
    approved_by: 'HOD CSE',
    remarks: 'Registration approved. Student eligible as per Jharkhand University credit criteria.'
  }
];

// 4. Elective Groups & Choices
store.elective_groups = [
  {
    id: 1,
    group_name: 'Professional Elective 1 (Semester 7 - CSE)',
    department: 'CSE',
    semester: '7th Semester',
    academic_session: '2025-26',
    status: 'OPEN',
    subjects: [
      { code: 'CS704A', name: 'Natural Language Processing', capacity: 60, enrolled_count: 38 },
      { code: 'CS704B', name: 'Computer Vision & Deep Learning', capacity: 60, enrolled_count: 52 },
      { code: 'CS704C', name: 'Blockchains & Smart Contracts', capacity: 40, enrolled_count: 35 }
    ]
  },
  {
    id: 2,
    group_name: 'Open Elective 1 (Inter-Departmental - Semester 7)',
    department: 'ALL',
    semester: '7th Semester',
    academic_session: '2025-26',
    status: 'OPEN',
    subjects: [
      { code: 'OE701A', name: 'Industrial Robotics & Automation', capacity: 50, enrolled_count: 42 },
      { code: 'OE701B', name: 'Intellectual Property Rights & Cyber Laws', capacity: 80, enrolled_count: 65 },
      { code: 'OE701C', name: 'Renewable Energy Systems & Green Tech', capacity: 50, enrolled_count: 30 }
    ]
  }
];

fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');
console.log('✅ Phase 3 data seeded successfully into campusiq_store.json:');
console.log(`- Scholarship Schemes: ${store.scholarship_schemes.length}`);
console.log(`- No-Dues Requests: ${store.no_dues_requests.length}`);
console.log(`- Semester Registration Windows: ${store.semester_registration_windows.length}`);
console.log(`- Elective Groups: ${store.elective_groups.length}`);
