const fs = require('fs');
const path = require('path');

const storePath = path.join(__dirname, '../../data/campusiq_store.json');
const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));

console.log('Seeding Phase 3: Placement Engine & Document Verification...');

// 1. Placement Drives with Configurable Criteria
store.placement_drives = store.placement_drives || [
  {
    id: 1,
    company_name: 'Tata Consultancy Services (TCS Digital / Ninja)',
    job_role: 'Digital Software Engineer & Systems Architect',
    package: '₹7.5 - ₹9.0 LPA',
    drive_date: '2026-04-15',
    venue: 'RVSCET Auditorium & Computer Centre',
    criteria: {
      min_cgpa: 7.0,
      min_percentage: 65,
      max_active_backlogs: 0,
      allowed_departments: ['CSE', 'ECE', 'EEE'],
      passing_year: 2027,
      min_attendance: 75
    },
    status: 'Active Registration',
    registered_students: [7],
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    company_name: 'Tata Steel Jamshedpur (ISWP / Growth Shop)',
    job_role: 'Graduate Engineer Trainee (GET) - Operations & Automation',
    package: '₹6.8 LPA',
    drive_date: '2026-04-22',
    venue: 'RVSCET Placement Cell Seminar Room',
    criteria: {
      min_cgpa: 6.5,
      min_percentage: 60,
      max_active_backlogs: 1,
      allowed_departments: ['CSE', 'MECH', 'CIVIL', 'EEE'],
      passing_year: 2027,
      min_attendance: 70
    },
    status: 'Active Registration',
    registered_students: [],
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    company_name: 'Wipro Technologies (Elite Turbo)',
    job_role: 'Full Stack Java & Cloud Developer',
    package: '₹6.5 LPA',
    drive_date: '2026-05-02',
    venue: 'Virtual Assessment / RVSCET Online Lab',
    criteria: {
      min_cgpa: 6.0,
      min_percentage: 60,
      max_active_backlogs: 0,
      allowed_departments: ['CSE', 'ECE'],
      passing_year: 2027,
      min_attendance: 75
    },
    status: 'Upcoming',
    registered_students: [],
    created_at: new Date().toISOString()
  }
];

// 2. Ensure Student Documents Collection
store.student_documents = store.student_documents || [
  {
    id: 1,
    student_id: 7,
    student_name: 'Rahul Kumar Verma',
    roll_no: '23RVSCSE042',
    department_code: 'CSE',
    doc_type: 'Class X Secondary Marksheet',
    file_name: 'rahul_verma_class10_marksheet.pdf',
    upload_date: '2023-08-10',
    status: 'VERIFIED',
    verified_by: 'Registrar Academic Office',
    verified_at: '2023-08-12T11:00:00Z',
    remarks: 'Verified against original CBSE marksheet.'
  },
  {
    id: 2,
    student_id: 7,
    student_name: 'Rahul Kumar Verma',
    roll_no: '23RVSCSE042',
    department_code: 'CSE',
    doc_type: 'Class XII Higher Secondary Marksheet',
    file_name: 'rahul_verma_class12_marksheet.pdf',
    upload_date: '2023-08-10',
    status: 'VERIFIED',
    verified_by: 'Registrar Academic Office',
    verified_at: '2023-08-12T11:00:00Z',
    remarks: 'Physics, Chemistry, Maths verified ≥75% aggregate.'
  },
  {
    id: 3,
    student_id: 7,
    student_name: 'Rahul Kumar Verma',
    roll_no: '23RVSCSE042',
    department_code: 'CSE',
    doc_type: 'JCECE / JEE Seat Allotment Letter',
    file_name: 'rahul_verma_jee_allotment.pdf',
    upload_date: '2023-08-10',
    status: 'VERIFIED',
    verified_by: 'Admissions Desk',
    verified_at: '2023-08-12T11:00:00Z',
    remarks: 'Valid rank allotment letter.'
  },
  {
    id: 4,
    student_id: 10,
    student_name: 'Vikramaditya Sharma',
    roll_no: '23RVSCSE045',
    department_code: 'CSE',
    doc_type: 'Migration / Transfer Certificate',
    file_name: 'vikram_migration_cert.pdf',
    upload_date: '2026-02-18',
    status: 'PENDING',
    verified_by: null,
    verified_at: null,
    remarks: 'Awaiting original copy submission at administrative counter.'
  },
  {
    id: 5,
    student_id: 10,
    student_name: 'Vikramaditya Sharma',
    roll_no: '23RVSCSE045',
    department_code: 'CSE',
    doc_type: 'Aadhaar Card / Government ID',
    file_name: 'vikram_aadhaar.pdf',
    upload_date: '2026-02-18',
    status: 'REJECTED',
    verified_by: 'Admissions Desk Officer',
    verified_at: '2026-02-20T10:00:00Z',
    remarks: 'Uploaded photocopy is blurred and unreadable. Please re-upload high resolution scan.'
  }
];

fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');
console.log('Phase 3 seeded successfully!');
