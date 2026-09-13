import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import RVS_CONFIG from '../../config/rvsConfig';
import RVSLogo from '../../components/RVSLogo';
import Student360ProfileModal from './Student360ProfileModal';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  X,
  GraduationCap,
  Upload,
  Download,
  ArrowUpRight,
  Archive,
  RotateCcw,
  Edit3,
  AlertTriangle,
  FileSpreadsheet,
  Check,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Lock,
  Printer,
  Sparkles,
  Info,
  Layers,
  Award,
  Receipt
} from 'lucide-react';

export default function StudentManagement() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'super_admin' || user?.role === 'college_admin';

  // Sub-Navigation Tabs: 'all', 'add', 'import', 'promote', 'archived'
  const [activeSubTab, setActiveSubTab] = useState('all');

  // Student List State
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedSem, setSelectedSem] = useState('all');
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // 360 Profile & Edit Modals
  const [profile360, setProfile360] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState('overview'); // overview, attendance, fees, exams, history
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Attendance History Modal State
  const [attendanceModalStudent, setAttendanceModalStudent] = useState(null);
  const [studentAttData, setStudentAttData] = useState(null);
  const [studentAttLoading, setStudentAttLoading] = useState(false);
  const [attFilterSubject, setAttFilterSubject] = useState('all');
  const [attFilterStatus, setAttFilterStatus] = useState('all');

  const openAttendanceHistory = async (stu) => {
    setAttendanceModalStudent(stu);
    setStudentAttLoading(true);
    setAttFilterSubject('all');
    setAttFilterStatus('all');
    try {
      const res = await api.get(`/rvs/attendance/student/history?student_id=${stu.id}`);
      if (res.data?.success) {
        setStudentAttData(res.data);
      }
    } catch (err) {
      console.error('Failed to load student attendance:', err);
    } finally {
      setStudentAttLoading(false);
    }
  };

  // Single Add Student Form State
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    phone: '',
    roll_no: '',
    reg_no: '',
    admission_no: '',
    department_code: 'CSE',
    course: 'B.Tech Computer Science & Engineering',
    semester: '1st Semester',
    batch: '2024-2028',
    session: '2025-2026',
    admission_year: 2024,
    dob: '2005-07-15',
    gender: 'Male',
    address: 'Jamshedpur, Jharkhand, India',
    guardian_name: '',
    mother_name: '',
    guardian_phone: '',
    guardian_email: '',
    guardian_address: '',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'
  });
  const [sameAddress, setSameAddress] = useState(true);

  // Bulk Import State
  const fileInputRef = useRef(null);
  const [importRecords, setImportRecords] = useState([]);
  const [validationReport, setValidationReport] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importSuccessMessage, setImportSuccessMessage] = useState(null);

  // Promotion State
  const [promoDept, setPromoDept] = useState('CSE');
  const [promoCurrentSem, setPromoCurrentSem] = useState('6th Semester');
  const [promoTargetSem, setPromoTargetSem] = useState('7th Semester');
  const [promoSession, setPromoSession] = useState('2026-2027');
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [promoting, setPromoting] = useState(false);
  const [showPromoConfirm, setShowPromoConfirm] = useState(false);

  // Global Notification
  const [notification, setNotification] = useState('');

  // Fetch Students
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        status: activeSubTab === 'archived' ? 'archived' : 'all'
      };
      if (search) params.search = search;
      if (selectedDept !== 'all') params.department = selectedDept;
      if (selectedCourse !== 'all') params.course = selectedCourse;
      if (selectedSem !== 'all') params.semester = selectedSem;
      if (selectedBatch !== 'all') params.batch = selectedBatch;

      const res = await api.get('/rvs/students', { params });
      if (res.data?.success) {
        setStudents(res.data.students);
        setPagination(prev => ({
          ...prev,
          total: res.data.total,
          totalPages: res.data.totalPages || 1
        }));
      }
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search, selectedDept, selectedCourse, selectedSem, selectedBatch, pagination.page, pagination.limit, activeSubTab]);

  // Load 360 Degree Profile
  const open360Profile = async (studentId) => {
    try {
      setLoadingProfile(true);
      const res = await api.get(`/rvs/students/${studentId}/profile-360`);
      if (res.data?.success) {
        setProfile360(res.data);
        setActiveProfileTab('overview');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to fetch 360 profile');
    } finally {
      setLoadingProfile(false);
    }
  };

  // Submit Single Student
  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...addForm };
      if (sameAddress) payload.guardian_address = payload.address;

      const res = await api.post('/rvs/students', payload);
      if (res.data?.success) {
        setNotification(`Student ${payload.name} (${payload.roll_no}) successfully registered!`);
        setActiveSubTab('all');
        fetchStudents();
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add student');
    }
  };

  // Open Edit Modal
  const openEditModal = (student) => {
    setEditingStudent(student);
    setEditForm({ ...student });
  };

  // Save Edit Student
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/rvs/students/${editingStudent.id}`, editForm);
      if (res.data?.success) {
        setNotification(`Student ${editForm.name} updated successfully.`);
        setEditingStudent(null);
        fetchStudents();
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update student');
    }
  };

  // Toggle Status (Archive / Restore)
  const handleStatusChange = async (studentId, newStatus) => {
    try {
      const res = await api.patch(`/rvs/students/${studentId}/status`, { status: newStatus });
      if (res.data?.success) {
        setNotification(`Student status updated to ${newStatus}.`);
        fetchStudents();
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  // Download CSV Template
  const downloadTemplate = () => {
    window.open('/api/rvs/students/template', '_blank');
  };

  // CSV Parsing & Upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target.result;
      parseCSVContent(text);
    };
    reader.readAsText(file);
  };

  const parseCSVContent = async (text) => {
    const lines = text.split(/\r\n|\n/).filter(l => l.trim().length > 0);
    if (lines.length < 2) {
      alert('CSV file is empty or does not contain header + data rows.');
      return;
    }

    const header = lines[0].split(',').map(h => h.replace(/["']/g, '').trim().toLowerCase());
    const records = [];

    for (let i = 1; i < lines.length; i++) {
      // Basic CSV field parser handling quotes
      const rowRegex = /(".*?"|[^",]+)(?=\s*,|\s*$)/g;
      let matches = [];
      let match;
      const currentLine = lines[i];
      
      // Simple split fallback if no quotes
      const rawCells = currentLine.split(',').map(c => c.replace(/["']/g, '').trim());
      
      const record = {};
      header.forEach((key, colIdx) => {
        record[key] = rawCells[colIdx] || '';
      });
      if (record.full_name || record.name || record.roll_no) {
        records.push(record);
      }
    }

    setImportRecords(records);
    validateImportBatch(records);
  };

  // Pre-validate parsed CSV rows
  const validateImportBatch = async (records) => {
    try {
      setImporting(true);
      const res = await api.post('/rvs/students/bulk-import', {
        records,
        confirmImport: false // Preview mode only
      });
      if (res.data?.success) {
        setValidationReport(res.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Validation request failed.');
    } finally {
      setImporting(false);
    }
  };

  // Confirm Import
  const handleConfirmImport = async () => {
    if (!importRecords || importRecords.length === 0) return;
    try {
      setImporting(true);
      const res = await api.post('/rvs/students/bulk-import', {
        records: importRecords,
        confirmImport: true
      });
      if (res.data?.success) {
        setImportSuccessMessage(res.data.message);
        setValidationReport(null);
        setImportRecords([]);
        fetchStudents();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Import failed.');
    } finally {
      setImporting(false);
    }
  };

  // Promotion Handlers
  const eligiblePromotionStudents = students.filter(s => 
    s.status === 'active' && 
    (promoDept === 'all' || s.department_code === promoDept) &&
    s.semester === promoCurrentSem
  );

  const toggleSelectAllPromo = () => {
    if (selectedStudentIds.length === eligiblePromotionStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(eligiblePromotionStudents.map(s => s.id));
    }
  };

  const handleExecutePromotion = async () => {
    if (selectedStudentIds.length === 0) {
      alert('Please select students to promote.');
      return;
    }
    try {
      setPromoting(true);
      const res = await api.post('/rvs/students/promote', {
        studentIds: selectedStudentIds,
        targetSemester: promoTargetSem,
        newSession: promoSession,
        remarks: 'Annual / Even-Odd Semester Progression'
      });
      if (res.data?.success) {
        setNotification(res.data.message);
        setShowPromoConfirm(false);
        setSelectedStudentIds([]);
        fetchStudents();
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to promote students');
    } finally {
      setPromoting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header with College Identity */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
              RVS Student Academic Directorate
            </span>
            <span className="text-xs text-slate-500">
              Approved by AICTE &bull; Affiliated to JUT Ranchi
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Student Management & Registry</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Admissions, bulk CSV enrollment, student 360° academic profile, semester promotions, and archival.
          </p>
        </div>

        {/* Action Tabs Navigation */}
        <div className="flex items-center gap-1.5 flex-wrap bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveSubTab('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'all'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            All Students
          </button>

          {isAdmin && (
            <>
              <button
                onClick={() => setActiveSubTab('add')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeSubTab === 'add'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                Add Student
              </button>

              <button
                onClick={() => setActiveSubTab('import')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeSubTab === 'import'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Bulk Import
              </button>

              <button
                onClick={() => setActiveSubTab('promote')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeSubTab === 'promote'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                Promote Students
              </button>

              <button
                onClick={() => setActiveSubTab('archived')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeSubTab === 'archived'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Archive className="w-3.5 h-3.5" />
                Archived ({students.filter(s => s.status === 'archived' || s.status === 'inactive').length})
              </button>
            </>
          )}
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification('')} className="text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================== */}
      {/* 1. ALL STUDENTS TAB */}
      {/* ========================================================== */}
      {activeSubTab === 'all' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="erp-card p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 bg-white shadow-2xs">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search Name, Roll, Reg, Admission No..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              >
                <option value="all">All Departments</option>
                {RVS_CONFIG.departments.map(d => (
                  <option key={d.code} value={d.code}>{d.name} ({d.code})</option>
                ))}
              </select>

              <select
                value={selectedSem}
                onChange={(e) => setSelectedSem(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              >
                <option value="all">All Semesters</option>
                {['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester'].map(sem => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>

              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              >
                <option value="all">All Batches</option>
                {['2021-2025', '2022-2026', '2023-2027', '2024-2028', '2025-2029'].map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Students Table */}
          <div className="erp-card rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs erp-table">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Roll / Registration</th>
                    <th className="py-3.5 px-4">Branch & Semester</th>
                    <th className="py-3.5 px-4">Batch</th>
                    <th className="py-3.5 px-4">Guardian Contact</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-400">
                        <div className="w-6 h-6 border-2 border-blue-900/20 border-t-blue-900 rounded-full animate-spin mx-auto mb-2"></div>
                        Loading student records...
                      </td>
                    </tr>
                  ) : students.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-400">
                        No students found matching current filters.
                      </td>
                    </tr>
                  ) : (
                    students.map((stu) => (
                      <tr key={stu.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={stu.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'}
                              alt={stu.name}
                              className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                            />
                            <div>
                              <p className="font-bold text-slate-900 text-xs">{stu.name}</p>
                              <p className="text-[10px] text-slate-500 truncate max-w-[140px]">{stu.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-blue-900 block">{stu.roll_no}</span>
                          <span className="font-mono text-[10px] text-slate-500">{stu.reg_no}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-900 block">{stu.department_code}</span>
                          <span className="text-[10px] text-slate-500">{stu.semester}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-700">
                          {stu.batch}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-slate-900">{stu.guardian_name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{stu.guardian_phone}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            stu.status === 'active'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : stu.status === 'graduated'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}>
                            {stu.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => open360Profile(stu.id)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-900 transition-all cursor-pointer"
                              title="View 360° Profile"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openAttendanceHistory(stu)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-800 transition-all cursor-pointer"
                              title="View Student Attendance History"
                            >
                              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                            </button>
                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => openEditModal(stu)}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-800 transition-all cursor-pointer"
                                  title="Edit Student"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleStatusChange(stu.id, stu.status === 'active' ? 'archived' : 'active')}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-800 transition-all cursor-pointer"
                                  title={stu.status === 'active' ? 'Archive Student' : 'Restore Student'}
                                >
                                  {stu.status === 'active' ? <Archive className="w-3.5 h-3.5" /> : <RotateCcw className="w-3.5 h-3.5" />}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
              <span>
                Showing <strong>{students.length}</strong> of <strong>{pagination.total}</strong> Students
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  className="p-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-semibold text-slate-800">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  className="p-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 2. ADD STUDENT TAB */}
      {/* ========================================================== */}
      {activeSubTab === 'add' && (
        <form onSubmit={handleAddStudent} className="space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-amber-400" />
                  New Student Admission & Account Provisioning
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Creates an authorized student record and linked credential with role <strong>STUDENT</strong>.
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                RVS Smart Campus
              </span>
            </div>

            {/* Section 1: Personal Information */}
            <div>
              <h3 className="text-xs uppercase font-bold text-amber-400 tracking-wider mb-3">
                1. Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    placeholder="e.g. Vikramaditya Kumar"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Official Student Email *</label>
                  <input
                    type="email"
                    required
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    placeholder="name@rvscet.ac.in"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={addForm.dob}
                    onChange={(e) => setAddForm({ ...addForm, dob: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Gender</label>
                  <select
                    value={addForm.gender}
                    onChange={(e) => setAddForm({ ...addForm, gender: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Photo URL / Avatar</label>
                  <input
                    type="text"
                    value={addForm.avatar}
                    onChange={(e) => setAddForm({ ...addForm, avatar: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-medium text-slate-300 mb-1">Residential Address *</label>
                  <input
                    type="text"
                    required
                    value={addForm.address}
                    onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
                    placeholder="Street, Locality, City, State, PIN"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Academic Information */}
            <div className="pt-4 border-t border-slate-800">
              <h3 className="text-xs uppercase font-bold text-amber-400 tracking-wider mb-3">
                2. Academic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Roll Number (Unique) *</label>
                  <input
                    type="text"
                    required
                    value={addForm.roll_no}
                    onChange={(e) => setAddForm({ ...addForm, roll_no: e.target.value.toUpperCase() })}
                    placeholder="e.g. 24RVSCSE001"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono font-bold text-amber-400 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">JUT Registration Number *</label>
                  <input
                    type="text"
                    required
                    value={addForm.reg_no}
                    onChange={(e) => setAddForm({ ...addForm, reg_no: e.target.value.toUpperCase() })}
                    placeholder="e.g. JUT/2024/CSE/001"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Admission Number</label>
                  <input
                    type="text"
                    value={addForm.admission_no}
                    onChange={(e) => setAddForm({ ...addForm, admission_no: e.target.value.toUpperCase() })}
                    placeholder="e.g. RVS/ADM/2024/001"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Department / Branch *</label>
                  <select
                    value={addForm.department_code}
                    onChange={(e) => setAddForm({ ...addForm, department_code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {RVS_CONFIG.departments.map(d => (
                      <option key={d.code} value={d.code}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Program / Course *</label>
                  <select
                    value={addForm.course}
                    onChange={(e) => setAddForm({ ...addForm, course: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {RVS_CONFIG.programs.map(p => (
                      <option key={p.code} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Current Semester *</label>
                  <select
                    value={addForm.semester}
                    onChange={(e) => setAddForm({ ...addForm, semester: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester'].map(sem => (
                      <option key={sem} value={sem}>{sem}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Batch *</label>
                  <input
                    type="text"
                    required
                    value={addForm.batch}
                    onChange={(e) => setAddForm({ ...addForm, batch: e.target.value })}
                    placeholder="2024-2028"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Academic Session</label>
                  <input
                    type="text"
                    value={addForm.session}
                    onChange={(e) => setAddForm({ ...addForm, session: e.target.value })}
                    placeholder="2025-2026"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Guardian Information */}
            <div className="pt-4 border-t border-slate-800">
              <h3 className="text-xs uppercase font-bold text-amber-400 tracking-wider mb-3">
                3. Guardian Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Father / Guardian Name *</label>
                  <input
                    type="text"
                    required
                    value={addForm.guardian_name}
                    onChange={(e) => setAddForm({ ...addForm, guardian_name: e.target.value })}
                    placeholder="e.g. Ramesh Chandra Verma"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Mother Name</label>
                  <input
                    type="text"
                    value={addForm.mother_name}
                    onChange={(e) => setAddForm({ ...addForm, mother_name: e.target.value })}
                    placeholder="e.g. Shanti Devi"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Guardian Mobile *</label>
                  <input
                    type="tel"
                    required
                    value={addForm.guardian_phone}
                    onChange={(e) => setAddForm({ ...addForm, guardian_phone: e.target.value })}
                    placeholder="+91 94311 00000"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-3 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sameAddr"
                    checked={sameAddress}
                    onChange={(e) => setSameAddress(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-500"
                  />
                  <label htmlFor="sameAddr" className="text-xs text-slate-300">
                    Guardian address is identical to student residential address
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Bar */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveSubTab('all')}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Complete Enrollment & Provision Account
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================== */}
      {/* 3. BULK IMPORT TAB */}
      {/* ========================================================== */}
      {activeSubTab === 'import' && (
        <div className="space-y-6">
          {/* Template & Upload Hero */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-amber-400" />
                  Bulk Student Excel / CSV Import
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">
                  Upload an Excel or CSV file containing student personal, academic, and guardian records. The engine pre-validates every row, checks duplicate roll/registration numbers, and provisions user accounts safely.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={downloadTemplate}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  Download CSV Template
                </button>
              </div>
            </div>

            {/* Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-2xl p-8 text-center cursor-pointer bg-slate-950/40 transition-all group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Upload className="w-10 h-10 text-slate-500 group-hover:text-amber-400 mx-auto mb-2 transition-colors" />
              <p className="text-sm font-semibold text-white">Click to Browse or Drag & Drop Student CSV File</p>
              <p className="text-xs text-slate-400 mt-1">Supports standard CSV with UTF-8 encoding (Max 2MB per upload)</p>
            </div>
          </div>

          {importSuccessMessage && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{importSuccessMessage}</span>
              </div>
              <button onClick={() => setImportSuccessMessage(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Validation & Preview Panel */}
          {validationReport && (
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white">Batch Pre-Validation Report</h3>
                  <p className="text-xs text-slate-400">Review results before committing records into PostgreSQL store.</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs">
                    Total: <strong className="text-white">{validationReport.total}</strong>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
                    Valid: <strong>{validationReport.validCount}</strong>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
                    Errors: <strong>{validationReport.invalidCount}</strong>
                  </div>
                </div>
              </div>

              {/* Invalid Rows Warning Table */}
              {validationReport.invalidRows.length > 0 && (
                <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>The following rows contain validation errors and will be skipped:</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1.5 text-xs text-slate-300 pr-2">
                    {validationReport.invalidRows.map((err, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span>Row #{err.rowNumber}: <strong>{err.name}</strong> ({err.rollNo})</span>
                        <span className="text-rose-400 font-semibold">{err.errors.join(', ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Valid Records Preview */}
              {validationReport.validRowsPreview.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-400">Valid Records Preview (First 10):</span>
                  <div className="overflow-x-auto rounded-xl border border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3">Name</th>
                          <th className="py-2.5 px-3">Roll No</th>
                          <th className="py-2.5 px-3">Reg No</th>
                          <th className="py-2.5 px-3">Department</th>
                          <th className="py-2.5 px-3">Email</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-300">
                        {validationReport.validRowsPreview.map((row, idx) => (
                          <tr key={idx}>
                            <td className="py-2 px-3 font-semibold text-white">{row.name}</td>
                            <td className="py-2 px-3 font-mono text-amber-400">{row.roll_no}</td>
                            <td className="py-2 px-3 font-mono">{row.reg_no}</td>
                            <td className="py-2 px-3">{row.department_code}</td>
                            <td className="py-2 px-3 text-slate-400">{row.email}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Confirm Import Button */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setValidationReport(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                >
                  Discard
                </button>
                <button
                  type="button"
                  disabled={importing || validationReport.validCount === 0}
                  onClick={handleConfirmImport}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  {importing ? 'Importing Records...' : `Commit Import (${validationReport.validCount} Valid Students)`}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================== */}
      {/* 4. PROMOTE STUDENTS TAB */}
      {/* ========================================================== */}
      {activeSubTab === 'promote' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-amber-400" />
                Bulk Student Progression & Semester Promotion
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Select eligible students by department and semester to promote them to the subsequent semester, keeping historical academic transcripts intact.
              </p>
            </div>

            {/* Promotion Source & Target Filter Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Department</label>
                <select
                  value={promoDept}
                  onChange={(e) => { setPromoDept(e.target.value); setSelectedStudentIds([]); }}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="all">All Departments</option>
                  {RVS_CONFIG.departments.map(d => (
                    <option key={d.code} value={d.code}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Current Semester</label>
                <select
                  value={promoCurrentSem}
                  onChange={(e) => { setPromoCurrentSem(e.target.value); setSelectedStudentIds([]); }}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester'].map(sem => (
                    <option key={sem} value={sem}>{sem}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-400 mb-1">Target Promotion Semester *</label>
                <select
                  value={promoTargetSem}
                  onChange={(e) => setPromoTargetSem(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-amber-500/50 rounded-xl text-xs text-amber-300 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {['2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester', 'Graduated'].map(sem => (
                    <option key={sem} value={sem}>{sem}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Target Academic Session</label>
                <input
                  type="text"
                  value={promoSession}
                  onChange={(e) => setPromoSession(e.target.value)}
                  placeholder="2026-2027"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Eligible Students List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">
                  Eligible Active Students in {promoCurrentSem}: <strong>{eligiblePromotionStudents.length}</strong>
                </span>
                <button
                  type="button"
                  onClick={toggleSelectAllPromo}
                  className="text-xs text-amber-400 hover:underline font-semibold"
                >
                  {selectedStudentIds.length === eligiblePromotionStudents.length ? 'Deselect All' : 'Select All Eligible'}
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto rounded-2xl border border-slate-800 divide-y divide-slate-800">
                {eligiblePromotionStudents.length === 0 ? (
                  <p className="p-8 text-center text-xs text-slate-400">
                    No active students found currently enrolled in {promoCurrentSem}.
                  </p>
                ) : (
                  eligiblePromotionStudents.map((stu) => {
                    const isSelected = selectedStudentIds.includes(stu.id);
                    return (
                      <div
                        key={stu.id}
                        onClick={() => {
                          setSelectedStudentIds(prev => 
                            isSelected ? prev.filter(id => id !== stu.id) : [...prev, stu.id]
                          );
                        }}
                        className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected ? 'bg-amber-500/10' : 'hover:bg-slate-900/60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded text-amber-500 focus:ring-amber-500"
                          />
                          <div>
                            <p className="font-bold text-white text-xs">{stu.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">Roll: {stu.roll_no} &bull; Reg: {stu.reg_no}</p>
                          </div>
                        </div>

                        <div className="text-right text-xs">
                          <span className="text-slate-300 font-semibold">{stu.department_code}</span>
                          <span className="block text-[10px] text-amber-400">{stu.batch}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <span className="text-xs text-slate-400">
                  Selected: <strong className="text-amber-400">{selectedStudentIds.length}</strong> students
                </span>
                <button
                  type="button"
                  disabled={selectedStudentIds.length === 0}
                  onClick={() => setShowPromoConfirm(true)}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 disabled:opacity-40 cursor-pointer"
                >
                  Promote to {promoTargetSem}
                </button>
              </div>
            </div>
          </div>

          {/* Promotion Confirmation Modal */}
          {showPromoConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
                <h3 className="text-base font-bold text-white">Confirm Semester Promotion</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  You are about to promote <strong>{selectedStudentIds.length} students</strong> from <strong>{promoCurrentSem}</strong> to <strong className="text-amber-400">{promoTargetSem}</strong> for academic session <strong>{promoSession}</strong>. Historical semester records will be saved.
                </p>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowPromoConfirm(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={promoting}
                    onClick={handleExecutePromotion}
                    className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer"
                  >
                    {promoting ? 'Promoting...' : 'Confirm Promotion'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================== */}
      {/* 5. ARCHIVED / INACTIVE STUDENTS TAB */}
      {/* ========================================================== */}
      {activeSubTab === 'archived' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Archive className="w-4 h-4 text-amber-400" />
                Archived & Inactive Student Records
              </h2>
              <p className="text-xs text-slate-400">Past, suspended, or archived records retained for institutional audit compliance.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-3">Student Name</th>
                  <th className="py-3 px-3">Roll No</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {students.filter(s => s.status === 'archived' || s.status === 'inactive').length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400 text-xs">
                      No archived or inactive students found.
                    </td>
                  </tr>
                ) : (
                  students.filter(s => s.status === 'archived' || s.status === 'inactive').map(stu => (
                    <tr key={stu.id} className="hover:bg-slate-900/50">
                      <td className="py-3 px-3 font-semibold text-white">{stu.name}</td>
                      <td className="py-3 px-3 font-mono text-amber-400">{stu.roll_no}</td>
                      <td className="py-3 px-3">{stu.department_code}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          {stu.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleStatusChange(stu.id, 'active')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-semibold text-[11px] border border-emerald-500/30 inline-flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Restore Active
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 360° STUDENT PROFILE MODAL (ALL 12 TABS & SUMMARY CARDS) */}
      {/* ========================================================== */}
      {profile360 && (
        <Student360ProfileModal
          profileData={profile360}
          onClose={() => setProfile360(null)}
          onRefresh={() => open360Profile(profile360.student.id)}
        />
      )}

      {/* ========================================================== */}
      {/* EDIT STUDENT MODAL */}
      {/* ========================================================== */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Edit Student Information</h3>
              <button onClick={() => setEditingStudent(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Roll Number</label>
                <input
                  type="text"
                  value={editForm.roll_no || ''}
                  onChange={(e) => setEditForm({ ...editForm, roll_no: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl font-mono text-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Department</label>
                  <select
                    value={editForm.department_code || 'CSE'}
                    onChange={(e) => setEditForm({ ...editForm, department_code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  >
                    {RVS_CONFIG.departments.map(d => (
                      <option key={d.code} value={d.code}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Semester</label>
                  <select
                    value={editForm.semester || '6th Semester'}
                    onChange={(e) => setEditForm({ ...editForm, semester: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  >
                    {['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Guardian Mobile</label>
                <input
                  type="text"
                  value={editForm.guardian_phone || ''}
                  onChange={(e) => setEditForm({ ...editForm, guardian_phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Residential Address</label>
                <input
                  type="text"
                  value={editForm.address || ''}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* STUDENT ATTENDANCE HISTORY MODAL (ADMIN / FACULTY INSPECT) */}
      {/* ========================================================== */}
      {attendanceModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 text-slate-100 rounded-3xl p-6 sm:p-8 shadow-2xl my-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
                  <Calendar className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {attendanceModalStudent.name} &bull; Attendance History
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Roll: {attendanceModalStudent.roll_no} &bull; {attendanceModalStudent.department_code} ({attendanceModalStudent.semester})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAttendanceModalStudent(null)}
                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {studentAttLoading ? (
              <div className="py-16 text-center text-slate-400">
                <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading Student Attendance Records...
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Low Attendance Alert */}
                {studentAttData?.summary?.hasLowAttendanceWarning && (
                  <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span className="font-semibold">
                      LOW ATTENDANCE WARNING: Overall attendance is {studentAttData?.summary?.overallPercentage}% (Below mandatory 75% threshold).
                    </span>
                  </div>
                )}

                {/* Summary KPI Row */}
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Attendance</span>
                    <p className={`text-base font-black font-mono mt-0.5 ${studentAttData?.summary?.hasLowAttendanceWarning ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {studentAttData?.summary?.overallPercentage || 0}%
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Classes</span>
                    <p className="text-base font-bold text-white mt-0.5">{studentAttData?.summary?.totalClasses || 0}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Present</span>
                    <p className="text-base font-bold text-emerald-400 mt-0.5">{studentAttData?.summary?.present || 0}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Absent</span>
                    <p className="text-base font-bold text-rose-400 mt-0.5">{studentAttData?.summary?.absent || 0}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Late</span>
                    <p className="text-base font-bold text-amber-400 mt-0.5">{studentAttData?.summary?.late || 0}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Excused</span>
                    <p className="text-base font-bold text-blue-400 mt-0.5">{studentAttData?.summary?.excused || 0}</p>
                  </div>
                </div>

                {/* Subject-Wise Mini Cards */}
                <div>
                  <h4 className="font-bold text-slate-300 mb-2">Subject-Wise Performance</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {(studentAttData?.subjectWise || []).map((subj) => (
                      <div key={subj.code} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="flex justify-between items-start">
                          <span className="font-mono font-bold text-amber-400">{subj.code}</span>
                          <span className={`font-mono font-bold ${subj.isLowAttendance ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {subj.percentage}%
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 font-semibold truncate mt-0.5">{subj.name}</p>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Attended: {subj.attended}/{subj.totalClasses} classes
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 pt-2">
                  <select
                    value={attFilterSubject}
                    onChange={(e) => setAttFilterSubject(e.target.value)}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white"
                  >
                    <option value="all">All Subjects</option>
                    {(studentAttData?.subjectWise || []).map((s) => (
                      <option key={s.code} value={s.code}>{s.code} - {s.name}</option>
                    ))}
                  </select>

                  <select
                    value={attFilterStatus}
                    onChange={(e) => setAttFilterStatus(e.target.value)}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Late">Late</option>
                    <option value="Excused">Excused</option>
                  </select>
                </div>

                {/* History Table */}
                <div className="overflow-x-auto max-h-72 overflow-y-auto border border-slate-800 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-400 font-bold sticky top-0">
                      <tr>
                        <th className="p-2.5">Date & Day</th>
                        <th className="p-2.5">Subject</th>
                        <th className="p-2.5">Faculty</th>
                        <th className="p-2.5">Period & Time</th>
                        <th className="p-2.5">Status</th>
                        <th className="p-2.5">Method</th>
                        <th className="p-2.5">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {(studentAttData?.records || [])
                        .filter(r => (attFilterSubject === 'all' || r.subject_code === attFilterSubject) &&
                                     (attFilterStatus === 'all' || r.status.toLowerCase() === attFilterStatus.toLowerCase()))
                        .slice(0, 30)
                        .map((r) => (
                          <tr key={r.id} className="hover:bg-slate-900/50">
                            <td className="p-2.5 font-mono whitespace-nowrap text-slate-300">
                              {r.attendance_date} <span className="text-[10px] text-slate-500">({r.day})</span>
                            </td>
                            <td className="p-2.5">
                              <span className="font-bold text-white block">{r.subject_name}</span>
                              <span className="font-mono text-[10px] text-amber-400">{r.subject_code}</span>
                            </td>
                            <td className="p-2.5 text-slate-400 whitespace-nowrap">{r.faculty_name}</td>
                            <td className="p-2.5 text-slate-400 whitespace-nowrap">{r.class_period} &bull; {r.start_time}</td>
                            <td className="p-2.5 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                r.status === 'Present' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                r.status === 'Absent' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                                r.status === 'Late' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              }`}>
                                {r.status}
                              </span>
                            </td>
                            <td className="p-2.5 whitespace-nowrap font-mono text-[10px] text-slate-400">{r.method}</td>
                            <td className="p-2.5 text-slate-500 text-[11px] truncate max-w-xs">{r.remarks || '-'}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setAttendanceModalStudent(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
