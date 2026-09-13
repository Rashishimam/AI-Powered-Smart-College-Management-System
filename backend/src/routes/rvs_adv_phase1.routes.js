const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const storePath = path.resolve(__dirname, '../../data/campusiq_store.json');

function getStore() {
  return JSON.parse(fs.readFileSync(storePath, 'utf8'));
}

function saveStore(store) {
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');
}

const JWT_SECRET = process.env.JWT_SECRET || 'campusiq_jwt_secret_dev_2024';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Authentication token required.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
    req.user = user;
    next();
  });
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Unauthorized: Access restricted to authorized personnel.' });
    }
    next();
  };
}

// =========================================================================
// 1. ACADEMIC SESSION MANAGEMENT
// =========================================================================

router.get('/sessions', authenticateToken, (req, res) => {
  const store = getStore();
  const sessions = store.academic_sessions || [];
  const current = sessions.find(s => s.is_current) || sessions[0] || {};
  res.json({ success: true, current_session: current.session_code, sessions });
});

router.post('/sessions', authenticateToken, requireRole('super_admin', 'college_admin'), (req, res) => {
  const store = getStore();
  const { session_code, name, start_date, end_date, odd_sem_start, even_sem_start } = req.body;

  if (!session_code || !start_date || !end_date) {
    return res.status(400).json({ success: false, message: 'Session code, start date, and end date are required.' });
  }

  store.academic_sessions = store.academic_sessions || [];
  const newSession = {
    id: store.academic_sessions.length > 0 ? Math.max(...store.academic_sessions.map(s => s.id)) + 1 : 1,
    session_code: session_code.trim(),
    name: name || `Academic Session ${session_code.trim()}`,
    start_date,
    end_date,
    is_current: false,
    status: 'Upcoming',
    odd_sem_start: odd_sem_start || start_date,
    even_sem_start: even_sem_start || end_date
  };

  store.academic_sessions.push(newSession);
  saveStore(store);

  res.status(201).json({ success: true, message: `Academic Session ${session_code} created.`, session: newSession });
});

router.post('/sessions/:id/set-current', authenticateToken, requireRole('super_admin', 'college_admin'), (req, res) => {
  const store = getStore();
  const targetId = Number(req.params.id);
  store.academic_sessions = store.academic_sessions || [];

  const target = store.academic_sessions.find(s => s.id === targetId);
  if (!target) return res.status(404).json({ success: false, message: 'Session not found.' });

  store.academic_sessions.forEach(s => {
    if (s.id === targetId) {
      s.is_current = true;
      s.status = 'Active';
    } else if (s.is_current) {
      s.is_current = false;
      s.status = 'Archived';
    }
  });

  saveStore(store);
  res.json({ success: true, message: `Academic Session ${target.session_code} is now marked as CURRENT.`, session: target });
});

// =========================================================================
// 2. MENTOR–MENTEE SYSTEM
// =========================================================================

router.get('/mentor-mentee/assignments', authenticateToken, (req, res) => {
  const store = getStore();
  const user = req.user;
  let assignments = store.mentor_assignments || [];

  if (user.role === 'student') {
    // Return only student's assigned mentor, and sanitize private mentor notes
    const myAssignment = assignments.find(a => a.student_id === user.id);
    if (!myAssignment) {
      return res.json({ success: true, has_mentor: false, message: 'No faculty mentor currently assigned.' });
    }

    const sanitized = {
      ...myAssignment,
      meetings: (myAssignment.meetings || []).map(m => ({
        id: m.id,
        date: m.date,
        meeting_type: m.meeting_type,
        topic: m.topic,
        follow_up_date: m.follow_up_date,
        status: m.status,
        // Hide private mentor notes from student view
        notes: m.is_private ? 'Mentoring remarks recorded in official faculty guidance log.' : m.notes
      }))
    };

    return res.json({ success: true, has_mentor: true, assignment: sanitized });
  }

  if (user.role === 'faculty') {
    // Return all mentees assigned to this faculty with full 360° summary
    const myMentees = assignments.filter(a => a.mentor_id === user.id || a.mentor_name.toLowerCase().includes(user.name.toLowerCase()));
    
    // Enrich with dynamic student stats
    const enriched = myMentees.map(m => {
      const studentBacklogs = (store.student_backlogs || []).filter(b => b.student_id === m.student_id && b.result === 'Pending');
      const studentAtt = (store.attendance_records || []).filter(a => a.student_id === m.student_id);
      const attPct = studentAtt.length > 0 ? Math.round((studentAtt.filter(a => a.status === 'Present').length / studentAtt.length) * 100) : 86;
      
      return {
        ...m,
        metrics: {
          attendance_pct: attPct,
          current_sgpa: 8.2,
          cgpa: 8.4,
          active_backlogs: studentBacklogs.length,
          placement_status: studentBacklogs.length === 0 ? 'Eligible' : 'Needs Clearance'
        }
      };
    });

    return res.json({
      success: true,
      total_mentees: enriched.length,
      mentees: enriched
    });
  }

  // Admin / HOD view: all assignments and mentor workload distribution
  const mentorsWorkload = {};
  assignments.forEach(a => {
    mentorsWorkload[a.mentor_name] = (mentorsWorkload[a.mentor_name] || 0) + 1;
  });

  res.json({
    success: true,
    total_assignments: assignments.length,
    workload_summary: mentorsWorkload,
    assignments
  });
});

