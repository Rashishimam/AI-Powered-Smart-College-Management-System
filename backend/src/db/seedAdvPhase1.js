const fs = require('fs');
const path = require('path');

const storePath = path.resolve(__dirname, '../../data/campusiq_store.json');
const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));

// 1. Academic Sessions
if (!store.academic_sessions || store.academic_sessions.length === 0) {
  store.academic_sessions = [
    {
      id: 1,
      session_code: '2024-25',
      name: 'Academic Session 2024-2025',
      start_date: '2024-07-01',
      end_date: '2025-06-30',
      is_current: false,
      status: 'Archived',
      odd_sem_start: '2024-07-15',
      even_sem_start: '2025-01-10'
    },
    {
      id: 2,
      session_code: '2025-26',
      name: 'Academic Session 2025-2026',
      start_date: '2025-07-01',
      end_date: '2026-06-30',
      is_current: true,
      status: 'Active',
      odd_sem_start: '2025-07-15',
      even_sem_start: '2026-01-12'
    },
    {
      id: 3,
      session_code: '2026-27',
      name: 'Academic Session 2026-2027',
      start_date: '2026-07-01',
      end_date: '2027-06-30',
      is_current: false,
      status: 'Upcoming',
      odd_sem_start: '2026-07-20',
      even_sem_start: '2027-01-15'
    }
  ];
  console.log('Seeded academic_sessions');
}

// 2. Mentor-Mentee Assignments & Meetings
if (!store.mentor_assignments || store.mentor_assignments.length === 0) {
  store.mentor_assignments = [
    {
      id: 1,
      mentor_id: 6, // Prof. Jeevan Kumar
      mentor_name: 'Prof. Jeevan Kumar',
      mentor_department: 'Computer Science & Engineering',
      student_id: 7, // Rahul Kumar Verma
      student_name: 'Rahul Kumar Verma',
      roll_no: '23RVSCSE007',
      department: 'Computer Science & Engineering',
      semester: '6th Semester',
      assigned_date: '2025-07-20',
      status: 'Active',
      meetings: [
        {
          id: 1,
          date: '2026-08-14',
          meeting_type: 'One-on-One Academic Mentoring',
          topic: 'Mid-Semester Preparation & Backlog Clearance Strategy',
          notes: 'Student demonstrated strong grasp in Cloud Computing; advised to allocate 2 additional hours weekly for Advanced Algorithms practice.',
          is_private: true, // Only faculty mentor & HOD can see private notes
          follow_up_date: '2026-09-25',
          status: 'Completed'
        },
        {
          id: 2,
          date: '2026-09-02',
          meeting_type: 'Career & Placement Guidance',
          topic: 'TCS & Schneider Electric On-Campus Drive Eligibility',
          notes: 'Reviewed resume. Guided on System Design fundamentals. Verified active backlog is 0, making him fully eligible for Tier-1 placements.',
          is_private: true,
          follow_up_date: '2026-10-05',
          status: 'Scheduled'
        }
      ]
    },
    {
      id: 2,
      mentor_id: 6,
      mentor_name: 'Prof. Jeevan Kumar',
      mentor_department: 'Computer Science & Engineering',
      student_id: 4, // Vikramaditya
      student_name: 'Vikramaditya Kumar Singh',
      roll_no: '23RVSCSE004',
      department: 'Computer Science & Engineering',
      semester: '6th Semester',
      assigned_date: '2025-07-20',
      status: 'Active',
      meetings: [
        {
          id: 3,
          date: '2026-08-20',
          meeting_type: 'Attendance Review',
          topic: 'Lecture Regularity and Lab Participation',
          notes: 'Attendance is above 88%. Encouraged to take leading role in departmental hackathon project.',
          is_private: true,
          follow_up_date: '2026-09-30',
          status: 'Completed'
        }
      ]
    }
  ];
  console.log('Seeded mentor_assignments');
}

