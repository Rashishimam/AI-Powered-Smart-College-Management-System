import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  Sparkles,
  Archive,
  Layers,
  Star,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

export default function AcademicSessionModule() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [currentSessionCode, setCurrentSessionCode] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSessionForm, setNewSessionForm] = useState({
    session_code: '',
    name: '',
    start_date: '',
    end_date: '',
    odd_sem_start: '',
    even_sem_start: ''
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/rvs/adv/sessions');
      if (res.data?.success) {
        setSessions(res.data.sessions || []);
        setCurrentSessionCode(res.data.current_session || '');
      }
    } catch (err) {
      console.error('Error fetching academic sessions:', err);
      showToast('Error loading academic sessions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSetCurrent = async (id, code) => {
    setActionLoading(true);
    try {
      const res = await api.post(`/api/rvs/adv/sessions/${id}/set-current`);
      if (res.data?.success) {
        showToast(res.data.message || `Session ${code} set as current.`);
        fetchSessions();
      }
    } catch (err) {
      console.error('Error setting current session:', err);
      showToast(err.response?.data?.message || 'Failed to update current session', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.post('/api/rvs/adv/sessions', newSessionForm);
      if (res.data?.success) {
        showToast(`Academic Session ${newSessionForm.session_code} created successfully.`);
        setShowCreateModal(false);
        setNewSessionForm({
          session_code: '',
          name: '',
          start_date: '',
          end_date: '',
          odd_sem_start: '',
          even_sem_start: ''
        });
        fetchSessions();
      }
    } catch (err) {
      console.error('Error creating session:', err);
      showToast(err.response?.data?.message || 'Failed to create academic session', 'error');
    } finally {
      setActionLoading(false);
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
              <Calendar className="w-4 h-4" />
              <span>Institute Academic Administration</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
              Academic Session Management
              <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                Active: {currentSessionCode || '2025-26'}
              </span>
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Centralized academic calendar lifecycle, active session pointers, and historical archives for RVS College of Engineering & Technology.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Academic Session
            </button>
            <button
              onClick={fetchSessions}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition border border-slate-300"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Sessions Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-slate-600 font-medium text-sm">Loading academic session records...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sessions.map((sess) => {
              const isCurrent = sess.is_current;
              return (
                <div
                  key={sess.id}
                  className={`bg-white rounded-2xl border p-6 shadow-sm transition relative overflow-hidden flex flex-col justify-between ${
                    isCurrent
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {isCurrent && (
                    <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 fill-white" />
                      Active Session
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
                      <Layers className="w-3.5 h-3.5 text-indigo-600" />
                      Academic Cycle
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-1">{sess.session_code}</h3>
                    <p className="text-xs font-semibold text-slate-600 mb-4">{sess.name}</p>

                    <div className="space-y-2 text-xs border-t border-slate-100 pt-3 mb-4">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Duration:</span>
                        <span className="font-semibold text-slate-800">{sess.start_date} to {sess.end_date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Odd Semester Start:</span>
                        <span className="font-medium text-indigo-700">{sess.odd_sem_start || sess.start_date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Even Semester Start:</span>
                        <span className="font-medium text-indigo-700">{sess.even_sem_start || sess.end_date}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-slate-500">Status:</span>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          isCurrent
                            ? 'bg-emerald-100 text-emerald-800'
                            : sess.status === 'Archived'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {sess.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    {isCurrent ? (
                      <div className="w-full py-2 text-center text-xs font-bold text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200">
                        Default Session for Modules & Analytics
                      </div>
                    ) : (
                      <button
                        disabled={actionLoading}
                        onClick={() => handleSetCurrent(sess.id, sess.session_code)}
                        className="w-full py-2 px-3 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition border border-indigo-200 flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Set as Current Session
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* New Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5 text-indigo-700">
                <Calendar className="w-5 h-5" />
                <h3 className="text-lg font-bold text-slate-900">Add Academic Session</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Session Code (e.g., 2026-27) *
                </label>
                <input
                  type="text"
                  placeholder="2026-27"
                  value={newSessionForm.session_code}
                  onChange={(e) => setNewSessionForm({ ...newSessionForm, session_code: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Session Title
                </label>
                <input
                  type="text"
                  placeholder="Academic Session 2026-2027"
                  value={newSessionForm.name}
                  onChange={(e) => setNewSessionForm({ ...newSessionForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={newSessionForm.start_date}
                    onChange={(e) => setNewSessionForm({ ...newSessionForm, start_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={newSessionForm.end_date}
                    onChange={(e) => setNewSessionForm({ ...newSessionForm, end_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Odd Sem Commencement
                  </label>
                  <input
                    type="date"
                    value={newSessionForm.odd_sem_start}
                    onChange={(e) => setNewSessionForm({ ...newSessionForm, odd_sem_start: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Even Sem Commencement
                  </label>
                  <input
                    type="date"
                    value={newSessionForm.even_sem_start}
                    onChange={(e) => setNewSessionForm({ ...newSessionForm, even_sem_start: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm disabled:opacity-50"
                >
                  {actionLoading ? 'Creating...' : 'Create Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