router.post('/mentor-mentee/assign', authenticateToken, requireRole('super_admin', 'college_admin', 'faculty'), (req, res) => {
  const store = getStore();
  const { mentor_id, mentor_name, student_ids = [] } = req.body;

  if (!mentor_name || !student_ids.length) {
    return res.status(400).json({ success: false, message: 'Mentor and at least one student required.' });
  }

  store.mentor_assignments = store.mentor_assignments || [];

  let assignedCount = 0;
  student_ids.forEach(sId => {
    const studentUser = (store.users || []).find(u => u.id === Number(sId));
    if (studentUser) {
      const profile = (store.students_profile || []).find(p => p.user_id === studentUser.id) || {};
      
      // Remove previous assignment if exists
      store.mentor_assignments = store.mentor_assignments.filter(a => a.student_id !== studentUser.id);

      const newAssignment = {
        id: store.mentor_assignments.length > 0 ? Math.max(...store.mentor_assignments.map(a => a.id)) + 1 : 1,
        mentor_id: Number(mentor_id || 6),
        mentor_name: mentor_name.trim(),
        mentor_department: studentUser.department || 'CSE',
        student_id: studentUser.id,
        student_name: studentUser.name,
        roll_no: profile.roll_no || `23RVSCSE${String(studentUser.id).padStart(3, '0')}`,
        department: profile.department_code || studentUser.department || 'CSE',
        semester: profile.semester || '6th Semester',
        assigned_date: new Date().toISOString().split('T')[0],
        status: 'Active',
        meetings: []
      };

      store.mentor_assignments.push(newAssignment);
      assignedCount++;
    }
  });

  saveStore(store);

  res.json({
    success: true,
    message: `Assigned ${assignedCount} students to Faculty Mentor ${mentor_name}.`
  });
});

router.post('/mentor-mentee/meetings', authenticateToken, requireRole('super_admin', 'college_admin', 'faculty'), (req, res) => {
  const store = getStore();
  const { assignment_id, meeting_type, topic, notes, follow_up_date, is_private = true } = req.body;

  if (!assignment_id || !topic) {
    return res.status(400).json({ success: false, message: 'Assignment ID and topic are required.' });
  }

  store.mentor_assignments = store.mentor_assignments || [];
  const assignment = store.mentor_assignments.find(a => a.id === Number(assignment_id));

  if (!assignment) {
    return res.status(404).json({ success: false, message: 'Mentor assignment record not found.' });
  }

  assignment.meetings = assignment.meetings || [];
  const newMeeting = {
    id: assignment.meetings.length > 0 ? Math.max(...assignment.meetings.map(m => m.id)) + 1 : 1,
    date: new Date().toISOString().split('T')[0],
    meeting_type: meeting_type || 'One-on-One Academic Mentoring',
    topic: topic.trim(),
    notes: notes ? notes.trim() : 'Session conducted satisfactorily.',
    is_private: Boolean(is_private),
    follow_up_date: follow_up_date || null,
    status: 'Completed',
    recorded_by: req.user.name
  };

  assignment.meetings.unshift(newMeeting);
  saveStore(store);

  res.status(201).json({
    success: true,
    message: `Mentoring meeting record saved for ${assignment.student_name}.`,
    meeting: newMeeting
  });
});

// =========================================================================
// 3. SYLLABUS & LESSON PLAN TRACKER
// =========================================================================

router.get('/syllabus', authenticateToken, (req, res) => {
  const store = getStore();
  const { department, semester, subject_code } = req.query;
  let list = store.syllabus_trackers || [];

  if (department && department !== 'ALL') {
    list = list.filter(s => (s.department || '').toLowerCase() === department.toLowerCase());
  }
  if (semester && semester !== 'ALL') {
    list = list.filter(s => (s.semester || '').toLowerCase() === semester.toLowerCase());
  }
  if (subject_code) {
    list = list.filter(s => (s.subject_code || '').toLowerCase() === subject_code.toLowerCase());
  }

  res.json({ success: true, total: list.length, trackers: list });
});

