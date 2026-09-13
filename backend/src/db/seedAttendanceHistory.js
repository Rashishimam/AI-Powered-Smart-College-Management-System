const fs = require('fs');
const path = require('path');

const storePath = path.join(__dirname, '../../data/campusiq_store.json');

function seedAttendanceHistory() {
  console.log('--- Seeding Comprehensive Attendance History ---');
  if (!fs.existsSync(storePath)) {
    console.error('Store file does not exist at', storePath);
    return;
  }

  const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));

  // Ensure arrays exist
  store.attendance_records = store.attendance_records || [];
  store.faculty_attendance_records = store.faculty_attendance_records || [];
  store.attendance_audit_logs = store.attendance_audit_logs || [];

  // Reset or initialize clean state for attendance history
  store.attendance_records = [];
  store.faculty_attendance_records = [];
  store.attendance_audit_logs = [];

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Subjects configuration
  const subjects = [
    { code: 'CS-601', name: 'Compiler Design', facultyId: 6, facultyName: 'Prof. Jeevan Kumar', courseId: 101, period: 'Period 1', startTime: '09:00 AM', endTime: '10:00 AM' },
    { code: 'CS-602', name: 'Computer Networks', facultyId: 3, facultyName: 'Prof. Rajesh Sharma', courseId: 102, period: 'Period 2', startTime: '10:15 AM', endTime: '11:15 AM' },
    { code: 'CS-603', name: 'Cloud Computing & DevOps', facultyId: 13, facultyName: 'Dr. Rakesh Kumar', courseId: 103, period: 'Period 3', startTime: '11:30 AM', endTime: '12:30 PM' },
    { code: 'CS-604L', name: 'Networks & Linux Lab', facultyId: 6, facultyName: 'Prof. Jeevan Kumar', courseId: 101, period: 'Period 4 (Lab)', startTime: '01:30 PM', endTime: '03:30 PM' },
    { code: 'CS-401', name: 'Advanced Distributed Systems', facultyId: 14, facultyName: 'Dr. Sharat Chandra Mahto', courseId: 1, period: 'Period 5', startTime: '03:45 PM', endTime: '04:45 PM' }
  ];

  // Target students
  const students = [
    { id: 7, name: 'Rahul Kumar Verma', rollNo: '23RVSCSE042', dept: 'CSE', sem: '6th Semester', attendanceTier: 'high' }, // ~90%
    { id: 10, name: 'Vikramaditya Kumar Singh', rollNo: '23RVSCSE055', dept: 'CSE', sem: '6th Semester', attendanceTier: 'low' }, // ~71% (LOW ATTENDANCE TRIGGER)
    { id: 11, name: 'Ananya Sharma', rollNo: '23RVSCSE009', dept: 'CSE', sem: '6th Semester', attendanceTier: 'high' }, // ~93%
    { id: 12, name: 'Rohan Gupta', rollNo: '23RVSCSE027', dept: 'CSE', sem: '6th Semester', attendanceTier: 'medium' }, // ~82%
    { id: 4, name: 'Vikramaditya Kumar Singh (Updated)', rollNo: '23RVSCSE012', dept: 'CSE', sem: '6th Semester', attendanceTier: 'high' },
    { id: 9, name: 'RASHISH IMAM', rollNo: '23RVSCSE001', dept: 'CSE', sem: '6th Semester', attendanceTier: 'high' }
  ];

  // Target faculty
  const faculties = [
    { id: 6, name: 'Prof. Jeevan Kumar', dept: 'CSE' },
    { id: 3, name: 'Prof. Rajesh Sharma', dept: 'CSE' },
    { id: 13, name: 'Dr. Rakesh Kumar', dept: 'Executive Leadership' },
    { id: 14, name: 'Dr. Sharat Chandra Mahto', dept: 'Science & Humanities' },
    { id: 15, name: 'Prof. Krishna Murari', dept: 'Mechanical Engineering' }
  ];

  let recordId = 1;
  let facultyRecordId = 1;

  // Generate working dates for the past 65 days ending today (2026-09-11)
  const endDate = new Date('2026-09-11T12:00:00Z');
  const workingDays = [];

  for (let i = 65; i >= 0; i--) {
    const d = new Date(endDate);
    d.setDate(d.getDate() - i);
    const dayOfWeek = d.getDay();
    // Exclude Sundays (0). Keep Saturdays as half/academic working day
    if (dayOfWeek !== 0) {
      workingDays.push(d);
    }
  }

  console.log(`Generated ${workingDays.length} working days for academic calendar.`);

  // 1. Generate Student Attendance Records
  workingDays.forEach((d, dayIndex) => {
    const dateStr = d.toISOString().split('T')[0];
    const dayName = daysOfWeek[d.getDay()];

    // Rotate 3-4 subjects per day
    const daySubjects = d.getDay() === 6 // Saturday has fewer classes
      ? [subjects[0], subjects[1]]
      : (dayIndex % 2 === 0 ? [subjects[0], subjects[1], subjects[2], subjects[3]] : [subjects[0], subjects[2], subjects[4]]);

    daySubjects.forEach(subj => {
      students.forEach(stud => {
        let status = 'Present';
        const rand = Math.random();

        if (stud.attendanceTier === 'high') {
          // 88% Present, 5% Late, 4% Absent, 3% Excused
          if (rand < 0.04) status = 'Absent';
          else if (rand < 0.09) status = 'Late';
          else if (rand < 0.12) status = 'Excused';
          else status = 'Present';
        } else if (stud.attendanceTier === 'low') {
          // Low attendance tier: ~68% Present, 4% Late, 24% Absent, 4% Excused -> ~72% (LOW ATTENDANCE TRIGGER)
          if (rand < 0.24) status = 'Absent';
          else if (rand < 0.28) status = 'Late';
          else if (rand < 0.32) status = 'Excused';
          else status = 'Present';
        } else {
          // Medium tier: ~82%
          if (rand < 0.12) status = 'Absent';
          else if (rand < 0.18) status = 'Late';
          else if (rand < 0.22) status = 'Excused';
          else status = 'Present';
        }

        // Method: QR (60%) vs Manual (40%)
        const method = Math.random() > 0.4 ? 'QR' : 'Manual';

        store.attendance_records.push({
          id: recordId++,
          session_id: (dayIndex % 5) + 1,
          student_id: stud.id,
          student_name: stud.name,
          roll_no: stud.rollNo,
          course_id: subj.courseId,
          subject_name: subj.name,
          subject_code: subj.code,
          faculty_id: subj.facultyId,
          faculty_name: subj.facultyName,
          department_code: stud.dept,
          semester: stud.sem,
          attendance_date: dateStr,
          day: dayName,
          class_period: subj.period,
          start_time: subj.startTime,
          end_time: subj.endTime,
          status,
          method,
          remarks: status === 'Excused' ? 'Medical slip submitted / OD' : (status === 'Late' ? 'Late entry (+12m)' : 'Regular class attendance'),
          marked_by: subj.facultyId,
          created_at: new Date(`${dateStr}T${subj.startTime.includes('AM') ? '09:15:00Z' : '14:00:00Z'}`).toISOString(),
          updated_at: new Date(`${dateStr}T${subj.startTime.includes('AM') ? '09:15:00Z' : '14:00:00Z'}`).toISOString()
        });
      });
    });
  });

  console.log(`Created ${store.attendance_records.length} student attendance records.`);

  // 2. Generate Faculty Attendance Records
  workingDays.forEach((d, dayIndex) => {
    const dateStr = d.toISOString().split('T')[0];
    const dayName = daysOfWeek[d.getDay()];

    faculties.forEach(fac => {
      const rand = Math.random();
      let status = 'Present';
      let checkIn = '08:52 AM';
      let checkOut = '05:15 PM';
      let workingMinutes = 503;
      let workingHours = '8h 23m';
      let leaveType = null;
      let remarks = 'Biometric RFID gate verified';

      if (d.getDay() === 6) {
        // Saturday is half day
        checkIn = '08:55 AM';
        checkOut = '01:30 PM';
        workingMinutes = 275;
        workingHours = '4h 35m';
        status = 'Half Day';
        remarks = 'Saturday half academic schedule';
      } else if (rand < 0.05) {
        // Leave
        status = 'On Leave';
        checkIn = null;
        checkOut = null;
        workingMinutes = 0;
        workingHours = '0h 0m';
        leaveType = rand < 0.025 ? 'Casual Leave (CL)' : 'Academic Duty Leave (OD)';
        remarks = 'Pre-approved leave by Dean Academics';
      } else if (rand < 0.10) {
        // Late
        status = 'Late';
        checkIn = '09:28 AM';
        checkOut = '05:30 PM';
        workingMinutes = 482;
        workingHours = '8h 02m';
        remarks = 'Traffic delay on NH-33 / Campus bus delay';
      } else if (rand < 0.13) {
        // Absent (rare)
        status = 'Absent';
        checkIn = null;
        checkOut = null;
        workingMinutes = 0;
        workingHours = '0h 0m';
        remarks = 'Unplanned absence';
      } else {
        // Standard present with slight jitter
        const inMins = Math.floor(Math.random() * 20) + 45; // 08:45 - 09:05
        const outMins = Math.floor(Math.random() * 30) + 10; // 05:10 - 05:40
        const inHour = inMins >= 60 ? '09' : '08';
        const inMinStr = (inMins % 60).toString().padStart(2, '0');
        const outMinStr = outMins.toString().padStart(2, '0');
        checkIn = `${inHour}:${inMinStr} AM`;
        checkOut = `05:${outMinStr} PM`;
        const totalMins = (17 * 60 + outMins) - (Number(inHour) * 60 + (inMins % 60));
        workingMinutes = totalMins;
        workingHours = `${Math.floor(totalMins / 60)}h ${(totalMins % 60).toString().padStart(2, '0')}m`;
        status = 'Present';
      }

      store.faculty_attendance_records.push({
        id: facultyRecordId++,
        faculty_id: fac.id,
        faculty_name: fac.name,
        department_code: fac.dept,
        attendance_date: dateStr,
        day: dayName,
        check_in: checkIn,
        check_out: checkOut,
        working_minutes: workingMinutes,
        working_hours: workingHours,
        status,
        leave_type: leaveType,
        remarks,
        created_at: new Date(`${dateStr}T08:50:00Z`).toISOString(),
        updated_at: new Date(`${dateStr}T17:30:00Z`).toISOString()
      });
    });
  });

  console.log(`Created ${store.faculty_attendance_records.length} faculty attendance records.`);

  // 3. Initial Sample Attendance Corrections & Audit Logs
  const sampleStudentRec = store.attendance_records.find(r => r.student_id === 7 && r.status === 'Absent') || store.attendance_records[10];
  if (sampleStudentRec) {
    sampleStudentRec.status = 'Excused';
    sampleStudentRec.remarks = 'Corrected: Medical certificate submitted to HOD';
    sampleStudentRec.updated_at = new Date().toISOString();

    store.attendance_audit_logs.push({
      id: 1,
      record_type: 'student',
      record_id: sampleStudentRec.id,
      target_id: sampleStudentRec.student_id,
      target_name: sampleStudentRec.student_name,
      subject_or_dept: `${sampleStudentRec.subject_name} (${sampleStudentRec.subject_code})`,
      attendance_date: sampleStudentRec.attendance_date,
      previous_status: 'Absent',
      new_status: 'Excused',
      reason: 'Student submitted doctor-certified prescription from RVS Campus Clinic.',
      changed_by: 6,
      changed_by_name: 'Prof. Jeevan Kumar (HOD CSE)',
      changed_by_role: 'faculty',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString()
    });
  }

  const sampleFacultyRec = store.faculty_attendance_records.find(r => r.faculty_id === 6 && r.status === 'Late') || store.faculty_attendance_records[5];
  if (sampleFacultyRec) {
    sampleFacultyRec.status = 'Present';
    sampleFacultyRec.remarks = 'Corrected: On-duty exam squad inspection at JUT center';
    sampleFacultyRec.updated_at = new Date().toISOString();

    store.attendance_audit_logs.push({
      id: 2,
      record_type: 'faculty',
      record_id: sampleFacultyRec.id,
      target_id: sampleFacultyRec.faculty_id,
      target_name: sampleFacultyRec.faculty_name,
      subject_or_dept: sampleFacultyRec.department_code,
      attendance_date: sampleFacultyRec.attendance_date,
      previous_status: 'Late',
      new_status: 'Present',
      reason: 'Official university duty sanctioned by Principal: flying squad observer at JUT Ranchi.',
      changed_by: 2,
      changed_by_name: 'Dr. Rajesh Kumar (College Admin)',
      changed_by_role: 'college_admin',
      created_at: new Date(Date.now() - 86400000 * 5).toISOString()
    });
  }

  // Save back to campusiq_store.json
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');
  console.log('Attendance history seeded successfully in campusiq_store.json!');
}

seedAttendanceHistory();