// 3. Syllabus & Lesson Plan Tracker
if (!store.syllabus_trackers || store.syllabus_trackers.length === 0) {
  store.syllabus_trackers = [
    {
      id: 1,
      subject_code: 'CS601',
      subject_name: 'Cloud Computing & Virtualization',
      department: 'CSE',
      semester: '6th Semester',
      faculty_name: 'Prof. Jeevan Kumar',
      total_units: 5,
      units: [
        {
          unit_number: 1,
          title: 'Unit 1: Introduction to Distributed Systems and Cloud Architecture',
          planned_classes: 8,
          topics: [
            { id: 101, name: 'Cloud Computing Overview, NIST Definition and Service Models (IaaS, PaaS, SaaS)', planned_date: '2026-07-22', completion_date: '2026-07-22', status: 'COMPLETED' },
            { id: 102, name: 'Virtualization Principles: Hypervisors Type 1 & 2, KVM Architecture', planned_date: '2026-07-25', completion_date: '2026-07-26', status: 'COMPLETED' },
            { id: 103, name: 'Containerization Fundamentals with Docker and Microservices', planned_date: '2026-07-29', completion_date: '2026-07-29', status: 'COMPLETED' }
          ]
        },
        {
          unit_number: 2,
          title: 'Unit 2: Cloud Storage and Resource Management',
          planned_classes: 9,
          topics: [
            { id: 201, name: 'Distributed File Systems: GFS and HDFS Storage Frameworks', planned_date: '2026-08-05', completion_date: '2026-08-06', status: 'COMPLETED' },
            { id: 202, name: 'Elastic Cloud Compute: Auto-scaling and Load Balancing algorithms', planned_date: '2026-08-12', completion_date: '2026-08-14', status: 'COMPLETED' },
            { id: 203, name: 'Cloud Object Storage and AWS S3 Lifecycle Management', planned_date: '2026-08-20', completion_date: '2026-08-22', status: 'COMPLETED' }
          ]
        },
        {
          unit_number: 3,
          title: 'Unit 3: Cloud Security and Identity Federation',
          planned_classes: 8,
          topics: [
            { id: 301, name: 'IAM Security, Multi-Factor Authentication and OAuth 2.0 Integration', planned_date: '2026-09-02', completion_date: '2026-09-04', status: 'COMPLETED' },
            { id: 302, name: 'Zero-Trust Architecture and Data Encryption at Rest & in Transit', planned_date: '2026-09-12', completion_date: null, status: 'IN PROGRESS' },
            { id: 303, name: 'Compliance and Disaster Recovery in Cloud Environments', planned_date: '2026-09-20', completion_date: null, status: 'NOT STARTED' }
          ]
        },
        {
          unit_number: 4,
          title: 'Unit 4: Serverless Computing & DevOps',
          planned_classes: 7,
          topics: [
            { id: 401, name: 'Function as a Service (FaaS) and AWS Lambda Execution Model', planned_date: '2026-09-28', completion_date: null, status: 'NOT STARTED' },
            { id: 402, name: 'CI/CD Pipelines on Cloud with GitHub Actions and Terraform IaC', planned_date: '2026-10-06', completion_date: null, status: 'NOT STARTED' }
          ]
        },
        {
          unit_number: 5,
          title: 'Unit 5: Edge Computing & Emerging Paradigms',
          planned_classes: 6,
          topics: [
            { id: 501, name: 'Fog and Edge Computing Latency Benchmarks', planned_date: '2026-10-15', completion_date: null, status: 'NOT STARTED' },
            { id: 502, name: 'Green Cloud Computing & Energy Efficiency in Hyperscale Data Centers', planned_date: '2026-10-22', completion_date: null, status: 'NOT STARTED' }
          ]
        }
      ]
    },
    {
      id: 2,
      subject_code: 'CS602',
      subject_name: 'Compiler Design & Optimization',
      department: 'CSE',
      semester: '6th Semester',
      faculty_name: 'Dr. Vikram Sharma',
      total_units: 5,
      units: [
        {
          unit_number: 1,
          title: 'Unit 1: Lexical Analysis and Finite Automata',
          planned_classes: 8,
          topics: [
            { id: 601, name: 'Role of Lexical Analyzer, Regular Expressions and Lex tools', planned_date: '2026-07-24', completion_date: '2026-07-24', status: 'COMPLETED' },
            { id: 602, name: 'Conversion of NFA to DFA and Minimization algorithms', planned_date: '2026-07-28', completion_date: '2026-07-29', status: 'COMPLETED' }
          ]
        },
        {
          unit_number: 2,
          title: 'Unit 2: Syntax Analysis and Parsing Techniques',
          planned_classes: 10,
          topics: [
            { id: 701, name: 'Context-Free Grammars, Ambiguity and First & Follow sets', planned_date: '2026-08-08', completion_date: '2026-08-09', status: 'COMPLETED' },
            { id: 702, name: 'Top-Down Parsing: LL(1) Parsers and Recursive Descent Parsing', planned_date: '2026-08-18', completion_date: '2026-08-20', status: 'COMPLETED' },
            { id: 703, name: 'Bottom-Up Parsing: SLR(1), CLR(1), LALR(1) Parsing and Yacc tools', planned_date: '2026-09-05', completion_date: null, status: 'IN PROGRESS' }
          ]
        }
      ]
    }
  ];
  console.log('Seeded syllabus_trackers');
}

// 4. Faculty Workload Configuration
store.faculty_workload_config = store.faculty_workload_config || {
  max_weekly_teaching_hours: 18,
  max_lab_hours: 6,
  max_mentees: 30,
  alert_on_overload: true
};

fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');
console.log('Phase 1 Advanced Data Seeding Completed Successfully.');