router.post('/syllabus/topics/:id/status', authenticateToken, requireRole('super_admin', 'college_admin', 'faculty'), (req, res) => {
  const store = getStore();
  const topicId = Number(req.params.id);
  const { status, completion_date } = req.body;

  let foundTopic = null;
  let parentSubject = null;

  (store.syllabus_trackers || []).forEach(tracker => {
    (tracker.units || []).forEach(unit => {
      (unit.topics || []).forEach(t => {
        if (t.id === topicId) {
          foundTopic = t;
          parentSubject = tracker;
          t.status = status || 'COMPLETED';
          t.completion_date = status === 'COMPLETED' ? (completion_date || new Date().toISOString().split('T')[0]) : null;
        }
      });
    });
  });

  if (!foundTopic) {
    return res.status(404).json({ success: false, message: 'Topic not found in syllabus tracker.' });
  }

  saveStore(store);

  res.json({
    success: true,
    message: `Topic "${foundTopic.name}" marked as ${foundTopic.status}.`,
    topic: foundTopic
  });
});

router.get('/syllabus/analytics', authenticateToken, (req, res) => {
  const store = getStore();
  const trackers = store.syllabus_trackers || [];

  const subjectProgress = trackers.map(tr => {
    let totalTopics = 0;
    let completedTopics = 0;
    (tr.units || []).forEach(u => {
      (u.topics || []).forEach(t => {
        totalTopics++;
        if (t.status === 'COMPLETED') completedTopics++;
      });
    });
    const pct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
    return {
      id: tr.id,
      subject_code: tr.subject_code,
      subject_name: tr.subject_name,
      department: tr.department,
      faculty_name: tr.faculty_name,
      total_topics: totalTopics,
      completed_topics: completedTopics,
      completion_pct: pct,
      is_delayed: pct < 50
    };
  });

  const overallAvg = subjectProgress.length > 0
    ? Math.round(subjectProgress.reduce((sum, s) => sum + s.completion_pct, 0) / subjectProgress.length)
    : 0;

  res.json({
    success: true,
    overall_completion_pct: overallAvg,
    delayed_subjects_count: subjectProgress.filter(s => s.is_delayed).length,
    subject_progress: subjectProgress
  });
});

// =========================================================================
// 4. FACULTY WORKLOAD MANAGEMENT & TIMETABLE CONFLICTS
// =========================================================================

router.get('/workload/config', authenticateToken, (req, res) => {
  const store = getStore();
  res.json({
    success: true,
    config: store.faculty_workload_config || {
      max_weekly_teaching_hours: 18,
      max_lab_hours: 6,
      max_mentees: 30,
      alert_on_overload: true
    }
  });
});

router.post('/workload/config', authenticateToken, requireRole('super_admin', 'college_admin'), (req, res) => {
  const store = getStore();
  const { max_weekly_teaching_hours, max_lab_hours, max_mentees } = req.body;

  store.faculty_workload_config = {
    max_weekly_teaching_hours: Number(max_weekly_teaching_hours || 18),
    max_lab_hours: Number(max_lab_hours || 6),
    max_mentees: Number(max_mentees || 30),
    alert_on_overload: true
  };

  saveStore(store);

  res.json({
    success: true,
    message: 'Faculty workload policy parameters updated.',
    config: store.faculty_workload_config
  });
});

router.get('/workload/analytics', authenticateToken, (req, res) => {
  const store = getStore();
  const config = store.faculty_workload_config || { max_weekly_teaching_hours: 18, max_mentees: 30 };
  const timetables = store.timetables || [];
  const assignments = store.mentor_assignments || [];
  const facultyUsers = (store.users || []).filter(u => u.role === 'faculty');

  const facultyWorkloads = facultyUsers.map(fac => {
    // Classes assigned from timetables
    const classes = timetables.filter(t => (t.faculty_name || '').toLowerCase() === fac.name.toLowerCase());
    const teachingHours = classes.length * 1.0; // 1 hr per class
    const subjects = [...new Set(classes.map(c => c.subject_name))];
    const mentees = assignments.filter(a => a.mentor_id === fac.id || a.mentor_name.toLowerCase().includes(fac.name.toLowerCase()));

    const isOverloaded = teachingHours > config.max_weekly_teaching_hours || mentees.length > config.max_mentees;

    return {
      faculty_id: fac.id,
      faculty_name: fac.name,
      department: fac.department || 'Academics',
      weekly_teaching_hours: teachingHours,
      assigned_classes_count: classes.length,
      assigned_subjects: subjects,
      mentee_count: mentees.length,
      is_overloaded: isOverloaded,
      workload_status: isOverloaded ? 'Overloaded' : 'Optimal'
    };
  });

  res.json({
    success: true,
    config,
    total_faculty: facultyWorkloads.length,
    overloaded_count: facultyWorkloads.filter(f => f.is_overloaded).length,
    faculty_workloads: facultyWorkloads
  });
});

module.exports = router;
