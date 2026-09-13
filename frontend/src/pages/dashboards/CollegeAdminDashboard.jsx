import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import StatCard from '../../components/StatCard';
import RVSLogo from '../../components/RVSLogo';
import { RVS_CONFIG } from '../../config/rvsConfig';
import { 
  Building2, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Plus, 
  Megaphone, 
  CheckCircle2, 
  Calendar,
  Layers,
  TrendingUp,
  Receipt,
  Award,
  Briefcase,
  Check,
  Clock,
  ArrowUpRight,
  Sparkles,
  BarChart3,
  AlertCircle,
  UserCheck,
  UserX
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Card, { CardHeader } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

export default function CollegeAdminDashboard({ onNavigate }) {
  const [data, setData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [attendanceOverview, setAttendanceOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');

  // Modals state
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

  // Form states
  const [newCourse, setNewCourse] = useState({
    code: '',
    title: '',
    department: 'Computer Science & Engineering',
    credits: 4,
    semester: '6th Semester'
  });

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    category: 'Academic',
    target_role: 'all',
    priority: 'normal'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, coursesRes, attRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/courses'),
        api.get('/rvs/attendance/admin/overview').catch(() => ({ data: null }))
      ]);
      if (statsRes.data?.success) setData(statsRes.data.stats);
      if (coursesRes.data?.success) setCourses(coursesRes.data.courses);
      if (attRes?.data?.success) setAttendanceOverview(attRes.data);
    } catch (err) {
      console.error('Failed to load college admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/courses', newCourse);
      if (res.data?.success) {
        setNotification(`Course ${newCourse.code} created successfully!`);
        setShowCourseModal(false);
        setNewCourse({ code: '', title: '', department: 'Computer Science & Engineering', credits: 4, semester: '6th Semester' });
        loadData();
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create course');
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/announcements', newAnnouncement);
      if (res.data?.success) {
        setNotification('Notice broadcasted to RVS Notice Board!');
        setShowAnnouncementModal(false);
        setNewAnnouncement({ title: '', content: '', category: 'Academic', target_role: 'all', priority: 'normal' });
        loadData();
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to publish announcement');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-900/20 border-t-blue-900 rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-medium">Loading RVS ERP Dashboard...</p>
        </div>
      </div>
    );
  }

  // Calculated or fallback statistics
  const totalStudents = data?.totalStudents || 398;
  const totalFaculty = data?.totalFaculty || 42;
  const todayAttendance = data?.todayAttendance || '92.6%';
  const pendingFees = data?.pendingFees || '₹24,50,000';
  const feeCollection = data?.feeCollection || '₹1,85,50,000';
  const upcomingExams = 'Mid-Term (Oct 15)';
  const placements = `${RVS_CONFIG.placementHeadlineStats.placementRate} Placed`;
  const noticesCount = data?.recentAnnouncements?.length || 4;

  const departmentData = data?.deptWiseStudents || [
    { dept: 'CSE', name: 'Computer Science & Engg', count: 120, pct: 30, color: 'bg-blue-600' },
    { dept: 'AIML', name: 'CS (AI & ML)', count: 48, pct: 12, color: 'bg-indigo-600' },
    { dept: 'CE', name: 'Civil Engineering', count: 58, pct: 15, color: 'bg-amber-600' },
    { dept: 'ME', name: 'Mechanical Engineering', count: 62, pct: 16, color: 'bg-emerald-600' },
    { dept: 'ECE', name: 'Electronics & Comm', count: 56, pct: 14, color: 'bg-cyan-600' },
    { dept: 'EEE', name: 'Electrical & Electronics', count: 54, pct: 13, color: 'bg-violet-600' }
  ];

  const attendanceTrend = [
    { day: 'Mon', rate: 94 },
    { day: 'Tue', rate: 91 },
    { day: 'Wed', rate: 96 },
    { day: 'Thu', rate: 93 },
    { day: 'Fri', rate: 89 },
    { day: 'Sat', rate: 92 }
  ];

  const performanceGrades = [
    { grade: 'O (90-100%)', count: 48, pct: 12 },
    { grade: 'A+ (80-89%)', count: 124, pct: 31 },
    { grade: 'A (70-79%)', count: 140, pct: 35 },
    { grade: 'B+ (60-69%)', count: 66, pct: 17 },
    { grade: 'B (50-59%)', count: 20, pct: 5 }
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* ========================================================================= */}
      {/* 1. College Executive Welcome Banner */}
      {/* ========================================================================= */}
      <div className="erp-card bg-gradient-to-r from-[#0a192f] via-[#0f2347] to-[#1e3a8a] text-white p-6 sm:p-8 rounded-2xl relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <RVSLogo size="md" variant="light" showText={false} subtitle={false} className="shrink-0" />
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-slate-950">
                  Principal & Campus Administration
                </span>
                <span className="text-xs text-blue-200">RVSCET &bull; Estd. 1993</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {RVS_CONFIG.name}
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Jamshedpur Campus &bull; {RVS_CONFIG.affiliation}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <button
              onClick={() => setShowAnnouncementModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all cursor-pointer"
            >
              <Megaphone className="w-3.5 h-3.5 text-amber-400" />
              <span>Broadcast Notice</span>
            </button>
            <button
              onClick={() => setShowCourseModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Course</span>
            </button>
          </div>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-slide-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. Primary 8 Premium Dashboard Metric Cards */}
      {/* ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Key Institutional Performance Indicators
          </h2>
          <span className="text-[11px] text-slate-400">Live Academic Session 2026</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Students"
            value={totalStudents}
            subtitle="Active across all 6 branches"
            icon={Users}
            color="navy"
            trend="+12% YoY"
            trendType="up"
          />

          <StatCard
            title="Total Faculty"
            value={totalFaculty}
            subtitle="Permanent & Adjunct Professors"
            icon={GraduationCap}
            color="blue"
            trend="100% Assigned"
            trendType="up"
          />

          <div 
            onClick={() => onNavigate && onNavigate('attendance')}
            className="cursor-pointer transform transition-transform hover:-translate-y-0.5"
            title="Click to open Student Attendance Hub"
          >
            <StatCard
              title="Today Student Attendance"
              value={attendanceOverview?.todayStudentAttendance?.rate || todayAttendance}
              subtitle={`${attendanceOverview?.todayStudentAttendance?.presentCount ?? 18} Present in lectures today`}
              icon={CheckCircle2}
              color="emerald"
              trend="View History →"
              trendType="up"
            />
          </div>

          <div 
            onClick={() => onNavigate && onNavigate('attendance')}
            className="cursor-pointer transform transition-transform hover:-translate-y-0.5"
            title="Click to open Faculty Attendance Hub"
          >
            <StatCard
              title="Today Faculty Attendance"
              value={attendanceOverview?.todayFacultyAttendance?.rate || '95.5%'}
              subtitle={`${attendanceOverview?.todayFacultyAttendance?.presentCount ?? 5} Faculty on duty today`}
              icon={UserCheck}
              color="blue"
              trend="View History →"
              trendType="up"
            />
          </div>

          <StatCard
            title="Fee Collection"
            value={feeCollection}
            subtitle="Realized this semester (88%)"
            icon={Receipt}
            color="blue"
            trend="88% Target"
            trendType="up"
          />

          <StatCard
            title="Pending Fees"
            value={pendingFees}
            subtitle="Admit card clearance pending"
            icon={AlertCircle}
            color="amber"
            trend="12% Outstanding"
            trendType="down"
          />

          <StatCard
            title="Upcoming Exams"
            value="Oct 15, 2026"
            subtitle="Odd Sem Mid-Term examinations"
            icon={Calendar}
            color="gold"
            trend="JUT Schedule"
          />

          <StatCard
            title="Placements"
            value={RVS_CONFIG.placementHeadlineStats.highestPackage}
            subtitle={`Highest CTC • Avg: ${RVS_CONFIG.placementHeadlineStats.averagePackage}`}
            icon={Briefcase}
            color="cyan"
            trend={RVS_CONFIG.placementHeadlineStats.placementRate}
            trendType="up"
          />

          <StatCard
            title="Active Notices"
            value={noticesCount}
            subtitle="Published to campus feed"
            icon={Megaphone}
            color="indigo"
            trend="Live Circulars"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2b. Attendance Intelligence & Low Attendance Alerts */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Attendance Students Alert Card */}
        <Card className="lg:col-span-2 border-rose-200">
          <CardHeader
            title="Low Attendance Alert Ledger (< 75% Minimum Threshold)"
            subtitle="Students at risk of examination debarment under JUT Ranchi & RVSCET attendance bylaws"
            action={
              <Badge variant="danger" size="sm" className="font-bold uppercase tracking-wider">
                {attendanceOverview?.lowAttendanceStudents?.length || 1} Debarment Warnings
              </Badge>
            }
          />

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs erp-table">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Department</th>
                  <th>Attendance %</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {(attendanceOverview?.lowAttendanceStudents || [
                  { id: 10, name: 'Vikramaditya Kumar Singh', rollNo: '23RVSCSE055', department: 'CSE', overallPct: 72.8 }
                ]).map((s) => (
                  <tr key={s.id} className="hover:bg-rose-50/40 transition-colors">
                    <td className="font-mono font-bold text-rose-900">{s.rollNo}</td>
                    <td className="font-bold text-slate-900">{s.name}</td>
                    <td className="text-slate-600">{s.department}</td>
                    <td>
                      <span className="font-mono font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        {s.overallPct}%
                      </span>
                    </td>
                    <td>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-800 tracking-wider">
                        LOW ATTENDANCE
                      </span>
                    </td>
                    <td className="text-right">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => onNavigate && onNavigate('attendance')}
                      >
                        Inspect History
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Today's Daily Absentee Summary */}
        <Card>
          <CardHeader
            title="Today's Absentee Summary"
            subtitle={`${new Date().toISOString().split('T')[0]} &bull; Live Registry`}
          />

          <div className="space-y-4 text-xs">
            {/* Absent Students */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <UserX className="w-4 h-4 text-rose-600" />
                  Absent Students Today:
                </span>
                <strong className="text-rose-700 font-mono font-bold">
                  {attendanceOverview?.todayAbsentStudents?.length || 2} Students
                </strong>
              </div>
              <p className="text-[11px] text-slate-500">
                Automated SMS alerts transmitted to registered parent/guardian mobile numbers.
              </p>
            </div>

            {/* Absent Faculty */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Absent / Leave Faculty:
                </span>
                <strong className="text-amber-800 font-mono font-bold">
                  {attendanceOverview?.todayAbsentFaculty?.length || 0} Faculty
                </strong>
              </div>
              <p className="text-[11px] text-slate-500">
                Substitutions assigned for scheduled lecture periods.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onNavigate && onNavigate('attendance')}
            >
              Open Full Attendance Console
            </Button>
          </div>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* 3. Visual Charts & Institutional Analytics */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Department-wise Students Breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Department-Wise Student Distribution"
            subtitle="Enrollment across approved AICTE engineering disciplines"
            action={
              <Badge variant="primary" size="sm">
                Approved Intake: 600
              </Badge>
            }
          />

          <div className="space-y-3.5">
            {departmentData.map((d) => (
              <div key={d.dept} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 w-12">{d.dept}</span>
                    <span className="text-slate-500 truncate">{d.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">{d.count} Students</span>
                    <span className="text-[11px] text-slate-400 w-8 text-right font-mono">{d.pct}%</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${d.color || 'bg-blue-600'} transition-all duration-500`}
                    style={{ width: `${d.pct * 2.5}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total B.Tech</span>
              <p className="text-base font-extrabold text-blue-900 mt-0.5">350</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total MCA</span>
              <p className="text-base font-extrabold text-indigo-900 mt-0.5">48</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400">CSE Branch Seats</span>
              <p className="text-base font-extrabold text-blue-900 mt-0.5">150</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400">Faculty-Student</span>
              <p className="text-base font-extrabold text-emerald-700 mt-0.5">1:15</p>
            </div>
          </div>
        </Card>

        {/* Chart 2: Weekly Attendance Trend */}
        <Card>
          <CardHeader
            title="Weekly Attendance Trend"
            subtitle="Campus daily check-in rate (Mon-Sat)"
            action={
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Avg 92.3%
              </span>
            }
          />

          <div className="flex items-end justify-between h-48 pt-4 pb-2 px-2 border-b border-slate-100">
            {attendanceTrend.map((item) => (
              <div key={item.day} className="flex flex-col items-center gap-2 flex-1">
                <span className="text-[11px] font-bold text-slate-700">{item.rate}%</span>
                <div className="w-7 bg-slate-100 rounded-t-lg h-32 flex items-end overflow-hidden">
                  <div
                    className="w-full bg-blue-700 hover:bg-blue-600 transition-all rounded-t-lg"
                    style={{ height: `${(item.rate - 70) * 3.3}%` }}
                    title={`${item.day}: ${item.rate}%`}
                  />
                </div>
                <span className="text-[11px] font-semibold text-slate-500">{item.day}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 text-xs text-slate-500 space-y-1">
            <p className="flex items-center justify-between">
              <span>Peak Day:</span>
              <span className="font-bold text-slate-800">Wednesday (96%)</span>
            </p>
            <p className="flex items-center justify-between">
              <span>QR Geo-Fence:</span>
              <span className="font-bold text-emerald-600">Active within Campus</span>
            </p>
          </div>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* 4. Secondary Analytics Row: Fee Realization, Performance & Notices */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fee Collection & Financial Health */}
        <Card>
          <CardHeader
            title="Semester Fee Collection"
            subtitle="Realization vs Target for Academic Year 2025-26"
          />

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span>Total Target: ₹2.10 Cr</span>
                <span className="text-emerald-700">88.3% Collected</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex">
                <div className="h-full bg-blue-700" style={{ width: '88%' }} />
                <div className="h-full bg-amber-400" style={{ width: '12%' }} />
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600">Tuition & Exam Fees</span>
                <span className="font-bold text-slate-900">₹1,42,00,000</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600">Hostel & Mess Charges</span>
                <span className="font-bold text-slate-900">₹43,50,000</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/60 text-amber-900">
                <span>Pending Clearance</span>
                <span className="font-bold">₹24,50,000</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Academic SGPA Performance */}
        <Card>
          <CardHeader
            title="Student SGPA Distribution"
            subtitle="Previous Semester JUT Exam Results"
          />

          <div className="space-y-2.5">
            {performanceGrades.map((g) => (
              <div key={g.grade} className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700 w-28 truncate">{g.grade}</span>
                <div className="flex-1 mx-3 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${g.pct * 2}%` }} />
                </div>
                <span className="font-bold text-slate-900 w-12 text-right">{g.count}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Pass Percentage:</span>
            <span className="font-bold text-emerald-600 text-sm">94.8%</span>
          </div>
        </Card>

        {/* Latest Notices & Feed */}
        <Card>
          <CardHeader
            title="Official Notice Board"
            subtitle="Recent circulars and directives"
            action={
              <button 
                onClick={() => onNavigate && onNavigate('notices')}
                className="text-xs text-blue-700 font-semibold hover:underline cursor-pointer"
              >
                View All
              </button>
            }
          />

          <div className="space-y-3">
            {(data?.recentAnnouncements || [
              { id: 1, title: 'JUT End-Semester Exam Form Submission', priority: 'urgent', created_at: new Date() },
              { id: 2, title: 'T&P Drive: Tata Steel & TCS Digital', priority: 'normal', created_at: new Date() },
              { id: 3, title: 'Library Book Return Before Mid-Term', priority: 'normal', created_at: new Date() }
            ]).slice(0, 3).map((item) => (
              <div key={item.id} className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/70 border border-slate-100 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <Badge 
                    variant={item.priority === 'urgent' ? 'danger' : 'info'} 
                    size="sm"
                  >
                    {item.priority}
                  </Badge>
                  <span className="text-[10px] text-slate-400">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h5 className="text-xs font-bold text-slate-900 line-clamp-1">{item.title}</h5>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* Modals: Add Course & Broadcast Notice */}
      {/* ========================================================================= */}
      <Modal
        isOpen={showCourseModal}
        onClose={() => setShowCourseModal(false)}
        title="Add Academic Course"
        subtitle="Create a new course in the RVS CET curriculum database"
      >
        <form onSubmit={handleCreateCourse} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Course Code"
              required
              value={newCourse.code}
              onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
              placeholder="e.g. CS-605"
            />
            <Input
              label="Credits"
              type="number"
              required
              min="1"
              max="6"
              value={newCourse.credits}
              onChange={(e) => setNewCourse({ ...newCourse, credits: Number(e.target.value) })}
            />
          </div>

          <Input
            label="Course Title"
            required
            value={newCourse.title}
            onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
            placeholder="e.g. Distributed Cloud Computing"
          />

          <Select
            label="Department"
            value={newCourse.department}
            onChange={(e) => setNewCourse({ ...newCourse, department: e.target.value })}
            options={RVS_CONFIG.departments.map(d => ({ value: d.name, label: `${d.name} (${d.code})` }))}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setShowCourseModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Create Course
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showAnnouncementModal}
        onClose={() => setShowAnnouncementModal(false)}
        title="Broadcast College Notice"
        subtitle="Publish circular to all students and faculty"
      >
        <form onSubmit={handleCreateAnnouncement} className="space-y-4 text-xs">
          <Input
            label="Notice Title"
            required
            value={newAnnouncement.title}
            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
            placeholder="e.g. JUT Semester Examination Fee Submission"
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Notice Content
            </label>
            <textarea
              rows="4"
              required
              value={newAnnouncement.content}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
              placeholder="Full details of notice circular..."
              className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Priority"
              value={newAnnouncement.priority}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value })}
              options={[
                { value: 'normal', label: 'Normal Circular' },
                { value: 'urgent', label: 'Urgent / Important' }
              ]}
            />
            <Select
              label="Audience"
              value={newAnnouncement.target_role}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, target_role: e.target.value })}
              options={[
                { value: 'all', label: 'All Students & Faculty' },
                { value: 'student', label: 'Students Only' },
                { value: 'faculty', label: 'Faculty Only' }
              ]}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setShowAnnouncementModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Publish Notice
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
