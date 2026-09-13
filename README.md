# AI-Powered-Smart-College-Management-System

# RVS College of Engineering & Technology, Jamshedpur
## RVS Smart Campus Management System

The **RVS Smart Campus Management System** is a unified full-stack academic operations platform built specifically for **RVS College of Engineering & Technology, Jamshedpur** (Approved by AICTE, New Delhi & Affiliated to Jharkhand University of Technology (JUT), Ranchi / Kolhan University).

Built with **React.js**, **Tailwind CSS**, **Node.js**, **Express.js**, **PostgreSQL Relational Layer**, and **JWT Authentication**.

---

## 🌟 Supported RVS Departments

1. **Computer Science & Engineering (CSE)**
2. **Civil Engineering (CE)**
3. **Mechanical Engineering (ME)**
4. **Electronics & Communication Engineering (ECE)**
5. **Electrical & Electronics Engineering (EEE)**
6. **Master of Computer Applications (MCA)**

---

## 🚀 Key Modules & Capabilities

1. **Centralized RVS Branding**: Unified configuration in `rvsConfig.js` containing college name, crest emblem, NH-33 Jamshedpur campus location, AICTE affiliation, and official contacts.
2. **Role-Based Dashboards**:
   - **Trust Board (Super Admin)**: Platform telemetry, multi-campus overview, database audit logs.
   - **Director & Dean (College Admin)**: Student strength, faculty council, fee realizations, department-wise analytics, course manager.
   - **Faculty / HOD Workspace**: Course workloads, student evaluation, dynamic QR attendance launcher.
   - **Student Portal**: SGPA tracker, timetable, fee ledger, course enrollment, exam admit cards.
3. **Student Management**: Filter and search by Roll Number (`23RVSCSE042`), JUT Registration Number, Department, Semester, and Batch (`2023-2027`). Full student profile inspection and enrollment.
4. **Faculty Management**: Employee ID (`RVS-EMP-CSE-104`), designation, department, qualification (Ph.D/M.Tech), and weekly workload hours.
5. **Attendance & Dynamic QR Check-in**:
   - Live 3-minute temporary QR code session generator.
   - Student 1-tap validation and token scanner.
   - Single-device token validation preventing duplicate or proxy attendance.
   - Low attendance warning system (<75% JUT minimum).
6. **Fees & Printable RVS E-Receipts**: Semester fee breakdown (tuition, examination fee, development fee), pending dues, scholarship waivers, and printable official receipts with RVS crest and authorized signature.
7. **Examinations & SGPA Report Cards**: Internal mid-terms, practical marks, end-sem theory results, SGPA/CGPA calculation on 10-point scale, and official printable grade sheets.
8. **Training & Placement Cell (T&P)**:
   - On-campus recruitment drives: **Tata Steel**, **TCS**, **Vedanta**, **Capgemini**, **Wipro**.
   - Eligibility filtering (CGPA >= 6.5 - 7.0), packages (up to 9.0 LPA), and student registration tracker.
9. **Identity Cards Module**: Printable Student & Faculty ID Cards with photo, QR verification badge, blood group, emergency contacts, and registrar seal.
10. **Central Library**: Textbook inventory, ISBN catalog, borrowing records, issue/return status, and late fines.
11. **Notice Board**: Official announcements categorized under Academic, Examination, Placement, Events, Scholarship, and General with printable circulars.
12. **Timetable with Conflict Detection**: Department and semester matrix detecting room and faculty clashes before scheduling.
13. **Grievance Redressal & Leaves**: Student complaint lodgement under AICTE student welfare norms with administrative resolution tracking.

---

## 🔐 Official RVS Demo Credentials

| Role | Name | Official Email | Password | Scope |
|---|---|---|---|---|
| **Super Admin** | RVS Trust Board | `superadmin@rvscet.ac.in` | `Admin@123` | Platform-Wide / Governance |
| **College Admin** | Dr. R. N. Gupta (Dean) | `admin@rvscet.ac.in` | `Admin@123` | RVS CET Jamshedpur Campus |
| **Faculty** | Prof. Rajesh Sharma (HOD CSE) | `faculty.cse@rvscet.ac.in` | `Faculty@123` | Computer Science & AI |
| **Student** | Rahul Kumar Verma | `student.rvs@rvscet.ac.in` | `Student@123` | B.Tech CSE (6th Semester) |

*(Note: Legacy demo credentials from previous tests remain supported for backwards compatibility).*

---

## 🛠 Tech Stack & Architecture

- **Frontend**: React 19, Tailwind CSS v4, Lucide Icons, Axios, Vite
- **Backend**: Node.js, Express.js, JWT (`jsonwebtoken`), `bcryptjs`, Morgan, CORS
- **Database**: PostgreSQL (`pg` driver) with DDL schema (`backend/src/db/schema.sql`) + zero-setup resilient embedded relational storage

---

## 🚀 Running the Platform

### Start Both Servers Concurrently:
```bash
node run-all.js
```

Or individually:

**Backend (Port 5000):**
```bash
cd backend
npm start
```

**Frontend (Port 5173):**
```bash
cd frontend
npm run dev
```

Visit **`http://localhost:5173`** in your browser.
