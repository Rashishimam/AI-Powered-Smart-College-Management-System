import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import StatCard from '../../components/StatCard';
import RVSLogo from '../../components/RVSLogo';
import { RVS_CONFIG } from '../../config/rvsConfig';
import { 
  BookOpen, 
  Users, 
  CheckCircle2, 
  Clock, 
  Award, 
  FileEdit, 
  Megaphone,
  UserCheck,
  Calendar,
  GraduationCap
} from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';

export default function FacultyDashboard({ onNavigate }) {
  const [data, setData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [facultyAttendance, setFacultyAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState(null);
  const [notification, setNotification] = useState('');

  const loadFacultyData = async () => {
    try {
      setLoading(true);
      const [statsRes, coursesRes, attRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/courses'),
        api.get('/rvs/attendance/faculty/history').catch(() => ({ data: null }))
      ]);

      if (statsRes.data?.success) setData(statsRes.data.stats);
      if (attRes?.data?.success) setFacultyAttendance(attRes.data.summary);
      if (coursesRes.data?.success) {
        setCourses(coursesRes.data.courses);
        if (coursesRes.data.courses.length > 0) {
          viewCourseStudents(coursesRes.data.courses[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load faculty data:', err);
    } finally {
      setLoading(false);
    }
  };

  const viewCourseStudents = async (course) => {
    setSelectedCourse(course);
    try {
      setLoadingStudents(true);
      const res = await api.get(`/courses/${course.id}/students`);
      if (res.data?.success) {
        setEnrolledStudents(res.data.enrollments);
      }
    } catch (err) {
      console.error('Failed to load course students:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleUpdateGrade = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/courses/enrollments/${editingEnrollment.id}`, {
        grade: editingEnrollment.grade,
        attendance_pct: editingEnrollment.attendance_pct
      });
      if (res.data?.success) {
        setNotification(`Updated grade for ${editingEnrollment.student_name || 'student'}`);
        setEditingEnrollment(null);
        if (selectedCourse) viewCourseStudents(selectedCourse);
        setTimeout(() => setNotification(''), 3500);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update student record');
    }
  };

  useEffect(() => {
    loadFacultyData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-900/20 border-t-blue-900 rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-medium">Loading Faculty Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="erp-card bg-gradient-to-r from-[#0a192f] via-[#0f2347] to-[#1e3a8a] text-white p-6 rounded-2xl relative overflow-hidden shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <RVSLogo size="md" variant="light" showText={false} subtitle={false} />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-slate-950">
                  Faculty & HOD Academic Portal
                </span>
                <span className="text-xs text-blue-200">Department of Computer Science & Engg</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Prof. Jeevan Kumar (HOD CSE)
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                {RVS_CONFIG.name}, Jamshedpur &bull; Spring Semester 2026
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="gold"
              size="sm"
              icon={CheckCircle2}
              onClick={() => onNavigate && onNavigate('attendance')}
            >
              Take Attendance
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={Award}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              onClick={() => onNavigate && onNavigate('exams')}
            >
              Submit Marks
            </Button>
          </div>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* My Attendance Clickable Card */}
        <div
          onClick={() => onNavigate && onNavigate('attendance')}
          className="cursor-pointer transform transition-transform hover:-translate-y-0.5"
          title="Click to open Faculty Attendance History"
        >
          <StatCard
            title="My Attendance"
            value={`${facultyAttendance?.attendancePct ?? 86.8}%`}
            subtitle={`Present: ${facultyAttendance?.presentDays ?? 42}d | Leave: ${facultyAttendance?.leaveDays ?? 2}d | Hours: ${facultyAttendance?.totalWorkingHours ?? '422h'}`}
            icon={CheckCircle2}
            color="emerald"
            trend="View History →"
            trendType="up"
          />
        </div>

        <StatCard
          title="Assigned Subjects"
          value={courses.length || 4}
          subtitle="Theory & Laboratory slots"
          icon={BookOpen}
          color="blue"
          trend="Active"
        />

        <StatCard
          title="Total Students Taught"
          value={data?.totalStudents || 120}
          subtitle="Enrolled in current classes"
          icon={Users}
          color="navy"
          trend="CSE 6th & 8th"
        />

        <StatCard
          title="Working Hours Logged"
          value={facultyAttendance?.totalWorkingHours || '422h 18m'}
          subtitle="Biometric RFID verified"
          icon={Clock}
          color="amber"
          trend="Semester Total"
        />
      </div>

      {/* Assigned Courses Tabs */}
      <Card>
        <CardHeader
          title="My Assigned Courses & Student Roll"
          subtitle="Select a course to inspect student enrollment, attendance percentages, and internal marks"
        />

        <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-100">
          {courses.map((course) => {
            const isSelected = selectedCourse?.id === course.id;
            return (
              <button
                key={course.id}
                onClick={() => viewCourseStudents(course)}
                className={`
                  flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer
                  ${isSelected
                    ? 'bg-blue-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }
                `}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{course.code}</span>
                <span className="opacity-80 font-normal text-[11px] truncate max-w-[150px]">
                  {course.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Course Student List */}
        <div className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                {selectedCourse ? `${selectedCourse.code} — ${selectedCourse.title}` : 'Select a course'}
              </h4>
              <p className="text-xs text-slate-500">
                {selectedCourse?.credits} Credits &bull; Semester: {selectedCourse?.semester || '6th Sem'}
              </p>
            </div>
            <Badge variant="primary" size="sm">
              {enrolledStudents.length} Enrolled Students
            </Badge>
          </div>

          {loadingStudents ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading student roll...</div>
          ) : enrolledStudents.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No students enrolled in this course yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left erp-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Roll Number</th>
                    <th>Semester</th>
                    <th>Attendance</th>
                    <th>Grade / Result</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {enrolledStudents.map((enr) => (
                    <tr key={enr.id}>
                      <td className="font-semibold text-slate-900">
                        {enr.student_name || 'Rahul Verma'}
                      </td>
                      <td className="font-mono text-xs text-slate-600">
                        {enr.roll_number || '22RVSCSE045'}
                      </td>
                      <td>{enr.semester || '6th Semester'}</td>
                      <td>
                        <span className={`font-semibold ${
                          (enr.attendance_pct || 85) >= 75 ? 'text-emerald-700' : 'text-rose-600'
                        }`}>
                          {enr.attendance_pct || 88}%
                        </span>
                      </td>
                      <td>
                        <Badge variant="gold" size="sm">
                          {enr.grade || 'A+ (8.6)'}
                        </Badge>
                      </td>
                      <td className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={FileEdit}
                          onClick={() => setEditingEnrollment(enr)}
                        >
                          Update
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Grade Update Modal */}
      <Modal
        isOpen={!!editingEnrollment}
        onClose={() => setEditingEnrollment(null)}
        title="Update Student Evaluation"
        subtitle={`Editing grades for ${editingEnrollment?.student_name || 'Student'}`}
        maxWidth="max-w-md"
      >
        {editingEnrollment && (
          <form onSubmit={handleUpdateGrade} className="space-y-4">
            <Input
              label="Student Name"
              value={editingEnrollment.student_name || ''}
              disabled
            />
            <Input
              label="Attendance Percentage (%)"
              type="number"
              min="0"
              max="100"
              value={editingEnrollment.attendance_pct || ''}
              onChange={(e) => setEditingEnrollment({ ...editingEnrollment, attendance_pct: Number(e.target.value) })}
            />
            <Input
              label="Awarded Grade (e.g. O, A+, A, B+)"
              value={editingEnrollment.grade || ''}
              onChange={(e) => setEditingEnrollment({ ...editingEnrollment, grade: e.target.value })}
              placeholder="e.g. A+"
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setEditingEnrollment(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Grade
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
