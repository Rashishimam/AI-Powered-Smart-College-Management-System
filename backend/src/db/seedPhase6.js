const fs = require('fs');
const path = require('path');

const storePath = path.resolve(__dirname, '../../data/campusiq_store.json');
const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));

// 1. Hostel Configuration & Data
store.hostel_config = store.hostel_config || { enabled: true, total_buildings: 3 };
if (!store.hostel_buildings || store.hostel_buildings.length === 0) {
  store.hostel_buildings = [
    {
      id: 1,
      name: 'Vindhyachal Boys Hostel (Block A)',
      type: 'Boys',
      warden_name: 'Prof. S. K. Singh',
      warden_phone: '+91 94311 12345',
      total_floors: 3,
      total_rooms: 45,
      capacity_beds: 135
    },
    {
      id: 2,
      name: 'Aravalli Boys Hostel (Block B)',
      type: 'Boys',
      warden_name: 'Dr. P. K. Jha',
      warden_phone: '+91 94311 23456',
      total_floors: 3,
      total_rooms: 40,
      capacity_beds: 120
    },
    {
      id: 3,
      name: 'Kalpana Chawla Girls Hostel (Block C)',
      type: 'Girls',
      warden_name: 'Dr. Sunita Rao',
      warden_phone: '+91 94311 34567',
      total_floors: 4,
      total_rooms: 50,
      capacity_beds: 150
    }
  ];
  console.log('Seeded hostel_buildings');
}

if (!store.hostel_rooms || store.hostel_rooms.length === 0) {
  store.hostel_rooms = [
    { id: 1, building_id: 1, room_number: 'A-101', floor: '1st Floor', bed_capacity: 3, occupied_beds: 2, status: 'AVAILABLE', fee_per_semester: 32000 },
    { id: 2, building_id: 1, room_number: 'A-102', floor: '1st Floor', bed_capacity: 3, occupied_beds: 3, status: 'OCCUPIED', fee_per_semester: 32000 },
    { id: 3, building_id: 1, room_number: 'A-103', floor: '1st Floor', bed_capacity: 2, occupied_beds: 0, status: 'MAINTENANCE', fee_per_semester: 36000 },
    { id: 4, building_id: 3, room_number: 'C-201', floor: '2nd Floor', bed_capacity: 3, occupied_beds: 2, status: 'AVAILABLE', fee_per_semester: 32000 },
    { id: 5, building_id: 3, room_number: 'C-202', floor: '2nd Floor', bed_capacity: 2, occupied_beds: 2, status: 'OCCUPIED', fee_per_semester: 36000 }
  ];
  console.log('Seeded hostel_rooms');
}

if (!store.hostel_allocations || store.hostel_allocations.length === 0) {
  store.hostel_allocations = [
    {
      id: 1,
      student_id: 7,
      student_name: 'Rahul Kumar Verma',
      roll_no: '23RVSCSE007',
      department: 'CSE',
      building_name: 'Vindhyachal Boys Hostel (Block A)',
      room_number: 'A-101',
      bed_no: 'Bed-1',
      check_in_date: '2025-07-20',
      check_out_date: null,
      fee_status: 'PAID',
      status: 'Active'
    }
  ];
  console.log('Seeded hostel_allocations');
}

if (!store.hostel_complaints || store.hostel_complaints.length === 0) {
  store.hostel_complaints = [
    {
      id: 1,
      student_name: 'Rahul Kumar Verma',
      room_number: 'A-101',
      category: 'Electrical / Fan Regulator',
      description: 'Ceiling fan regulator sparking on switch speed 3.',
      status: 'RESOLVED',
      filed_date: '2026-08-25',
      resolved_date: '2026-08-26'
    }
  ];
  console.log('Seeded hostel_complaints');
}

