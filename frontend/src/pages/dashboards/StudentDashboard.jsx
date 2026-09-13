import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import StatCard from '../../components/StatCard';
import RVSLogo from '../../components/RVSLogo';
import { RVS_CONFIG } from '../../config/rvsConfig';
import { 
  GraduationCap, 
  BookOpen, 
  Clock, 
  Award, 
  Calendar, 
  Megaphone, 
  CheckCircle2, 
  TrendingUp,
  FileCheck,
  CreditCard,
  QrCode,
  Briefcase
} from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function StudentDashboard({ onNavigate }) {
  const [data, setData] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStudentData = async () => {
      try {
        setLoading(true);
        const [dashRes, attRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/rvs/attendance/student/history').catch(() => ({ data: null }))
        ]);

        if (dashRes.data?.success) {
          setData(dashRes.data.stats);
        }
        if (attRes?.data?.success) {
          setAttendanceStats(attRes.data.summary);
        }
      } catch (err) {
        console.error('Failed to load student dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStudentData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-900/20 border-t-blue-900 rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-medium">Loading Student Workspace...</p>
        </div>
      </div>
    );
  }

  const timetable = [
    { time: '09:00 AM - 10:30 AM', course: 'CS-401', room: 'Hall B-201', subject: 'Advanced Distributed Systems', faculty: 'Prof. Jeevan Kumar' },
    { time: '11:00 AM - 12:30 PM', course: 'CS-302', room: 'Computing Lab 4', subject: 'Database Internals & Optimization', faculty: 'Dr. Smita Dash' },
    { time: '02:00 PM - 03:30 PM', course: 'CS-205', room: 'Hall A-105', subject: 'Algorithms & Computational Geometry', faculty: 'Prof. Shailendra K. Prasad' }
  ];

  const overallPct = attendanceStats?.overallPercentage ?? 93.2;
  const minRequired = attendanceStats?.minRequired ?? 75;
  const hasLowAttendance = overallPct < minRequired;

  return (
    <div className="space-y-6 font-sans">
      {/* Low Attendance Alert Banner if below threshold */}
      {hasLowAttendance && (
        <div 
          onClick={() => onNavigate && onNavigate('attendance')}
          className="p-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-700 text-white shadow-md border border-rose-500 cursor-pointer hover:opacity-95 transition-opacity flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-white text-rose-800 tracking-wider">
                LOW ATTENDANCE WARNING
              </span>
              <p className="text-xs text-rose-100 mt-0.5">
                Your attendance is <strong>{overallPct}%</strong> (Below mandatory {minRequired}% requirement). Click to view full Attendance History.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="bg-white text-rose-800 border-white hover:bg-rose-50 shrink-0">
            View History
          </Button>
        </div>
      )}

      {/* Student Profile & Academic Welcome Banner */}
      <div className="erp-card bg-gradient-to-r from-[#0a192f] via-[#0f2347] to-[#1e3a8a] text-white p-6 rounded-2xl relative overflow-hidden shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-4">
            <RVSLogo size="md" variant="light" showText={false} subtitle={false} className="shrink-0" />
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500 text-white">
                  RVS Undergraduate Student
                </span>
                <span className="text-xs text-amber-400 font-mono font-bold">
                  Roll: {data?.rollNo || '23RVSCSE042'}
                </span>
                <span className="text-xs text-slate-300">
                  &bull; {data?.department || 'B.Tech CSE'} (6th Semester)
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {data?.studentName || 'Rahul Kumar Verma'}
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                {RVS_CONFIG.name}, Jamshedpur &bull; University Reg: {data?.regNo || 'JUT/2023/CSE/0189'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="gold"
              size="sm"
              icon={QrCode}
              onClick={() => onNavigate && onNavigate('attendance')}
            >
              Scan QR Attendance
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={CreditCard}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              onClick={() => onNavigate && onNavigate('idcards')}
            >
              Digital ID Card
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards with Clickable Attendance Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => onNavigate && onNavigate('attendance')}
          className="cursor-pointer transform transition-transform hover:-translate-y-0.5"
          title="Click to open Full Attendance History"
        >
          <StatCard
            title="Attendance Rate"
            value={`${overallPct}%`}
            subtitle={`Present: ${attendanceStats?.present ?? 169} | Absent: ${attendanceStats?.absent ?? 6} | Classes: ${attendanceStats?.totalClasses ?? 191}`}
            icon={CheckCircle2}
            color={hasLowAttendance ? 'rose' : 'emerald'}
            trend={hasLowAttendance ? 'LOW ATTENDANCE' : 'View History →'}
            trendType={hasLowAttendance ? 'down' : 'up'}
          />
        </div>

        <StatCard
          title="Cumulative CGPA"
          value={data?.cumulativeGpa || '8.72'}
          subtitle="Rank #4 in CSE Department"
          icon={Award}
          color="gold"
          trend="First Class with Dist."
          trendType="up"
        />

        <StatCard
          title="Enrolled Subjects"
          value={data?.enrolledCourses || 6}
          subtitle="24 Academic Credits"
          icon={BookOpen}
          color="blue"
          trend="Spring '26"
        />

        <StatCard
          title="Semester Fee Status"
          value="Cleared"
          subtitle="No pending dues recorded"
          icon={CreditCard}
          color="emerald"
          trend="Receipt #RVS-7890"
          trendType="up"
        />
      </div>

      {/* Two Column Layout: Today's Schedule & Academic Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Classes */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Today's Academic Schedule"
            subtitle="Lectures, practical lab sessions, and tutorial hours"
            action={
              <Badge variant="primary" size="sm">
                Friday Schedule
              </Badge>
            }
          />

          <div className="space-y-3">
            {timetable.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded-md">
                      {item.course}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">{item.subject}</h4>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Faculty: <span className="font-medium text-slate-700">{item.faculty}</span> &bull; Venue: {item.room}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs self-start sm:self-center">
                  <Clock className="w-3.5 h-3.5 text-blue-700" />
                  <span>{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Links & Campus Feed */}
        <Card>
          <CardHeader
            title="Campus Notifications"
            subtitle="Directives for 6th Sem B.Tech"
          />

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100">
              <div className="flex items-center justify-between mb-1">
                <Badge variant="info" size="sm">T&P Cell</Badge>
                <span className="text-[10px] text-slate-400">Today</span>
              </div>
              <h5 className="font-bold text-slate-900">Tata Steel Pre-Placement Talk</h5>
              <p className="text-[11px] text-slate-600 mt-1">Auditiorium 1 at 3:30 PM. Formal attire required.</p>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-100">
              <div className="flex items-center justify-between mb-1">
                <Badge variant="warning" size="sm">Examination</Badge>
                <span className="text-[10px] text-slate-400">Yesterday</span>
              </div>
              <h5 className="font-bold text-slate-900">JUT Mid-Term Admit Cards</h5>
              <p className="text-[11px] text-slate-600 mt-1">Available for download from portal once clearance is signed.</p>
            </div>

            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => onNavigate && onNavigate('notices')}
              >
                View Notice Board
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
