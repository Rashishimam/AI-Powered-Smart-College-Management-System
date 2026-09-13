import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import {
  GraduationCap,
  Users,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Plus,
  Search,
  Filter,
  Sparkles,
  RefreshCw,
  Award,
  BookOpen,
  Download,
  CheckSquare,
  Square
} from 'lucide-react';

export default function TrainingManagementModule() {
  const [loading, setLoading] = useState(true);
  const [trainings, setTrainings] = useState([]);
  const [activeType, setActiveType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [toast, setToast] = useState(null);

  // Form state
  const [form, setForm] = useState({
    title: '',
    training_type: 'Technical',
    trainer_name: '',
    venue: 'Seminar Hall 1',
    date: '',
    time: '10:00 AM - 01:00 PM',
    departments: ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE'],
    eligible_semesters: ['6th Semester', '8th Semester'],
    capacity: 100,
    description: ''
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {
        console.error(e);
      }
    }
    fetchTrainings();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchTrainings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/rvs/adv/trainings');
      if (res.data?.success) {
        setTrainings(res.data.trainings || []);
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading training sessions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post('/api/rvs/adv/trainings', form);
      if (res.data?.success) {
        showToast('Training session scheduled successfully!');
        setShowCreateModal(false);
        setForm({
          title: '',
          training_type: 'Technical',
          trainer_name: '',
          venue: 'Seminar Hall 1',
          date: '',
          time: '10:00 AM - 01:00 PM',
          departments: ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE'],
          eligible_semesters: ['6th Semester', '8th Semester'],
          capacity: 100,
          description: ''
        });
        fetchTrainings();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to create training', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleRegister = async (trainingId) => {
    try {
      const res = await api.post(`/api/rvs/adv/trainings/${trainingId}/register`);
      if (res.data?.success) {
        showToast(res.data.message || 'Registration successful!');
        fetchTrainings();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Registration failed', 'error');
    }
  };

  const handleToggleAttendance = async (studentId, currentStatus) => {
    if (!selectedTraining) return;
    try {
      const res = await api.post(`/api/rvs/adv/trainings/${selectedTraining.id}/attendance`, {
        student_id: studentId,
        attended: !currentStatus
      });
      if (res.data?.success) {
        // Update local roster
        setSelectedTraining(res.data.training);
        fetchTrainings();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update attendance', 'error');
    }
  };

  const handleExportAttendance = () => {
    if (!selectedTraining) return;
    const headers = ['Roll No', 'Student Name', 'Registered At', 'Attendance Status'];
    const rows = (selectedTraining.registered_students || []).map(s => [
      s.roll_no,
      `"${s.name}"`,
      s.registered_at,
      s.attended ? 'PRESENT' : 'ABSENT'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Training_Attendance_${selectedTraining.title.slice(0, 20)}_${selectedTraining.date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Attendance report exported');
  };

  const filtered = trainings.filter(item => {
    const q = searchQuery.toLowerCase();
    const matchSearch = (item.title || '').toLowerCase().includes(q) ||
      (item.trainer_name || '').toLowerCase().includes(q) ||
      (item.venue || '').toLowerCase().includes(q);

    if (activeType !== 'ALL') return matchSearch && item.training_type === activeType;
    return matchSearch;
  });

  const isStaff = ['super_admin', 'college_admin', 'faculty'].includes(currentUser?.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/30 p-4 md:p-6 lg:p-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-white transition-all transform animate-bounce ${toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'}`}>
          <Sparkles className="w-5 h-5" />
          <span className="font-medium text-sm">{toast.msg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-indigo-700 uppercase mb-1">
              <GraduationCap className="w-4 h-4" />
              <span>Training & Placement Cell</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
              Campus Placement & Skills Training
              <span className="text-xs bg-indigo-100 text-indigo-800 font-semibold px-2.5 py-1 rounded-full border border-indigo-200">
                Industry Ready
              </span>
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Technical masterclasses, aptitude bootcamps, mock interviews, and student attendance registers for RVS College.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            {isStaff && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition shadow-sm"
              >
                <Plus className="w-4 h-4" />
                New Training Session
              </button>
            )}
            <button
              onClick={fetchTrainings}
              className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition border border-slate-300"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search training title, trainer, venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'Coding', 'Aptitude', 'Interview Preparation', 'Technical', 'Soft Skills'].map(t => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeType === t
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t === 'ALL' ? 'All Types' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Trainings */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
          <p className="text-slate-500 text-xs">Loading training sessions...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">No training sessions scheduled</h3>
          <p className="text-slate-400 text-xs mt-1">Check back later or schedule a new workshop.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    {item.training_type}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {item.registered_count} / {item.capacity} Enrolled
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1">{item.title}</h3>
                <p className="text-xs font-medium text-slate-600 mb-3">Trainer: <strong className="text-slate-800">{item.trainer_name}</strong></p>

                <div className="space-y-1.5 text-xs text-slate-500 pt-3 border-t border-slate-100 mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{item.date} • {item.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{item.venue}</span>
                  </div>
                </div>

                {item.description && (
                  <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {isStaff ? (
                  <button
                    onClick={() => {
                      setSelectedTraining(item);
                      setShowRosterModal(true);
                    }}
                    className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-xl transition border border-indigo-200 flex items-center justify-center gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5" />
                    View Roster & Attendance ({item.registered_count})
                  </button>
                ) : item.is_user_registered ? (
                  <div className="w-full py-2 bg-emerald-50 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 text-center flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Registered {item.attended ? '• Attendance Confirmed' : ''}
                  </div>
                ) : (
                  <button
                    onClick={() => handleRegister(item.id)}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition shadow-sm"
                  >
                    Register for Training
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Training Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5 text-indigo-700">
                <GraduationCap className="w-5 h-5" />
                <h3 className="text-lg font-bold text-slate-900">Schedule Placement Training</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Session Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Masterclass on Graph Algorithms & Trie Structures"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Training Type</label>
                  <select
                    value={form.training_type}
                    onChange={(e) => setForm({ ...form, training_type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Coding">Coding</option>
                    <option value="Aptitude">Aptitude</option>
                    <option value="Interview Preparation">Interview Preparation</option>
                    <option value="Soft Skills">Soft Skills</option>
                    <option value="Communication">Communication</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Trainer / Speaker *</label>
                  <input
                    type="text"
                    placeholder="e.g. Er. S. Chatterjee"
                    value={form.trainer_name}
                    onChange={(e) => setForm({ ...form, trainer_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Date *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Time Slot *</label>
                  <input
                    type="text"
                    placeholder="10:00 AM - 01:00 PM"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Venue</label>
                  <input
                    type="text"
                    placeholder="Seminar Hall 1 / Online"
                    value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Max Capacity</label>
                  <input
                    type="number"
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Session Syllabus / Description</label>
                <textarea
                  rows="3"
                  placeholder="Key topics, takeaways, prerequisites..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm disabled:opacity-50"
                >
                  {creating ? 'Scheduling...' : 'Schedule Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Roster & Attendance Modal */}
      {showRosterModal && selectedTraining && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedTraining.title}</h3>
                <p className="text-xs text-slate-500">
                  {selectedTraining.date} • {selectedTraining.venue} • {selectedTraining.registered_students?.length || 0} Registered
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportAttendance}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition border border-slate-300 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Sheet
                </button>
                <button onClick={() => setShowRosterModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 font-semibold border-b border-slate-100">
                    <th className="pb-2">Roll No</th>
                    <th className="pb-2">Student Name</th>
                    <th className="pb-2">Registered Date</th>
                    <th className="pb-2 text-right">Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(selectedTraining.registered_students || []).map((s) => (
                    <tr key={s.student_id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 font-mono font-bold text-slate-700">{s.roll_no}</td>
                      <td className="py-2.5 font-bold text-slate-900">{s.name}</td>
                      <td className="py-2.5 text-slate-500">{s.registered_at}</td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => handleToggleAttendance(s.student_id, s.attended)}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition ${
                            s.attended
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {s.attended ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                          {s.attended ? 'Present' : 'Mark Present'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
              <button
                onClick={() => setShowRosterModal(false)}
                className="px-5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Close Roster
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
