import React, { useState } from 'react';
import {
  X,
  User,
  GraduationCap,
  Calendar,
  Award,
  AlertTriangle,
  Receipt,
  FileText,
  BookOpen,
  LifeBuoy,
  FileCheck,
  ShieldCheck,
  Briefcase,
  CheckCircle2,
  Clock,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Download,
  AlertCircle
} from 'lucide-react';
import RVSLogo from '../../components/RVSLogo';
import { RVS_CONFIG } from '../../config/rvsConfig';

export default function Student360ProfileModal({ profileData, onClose, onRefresh }) {
  if (!profileData || !profileData.student) return null;

  const { student, summaryCards = {}, academic = {}, attendance = {}, results = [], backlogs = {}, fees = {}, assignments = {}, library = {}, leave = {}, documents = [], certificates = [], placement = {} } = profileData;

  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'academic', label: 'Academic', icon: GraduationCap },
    { id: 'attendance', label: 'Attendance', icon: Calendar, badge: `${summaryCards.attendancePct || 0}%` },
    { id: 'results', label: 'Results', icon: Award },
    { id: 'backlogs', label: 'Backlogs', icon: AlertTriangle, badge: summaryCards.activeBacklogs > 0 ? summaryCards.activeBacklogs : null, badgeColor: 'bg-rose-500 text-white' },
    { id: 'fees', label: 'Fees', icon: Receipt, badge: summaryCards.pendingFees > 0 ? `₹${summaryCards.pendingFees}` : null, badgeColor: 'bg-amber-500 text-slate-950' },
    { id: 'assignments', label: 'Assignments', icon: FileText, badge: summaryCards.pendingAssignments > 0 ? `${summaryCards.pendingAssignments} due` : null },
    { id: 'library', label: 'Library', icon: BookOpen },
    { id: 'leave', label: 'Leave', icon: LifeBuoy },
    { id: 'documents', label: 'Documents', icon: FileCheck },
    { id: 'certificates', label: 'Certificates', icon: ShieldCheck },
    { id: 'placement', label: 'Placement', icon: Briefcase, badge: summaryCards.placementEligible ? 'Eligible' : 'Not Eligible', badgeColor: summaryCards.placementEligible ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-slate-950 border border-slate-800 text-slate-100 rounded-3xl p-5 sm:p-7 shadow-2xl my-6 space-y-6 max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors z-10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. Profile Header */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#071324] via-slate-900 to-[#0a192f] border border-blue-900/40 relative overflow-hidden shrink-0">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              <div className="relative">
                <img
                  src={student.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'}
                  alt={student.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-2 ring-amber-400/80 shadow-lg"
                />
                <span className={`absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  student.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                }`}>
                  {student.status}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">{student.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {student.roll_no}
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-medium">
                  {student.course} &bull; <span className="text-amber-400 font-semibold">{student.semester}</span>
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-[11px] text-slate-400 pt-1">
                  <span>Reg: <strong className="font-mono text-slate-200">{student.reg_no}</strong></span>
                  <span>Adm No: <strong className="font-mono text-slate-200">{student.admission_no}</strong></span>
                  <span>Dept: <strong className="text-slate-200">{student.department_code}</strong></span>
                  <span>Batch: <strong className="text-slate-200">{student.batch}</strong></span>
                  <span>Session: <strong className="text-slate-200">{student.session}</strong></span>
                </div>
              </div>
            </div>

            {/* Quick Institutional Branding */}
            <div className="hidden lg:flex flex-col items-end text-right border-l border-slate-800 pl-6 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">RVS Smart Campus ERP</span>
              <p className="text-xs font-bold text-slate-200">{RVS_CONFIG.name}</p>
              <p className="text-[10px] text-slate-400">Student 360° Academic & Operations Dossier</p>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/60 font-mono mt-1">
                JUT Ranchi Affiliated
              </span>
            </div>
          </div>
        </div>

        {/* 2. Tabs Bar (12 Tabs) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800 shrink-0 custom-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.02]'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                    isActive ? 'bg-slate-950 text-amber-400' : (tab.badgeColor || 'bg-slate-800 text-slate-300')
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 3. Tab Contents (Scrollable Container) */}
        <div className="flex-1 overflow-y-auto pr-1 text-xs space-y-4">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Summary Cards Grid (The 8 requested cards) */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Key Performance & Operational Metrics
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* 1. Attendance % */}
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-colors">
                    <span className="text-[11px] text-slate-400 block">Attendance Rate</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className={`text-xl font-black ${summaryCards.attendancePct < 75 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {summaryCards.attendancePct}%
                      </span>
                      {summaryCards.attendancePct < 75 && (
                        <span className="text-[9px] font-bold text-rose-400 uppercase">Warning</span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Min 75% for Admit Card</span>
                  </div>

                  {/* 2. Current SGPA */}
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Current SGPA</span>
                    <span className="text-xl font-black text-blue-400 mt-1 block font-mono">{summaryCards.currentSgpa}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Latest Semester Exam</span>
                  </div>

                  {/* 3. CGPA */}
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Cumulative CGPA</span>
                    <span className="text-xl font-black text-amber-400 mt-1 block font-mono">{summaryCards.cgpa}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Scale of 10.0</span>
                  </div>

                  {/* 4. Pending Fees */}
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Pending Fees</span>
                    <span className={`text-xl font-black mt-1 block font-mono ${summaryCards.pendingFees > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      ₹{summaryCards.pendingFees.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {summaryCards.pendingFees > 0 ? 'Dues Outstanding' : 'All Clear'}
                    </span>
                  </div>

                  {/* 5. Pending Assignments */}
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Pending Assignments</span>
                    <span className={`text-xl font-black mt-1 block ${summaryCards.pendingAssignments > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {summaryCards.pendingAssignments}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Due for Submission</span>
                  </div>

                  {/* 6. Library Books Issued */}
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Books Issued</span>
                    <span className="text-xl font-black text-purple-400 mt-1 block font-mono">{summaryCards.libraryBooksIssued}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Currently Holding</span>
                  </div>

                  {/* 7. Backlogs */}
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Active Backlogs</span>
                    <span className={`text-xl font-black mt-1 block ${summaryCards.activeBacklogs > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {summaryCards.activeBacklogs}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {summaryCards.clearedBacklogs} Cleared Historically
                    </span>
                  </div>

                  {/* 8. Placement Eligibility */}
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Placement Status</span>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        summaryCards.placementEligible ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {summaryCards.placementEligible ? 'Eligible' : 'Not Eligible'}
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-400 block mt-1 truncate" title={summaryCards.placementReason}>
                      {summaryCards.placementReason}
                    </span>
                  </div>
                </div>
              </div>

              {/* Personal & Guardian Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    Personal Details
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    <p className="flex justify-between"><span className="text-slate-400">Email:</span> <span className="font-mono text-slate-200">{student.email}</span></p>
                    <p className="flex justify-between"><span className="text-slate-400">Mobile:</span> <span className="font-mono text-slate-200">{student.phone}</span></p>
                    <p className="flex justify-between"><span className="text-slate-400">Date of Birth:</span> <span className="text-slate-200">{student.dob}</span></p>
                    <p className="flex justify-between"><span className="text-slate-400">Gender:</span> <span className="text-slate-200">{student.gender}</span></p>
                    <p className="flex justify-between"><span className="text-slate-400">Residential Address:</span> <span className="text-slate-200 text-right max-w-[220px]">{student.address}</span></p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Guardian Information
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    <p className="flex justify-between"><span className="text-slate-400">Father/Guardian:</span> <span className="text-slate-200 font-semibold">{student.guardian_name}</span></p>
                    <p className="flex justify-between"><span className="text-slate-400">Mother:</span> <span className="text-slate-200">{student.mother_name}</span></p>
                    <p className="flex justify-between"><span className="text-slate-400">Guardian Mobile:</span> <span className="font-mono text-slate-200">{student.guardian_phone}</span></p>
                    <p className="flex justify-between"><span className="text-slate-400">Guardian Email:</span> <span className="text-slate-200">{student.guardian_email}</span></p>
                    <p className="flex justify-between"><span className="text-slate-400">Guardian Address:</span> <span className="text-slate-200 text-right max-w-[220px]">{student.guardian_address}</span></p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACADEMIC */}
          {activeTab === 'academic' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-900/30 text-blue-400 border border-blue-800">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{academic.mentor?.name}</h4>
                    <p className="text-[11px] text-slate-400">{academic.mentor?.designation}</p>
                    <p className="text-[10px] text-amber-400 font-mono mt-0.5">{academic.mentor?.office} &bull; {academic.mentor?.email}</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold">
                  Official Academic Advisor
                </span>
              </div>

              <div>
                <h4 className="font-bold text-slate-200 text-xs mb-2">Registered Curriculum Subjects ({student.semester})</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(academic.enrolledSubjects || []).map((c) => (
                    <div key={c.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                      <div>
                        <span className="font-mono text-amber-400 font-bold block">{c.code}</span>
                        <p className="font-semibold text-slate-200 text-xs mt-0.5">{c.name}</p>
                        <p className="text-[10px] text-slate-500">Credits: {c.credits || 4} &bull; Theory / Practical</p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                        Enrolled
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ATTENDANCE */}
          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400">Total Classes</span>
                  <p className="text-base font-bold text-white mt-0.5">{attendance.totalClasses || 0}</p>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400">Present</span>
                  <p className="text-base font-bold text-emerald-400 mt-0.5">{attendance.present || 0}</p>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400">Absent</span>
                  <p className="text-base font-bold text-rose-400 mt-0.5">{attendance.absent || 0}</p>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400">Late</span>
                  <p className="text-base font-bold text-amber-400 mt-0.5">{attendance.late || 0}</p>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400">Excused / OD</span>
                  <p className="text-base font-bold text-blue-400 mt-0.5">{attendance.excused || 0}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-200 text-xs mb-2">Subject-Wise Attendance Breakdown</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(attendance.subjectWise || []).map((s) => (
                    <div key={s.code} className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-amber-400 font-bold">{s.code}</span>
                        <span className={`font-mono font-bold ${s.isLowAttendance ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {s.percentage}%
                        </span>
                      </div>
                      <p className="text-slate-300 font-medium truncate mt-1 text-[11px]">{s.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Attended {s.attended} of {s.total} sessions
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RESULTS */}
          {activeTab === 'results' && (
            <div className="space-y-4">
              {results.length === 0 ? (
                <div className="p-8 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
                  No published end-term examination results yet for this session.
                </div>
              ) : (
                results.map((r, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <div>
                        <h4 className="font-bold text-white text-xs">{r.exam_name || 'Semester Examination'}</h4>
                        <p className="text-[10px] text-slate-400 font-mono">{r.semester} &bull; Academic Session {student.session}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">SGPA</span>
                          <span className="font-mono font-bold text-amber-400 text-sm">{r.sgpa || '8.65'}</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {r.result_status || 'Passed'}
                        </span>
                      </div>
                    </div>

                    <table className="w-full text-left text-xs">
                      <thead className="text-[10px] text-slate-400 border-b border-slate-800 uppercase">
                        <tr>
                          <th className="py-1">Subject Code</th>
                          <th className="py-1">Subject Name</th>
                          <th className="py-1 text-center">Marks</th>
                          <th className="py-1 text-center">Grade</th>
                          <th className="py-1 text-right">Result</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {(r.subjects || []).map((sub, sIdx) => (
                          <tr key={sIdx}>
                            <td className="py-2 font-mono text-amber-400">{sub.code}</td>
                            <td className="py-2 text-slate-200">{sub.name}</td>
                            <td className="py-2 font-mono text-center">{sub.marks}</td>
                            <td className="py-2 font-mono text-center font-bold text-blue-400">{sub.grade}</td>
                            <td className="py-2 text-right">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                sub.grade === 'F' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                              }`}>
                                {sub.grade === 'F' ? 'Fail (Backlog)' : 'Pass'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 5: BACKLOGS */}
          {activeTab === 'backlogs' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400">Total Recorded</span>
                  <p className="text-base font-bold text-white mt-0.5">{backlogs.summary?.total || 0}</p>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400">Active / Pending</span>
                  <p className={`text-base font-bold mt-0.5 ${backlogs.summary?.active > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {backlogs.summary?.active || 0}
                  </p>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400">Cleared Historically</span>
                  <p className="text-base font-bold text-emerald-400 mt-0.5">{backlogs.summary?.cleared || 0}</p>
                </div>
              </div>

              {(backlogs.records || []).length === 0 ? (
                <div className="p-8 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800 flex flex-col items-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
                  <p className="font-bold text-slate-200">Zero Backlogs</p>
                  <p className="text-xs text-slate-400">Student has cleared all subjects in original attempts with no backlog history.</p>
                </div>
              ) : (
                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-400 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Subject</th>
                        <th className="p-3">Semester</th>
                        <th className="p-3">Original Exam</th>
                        <th className="p-3 text-center">Attempt</th>
                        <th className="p-3 text-center">Marks</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Cleared Date / Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {(backlogs.records || []).map((b) => (
                        <tr key={b.id} className="hover:bg-slate-900/40">
                          <td className="p-3">
                            <span className="font-bold text-white block">{b.subject_name}</span>
                            <span className="font-mono text-amber-400 text-[10px]">{b.subject_code}</span>
                          </td>
                          <td className="p-3 font-medium text-slate-300">{b.semester}</td>
                          <td className="p-3 text-slate-400">{b.original_exam}</td>
                          <td className="p-3 text-center font-mono font-bold text-slate-200">{b.attempt_number}</td>
                          <td className="p-3 text-center font-mono font-bold text-slate-200">{b.marks || '-'}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              b.status === 'Cleared' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400 text-[11px]">
                            {b.status === 'Cleared' ? `Cleared on ${b.cleared_date}` : b.remarks}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: FEES */}
          {activeTab === 'fees' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400">Total Payable</span>
                  <p className="text-base font-bold font-mono text-white mt-0.5">₹{(fees.summary?.totalPayable || 0).toLocaleString('en-IN')}</p>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400">Total Paid</span>
                  <p className="text-base font-bold font-mono text-emerald-400 mt-0.5">₹{(fees.summary?.totalPaid || 0).toLocaleString('en-IN')}</p>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400">Pending Dues</span>
                  <p className={`text-base font-bold font-mono mt-0.5 ${(fees.summary?.totalPending || 0) > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    ₹{(fees.summary?.totalPending || 0).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-200 text-xs mb-2">Institutional Invoices & Receipts</h4>
                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-400 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Invoice / Session</th>
                        <th className="p-3">Semester</th>
                        <th className="p-3">Total (₹)</th>
                        <th className="p-3">Paid (₹)</th>
                        <th className="p-3">Pending (₹)</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {(fees.invoices || []).map((f) => (
                        <tr key={f.id} className="hover:bg-slate-900/40">
                          <td className="p-3 font-semibold text-white">{f.academic_year || '2025-2026'}</td>
                          <td className="p-3 text-slate-300">{f.semester || student.semester}</td>
                          <td className="p-3 font-mono font-bold text-slate-200">₹{Number(f.total_amount || 0).toLocaleString('en-IN')}</td>
                          <td className="p-3 font-mono text-emerald-400">₹{Number(f.paid_amount || 0).toLocaleString('en-IN')}</td>
                          <td className="p-3 font-mono text-rose-400">₹{Number(f.pending_amount || 0).toLocaleString('en-IN')}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              f.status === 'Paid' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}>
                              {f.status || 'Paid'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: ASSIGNMENTS */}
          {activeTab === 'assignments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {assignments.submittedCount || 0} of {assignments.total || 0} Submissions Completed
                </span>
                <span className="text-xs font-bold text-amber-400">
                  {assignments.pendingCount || 0} Action Pending
                </span>
              </div>

              <div className="space-y-3">
                {(assignments.list || []).map((a) => (
                  <div key={a.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-amber-400 text-xs font-bold">{a.subject_code}</span>
                        <h4 className="font-bold text-white text-xs">{a.title}</h4>
                      </div>
                      <p className="text-[11px] text-slate-400">{a.subject_name} &bull; Faculty: {a.faculty_name}</p>
                      <p className="text-[10px] text-slate-500">Due Date: <span className="text-slate-300 font-mono">{a.due_date}</span> &bull; Max Marks: {a.max_marks}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {a.status === 'Submitted' ? (
                        <div className="text-right">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Submitted
                          </span>
                          <span className="block font-mono font-bold text-amber-400 text-xs mt-0.5">Score: {a.marks}/{a.max_marks}</span>
                        </div>
                      ) : (
                        <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          Pending Submission
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: LIBRARY */}
          {activeTab === 'library' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-200 text-xs">Currently Issued Books</h4>
              {(library.currentlyIssued || []).length === 0 ? (
                <div className="p-6 text-center text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
                  No books currently issued to this student account.
                </div>
              ) : (
                <div className="space-y-2">
                  {(library.currentlyIssued || []).map((b) => (
                    <div key={b.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-white text-xs">{b.book_title}</h4>
                        <p className="text-[11px] text-slate-400 font-mono">ISBN: {b.isbn}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Issued: {b.issue_date} &bull; Due Date: <strong className="text-amber-400">{b.due_date}</strong>
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        Issued
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <h4 className="font-bold text-slate-200 text-xs pt-2">Borrowing History</h4>
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Title</th>
                      <th className="p-3">Issue Date</th>
                      <th className="p-3">Due Date</th>
                      <th className="p-3">Return Date</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {(library.history || []).map((b) => (
                      <tr key={b.id} className="hover:bg-slate-900/40">
                        <td className="p-3 font-semibold text-white">{b.book_title}</td>
                        <td className="p-3 text-slate-300 font-mono">{b.issue_date}</td>
                        <td className="p-3 text-slate-300 font-mono">{b.due_date}</td>
                        <td className="p-3 text-slate-300 font-mono">{b.return_date || '-'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            b.status === 'Returned' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-purple-500/20 text-purple-400'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 9: LEAVE */}
          {activeTab === 'leave' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-200 text-xs">Leave Applications & OD Requests</h4>
              {(leave.leavesList || []).length === 0 ? (
                <div className="p-6 text-center text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
                  No leave applications recorded for this student.
                </div>
              ) : (
                <div className="space-y-2">
                  {(leave.leavesList || []).map((l) => (
                    <div key={l.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-white text-xs">{l.leave_type || 'Casual Leave'}</h4>
                        <p className="text-[11px] text-slate-400">{l.reason || 'Medical / Personal'}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          From: {l.start_date} To: {l.end_date} &bull; Applied: {l.applied_at?.split('T')[0] || '2026-02-10'}
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                        l.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {l.status || 'Approved'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 10: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-slate-200 text-xs">Academic & Admission Documents</h4>
                <span className="text-[11px] text-slate-400">Strictly Private & Protected Storage</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <FileCheck className="w-4 h-4 text-blue-400 shrink-0" />
                        <h5 className="font-bold text-white text-xs">{doc.doc_type}</h5>
                      </div>
                      <p className="text-[10px] font-mono text-slate-400">{doc.file_name}</p>
                      <p className="text-[10px] text-slate-500">
                        Uploaded: {doc.upload_date} &bull; {doc.remarks || 'Archived record'}
                      </p>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                      doc.status === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      doc.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 11: CERTIFICATES */}
          {activeTab === 'certificates' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-200 text-xs">Official Issued Certificates</h4>
              {certificates.length === 0 ? (
                <div className="p-6 text-center text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
                  No institutional certificates generated yet for this student.
                </div>
              ) : (
                <div className="space-y-3">
                  {certificates.map((cert) => (
                    <div key={cert.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <h5 className="font-bold text-white text-xs">{cert.template_type}</h5>
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-amber-400">
                            {cert.certificate_no}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">Purpose: {cert.purpose}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Issued on {cert.issue_date} by {cert.signatory}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {cert.status}
                        </span>
                        <a
                          href={`/verify/certificate/${cert.certificate_no}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Verify QR
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 12: PLACEMENT */}
          {activeTab === 'placement' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">T&P Cell Eligibility Clearance</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase ${
                      placement.isEligible ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      {placement.isEligible ? 'Eligible for Recruitment Drives' : 'Currently Ineligible'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1.5">{placement.eligibilityReason}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 block">Required Cutoffs</span>
                  <span className="text-xs text-slate-200 block font-mono">Min CGPA: {placement.minCgpaReq}</span>
                  <span className="text-xs text-slate-200 block font-mono">Max Backlogs: {placement.maxBacklogsAllowed}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-200 text-xs mb-2">Campus Recruitment Drives Roster</h4>
                <div className="space-y-2">
                  {(placement.drivesApplied || []).map((d) => (
                    <div key={d.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                      <div>
                        <h5 className="font-bold text-white text-xs">{d.company}</h5>
                        <p className="text-[11px] text-slate-400">{d.role} &bull; Package: <strong className="text-amber-400">{d.package}</strong></p>
                        <p className="text-[10px] text-slate-500">Drive Date: {d.date}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                        d.studentStatus.includes('Eligible') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {d.studentStatus}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <RVSLogo size="xs" showText={false} />
            <span>RVS College of Engineering & Technology &bull; Single Unified Record Registry</span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            Close 360° Profile
          </button>
        </div>
      </div>
    </div>
  );
}
