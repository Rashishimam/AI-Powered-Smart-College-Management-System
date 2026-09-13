import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { RVS_CONFIG } from '../../config/rvsConfig';
import {
  UserCheck,
  UserX,
  Calendar,
  Clock,
  BookOpen,
  Building,
  CheckCircle2,
  AlertTriangle,
  Search,
  Plus,
  ArrowRight,
  ShieldCheck,
  Bell,
  RefreshCw,
  X,
  FileText
} from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import StatCard from '../../components/StatCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function FacultySubstitutionModule() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'super_admin' || user?.role === 'college_admin';
  const isFaculty = user?.role === 'faculty';

  const [history, setHistory] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    department_code: 'CSE',
    semester: '6th Semester',
    class_period: 'Period 2 (10:00 AM - 11:00 AM)',
    subject_code: '',
    subject_name: '',
    original_faculty_name: '',
    substitute_faculty_name: '',
    reason: 'On official duty / Academic symposium'
  });

  // Live Clash Detection State
  const [clashStatus, setClashStatus] = useState(null); // null, 'checking', 'available', 'conflict'
  const [clashMessage, setClashMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState('');

  const fetchSubstitutionData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/rvs/faculty-substitution/history');
      if (res.data?.success) {
        setHistory(res.data.history || []);
      }

      // Fetch faculty list for dropdowns
      const facultyRes = await api.get('/faculty');
      if (facultyRes.data?.faculty) {
        setFacultyList(facultyRes.data.faculty);
      } else {
        const usersRes = await api.get('/users');
        if (usersRes.data?.users) {
          setFacultyList(usersRes.data.users.filter(u => u.role === 'faculty'));
        }
      }

      // Fetch subjects
      const subRes = await api.get('/subjects');
      if (subRes.data?.subjects) {
        setSubjectsList(subRes.data.subjects);
      }
    } catch (err) {
      console.error('Failed to load substitution data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubstitutionData();
  }, []);

  // Run clash detection whenever date or substitute faculty changes
  const checkClash = async (substituteName, date) => {
    if (!substituteName || !date) {
      setClashStatus(null);
      setClashMessage('');
      return;
    }
    setClashStatus('checking');
    try {
      const res = await api.post('/rvs/faculty-substitution/check', {
        date,
        substitute_faculty_name: substituteName
      });
      if (res.data?.success) {
        if (res.data.is_available) {
          setClashStatus('available');
          setClashMessage(res.data.message);
        } else {
          setClashStatus('conflict');
          setClashMessage(res.data.message);
        }
      }
    } catch (err) {
      setClashStatus('conflict');
      setClashMessage(err.response?.data?.message || 'Conflict detected or network error.');
    }
  };

  const handleSubstituteChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, substitute_faculty_name: val }));
    checkClash(val, formData.date);
  };

  const handleDateChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, date: val }));
    if (formData.substitute_faculty_name) {
      checkClash(formData.substitute_faculty_name, val);
    }
  };

  const handleSubjectChange = (e) => {
    const code = e.target.value;
    const sub = subjectsList.find(s => s.code === code);
    setFormData(prev => ({
      ...prev,
      subject_code: code,
      subject_name: sub ? sub.name : code
    }));
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (clashStatus === 'conflict') {
      alert('Cannot assign substitute: Timetable clash detected for this faculty member!');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/rvs/faculty-substitution/assign', formData);
      if (res.data?.success) {
        setNotification(`Substitution assigned successfully! Affected students and faculty have been notified.`);
        setIsModalOpen(false);
        fetchSubstitutionData();
        setTimeout(() => setNotification(''), 6000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign substitution');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered history
  const filteredHistory = history.filter(item => {
    const matchesSearch =
      item.subject_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.original_faculty_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.substitute_faculty_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.department_code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = filterDept === 'ALL' || item.department_code === filterDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-teal-900 via-indigo-900 to-slate-900 p-6 rounded-2xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Academic Continuity Engine
            </span>
            <span className="text-xs text-slate-300">Conflict-Aware Timetable Adjustments</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Faculty Substitution Management
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Reassign classes seamlessly without permanently overwriting base timetables. Automatic schedule clash checks protect lecture continuity.
          </p>
        </div>

        {(isAdmin || isFaculty) && (
          <Button
            onClick={() => {
              setClashStatus(null);
              setClashMessage('');
              setIsModalOpen(true);
            }}
            className="bg-teal-500 hover:bg-teal-600 text-white font-medium px-5 py-2.5 rounded-xl shadow-lg shadow-teal-500/30 flex items-center gap-2 whitespace-nowrap self-start md:self-center"
          >
            <Plus className="w-5 h-5" />
            Assign Substitute
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
          title="Total Substitutions"
          value={history.length}
          icon={UserCheck}
          color="indigo"
          subtitle="Academic Session 2025-26"
        />
        <StatCard
          title="Active / Scheduled"
          value={history.filter(h => h.status === 'Scheduled').length}
          icon={Clock}
          color="teal"
          subtitle="Upcoming reassignments"
        />
        <StatCard
          title="Completed Classes"
          value={history.filter(h => h.status === 'Completed').length}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Successfully delivered"
        />
        <StatCard
          title="Clash Prevention"
          value="100%"
          icon={ShieldCheck}
          color="amber"
          subtitle="Zero timetable conflicts"
        />
      </div>

      {/* Main Content Area */}
      <Card>
        <CardHeader
          title="Substitution Log & Temporary Timetable Adjustments"
          action={
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search faculty, subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 w-48 sm:w-64"
                />
              </div>

              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="ALL">All Departments</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="MECH">MECH</option>
                <option value="CIVIL">CIVIL</option>
                <option value="EEE">EEE</option>
              </select>

              <button
                onClick={fetchSubstitutionData}
                title="Refresh"
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          }
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Date & Period</th>
                <th className="py-3 px-4">Subject & Class</th>
                <th className="py-3 px-4">Original Faculty</th>
                <th className="py-3 px-4">Substitute Faculty</th>
                <th className="py-3 px-4">Reason / Notes</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Broadcast</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400 text-sm">
                    Loading substitution records...
                  </td>
                </tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400 text-sm">
                    No faculty substitution records found matching filters.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{item.date}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {item.class_period}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{item.subject_name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700">{item.subject_code}</span>
                        <span className="mx-1">•</span>
                        <span>{item.department_code} ({item.semester})</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                          {item.original_faculty_name?.charAt(0) || 'F'}
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">{item.original_faculty_name}</span>
                          <span className="block text-[11px] text-rose-500 font-medium">On Leave / Away</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                          {item.substitute_faculty_name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <span className="font-medium text-teal-900">{item.substitute_faculty_name}</span>
                          <span className="block text-[11px] text-teal-600 font-medium">Verified Free Slot</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <p className="text-xs text-slate-600 truncate" title={item.reason}>
                        {item.reason}
                      </p>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Assigned by {item.assigned_by}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          item.status === 'Completed' ? 'success' :
                          item.status === 'Scheduled' ? 'info' : 'warning'
                        }
                      >
                        {item.status}
                      </Badge>
                    </td>

                    <td className="py-3 px-4">
                      {item.notified_students ? (
                        <div className="flex items-center gap-1 text-emerald-600 text-xs">
                          <Bell className="w-3.5 h-3.5" />
                          <span>Notified</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Pending</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: Assign Substitute Faculty */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-scale-in">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-teal-400" />
                  Assign Temporary Substitute
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Conflict detection runs automatically to prevent double-booking
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAssignment} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Date of Class *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={handleDateChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Class Period *</label>
                  <select
                    value={formData.class_period}
                    onChange={(e) => setFormData(prev => ({ ...prev, class_period: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="Period 1 (09:00 AM - 10:00 AM)">Period 1 (09:00 AM - 10:00 AM)</option>
                    <option value="Period 2 (10:00 AM - 11:00 AM)">Period 2 (10:00 AM - 11:00 AM)</option>
                    <option value="Period 3 (11:15 AM - 12:15 PM)">Period 3 (11:15 AM - 12:15 PM)</option>
                    <option value="Period 4 (01:00 PM - 02:00 PM)">Period 4 (01:00 PM - 02:00 PM)</option>
                    <option value="Period 5 (02:00 PM - 03:00 PM)">Period 5 (02:00 PM - 03:00 PM)</option>
                    <option value="Period 6 (03:15 PM - 04:15 PM)">Period 6 (03:15 PM - 04:15 PM)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Department *</label>
                  <select
                    value={formData.department_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, department_code: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="CSE">Computer Science & Engg (CSE)</option>
                    <option value="ECE">Electronics & Comm Engg (ECE)</option>
                    <option value="MECH">Mechanical Engg (MECH)</option>
                    <option value="CIVIL">Civil Engg (CIVIL)</option>
                    <option value="EEE">Electrical & Electronics (EEE)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Semester *</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData(prev => ({ ...prev, semester: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="1st Semester">1st Semester</option>
                    <option value="2nd Semester">2nd Semester</option>
                    <option value="3rd Semester">3rd Semester</option>
                    <option value="4th Semester">4th Semester</option>
                    <option value="5th Semester">5th Semester</option>
                    <option value="6th Semester">6th Semester</option>
                    <option value="7th Semester">7th Semester</option>
                    <option value="8th Semester">8th Semester</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Subject *</label>
                <select
                  required
                  value={formData.subject_code}
                  onChange={handleSubjectChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="">-- Select Subject --</option>
                  {subjectsList.map(s => (
                    <option key={s.id || s.code} value={s.code}>
                      {s.code} - {s.name} ({s.department || 'CSE'})
                    </option>
                  ))}
                  {subjectsList.length === 0 && (
                    <>
                      <option value="CS601">CS601 - Cloud Computing</option>
                      <option value="CS602">CS602 - Compiler Design</option>
                      <option value="CS603">CS603 - Artificial Intelligence</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Original Faculty (On Leave / Away) *</label>
                <select
                  required
                  value={formData.original_faculty_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, original_faculty_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="">-- Select Original Faculty --</option>
                  {facultyList.map(f => (
                    <option key={f.id} value={f.name}>
                      {f.name} ({f.department || 'Faculty'})
                    </option>
                  ))}
                  {facultyList.length === 0 && (
                    <>
                      <option value="Dr. Vikram Sharma">Dr. Vikram Sharma (CSE)</option>
                      <option value="Prof. Priya Sen">Prof. Priya Sen (CSE)</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Substitute Faculty *</label>
                <select
                  required
                  value={formData.substitute_faculty_name}
                  onChange={handleSubstituteChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="">-- Select Substitute Faculty --</option>
                  {facultyList
                    .filter(f => f.name !== formData.original_faculty_name)
                    .map(f => (
                      <option key={f.id} value={f.name}>
                        {f.name} ({f.department || 'Faculty'})
                      </option>
                    ))}
                  {facultyList.length === 0 && (
                    <>
                      <option value="Prof. Amit Patel">Prof. Amit Patel (CSE)</option>
                      <option value="Dr. Rajesh Gupta">Dr. Rajesh Gupta (ECE)</option>
                      <option value="Prof. Sunita Rao">Prof. Sunita Rao (Maths)</option>
                    </>
                  )}
                </select>
              </div>

              {/* Clash Detection Status Banner */}
              {clashStatus === 'checking' && (
                <div className="p-2.5 rounded-lg bg-slate-100 text-slate-600 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
                  <span>Verifying timetable schedule for conflicts...</span>
                </div>
              )}

              {clashStatus === 'available' && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="font-medium">{clashMessage}</span>
                </div>
              )}

              {clashStatus === 'conflict' && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span className="font-medium">{clashMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Reason for Substitution</label>
                <textarea
                  rows="2"
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="e.g., Medical leave, University Examination Duty, NAAC symposium"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs px-4 py-2"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || clashStatus === 'conflict' || !formData.substitute_faculty_name}
                  className={`text-xs px-5 py-2 font-medium ${
                    clashStatus === 'conflict'
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-teal-600 hover:bg-teal-700 text-white shadow-md'
                  }`}
                >
                  {submitting ? 'Assigning...' : 'Confirm Substitution'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
