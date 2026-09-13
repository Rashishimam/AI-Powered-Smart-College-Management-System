const fs = require('fs');
const path = require('path');

const storePath = path.resolve(__dirname, '../../data/campusiq_store.json');
const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));

// 1. Seed Gate Logs
if (!store.gate_logs || store.gate_logs.length === 0) {
  store.gate_logs = [
    {
      id: 1,
      person_id: 8,
      person_name: 'Rahul Kumar Sharma',
      user_type: 'student',
      roll_or_emp_id: '2022/CSE/042',
      department: 'Computer Science & Engineering',
      date: '2026-09-11',
      entry_time: '08:45 AM',
      exit_time: null,
      gate: 'Main Gate 1',
      verification_method: 'Smart Card RFID',
      status: 'Inside Campus'
    },
    {
      id: 2,
      person_id: 9,
      person_name: 'Ananya Verma',
      user_type: 'student',
      roll_or_emp_id: '2022/CSE/015',
      department: 'Computer Science & Engineering',
      date: '2026-09-11',
      entry_time: '08:50 AM',
      exit_time: null,
      gate: 'Main Gate 1',
      verification_method: 'QR Code Scanner',
      status: 'Inside Campus'
    },
    {
      id: 3,
      person_id: 6,
      person_name: 'Dr. Vikram Sharma',
      user_type: 'faculty',
      roll_or_emp_id: 'EMP-CSE-001',
      department: 'Computer Science & Engineering',
      date: '2026-09-11',
      entry_time: '08:30 AM',
      exit_time: null,
      gate: 'Main Gate 1',
      verification_method: 'Biometric Gate',
      status: 'Inside Campus'
    },
    {
      id: 4,
      person_id: 10,
      person_name: 'Rohan Gupta',
      user_type: 'student',
      roll_or_emp_id: '2022/ECE/028',
      department: 'Electronics & Communication Engineering',
      date: '2026-09-11',
      entry_time: '09:15 AM',
      exit_time: '01:30 PM',
      gate: 'North Gate 2',
      verification_method: 'Smart Card RFID',
      status: 'Exited'
    }
  ];
  console.log('Seeded gate_logs');
}

// 2. Seed Visitors
if (!store.visitors || store.visitors.length === 0) {
  store.visitors = [
    {
      id: 1,
      pass_number: 'RVS-VIS-2026-001',
      visitor_name: 'Mr. Arvind Swaminathan',
      phone: '+91 98351 22410',
      company_or_org: 'Tata Consultancy Services (TCS Campus Hiring)',
      purpose: 'On-Campus Placement Coordination & Drive Review',
      person_to_meet: 'Prof. Vikram Sharma (Training & Placement Cell)',
      department_to_meet: 'Training & Placement',
      check_in: '2026-09-11T09:30:00.000Z',
      check_out: null,
      id_proof_type: 'Aadhaar Card',
      id_proof_number: 'XXXX-XXXX-4812',
      pass_status: 'Active',
      issued_by: 'Campus Security Desk 1'
    },
    {
      id: 2,
      pass_number: 'RVS-VIS-2026-002',
      visitor_name: 'Mrs. Sunita Pandey',
      phone: '+91 94311 88920',
      company_or_org: 'Parent / Guardian',
      purpose: 'Hostel Fee Clearance and Academic Mentorship Interaction',
      person_to_meet: 'Dr. Rajesh Gupta (HOD ECE)',
      department_to_meet: 'ECE Department',
      check_in: '2026-09-11T10:15:00.000Z',
      check_out: '2026-09-11T12:45:00.000Z',
      id_proof_type: 'Voter ID',
      id_proof_number: 'JH-8310-0941',
      pass_status: 'Checked Out',
      issued_by: 'Campus Security Desk 1'
    },
    {
      id: 3,
      pass_number: 'RVS-VIS-2026-003',
      visitor_name: 'Er. Sandeep Mukherjee',
      phone: '+91 99341 55678',
      company_or_org: 'Schneider Electric India',
      purpose: 'Guest Lecture on Industrial IoT & Automation',
      person_to_meet: 'Principal / Dean Academics',
      department_to_meet: 'Electrical & Electronics Engineering',
      check_in: '2026-09-11T11:00:00.000Z',
      check_out: null,
      id_proof_type: 'Company ID',
      id_proof_number: 'SEI-EMP-40192',
      pass_status: 'Active',
      issued_by: 'Main Gate Reception'
    }
  ];
  console.log('Seeded visitors');
}

