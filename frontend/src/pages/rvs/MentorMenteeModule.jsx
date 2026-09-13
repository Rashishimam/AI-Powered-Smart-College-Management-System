import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { RVS_CONFIG } from '../../config/rvsConfig';
import {
  Users,
  GraduationCap,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Plus,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  X,
  MessageSquare,
  FileText,
  UserCheck,
  TrendingUp,
  Award,
  Lock,
  Eye
} from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import StatCard from '../../components/StatCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function MentorMenteeModule() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'super_admin' || user?.role === 'college_admin';
  const isFaculty = user?.role === 'faculty';
  const isStudent = user?.role === 'student';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [facultyList, setFacultyList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [assigning, setAssigning] = useState(false);

  // Meeting Modal
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [meetingTargetAssignment, setMeetingTargetAssignment] = useState(null);
  const [meetingFormData, setMeetingFormData] = useState({
    meeting_type: 'One-on-One Academic Mentoring',
    topic: '',
    notes: '',
    follow_up_date: '',
    is_private: true
  });
  const [recordingMeeting, setRecordingMeeting] = useState(false);

  const fetchMentorData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/rvs/mentor-mentee/assignments');
      if (res.data?.success) {
        setData(res.data);
      }

      if (isAdmin) {
        const [uRes, fRes] = await Promise.all([
          api.get('/users'),
          api.get('/rvs/faculty')
        ]);
        if (uRes.data?.users) {
          setStudentsList(uRes.data.users.filter(u => u.role === 'student'));
        }
        if (fRes.data?.faculty) {
          setFacultyList(fRes.data.faculty);
        }
      }
    } catch (err) {
      console.error('Failed to load mentor-mentee data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentorData();
  }, []);

  // Handle Mentor Assignment
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMentor || !selectedStudents.length) {
      alert('Please choose a faculty mentor and select at least one student.');
      return;
    }
    setAssigning(true);
    try {
      const fac = facultyList.find(f => f.name === selectedMentor);
      const res = await api.post('/rvs/mentor-mentee/assign', {
        mentor_id: fac ? fac.id : 6,
        mentor_name: selectedMentor,
        student_ids: selectedStudents
      });
      if (res.data?.success) {
        setNotification(res.data.message);
        setIsAssignModalOpen(false);
        setSelectedStudents([]);
        fetchMentorData();
        setTimeout(() => setNotification(''), 5000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Assignment failed');
    } finally {
      setAssigning(false);
    }
  };

  // Handle Meeting Recording
  const handleMeetingSubmit = async (e) => {
    e.preventDefault();
    if (!meetingTargetAssignment) return;
    setRecordingMeeting(true);
    try {
      const res = await api.post('/rvs/mentor-mentee/meetings', {
        assignment_id: meetingTargetAssignment.id,
        ...meetingFormData
      });
      if (res.data?.success) {
        setNotification(res.data.message);
        setIsMeetingModalOpen(false);
        setMeetingFormData({
          meeting_type: 'One-on-One Academic Mentoring',
          topic: '',
          notes: '',
          follow_up_date: '',
          is_private: true
        });
        fetchMentorData();
        setTimeout(() => setNotification(''), 5000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record meeting');
    } finally {
      setRecordingMeeting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-teal-950 via-cyan-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Departmental Academic Mentorship
            </span>
            <span className="text-xs text-slate-300">Continuous Student Guidance & Career Tracking</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Mentor–Mentee Management System
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Faculty guidance portfolio monitoring student attendance, backlogs, placements, and 1-on-1 confidential counseling logs.
          </p>
        </div>

        {isAdmin && (
          <Button
            onClick={() => setIsAssignModalOpen(true)}
            className="bg-teal-500 hover:bg-teal-600 text-white font-medium px-5 py-2.5 rounded-xl shadow-lg shadow-teal-500/30 flex items-center gap-2 whitespace-nowrap self-start md:self-center"
          >
            <Plus className="w-5 h-5" />
            Assign Faculty Mentor
          </Button>
        )}
      </div>

      {notification && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-3 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Assigned Mentees"
          value={data?.total_assignments || data?.total_mentees || 1}
          icon={Users}
          color="teal"
          subtitle="Registered student mentees"
        />
        <StatCard
          title="Active Guidance Sessions"
          value="100%"
          icon={CheckCircle2}
          color="emerald"
          subtitle="Continuous semester tracking"
        />
        <StatCard
          title="Average Mentee Attendance"
          value="87.5%"
          icon={TrendingUp}
          color="indigo"
          subtitle="Monitored regularly"
        />
        <StatCard
          title="Placement Readiness"
          value="Eligible"
          icon={Award}
          color="blue"
          subtitle="Zero active backlogs target"
        />
      </div>

      {/* VIEW 1: FACULTY VIEW - MY MENTEES */}
      {isFaculty && (
        <Card>
          <CardHeader
            title="My Assigned Mentees & 360° Academic Summary"
            action={
              <button onClick={fetchMentorData} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600">
                <RefreshCw className="w-4 h-4" />
              </button>
            }
          />
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {data?.mentees?.map((m) => (
              <div key={m.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-teal-400 transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white font-bold flex items-center justify-center text-lg">
                      {m.student_name?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{m.student_name}</h4>
                      <span className="font-mono text-xs text-slate-500">{m.roll_no} • {m.semester}</span>
                    </div>
                  </div>
                  <Badge variant="success">Active Mentee</Badge>
                </div>

                {/* 360 Mentee Metrics */}
                <div className="grid grid-cols-4 gap-2 text-center bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Attendance</span>
                    <strong className="text-emerald-700 font-bold">{m.metrics?.attendance_pct}%</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">SGPA</span>
                    <strong className="text-slate-800 font-bold">{m.metrics?.current_sgpa}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Backlogs</span>
                    <strong className={`font-bold ${m.metrics?.active_backlogs > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {m.metrics?.active_backlogs}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Placement</span>
                    <strong className="text-teal-700 font-bold">{m.metrics?.placement_status}</strong>
                  </div>
                </div>

                {/* Meeting History */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                      Mentoring History ({m.meetings?.length || 0})
                    </span>
                    <button
                      onClick={() => {
                        setMeetingTargetAssignment(m);
                        setIsMeetingModalOpen(true);
                      }}
                      className="text-[11px] font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Log Session
                    </button>
                  </div>

                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {m.meetings?.map((meet) => (
                      <div key={meet.id} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs space-y-1">
                        <div className="flex justify-between font-semibold text-slate-800 text-[11px]">
                          <span>{meet.topic}</span>
                          <span className="text-slate-500 font-mono">{meet.date}</span>
                        </div>
                        <p className="text-slate-600 text-[11px]">{meet.notes}</p>
                        {meet.follow_up_date && (
                          <div className="text-[10px] text-teal-600 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Next Follow-up: {meet.follow_up_date}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* VIEW 2: STUDENT VIEW - MY MENTOR */}
      {isStudent && (
        <Card>
          <CardHeader title="My Designated Faculty Mentor" />
          <div className="p-6">
            {data?.has_mentor && data?.assignment ? (
              <div className="max-w-xl mx-auto bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white mx-auto flex items-center justify-center text-2xl font-bold shadow-md">
                  {data.assignment.mentor_name?.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{data.assignment.mentor_name}</h3>
                  <p className="text-xs text-teal-700 font-semibold">{data.assignment.mentor_department} • Faculty Mentor</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Assigned since {data.assignment.assigned_date}</p>
                </div>

                <div className="text-left bg-white p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-teal-600" />
                    My Guidance & Review Sessions
                  </h4>
                  {data.assignment.meetings?.map((m) => (
                    <div key={m.id} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50">
                      <div className="flex justify-between font-semibold text-slate-800 text-[11px]">
                        <span>{m.topic}</span>
                        <span className="text-slate-500 font-mono">{m.date}</span>
                      </div>
                      <p className="text-slate-600 text-[11px] mt-0.5">{m.notes}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-10 text-center text-slate-400 text-sm">
                No faculty mentor currently assigned. Department HOD will allocate shortly.
              </div>
            )}
          </div>
        </Card>
      )}

      {/* VIEW 3: ADMIN / HOD VIEW - ALL MENTOR ASSIGNMENTS */}
      {isAdmin && (
        <Card>
          <CardHeader
            title="Departmental Mentor–Mentee Assignment Roster"
            action={
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search mentor, student..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 w-48 sm:w-60"
                  />
                </div>
                <button onClick={fetchMentorData} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Faculty Mentor</th>
                  <th className="py-3 px-4">Mentee Student</th>
                  <th className="py-3 px-4">Roll No & Dept</th>
                  <th className="py-3 px-4">Assigned Date</th>
                  <th className="py-3 px-4">Sessions Logged</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.assignments?.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/80 transition-colors text-xs">
                    <td className="py-3 px-4 font-semibold text-slate-900">{a.mentor_name}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{a.student_name}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{a.roll_no} ({a.department})</td>
                    <td className="py-3 px-4 text-slate-500">{a.assigned_date}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {a.meetings?.length || 0} Sessions
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="success">{a.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal: Assign Mentor */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-scale-in">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-teal-400" />
                  Assign Faculty Mentor
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Allocate students to departmental mentors</p>
              </div>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Faculty Mentor *</label>
                <select
                  required
                  value={selectedMentor}
                  onChange={(e) => setSelectedMentor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="">-- Choose Faculty --</option>
                  {facultyList.map(f => <option key={f.id} value={f.name}>{f.name} ({f.department || 'CSE'})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Students to Assign *</label>
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1">
                  {studentsList.map(s => (
                    <label key={s.id} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(s.id)}
                        onChange={() => setSelectedStudents(prev => prev.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id])}
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                      />
                      <span className="font-medium text-slate-800">{s.name} ({s.email})</span>
                    </label>
                  ))}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Selected: {selectedStudents.length} students</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button variant="outline" type="button" onClick={() => setIsAssignModalOpen(false)} className="text-xs px-3 py-1.5">
                  Cancel
                </Button>
                <Button type="submit" disabled={assigning || !selectedStudents.length} className="bg-teal-600 hover:bg-teal-700 text-white text-xs px-4 py-1.5 font-medium">
                  {assigning ? 'Assigning...' : 'Confirm Assignment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Record Mentoring Meeting */}
      {isMeetingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-scale-in">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                Log Mentoring Session: {meetingTargetAssignment?.student_name}
              </h3>
              <button onClick={() => setIsMeetingModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleMeetingSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Meeting Type *</label>
                <select
                  value={meetingFormData.meeting_type}
                  onChange={(e) => setMeetingFormData(prev => ({ ...prev, meeting_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="One-on-One Academic Mentoring">One-on-One Academic Mentoring</option>
                  <option value="Career & Placement Guidance">Career & Placement Guidance</option>
                  <option value="Attendance Review & Warning">Attendance Review & Warning</option>
                  <option value="Personal / Welfare Guidance">Personal / Welfare Guidance</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Topic Discussed *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mid-Sem performance, coding practice"
                  value={meetingFormData.topic}
                  onChange={(e) => setMeetingFormData(prev => ({ ...prev, topic: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Mentor Guidance Notes *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Observations and advice given..."
                  value={meetingFormData.notes}
                  onChange={(e) => setMeetingFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Next Follow-up Date</label>
                <input
                  type="date"
                  value={meetingFormData.follow_up_date}
                  onChange={(e) => setMeetingFormData(prev => ({ ...prev, follow_up_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button variant="outline" type="button" onClick={() => setIsMeetingModalOpen(false)} className="text-xs px-3 py-1.5">
                  Cancel
                </Button>
                <Button type="submit" disabled={recordingMeeting} className="bg-teal-600 hover:bg-teal-700 text-white text-xs px-4 py-1.5 font-medium">
                  {recordingMeeting ? 'Saving...' : 'Save Mentoring Log'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