// 2. Transport Configuration & Data
store.transport_config = store.transport_config || { enabled: true, fleet_size: 6 };
if (!store.transport_routes || store.transport_routes.length === 0) {
  store.transport_routes = [
    {
      id: 1,
      route_name: 'Route 1: Sakchi - Mango - Campus',
      bus_number: 'JH-05-AW-4011 (Bus #1)',
      driver_name: 'Rameshwar Mahato',
      driver_phone: '+91 94311 67890',
      seating_capacity: 52,
      allocated_students: 44,
      stops: [
        { name: 'Sakchi Bus Terminus', time: '07:45 AM' },
        { name: 'Mango Chowk / Dimna Road', time: '08:05 AM' },
        { name: 'Pardi Flyover Stop', time: '08:20 AM' },
        { name: 'Bhilai Pahari Chowk', time: '08:35 AM' },
        { name: 'RVSCET Main Campus', time: '08:45 AM' }
      ]
    },
    {
      id: 2,
      route_name: 'Route 2: Bistupur - Kadma - Sonari - Campus',
      bus_number: 'JH-05-BZ-8920 (Bus #2)',
      driver_name: 'Balwinder Singh',
      driver_phone: '+91 94311 78901',
      seating_capacity: 52,
      allocated_students: 48,
      stops: [
        { name: 'Bistupur Postal Park', time: '07:35 AM' },
        { name: 'Kadma Market', time: '07:50 AM' },
        { name: 'Sonari Kagalnagar', time: '08:05 AM' },
        { name: 'Marine Drive Road', time: '08:20 AM' },
        { name: 'RVSCET Main Campus', time: '08:45 AM' }
      ]
    },
    {
      id: 3,
      route_name: 'Route 3: Telco - Golmuri - Baridih - Campus',
      bus_number: 'JH-05-CX-1205 (Bus #3)',
      driver_name: 'Sudhir Kumar',
      driver_phone: '+91 94311 89012',
      seating_capacity: 52,
      allocated_students: 40,
      stops: [
        { name: 'Telco Colony Plaza', time: '07:40 AM' },
        { name: 'Golmuri Market', time: '07:55 AM' },
        { name: 'Baridih Chowk', time: '08:10 AM' },
        { name: 'RVSCET Main Campus', time: '08:45 AM' }
      ]
    }
  ];
  console.log('Seeded transport_routes');
}

// 3. Alumni Registry
if (!store.alumni_records || store.alumni_records.length === 0) {
  store.alumni_records = [
    {
      id: 1,
      student_id: 201,
      name: 'Sourabh Sengupta',
      graduation_year: 2023,
      course: 'B.Tech Computer Science & Engineering',
      department: 'Computer Science & Engineering',
      batch: '2019-2023',
      current_organization: 'Tata Consultancy Services (TCS)',
      job_title: 'Senior Systems Engineer',
      higher_studies: 'Executive M.Tech in AI (IIT Kharagpur)',
      achievements: 'Hackathon Winner 2022, Lead Developer of JUT Student Portal',
      is_public: true,
      email: 'sourabh.sengupta@alumni.rvscet.ac.in',
      linkedin: 'https://linkedin.com/in/sourabh-sengupta-demo'
    },
    {
      id: 2,
      student_id: 202,
      name: 'Pooja Kashyap',
      graduation_year: 2024,
      course: 'B.Tech Electronics & Communication',
      department: 'Electronics & Communication',
      batch: '2020-2024',
      current_organization: 'Schneider Electric India',
      job_title: 'Hardware Embedded Engineer',
      higher_studies: 'MS Robotics & Automation (Pursuing)',
      achievements: 'Best Final Year Project Award, IEEE Student Branch Secretary',
      is_public: true,
      email: 'pooja.kashyap@alumni.rvscet.ac.in',
      linkedin: 'https://linkedin.com/in/pooja-kashyap-demo'
    },
    {
      id: 3,
      student_id: 203,
      name: 'Abhishek Anand',
      graduation_year: 2022,
      course: 'B.Tech Mechanical Engineering',
      department: 'Mechanical Engineering',
      batch: '2018-2022',
      current_organization: 'Tata Steel Limited',
      job_title: 'Assistant Manager (Blast Furnace Operations)',
      higher_studies: 'Certified Lean Six Sigma Black Belt',
      achievements: 'College Gold Medalist in Academic Excellence 2022',
      is_public: true,
      email: 'abhishek.anand@alumni.rvscet.ac.in',
      linkedin: 'https://linkedin.com/in/abhishek-anand-demo'
    }
  ];
  console.log('Seeded alumni_records');
}

