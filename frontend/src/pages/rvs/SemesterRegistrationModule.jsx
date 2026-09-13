import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  BookOpen,
  Layers,
  Sparkles,
  RefreshCw,
  Plus,
  ShieldCheck,
  Check,
  AlertCircle
} from 'lucide-react';

export default function SemesterRegistrationModule() {
  const [loading, setLoading] = useState(true);
  const [statusData, setStatusData] = useState(null);
  const [electiveGroups, setElectiveGroups] = useState([]);
  const [selectedElectives, setSelectedElectives] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {
        console.error(e);
      }
    }
    fetchData();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resStatus, resElectives] = await Promise.all([
        api.get('/api/rvs/adv/semester-registration/my-status'),
        api.get('/api/rvs/adv/electives/groups')
      ]);

      if (resStatus.data?.success) setStatusData(resStatus.data);
      if (resElectives.data?.success) setElectiveGroups(resElectives.data.groups || []);
    } catch (err) {
      console.error(err);
      showToast('Error loading semester registration status', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleElectiveChoice = (groupId, subjectCode, groupName, subjectName) => {
    setSelectedElectives(prev => ({
      ...prev,
      [groupId]: {
        group: groupName,
        subject_code: subjectCode,
        subject_name: subjectName
      }
    }));
  };

  const handleRegister = async () => {
    const activeWindow = statusData?.active_window;
    if (!activeWindow) {
      showToast('Registration window is currently closed', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const electivesArray = Object.values(selectedElectives);
      const res = await api.post('/api/rvs/adv/semester-registration/register', {
        window_id: activeWindow.id,
        selected_electives: electivesArray
      });

      if (res.data?.success) {
        showToast(res.data.message || 'Semester registration successful!');
        fetchData();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to complete registration', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const activeWindow = statusData?.active_window;
  const registration = statusData?.registration;
  const isRegistered = statusData?.has_registered;

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
              <Calendar className="w-4 h-4" />
              <span>Academic Enrollment & Electives</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
              Semester Registration & Elective Selection
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                activeWindow?.status === 'OPEN'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                Window: {activeWindow?.status || 'NOT OPEN'}
              </span>
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Official course enrollment, curriculum subject lock, and departmental elective quota allocation for RVS College.
            </p>
          </div>
          <button
            onClick={fetchData}
            className="self-start md:self-auto inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition border border-slate-300"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
          <p className="text-slate-500 text-xs">Checking semester registration status...</p>
        </div>
      ) : isRegistered ? (
        /* Completed Registration View */
        <div className="bg-white rounded-2xl border border-emerald-200 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Registration Confirmed</div>
              <h2 className="text-2xl font-black text-slate-900">
                Enrolled for {registration.registered_semester} ({registration.academic_session})
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-slate-100 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider mb-2">Enrolled Core Subjects</h3>
              <div className="space-y-1.5">
                {registration.core_subjects?.map((sub, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-700">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="font-mono font-bold text-indigo-700">{sub}</span>
                    <span>Core Mandatory Paper</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider mb-2">Allocated Electives</h3>
              <div className="space-y-2">
                {registration.selected_electives?.map((el, i) => (
                  <div key={i} className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">{el.group}</div>
                    <div className="font-bold text-slate-900 mt-0.5">
                      <span className="font-mono text-indigo-700 mr-2">{el.subject_code}</span>
                      {el.subject_name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
            <div className="text-slate-600">
              Status: <strong className="text-emerald-700">{registration.status}</strong> • Remarks: {registration.remarks}
            </div>
            <div className="text-slate-400">Registered on {registration.registered_at}</div>
          </div>
        </div>
      ) : activeWindow ? (
        /* Active Registration Form */
        <div className="space-y-6">
          {/* Active Window Banner */}
          <div className="bg-gradient-to-r from-indigo-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                Target Enrollment: {activeWindow.semester} ({activeWindow.academic_session})
              </span>
              <span className="text-xs bg-emerald-500 text-white px-3 py-0.5 rounded-full font-bold">
                Open Until: {activeWindow.end_date}
              </span>
            </div>
            <h2 className="text-xl font-bold mb-2">
              Semester Registration for Department of {activeWindow.department}
            </h2>
            <p className="text-xs text-indigo-200 leading-relaxed max-w-2xl">
              {activeWindow.elective_rules}
            </p>
          </div>

          {/* Core Subjects Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              Mandatory Core Subjects ({activeWindow.required_core_subjects?.length || 0})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {activeWindow.required_core_subjects?.map((sub) => (
                <div key={sub.code} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-indigo-700 mr-2">{sub.code}</span>
                    <span className="font-bold text-slate-900">{sub.name}</span>
                  </div>
                  <span className="text-[11px] font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                    {sub.credits} Credits
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Elective Selection Baskets */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              Select Departmental & Open Electives
            </h3>

            {electiveGroups.map((group) => (
              <div key={group.id} className="border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{group.group_name}</h4>
                  <span className="text-[11px] text-slate-500">Pick exactly 1 subject</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {group.subjects?.map((sub) => {
                    const isSelected = selectedElectives[group.id]?.subject_code === sub.code;
                    const isFull = sub.enrolled_count >= sub.capacity;

                    return (
                      <div
                        key={sub.code}
                        onClick={() => !isFull && handleElectiveChoice(group.id, sub.code, group.group_name, sub.name)}
                        className={`p-3.5 rounded-xl border transition cursor-pointer select-none ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20'
                            : isFull
                            ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono font-bold text-indigo-700">{sub.code}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isFull ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {sub.enrolled_count} / {sub.capacity} Seats
                          </span>
                        </div>
                        <h5 className="font-bold text-slate-900 mt-1">{sub.name}</h5>
                        {isFull && <p className="text-[10px] text-rose-600 font-semibold mt-1">Capacity Full</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Submit Registration Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Ready to Confirm Semester Enrollment?</h4>
              <p className="text-xs text-slate-500">
                Please verify your elective choices above. Once submitted, changes require HOD approval.
              </p>
            </div>
            <button
              onClick={handleRegister}
              disabled={submitting || Object.keys(selectedElectives).length === 0}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Submitting Registration...' : 'Confirm & Complete Registration'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="text-lg font-bold text-slate-800">Semester Registration Window Closed</h3>
          <p className="text-slate-500 text-xs mt-1">The academic registration portal is currently not accepting new enrollments.</p>
        </div>
      )}
    </div>
  );
}
