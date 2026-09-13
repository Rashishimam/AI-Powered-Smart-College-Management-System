const fs = require('fs');
const path = require('path');

const storePath = path.join(__dirname, '../../data/campusiq_store.json');
const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));

console.log('Seeding Phase 4: Labs & Inventory, Maintenance, and Faculty Substitution...');

// 1. Lab Equipment & Assets
store.lab_inventory = store.lab_inventory || [
  {
    id: 1,
    asset_id: 'RVS-LAB-CSE-001',
    equipment_name: 'Dell OptiPlex 7090 Tower Workstation (Core i7, 32GB RAM, 1TB SSD)',
    category: 'Computers',
    department_code: 'CSE',
    laboratory: 'Advanced Computing & AI Lab (Room 301)',
    location: 'Academic Block B, 3rd Floor',
    quantity: 30,
    condition: 'Excellent',
    purchase_date: '2024-03-15',
    assigned_person: 'Prof. Jeevan Kumar (HOD CSE)',
    status: 'AVAILABLE',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    asset_id: 'RVS-LAB-CSE-002',
    equipment_name: 'Cisco Catalyst 3850 Series 48-Port PoE+ Managed Switch',
    category: 'Lab Equipment',
    department_code: 'CSE',
    laboratory: 'Networking & Telecommunications Lab (Room 304)',
    location: 'Academic Block B, 3rd Floor',
    quantity: 4,
    condition: 'Good',
    purchase_date: '2023-11-20',
    assigned_person: 'Prof. Amit Ranjan',
    status: 'IN USE',
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    asset_id: 'RVS-LAB-CSE-003',
    equipment_name: 'Epson EB-2250U Full HD 5000 Lumens Overhead Projector',
    category: 'Projectors',
    department_code: 'CSE',
    laboratory: 'Seminar Hall 1',
    location: 'Academic Block A, 1st Floor',
    quantity: 1,
    condition: 'Needs Service',
    purchase_date: '2023-05-10',
    assigned_person: 'Campus AV Maintenance Cell',
    status: 'UNDER MAINTENANCE',
    created_at: new Date().toISOString()
  },
  {
    id: 4,
    asset_id: 'RVS-LAB-ECE-012',
    equipment_name: 'Tektronix TBS1102B Digital Storage Oscilloscope (100 MHz, 2 GS/s)',
    category: 'Electrical equipment',
    department_code: 'ECE',
    laboratory: 'Digital Signal Processing & Microprocessor Lab',
    location: 'Academic Block C, 2nd Floor',
    quantity: 15,
    condition: 'Excellent',
    purchase_date: '2024-01-12',
    assigned_person: 'Dr. Smita Dash',
    status: 'AVAILABLE',
    created_at: new Date().toISOString()
  }
];

// 2. Asset Maintenance Records
store.asset_maintenance = store.asset_maintenance || [
  {
    id: 1,
    asset_id: 'RVS-LAB-CSE-003',
    equipment_name: 'Epson EB-2250U Full HD Overhead Projector',
    category: 'Projectors',
    location: 'Seminar Hall 1',
    problem: 'Lamp flickering and periodic overheating shutdown after 20 minutes of operation.',
    reported_date: '2026-03-01',
    assigned_technician: 'Jharkhand AV Solutions & Service Co.',
    status: 'Under Repair',
    repair_date: null,
    cost: 4500,
    remarks: 'Replacement halogen lamp module ordered; scheduled for reinstallation by Friday.',
    created_at: '2026-03-01T10:00:00Z'
  },
  {
    id: 2,
    asset_id: 'RVS-LAB-CSE-001',
    equipment_name: 'Dell OptiPlex 7090 Workstation #08',
    category: 'Computers',
    location: 'Advanced Computing Lab',
    problem: 'Power supply unit (SMPS) failure following thunderstorm voltage surge.',
    reported_date: '2026-02-14',
    assigned_technician: 'Dell On-Site Support Engineer (Ashish Kumar)',
    status: 'Resolved',
    repair_date: '2026-02-16',
    cost: 0,
    remarks: 'SMPS replaced under Dell 3-Year Enterprise ProSupport warranty.',
    created_at: '2026-02-14T09:00:00Z'
  }
];

// 3. Equipment Issues Tracking
store.equipment_issues = store.equipment_issues || [
  {
    id: 1,
    asset_id: 'RVS-LAB-ECE-012',
    equipment_name: 'Tektronix Digital Storage Oscilloscope #04',
    issued_to_name: 'Rahul Kumar Verma',
    roll_no: '23RVSCSE042',
    purpose: 'Final Year Minor Project - IoT Sensor Signal Waveform Analysis',
    issue_date: '2026-02-28',
    due_date: '2026-03-07',
    return_date: '2026-03-06',
    status: 'Returned',
    condition_on_return: 'Excellent'
  }
];

// 4. Faculty Substitution History & Temporary Overrides
store.faculty_substitutions = store.faculty_substitutions || [
  {
    id: 1,
    date: '2026-03-05',
    department_code: 'CSE',
    semester: '6th Semester',
    class_period: 'Period 3 (11:30 AM - 12:30 PM)',
    subject_code: 'CS-601',
    subject_name: 'Compiler Design',
    original_faculty_id: 6,
    original_faculty_name: 'Prof. Jeevan Kumar',
    substitute_faculty_id: 12,
    substitute_faculty_name: 'Prof. Amit Ranjan',
    reason: 'Original faculty attending AICTE Faculty Development Programme (FDP)',
    status: 'Completed',
    notified_students: true,
    created_at: '2026-03-04T16:00:00Z'
  }
];

fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');
console.log('Phase 4 seeded successfully!');
