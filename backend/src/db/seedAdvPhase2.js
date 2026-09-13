/**
 * seedAdvPhase2.js
 * Seeds Phase 2 data into campusiq_store.json:
 * - projects (Final Year Projects with student groups, guides, abstract, reviews)
 * - internships (Student internships, offer letters, completion certificates, verification logs)
 * - trainings (Campus placement trainings, attendance, trainers, batches)
 */

const fs = require('fs');
const path = require('path');

const storePath = path.resolve(__dirname, '../../data/campusiq_store.json');
const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));

// 1. Final Year Projects & Reviews
store.projects = [
  {
    id: 1,
    title: 'Autonomous Campus Electric Shuttle Navigation System',
    category: 'Industry Sponsored / Capstone',
    department: 'CSE',
    academic_session: '2025-26',
    abstract: 'Design and prototype an automated guided vehicle (AGV) using LiDAR SLAM, ROS2, and edge AI vision for intra-campus passenger commute at RVSCET.',
    technologies: ['ROS2', 'Python', 'OpenCV', 'LiDAR SLAM', 'TensorFlow Lite'],
    group_name: 'Team RoboVoyager',
    guide_id: 6,
    guide_name: 'Dr. Vikramaditya Sharma',
    co_guide_name: 'Prof. Ananya Sen',
    leader_student_id: 2,
    leader_student_name: 'Aarav Sharma',
    members: [
      { student_id: 2, name: 'Aarav Sharma', roll_no: '23RVSCSE002', role: 'Team Leader' },
      { student_id: 3, name: 'Priya Mukherjee', roll_no: '23RVSCSE003', role: 'ML Engineer' },
      { student_id: 4, name: 'Rohan Gupta', roll_no: '23RVSCSE004', role: 'Hardware & Sensors' }
    ],
    status: 'REVIEW 1',
    documents: [
      { name: 'Project_Proposal_SRS.pdf', url: '/uploads/projects/proposal_shuttle.pdf', uploaded_at: '2025-09-01' },
      { name: 'System_Architecture_v1.pdf', url: '/uploads/projects/arch_shuttle.pdf', uploaded_at: '2025-09-10' }
    ],
    reviews: [
      {
        id: 1,
        review_number: 'Review 1 (SRS & Feasibility)',
        scheduled_date: '2025-09-15',
        panel: ['Dr. Vikramaditya Sharma', 'Dr. Rajesh Kumar', 'Prof. Priya Sen'],
        status: 'Completed',
        criteria: {
          problem_definition: 19,
          technical_progress: 18,
          implementation: 26,
          documentation: 14,
          presentation: 14
        },
        max_marks: 100,
        total_marks: 91,
        comments: 'Excellent demonstration of ROS2 stack and sensor integration. Proceed to vehicle hardware testing for Review 2.'
      },
      {
        id: 2,
        review_number: 'Review 2 (Prototype & Midterm)',
        scheduled_date: '2025-11-20',
        panel: ['Dr. Vikramaditya Sharma', 'Prof. Ananya Sen'],
        status: 'Scheduled',
        criteria: {},
        max_marks: 100,
        total_marks: null,
        comments: 'Pending prototype delivery.'
      }
    ],
    created_at: '2025-08-15'
  },
  {
    id: 2,
    title: 'Blockchain-Based Tamper-Proof Degree & Marksheet Verification System',
    category: 'Research & Development',
    department: 'CSE',
    academic_session: '2025-26',
    abstract: 'A decentralized, cryptographic credential verification ledger allowing recruiters and universities to verify RVSCET degrees instantaneously via Ethereum smart contracts.',
    technologies: ['Solidity', 'Ethereum', 'Node.js', 'Web3.js', 'React'],
    group_name: 'CipherTrust',
    guide_id: 6,
    guide_name: 'Dr. Vikramaditya Sharma',
    co_guide_name: 'Dr. Rajesh Kumar',
    leader_student_id: 5,
    leader_student_name: 'Sneha Patel',
    members: [
      { student_id: 5, name: 'Sneha Patel', roll_no: '23RVSCSE005', role: 'Smart Contract Developer' },
      { student_id: 8, name: 'Amit Kumar Singh', roll_no: '23RVSCSE008', role: 'Frontend & Web3' }
    ],
    status: 'IN PROGRESS',
    documents: [
      { name: 'SmartContract_Specs.pdf', url: '/uploads/projects/specs_ciphertrust.pdf', uploaded_at: '2025-09-05' }
    ],
    reviews: [
      {
        id: 1,
        review_number: 'Review 1 (Concept & Architecture)',
        scheduled_date: '2025-09-18',
        panel: ['Dr. Vikramaditya Sharma', 'Prof. Neha Gupta'],
        status: 'Scheduled',
        criteria: {},
        max_marks: 100,
        total_marks: null,
        comments: 'Awaiting scheduled review presentation.'
      }
    ],
    created_at: '2025-08-20'
  }
];

