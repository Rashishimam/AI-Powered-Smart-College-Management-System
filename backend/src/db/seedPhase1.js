const fs = require('fs');
const path = require('path');

const storePath = path.join(__dirname, '../../data/campusiq_store.json');
const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));

console.log('Seeding Phase 1: Student 360, Backlogs, and Internal Marks...');

// 1. Ensure Backlogs collection
store.backlogs = store.backlogs || [
  {
    id: 1,
    student_id: 10, // Vikramaditya
    student_name: 'Vikramaditya Sharma',
    roll_no: '23RVSCSE045',
    reg_no: 'JUT/2023/CSE/0192',
    subject_code: 'BS-301',
    subject_name: 'Mathematics-III (Advanced PDE & Numerical Methods)',
    department_code: 'CSE',
    semester: '3rd Semester',
    original_exam: 'Odd Semester End-Term Dec 2024',
    attempt_number: 2,
    marks: 58,
    result: 'Pass',
    status: 'Cleared',
    cleared_date: '2025-06-25',
    remarks: 'Cleared in Summer Supplementary Examination 2025'
  },
  {
    id: 2,
    student_id: 10,
    student_name: 'Vikramaditya Sharma',
    roll_no: '23RVSCSE045',
    reg_no: 'JUT/2023/CSE/0192',
    subject_code: 'CS-402',
    subject_name: 'Design & Analysis of Algorithms',
    department_code: 'CSE',
    semester: '4th Semester',
    original_exam: 'Even Semester End-Term May 2025',
    attempt_number: 1,
    marks: 32,
    result: 'Fail',
    status: 'Pending',
    cleared_date: null,
    remarks: 'Eligible for Special Supplementary Exam'
  }
];

// 2. Ensure Internal Marks Configuration (Admin Configurable Components, Total = 100%)
store.internal_marks_config = store.internal_marks_config || {
  academic_session: '2025-2026',
  department_code: 'ALL',
  components: [
    { name: 'Attendance', weightage: 10, max_marks: 10, description: 'Classroom attendance compliance (≥75%)' },
    { name: 'Assignments', weightage: 20, max_marks: 20, description: 'Best 3 of 4 continuous evaluations' },
    { name: 'Surprise Quizzes', weightage: 10, max_marks: 10, description: 'Two online campus quizzes' },
    { name: 'Mid-Semester Exam', weightage: 30, max_marks: 30, description: 'Formal mid-term examination' },
    { name: 'Class Test / Seminar', weightage: 15, max_marks: 15, description: 'Technical presentation & seminar' },
    { name: 'Practical & Viva', weightage: 15, max_marks: 15, description: 'Lab workbook and viva-voce' }
  ],
  total_weightage: 100,
  passing_internal_percent: 40,
  updated_at: new Date().toISOString()
};

// 3. Ensure Internal Marks
store.internal_marks = store.internal_marks || [
  {
    id: 1,
    department_code: 'CSE',
    semester: '6th Semester',
    subject_code: 'CS-601',
    subject_name: 'Compiler Design',
    faculty_id: 6,
    faculty_name: 'Prof. Jeevan Kumar',
    session: '2025-2026',
    is_locked: true,
    locked_at: '2026-03-01T10:00:00Z',
    locked_by_name: 'Prof. Jeevan Kumar',
    students: [
      {
        student_id: 7, // Rahul Kumar Verma
        roll_no: '23RVSCSE042',
        student_name: 'Rahul Kumar Verma',
        marks: {
          Attendance: 9,
          Assignments: 18,
          'Surprise Quizzes': 8.5,
          'Mid-Semester Exam': 27,
          'Class Test / Seminar': 13.5,
          'Practical & Viva': 14
        },
        total_internal: 90.0,
        max_possible: 100,
        grade: 'A+',
        status: 'Finalized'
      },
      {
        student_id: 10, // Vikramaditya
        roll_no: '23RVSCSE045',
        student_name: 'Vikramaditya Sharma',
        marks: {
          Attendance: 8,
          Assignments: 16,
          'Surprise Quizzes': 7,
          'Mid-Semester Exam': 22,
          'Class Test / Seminar': 12,
          'Practical & Viva': 13
        },
        total_internal: 78.0,
        max_possible: 100,
        grade: 'B+',
        status: 'Finalized'
      }
    ]
  },
  {
    id: 2,
    department_code: 'CSE',
    semester: '6th Semester',
    subject_code: 'CS-602',
    subject_name: 'Computer Networks',
    faculty_id: 6,
    faculty_name: 'Prof. Jeevan Kumar',
    session: '2025-2026',
    is_locked: false,
    locked_at: null,
    locked_by_name: null,
    students: [
      {
        student_id: 7,
        roll_no: '23RVSCSE042',
        student_name: 'Rahul Kumar Verma',
        marks: {
          Attendance: 9.5,
          Assignments: 19,
          'Surprise Quizzes': 9,
          'Mid-Semester Exam': 26,
          'Class Test / Seminar': 14,
          'Practical & Viva': 14.5
        },
        total_internal: 92.0,
        max_possible: 100,
        grade: 'A+',
        status: 'Draft'
      },
      {
        student_id: 10,
        roll_no: '23RVSCSE045',
        student_name: 'Vikramaditya Sharma',
        marks: {
          Attendance: 7.5,
          Assignments: 15,
          'Surprise Quizzes': 7.5,
          'Mid-Semester Exam': 21,
          'Class Test / Seminar': 11,
          'Practical & Viva': 12
        },
        total_internal: 74.0,
        max_possible: 100,
        grade: 'B',
        status: 'Draft'
      }
    ]
  }
];

