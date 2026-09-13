import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import {
  Award,
  Settings,
  Lock,
  Unlock,
  Save,
  CheckCircle2,
  AlertTriangle,
  History,
  FileSpreadsheet,
  Edit3,
  X,
  Sparkles,
  Search
} from 'lucide-react';
import RVSLogo from '../../components/RVSLogo';
import { RVS_CONFIG } from '../../config/rvsConfig';

export default function InternalMarksModule() {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';
  const isAdmin = user?.role === 'super_admin' || user?.role === 'college_admin';
  const isFaculty = user?.role === 'faculty';

  const [activeTab, setActiveTab] = useState(isStudent ? 'my_marks' : 'entry'); // entry, config, audit, my_marks

  // Filters & State for Mark Entry
  const [department, setDepartment] = useState('CSE');
  const [semester, setSemester] = useState('6th Semester');
  const [subjectCode, setSubjectCode] = useState('CS-601');
  const [sheetData, setSheetData] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState('');

  // Configuration State (Admin)
  const [config, setConfig] = useState(null);
  const [componentsConfig, setComponentsConfig] = useState([]);
  const [savingConfig, setSavingConfig] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Correction Modal State (Post-lock)
  const [correctModal, setCorrectModal] = useState(null); // student object
  const [correctComponent, setCorrectComponent] = useState('');
  const [correctNewMark, setCorrectNewMark] = useState(0);
  const [correctReason, setCorrectReason] = useState('');
  const [correcting, setCorrecting] = useState(false);

  // Student's own marks state
  const [studentMarks, setStudentMarks] = useState([]);

  // 1. Fetch Configuration
  const fetchConfig = async () => {
    try {
      const res = await api.get('/rvs/internal-marks/config');
      if (res.data?.success) {
        setConfig(res.data.config);
        setComponentsConfig(res.data.config.components || []);
      }
    } catch (err) {
      console.error('Failed to load config:', err);
    }
  };

  // 2. Fetch Internal Marks Roster for Faculty/Admin
  const fetchSheet = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/rvs/internal-marks?department=${department}&semester=${semester}&subject_code=${subjectCode}`);
      if (res.data?.success) {
        setSheetData(res.data.data);
        setStudents(res.data.data?.students || []);
      }
    } catch (err) {
      console.error('Failed to load sheet:', err);
    } finally {
      setLoading(false);
    }
  };

  // 3. Fetch Audit Logs
  const fetchAuditLogs = async () => {
    try {
      setLoadingAudit(true);
      const res = await api.get(`/rvs/internal-marks/audit-log?subject_code=${subjectCode}`);
      if (res.data?.success) {
        setAuditLogs(res.data.logs || []);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoadingAudit(false);
    }
  };

  // 4. Fetch Student's Own Published Marks
  const fetchStudentMarks = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/rvs/internal-marks/student/${user.id}`);
      if (res.data?.success) {
        setStudentMarks(res.data.internalMarks || []);
      }
    } catch (err) {
      console.error('Failed to load student marks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    if (isStudent) {
      fetchStudentMarks();
    } else {
      fetchSheet();
      fetchAuditLogs();
    }
  }, [department, semester, subjectCode, isStudent]);

  // Handle Mark Change on input
  const handleMarkChange = (studentId, componentName, value) => {
    setStudents(prev => prev.map(s => {
      if (s.student_id !== studentId) return s;
      const numVal = Math.max(0, Number(value) || 0);
      const updatedMarks = { ...s.marks, [componentName]: numVal };
      const total = Object.values(updatedMarks).reduce((acc, v) => acc + Number(v || 0), 0);
      const grade = total >= 90 ? 'A+' : total >= 80 ? 'A' : total >= 70 ? 'B+' : total >= 60 ? 'B' : total >= 50 ? 'C' : total >= 40 ? 'P' : 'F';
      return {
        ...s,
        marks: updatedMarks,
        total_internal: Number(total.toFixed(1)),
        grade
      };
    }));
  };

  // Save Draft
  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      const res = await api.post('/rvs/internal-marks/save-draft', {
        department_code: department,
        semester,
        subject_code: subjectCode,
        students
      });
      if (res.data?.success) {
        setNotification('Draft internal marks saved successfully.');
        setSheetData(res.data.data);
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  // Lock & Finalize
  const handleLockSheet = async () => {
    if (!window.confirm('Are you sure you want to finalize and lock internal marks for this subject? Once locked, unauthorized editing is prevented and subsequent adjustments require an administrative justification.')) {
      return;
    }
    try {
      setSaving(true);
      const res = await api.post('/rvs/internal-marks/lock', {
        department_code: department,
        semester,
        subject_code: subjectCode
      });
      if (res.data?.success) {
        setNotification(`Internal marks for ${subjectCode} are now LOCKED and finalized.`);
        setSheetData(res.data.data);
        fetchSheet();
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to lock sheet');
    } finally {
      setSaving(false);
    }
  };

  // Save Config
  const handleSaveConfig = async (e) => {
    e.preventDefault();
    const sum = componentsConfig.reduce((acc, c) => acc + Number(c.weightage || 0), 0);
    if (Math.round(sum) !== 100) {
      alert(`Invalid configuration: Component weightages must sum to exactly 100%. Current configured sum is ${sum}%.`);
      return;
    }
    try {
      setSavingConfig(true);
      const res = await api.post('/rvs/internal-marks/config', {
        components: componentsConfig,
        passing_internal_percent: config.passing_internal_percent
      });
      if (res.data?.success) {
        setNotification('Internal assessment configuration updated and validated at 100%.');
        setConfig(res.data.config);
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save config');
    } finally {
      setSavingConfig(false);
    }
  };

  // Post-Lock Correction
  const handleConfirmCorrection = async (e) => {
    e.preventDefault();
    if (!correctModal || !correctComponent || !correctReason.trim()) {
      alert('Please select component and specify a mandatory reason.');
      return;
    }
    try {
      setCorrecting(true);
      const res = await api.post('/rvs/internal-marks/correct', {
        subject_code: subjectCode,
        student_id: correctModal.student_id,
        component: correctComponent,
        new_mark: Number(correctNewMark),
        reason: correctReason
      });
      if (res.data?.success) {
        setNotification(res.data.message);
        setCorrectModal(null);
        fetchSheet();
        fetchAuditLogs();
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Correction failed');
    } finally {
      setCorrecting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
              RVS Academic Assessment System
            </span>
            <span className="text-xs text-slate-500">
              Continuous Evaluation &bull; Configurable Formula &bull; Audit Trail
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {isStudent ? 'My Internal Assessment Scores' : 'Internal Marks Management & Audit Ledger'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isStudent
              ? 'Review published continuous assessment component scores, attendance credits, and internal grades.'
              : 'Configurable component weightages, draft saving, finalized locking, and audit-controlled corrections.'}
          </p>
        </div>

        {/* Sub-tab Navigation */}
        {!isStudent && (
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveTab('entry')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'entry' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Mark Entry Roster
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('config')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'config' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                Weightage Config
              </button>
            )}

            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'audit' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Audit Log ({auditLogs.length})
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

      {/* TAB 1: FACULTY MARK ENTRY ROSTER */}
      {activeTab === 'entry' && !isStudent && (
        <div className="space-y-4">
          {/* Class & Subject Selector Bar */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-600/20"
                >
                  {RVS_CONFIG.departments.map(d => (
                    <option key={d.code} value={d.code}>{d.code} - {d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Semester</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-600/20"
                >
                  {['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Subject</label>
                <select
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-600/20 font-mono"
                >
                  <option value="CS-601">CS-601 Compiler Design</option>
                  <option value="CS-602">CS-602 Computer Networks</option>
                  <option value="CS-603">CS-603 Cloud & Distributed Systems</option>
                  <option value="CS-604L">CS-604L Networks Lab</option>
                </select>
              </div>
            </div>

            {/* Lock Status & Actions */}
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                sheetData?.is_locked
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}>
                {sheetData?.is_locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                {sheetData?.is_locked ? 'Locked & Finalized' : 'Draft / Editable'}
              </span>

              {!sheetData?.is_locked ? (
                <>
                  <button
                    onClick={handleSaveDraft}
                    disabled={saving}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save Draft
                  </button>

                  <button
                    onClick={handleLockSheet}
                    disabled={saving}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Submit & Finalize
                  </button>
                </>
              ) : (
                <span className="text-[11px] text-slate-500 italic">
                  Locked by {sheetData?.locked_by_name || 'Academic Office'}
                </span>
              )}
            </div>
          </div>

          {/* Roster Table */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-3">Roll No</th>
                    <th className="py-3 px-4">Student Name</th>
                    {(componentsConfig || []).map((c) => (
                      <th key={c.name} className="py-3 px-2 text-center">
                        <div>{c.name}</div>
                        <span className="text-[9px] text-slate-400 font-normal font-mono">({c.weightage}%)</span>
                      </th>
                    ))}
                    <th className="py-3 px-3 text-center bg-slate-100 font-black">Total (100)</th>
                    <th className="py-3 px-2 text-center">Grade</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan={componentsConfig.length + 5} className="py-12 text-center text-slate-400">
                        <div className="w-6 h-6 border-2 border-blue-900/20 border-t-blue-900 rounded-full animate-spin mx-auto mb-2"></div>
                        Loading assessment roster...
                      </td>
                    </tr>
                  ) : students.length === 0 ? (
                    <tr>
                      <td colSpan={componentsConfig.length + 5} className="py-12 text-center text-slate-500">
                        No students enrolled in this section.
                      </td>
                    </tr>
                  ) : (
                    students.map((s) => (
                      <tr key={s.student_id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-950 text-xs">
                          {s.roll_no}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-slate-900">
                          {s.student_name}
                        </td>
                        {(componentsConfig || []).map((c) => {
                          const val = s.marks?.[c.name] !== undefined ? s.marks[c.name] : 0;
                          return (
                            <td key={c.name} className="py-2.5 px-2 text-center">
                              <input
                                type="number"
                                min="0"
                                max={c.max_marks || c.weightage}
                                step="0.5"
                                disabled={sheetData?.is_locked}
                                value={val}
                                onChange={(e) => handleMarkChange(s.student_id, c.name, e.target.value)}
                                className={`w-14 text-center px-1 py-1 rounded-lg border font-mono text-xs ${
                                  sheetData?.is_locked
                                    ? 'bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed'
                                    : 'bg-white border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
                                }`}
                              />
                            </td>
                          );
                        })}
                        <td className="py-2.5 px-3 text-center bg-slate-50/80 font-mono font-black text-sm text-blue-950">
                          {s.total_internal}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            s.grade === 'A+' || s.grade === 'A' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                            s.grade === 'B+' || s.grade === 'B' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                            s.grade === 'F' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                            'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {s.grade}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {sheetData?.is_locked ? (
                            <button
                              onClick={() => {
                                setCorrectModal(s);
                                setCorrectComponent(componentsConfig[0]?.name || 'Attendance');
                                setCorrectNewMark(s.marks?.[componentsConfig[0]?.name] || 0);
                                setCorrectReason('');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold transition-all border border-amber-200 cursor-pointer flex items-center gap-1 ml-auto"
                            >
                              <Edit3 className="w-3 h-3" />
                              Correct
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400">Live Draft</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONFIGURATION (ADMIN ONLY) */}
      {activeTab === 'config' && isAdmin && (
        <form onSubmit={handleSaveConfig} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-6">
          <div className="flex justify-between items-start pb-3 border-b border-slate-200">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Internal Assessment Weightage Formula</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Customize continuous evaluation components. The sum of all active component weightages must total exactly 100%.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Sum</span>
              <span className={`text-xl font-mono font-black ${
                componentsConfig.reduce((acc, c) => acc + Number(c.weightage || 0), 0) === 100 ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {componentsConfig.reduce((acc, c) => acc + Number(c.weightage || 0), 0)}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {componentsConfig.map((comp, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <input
                    type="text"
                    required
                    value={comp.name}
                    onChange={(e) => {
                      const updated = [...componentsConfig];
                      updated[idx].name = e.target.value;
                      setComponentsConfig(updated);
                    }}
                    className="font-bold text-slate-900 bg-transparent border-b border-slate-300 focus:border-blue-600 text-xs px-1"
                  />
                  <div className="flex items-center gap-1 font-mono text-xs">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={comp.weightage}
                      onChange={(e) => {
                        const updated = [...componentsConfig];
                        updated[idx].weightage = Number(e.target.value);
                        setComponentsConfig(updated);
                      }}
                      className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-center font-bold"
                    />
                    <span className="text-slate-500 font-bold">%</span>
                  </div>
                </div>
                <input
                  type="text"
                  value={comp.description || ''}
                  onChange={(e) => {
                    const updated = [...componentsConfig];
                    updated[idx].description = e.target.value;
                    setComponentsConfig(updated);
                  }}
                  placeholder="Evaluation guidelines / syllabus notes..."
                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-600"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="submit"
              disabled={savingConfig || componentsConfig.reduce((acc, c) => acc + Number(c.weightage || 0), 0) !== 100}
              className="px-6 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-xs cursor-pointer disabled:opacity-40"
            >
              {savingConfig ? 'Validating...' : 'Save & Enforce 100% Weightage Formula'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: AUDIT LOG */}
      {activeTab === 'audit' && !isStudent && (
        <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs space-y-4 p-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Post-Lock Modification Audit Ledger</h3>
              <p className="text-xs text-slate-500">Immutable ledger of marks corrections with mandatory institutional justifications.</p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {auditLogs.length} Records Logged
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Student</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Component</th>
                  <th className="p-3 text-center">Prev Mark</th>
                  <th className="p-3 text-center">New Mark</th>
                  <th className="p-3">Changed By</th>
                  <th className="p-3">Mandatory Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-slate-400">
                      No corrections made post-lock. All marks intact.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="p-3 font-semibold text-slate-900">{log.student_name}</td>
                      <td className="p-3 font-mono text-amber-700 font-bold">{log.subject_code}</td>
                      <td className="p-3 text-slate-700">{log.component}</td>
                      <td className="p-3 text-center font-mono text-slate-400 line-through">{log.previous_mark}</td>
                      <td className="p-3 text-center font-mono font-bold text-emerald-700">{log.new_mark}</td>
                      <td className="p-3 text-slate-700">
                        {log.changed_by_name} <span className="text-[10px] text-slate-400">({log.changed_by_role})</span>
                      </td>
                      <td className="p-3 text-slate-600 italic max-w-xs truncate" title={log.reason}>
                        "{log.reason}"
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: STUDENT VIEW (MY INTERNAL MARKS) */}
      {(isStudent || activeTab === 'my_marks') && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {studentMarks.map((m, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-amber-600 block">{m.subject_code}</span>
                    <h4 className="font-bold text-slate-900 text-sm">{m.subject_name}</h4>
                    <p className="text-[11px] text-slate-500">{m.semester}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      m.status === 'Published' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {m.status}
                    </span>
                    <span className="block font-mono font-black text-lg text-blue-900 mt-1">{m.total_internal} / 100</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  {Object.entries(m.marks || {}).map(([compName, val]) => (
                    <div key={compName} className="flex justify-between text-slate-600 py-0.5 border-b border-slate-50">
                      <span>{compName}:</span>
                      <strong className="font-mono text-slate-900">{val}</strong>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Post-Lock Correction Modal */}
      {correctModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-950 border border-slate-800 text-slate-100 rounded-3xl p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setCorrectModal(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                Post-Lock Mark Scrutiny & Correction
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Student: <strong className="text-slate-200">{correctModal.student_name}</strong> ({correctModal.roll_no})
              </p>
              <p className="text-xs text-amber-400 font-mono mt-0.5">{subjectCode}</p>
            </div>

            <form onSubmit={handleConfirmCorrection} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Assessment Component *</label>
                <select
                  value={correctComponent}
                  onChange={(e) => {
                    setCorrectComponent(e.target.value);
                    setCorrectNewMark(correctModal.marks?.[e.target.value] || 0);
                  }}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                >
                  {(componentsConfig || []).map(c => (
                    <option key={c.name} value={c.name}>{c.name} (Max {c.max_marks || c.weightage})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Revised Mark *</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  required
                  value={correctNewMark}
                  onChange={(e) => setCorrectNewMark(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl font-mono text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Mandatory Justification / Committee Approval Reason *</label>
                <textarea
                  rows="3"
                  required
                  value={correctReason}
                  onChange={(e) => setCorrectReason(e.target.value)}
                  placeholder="e.g. Scrutiny of Mid-Sem Question 3 approved by Dean Academics..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCorrectModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={correcting}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer disabled:opacity-50"
                >
                  {correcting ? 'Logging...' : 'Apply Correction & Log Audit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
