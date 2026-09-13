-- CampusIQ PostgreSQL Relational Database Schema

-- 1. Colleges Table (Multi-tenant)
CREATE TABLE IF NOT EXISTS colleges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table (RBAC: super_admin, college_admin, faculty, student)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    college_id INT REFERENCES colleges(id) ON DELETE SET NULL,
    department VARCHAR(100),
    phone VARCHAR(50),
    avatar VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    college_id INT REFERENCES colleges(id) ON DELETE CASCADE,
    faculty_id INT REFERENCES users(id) ON DELETE SET NULL,
    department VARCHAR(100) NOT NULL,
    credits INT DEFAULT 3,
    semester VARCHAR(50) DEFAULT 'Fall 2026',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Enrollments Table
CREATE TABLE IF NOT EXISTS enrollments (
    id SERIAL PRIMARY KEY,
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    grade VARCHAR(10) DEFAULT 'A-',
    attendance_pct NUMERIC(5, 2) DEFAULT 88.5,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_course_student UNIQUE(course_id, student_id)
);

-- 5. Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    college_id INT REFERENCES colleges(id) ON DELETE CASCADE,
    author_id INT REFERENCES users(id) ON DELETE SET NULL,
    target_role VARCHAR(50) DEFAULT 'all', -- 'all', 'faculty', 'student'
    priority VARCHAR(20) DEFAULT 'normal', -- 'normal', 'high', 'urgent'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_college ON users(college_id);
