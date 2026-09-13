const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '../../data');
const STORE_PATH = path.join(DATA_DIR, 'campusiq_store.json');

function runRvsMigration() {
  console.log('🚀 Running RVS College of Engineering & Technology Data Migration...');

  let store = {};
  if (fs.existsSync(STORE_PATH)) {
    try {
      store = JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
    } catch (e) {
      console.warn('Could not read existing store, creating fresh store:', e.message);
    }
  }

  // 1. Update College #1 to RVS College of Engineering & Technology, Jamshedpur
  // Verified from https://www.rvscollege.ac.in/
  store.colleges = store.colleges || [];
  const officialCollegeData = {
    id: 1,
    name: 'RVS College of Engineering & Technology',
    short_name: 'RVSCET',
    code: 'RVSCET-JSR',
    city: 'Jamshedpur',
    state: 'Jharkhand',
    country: 'India',
    address: 'Edalbera, P.O. Bhilai Pahari, NH-33, Jamshedpur, Jharkhand - 831012, India',
    phone: '7033000777',
    placement_phone: '9110969068',
    email: 'info@rvscet.com',
    alternate_email: 'rvscet@gmail.com',
    website: 'https://www.rvscollege.ac.in/',
    established: 1993,
    affiliation: 'Approved by AICTE, New Delhi & Affiliated to Jharkhand University of Technology (JUT), Ranchi / Kolhan University',
    accreditation: 'NAAC Accredited Grade "B"',
    logo_url: '/assets/rvs-logo.png',
    status: 'active',
    data_source: 'OFFICIAL'
  };

  let rvsCollege = store.colleges.find(c => c.id === 1);
  if (rvsCollege) {
    Object.assign(rvsCollege, officialCollegeData);
  } else {
    store.colleges.unshift({
      ...officialCollegeData,
      created_at: new Date().toISOString()
    });
  }

  // 2. Seed Verified RVS Departments from official website
  const rvsDepartments = [
    { id: 1, code: 'CSE', name: 'Computer Science & Engineering', intake: 150, hod: 'Prof. Jeevan Kumar', is_official: true, data_source: 'OFFICIAL' },
    { id: 2, code: 'AIML', name: 'Computer Science & Engg. (AI & ML)', intake: 60, hod: 'Prof. Smita Dash', is_official: true, data_source: 'OFFICIAL' },
    { id: 3, code: 'CE', name: 'Civil Engineering', intake: 60, hod: 'Dr. R. K. Paswan', is_official: true, data_source: 'OFFICIAL' },
    { id: 4, code: 'EEE', name: 'Electrical & Electronics Engineering', intake: 60, hod: 'Dr. Thakur Pranav Kumar Gautam', is_official: true, data_source: 'OFFICIAL' },
    { id: 5, code: 'ECE', name: 'Electronics & Communication Engineering', intake: 60, hod: 'Dr. Sushanta Mahanty', is_official: true, data_source: 'OFFICIAL' },
    { id: 6, code: 'ME', name: 'Mechanical Engineering', intake: 60, hod: 'Prof. Shailandra Kumar Prasad', is_official: true, data_source: 'OFFICIAL' },
    { id: 7, code: 'MCA', name: 'Master of Computer Applications', intake: 60, hod: 'Prof. Yogendra Kumar', is_official: true, data_source: 'OFFICIAL' },
    { id: 8, code: 'BCA', name: 'Bachelor of Computer Applications', intake: 60, hod: 'Prof. Yogendra Kumar', is_official: true, data_source: 'OFFICIAL' },
    { id: 9, code: 'BBA', name: 'Bachelor of Business Administration', intake: 60, hod: 'Prof. Anupama Kumari', is_official: true, data_source: 'OFFICIAL' }
  ];

  store.departments = store.departments || [];
  rvsDepartments.forEach(dept => {
    const existing = store.departments.find(d => d.code === dept.code);
    if (existing) {
      Object.assign(existing, dept);
    } else {
      store.departments.push({ ...dept, created_at: new Date().toISOString() });
    }
  });

  // 3. Seed Verified RVS Academic Programs (Configurable: duration, semesters, intake seats)
  // Per official website: B.Tech CSE has 4 years, 8 semesters, 150 seats intake
  const rvsPrograms = [
    {
      id: 1,
      code: 'BTECH-CSE',
      name: 'B.Tech Computer Science & Engineering',
      degree: 'B.Tech (UG)',
      department_code: 'CSE',
      duration_years: 4,
      semester_count: 8,
      intake_seats: 150,
      eligibility: '10+2 with Physics, Mathematics & Chemistry/CS (JEE Main / JCECE)',
      is_active: true,
      is_official: true,
      data_source: 'OFFICIAL',
      notes: 'Configurable intake seats as per AICTE approvals (Current: 150)'
    },
    {
      id: 2,
      code: 'BTECH-AIML',
      name: 'B.Tech Computer Science & Engg. (AI & ML)',
      degree: 'B.Tech (UG)',
      department_code: 'AIML',
      duration_years: 4,
      semester_count: 8,
      intake_seats: 60,
      eligibility: '10+2 with PCM (JEE Main / JCECE)',
      is_active: true,
      is_official: true,
      data_source: 'OFFICIAL'
    },
    {
      id: 3,
      code: 'BTECH-CE',
      name: 'B.Tech Civil Engineering',
      degree: 'B.Tech (UG)',
      department_code: 'CE',
      duration_years: 4,
      semester_count: 8,
      intake_seats: 60,
      eligibility: '10+2 with PCM (JEE Main / JCECE)',
      is_active: true,
      is_official: true,
      data_source: 'OFFICIAL'
    },
    {
      id: 4,
      code: 'BTECH-EEE',
      name: 'B.Tech Electrical & Electronics Engineering',
      degree: 'B.Tech (UG)',
      department_code: 'EEE',
      duration_years: 4,
      semester_count: 8,
      intake_seats: 60,
      eligibility: '10+2 with PCM (JEE Main / JCECE)',
      is_active: true,
      is_official: true,
      data_source: 'OFFICIAL'
    },
    {
      id: 5,
      code: 'BTECH-ECE',
      name: 'B.Tech Electronics & Communication Engineering',
      degree: 'B.Tech (UG)',
      department_code: 'ECE',
      duration_years: 4,
      semester_count: 8,
      intake_seats: 60,
      eligibility: '10+2 with PCM (JEE Main / JCECE)',
      is_active: true,
      is_official: true,
      data_source: 'OFFICIAL'
    },
    {
      id: 6,
      code: 'BTECH-ME',
      name: 'B.Tech Mechanical Engineering',
      degree: 'B.Tech (UG)',
      department_code: 'ME',
      duration_years: 4,
      semester_count: 8,
      intake_seats: 60,
      eligibility: '10+2 with PCM (JEE Main / JCECE)',
      is_active: true,
      is_official: true,
      data_source: 'OFFICIAL'
    },
    {
      id: 7,
      code: 'BBA',
      name: 'Bachelor of Business Administration (BBA)',
      degree: 'UG',
      department_code: 'BBA',
      duration_years: 3,
      semester_count: 6,
      intake_seats: 60,
      eligibility: '10+2 in any discipline from recognized board',
      is_active: true,
      is_official: true,
      data_source: 'OFFICIAL'
    },
    {
      id: 8,
      code: 'BCA',
      name: 'Bachelor of Computer Applications (BCA)',
      degree: 'UG',
      department_code: 'BCA',
      duration_years: 3,
      semester_count: 6,
      intake_seats: 60,
      eligibility: '10+2 with Mathematics/CS',
      is_active: true,
      is_official: true,
      data_source: 'OFFICIAL'
    },
    {
      id: 9,
      code: 'MCA',
      name: 'Master of Computer Applications (MCA)',
      degree: 'PG',
      department_code: 'MCA',
      duration_years: 2,
      semester_count: 4,
      intake_seats: 60,
      eligibility: 'Graduation with Mathematics at 10+2 or Degree level',
      is_active: true,
      is_official: true,
      data_source: 'OFFICIAL'
    },
    {
      id: 10,
      code: 'MTECH-CSE',
      name: 'M.Tech Computer Science & Engineering',
      degree: 'M.Tech (PG)',
      department_code: 'CSE',
      duration_years: 2,
      semester_count: 4,
      intake_seats: 18,
      eligibility: 'B.Tech/BE in CSE/IT or MCA with valid GATE/JUT score',
      is_active: true,
      is_official: true,
      data_source: 'OFFICIAL'
    },
    {
      id: 11,
      code: 'DIPLOMA-CE',
      name: 'Diploma in Civil Engineering',
      degree: 'Diploma (Polytechnic)',
      department_code: 'CE',
      duration_years: 3,
      semester_count: 6,
      intake_seats: 60,
      eligibility: '10th Standard with Science & Maths (JCECEB Polytechnic)',
      is_active: true,
      is_official: true,
      data_source: 'OFFICIAL'
    },
    {
      id: 12,
      code: 'DIPLOMA-EE',
      name: 'Diploma in Electrical Engineering',
      degree: 'Diploma (Polytechnic)',
      department_code: 'EEE',
      duration_years: 3,
      semester_count: 6,
      intake_seats: 60,
      eligibility: '10th Standard with Science & Maths (JCECEB Polytechnic)',
      is_active: true,
      is_official: true,
      data_source: 'OFFICIAL'
    },
    {
      id: 13,
      code: 'DIPLOMA-ME',
      name: 'Diploma in Mechanical Engineering',
      degree: 'Diploma (Polytechnic)',
      department_code: 'ME',
      duration_years: 3,
      semester_count: 6,
      intake_seats: 60,
      eligibility: '10th Standard with Science & Maths (JCECEB Polytechnic)',
      is_active: true,
      is_official: true,
      data_source: 'OFFICIAL'
    },
    {
      id: 14,
      code: 'DIPLOMA-MCTX',
      name: 'Diploma in Mechatronics Engineering',
      degree: 'Diploma (Polytechnic)',
      department_code: 'ME',
      duration_years: 3,
      semester_count: 6,
      intake_seats: 60,
      eligibility: '10th Standard with Science & Maths (JCECEB Polytechnic)',
      is_active: true,
      is_official: true,
      data_source: 'OFFICIAL'
    }
  ];

  store.programs = store.programs || [];
  rvsPrograms.forEach(prog => {
    const existing = store.programs.find(p => p.code === prog.code);
    if (existing) {
      Object.assign(existing, prog);
    } else {
      store.programs.push({ ...prog, created_at: new Date().toISOString() });
    }
  });

  // 4. Ensure RVS User Accounts (Verified official roles where applicable + explicit demo tags)
  store.users = store.users || [];

  const rvsAccounts = [
    {
      email: 'admin@rvscet.ac.in',
      name: 'Prof. (Dr.) Rajesh Kumar Tiwari',
      title: 'Principal & Head of Institution',
      role: 'college_admin',
      college_id: 1,
      department: 'Principal Office & Administration',
      phone: '7033000777',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      password: 'Admin@123',
      is_demo: true,
      data_source: 'DEMO (Simulated Admin Account)'
    },
    {
      email: 'director@rvscet.ac.in',
      name: 'Dr. R. N. Gupta',
      title: 'Director & Campus Dean',
      role: 'director',
      college_id: 1,
      department: 'Directorate & Academic Affairs',
      phone: '7033000777',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      password: 'Director@123',
      is_demo: true,
      data_source: 'DEMO (Simulated Director Account)'
    },
    {
      email: 'hod.cse@rvscet.ac.in',
      name: 'Prof. Jeevan Kumar',
      title: 'HOD, Computer Science & Engineering',
      role: 'hod',
      college_id: 1,
      department: 'Computer Science & Engineering',
      phone: '7033000777',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      password: 'Hod@123',
      is_demo: true,
      data_source: 'DEMO (Simulated HOD Account)'
    },
    {
      email: 'faculty.cse@rvscet.ac.in',
      name: 'Prof. Rajesh Sharma',
      title: 'Assistant Professor, CSE',
      role: 'faculty',
      college_id: 1,
      department: 'Computer Science & Engineering',
      phone: '7033000777',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      password: 'Faculty@123',
      is_demo: true,
      data_source: 'DEMO (Simulated Faculty Account)'
    },
    {
      email: 'student.rvs@rvscet.ac.in',
      name: 'Rahul Kumar Verma',
      title: 'B.Tech CSE Student (Demo)',
      role: 'student',
      college_id: 1,
      department: 'Computer Science & Engineering',
      phone: '+91 98765 43210',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      password: 'Student@123',
      is_demo: true,
      data_source: 'DEMO (Simulated Student Record)'
    },
    {
      email: 'superadmin@rvscet.ac.in',
      name: 'RVS Trust Board & Secretariat',
      title: 'Governing Body & Trustees',
      role: 'super_admin',
      college_id: 1,
      department: 'R.V.S Educational Trust',
      phone: '7033000777',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      password: 'Admin@123',
      is_demo: true,
      data_source: 'DEMO (Simulated Super Admin)'
    }
  ];

  rvsAccounts.forEach(acc => {
    const existing = store.users.find(u => u.email.toLowerCase() === acc.email.toLowerCase());
    if (existing) {
      existing.name = acc.name;
      existing.role = acc.role;
      existing.password_hash = bcrypt.hashSync(acc.password, 10);
      existing.department = acc.department;
      existing.phone = acc.phone;
      existing.is_demo = acc.is_demo;
      existing.data_source = acc.data_source;
    } else {
      const newId = store.users.length > 0 ? Math.max(...store.users.map(u => u.id)) + 1 : 1;
      store.users.push({
        id: newId,
        name: acc.name,
        email: acc.email,
        password_hash: bcrypt.hashSync(acc.password, 10),
        role: acc.role,
        college_id: acc.college_id,
        department: acc.department,
        phone: acc.phone,
        avatar: acc.avatar,
        status: 'active',
        is_demo: acc.is_demo,
        data_source: acc.data_source,
        created_at: new Date().toISOString()
      });
    }
  });

  // 5. Extended Student Profiles (Roll No, Reg No, Batch, Session, Guardian)
  store.students_profile = store.students_profile || [];
  const studentUser = store.users.find(u => u.email === 'student.rvs@rvscet.ac.in') || store.users.find(u => u.role === 'student');
  if (studentUser) {
    const sp = store.students_profile.find(p => p.user_id === studentUser.id);
    const demoStudentData = {
      user_id: studentUser.id,
      roll_no: '23RVSCSE042',
      reg_no: 'JUT/2023/CSE/0189',
      admission_no: 'RVS/ADM/2023/042',
      department_code: 'CSE',
      department_name: 'Computer Science & Engineering',
      course: 'B.Tech Computer Science & Engineering',
      semester: '6th Semester',
      batch: '2023-2027',
      session: '2025-2026',
      admission_year: 2023,
      dob: '2004-08-14',
      gender: 'Male',
      address: 'Road No. 4, Mango, Jamshedpur, Jharkhand - 831012, India',
      guardian_name: 'Manoj Kumar Verma',
      mother_name: 'Sunita Devi',
      guardian_phone: '+91 94311 88990',
      guardian_email: 'manoj.verma@example.com',
      guardian_address: 'Road No. 4, Mango, Jamshedpur, Jharkhand - 831012, India',
      promotion_history: [
        { from_semester: '4th Semester', to_semester: '5th Semester', promoted_at: '2025-07-20T10:00:00.000Z', session: '2025-2026' },
        { from_semester: '5th Semester', to_semester: '6th Semester', promoted_at: '2026-01-10T10:00:00.000Z', session: '2025-2026' }
      ],
      status: 'active',
      is_demo: true,
      data_source: 'DEMO'
    };
    if (sp) {
      Object.assign(sp, demoStudentData);
    } else {
      store.students_profile.push({ id: 1, ...demoStudentData });
    }
  }

  // Ensure promotion logs table exists in store
  store.student_promotion_logs = store.student_promotion_logs || [];


  // 6. Extended Faculty Profiles with Verified Official HODs from rvscollege.ac.in
  store.faculty_profile = store.faculty_profile || [];
  const verifiedFacultyDirectory = [
    {
      employee_id: 'RVS-FAC-CSE-001',
      name: 'Prof. Jeevan Kumar',
      designation: 'Assistant Professor & HOD',
      department_code: 'CSE',
      department_name: 'Computer Science & Engineering',
      qualification: 'M.Tech (CSE), Ph.D (Pursuing)',
      specialization: 'Database Systems, Data Structures & Cloud',
      email: 'info@rvscet.com',
      workload_hours: 16,
      subjects: ['CS-601: Compiler Design', 'CS-602: Computer Networks'],
      is_official: true,
      data_source: 'OFFICIAL PUBLIC DATA (rvscollege.ac.in)'
    },
    {
      employee_id: 'RVS-FAC-CE-001',
      name: 'Dr. R. K. Paswan',
      designation: 'Associate Professor & HOD',
      department_code: 'CE',
      department_name: 'Civil Engineering',
      qualification: 'Ph.D, M.Tech (Structural Engineering)',
      specialization: 'Structural Engineering & Concrete Tech',
      email: 'info@rvscet.com',
      workload_hours: 18,
      subjects: ['CE-601: Design of Concrete Structures'],
      is_official: true,
      data_source: 'OFFICIAL PUBLIC DATA (rvscollege.ac.in)'
    },
    {
      employee_id: 'RVS-FAC-ME-001',
      name: 'Prof. Shailandra Kumar Prasad',
      designation: 'Associate Professor & HOD',
      department_code: 'ME',
      department_name: 'Mechanical Engineering',
      qualification: 'M.Tech, Ph.D (Pursuing)',
      specialization: 'Thermal Engineering & Fluid Dynamics',
      email: 'info@rvscet.com',
      workload_hours: 18,
      subjects: ['ME-601: Heat & Mass Transfer'],
      is_official: true,
      data_source: 'OFFICIAL PUBLIC DATA (rvscollege.ac.in)'
    },
    {
      employee_id: 'RVS-FAC-EEE-001',
      name: 'Dr. Thakur Pranav Kumar Gautam',
      designation: 'Professor & HOD',
      department_code: 'EEE',
      department_name: 'Electrical & Electronics Engineering',
      qualification: 'Ph.D (Electrical Engg), M.Tech',
      specialization: 'Power Systems & Renewable Energy',
      email: 'info@rvscet.com',
      workload_hours: 16,
      subjects: ['EEE-601: Power System Analysis'],
      is_official: true,
      data_source: 'OFFICIAL PUBLIC DATA (rvscollege.ac.in)'
    },
    {
      employee_id: 'RVS-FAC-ECE-001',
      name: 'Dr. Sushanta Mahanty',
      designation: 'Associate Professor & HOD',
      department_code: 'ECE',
      department_name: 'Electronics & Communication Engineering',
      qualification: 'Ph.D (ECE), M.Tech',
      specialization: 'VLSI Design & Digital Signal Processing',
      email: 'info@rvscet.com',
      workload_hours: 16,
      subjects: ['ECE-601: Digital Signal Processing'],
      is_official: true,
      data_source: 'OFFICIAL PUBLIC DATA (rvscollege.ac.in)'
    },
    {
      employee_id: 'RVS-FAC-MCA-001',
      name: 'Prof. Yogendra Kumar',
      designation: 'Associate Professor & HOD',
      department_code: 'MCA',
      department_name: 'Master of Computer Applications / BCA',
      qualification: 'MCA, M.Tech (CSE)',
      specialization: 'Software Engineering & Enterprise Web Architecture',
      email: 'info@rvscet.com',
      workload_hours: 18,
      subjects: ['MCA-401: Full Stack Enterprise Architecture'],
      is_official: true,
      data_source: 'OFFICIAL PUBLIC DATA (rvscollege.ac.in)'
    },
    {
      employee_id: 'RVS-FAC-AIML-001',
      name: 'Prof. Smita Dash',
      designation: 'Assistant Professor & HOD',
      department_code: 'AIML',
      department_name: 'Computer Science & Engg. (AI & ML)',
      qualification: 'M.Tech (CSE - AI specialization)',
      specialization: 'Artificial Intelligence, Deep Learning',
      email: 'info@rvscet.com',
      workload_hours: 16,
      subjects: ['AI-601: Neural Networks & Deep Learning'],
      is_official: true,
      data_source: 'OFFICIAL PUBLIC DATA (rvscollege.ac.in)'
    }
  ];

  if (!store.verified_faculty || store.verified_faculty.length <= 7) {
    store.verified_faculty = verifiedFacultyDirectory;
  }

  // 7. RVS Fees Structure & Student Ledger (Clearly demarcating Demo student balance)
  store.fee_structures = [
    { id: 1, course: 'B.Tech (CSE/AIML/ECE/EEE/ME/CE)', semester: '6th Semester', tuition_fee: 45000, exam_fee: 2500, development_fee: 5000, total_amount: 52500, data_source: 'INTERNAL DEMO STRUCTURE' },
    { id: 2, course: 'MCA', semester: '4th Semester', tuition_fee: 35000, exam_fee: 2500, development_fee: 4000, total_amount: 41500, data_source: 'INTERNAL DEMO STRUCTURE' },
    { id: 3, course: 'BBA / BCA', semester: '4th Semester', tuition_fee: 28000, exam_fee: 2000, development_fee: 3500, total_amount: 33500, data_source: 'INTERNAL DEMO STRUCTURE' },
    { id: 4, course: 'Diploma in Engg.', semester: '4th Semester', tuition_fee: 22000, exam_fee: 1500, development_fee: 2500, total_amount: 26000, data_source: 'INTERNAL DEMO STRUCTURE' }
  ];

  store.student_fees = store.student_fees || [];
  const sampleFeeLedger = [
    {
      id: 1,
      student_id: studentUser?.id || 4,
      student_name: studentUser?.name || 'Rahul Kumar Verma',
      roll_no: '23RVSCSE042',
      department: 'Computer Science & Engineering',
      semester: '6th Semester',
      academic_session: '2025-2026',
      total_amount: 52500,
      paid_amount: 52500,
      pending_amount: 0,
      scholarship_discount: 5000,
      fine_amount: 0,
      status: 'Paid',
      receipt_no: 'RVS/FEE/2026/0491',
      due_date: '2026-03-31',
      payment_date: '2026-02-15T10:30:00.000Z',
      payment_mode: 'Online UPI / Netbanking',
      is_demo: true,
      data_source: 'DEMO DATA'
    }
  ];

  sampleFeeLedger.forEach(fee => {
    const existing = store.student_fees.find(f => f.id === fee.id);
    if (existing) {
      Object.assign(existing, fee);
    } else {
      store.student_fees.push(fee);
    }
  });

  // 8. RVS Official Marketing Headline vs Internal Drive Records
  store.placement_headline_stats = {
    alumni_worldwide: '5600+',
    students_placed: '3900+',
    active_recruiters: '350+',
    placement_rate: '86%+',
    highest_package_lpa: 12.0,
    average_package_lpa: 4.2,
    placement_phone: '9110969068',
    placement_email: 'info@rvscet.com',
    data_source: 'OFFICIAL PUBLIC DATA (rvscollege.ac.in)'
  };

  store.placements = store.placements || [
    {
      id: 1,
      company_name: 'Tata Steel Ltd.',
      job_role: 'Graduate Engineer Trainee (GET)',
      package_lpa: 8.5,
      drive_date: '2026-04-05',
      eligibility_cgpa: 7.0,
      eligible_departments: 'CSE, ME, EEE, CE',
      location: 'Jamshedpur / Kalinganagar',
      status: 'Upcoming',
      applied_count: 42,
      selected_count: 0,
      is_demo: true,
      data_source: 'DEMO DATA - RVS SIMULATION'
    },
    {
      id: 2,
      company_name: 'Tata Consultancy Services (TCS)',
      job_role: 'System Engineer & Digital Specialist',
      package_lpa: 7.2,
      drive_date: '2026-03-28',
      eligibility_cgpa: 6.5,
      eligible_departments: 'CSE, ECE, EEE, MCA',
      location: 'Pan-India',
      status: 'In Progress',
      applied_count: 68,
      selected_count: 14,
      is_demo: true,
      data_source: 'DEMO DATA - RVS SIMULATION'
    },
    {
      id: 3,
      company_name: 'Vedanta Resources',
      job_role: 'Operations & Maintenance Engineer',
      package_lpa: 9.0,
      drive_date: '2026-04-20',
      eligibility_cgpa: 7.0,
      eligible_departments: 'ME, EEE, CE',
      location: 'Bokaro / Jharsuguda',
      status: 'Upcoming',
      applied_count: 31,
      selected_count: 0,
      is_demo: true,
      data_source: 'DEMO DATA - RVS SIMULATION'
    },
    {
      id: 4,
      company_name: 'Capgemini India',
      job_role: 'Senior Software Analyst',
      package_lpa: 6.8,
      drive_date: '2026-02-18',
      eligibility_cgpa: 6.0,
      eligible_departments: 'CSE, ECE, MCA',
      location: 'Kolkata / Bengaluru',
      status: 'Completed',
      applied_count: 55,
      selected_count: 18,
      is_demo: true,
      data_source: 'DEMO DATA - RVS SIMULATION'
    }
  ];

  (store.placements || []).forEach(d => {
    d.data_source = d.data_source || 'DEMO DATA - RVS SIMULATION';
    d.is_demo = true;
  });

  // 9. Save the upgraded store

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
  console.log('✅ [RVS Migration] Successfully updated RVS College of Engineering & Technology verified records, programs, and phone numbers.');
  return store;
}

if (require.main === module) {
  runRvsMigration();
}

module.exports = { runRvsMigration };
