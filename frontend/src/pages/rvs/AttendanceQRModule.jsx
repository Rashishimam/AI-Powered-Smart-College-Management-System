import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { 
  QrCode, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Users, 
  Sparkles, 
  RefreshCw, 
  ShieldCheck,
  Check,
  X,
  Calendar,
  Search,
  Filter,
  UserCheck,
  UserX,
  HelpCircle,
  Clock3,
  FileText,
  Download,
  Printer,
  Edit3,
  History,
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Building2,
  GraduationCap,
  TrendingUp,
  LogIn,
  LogOut,
  SlidersHorizontal,
  FileSpreadsheet
} from 'lucide-react';
import RVS_CONFIG from '../../config/rvsConfig';
import RVSLogo from '../../components/RVSLogo';
import Card, { CardHeader } from '../../components/ui/Card';
import StatCard from '../../components/StatCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';

export default function AttendanceQRModule() {
  const { user } = useAuth();
  const role = user?.role || 'student';
  const isStudent = role === 'student';
  const isFaculty = role === 'faculty';
  const isAdmin = role === 'college_admin' || role === 'super_admin';
  const isStaff = isFaculty || isAdmin;

  // Active top-level tab
  // Options: 'student_history', 'faculty_history', 'qr_hub', 'corrections', 'reports'
  const [activeTab, setActiveTab] = useState(
    isStudent ? 'student_history' : (isFaculty ? 'faculty_history' : 'student_history')
  );

  // Notifications / Feedback
  const [message, setMessage] = useState({ text: '', type: '' });
  const showToast = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4500);
  };

  // =========================================================================
  // 1. STUDENT ATTENDANCE HISTORY STATE
  // =========================================================================
  const [studentHistoryLoading, setStudentHistoryLoading] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(user?.id || 7);
  const [historyView, setHistoryView] = useState('all'); // 'all', 'daily', 'weekly', 'monthly', 'semester', 'subject'
  
  // Student Filters
  const [filterPreset, setFilterPreset] = useState('all'); // 'today', 'this_week', 'this_month', 'all'
  const [filterDate, setFilterDate] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSemester, setFilterSemester] = useState('all');
  const [filterSearch, setFilterSearch] = useState('');

  // Monthly / Calendar sub-view state
  const [selectedMonth, setSelectedMonth] = useState(9); // September
  const [selectedYear, setSelectedYear] = useState(2026);
  const [calendarPopupDate, setCalendarPopupDate] = useState(null);

  // =========================================================================
  // 2. FACULTY ATTENDANCE HISTORY STATE
  // =========================================================================
  const [facultyHistoryLoading, setFacultyHistoryLoading] = useState(false);
  const [facultyData, setFacultyData] = useState(null);
  const [selectedFacultyId, setSelectedFacultyId] = useState(user?.id || 6);
  const [facultyMonth, setFacultyMonth] = useState(9);
  const [facultyYear, setFacultyYear] = useState(2026);
  const [facultyFilterStatus, setFacultyFilterStatus] = useState('all');
  const [facultySearch, setFacultySearch] = useState('');

  // =========================================================================
  // 3. LIVE QR & MANUAL ROLL CALL STATE (PRESERVED & EXTENDED)
  // =========================================================================
  const [qrMode, setQrMode] = useState('qr'); // 'qr' or 'manual'
  const [activeSession, setActiveSession] = useState(null);
  const [qrToken, setQrToken] = useState('');
  const [scanInput, setScanInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [countdown, setCountdown] = useState(180);

  // Manual Roster
  const [selectedClass, setSelectedClass] = useState('CSE-6A');
  const [selectedSubject, setSelectedSubject] = useState('CS-601');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualSearch, setManualSearch] = useState('');
  const [manualRoster, setManualRoster] = useState([
    { id: 7, name: 'Rahul Kumar Verma', roll: '23RVSCSE042', status: 'Present' },
    { id: 10, name: 'Vikramaditya Kumar Singh', roll: '23RVSCSE055', status: 'Absent' },
    { id: 11, name: 'Ananya Sharma', roll: '23RVSCSE009', status: 'Present' },
    { id: 12, name: 'Rohan Gupta', roll: '23RVSCSE027', status: 'Late' },
    { id: 4, name: 'Vikramaditya Kumar Singh (Updated)', roll: '23RVSCSE012', status: 'Present' },
    { id: 9, name: 'RASHISH IMAM', roll: '23RVSCSE001', status: 'Present' }
  ]);

  // =========================================================================
  // 4. ATTENDANCE CORRECTION & AUDIT STATE
  // =========================================================================
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditTypeFilter, setAuditTypeFilter] = useState('all');

  // Correction Modal
  const [correctingRecord, setCorrectingRecord] = useState(null);
  const [correctionNewStatus, setCorrectionNewStatus] = useState('Present');
  const [correctionReason, setCorrectionReason] = useState('');
  const [correctionSubmitting, setCorrectionSubmitting] = useState(false);

  // =========================================================================
  // 5. REPORT GENERATION STATE
  // =========================================================================
  const [reportType, setReportType] = useState('student_monthly');
  const [reportDepartment, setReportDepartment] = useState('all');
  const [reportSemester, setReportSemester] = useState('6th Semester');
  const [reportSubject, setReportSubject] = useState('all');
  const [reportMonth, setReportMonth] = useState(9);
  const [reportYear, setReportYear] = useState(2026);
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // =========================================================================
  // LOADERS
  // =========================================================================

  // Load Student Attendance History
  const loadStudentHistory = async () => {
    try {
      setStudentHistoryLoading(true);
      const params = new URLSearchParams();
      if (!isStudent && selectedStudentId) {
        params.append('student_id', selectedStudentId);
      }
      if (filterPreset !== 'all') params.append('preset', filterPreset);
      if (filterDate) params.append('date', filterDate);
      if (filterStartDate) params.append('startDate', filterStartDate);
      if (filterEndDate) params.append('endDate', filterEndDate);
      if (filterSubject !== 'all') params.append('subject', filterSubject);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterSemester !== 'all') params.append('semester', filterSemester);
      if (filterSearch) params.append('search', filterSearch);
      params.append('month', selectedMonth);
      params.append('year', selectedYear);

      const res = await api.get(`/rvs/attendance/student/history?${params.toString()}`);
      if (res.data?.success) {
        setStudentData(res.data);
      }
    } catch (err) {
      console.error('Failed to load student attendance history:', err);
    } finally {
      setStudentHistoryLoading(false);
    }
  };

  // Load Faculty Attendance History
  const loadFacultyHistory = async () => {
    try {
      setFacultyHistoryLoading(true);
      const params = new URLSearchParams();
      if (isAdmin && selectedFacultyId) {
        params.append('faculty_id', selectedFacultyId);
      }
      params.append('month', facultyMonth);
      params.append('year', facultyYear);
      if (facultyFilterStatus !== 'all') params.append('status', facultyFilterStatus);
      if (facultySearch) params.append('search', facultySearch);

      const res = await api.get(`/rvs/attendance/faculty/history?${params.toString()}`);
      if (res.data?.success) {
        setFacultyData(res.data);
      }
    } catch (err) {
      console.error('Failed to load faculty attendance history:', err);
    } finally {
      setFacultyHistoryLoading(false);
    }
  };

  // Load Audit Logs
  const loadAuditLogs = async () => {
    try {
      setAuditLoading(true);
      const params = new URLSearchParams();
      if (auditTypeFilter !== 'all') params.append('record_type', auditTypeFilter);
      if (auditSearch) params.append('search', auditSearch);

      const res = await api.get(`/rvs/attendance/audit-logs?${params.toString()}`);
      if (res.data?.success) {
        setAuditLogs(res.data.logs || []);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setAuditLoading(false);
    }
  };

  // Initial load & triggers
  useEffect(() => {
    if (activeTab === 'student_history') {
      loadStudentHistory();
    } else if (activeTab === 'faculty_history') {
      loadFacultyHistory();
    } else if (activeTab === 'corrections') {
      loadAuditLogs();
    }
  }, [
    activeTab, 
    selectedStudentId, 
    filterPreset, 
    filterDate, 
    filterStartDate, 
    filterEndDate, 
    filterSubject, 
    filterStatus, 
    filterSemester, 
    selectedMonth, 
    selectedYear,
    selectedFacultyId,
    facultyMonth,
    facultyYear,
    facultyFilterStatus
  ]);

  // QR Session Timer
  useEffect(() => {
    if (!activeSession) return;
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.floor((new Date(activeSession.qr_expires_at) - new Date()) / 1000));
      setCountdown(remaining);
      if (remaining === 0) {
        setActiveSession(null);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [activeSession]);

  // QR Generation
  const handleGenerateQR = async () => {
    try {
      setGenerating(true);
      const res = await api.post('/rvs/attendance/qr/generate', {
        course_id: 101,
        department_code: 'CSE',
        semester: '6th Semester',
        validityMinutes: 3
      });

      if (res.data?.success) {
        setActiveSession(res.data.session);
        setQrToken(res.data.session.qr_token);
        setCountdown(180);
        showToast('Dynamic 3-Minute QR Code is LIVE for CSE-6th Sem!');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to generate QR session', 'error');
    } finally {
      setGenerating(false);
    }
  };

  // Student Scan Token
  const handleScanAttendance = async (tokenToUse) => {
    const token = tokenToUse || scanInput;
    if (!token) return;

    try {
      setScanning(true);
      const res = await api.post('/rvs/attendance/qr/scan', { qr_token: token.trim() });
      if (res.data?.success) {
        showToast(res.data.message);
        setScanInput('');
        loadStudentHistory();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Verification failed. Expired or duplicate token.', 'error');
    } finally {
      setScanning(false);
    }
  };

  // Faculty Self Check-in / Check-out
  const handleFacultyCheckinAction = async (action) => {
    try {
      const res = await api.post('/rvs/attendance/faculty/checkin', { action });
      if (res.data?.success) {
        showToast(res.data.message);
        loadFacultyHistory();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed', 'error');
    }
  };

  // Submit Attendance Correction
  const handleCorrectionSubmit = async (e) => {
    e.preventDefault();
    if (!correctingRecord) return;
    if (!correctionReason.trim()) {
      alert('A valid reason for correction is required.');
      return;
    }

    try {
      setCorrectionSubmitting(true);
      const payload = {
        record_type: correctingRecord.record_type || 'student',
        record_id: correctingRecord.id,
        new_status: correctionNewStatus,
        reason: correctionReason.trim()
      };

      const res = await api.post('/rvs/attendance/correct', payload);
      if (res.data?.success) {
        showToast(res.data.message);
        setCorrectingRecord(null);
        setCorrectionReason('');
        if (correctingRecord.record_type === 'faculty') {
          loadFacultyHistory();
        } else {
          loadStudentHistory();
        }
        loadAuditLogs();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to apply correction', 'error');
    } finally {
      setCorrectionSubmitting(false);
    }
  };

  // Save Manual Roll Call
  const handleSaveManualRoster = async () => {
    try {
      const res = await api.post('/rvs/attendance/manual', {
        course_id: 101,
        subject_code: selectedSubject,
        subject_name: 'Compiler Design',
        department_code: 'CSE',
        semester: '6th Semester',
        attendance_date: attendanceDate,
        roster: manualRoster
      });

      if (res.data?.success) {
        showToast(res.data.message);
        loadStudentHistory();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save roster', 'error');
    }
  };

  // Generate Official Branded Report
  const handleGenerateReport = async () => {
    try {
      setReportLoading(true);
      const params = new URLSearchParams();
      params.append('type', reportType);
      if (reportDepartment !== 'all') params.append('department', reportDepartment);
      if (reportSemester !== 'all') params.append('semester', reportSemester);
      if (reportSubject !== 'all') params.append('subject', reportSubject);
      params.append('month', reportMonth);
      params.append('year', reportYear);

      const res = await api.get(`/rvs/attendance/reports?${params.toString()}`);
      if (res.data?.success) {
        setReportData(res.data);
        setShowReportModal(true);
      }
    } catch (err) {
      showToast('Failed to generate attendance report', 'error');
    } finally {
      setReportLoading(false);
    }
  };

  // CSV Export utility
  const downloadReportCSV = () => {
    if (!reportData || !reportData.rows || reportData.rows.length === 0) return;
    const headers = Object.keys(reportData.rows[0]).join(',');
    const rows = reportData.rows.map(r => Object.values(r).map(v => `"${(v || '').toString().replace(/"/g, '""')}"`).join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RVS_Attendance_Report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper status badge styling
  const getStatusBadge = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'present':
        return <Badge variant="success" size="sm" className="font-semibold">Present</Badge>;
      case 'absent':
        return <Badge variant="danger" size="sm" className="font-semibold">Absent</Badge>;
      case 'late':
        return <Badge variant="warning" size="sm" className="font-semibold">Late</Badge>;
      case 'excused':
        return <Badge variant="info" size="sm" className="font-semibold">Excused</Badge>;
      case 'half day':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800">Half Day</span>;
      case 'on leave':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800">On Leave</span>;
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  const getMethodBadge = (method) => {
    if ((method || '').toLowerCase() === 'qr') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
          <QrCode className="w-3 h-3 text-blue-600" />
          QR
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
        <Edit3 className="w-3 h-3 text-slate-500" />
        Manual
      </span>
    );
  };

  // Reset Student Filters
  const handleResetStudentFilters = () => {
    setFilterPreset('all');
    setFilterDate('');
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterSubject('all');
    setFilterStatus('all');
    setFilterSemester('all');
    setFilterSearch('');
  };

  return (
    <div className="space-y-6 font-sans">
      {/* ========================================================================= */}
      {/* 1. Header Banner */}
      {/* ========================================================================= */}
      <div className="erp-card bg-gradient-to-r from-[#0a192f] via-[#0f2347] to-[#1e3a8a] text-white p-6 rounded-2xl relative overflow-hidden shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-4">
            <RVSLogo size="md" variant="light" showText={false} subtitle={false} className="shrink-0" />
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-slate-950">
                  {isStudent ? 'Student Attendance Portal' : (isFaculty ? 'Faculty Attendance & Roll-Call ERP' : 'Campus Attendance Directorate')}
                </span>
                <span className="text-xs text-blue-200">
                  Mandatory 75% Threshold &bull; AICTE & JUT Ranchi
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Attendance Management & History System
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                {RVS_CONFIG.name}, Jamshedpur &bull; Multi-Role Audit Trail, Dynamic Subject Tracking & QR Verification
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {isStaff && (
              <Button
                variant="gold"
                size="sm"
                icon={Printer}
                onClick={() => {
                  setActiveTab('reports');
                  handleGenerateReport();
                }}
              >
                Generate Report
              </Button>
            )}

            {isFaculty && (
              <Button
                variant="outline"
                size="sm"
                icon={QrCode}
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                onClick={() => {
                  setActiveTab('qr_hub');
                  handleGenerateQR();
                }}
              >
                Launch Live QR
              </Button>
            )}

            {isStudent && (
              <Button
                variant="gold"
                size="sm"
                icon={QrCode}
                onClick={() => setActiveTab('qr_hub')}
              >
                Scan Live QR
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Toast Alert */}
      {message.text && (
        <div className={`p-4 rounded-xl text-xs flex items-center gap-2.5 border animate-slide-up ${
          message.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold' 
            : 'bg-rose-50 border-rose-200 text-rose-900 font-semibold'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. Navigation Tabs */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between border-b border-slate-200 overflow-x-auto gap-2 pb-px no-print">
        <div className="flex items-center gap-2">
          {/* Tab 1: Student Attendance History (For Students, or Admin/Faculty inspecting students) */}
          <button
            onClick={() => setActiveTab('student_history')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'student_history'
                ? 'border-blue-900 text-blue-900 bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>{isStudent ? 'Attendance History' : 'Student Attendance History'}</span>
            {studentData?.summary?.hasLowAttendanceWarning && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          {/* Tab 2: Faculty Attendance History (For Faculty self, or Admin inspecting faculty) */}
          {isStaff && (
            <button
              onClick={() => setActiveTab('faculty_history')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'faculty_history'
                  ? 'border-blue-900 text-blue-900 bg-blue-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>{isFaculty ? 'My Attendance History' : 'Faculty Attendance History'}</span>
            </button>
          )}

          {/* Tab 3: Live QR & Manual Roll Call */}
          <button
            onClick={() => setActiveTab('qr_hub')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'qr_hub'
                ? 'border-blue-900 text-blue-900 bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>{isStudent ? 'QR Check-in Scanner' : 'Live QR & Manual Roll Call'}</span>
            {activeSession && (
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500 text-slate-950 font-mono font-black animate-pulse">
                LIVE
              </span>
            )}
          </button>

          {/* Tab 4: Corrections & Audit Trail */}
          {isStaff && (
            <button
              onClick={() => setActiveTab('corrections')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'corrections'
                  ? 'border-blue-900 text-blue-900 bg-blue-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Attendance Corrections & Audit</span>
            </button>
          )}

          {/* Tab 5: Reports & Exports */}
          {isStaff && (
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'reports'
                  ? 'border-blue-900 text-blue-900 bg-blue-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Attendance Reports & Export</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TAB 1: STUDENT ATTENDANCE HISTORY */}
      {/* ========================================================================= */}
      {activeTab === 'student_history' && (
        <div className="space-y-6">
          {/* Admin / Faculty Student Selector */}
          {isStaff && (
            <Card padding="sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-900" />
                  <span className="text-xs font-bold text-slate-800">Select Student to Inspect:</span>
                </div>
                <div className="flex items-center gap-3 flex-1 max-w-md">
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(Number(e.target.value))}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-blue-600"
                  >
                    {(studentData?.studentList || []).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.rollNo}) &bull; {s.department} &bull; {s.overallPct}% Attendance {s.isLowAttendance ? '⚠️ LOW' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>
          )}

          {/* Low Attendance Warning Alert Banner (Configurable < 75%) */}
          {studentData?.summary?.hasLowAttendanceWarning && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-700 to-red-800 text-white shadow-lg border border-rose-500 animate-slide-up flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-xl shrink-0">
                  <AlertTriangle className="w-6 h-6 text-white animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-white text-rose-800 tracking-wider">
                      CRITICAL ALERT
                    </span>
                    <h3 className="text-sm font-black tracking-tight">LOW ATTENDANCE WARNING</h3>
                  </div>
                  <p className="text-xs text-rose-100 mt-1 max-w-3xl leading-relaxed">
                    Current overall attendance is <strong className="text-white underline">{studentData?.summary?.overallPercentage}%</strong>, 
                    which is strictly below the mandatory <strong className="text-white">{studentData?.summary?.minRequired}%</strong> minimum threshold 
                    stipulated by Jharkhand University of Technology (JUT) and RVSCET regulations. The student is at severe risk of debarment from semester-end examinations.
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {isStaff ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white text-rose-800 border-white hover:bg-rose-50 font-bold"
                    onClick={() => {
                      if (studentData?.records?.[0]) {
                        setCorrectingRecord({ ...studentData.records[0], record_type: 'student' });
                        setCorrectionNewStatus('Excused');
                      }
                    }}
                  >
                    Authorize Correction
                  </Button>
                ) : (
                  <span className="text-[11px] font-bold text-rose-200 bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">
                    Contact HOD Office Immediately
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Summary KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard
              title="Overall Attendance"
              value={`${studentData?.summary?.overallPercentage || '0.0'}%`}
              subtitle={`Min. required: ${studentData?.summary?.minRequired || 75}%`}
              icon={TrendingUp}
              color={studentData?.summary?.hasLowAttendanceWarning ? 'rose' : 'emerald'}
              trend={studentData?.summary?.hasLowAttendanceWarning ? 'Below Threshold' : 'Eligible for Exams'}
              trendType={studentData?.summary?.hasLowAttendanceWarning ? 'down' : 'up'}
            />

            <StatCard
              title="Total Classes"
              value={studentData?.summary?.totalClasses || 0}
              subtitle="Conducted this semester"
              icon={Calendar}
              color="navy"
            />

            <StatCard
              title="Classes Present"
              value={studentData?.summary?.present || 0}
              subtitle="Full classroom attendance"
              icon={UserCheck}
              color="emerald"
            />

            <StatCard
              title="Classes Absent"
              value={studentData?.summary?.absent || 0}
              subtitle="Unexcused missed sessions"
              icon={UserX}
              color="rose"
            />

            <StatCard
              title="Late Arrivals"
              value={studentData?.summary?.late || 0}
              subtitle="Logged >10 mins delay"
              icon={Clock}
              color="amber"
            />

            <StatCard
              title="Excused / OD"
              value={studentData?.summary?.excused || 0}
              subtitle="Medical & Official duty"
              icon={ShieldCheck}
              color="blue"
            />
          </div>

          {/* Views & Filter Bar */}
          <Card padding="sm">
            <div className="space-y-3">
              {/* Top Filter Row: View Presets & Quick Chips */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                {/* View Switcher Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                    <SlidersHorizontal className="w-3 h-3" />
                    View:
                  </span>
                  {[
                    { id: 'all', label: 'All Classes' },
                    { id: 'daily', label: 'Daily' },
                    { id: 'weekly', label: 'Weekly' },
                    { id: 'monthly', label: 'Monthly' },
                    { id: 'subject_wise', label: 'Subject-wise' },
                    { id: 'calendar', label: 'Calendar' }
                  ].map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setHistoryView(v.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        historyView === v.id
                          ? 'bg-blue-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>

                {/* Quick Date Presets */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-slate-500 mr-1">Timeframe:</span>
                  {[
                    { id: 'all', label: 'All Time' },
                    { id: 'today', label: 'Today' },
                    { id: 'this_week', label: 'This Week' },
                    { id: 'this_month', label: 'This Month' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setFilterPreset(p.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        filterPreset === p.id
                          ? 'bg-amber-400 text-slate-950 font-bold'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Multi-Criteria Filters Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
                {/* Subject Filter */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Subject</label>
                  <select
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="all">All Subjects</option>
                    {(studentData?.subjectWise || []).map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Late">Late</option>
                    <option value="Excused">Excused</option>
                  </select>
                </div>

                {/* Specific Date */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Exact Date</label>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                </div>

                {/* Date Range Start */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">From Date</label>
                  <input
                    type="date"
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                </div>

                {/* Date Range End */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">To Date</label>
                  <input
                    type="date"
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                </div>

                {/* Search Text */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Search Keywords</label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Faculty, subject, code..."
                      value={filterSearch}
                      onChange={(e) => setFilterSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && loadStudentHistory()}
                      className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Filter Action Status */}
              <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
                <span>
                  Showing <strong className="text-slate-900">{studentData?.totalFiltered || 0}</strong> records
                </span>
                <button
                  onClick={handleResetStudentFilters}
                  className="text-blue-800 hover:underline font-semibold cursor-pointer text-xs"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          </Card>

          {/* ========================================================================= */}
          {/* 3A. SUBJECT-WISE ATTENDANCE CARDS VIEW */}
          {/* ========================================================================= */}
          {(historyView === 'subject_wise' || historyView === 'all') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-blue-900" />
                    Subject-Wise Attendance Breakdown
                  </h3>
                  <p className="text-xs text-slate-500">
                    Calculated dynamically from real classroom attendance and lab sessions.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(studentData?.subjectWise || []).map((subj) => (
                  <Card key={subj.code} className="hover:shadow-md transition-shadow">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono text-xs font-bold text-blue-900 px-2 py-0.5 rounded bg-blue-50 border border-blue-100">
                            {subj.code}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 mt-1">{subj.name}</h4>
                          <p className="text-xs text-slate-500">{subj.faculty}</p>
                        </div>
                        <Badge
                          variant={subj.percentage >= 85 ? 'success' : (subj.percentage >= 75 ? 'info' : 'danger')}
                          size="sm"
                          className="font-bold shrink-0"
                        >
                          {subj.statusBadge}
                        </Badge>
                      </div>

                      {/* Percentage Bar */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold text-slate-600">Attendance</span>
                          <strong className={subj.isLowAttendance ? 'text-rose-600 font-black' : 'text-slate-900'}>
                            {subj.percentage}%
                          </strong>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              subj.percentage >= 85
                                ? 'bg-emerald-600'
                                : subj.percentage >= 75
                                ? 'bg-blue-600'
                                : 'bg-rose-600'
                            }`}
                            style={{ width: `${Math.min(100, subj.percentage)}%` }}
                          />
                        </div>
                      </div>

                      {/* Class Stats Count */}
                      <div className="grid grid-cols-4 gap-1 pt-2 border-t border-slate-100 text-center text-xs">
                        <div className="p-1.5 rounded bg-slate-50">
                          <span className="block text-[10px] text-slate-500 font-semibold">Total</span>
                          <strong className="text-slate-800">{subj.totalClasses}</strong>
                        </div>
                        <div className="p-1.5 rounded bg-emerald-50">
                          <span className="block text-[10px] text-emerald-700 font-semibold">Present</span>
                          <strong className="text-emerald-800">{subj.present}</strong>
                        </div>
                        <div className="p-1.5 rounded bg-rose-50">
                          <span className="block text-[10px] text-rose-700 font-semibold">Absent</span>
                          <strong className="text-rose-800">{subj.absent}</strong>
                        </div>
                        <div className="p-1.5 rounded bg-amber-50">
                          <span className="block text-[10px] text-amber-700 font-semibold">Late</span>
                          <strong className="text-amber-800">{subj.late}</strong>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3B. MONTHLY VIEW & ATTENDANCE TREND CHART */}
          {/* ========================================================================= */}
          {(historyView === 'monthly' || historyView === 'all') && (
            <Card>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-blue-900" />
                      Monthly Attendance & Daily Turnout Trend
                    </h3>
                    <p className="text-xs text-slate-500">
                      Track consistency across working days and identify absenteeism patterns.
                    </p>
                  </div>

                  {/* Month & Year Selectors */}
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                      className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                    >
                      {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, idx) => (
                        <option key={m} value={idx + 1}>{m}</option>
                      ))}
                    </select>

                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="2026">2026</option>
                      <option value="2025">2025</option>
                    </select>
                  </div>
                </div>

                {/* Monthly Summary Statistics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-center text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block font-semibold">Working Days</span>
                    <strong className="text-sm text-slate-900">{studentData?.monthlyView?.workingDays || 0}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block font-semibold">Classes Conducted</span>
                    <strong className="text-sm text-slate-900">{studentData?.monthlyView?.classesConducted || 0}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="text-[10px] text-emerald-700 block font-semibold">Present</span>
                    <strong className="text-sm text-emerald-900">{studentData?.monthlyView?.present || 0}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                    <span className="text-[10px] text-rose-700 block font-semibold">Absent</span>
                    <strong className="text-sm text-rose-900">{studentData?.monthlyView?.absent || 0}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                    <span className="text-[10px] text-amber-700 block font-semibold">Late</span>
                    <strong className="text-sm text-amber-900">{studentData?.monthlyView?.late || 0}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                    <span className="text-[10px] text-blue-700 block font-semibold">Excused</span>
                    <strong className="text-sm text-blue-900">{studentData?.monthlyView?.excused || 0}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 text-white border border-slate-800">
                    <span className="text-[10px] text-slate-300 block font-semibold">Month Rate</span>
                    <strong className="text-sm text-amber-400 font-mono">
                      {studentData?.monthlyView?.percentage || 0}%
                    </strong>
                  </div>
                </div>

                {/* Trend Chart Visualizer */}
                <div className="pt-2">
                  <span className="text-xs font-semibold text-slate-700 mb-2 block">
                    Daily Attendance Percentage Bar Trend ({selectedMonth}/2026):
                  </span>
                  <div className="flex items-end gap-1.5 h-36 border-b border-l border-slate-200 p-2 overflow-x-auto">
                    {(studentData?.monthlyView?.trendChart || []).map((pt) => (
                      <div
                        key={pt.date}
                        className="flex flex-col items-center justify-end h-full min-w-[28px] group relative cursor-pointer"
                        onClick={() => setCalendarPopupDate(studentData?.calendarMap?.[pt.date])}
                      >
                        {/* Tooltip */}
                        <div className="absolute -top-12 hidden group-hover:flex flex-col items-center z-20 bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap pointer-events-none">
                          <span>{pt.date} ({pt.day})</span>
                          <strong>{pt.rate}% ({pt.attendedClasses}/{pt.totalClasses} attended)</strong>
                        </div>

                        {/* Bar */}
                        <div
                          className={`w-4 rounded-t transition-all ${
                            pt.rate >= 85 ? 'bg-emerald-600 group-hover:bg-emerald-500' :
                            pt.rate >= 75 ? 'bg-blue-600 group-hover:bg-blue-500' :
                            'bg-rose-600 group-hover:bg-rose-500'
                          }`}
                          style={{ height: `${Math.max(10, pt.rate)}%` }}
                        />
                        <span className="text-[9px] text-slate-500 font-mono mt-1">
                          {pt.date.split('-')[2]}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    * Hover over or click bars to inspect that day's specific class attendances.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* ========================================================================= */}
          {/* 3C. INTERACTIVE ATTENDANCE CALENDAR VIEW */}
          {/* ========================================================================= */}
          {(historyView === 'calendar' || historyView === 'all') && (
            <Card>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-900" />
                      Academic Attendance Calendar
                    </h3>
                    <p className="text-xs text-slate-500">
                      Visual status on every calendar day. Click any date to view class details.
                    </p>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Present
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Absent
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Late
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Excused
                    </span>
                  </div>
                </div>

                {/* Calendar Days Grid */}
                <div className="grid grid-cols-7 gap-2 text-center text-xs">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="font-bold text-slate-400 py-1 uppercase text-[10px]">
                      {d}
                    </div>
                  ))}

                  {/* Render 31 days for current month */}
                  {Array.from({ length: 30 }, (_, i) => {
                    const dayNum = i + 1;
                    const dateKey = `2026-${String(selectedMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                    const dayData = studentData?.calendarMap?.[dateKey];
                    const hasClasses = Boolean(dayData);

                    let statusBg = 'bg-slate-50 text-slate-400';
                    let dotColor = 'bg-slate-300';
                    if (hasClasses) {
                      if (dayData.status === 'Present') {
                        statusBg = 'bg-emerald-50 text-emerald-950 border-emerald-200 hover:bg-emerald-100';
                        dotColor = 'bg-emerald-600';
                      } else if (dayData.status === 'Absent') {
                        statusBg = 'bg-rose-50 text-rose-950 border-rose-200 hover:bg-rose-100';
                        dotColor = 'bg-rose-600';
                      } else if (dayData.status === 'Late') {
                        statusBg = 'bg-amber-50 text-amber-950 border-amber-200 hover:bg-amber-100';
                        dotColor = 'bg-amber-600';
                      } else {
                        statusBg = 'bg-blue-50 text-blue-950 border-blue-200 hover:bg-blue-100';
                        dotColor = 'bg-blue-600';
                      }
                    }

                    return (
                      <div
                        key={dateKey}
                        onClick={() => hasClasses && setCalendarPopupDate(dayData)}
                        className={`p-2.5 rounded-xl border transition-all flex flex-col items-center justify-between min-h-[64px] ${
                          hasClasses ? `${statusBg} cursor-pointer shadow-2xs` : 'bg-slate-50/50 border-slate-100 text-slate-300 pointer-events-none'
                        }`}
                      >
                        <span className="font-bold text-xs">{dayNum}</span>
                        {hasClasses && (
                          <div className="flex flex-col items-center gap-1 mt-1">
                            <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                            <span className="text-[10px] font-bold">
                              {dayData.present}/{dayData.total}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          )}

          {/* ========================================================================= */}
          {/* 3D. COMPLETE ATTENDANCE HISTORY TABLE */}
          {/* ========================================================================= */}
          <Card padding="none">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-900" />
                  Complete Attendance History Records
                </h3>
                <p className="text-xs text-slate-500">
                  Comprehensive audit history showing period, lecture timings, verification method, and status.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={Printer}
                  onClick={() => {
                    setActiveTab('reports');
                    handleGenerateReport();
                  }}
                >
                  Print Ledger
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs erp-table">
                <thead>
                  <tr>
                    <th>Date & Day</th>
                    <th>Subject & Code</th>
                    <th>Faculty</th>
                    <th>Class / Period</th>
                    <th>Timings</th>
                    <th>Status</th>
                    <th>Method</th>
                    <th>Remarks</th>
                    {isStaff && <th className="text-right">Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {studentHistoryLoading ? (
                    <tr>
                      <td colSpan={isStaff ? 9 : 8} className="text-center py-10 text-slate-400">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-900" />
                        Loading Attendance History...
                      </td>
                    </tr>
                  ) : (studentData?.records || []).length === 0 ? (
                    <tr>
                      <td colSpan={isStaff ? 9 : 8} className="text-center py-10 text-slate-400">
                        No attendance records match the selected filter criteria.
                      </td>
                    </tr>
                  ) : (
                    (studentData?.records || []).map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="whitespace-nowrap">
                          <strong className="text-slate-900 block font-mono">{r.attendance_date}</strong>
                          <span className="text-[11px] text-slate-500">{r.day}</span>
                        </td>
                        <td>
                          <span className="font-bold text-slate-900 block">{r.subject_name}</span>
                          <span className="font-mono text-[10px] text-blue-900 font-bold px-1.5 py-0.2 rounded bg-blue-50 border border-blue-100">
                            {r.subject_code}
                          </span>
                        </td>
                        <td className="text-slate-700 whitespace-nowrap">{r.faculty_name}</td>
                        <td className="text-slate-700 whitespace-nowrap font-medium">{r.class_period}</td>
                        <td className="text-slate-500 font-mono text-[11px] whitespace-nowrap">
                          {r.start_time} - {r.end_time}
                        </td>
                        <td className="whitespace-nowrap">{getStatusBadge(r.status)}</td>
                        <td className="whitespace-nowrap">{getMethodBadge(r.method)}</td>
                        <td className="text-slate-500 text-[11px] max-w-xs truncate" title={r.remarks}>
                          {r.remarks || '-'}
                        </td>
                        {isStaff && (
                          <td className="text-right whitespace-nowrap">
                            <button
                              onClick={() => {
                                setCorrectingRecord({ ...r, record_type: 'student' });
                                setCorrectionNewStatus(r.status);
                              }}
                              className="px-2.5 py-1 text-[11px] font-bold text-blue-900 hover:bg-blue-50 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                              title="Correct attendance record"
                            >
                              Correct
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer Stats */}
            <div className="p-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
              <span>
                Showing <strong>{studentData?.records?.length || 0}</strong> of {studentData?.summary?.totalClasses || 0} total enrolled classes
              </span>
              <span className="font-semibold text-slate-700">
                Official RVS Attendance Directorate &bull; JUT Kolhan Compliant
              </span>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TAB 2: FACULTY ATTENDANCE HISTORY (FOR FACULTY & ADMINS) */}
      {/* ========================================================================= */}
      {activeTab === 'faculty_history' && isStaff && (
        <div className="space-y-6">
          {/* Admin Faculty Selector */}
          {isAdmin && (
            <Card padding="sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-900" />
                  <span className="text-xs font-bold text-slate-800">Select Faculty Member:</span>
                </div>
                <div className="flex items-center gap-3 flex-1 max-w-md">
                  <select
                    value={selectedFacultyId}
                    onChange={(e) => setSelectedFacultyId(Number(e.target.value))}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-blue-600"
                  >
                    {(facultyData?.facultyList || []).map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} &bull; {f.department}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>
          )}

          {/* Faculty Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard
              title="Attendance Rate"
              value={`${facultyData?.summary?.attendancePct || '0.0'}%`}
              subtitle="Full working turnout"
              icon={TrendingUp}
              color="emerald"
            />

            <StatCard
              title="Working Days"
              value={facultyData?.summary?.totalWorkingDays || 0}
              subtitle="Academic calendar"
              icon={Calendar}
              color="navy"
            />

            <StatCard
              title="Days Present"
              value={facultyData?.summary?.presentDays || 0}
              subtitle="Full day attendance"
              icon={UserCheck}
              color="emerald"
            />

            <StatCard
              title="Half Days"
              value={facultyData?.summary?.halfDays || 0}
              subtitle="Saturdays / Half academic"
              icon={Clock}
              color="indigo"
            />

            <StatCard
              title="Leaves Taken"
              value={facultyData?.summary?.leaveDays || 0}
              subtitle="Casual & Duty OD"
              icon={AlertCircle}
              color="blue"
            />

            <StatCard
              title="Total Hours"
              value={facultyData?.summary?.totalWorkingHours || '0h 0m'}
              subtitle="Biometric verified"
              icon={Clock3}
              color="amber"
            />
          </div>

          {/* Today's Check-in / Check-out Status & Quick Action */}
          <Card className="bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 border border-blue-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                  Today's Attendance Status ({new Date().toISOString().split('T')[0]})
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">
                  {facultyData?.todayRecord ? (
                    <>
                      Logged as <strong className="text-emerald-700">{facultyData.todayRecord.status}</strong> &bull; Check-in: {facultyData.todayRecord.check_in || 'Pending'} &bull; Check-out: {facultyData.todayRecord.check_out || 'Pending'}
                    </>
                  ) : (
                    'No check-in registered yet for today.'
                  )}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Biometric RFID gate scanners and campus Wi-Fi check-in logs.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  icon={LogIn}
                  onClick={() => handleFacultyCheckinAction('check_in')}
                >
                  Mark Check-In
                </Button>
                <Button
                  variant="gold"
                  size="sm"
                  icon={LogOut}
                  onClick={() => handleFacultyCheckinAction('check_out')}
                >
                  Mark Check-Out
                </Button>
              </div>
            </div>
          </Card>

          {/* Faculty History Table */}
          <Card padding="none">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-900" />
                  Faculty Biometric Attendance & Working Hours Log
                </h3>
                <p className="text-xs text-slate-500">
                  Daily recorded check-in, check-out, working hours, and sanctioned leave remarks.
                </p>
              </div>

              {/* Filter controls */}
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={facultyFilterStatus}
                  onChange={(e) => setFacultyFilterStatus(e.target.value)}
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Half Day">Half Day</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Absent">Absent</option>
                </select>

                <select
                  value={facultyMonth}
                  onChange={(e) => setFacultyMonth(Number(e.target.value))}
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                >
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, idx) => (
                    <option key={m} value={idx + 1}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs erp-table">
                <thead>
                  <tr>
                    <th>Date & Day</th>
                    <th>Faculty Name</th>
                    <th>Department</th>
                    <th>Check-in Time</th>
                    <th>Check-out Time</th>
                    <th>Working Hours</th>
                    <th>Status</th>
                    <th>Leave Details</th>
                    <th>Remarks</th>
                    {isAdmin && <th className="text-right">Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {facultyHistoryLoading ? (
                    <tr>
                      <td colSpan={isAdmin ? 10 : 9} className="text-center py-10 text-slate-400">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-900" />
                        Loading Faculty Attendance...
                      </td>
                    </tr>
                  ) : (facultyData?.records || []).length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 10 : 9} className="text-center py-10 text-slate-400">
                        No faculty records found for this period.
                      </td>
                    </tr>
                  ) : (
                    (facultyData?.records || []).map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="whitespace-nowrap">
                          <strong className="text-slate-900 block font-mono">{r.attendance_date}</strong>
                          <span className="text-[11px] text-slate-500">{r.day}</span>
                        </td>
                        <td className="font-bold text-slate-900 whitespace-nowrap">{r.faculty_name}</td>
                        <td className="text-slate-600 whitespace-nowrap">{r.department_code}</td>
                        <td className="font-mono text-emerald-800 font-bold whitespace-nowrap">{r.check_in || '—'}</td>
                        <td className="font-mono text-blue-900 font-bold whitespace-nowrap">{r.check_out || '—'}</td>
                        <td className="font-mono font-bold text-slate-800 whitespace-nowrap">{r.working_hours}</td>
                        <td className="whitespace-nowrap">{getStatusBadge(r.status)}</td>
                        <td className="text-slate-600 whitespace-nowrap">{r.leave_type || '—'}</td>
                        <td className="text-slate-500 text-[11px] max-w-xs truncate" title={r.remarks}>{r.remarks || '—'}</td>
                        {isAdmin && (
                          <td className="text-right whitespace-nowrap">
                            <button
                              onClick={() => {
                                setCorrectingRecord({ ...r, record_type: 'faculty' });
                                setCorrectionNewStatus(r.status);
                              }}
                              className="px-2.5 py-1 text-[11px] font-bold text-blue-900 hover:bg-blue-50 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                            >
                              Correct
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB 3: LIVE QR & MANUAL ROLL CALL (PRESERVED & ENHANCED) */}
      {/* ========================================================================= */}
      {activeTab === 'qr_hub' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-blue-900" />
                Live Classroom QR & Manual Roll Call Hub
              </h3>
              <p className="text-xs text-slate-500">
                Encrypted single-device dynamic QR check-in with 180s expiry or direct classroom roll call.
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="bg-slate-100 p-1 rounded-xl flex border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setQrMode('qr')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  qrMode === 'qr' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Dynamic QR Mode
              </button>
              {isStaff && (
                <button
                  onClick={() => setQrMode('manual')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    qrMode === 'manual' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Manual Roll Call
                </button>
              )}
            </div>
          </div>

          {qrMode === 'qr' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Dynamic QR Display Card */}
              <Card className="flex flex-col items-center justify-center text-center relative p-8">
                <div className="w-full flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                  <div className="text-left">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-blue-900" />
                      Live Classroom QR Code
                    </h3>
                    <p className="text-xs text-slate-500">
                      {activeSession ? 'Session actively broadcasting' : 'Ready to launch new session'}
                    </p>
                  </div>

                  {activeSession && (
                    <Badge variant="gold" size="sm" className="font-mono text-xs">
                      {countdown}s Expiry
                    </Badge>
                  )}
                </div>

                {activeSession ? (
                  <div className="p-6 rounded-2xl bg-white border-2 border-blue-900 shadow-xl flex flex-col items-center my-2 max-w-xs w-full">
                    <div className="relative p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="w-48 h-48 bg-white p-2 flex items-center justify-center relative">
                        <QrCode className="w-full h-full text-slate-900" />
                        <div className="absolute inset-0 m-auto w-10 h-10 rounded-lg bg-white p-0.5 shadow-md flex items-center justify-center">
                          <RVSLogo size="xs" showText={false} />
                        </div>
                      </div>
                    </div>

                    <p className="font-mono text-xs font-bold text-blue-950 mt-3 tracking-widest uppercase">
                      {qrToken || activeSession.qr_token}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Single-scan device cryptographic hash
                    </p>
                  </div>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center max-w-sm">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-900 flex items-center justify-center mb-4 border border-blue-100">
                      <QrCode className="w-8 h-8" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">No Active QR Session</h4>
                    <p className="text-xs text-slate-500 mt-1 mb-4">
                      Faculty can generate a dynamic 3-minute QR token for today's lecture.
                    </p>
                    {isStaff && (
                      <Button variant="primary" size="sm" onClick={handleGenerateQR} loading={generating}>
                        Launch Live QR Session
                      </Button>
                    )}
                  </div>
                )}
              </Card>

              {/* Right: Student Device Check-in Portal */}
              <Card>
                <CardHeader
                  title="Student QR Attendance Scanner"
                  subtitle="Scan with camera or paste the active token to mark present"
                />

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-900">
                    <div className="flex items-center gap-2 font-bold mb-1">
                      <ShieldCheck className="w-4 h-4 text-blue-700" />
                      <span>RVS Geofence Protected</span>
                    </div>
                    <p className="text-[11px] text-blue-800">
                      IP & Geolocation verification: Edalbera Campus, NH-33 Jamshedpur Wi-Fi subnet.
                    </p>
                  </div>

                  <div>
                    <Input
                      label="QR Token Key"
                      placeholder="e.g. RVS-ATT-CSE-XXXXXX"
                      value={scanInput}
                      onChange={(e) => setScanInput(e.target.value)}
                      icon={QrCode}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="md"
                      loading={scanning}
                      onClick={() => handleScanAttendance()}
                      className="flex-1"
                    >
                      Verify & Check In
                    </Button>

                    {activeSession && (
                      <Button
                        variant="outline"
                        size="md"
                        onClick={() => handleScanAttendance(qrToken)}
                        title="Simulate Mobile Camera Scanner"
                      >
                        Quick Check-in
                      </Button>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1.5">
                    <h5 className="font-bold text-slate-800">Anti-Proxy Guarantees:</h5>
                    <ul className="list-disc pl-4 space-y-1 text-[11px]">
                      <li>Tokens refresh every 180 seconds to prevent forwarding via social apps.</li>
                      <li>One check-in per verified student university registration number.</li>
                      <li>Automatically writes permanent record with status <strong className="text-emerald-700">Present</strong> and method <strong className="text-blue-800">QR</strong>.</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Manual Roll Call Roster */}
          {qrMode === 'manual' && isStaff && (
            <div className="space-y-4">
              <Card padding="sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Select
                    label="Class / Section"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    options={[
                      { value: 'CSE-6A', label: 'B.Tech CSE - 6th Sem (Sec A)' },
                      { value: 'CSE-6B', label: 'B.Tech CSE - 6th Sem (Sec B)' },
                      { value: 'ME-6A', label: 'B.Tech ME - 6th Sem' },
                      { value: 'CE-6A', label: 'B.Tech CE - 6th Sem' }
                    ]}
                  />

                  <Select
                    label="Subject"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    options={[
                      { value: 'CS-601', label: 'Compiler Design (CS-601)' },
                      { value: 'CS-602', label: 'Computer Networks (CS-602)' },
                      { value: 'CS-603', label: 'Cloud Computing (CS-603)' },
                      { value: 'CS-604L', label: 'Networks & Linux Lab (CS-604L)' }
                    ]}
                  />

                  <Input
                    label="Attendance Date"
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                  />

                  <Input
                    label="Filter Roster"
                    placeholder="Search student..."
                    value={manualSearch}
                    onChange={(e) => setManualSearch(e.target.value)}
                    icon={Search}
                  />
                </div>
              </Card>

              {/* Roster Table */}
              <Card padding="none">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs erp-table">
                    <thead>
                      <tr>
                        <th>Roll Number</th>
                        <th>Student Name</th>
                        <th>Status</th>
                        <th className="text-right">Mark Attendance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {manualRoster
                        .filter(s => s.name.toLowerCase().includes(manualSearch.toLowerCase()) || s.roll.toLowerCase().includes(manualSearch.toLowerCase()))
                        .map((s) => (
                          <tr key={s.id}>
                            <td className="font-mono font-bold text-blue-900">{s.roll}</td>
                            <td className="font-bold text-slate-900">{s.name}</td>
                            <td>{getStatusBadge(s.status)}</td>
                            <td className="text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {['Present', 'Absent', 'Late', 'Excused'].map((st) => (
                                  <button
                                    key={st}
                                    onClick={() => setManualRoster(prev => prev.map(item => item.id === s.id ? { ...item, status: st } : item))}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                      s.status === st
                                        ? (st === 'Present' ? 'bg-emerald-600 text-white' :
                                           st === 'Absent' ? 'bg-rose-600 text-white' :
                                           st === 'Late' ? 'bg-amber-500 text-slate-950' : 'bg-blue-600 text-white')
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                  >
                                    {st}
                                  </button>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Turnout: <strong className="text-slate-900">{manualRoster.filter(s => s.status === 'Present').length}</strong> / {manualRoster.length} Students Present
                  </span>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveManualRoster}
                  >
                    Save Classroom Roster
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. TAB 4: ATTENDANCE AUDIT TRAIL & CORRECTIONS */}
      {/* ========================================================================= */}
      {activeTab === 'corrections' && isStaff && (
        <div className="space-y-6">
          <Card padding="sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-900" />
                  Official Attendance Audit Ledger
                </h3>
                <p className="text-xs text-slate-500">
                  Every attendance status alteration is permanently recorded with user identity, timestamp, and justification.
                </p>
              </div>

              {/* Filter */}
              <div className="flex items-center gap-2">
                <select
                  value={auditTypeFilter}
                  onChange={(e) => setAuditTypeFilter(e.target.value)}
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="all">All Audit Logs</option>
                  <option value="student">Student Corrections</option>
                  <option value="faculty">Faculty Corrections</option>
                </select>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    className="pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Audit Logs Table */}
          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs erp-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Type</th>
                    <th>Target Individual</th>
                    <th>Subject / Department</th>
                    <th>Attendance Date</th>
                    <th>Previous Status</th>
                    <th>New Status</th>
                    <th>Changed By</th>
                    <th>Justification / Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLoading ? (
                    <tr>
                      <td colSpan={9} className="text-center py-10 text-slate-400">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-900" />
                        Loading Audit Logs...
                      </td>
                    </tr>
                  ) : auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-10 text-slate-400">
                        No audit log entries recorded.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            log.record_type === 'student' ? 'bg-blue-50 text-blue-800' : 'bg-purple-50 text-purple-800'
                          }`}>
                            {log.record_type}
                          </span>
                        </td>
                        <td className="font-bold text-slate-900 whitespace-nowrap">{log.target_name}</td>
                        <td className="text-slate-600 whitespace-nowrap">{log.subject_or_dept}</td>
                        <td className="font-mono text-slate-700 whitespace-nowrap">{log.attendance_date}</td>
                        <td>
                          <span className="line-through text-slate-400 font-semibold">{log.previous_status}</span>
                        </td>
                        <td>
                          <strong className="text-emerald-700 font-bold">{log.new_status}</strong>
                        </td>
                        <td className="whitespace-nowrap">
                          <span className="font-semibold text-slate-800 block">{log.changed_by_name}</span>
                          <span className="text-[10px] text-slate-400 uppercase font-mono">{log.changed_by_role}</span>
                        </td>
                        <td className="text-slate-600 max-w-sm">
                          <p className="text-[11px] italic leading-relaxed">"{log.reason}"</p>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. TAB 5: ATTENDANCE REPORTS & EXPORTS */}
      {/* ========================================================================= */}
      {activeTab === 'reports' && isStaff && (
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Official RVS Attendance Report Generator"
              subtitle="Generate audit-ready formatted reports with college accreditation credentials for semester submission."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Report Scope</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="student_monthly">Student Monthly Report</option>
                  <option value="student_subject">Student Subject-wise Report</option>
                  <option value="student_semester">Student Semester Report</option>
                  <option value="student_daily">Student Daily Attendance Report</option>
                  <option value="student_department">Student Department-wise Report</option>
                  <option value="faculty_monthly">Faculty Monthly Attendance Report</option>
                  <option value="faculty_department">Faculty Department-wise Report</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Department</label>
                <select
                  value={reportDepartment}
                  onChange={(e) => setReportDepartment(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="all">All Departments</option>
                  <option value="CSE">Computer Science & Engineering</option>
                  <option value="AIML">Artificial Intelligence & ML</option>
                  <option value="CE">Civil Engineering</option>
                  <option value="ME">Mechanical Engineering</option>
                  <option value="ECE">Electronics & Communication</option>
                  <option value="EEE">Electrical & Electronics</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Month</label>
                <select
                  value={reportMonth}
                  onChange={(e) => setReportMonth(Number(e.target.value))}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, idx) => (
                    <option key={m} value={idx + 1}>{m} 2026</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="gold"
                  size="md"
                  icon={Printer}
                  loading={reportLoading}
                  onClick={handleGenerateReport}
                  className="w-full"
                >
                  Generate Official Report
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. ATTENDANCE CORRECTION MODAL */}
      {/* ========================================================================= */}
      {correctingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scale-up space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-900" />
                <h3 className="text-base font-bold text-slate-900">Attendance Status Correction</h3>
              </div>
              <button
                onClick={() => setCorrectingRecord(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Non-Destructive Audit Mandate:</span>
              </div>
              <p className="text-[11px] text-amber-800">
                Attendance records are never silently erased. Previous status, updated status, modifier identity, and mandatory reason will be permanently recorded in the official audit trail.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
                <div>
                  <span className="text-slate-500 block">Target:</span>
                  <strong className="text-slate-900 font-bold">{correctingRecord.student_name || correctingRecord.faculty_name}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Date & Day:</span>
                  <strong className="text-slate-900">{correctingRecord.attendance_date} ({correctingRecord.day})</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Subject / Dept:</span>
                  <strong className="text-slate-900">{correctingRecord.subject_code || correctingRecord.department_code}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Current Status:</span>
                  <span className="inline-block mt-0.5">{getStatusBadge(correctingRecord.status)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">New Corrected Status</label>
                <select
                  value={correctionNewStatus}
                  onChange={(e) => setCorrectionNewStatus(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Late">Late</option>
                  <option value="Excused">Excused</option>
                  {correctingRecord.record_type === 'faculty' && (
                    <>
                      <option value="Half Day">Half Day</option>
                      <option value="On Leave">On Leave</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Reason for Correction <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Student submitted official clinic prescription / Participated in university sports meet with prior HOD approval."
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCorrectingRecord(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={correctionSubmitting}
                onClick={handleCorrectionSubmit}
              >
                Save Correction & Audit Log
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. CALENDAR DATE DETAILS POPUP MODAL */}
      {/* ========================================================================= */}
      {calendarPopupDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scale-up space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-900" />
                  {calendarPopupDate.date} ({calendarPopupDate.day})
                </h3>
                <p className="text-xs text-slate-500">Day Attendance Breakdown</p>
              </div>
              <button
                onClick={() => setCalendarPopupDate(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {(calendarPopupDate.classes || []).map((cls, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <strong className="text-slate-900 font-bold block">{cls.subject}</strong>
                    <span className="text-[11px] text-slate-500 block">{cls.period} &bull; {cls.time}</span>
                    <span className="text-[10px] text-slate-400">{cls.faculty}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {getStatusBadge(cls.status)}
                    {getMethodBadge(cls.method)}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCalendarPopupDate(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. OFFICIAL RVS REPORT PREVIEW & PRINT MODAL */}
      {/* ========================================================================= */}
      {showReportModal && reportData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-8 shadow-2xl border border-slate-200 my-8 space-y-6">
            {/* Modal Controls (No Print) */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 no-print">
              <span className="text-xs font-bold text-slate-500">
                Official Document Preview & Export Console
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={Download}
                  onClick={downloadReportCSV}
                >
                  Export CSV / Excel
                </Button>
                <Button
                  variant="gold"
                  size="sm"
                  icon={Printer}
                  onClick={() => window.print()}
                >
                  Print Report
                </Button>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Report Canvas with Official RVS Branding */}
            <div className="space-y-6 printable-report">
              {/* Institution Letterhead */}
              <div className="border-b-2 border-slate-900 pb-4 text-center relative">
                <div className="flex items-center justify-center gap-4 mb-2">
                  <RVSLogo size="md" showText={false} />
                  <div className="text-left">
                    <h1 className="text-lg sm:text-xl font-black text-slate-950 uppercase tracking-tight">
                      {RVS_CONFIG.name}
                    </h1>
                    <p className="text-xs font-bold text-slate-700">
                      Jamshedpur Campus &bull; Jharkhand - 831012
                    </p>
                    <p className="text-[11px] text-slate-600">
                      {RVS_CONFIG.affiliation} &bull; {RVS_CONFIG.accreditation}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600">
                  <span><strong>Document:</strong> Official Attendance Directorate Report ({reportData.metadata?.reportType})</span>
                  <span><strong>Generated:</strong> {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>

              {/* Report Summary KPIs */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs">
                {Object.entries(reportData.summary || {}).map(([key, val]) => (
                  <div key={key} className="p-1">
                    <span className="block text-[10px] text-slate-500 uppercase font-semibold">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <strong className="text-xs text-slate-900 font-mono">
                      {typeof val === 'number' && key.toLowerCase().includes('percentage') ? `${val}%` : val}
                    </strong>
                  </div>
                ))}
              </div>

              {/* Report Records Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs erp-table border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100">
                      <th>Date</th>
                      <th>Day</th>
                      <th>Individual Name</th>
                      <th>Roll / Dept</th>
                      <th>Subject / Period</th>
                      <th>Status</th>
                      <th>Method</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(reportData.rows || []).slice(0, 50).map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-200">
                        <td className="font-mono">{row.date}</td>
                        <td>{row.day}</td>
                        <td className="font-bold">{row.studentName || row.facultyName}</td>
                        <td>{row.rollNo || row.department}</td>
                        <td>{row.subject || row.workingHours}</td>
                        <td>{getStatusBadge(row.status)}</td>
                        <td>{row.method ? getMethodBadge(row.method) : '-'}</td>
                        <td className="text-[11px] text-slate-600">{row.remarks || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Signature Blocks */}
              <div className="pt-12 grid grid-cols-3 gap-8 text-center text-xs text-slate-700">
                <div className="border-t border-slate-400 pt-2">
                  <p className="font-bold">Prepared By / Faculty In-Charge</p>
                  <p className="text-[10px] text-slate-500">Department Attendance Coordinator</p>
                </div>
                <div className="border-t border-slate-400 pt-2">
                  <p className="font-bold">Head of Department (HOD)</p>
                  <p className="text-[10px] text-slate-500">Verified with Department Registry</p>
                </div>
                <div className="border-t border-slate-400 pt-2">
                  <p className="font-bold">Principal / Dean Academics</p>
                  <p className="text-[10px] text-slate-500">RVS College of Engg & Tech</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