CREATE INDEX IF NOT EXISTS idx_courses_college ON courses(college_id);
CREATE INDEX IF NOT EXISTS idx_courses_faculty ON courses(faculty_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_announcements_college ON announcements(college_id);

-- 7. RVS Departments Table (CSE, CE, ME, ECE, EEE, MCA)
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    intake INT DEFAULT 60,
    hod VARCHAR(255),
    is_official BOOLEAN DEFAULT TRUE,
    data_source VARCHAR(50) DEFAULT 'OFFICIAL',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7b. RVS Academic Programs Table (Configurable duration, semesters, intake seats)
CREATE TABLE IF NOT EXISTS programs (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    degree VARCHAR(50) NOT NULL, -- B.Tech, M.Tech, BCA, MCA, BBA, Diploma
    department_code VARCHAR(20) REFERENCES departments(code) ON DELETE SET NULL,
    duration_years INT NOT NULL DEFAULT 4,
    semester_count INT NOT NULL DEFAULT 8,
    intake_seats INT NOT NULL DEFAULT 60,
    eligibility TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_official BOOLEAN DEFAULT TRUE,
    data_source VARCHAR(50) DEFAULT 'OFFICIAL', -- OFFICIAL, INTERNAL, DEMO
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- 8. Extended Student Profiles
CREATE TABLE IF NOT EXISTS students_profile (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    roll_no VARCHAR(50) UNIQUE NOT NULL,
    reg_no VARCHAR(50) UNIQUE NOT NULL,
    admission_no VARCHAR(50) UNIQUE,
    department_code VARCHAR(20) REFERENCES departments(code) ON DELETE SET NULL,
    course VARCHAR(100) DEFAULT 'B.Tech Computer Science & Engineering',
    semester VARCHAR(20) DEFAULT '6th Semester',
    batch VARCHAR(50) DEFAULT '2023-2027',
    session VARCHAR(50) DEFAULT '2025-2026',
    admission_year INT DEFAULT 2023,
    dob DATE,
    gender VARCHAR(20),
    address TEXT,
    guardian_name VARCHAR(255),
    mother_name VARCHAR(255),
    guardian_phone VARCHAR(50),
    guardian_email VARCHAR(255),
    guardian_address TEXT,
    promotion_history JSONB DEFAULT '[]',
    is_demo BOOLEAN DEFAULT FALSE,
    data_source VARCHAR(50) DEFAULT 'INTERNAL',
    status VARCHAR(20) DEFAULT 'active' -- active, inactive, graduated, archived
);

-- 8b. Student Promotion Logs
CREATE TABLE IF NOT EXISTS student_promotion_logs (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES users(id) ON DELETE CASCADE,
    from_semester VARCHAR(20) NOT NULL,
    to_semester VARCHAR(20) NOT NULL,
    from_session VARCHAR(50),
    to_session VARCHAR(50),
    promoted_by INT REFERENCES users(id) ON DELETE SET NULL,
    promoted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT
);


-- 9. Extended Faculty Profiles
CREATE TABLE IF NOT EXISTS faculty_profile (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(50) DEFAULT 'Prof.',
    department_code VARCHAR(20) REFERENCES departments(code) ON DELETE SET NULL,
    department_name VARCHAR(255),
    designation VARCHAR(150) DEFAULT 'Assistant Professor',
    qualification VARCHAR(255) DEFAULT 'M.Tech / Ph.D',
    specialization TEXT,
    research_area TEXT,
    publications TEXT,
    institutional_email VARCHAR(255),
    profile_photo VARCHAR(500) DEFAULT '/assets/faculty/placeholder-faculty.svg',
    public_profile BOOLEAN DEFAULT TRUE,
    source_url TEXT,
    all_departments TEXT,
    is_official BOOLEAN DEFAULT TRUE,
    last_verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    workload_hours INT DEFAULT 18
);

-- 10. Attendance Sessions & QR Check-in
CREATE TABLE IF NOT EXISTS attendance_sessions (
    id SERIAL PRIMARY KEY,
    faculty_id INT REFERENCES users(id) ON DELETE CASCADE,
    course_id INT REFERENCES courses(id) ON DELETE CASCADE,
    department_code VARCHAR(20),
    semester VARCHAR(20),
    date DATE DEFAULT CURRENT_DATE,
    qr_token VARCHAR(255) UNIQUE,
    qr_expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance_records (
    id SERIAL PRIMARY KEY,
    session_id INT REFERENCES attendance_sessions(id) ON DELETE SET NULL,
    student_id INT REFERENCES users(id) ON DELETE CASCADE,
    student_name VARCHAR(150),
    roll_no VARCHAR(50),
    course_id INT REFERENCES courses(id) ON DELETE SET NULL,
    subject_name VARCHAR(150),
    subject_code VARCHAR(50),
    faculty_id INT REFERENCES users(id) ON DELETE SET NULL,
    faculty_name VARCHAR(150),
    department_code VARCHAR(20),
    semester VARCHAR(20),
    attendance_date DATE DEFAULT CURRENT_DATE,
    day VARCHAR(20),
    class_period VARCHAR(50),
    start_time VARCHAR(20),
    end_time VARCHAR(20),
    status VARCHAR(20) DEFAULT 'Present', -- Present, Absent, Late, Excused
    method VARCHAR(20) DEFAULT 'Manual', -- Manual, QR
    remarks TEXT,
    marked_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10a. Faculty Attendance Records
CREATE TABLE IF NOT EXISTS faculty_attendance_records (
    id SERIAL PRIMARY KEY,
    faculty_id INT REFERENCES users(id) ON DELETE CASCADE,
    faculty_name VARCHAR(150) NOT NULL,
    department_code VARCHAR(50),
    attendance_date DATE NOT NULL,
    day VARCHAR(20) NOT NULL,
    check_in VARCHAR(20),
    check_out VARCHAR(20),
    working_minutes INT DEFAULT 0,
    working_hours VARCHAR(20) DEFAULT '0h 0m',
    status VARCHAR(20) NOT NULL, -- Present, Absent, Late, Half Day, On Leave
    leave_type VARCHAR(50),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_faculty_attendance_date UNIQUE(faculty_id, attendance_date)
);

-- 10b. Attendance Audit Logs (Non-destructive Correction Trail)
CREATE TABLE IF NOT EXISTS attendance_audit_logs (
    id SERIAL PRIMARY KEY,
    record_type VARCHAR(20) NOT NULL, -- 'student' or 'faculty'
    record_id INT NOT NULL,
    target_id INT NOT NULL,
    target_name VARCHAR(150) NOT NULL,
    subject_or_dept VARCHAR(100),
    attendance_date DATE NOT NULL,
    previous_status VARCHAR(50) NOT NULL,
    new_status VARCHAR(50) NOT NULL,
    reason TEXT NOT NULL,
    changed_by INT REFERENCES users(id) ON DELETE SET NULL,
    changed_by_name VARCHAR(150),
    changed_by_role VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Fees Structure & Ledger
CREATE TABLE IF NOT EXISTS fee_structures (
    id SERIAL PRIMARY KEY,
    course VARCHAR(100) NOT NULL,
    semester VARCHAR(50) NOT NULL,
    tuition_fee NUMERIC(10, 2) NOT NULL,
    exam_fee NUMERIC(10, 2) DEFAULT 2500,
    development_fee NUMERIC(10, 2) DEFAULT 5000,
    total_amount NUMERIC(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS student_fees (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES users(id) ON DELETE CASCADE,
    semester VARCHAR(50) NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    paid_amount NUMERIC(10, 2) DEFAULT 0,
    pending_amount NUMERIC(10, 2) NOT NULL,
    scholarship_discount NUMERIC(10, 2) DEFAULT 0,
    fine_amount NUMERIC(10, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Pending', -- Paid, Partial, Pending, Overdue
    due_date DATE,
    receipt_no VARCHAR(100) UNIQUE,
    payment_date TIMESTAMP WITH TIME ZONE
);

-- 12. Exams & Results
CREATE TABLE IF NOT EXISTS exams (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- Internal Exam, Mid Semester, Practical, End Semester
    course_id INT REFERENCES courses(id) ON DELETE CASCADE,
    department_code VARCHAR(20),
    semester VARCHAR(50),
    max_marks INT DEFAULT 100,
    exam_date DATE
);

CREATE TABLE IF NOT EXISTS exam_results (
    id SERIAL PRIMARY KEY,
    exam_id INT REFERENCES exams(id) ON DELETE CASCADE,
    student_id INT REFERENCES users(id) ON DELETE CASCADE,
    marks_obtained NUMERIC(5, 2) NOT NULL,
    max_marks INT DEFAULT 100,
    grade VARCHAR(10),
    sgpa NUMERIC(4, 2),
    pass_fail VARCHAR(10) DEFAULT 'Pass'
);

-- 13. Training & Placements
CREATE TABLE IF NOT EXISTS placements (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    job_role VARCHAR(255) NOT NULL,
    package_lpa NUMERIC(5, 2) NOT NULL,
    drive_date DATE,
    eligibility_cgpa NUMERIC(4, 2) DEFAULT 6.5,
    eligible_departments TEXT DEFAULT 'CSE,ECE,EE,ME,CE,MCA',
    status VARCHAR(50) DEFAULT 'Upcoming'
);

CREATE TABLE IF NOT EXISTS placement_applications (
    id SERIAL PRIMARY KEY,
    placement_id INT REFERENCES placements(id) ON DELETE CASCADE,
    student_id INT REFERENCES users(id) ON DELETE CASCADE,
    application_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'Applied' -- Applied, Shortlisted, Interview, Selected, Rejected
);

-- 14. Library Management
CREATE TABLE IF NOT EXISTS library_books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(50) UNIQUE,
    category VARCHAR(100),
    total_copies INT DEFAULT 5,
    available_copies INT DEFAULT 5
);

CREATE TABLE IF NOT EXISTS book_issues (
    id SERIAL PRIMARY KEY,
    book_id INT REFERENCES library_books(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    issue_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    return_date DATE,
    fine_amount NUMERIC(6, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Issued' -- Issued, Returned, Overdue
);

-- 15. Grievance Redressal & Leaves
CREATE TABLE IF NOT EXISTS grievances (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Open', -- Open, In Progress, Resolved
    admin_reply TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leaves (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending', -- Pending, Approved, Rejected
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. Timetables
CREATE TABLE IF NOT EXISTS timetables (
    id SERIAL PRIMARY KEY,
    department_code VARCHAR(20),
    semester VARCHAR(50),
    day VARCHAR(20) NOT NULL,
    start_time VARCHAR(20) NOT NULL,
    end_time VARCHAR(20) NOT NULL,
    subject_code VARCHAR(50) NOT NULL,
    subject_name VARCHAR(255) NOT NULL,
    faculty_name VARCHAR(255) NOT NULL,
    room_no VARCHAR(50) NOT NULL
);

-- =========================================================================
-- 17. PHASE 1: BACKLOGS, INTERNAL MARKS & STUDENT 360
-- =========================================================================
CREATE TABLE IF NOT EXISTS backlogs (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES users(id) ON DELETE CASCADE,
    roll_no VARCHAR(50) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    department VARCHAR(50),
    semester VARCHAR(50),
    subject_code VARCHAR(50) NOT NULL,
    subject_name VARCHAR(255) NOT NULL,
    credits INT DEFAULT 3,
    exam_session VARCHAR(50),
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, CLEARED
    cleared_session VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS internal_marks (
    id SERIAL PRIMARY KEY,
    department VARCHAR(50),
    semester VARCHAR(50),
    subject_code VARCHAR(50) NOT NULL,
    subject_name VARCHAR(255),
    faculty_id INT REFERENCES users(id) ON DELETE SET NULL,
    student_id INT REFERENCES users(id) ON DELETE CASCADE,
    roll_no VARCHAR(50) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    mid_term_1 NUMERIC(5, 2) DEFAULT 0,
    mid_term_2 NUMERIC(5, 2) DEFAULT 0,
    assignment_marks NUMERIC(5, 2) DEFAULT 0,
    attendance_marks NUMERIC(5, 2) DEFAULT 0,
    total_internal NUMERIC(5, 2) DEFAULT 0,
    max_marks INT DEFAULT 30,
    is_locked BOOLEAN DEFAULT FALSE,
    locked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- 18. PHASE 2: ADMIT CARDS & CERTIFICATES
-- =========================================================================
CREATE TABLE IF NOT EXISTS admit_cards (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES users(id) ON DELETE CASCADE,
    roll_no VARCHAR(50) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    exam_id INT REFERENCES exams(id) ON DELETE CASCADE,
    exam_name VARCHAR(255) NOT NULL,
    semester VARCHAR(50),
    academic_year VARCHAR(50),
    status VARCHAR(50) DEFAULT 'ELIGIBLE', -- ELIGIBLE, BARRED, ISSUED
    attendance_pct NUMERIC(5, 2) DEFAULT 80.0,
    fee_clearance BOOLEAN DEFAULT TRUE,
    override_reason TEXT,
    qr_token VARCHAR(255),
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS certificates (
    id SERIAL PRIMARY KEY,
    certificate_no VARCHAR(100) UNIQUE NOT NULL,
    certificate_type VARCHAR(100) NOT NULL,
    student_id INT REFERENCES users(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    roll_no VARCHAR(50) NOT NULL,
    department VARCHAR(50),
    issue_date DATE DEFAULT CURRENT_DATE,
    academic_year VARCHAR(50),
    cgpa NUMERIC(4, 2),
    status VARCHAR(50) DEFAULT 'VALID', -- VALID, REVOKED
    qr_verification_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- 19. PHASE 3: PLACEMENTS & DOCUMENT VERIFICATION
-- =========================================================================
CREATE TABLE IF NOT EXISTS student_documents (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES users(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL, -- 10th Marksheet, 12th Marksheet, Aadhaar, Caste, Migration
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size_kb INT,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, VERIFIED, REJECTED
    verification_remarks TEXT,
    verified_by INT REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- 20. PHASE 4: LABS, ASSETS & FACULTY SUBSTITUTION
-- =========================================================================
CREATE TABLE IF NOT EXISTS labs_inventory (
    id SERIAL PRIMARY KEY,
    equipment_name VARCHAR(255) NOT NULL,
    equipment_code VARCHAR(100) UNIQUE NOT NULL,
    department VARCHAR(50),
    lab_name VARCHAR(255),
    quantity INT DEFAULT 1,
    available_quantity INT DEFAULT 1,
    condition VARCHAR(50) DEFAULT 'WORKING', -- WORKING, MAINTENANCE, DECOMMISSIONED
    purchase_date DATE,
    cost NUMERIC(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS maintenance_tickets (
    id SERIAL PRIMARY KEY,
    equipment_id INT REFERENCES labs_inventory(id) ON DELETE CASCADE,
    equipment_name VARCHAR(255) NOT NULL,
    reported_by INT REFERENCES users(id) ON DELETE SET NULL,
    reported_by_name VARCHAR(255),
    issue_description TEXT NOT NULL,
    priority VARCHAR(50) DEFAULT 'NORMAL', -- LOW, NORMAL, URGENT
    status VARCHAR(50) DEFAULT 'OPEN', -- OPEN, IN_PROGRESS, RESOLVED
    resolution_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS faculty_substitutions (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    period VARCHAR(50) NOT NULL,
    original_faculty_id INT REFERENCES users(id) ON DELETE CASCADE,
    original_faculty_name VARCHAR(255) NOT NULL,
    substitute_faculty_id INT REFERENCES users(id) ON DELETE CASCADE,
    substitute_faculty_name VARCHAR(255) NOT NULL,
    department VARCHAR(50),
    subject_code VARCHAR(50),
    subject_name VARCHAR(255),
    room_number VARCHAR(50),
    reason TEXT,
    status VARCHAR(50) DEFAULT 'CONFIRMED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- 21. PHASE 5: GATE PASSES, VISITORS & FACILITY BOOKING
-- =========================================================================
CREATE TABLE IF NOT EXISTS gate_logs (
    id SERIAL PRIMARY KEY,
    pass_type VARCHAR(50) NOT NULL, -- STUDENT_OUT, STUDENT_IN, VISITOR_IN, VISITOR_OUT
    person_id INT REFERENCES users(id) ON DELETE SET NULL,
    person_name VARCHAR(255) NOT NULL,
    person_role VARCHAR(50),
    roll_or_phone VARCHAR(50),
    purpose TEXT,
    vehicle_no VARCHAR(50),
    gate_number VARCHAR(20) DEFAULT 'Gate 1 (Main Entrance)',
    security_guard_name VARCHAR(255),
    entry_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    exit_time TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS facility_bookings (
    id SERIAL PRIMARY KEY,
    facility_name VARCHAR(255) NOT NULL, -- Auditorium, Seminar Hall, Conference Room, Grounds
    requested_by INT REFERENCES users(id) ON DELETE CASCADE,
    requested_by_name VARCHAR(255) NOT NULL,
    event_name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    start_time VARCHAR(20) NOT NULL,
    end_time VARCHAR(20) NOT NULL,
    expected_attendees INT,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, CANCELLED
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- 22. PHASE 6: HOSTEL, TRANSPORT, ALUMNI & FEEDBACK
-- =========================================================================
CREATE TABLE IF NOT EXISTS hostel_rooms (
    id SERIAL PRIMARY KEY,
    block_name VARCHAR(100) NOT NULL, -- Aryabhatta Hostel, Kalpana Chawla Girls Hostel
    room_number VARCHAR(50) NOT NULL,
    capacity INT DEFAULT 3,
    occupied INT DEFAULT 0,
    ac_non_ac VARCHAR(20) DEFAULT 'Non-AC',
    status VARCHAR(50) DEFAULT 'AVAILABLE'
);

CREATE TABLE IF NOT EXISTS hostel_allocations (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES users(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    roll_no VARCHAR(50) NOT NULL,
    room_id INT REFERENCES hostel_rooms(id) ON DELETE CASCADE,
    allocated_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'ACTIVE'
);

CREATE TABLE IF NOT EXISTS transport_routes (
    id SERIAL PRIMARY KEY,
    route_number VARCHAR(50) NOT NULL,
    route_name VARCHAR(255) NOT NULL, -- Sakchi - Bistupur - Kadma - Campus
    bus_number VARCHAR(50) NOT NULL,
    driver_name VARCHAR(255),
    driver_phone VARCHAR(50),
    capacity INT DEFAULT 50,
    allocated_count INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS helpdesk_tickets (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL, -- IT Support, Library, Hostel, Academic, Accounts
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(50) DEFAULT 'NORMAL',
    status VARCHAR(50) DEFAULT 'OPEN', -- OPEN, IN_PROGRESS, RESOLVED, CLOSED
    resolution_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_feedback_surveys (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    academic_session VARCHAR(50),
    department VARCHAR(50),
    semester VARCHAR(50),
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, CLOSED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- 23. ADVANCED PHASE 1-4 MODULES
-- =========================================================================
CREATE TABLE IF NOT EXISTS academic_sessions (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL, -- 2025-2026
    name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'ACTIVE'
);

CREATE TABLE IF NOT EXISTS capstone_projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    domain VARCHAR(100),
    department VARCHAR(50),
    team_lead_id INT REFERENCES users(id) ON DELETE CASCADE,
    team_members JSONB DEFAULT '[]',
    guide_id INT REFERENCES users(id) ON DELETE SET NULL,
    guide_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'PROPOSED', -- PROPOSED, APPROVED, IN_PROGRESS, COMPLETED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_internships (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    role VARCHAR(255),
    stipend VARCHAR(50),
    duration_weeks INT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'SUBMITTED', -- SUBMITTED, APPROVED, COMPLETED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scholarship_schemes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NOT NULL, -- Govt of Jharkhand, Trust Merit, AICTE
    amount_per_year NUMERIC(10, 2),
    eligibility_criteria TEXT,
    status VARCHAR(50) DEFAULT 'ACTIVE'
);

CREATE TABLE IF NOT EXISTS no_dues_requests (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES users(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    roll_no VARCHAR(50) NOT NULL,
    department VARCHAR(50),
    purpose VARCHAR(255) NOT NULL, -- Degree Clearance, Transfer, Semester Break
    library_clearance BOOLEAN DEFAULT FALSE,
    lab_clearance BOOLEAN DEFAULT FALSE,
    accounts_clearance BOOLEAN DEFAULT FALSE,
    hostel_clearance BOOLEAN DEFAULT FALSE,
    overall_status VARCHAR(50) DEFAULT 'IN_PROGRESS', -- IN_PROGRESS, CLEARED, REJECTED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS exam_seating_plans (
    id SERIAL PRIMARY KEY,
    exam_name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    shift VARCHAR(100),
    subject_code VARCHAR(50),
    subject_name VARCHAR(255),
    room_number VARCHAR(50) NOT NULL,
    total_capacity INT DEFAULT 40,
    allocated_count INT DEFAULT 0,
    allocated_students JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invigilation_duties (
    id SERIAL PRIMARY KEY,
    faculty_id INT REFERENCES users(id) ON DELETE CASCADE,
    faculty_name VARCHAR(255) NOT NULL,
    department VARCHAR(50),
    exam_name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    shift VARCHAR(100),
    room_number VARCHAR(50) NOT NULL,
    reporting_time VARCHAR(20),
    role VARCHAR(100) DEFAULT 'Chief Invigilator',
    status VARCHAR(50) DEFAULT 'CONFIRMED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS question_bank (
    id SERIAL PRIMARY KEY,
    course VARCHAR(50) DEFAULT 'B.Tech',
    department VARCHAR(50) NOT NULL,
    semester VARCHAR(50) NOT NULL,
    subject_code VARCHAR(50) NOT NULL,
    subject_name VARCHAR(255),
    unit VARCHAR(50),
    topic VARCHAR(255),
    question TEXT NOT NULL,
    marks INT DEFAULT 10,
    difficulty VARCHAR(50) DEFAULT 'MEDIUM',
    question_type VARCHAR(50) DEFAULT 'LONG',
    author VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS revaluation_requests (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES users(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    roll_no VARCHAR(50) NOT NULL,
    department VARCHAR(50),
    exam_name VARCHAR(255) NOT NULL,
    subject_code VARCHAR(50) NOT NULL,
    subject_name VARCHAR(255),
    request_type VARCHAR(50) DEFAULT 'Revaluation',
    fee_paid VARCHAR(50) DEFAULT '₹ 500',
    original_marks NUMERIC(5, 2),
    original_grade VARCHAR(10),
    revised_marks NUMERIC(5, 2),
    revised_grade VARCHAR(10),
    status VARCHAR(50) DEFAULT 'SUBMITTED', -- SUBMITTED, COMPLETED
    examiner_remarks TEXT,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- =========================================================================
-- 24. ADMISSIONS PIPELINE (PHASE 24)
-- =========================================================================
CREATE TABLE IF NOT EXISTS admission_applications (
    id SERIAL PRIMARY KEY,
    application_no VARCHAR(100) UNIQUE NOT NULL, -- RVS-APP-2026-XXXX
    applicant_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    program_code VARCHAR(50) NOT NULL,
    department_code VARCHAR(50) NOT NULL,
    marks_12th_or_diploma NUMERIC(5, 2),
    entrance_exam VARCHAR(100), -- JEE Main / JCECE / Direct
    entrance_score VARCHAR(50),
    status VARCHAR(50) DEFAULT 'SUBMITTED', -- SUBMITTED, UNDER_REVIEW, OFFERED, ADMITTED, REJECTED
    documents_submitted BOOLEAN DEFAULT TRUE,
    converted_student_id INT REFERENCES users(id) ON DELETE SET NULL,
    converted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