// 3. Seed Facilities
if (!store.facilities || store.facilities.length === 0) {
  store.facilities = [
    {
      id: 1,
      code: 'AUD-01',
      name: 'Dr. A.P.J. Abdul Kalam Central Auditorium',
      facility_type: 'Auditorium',
      capacity: 800,
      location: 'Administrative Block - Level 1',
      amenities: ['Central Acoustic Sound System', 'Motorized Projector Screen', 'HVAC Air Conditioning', 'Stage Lighting Rig', 'Podium Mics'],
      status: 'AVAILABLE'
    },
    {
      id: 2,
      code: 'SEM-01',
      name: 'Sir J.C. Bose Seminar Hall',
      facility_type: 'Seminar Hall',
      capacity: 250,
      location: 'Science & Engineering Complex - Level 2',
      amenities: ['Dual HD Projectors', 'Wireless Lavalier Mics', 'Full AC', 'Tiered Ergonomic Seating'],
      status: 'AVAILABLE'
    },
    {
      id: 3,
      code: 'CONF-01',
      name: 'Executive Boardroom / Conference Hall',
      facility_type: 'Meeting Room',
      capacity: 40,
      location: 'Dean Secretariat - Level 3',
      amenities: ['4K Cisco Video Conferencing', 'Digital Interactive Whiteboard', 'Executive Leather Seats', 'Coffee Station'],
      status: 'AVAILABLE'
    },
    {
      id: 4,
      code: 'LAB-CCF',
      name: 'Central Computing Facility Lab 3',
      facility_type: 'Lab',
      capacity: 60,
      location: 'IT Tower - Level 1',
      amenities: ['60 i7 Workstations', 'Gigabit Fibre LAN', 'High-Lumen Projector', 'UPS Backup'],
      status: 'AVAILABLE'
    },
    {
      id: 5,
      code: 'SLH-104',
      name: 'Smart Lecture Hall 104',
      facility_type: 'Classroom',
      capacity: 75,
      location: 'Academic Wing B - Room 104',
      amenities: ['Interactive Smart Board', 'Classroom Audio PA', 'Dual Ceiling Fans + AC'],
      status: 'AVAILABLE'
    }
  ];
  console.log('Seeded facilities');
}

// 4. Seed Facility Bookings
if (!store.facility_bookings || store.facility_bookings.length === 0) {
  store.facility_bookings = [
    {
      id: 1,
      booking_reference: 'RVS-BK-2026-001',
      facility_id: 1,
      facility_name: 'Dr. A.P.J. Abdul Kalam Central Auditorium',
      facility_type: 'Auditorium',
      date: '2026-09-18',
      start_time: '10:00 AM',
      end_time: '04:00 PM',
      requested_by: 'Dr. Vikram Sharma',
      requested_by_role: 'faculty',
      department: 'Computer Science & Engineering',
      purpose: 'Annual RVSCET Hackathon & Tech Innovation Summit 2026',
      expected_attendees: 450,
      status: 'APPROVED',
      approved_by: 'College Administrator',
      remarks: 'Sanctioned. Tech support and stage setup allocated.',
      created_at: '2026-09-08T10:00:00.000Z'
    },
    {
      id: 2,
      booking_reference: 'RVS-BK-2026-002',
      facility_id: 2,
      facility_name: 'Sir J.C. Bose Seminar Hall',
      facility_type: 'Seminar Hall',
      date: '2026-09-15',
      start_time: '02:00 PM',
      end_time: '05:00 PM',
      requested_by: 'Prof. Amit Patel',
      requested_by_role: 'faculty',
      department: 'ECE Department',
      purpose: 'Workshop on Embedded Systems and VLSI Design with Cadence Tools',
      expected_attendees: 120,
      status: 'REQUESTED',
      approved_by: null,
      remarks: 'Pending HOD approval and AV team confirmation.',
      created_at: '2026-09-10T14:30:00.000Z'
    }
  ];
  console.log('Seeded facility_bookings');
}

fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');
console.log('Phase 5 seeding completed successfully.');