// 2. Student Internships
store.internships = [
  {
    id: 1,
    student_id: 2,
    student_name: 'Aarav Sharma',
    roll_no: '23RVSCSE002',
    department: 'CSE',
    company: 'Tata Steel Jamshedpur',
    role: 'Industrial IoT & Automation Intern',
    internship_type: 'Industrial Training',
    mode: 'In-Office',
    start_date: '2025-06-01',
    end_date: '2025-07-31',
    stipend_amount: '₹ 18,000 / month',
    description: 'Worked on predictive maintenance algorithms for hot strip mill motors utilizing MQTT telemetry and vibration analysis.',
    offer_letter_url: '/uploads/internships/tatasteel_offer_aarav.pdf',
    completion_cert_url: '/uploads/internships/tatasteel_cert_aarav.pdf',
    status: 'APPROVED',
    verification_history: [
      {
        verified_by: 'Prof. Ananya Sen (T&P Officer)',
        role: 'faculty',
        date: '2025-08-05',
        action: 'APPROVED',
        remarks: 'Official verification email received from Tata Steel HR. 6 academic credits recommended.'
      }
    ],
    created_at: '2025-08-01'
  },
  {
    id: 2,
    student_id: 3,
    student_name: 'Priya Mukherjee',
    roll_no: '23RVSCSE003',
    department: 'CSE',
    company: 'Infosys Springboard',
    role: 'Cloud Engineering & DevOps Trainee',
    internship_type: 'Summer Internship',
    mode: 'Remote',
    start_date: '2025-06-15',
    end_date: '2025-08-15',
    stipend_amount: '₹ 15,000 / month',
    description: 'Built CI/CD automated pipelines on AWS ECS using GitHub Actions and Terraform.',
    offer_letter_url: '/uploads/internships/infosys_offer_priya.pdf',
    completion_cert_url: '/uploads/internships/infosys_cert_priya.pdf',
    status: 'APPROVED',
    verification_history: [
      {
        verified_by: 'Admin Office',
        role: 'college_admin',
        date: '2025-08-20',
        action: 'APPROVED',
        remarks: 'Digital certificate QR code validated successfully.'
      }
    ],
    created_at: '2025-08-18'
  },
  {
    id: 3,
    student_id: 4,
    student_name: 'Rohan Gupta',
    roll_no: '23RVSCSE004',
    department: 'CSE',
    company: 'Wipro Technologies',
    role: 'Cybersecurity Analyst Intern',
    internship_type: 'Industrial Training',
    mode: 'Hybrid',
    start_date: '2025-07-01',
    end_date: '2025-08-31',
    stipend_amount: '₹ 12,000 / month',
    description: 'Conducted vulnerability assessments and network intrusion logging.',
    offer_letter_url: '/uploads/internships/wipro_offer_rohan.pdf',
    completion_cert_url: null,
    status: 'UNDER REVIEW',
    verification_history: [
      {
        verified_by: 'Placement Office',
        role: 'college_admin',
        date: '2025-09-02',
        action: 'UNDER REVIEW',
        remarks: 'Awaiting submission of final completion certificate from employer.'
      }
    ],
    created_at: '2025-09-01'
  }
];

// 3. Training Sessions (Placement & Career Readiness)
store.trainings = [
  {
    id: 1,
    title: 'Advanced Data Structures & Competitive Coding Masterclass',
    training_type: 'Coding',
    trainer_name: 'Er. S. Chatterjee (Lead SDE, Ex-Amazon)',
    venue: 'Seminar Hall 1 & Online Hybrid',
    date: '2025-09-20',
    time: '10:00 AM - 01:00 PM',
    departments: ['CSE', 'ECE'],
    eligible_semesters: ['6th Semester', '8th Semester'],
    capacity: 120,
    registered_students: [
      { student_id: 2, name: 'Aarav Sharma', roll_no: '23RVSCSE002', registered_at: '2025-09-10', attended: true },
      { student_id: 3, name: 'Priya Mukherjee', roll_no: '23RVSCSE003', registered_at: '2025-09-10', attended: true },
      { student_id: 4, name: 'Rohan Gupta', roll_no: '23RVSCSE004', registered_at: '2025-09-11', attended: false }
    ],
    status: 'Upcoming',
    description: 'Hands-on problem solving on Dynamic Programming, Graph Algorithms, and Trie structures tailored for Tier-1 product tech interviews.'
  },
  {
    id: 2,
    title: 'Corporate Aptitude & Quantitative Reasoning Bootcamp',
    training_type: 'Aptitude',
    trainer_name: 'Prof. Rajesh Kumar & TIME Faculty',
    venue: 'Auditorium Block B',
    date: '2025-09-22',
    time: '02:00 PM - 05:00 PM',
    departments: ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE'],
    eligible_semesters: ['6th Semester', '8th Semester'],
    capacity: 250,
    registered_students: [
      { student_id: 2, name: 'Aarav Sharma', roll_no: '23RVSCSE002', registered_at: '2025-09-12', attended: false },
      { student_id: 5, name: 'Sneha Patel', roll_no: '23RVSCSE005', registered_at: '2025-09-12', attended: false }
    ],
    status: 'Upcoming',
    description: 'Speed math shortcuts, logical deductions, probability and data interpretation modules for mass recruitment screening rounds.'
  },
  {
    id: 3,
    title: 'Mock HR Interviews, Group Discussions & Soft Skills',
    training_type: 'Interview Preparation',
    trainer_name: 'Ms. Sunita Roy (Corporate HR Consultant)',
    venue: 'Conference Room, Admin Block',
    date: '2025-09-25',
    time: '11:00 AM - 04:00 PM',
    departments: ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE'],
    eligible_semesters: ['8th Semester'],
    capacity: 60,
    registered_students: [
      { student_id: 2, name: 'Aarav Sharma', roll_no: '23RVSCSE002', registered_at: '2025-09-13', attended: false }
    ],
    status: 'Upcoming',
    description: 'Personalized 1-on-1 mock interviews, body language coaching, behavioral questions (STAR technique), and video feedback.'
  }
];

fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');
console.log('✅ Phase 2 data seeded successfully into campusiq_store.json:');
console.log(`- Projects: ${store.projects.length}`);
console.log(`- Internships: ${store.internships.length}`);
console.log(`- Trainings: ${store.trainings.length}`);