// 4. Helpdesk Tickets
if (!store.helpdesk_tickets || store.helpdesk_tickets.length === 0) {
  store.helpdesk_tickets = [
    {
      id: 1,
      ticket_number: 'RVS-TKT-2026-001',
      user_id: 7,
      user_name: 'Rahul Kumar Verma',
      user_role: 'student',
      category: 'Academic',
      subject: 'Correction in Internal Assessment Mid-Sem Marks Sheet',
      description: 'Mid-Sem score for CS601 Cloud Computing shows 24/30 instead of 28/30 as checked by professor.',
      assigned_staff: 'Prof. Priya Sen (CSE Faculty Advisor)',
      status: 'IN PROGRESS',
      created_date: '2026-09-09',
      resolution: null
    },
    {
      id: 2,
      ticket_number: 'RVS-TKT-2026-002',
      user_id: 8,
      user_name: 'Sneha Kumari',
      user_role: 'student',
      category: 'IT / Wi-Fi',
      subject: 'Hostel Wi-Fi MAC Address Registration for Laptop',
      description: 'Requesting MAC whitelist approval for new Dell laptop on campus academic Wi-Fi network.',
      assigned_staff: 'Er. Sandeep Mukherjee (Network Admin)',
      status: 'RESOLVED',
      created_date: '2026-09-08',
      resolution: 'MAC address added to firewall captive portal. Access enabled.'
    }
  ];
  console.log('Seeded helpdesk_tickets');
}

// 5. Student Feedback Surveys
if (!store.feedback_surveys || store.feedback_surveys.length === 0) {
  store.feedback_surveys = [
    {
      id: 1,
      title: 'Faculty Teaching Effectiveness & Course Delivery Feedback (Sem 6)',
      category: 'Faculty Feedback',
      target_department: 'Computer Science & Engineering',
      target_semester: '6th Semester',
      is_anonymous: true,
      start_date: '2026-09-01',
      end_date: '2026-09-30',
      status: 'ACTIVE',
      questions: [
        { id: 1, text: 'The faculty explains complex concepts with clarity and real-world examples.', type: 'rating_1_5' },
        { id: 2, text: 'Punctuality and regularity of classes conducted by faculty.', type: 'rating_1_5' },
        { id: 3, text: 'Availability and accessibility of faculty for doubts and academic guidance.', type: 'rating_1_5' },
        { id: 4, text: 'Course syllabus completion and clarity of lab practical sessions.', type: 'rating_1_5' }
      ]
    },
    {
      id: 2,
      title: 'Institutional Infrastructure, Library & Lab Facilities Survey 2026',
      category: 'Facility Feedback',
      target_department: 'ALL',
      target_semester: 'ALL',
      is_anonymous: true,
      start_date: '2026-09-05',
      end_date: '2026-10-15',
      status: 'ACTIVE',
      questions: [
        { id: 1, text: 'Quality of computing equipment and software in the laboratories.', type: 'rating_1_5' },
        { id: 2, text: 'Availability of reference textbooks and IEEE digital journals in Central Library.', type: 'rating_1_5' },
        { id: 3, text: 'Cleanliness and maintenance of classrooms and campus facilities.', type: 'rating_1_5' }
      ]
    }
  ];
  console.log('Seeded feedback_surveys');
}

if (!store.feedback_responses || store.feedback_responses.length === 0) {
  store.feedback_responses = [
    {
      id: 1,
      survey_id: 1,
      // Strictly NO student identifiable personal data stored for anonymous surveys!
      ratings: { 1: 5, 2: 5, 3: 4, 4: 5 },
      comments: 'Excellent delivery of Cloud Computing concepts and hands-on AWS lab guidance.',
      submitted_at: '2026-09-10T11:20:00.000Z'
    },
    {
      id: 2,
      survey_id: 1,
      ratings: { 1: 4, 2: 4, 3: 5, 4: 4 },
      comments: 'Regular assignments and good interaction during tutorial classes.',
      submitted_at: '2026-09-10T14:10:00.000Z'
    }
  ];
  console.log('Seeded feedback_responses');
}

// 6. Student Promotion Engine Configuration
store.promotion_config = store.promotion_config || {
  max_active_backlogs_allowed: 3,
  min_attendance_pct: 75.0,
  min_cgpa: 5.0,
  require_fee_clearance: false,
  auto_archive_graduated: true
};

store.promotion_history = store.promotion_history || [
  {
    id: 1,
    batch: '2022-2026',
    department: 'CSE',
    from_semester: '5th Semester',
    to_semester: '6th Semester',
    total_eligible: 58,
    promoted_count: 55,
    held_back_count: 3,
    promoted_by: 'Academic Council / Admin',
    date: '2026-01-15'
  }
];

fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');
console.log('Phase 6 seeding completed successfully.');
