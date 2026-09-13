import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  BarChart3,
  Calendar,
  Layers,
  ChevronDown,
  ChevronRight,
  Plus,
  RefreshCw,
  Award,
  Sparkles,
  Users,
  GraduationCap
} from 'lucide-react';

export default function SyllabusTrackerModule() {
  const [loading, setLoading] = useState(true);
  const [trackers, setTrackers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedSem, setSelectedSem] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [updatingTopicId, setUpdatingTopicId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }
    fetchData();
  }, [selectedDept, selectedSem]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = '/api/rvs/adv/syllabus';
      const params = new URLSearchParams();
      if (selectedDept !== 'ALL') params.append('department', selectedDept);
      if (selectedSem !== 'ALL') params.append('semester', selectedSem);
      if (params.toString()) url += `?${params.toString()}`;

      const [resList, resAnalytics] = await Promise.all([
        api.get(url),
        api.get('/api/rvs/adv/syllabus/analytics')
      ]);

      if (resList.data?.success) {
        setTrackers(resList.data.trackers || []);
        // Expand first subject by default
        if (resList.data.trackers?.length > 0) {
          setExpandedSubjects(prev => ({ ...prev, [resList.data.trackers[0].id]: true }));
        }
      }

      if (resAnalytics.data?.success) {
        setAnalytics(resAnalytics.data);
      }
    } catch (err) {
      console.error('Failed to load syllabus tracker data:', err);
      showToast('Error loading syllabus tracking records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleSubject = (id) => {
    setExpandedSubjects(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const updateTopicStatus = async (topicId, newStatus) => {
    setUpdatingTopicId(topicId);
    try {
      const res = await api.post(`/api/rvs/adv/syllabus/topics/${topicId}/status`, {
        status: newStatus,
        completion_date: newStatus === 'COMPLETED' ? new Date().toISOString().split('T')[0] : null
      });

      if (res.data?.success) {
        showToast(res.data.message || 'Status updated');
        // Update local state without full reload
        setTrackers(prev => prev.map(tr => ({
          ...tr,
          units: (tr.units || []).map(u => ({
            ...u,
            topics: (u.topics || []).map(t => t.id === topicId ? { ...t, status: newStatus, completion_date: newStatus === 'COMPLETED' ? new Date().toISOString().split('T')[0] : null } : t)
          }))
        })));
        // Refresh analytics
        const resAnalytics = await api.get('/api/rvs/adv/syllabus/analytics');
        if (resAnalytics.data?.success) setAnalytics(resAnalytics.data);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      showToast(err.response?.data?.message || 'Failed to update topic status', 'error');
    } finally {
      setUpdatingTopicId(null);
    }
  };

  const filteredTrackers = trackers.filter(tr => {
    const q = searchQuery.toLowerCase();
    const matchSearch = (tr.subject_name || '').toLowerCase().includes(q) ||
      (tr.subject_code || '').toLowerCase().includes(q) ||
      (tr.faculty_name || '').toLowerCase().includes(q);
    return matchSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> Completed</span>;
      case 'IN PROGRESS':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200"><Clock className="w-3.5 h-3.5" /> In Progress</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200"><AlertTriangle className="w-3.5 h-3.5" /> Not Started</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/30 p-4 md:p-6 lg:p-8">
      {/* Toast Notification */}
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
              <BookOpen className="w-4 h-4" />
              <span>Academics & Curriculum Delivery</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
              Syllabus & Lesson Plan Tracker
              <span className="text-xs bg-indigo-100 text-indigo-800 font-medium px-2.5 py-1 rounded-full border border-indigo-200">
                Live Progress
              </span>
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Real-time curriculum coverage, unit delivery metrics, and delayed subject alerts for RVS College of Engineering & Technology.
            </p>
          </div>
          <button
            onClick={fetchData}
            className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition border border-slate-300"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Analytics KPIs */}
        {analytics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
            <div className="bg-gradient-to-br from-indigo-500/10 to-blue-500/5 p-4 rounded-xl border border-indigo-100">
              <div className="text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-1">Overall Curriculum Coverage</div>
              <div className="text-3xl font-extrabold text-indigo-900">{analytics.overall_completion_pct}%</div>
              <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                <div className="bg-indigo-600 h-2 rounded-full transition-all duration-500" style={{ width: `${analytics.overall_completion_pct}%` }}></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 p-4 rounded-xl border border-emerald-100">
              <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">Curriculum Subjects Tracked</div>
              <div className="text-3xl font-extrabold text-emerald-900">{trackers.length}</div>
              <div className="text-xs text-emerald-700 font-medium mt-1">Active departmental courses</div>
            </div>

            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-4 rounded-xl border border-amber-100">
              <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">Delayed / Alert Subjects</div>
              <div className="text-3xl font-extrabold text-amber-900">{analytics.delayed_subjects_count}</div>
              <div className="text-xs text-amber-700 font-medium mt-1">Progress below 50% threshold</div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 p-4 rounded-xl border border-purple-100">
              <div className="text-xs font-semibold text-purple-700 uppercase tracking-wider mb-1">Assigned Faculty In-Charge</div>
              <div className="text-3xl font-extrabold text-purple-900">
                {new Set(trackers.map(t => t.faculty_name)).size}
              </div>
              <div className="text-xs text-purple-700 font-medium mt-1">Certified Professors</div>
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
            placeholder="Search subject code, name, or faculty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Department:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl text-xs py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
            >
              <option value="ALL">All Departments</option>
              <option value="CSE">Computer Science (CSE)</option>
              <option value="ECE">Electronics (ECE)</option>
              <option value="MECH">Mechanical (MECH)</option>
              <option value="CIVIL">Civil (CIVIL)</option>
              <option value="EEE">Electrical (EEE)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Semester:</span>
            <select
              value={selectedSem}
              onChange={(e) => setSelectedSem(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl text-xs py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
            >
              <option value="ALL">All Semesters</option>
              <option value="4th Semester">4th Semester</option>
              <option value="6th Semester">6th Semester</option>
              <option value="8th Semester">8th Semester</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tracker List */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-slate-600 font-medium text-sm">Loading syllabus tracking data...</p>
        </div>
      ) : filteredTrackers.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No syllabus trackers found</h3>
          <p className="text-slate-500 text-sm mt-1">Try clearing your search query or department filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTrackers.map((tr) => {
            const isExpanded = !!expandedSubjects[tr.id];
            
            // Calculate progress
            let totalTopics = 0;
            let completedTopics = 0;
            (tr.units || []).forEach(u => {
              (u.topics || []).forEach(t => {
                totalTopics++;
                if (t.status === 'COMPLETED') completedTopics++;
              });
            });
            const pct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
            const isDelayed = pct < 50;

            return (
              <div key={tr.id} className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden transition hover:border-slate-300">
                {/* Subject Header Card */}
                <div
                  onClick={() => toggleSubject(tr.id)}
                  className="p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 select-none hover:bg-slate-50/70 transition"
                >
                  <div className="flex items-start gap-3.5">
                    <button className="mt-1 text-slate-400 hover:text-slate-600 transition">
                      {isExpanded ? <ChevronDown className="w-5 h-5 text-indigo-600" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {tr.subject_code}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                          {tr.department} • {tr.semester}
                        </span>
                        {isDelayed && (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold border border-rose-200">
                            <AlertTriangle className="w-3 h-3" /> Delayed Delivery
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">{tr.subject_name}</h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          Faculty: <strong className="text-slate-700">{tr.faculty_name}</strong>
                        </span>
                        <span>•</span>
                        <span>{tr.units?.length || 0} Units / {totalTopics} Topics</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  <div className="flex items-center gap-5 pl-8 md:pl-0">
                    <div className="text-right min-w-[130px]">
                      <div className="text-xs text-slate-500 font-medium">Progress ({completedTopics}/{totalTopics})</div>
                      <div className="text-lg font-black text-slate-900">{pct}%</div>
                      <div className="w-32 bg-slate-100 h-2 rounded-full mt-1 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            pct >= 75 ? 'bg-emerald-500' : pct >= 40 ? 'bg-indigo-600' : 'bg-rose-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Units & Topics Accordion Body */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-4 md:p-6 space-y-6">
                    {(tr.units || []).map((unit) => (
                      <div key={unit.unit_number} className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-indigo-600" />
                            <h4 className="text-sm font-bold text-slate-800">
                              Unit {unit.unit_number}: {unit.unit_name}
                            </h4>
                          </div>
                          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {unit.topics?.filter(t => t.status === 'COMPLETED').length || 0} / {unit.topics?.length || 0} Completed
                          </span>
                        </div>

                        {/* Topics Table */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="text-slate-400 font-semibold border-b border-slate-100">
                                <th className="pb-2 w-10">#</th>
                                <th className="pb-2">Topic Description</th>
                                <th className="pb-2">Planned Date</th>
                                <th className="pb-2">Completion Date</th>
                                <th className="pb-2">Status</th>
                                <th className="pb-2 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {(unit.topics || []).map((topic, idx) => (
                                <tr key={topic.id} className="hover:bg-slate-50/80 transition">
                                  <td className="py-2.5 font-medium text-slate-400">{idx + 1}</td>
                                  <td className="py-2.5 font-semibold text-slate-800">{topic.name}</td>
                                  <td className="py-2.5 text-slate-500 font-medium">
                                    <span className="inline-flex items-center gap-1">
                                      <Calendar className="w-3 h-3 text-slate-400" />
                                      {topic.planned_date || 'N/A'}
                                    </span>
                                  </td>
                                  <td className="py-2.5 text-slate-500 font-medium">
                                    {topic.completion_date ? (
                                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                                        <CheckCircle2 className="w-3 h-3" />
                                        {topic.completion_date}
                                      </span>
                                    ) : (
                                      <span className="text-slate-400 italic">Pending</span>
                                    )}
                                  </td>
                                  <td className="py-2.5">{getStatusBadge(topic.status)}</td>
                                  <td className="py-2.5 text-right">
                                    <div className="inline-flex items-center gap-1">
                                      {topic.status !== 'COMPLETED' ? (
                                        <button
                                          disabled={updatingTopicId === topic.id}
                                          onClick={() => updateTopicStatus(topic.id, 'COMPLETED')}
                                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-xs transition shadow-2xs disabled:opacity-50"
                                        >
                                          {updatingTopicId === topic.id ? 'Saving...' : 'Mark Done'}
                                        </button>
                                      ) : (
                                        <button
                                          disabled={updatingTopicId === topic.id}
                                          onClick={() => updateTopicStatus(topic.id, 'IN PROGRESS')}
                                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-xs transition border border-slate-300 disabled:opacity-50"
                                        >
                                          Reopen
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
