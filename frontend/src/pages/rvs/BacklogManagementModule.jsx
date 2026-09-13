import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Award,
  BookOpen,
  Calendar,
  X,
  FileCheck,
  Check
} from 'lucide-react';
import RVSLogo from '../../components/RVSLogo';
import { RVS_CONFIG } from '../../config/rvsConfig';

export default function BacklogManagementModule() {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';
  const isAdmin = user?.role === 'super_admin' || user?.role === 'college_admin';

  const [loading, setLoading] = useState(true);
  const [backlogs, setBacklogs] = useState([]);
  const [summary, setSummary] = useState({ total: 0, pending: 0, cleared: 0 });
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedSem, setSelectedSem] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Clearing Modal
  const [clearingItem, setClearingItem] = useState(null);
  const [clearMarks, setClearMarks] = useState(55);
  const [clearRemarks, setClearRemarks] = useState('Cleared in Summer Supplementary Examination 2025');
  const [clearing, setClearing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [notification, setNotification] = useState('');

  const fetchBacklogs = async () => {
    try {
      setLoading(true);
      if (isStudent) {
        const res = await api.get(`/rvs/backlogs/student/${user.id}`);
        if (res.data?.success) {
          setBacklogs(res.data.allRecords || []);
          setSummary(res.data.summary || { total: 0, pending: 0, cleared: 0 });
        }
      } else {
        const params = {};
        if (selectedDept !== 'all') params.department = selectedDept;
        if (selectedSem !== 'all') params.semester = selectedSem;
        if (selectedStatus !== 'all') params.status = selectedStatus;
        if (search) params.search = search;

        const res = await api.get('/rvs/backlogs', { params });
        if (res.data?.success) {
          setBacklogs(res.data.backlogs || []);
          setSummary(res.data.summary || { total: 0, pending: 0, cleared: 0 });
        }
      }
    } catch (err) {
      console.error('Failed to load backlogs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBacklogs();
  }, [selectedDept, selectedSem, selectedStatus, search, isStudent]);

  const handleSyncFromResults = async () => {
    try {
      setSyncing(true);
      const res = await api.post('/rvs/backlogs/sync-from-results');
      if (res.data?.success) {
        setNotification(res.data.message);
        fetchBacklogs();
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleConfirmClear = async (e) => {
    e.preventDefault();
    if (!clearingItem) return;
    try {
      setClearing(true);
      const res = await api.post('/rvs/backlogs/clear', {
        backlog_id: clearingItem.id,
        marks: clearMarks,
        remarks: clearRemarks
      });
      if (res.data?.success) {
        setNotification(res.data.message);
        setClearingItem(null);
        fetchBacklogs();
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to clear backlog');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
              RVS Examination & Results Directorate
            </span>
            <span className="text-xs text-slate-500">
              Affiliated to JUT Ranchi &bull; Ordinance Compliance
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {isStudent ? 'My Academic Backlogs & Supplementary History' : 'Backlog Management & Supplementary Registry'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isStudent
              ? 'Review pending papers, attempt history, cleared subjects, and supplementary exam eligibility.'
              : 'Track student backlogs, paper clearance attempts, and automated synchronization with published exam results.'}
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncFromResults}
              disabled={syncing}
              className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              Sync from Published Results
            </button>
          </div>
        )}
      </div>

      {/* Global Notification */}
      {notification && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Total Backlogs Logged</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">{summary.total}</p>
          <span className="text-[10px] text-slate-400 mt-1 block">Cumulative paper attempts</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Active / Pending</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-black mt-2 font-mono ${summary.pending > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {summary.pending}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {summary.pending > 0 ? 'Supplementary Exam Required' : 'All Clear - Zero Active Backlogs'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Cleared Historically</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2 font-mono">{summary.cleared}</p>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {summary.total > 0 ? `${((summary.cleared / summary.total) * 100).toFixed(0)}% Clearance Rate` : 'No backlogs recorded'}
          </span>
        </div>
      </div>

      {/* Filters (Admin & Faculty Only) */}
      {!isStudent && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student, roll no, subject code..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            >
              <option value="all">All Departments</option>
              {RVS_CONFIG.departments.map(d => (
                <option key={d.code} value={d.code}>{d.code} - {d.name}</option>
              ))}
            </select>

            <select
              value={selectedSem}
              onChange={(e) => setSelectedSem(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            >
              <option value="all">All Semesters</option>
              {['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending (Active)</option>
              <option value="Cleared">Cleared</option>
            </select>
          </div>
        </div>
      )}

      {/* Backlogs Table */}
      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                {!isStudent && <th className="py-3.5 px-4">Student</th>}
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4">Semester</th>
                <th className="py-3.5 px-4">Original Exam</th>
                <th className="py-3.5 px-4 text-center">Attempt #</th>
                <th className="py-3.5 px-4 text-center">Marks</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Cleared Date / Remarks</th>
                {isAdmin && <th className="py-3.5 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={isStudent ? 7 : 9} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-blue-900/20 border-t-blue-900 rounded-full animate-spin mx-auto mb-2"></div>
                    Loading backlog records...
                  </td>
                </tr>
              ) : backlogs.length === 0 ? (
                <tr>
                  <td colSpan={isStudent ? 7 : 9} className="py-12 text-center text-slate-500">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="font-bold text-slate-800">No Backlogs Found</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isStudent
                        ? 'Congratulations! You have zero pending or historical backlogs.'
                        : 'No students matching the current filter have backlogs.'}
                    </p>
                  </td>
                </tr>
              ) : (
                backlogs.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    {!isStudent && (
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900 text-xs">{b.student_name}</p>
                        <p className="font-mono text-[10px] text-blue-900">{b.roll_no}</p>
                      </td>
                    )}
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900 text-xs">{b.subject_name}</p>
                      <span className="font-mono text-[10px] text-amber-700 font-semibold">{b.subject_code}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{b.semester}</td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">{b.original_exam}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">{b.attempt_number}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">{b.marks || '-'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        b.status === 'Cleared'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-[11px]">
                      {b.status === 'Cleared' ? (
                        <span className="text-emerald-700 font-semibold">Cleared on {b.cleared_date}</span>
                      ) : (
                        <span className="text-slate-500">{b.remarks || 'Awaiting Supplementary Exam'}</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="py-3 px-4 text-right">
                        {b.status === 'Pending' ? (
                          <button
                            onClick={() => {
                              setClearingItem(b);
                              setClearMarks(55);
                              setClearRemarks('Cleared in Supplementary Examination');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold transition-all border border-emerald-200 cursor-pointer"
                          >
                            Clear Backlog
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">History Recorded</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clear Backlog Modal */}
      {clearingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-950 border border-slate-800 text-slate-100 rounded-3xl p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setClearingItem(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-base font-bold text-white">Record Backlog Clearance</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Student: <strong className="text-slate-200">{clearingItem.student_name}</strong> ({clearingItem.roll_no})
              </p>
              <p className="text-xs text-amber-400 font-mono mt-0.5">
                {clearingItem.subject_code} - {clearingItem.subject_name}
              </p>
            </div>

            <form onSubmit={handleConfirmClear} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Cleared Marks (out of 100) *</label>
                <input
                  type="number"
                  min="40"
                  max="100"
                  required
                  value={clearMarks}
                  onChange={(e) => setClearMarks(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl font-mono text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Official Remarks / Session Note</label>
                <input
                  type="text"
                  required
                  value={clearRemarks}
                  onChange={(e) => setClearRemarks(e.target.value)}
                  placeholder="e.g. Cleared in Summer Supplementary Exam 2025"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/40 text-[11px] text-blue-300">
                <p>
                  <strong>Note:</strong> Clearing this backlog preserves all historical attempt records for academic audit while restoring the student's eligibility for placement drives and semester advancement.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setClearingItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={clearing}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {clearing ? 'Saving...' : 'Confirm Clearance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
