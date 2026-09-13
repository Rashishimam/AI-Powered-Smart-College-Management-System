import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import {
  Briefcase,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Settings,
  Search,
  Filter,
  BarChart2,
  BookOpen,
  Calendar,
  Sparkles,
  RefreshCw,
  Award,
  ChevronRight
} from 'lucide-react';

export default function FacultyWorkloadModule() {
  const [loading, setLoading] = useState(true);
  const [workloadData, setWorkloadData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configForm, setConfigForm] = useState({
    max_weekly_teaching_hours: 18,
    max_lab_hours: 6,
    max_mentees: 30
  });
  const [savingConfig, setSavingConfig] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resAnalytics, resConfig] = await Promise.all([
        api.get('/api/rvs/adv/workload/analytics'),
        api.get('/api/rvs/adv/workload/config')
      ]);

      if (resAnalytics.data?.success) {
        setWorkloadData(resAnalytics.data);
      }
      if (resConfig.data?.success) {
        setConfigForm(resConfig.data.config);
      }
    } catch (err) {
      console.error('Error fetching workload data:', err);
      showToast('Error loading faculty workload analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const res = await api.post('/api/rvs/adv/workload/config', configForm);
      if (res.data?.success) {
        showToast('Workload thresholds successfully updated');
        setShowConfigModal(false);
        fetchData();
      }
    } catch (err) {
      console.error('Error saving config:', err);
      showToast(err.response?.data?.message || 'Failed to update configuration', 'error');
    } finally {
      setSavingConfig(false);
    }
  };

  const facultyList = workloadData?.faculty_workloads || [];
  const filteredFaculty = facultyList.filter(f => {
    const q = searchQuery.toLowerCase();
    const matchSearch = (f.faculty_name || '').toLowerCase().includes(q) ||
      (f.department || '').toLowerCase().includes(q);
    if (filterStatus === 'OVERLOADED') return matchSearch && f.is_overloaded;
    if (filterStatus === 'OPTIMAL') return matchSearch && !f.is_overloaded;
    return matchSearch;
  });

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
              <Briefcase className="w-4 h-4" />
              <span>Academics & Faculty Administration</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
              Faculty Workload Management
              <span className="text-xs bg-indigo-100 text-indigo-800 font-medium px-2.5 py-1 rounded-full border border-indigo-200">
                Live Distribution
              </span>
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Institutional teaching distribution, lab allocations, mentee ratios, and timetable overload detection for RVS College.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowConfigModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-sm rounded-xl transition border border-indigo-200"
            >
              <Sliders className="w-4 h-4" />
              Threshold Policies
            </button>
            <button
              onClick={fetchData}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition border border-slate-300"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Analytics KPIs */}
        {workloadData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
            <div className="bg-gradient-to-br from-indigo-500/10 to-blue-500/5 p-4 rounded-xl border border-indigo-100">
              <div className="text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-1">Total Faculty Tracked</div>
              <div className="text-3xl font-extrabold text-indigo-900">{workloadData.total_faculty}</div>
              <div className="text-xs text-indigo-700 font-medium mt-1">Across all engineering departments</div>
            </div>

            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 p-4 rounded-xl border border-emerald-100">
              <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">Balanced / Optimal Load</div>
              <div className="text-3xl font-extrabold text-emerald-900">
                {workloadData.total_faculty - workloadData.overloaded_count}
              </div>
              <div className="text-xs text-emerald-700 font-medium mt-1">Within institute limits</div>
            </div>

            <div className="bg-gradient-to-br from-rose-500/10 to-orange-500/5 p-4 rounded-xl border border-rose-100">
              <div className="text-xs font-semibold text-rose-700 uppercase tracking-wider mb-1">Overloaded / At Risk</div>
              <div className="text-3xl font-extrabold text-rose-900">{workloadData.overloaded_count}</div>
              <div className="text-xs text-rose-700 font-medium mt-1">Exceeding teaching / mentee thresholds</div>
            </div>

            <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/5 p-4 rounded-xl border border-amber-100">
              <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">Policy Ceiling</div>
              <div className="text-3xl font-extrabold text-amber-900">
                {workloadData.config?.max_weekly_teaching_hours || 18}h
              </div>
              <div className="text-xs text-amber-700 font-medium mt-1">Max weekly hours / Max 30 mentees</div>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search professor name, department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase">Status:</span>
          <div className="inline-flex rounded-xl bg-slate-100 p-1">
            {['ALL', 'OPTIMAL', 'OVERLOADED'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filterStatus === st ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'ALL' ? 'All Faculty' : st === 'OPTIMAL' ? 'Optimal Load' : 'Overloaded'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Faculty Workload Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-slate-600 font-medium text-sm">Computing workload matrix...</p>
        </div>
      ) : filteredFaculty.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No faculty match the filter criteria</h3>
          <p className="text-slate-500 text-sm mt-1">Try resetting your filters or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFaculty.map((fac) => {
            const maxHrs = workloadData?.config?.max_weekly_teaching_hours || 18;
            const hrPct = Math.min(Math.round((fac.weekly_teaching_hours / maxHrs) * 100), 100);

            return (
              <div
                key={fac.faculty_id}
                className={`bg-white rounded-2xl border p-5 shadow-sm transition hover:shadow-md ${
                  fac.is_overloaded ? 'border-rose-300 bg-rose-50/10' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{fac.faculty_name}</h3>
                    <p className="text-xs text-slate-500 font-medium">{fac.department} Department</p>
                  </div>
                  {fac.is_overloaded ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                      <AlertTriangle className="w-3.5 h-3.5" /> Overloaded
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Optimal Load
                    </span>
                  )}
                </div>

                {/* Progress bar for weekly hours */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 font-medium">Weekly Teaching Load</span>
                    <span className="font-bold text-slate-900">{fac.weekly_teaching_hours} / {maxHrs} hrs/wk</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        fac.weekly_teaching_hours > maxHrs
                          ? 'bg-rose-500'
                          : hrPct > 80
                          ? 'bg-amber-500'
                          : 'bg-indigo-600'
                      }`}
                      style={{ width: `${hrPct}%` }}
                    ></div>
                  </div>
                </div>

                {/* Detailed metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="text-slate-500 font-medium">Assigned Classes</div>
                    <div className="text-base font-extrabold text-slate-800 mt-0.5">{fac.assigned_classes_count} periods</div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="text-slate-500 font-medium">Assigned Mentees</div>
                    <div className="text-base font-extrabold text-slate-800 mt-0.5">{fac.mentee_count} students</div>
                  </div>
                </div>

                {/* Subjects Assigned */}
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Assigned Subjects ({fac.assigned_subjects?.length || 0})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {fac.assigned_subjects && fac.assigned_subjects.length > 0 ? (
                      fac.assigned_subjects.map((sub, i) => (
                        <span key={i} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-medium border border-indigo-100">
                          {sub}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">General academic duties</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Threshold Config Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5 text-indigo-700">
                <Sliders className="w-5 h-5" />
                <h3 className="text-lg font-bold text-slate-900">Workload Threshold Policies</h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Maximum Weekly Teaching Hours (Ceiling)
                </label>
                <input
                  type="number"
                  min="5"
                  max="40"
                  value={configForm.max_weekly_teaching_hours}
                  onChange={(e) => setConfigForm({ ...configForm, max_weekly_teaching_hours: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  Faculty exceeding this threshold will be flagged as overloaded.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Maximum Lab Hours / Week
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={configForm.max_lab_hours}
                  onChange={(e) => setConfigForm({ ...configForm, max_lab_hours: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Maximum Mentee Assignment / Faculty
                </label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={configForm.max_mentees}
                  onChange={(e) => setConfigForm({ ...configForm, max_mentees: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingConfig}
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm disabled:opacity-50"
                >
                  {savingConfig ? 'Saving...' : 'Save Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
