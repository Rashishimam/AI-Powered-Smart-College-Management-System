import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import {
  FileCheck,
  Search,
  Filter,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  ShieldCheck,
  Eye,
  X,
  Sparkles,
  Calendar,
  Building,
  User,
  ExternalLink
} from 'lucide-react';
import RVSLogo from '../../components/RVSLogo';
import { RVS_CONFIG } from '../../config/rvsConfig';

export default function AdmitCardModule() {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';
  const isAdmin = user?.role === 'super_admin' || user?.role === 'college_admin';

  // Filters & State (Admin)
  const [department, setDepartment] = useState('CSE');
  const [semester, setSemester] = useState('6th Semester');
  const [examId, setExamId] = useState('EXAM-2026-EVEN');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [admitCards, setAdmitCards] = useState([]);

  // Preview Modal
  const [previewCard, setPreviewCard] = useState(null);
  const [bulkPreview, setBulkPreview] = useState(false);

  // Student's own card state
  const [myCard, setMyCard] = useState(null);
  const [myCardError, setMyCardError] = useState(null);

  // Override Modal (Admin)
  const [overrideStudent, setOverrideStudent] = useState(null);
  const [overrideReason, setOverrideReason] = useState('');
  const [overriding, setOverriding] = useState(false);
  const [notification, setNotification] = useState('');

  // Fetch Eligibility List for Admin
  const fetchEligibility = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/rvs/admit-cards/eligibility?department=${department}&semester=${semester}&exam_id=${examId}`);
      if (res.data?.success) {
        setStudents(res.data.students || []);
      }
    } catch (err) {
      console.error('Failed to load eligibility:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Student's own admit card
  const fetchMyCard = async () => {
    try {
      setLoading(true);
      setMyCardError(null);
      const res = await api.get('/rvs/admit-cards/student/my-card');
      if (res.data?.success) {
        setMyCard(res.data.card);
      }
    } catch (err) {
      setMyCardError(err.response?.data || { message: 'Ineligible for admit card.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isStudent) {
      fetchMyCard();
    } else {
      fetchEligibility();
    }
  }, [department, semester, examId, isStudent]);

  // Generate Single Admit Card for Preview
  const handlePreviewSingle = async (stuId) => {
    try {
      const res = await api.get(`/rvs/admit-cards/generate?student_id=${stuId}&exam_id=${examId}`);
      if (res.data?.success && res.data.admitCards?.length > 0) {
        setPreviewCard(res.data.admitCards[0]);
        setBulkPreview(false);
      }
    } catch (err) {
      alert('Failed to generate admit card preview');
    }
  };

  // Generate Bulk Admit Cards
  const handleBulkGenerate = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/rvs/admit-cards/generate?department=${department}&semester=${semester}&exam_id=${examId}`);
      if (res.data?.success) {
        setAdmitCards(res.data.admitCards || []);
        setBulkPreview(true);
      }
    } catch (err) {
      alert('Failed to generate bulk admit cards');
    } finally {
      setLoading(false);
    }
  };

  // Confirm Override
  const handleConfirmOverride = async (e) => {
    e.preventDefault();
    if (!overrideStudent || !overrideReason.trim()) return;
    try {
      setOverriding(true);
      const res = await api.post('/rvs/admit-cards/override', {
        student_id: overrideStudent.student_id,
        roll_no: overrideStudent.roll_no,
        exam_id: examId,
        reason: overrideReason
      });
      if (res.data?.success) {
        setNotification(res.data.message);
        setOverrideStudent(null);
        fetchEligibility();
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Override failed');
    } finally {
      setOverriding(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 no-print">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
              RVS Examination Directorate & Controller of Examinations
            </span>
            <span className="text-xs text-slate-500">
              Affiliated to JUT Ranchi &bull; Hall Ticket Issuance
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {isStudent ? 'My Official Examination Admit Card' : 'Admit Card Generator & Eligibility Clearance'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isStudent
              ? 'Download and print your official signed admit card for upcoming semester end-term theory & lab examinations.'
              : 'Configurable institutional eligibility (attendance ≥75%, fee clearance, registration) and audit override controls.'}
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkGenerate}
              className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Bulk Generate Class Admit Cards
            </button>
          </div>
        )}
      </div>

      {/* Global Notification */}
      {notification && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in no-print">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* STUDENT VIEW */}
      {isStudent && (
        <div className="space-y-6">
          {loading ? (
            <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              <div className="w-6 h-6 border-2 border-blue-900/20 border-t-blue-900 rounded-full animate-spin mx-auto mb-2"></div>
              Verifying examination clearance & admit card status...
            </div>
          ) : myCardError ? (
            <div className="p-8 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-100 rounded-xl text-rose-700">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-rose-900">Admit Card Not Released / Clearance Required</h3>
                  <p className="text-xs text-rose-700">{myCardError.message}</p>
                </div>
              </div>

              {(myCardError.reasons || []).length > 0 && (
                <div className="bg-white/80 p-3.5 rounded-xl border border-rose-200 text-xs space-y-1">
                  <span className="font-bold text-slate-700 block uppercase text-[10px]">Eligibility Clearance Gaps:</span>
                  {myCardError.reasons.map((r, i) => (
                    <li key={i} className="text-rose-800 list-disc ml-4">{r}</li>
                  ))}
                </div>
              )}

              <p className="text-xs text-slate-600 italic">
                {myCardError.instructions || 'Please clear your institutional dues or meet with your Academic Advisor for regularization.'}
              </p>
            </div>
          ) : myCard ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs no-print">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-emerald-50 rounded-xl text-emerald-700">
                    <CheckCircle2 className="w-5 h-5" />
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Admit Card Cleared & Released</h4>
                    <p className="text-xs text-slate-500 font-mono">Hall Ticket #{myCard.admit_card_number}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print / Download PDF
                  </button>
                </div>
              </div>

              {/* Render Admit Card Document */}
              <AdmitCardDocument card={myCard} />
            </div>
          ) : null}
        </div>
      )}

      {/* ADMIN VIEW */}
      {!isStudent && (
        <div className="space-y-4">
          {/* Class Filters */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4 no-print">
            <div className="flex items-center gap-3 flex-wrap">
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
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Examination</label>
                <select
                  value={examId}
                  onChange={(e) => setExamId(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-600/20"
                >
                  <option value="EXAM-2026-EVEN">End-Term Even Semester Examination 2025-26</option>
                  <option value="EXAM-2025-ODD">End-Term Odd Semester Examination 2025-26</option>
                </select>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500 block">Class Clearance Ratio</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {students.filter(s => s.is_eligible).length} / {students.length} Eligible
              </span>
            </div>
          </div>

          {/* Eligibility Roster Table */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs no-print">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Roll / Registration</th>
                    <th className="py-3 px-4">Department & Sem</th>
                    <th className="py-3 px-4">Clearance Status</th>
                    <th className="py-3 px-4">Conditions / Audit Note</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-400">
                        <div className="w-6 h-6 border-2 border-blue-900/20 border-t-blue-900 rounded-full animate-spin mx-auto mb-2"></div>
                        Evaluating eligibility rules...
                      </td>
                    </tr>
                  ) : students.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-500">
                        No students enrolled in this section.
                      </td>
                    </tr>
                  ) : (
                    students.map((stu) => (
                      <tr key={stu.student_id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900 text-xs">{stu.name}</p>
                          <span className="text-[10px] text-slate-500">{stu.batch}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-blue-900 block">{stu.roll_no}</span>
                          <span className="font-mono text-[10px] text-slate-500">{stu.reg_no}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-900">{stu.department_code}</span>
                          <p className="text-[10px] text-slate-500">{stu.semester}</p>
                        </td>
                        <td className="py-3 px-4">
                          {stu.is_overridden ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-50 text-purple-800 border border-purple-200">
                              Admin Overridden
                            </span>
                          ) : stu.is_eligible ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                              Eligible & Cleared
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-50 text-rose-800 border border-rose-200">
                              Ineligible
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-[11px]">
                          {stu.is_overridden ? (
                            <span className="text-purple-700 font-medium italic">
                              "{stu.override_reason}" &bull; Overridden by {stu.overridden_by}
                            </span>
                          ) : stu.is_eligible ? (
                            <span className="text-emerald-700 font-medium">All criteria fulfilled (Attendance &bull; Fees &bull; Active)</span>
                          ) : (
                            <span className="text-rose-700">{(stu.reasons || []).join('; ')}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handlePreviewSingle(stu.student_id)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-900 text-[11px] font-bold transition-all border border-slate-200 cursor-pointer flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              Preview
                            </button>

                            {!stu.is_eligible && (
                              <button
                                onClick={() => {
                                  setOverrideStudent(stu);
                                  setOverrideReason('Institutional discretionary clearance approved by Principal RVSCET.');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 text-[11px] font-bold transition-all border border-purple-200 cursor-pointer"
                              >
                                Override
                              </button>
                            )}
                          </div>
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

      {/* Individual Preview Modal */}
      {previewCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl my-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800 no-print">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Official Admit Card Document Preview
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Document
                </button>
                <button
                  onClick={() => setPreviewCard(null)}
                  className="p-1.5 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <AdmitCardDocument card={previewCard} />
          </div>
        </div>
      )}

      {/* Bulk Print View (Modal/Container) */}
      {bulkPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-5xl bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl my-6 space-y-6 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800 no-print">
              <div>
                <h3 className="text-white font-bold text-sm">Bulk Admit Cards ({admitCards.length} Students)</h3>
                <p className="text-xs text-slate-400">{department} &bull; {semester}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print All Cards
                </button>
                <button
                  onClick={() => setBulkPreview(false)}
                  className="p-1.5 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-8">
              {admitCards.map((card, i) => (
                <div key={i} className="page-break-after">
                  <AdmitCardDocument card={card} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Admin Override Modal */}
      {overrideStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in no-print">
          <div className="relative w-full max-w-md bg-slate-950 border border-slate-800 text-slate-100 rounded-3xl p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setOverrideStudent(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-base font-bold text-white">Administrative Eligibility Override</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Grant admit card clearance to <strong className="text-white">{overrideStudent.name}</strong> ({overrideStudent.roll_no}).
              </p>
            </div>

            <form onSubmit={handleConfirmOverride} className="space-y-3 text-xs">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-[11px]">
                <strong>Gaps Identified:</strong> {(overrideStudent.reasons || []).join('; ')}
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Mandatory Justification / Committee Resolution *</label>
                <textarea
                  rows="3"
                  required
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. Medical documentation verified; student granted special examination concession by Academic Council."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOverrideStudent(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={overriding}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {overriding ? 'Recording...' : 'Grant & Log Override'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Official RVS Admit Card Document View
function AdmitCardDocument({ card }) {
  if (!card) return null;
  const { student, subjects = [], rules = [] } = card;

  return (
    <div className="bg-white text-slate-900 p-6 sm:p-8 rounded-2xl border-2 border-slate-900 shadow-xl max-w-3xl mx-auto space-y-6 font-serif">
      {/* Official Header */}
      <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
        <RVSLogo size="lg" showText={false} className="shrink-0" />
        <div className="text-center flex-1 px-4 space-y-0.5">
          <h2 className="text-lg sm:text-xl font-black text-blue-950 tracking-tight font-sans uppercase">
            {card.college_name || RVS_CONFIG.name}
          </h2>
          <p className="text-[10px] text-slate-600 font-sans">
            Edalhatu, PO: Bhilai Pahari, NH-33, Jamshedpur, Jharkhand - 831012
          </p>
          <p className="text-[10px] font-semibold text-slate-700 font-sans">
            {card.affiliation}
          </p>
          <div className="pt-1">
            <span className="px-4 py-1 rounded bg-blue-950 text-white text-xs font-bold uppercase tracking-wider font-sans inline-block">
              EXAMINATION ADMIT CARD &bull; SESSION {card.session}
            </span>
          </div>
        </div>
        <div className="w-14 h-14 bg-slate-100 rounded-xl border border-slate-300 flex items-center justify-center text-center p-1 font-mono text-[9px] text-slate-500 shrink-0">
          <QrCode className="w-8 h-8 text-slate-800" />
        </div>
      </div>

      {/* Examination Info Bar */}
      <div className="bg-slate-100 p-2.5 rounded-lg border border-slate-300 text-xs font-sans flex flex-col sm:flex-row justify-between gap-1">
        <div>
          <span className="text-slate-500">Examination:</span>{' '}
          <strong className="text-slate-900">{card.examination_name}</strong>
        </div>
        <div className="text-right">
          <span className="text-slate-500">Hall Ticket No:</span>{' '}
          <strong className="font-mono text-blue-950 font-black">{card.admit_card_number}</strong>
        </div>
      </div>

      {/* Student Details Grid + Photo */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-start font-sans">
        <div className="sm:col-span-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs border border-slate-200 p-3.5 rounded-xl bg-slate-50/50">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Candidate Name</span>
            <strong className="text-slate-900 text-sm">{student.name}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">University Roll No</span>
            <strong className="text-blue-950 font-mono text-sm">{student.roll_no}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Registration No</span>
            <strong className="text-slate-900 font-mono">{student.reg_no}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Program / Branch</span>
            <strong className="text-slate-900">{student.course} ({student.department_code})</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Semester</span>
            <strong className="text-slate-900">{student.semester}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Academic Batch</span>
            <strong className="text-slate-900">{student.batch}</strong>
          </div>
          <div className="col-span-2 pt-1 border-t border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase block">Exam Centre / Hall</span>
            <strong className="text-slate-900 text-xs">{card.exam_centre}</strong>
          </div>
        </div>

        {/* Student Photograph */}
        <div className="flex flex-col items-center justify-center p-2 rounded-xl border border-slate-300 bg-white">
          <img
            src={student.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'}
            alt={student.name}
            className="w-24 h-28 object-cover rounded-lg border border-slate-300"
          />
          <span className="text-[9px] text-slate-500 uppercase tracking-wider mt-1">Verified Photo</span>
        </div>
      </div>

      {/* Exam Timetable Table */}
      <div>
        <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">
          Scheduled Examination Papers & Reporting Times
        </h4>
        <table className="w-full text-left text-xs font-sans border border-slate-300">
          <thead className="bg-slate-200 text-slate-800 font-bold uppercase text-[10px]">
            <tr>
              <th className="p-2 border-r border-slate-300">Code</th>
              <th className="p-2 border-r border-slate-300">Subject Name</th>
              <th className="p-2 border-r border-slate-300">Date</th>
              <th className="p-2 border-r border-slate-300">Time</th>
              <th className="p-2 border-r border-slate-300">Room / Centre</th>
              <th className="p-2 text-center">Invigilator Sign</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300 text-slate-900">
            {subjects.map((sub, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="p-2 font-mono font-bold text-blue-950 border-r border-slate-300">{sub.code}</td>
                <td className="p-2 font-semibold border-r border-slate-300">{sub.name}</td>
                <td className="p-2 font-mono border-r border-slate-300">{sub.date}</td>
                <td className="p-2 border-r border-slate-300">{sub.time}</td>
                <td className="p-2 border-r border-slate-300 text-[11px]">{sub.room}</td>
                <td className="p-2 border-slate-300 h-8"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Candidate Instructions */}
      <div className="text-[10px] text-slate-600 font-sans border-t border-slate-300 pt-3 space-y-1">
        <span className="font-bold text-slate-800 uppercase block">Important Instructions for the Candidate:</span>
        {rules.map((rule, idx) => (
          <p key={idx}>&bull; {rule}</p>
        ))}
      </div>

      {/* Signatures & Security Seals */}
      <div className="grid grid-cols-3 gap-4 pt-6 border-t-2 border-slate-900 text-center font-sans text-xs">
        <div>
          <div className="h-10 border-b border-dashed border-slate-400 mb-1"></div>
          <span className="text-[11px] font-bold text-slate-700 block">Candidate's Signature</span>
          <span className="text-[9px] text-slate-400">(To be signed in exam hall)</span>
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full border-2 border-blue-900/40 flex items-center justify-center p-1 text-[8px] uppercase font-bold text-blue-950 text-center leading-tight">
            RVSCET JSR EXAM SEAL
          </div>
        </div>

        <div>
          <div className="h-10 border-b border-dashed border-slate-400 mb-1 flex items-end justify-center">
            <span className="font-serif italic text-blue-900 font-bold">R. K. Tiwari</span>
          </div>
          <strong className="text-[11px] text-blue-950 block">{card.signatory_title}</strong>
          <span className="text-[9px] text-slate-500">{card.signatory_office}</span>
        </div>
      </div>
    </div>
  );
}