// 4. Ensure Internal Marks Audit Log
store.internal_marks_audit = store.internal_marks_audit || [
  {
    id: 1,
    subject_code: 'CS-601',
    student_id: 7,
    student_name: 'Rahul Kumar Verma',
    component: 'Mid-Semester Exam',
    previous_mark: 25,
    new_mark: 27,
    reason: 'Correction post scrutiny of Question 4 Evaluation Scheme approved by HOD',
    changed_by_id: 6,
    changed_by_name: 'Prof. Jeevan Kumar',
    changed_by_role: 'faculty',
    created_at: '2026-03-02T14:30:00Z'
  }
];

// 5. Ensure Assignments Collection
store.assignments = store.assignments || [
  {
    id: 1,
    title: 'Lexical Analyzer Implementation using Flex',
    subject_code: 'CS-601',
    subject_name: 'Compiler Design',
    department_code: 'CSE',
    semester: '6th Semester',
    faculty_name: 'Prof. Jeevan Kumar',
    due_date: '2026-03-25',
    max_marks: 20,
    submissions: [
      {
        student_id: 7,
        student_name: 'Rahul Kumar Verma',
        roll_no: '23RVSCSE042',
        submitted_at: '2026-03-20T11:20:00Z',
        status: 'Submitted',
        marks: 19,
        feedback: 'Excellent modular regular expressions and symbol table integration.'
      }
    ]
  },
  {
    id: 2,
    title: 'IPv4 Subnetting and CIDR Routing Table Design',
    subject_code: 'CS-602',
    subject_name: 'Computer Networks',
    department_code: 'CSE',
    semester: '6th Semester',
    faculty_name: 'Prof. Jeevan Kumar',
    due_date: '2026-03-30',
    max_marks: 20,
    submissions: [
      {
        student_id: 7,
        student_name: 'Rahul Kumar Verma',
        roll_no: '23RVSCSE042',
        submitted_at: '2026-03-22T09:15:00Z',
        status: 'Submitted',
        marks: 18,
        feedback: 'Clean VLSM calculations.'
      },
      {
        student_id: 10,
        student_name: 'Vikramaditya Sharma',
        roll_no: '23RVSCSE045',
        submitted_at: null,
        status: 'Pending',
        marks: null,
        feedback: null
      }
    ]
  },
  {
    id: 3,
    title: 'Dockerizing Full Stack Node/React Web Application',
    subject_code: 'CS-603',
    subject_name: 'Cloud & Distributed Computing',
    department_code: 'CSE',
    semester: '6th Semester',
    faculty_name: 'Prof. Amit Ranjan',
    due_date: '2026-04-10',
    max_marks: 25,
    submissions: [
      {
        student_id: 7,
        student_name: 'Rahul Kumar Verma',
        roll_no: '23RVSCSE042',
        submitted_at: null,
        status: 'Pending',
        marks: null,
        feedback: null
      }
    ]
  }
];

// 6. Ensure Library Book Issues
store.library_issued_records = store.library_issued_records || [
  {
    id: 1,
    book_id: 1,
    book_title: 'Compilers: Principles, Techniques, and Tools (Dragon Book)',
    isbn: '978-0321486813',
    student_id: 7,
    student_name: 'Rahul Kumar Verma',
    roll_no: '23RVSCSE042',
    issue_date: '2026-02-10',
    due_date: '2026-03-10',
    return_date: null,
    status: 'Issued',
    fine_amount: 0
  },
  {
    id: 2,
    book_id: 2,
    book_title: 'Computer Networks (5th Edition) - Tanenbaum',
    isbn: '978-0132126953',
    student_id: 7,
    student_name: 'Rahul Kumar Verma',
    roll_no: '23RVSCSE042',
    issue_date: '2026-01-15',
    due_date: '2026-02-15',
    return_date: '2026-02-14',
    status: 'Returned',
    fine_amount: 0
  }
];

// 7. Ensure Student Documents
store.student_documents = store.student_documents || [
  {
    id: 1,
    student_id: 7,
    student_name: 'Rahul Kumar Verma',
    roll_no: '23RVSCSE042',
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
    student_id: 7,
    student_name: 'Rahul Kumar Verma',
    roll_no: '23RVSCSE042',
    doc_type: 'Aadhaar Card / Government ID',
    file_name: 'rahul_verma_aadhaar.pdf',
    upload_date: '2023-08-10',
    status: 'VERIFIED',
    verified_by: 'Admissions Desk',
    verified_at: '2023-08-12T11:00:00Z',
    remarks: 'UIDAI verified identity.'
  },
  {
    id: 5,
    student_id: 10,
    student_name: 'Vikramaditya Sharma',
    roll_no: '23RVSCSE045',
    doc_type: 'Migration / Transfer Certificate',
    file_name: 'vikram_migration_cert.pdf',
    upload_date: '2026-02-18',
    status: 'PENDING',
    verified_by: null,
    verified_at: null,
    remarks: 'Awaiting original copy submission at administrative counter.'
  }
];

// 8. Ensure Issued Certificates
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
    purpose: 'Education Loan Renewal & State Scholarship Application',
    status: 'VALID',
    signatory: 'Prof. (Dr.) Rajesh Kumar Tiwari, Principal RVSCET',
    verification_token: 'VTOKEN-RVS-CERT-2026-001-A98B',
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
    purpose: 'Technical Internship Verification at Tata Steel Jamshedpur',
    status: 'VALID',
    signatory: 'Dr. Surya Bahadur, Dean Student Welfare',
    verification_token: 'VTOKEN-RVS-CERT-2026-002-B72C',
    created_at: '2026-02-20T11:30:00Z'
  }
];

fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');
console.log('Phase 1 collections seeded successfully in campusiq_store.json!');
