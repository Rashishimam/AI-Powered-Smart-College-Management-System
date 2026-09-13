import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/client';
import { RVS_CONFIG } from '../../config/rvsConfig';
import { 
  GraduationCap, 
  Mail, 
  Phone, 
  BookOpen, 
  Clock, 
  Award, 
  ShieldCheck, 
  Sparkles,
  ExternalLink,
  UserCheck,
  Calendar,
  Layers,
  CheckCircle2,
  Search,
  Filter,
  Eye,
  Edit3,
  Plus,
  Trash2,
  X,
  UserX,
  Check,
  Building2,
  FolderGit2,
  Briefcase,
  Globe
} from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import StatCard from '../../components/StatCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function FacultyManagement() {
  const [activeTab, setActiveTab] = useState('directory'); // 'directory', 'departments', 'admin'
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedDesig, setSelectedDesig] = useState('ALL');
  const [selectedProgram, setSelectedProgram] = useState('ALL');

  // Admin Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    title: 'Prof.',
    designation: 'Assistant Professor',
    department_code: 'CSE',
    department_name: 'Computer Science & Engineering',
    qualification: 'M.Tech',
    specialization: '',
    email: '',
    phone: '7033000777',
    profile_photo: '/assets/faculty/placeholder-faculty.svg',
    workload_hours: 18,
    public_profile: true
  });

  // Faculty Attendance History Modal State
  const [attendanceFaculty, setAttendanceFaculty] = useState(null);
  const [facultyAttData, setFacultyAttData] = useState(null);
  const [facultyAttLoading, setFacultyAttLoading] = useState(false);
  const [facultyAttMonth, setFacultyAttMonth] = useState(9);
  const [facultyAttStatus, setFacultyAttStatus] = useState('all');

  const openFacultyAttendance = async (fac) => {
    setAttendanceFaculty(fac);
    setFacultyAttLoading(true);
    setFacultyAttStatus('all');
    try {
      const res = await api.get(`/rvs/attendance/faculty/history?faculty_id=${fac.id}&month=${facultyAttMonth}&year=2026`);
      if (res.data?.success) {
        setFacultyAttData(res.data);
      }
    } catch (err) {
      console.error('Failed to load faculty attendance:', err);
    } finally {
      setFacultyAttLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      // Try authenticated endpoint first, fallback to public endpoint
      let res;
      try {
        res = await api.get('/rvs/faculty');
      } catch (e) {
        res = await api.get('/rvs/faculty/public');
      }
      if (res.data?.success && Array.isArray(res.data.faculty)) {
        setFacultyList(res.data.faculty);
      }
    } catch (err) {
      console.error('Failed to load faculty records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  // Department choices
  const departments = [
    { code: 'ALL', label: 'All Departments' },
    { code: 'CSE', label: 'Computer Science & Engineering' },
    { code: 'AIML', label: 'CSE (AI & ML)' },
    { code: 'CE', label: 'Civil Engineering' },
    { code: 'ME', label: 'Mechanical Engineering' },
    { code: 'EEE', label: 'Electrical & Electronics Engg.' },
    { code: 'ECE', label: 'Electronics & Communication Engg.' },
    { code: 'BSH', label: 'Science & Humanities' },
    { code: 'MCA', label: 'Master of Computer Applications' },
    { code: 'BBA', label: 'Business Administration' },
    { code: 'BCA', label: 'Computer Applications' },
    { code: 'EXEC', label: 'Executive Leadership' }
  ];

  // Designation categories
  const designations = [
    { value: 'ALL', label: 'All Designations' },
    { value: 'Dean', label: 'Deans & Executive' },
    { value: 'Head', label: 'HODs & Incharge' },
    { value: 'Professor', label: 'Professors' },
    { value: 'Associate Professor', label: 'Associate Professors' },
    { value: 'Assistant Professor', label: 'Assistant Professors' }
  ];

  // Filtered Faculty (Enforces rule: ONLY members with verified official photos)
  const filteredFaculty = useMemo(() => {
    return facultyList.filter(f => {
      // STRICT FILTER: Must have verified official photo, no placeholder
      const photo = f.avatar || f.photo;
      if (!photo || photo.includes('placeholder') || !photo.startsWith('/assets/faculty/')) {
        return false;
      }
      if (f.public_profile === false) return false;
      // Department Filter
      if (selectedDept !== 'ALL') {
        const matchesDept = 
          (f.department_code && f.department_code.toUpperCase() === selectedDept) ||
          (f.department && f.department.toUpperCase().includes(selectedDept)) ||
          (f.all_departments && f.all_departments.some(d => d.toUpperCase().includes(selectedDept)));
        if (!matchesDept) return false;
      }

      // Designation Filter
      if (selectedDesig !== 'ALL') {
        const desig = f.designation || '';
        if (selectedDesig === 'Dean' && !/dean/i.test(desig)) return false;
        if (selectedDesig === 'Head' && !/head|incharge|hod/i.test(desig)) return false;
        if (selectedDesig === 'Associate Professor' && !/associate/i.test(desig)) return false;
        if (selectedDesig === 'Assistant Professor' && !/assistant/i.test(desig)) return false;
        if (selectedDesig === 'Professor' && (!/professor/i.test(desig) || /associate|assistant/i.test(desig))) return false;
      }

      // Program Filter
      if (selectedProgram !== 'ALL') {
        const sources = f.all_sources ? f.all_sources.join(' ') : '';
        const depts = f.all_departments ? f.all_departments.join(' ') : '';
        const combined = (sources + ' ' + depts).toLowerCase();
        if (selectedProgram === 'btech' && !combined.includes('btech') && !combined.includes('computer-science') && !combined.includes('mechanical') && !combined.includes('civil')) return false;
        if (selectedProgram === 'diploma' && !combined.includes('diploma')) return false;
        if (selectedProgram === 'mtech' && !combined.includes('m-tech')) return false;
        if (selectedProgram === 'mca' && !combined.includes('mca')) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = f.name && f.name.toLowerCase().includes(q);
        const matchesSpec = f.specialization && f.specialization.toLowerCase().includes(q);
        const matchesEmail = f.email && f.email.toLowerCase().includes(q);
        const matchesDept = (f.department || '').toLowerCase().includes(q);
        if (!matchesName && !matchesSpec && !matchesEmail && !matchesDept) return false;
      }

      return true;
    });
  }, [facultyList, selectedDept, selectedDesig, selectedProgram, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = facultyList.length;
    const withPhoto = facultyList.filter(f => f.avatar && !f.avatar.includes('placeholder')).length;
    const doctorates = facultyList.filter(f => /^dr\./i.test(f.name) || /ph\.?d/i.test(f.qualification || '')).length;
    const hods = facultyList.filter(f => /head|hod|incharge|dean/i.test(f.designation || '')).length;
    return { total, withPhoto, doctorates, hods };
  }, [facultyList]);

  // Grouped by Department for Hierarchy View
  const groupedByDept = useMemo(() => {
    const groups = {};
    facultyList.forEach(f => {
      const dept = f.department || f.department_name || 'General Engineering';
      if (!groups[dept]) groups[dept] = [];
      groups[dept].push(f);
    });
    // Sort within group: HODs first, then Associate Prof, then Assistant Prof
    Object.keys(groups).forEach(k => {
      groups[k].sort((a, b) => {
        const aIsLead = /head|hod|dean|incharge/i.test(a.designation || '');
        const bIsLead = /head|hod|dean|incharge/i.test(b.designation || '');
        if (aIsLead && !bIsLead) return -1;
        if (!aIsLead && bIsLead) return 1;
        return a.name.localeCompare(b.name);
      });
    });
    return groups;
  }, [facultyList]);

  // Handlers
  const handleSaveFaculty = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      if (editingFaculty) {
        // Update
        const res = await api.put(`/rvs/faculty/${editingFaculty.id}`, formData);
        if (res.data?.success) {
          showToast(`Faculty profile for ${formData.name} updated successfully.`);
          setEditingFaculty(null);
          fetchFaculty();
        }
      } else {
        // Create
        const res = await api.post('/rvs/faculty', formData);
        if (res.data?.success) {
          showToast(`New faculty member ${formData.name} added successfully.`);
          setShowAddModal(false);
          fetchFaculty();
        }
      }
    } catch (err) {
      console.error('Failed to save faculty:', err);
      alert(err.response?.data?.message || 'Error saving faculty profile.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTogglePublic = async (faculty) => {
    try {
      const newStatus = !faculty.public_profile;
      const res = await api.put(`/rvs/faculty/${faculty.id}`, { public_profile: newStatus });
      if (res.data?.success) {
        showToast(`${faculty.name} is now ${newStatus ? 'published' : 'hidden'} on public directory.`);
        fetchFaculty();
      }
    } catch (err) {
      console.error('Failed to update public status:', err);
    }
  };

  const handleDeactivate = async (faculty) => {
    if (!window.confirm(`Are you sure you want to deactivate ${faculty.name}?`)) return;
    try {
      const res = await api.delete(`/rvs/faculty/${faculty.id}`);
      if (res.data?.success) {
        showToast(`${faculty.name} has been deactivated.`);
        fetchFaculty();
      }
    } catch (err) {
      console.error('Failed to deactivate faculty:', err);
    }
  };

  const openEditModal = (f) => {
    setEditingFaculty(f);
    setFormData({
      name: f.name || '',
      title: f.title || (f.name.startsWith('Dr.') ? 'Dr.' : 'Prof.'),
      designation: f.designation || '',
      department_code: f.department_code || 'CSE',
      department_name: f.department || '',
      qualification: f.qualification || '',
      specialization: f.specialization || '',
      email: f.email || '',
      phone: f.phone || '7033000777',
      profile_photo: f.avatar || '',
      workload_hours: f.workload_hours || 16,
      public_profile: f.public_profile !== false
    });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950 text-white border border-blue-500/40 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-xs font-semibold">{toastMessage}</p>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-900 text-white">
              Academic Council
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified Official Data &bull; rvscollege.ac.in
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Faculty Directory & Academic Leadership
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Discover professors, department chairs, specialized research domains, and verified institutional credentials.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'directory' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Faculty Directory ({stats.total})</span>
          </button>
          <button
            onClick={() => setActiveTab('departments')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'departments' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Department View</span>
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'admin' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            <span>Admin Management</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-900 shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Faculty</p>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{stats.total}</h3>
            <span className="text-[10px] text-emerald-600 font-semibold">100% Official RVS Data</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Official Portraits</p>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{stats.withPhoto}</h3>
            <span className="text-[10px] text-slate-500 font-medium">Local assets downloaded</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Doctorates & Ph.D</p>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{stats.doctorates}</h3>
            <span className="text-[10px] text-amber-700 font-semibold">Distinguished Researchers</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Department Chairs</p>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{stats.hods}</h3>
            <span className="text-[10px] text-indigo-700 font-semibold">Deans, HODs & Leads</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: FACULTY DIRECTORY (CARDS WITH FILTER & SEARCH) */}
      {/* ========================================================================= */}
      {activeTab === 'directory' && (
        <div className="space-y-5">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search faculty by name, specialization, or institutional email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Department Dropdown */}
              <div className="sm:w-64">
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900 cursor-pointer"
                >
                  {departments.map(d => (
                    <option key={d.code} value={d.code}>{d.label}</option>
                  ))}
                </select>
              </div>

              {/* Designation Dropdown */}
              <div className="sm:w-56">
                <select
                  value={selectedDesig}
                  onChange={(e) => setSelectedDesig(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900 cursor-pointer"
                >
                  {designations.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>

              {/* Program Filter */}
              <div className="sm:w-44">
                <select
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900 cursor-pointer"
                >
                  <option value="ALL">All Programs</option>
                  <option value="btech">B.Tech UG</option>
                  <option value="mtech">M.Tech PG</option>
                  <option value="diploma">Polytechnic / Diploma</option>
                  <option value="mca">MCA / BCA</option>
                </select>
              </div>
            </div>

            {/* Quick Department Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
              <span className="text-slate-400 font-semibold shrink-0 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Quick Filter:
              </span>
              {departments.slice(0, 8).map(d => (
                <button
                  key={d.code}
                  onClick={() => setSelectedDept(d.code)}
                  className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer ${
                    selectedDept === d.code 
                      ? 'bg-blue-900 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {d.code === 'ALL' ? 'All' : d.code}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Showing <strong className="text-slate-900">{filteredFaculty.length}</strong> of {facultyList.length} faculty profiles</span>
            {(selectedDept !== 'ALL' || selectedDesig !== 'ALL' || selectedProgram !== 'ALL' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedDept('ALL');
                  setSelectedDesig('ALL');
                  setSelectedProgram('ALL');
                  setSearchQuery('');
                }}
                className="text-blue-700 hover:underline font-semibold cursor-pointer"
              >
                Reset all filters
              </button>
            )}
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-blue-900/20 border-t-blue-900 rounded-full animate-spin" />
              <p className="text-xs text-slate-500">Loading verified official RVS faculty profiles...</p>
            </div>
          ) : filteredFaculty.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
              <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No faculty members found</h3>
              <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or clearing active filters.</p>
            </div>
          ) : (
            /* Faculty Cards Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFaculty.map((fac) => {
                const isDoctorate = /^dr\./i.test(fac.name) || fac.title === 'Dr.';
                const isLeadership = /head|hod|dean|incharge/i.test(fac.designation || '');

                return (
                  <div
                    key={fac.id || fac.employee_id}
                    className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col justify-between group"
                  >
                    {/* Top Portrait & Header */}
                    <div className="p-4">
                      <div className="flex items-start gap-3.5">
                        {/* Portrait */}
                        <div className="relative shrink-0 w-16 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/90 shadow-2xs group-hover:ring-2 group-hover:ring-blue-900/20 transition-all">
                          <img
                            src={fac.avatar || '/assets/faculty/placeholder-faculty.svg'}
                            alt={fac.name}
                            className="w-full h-full object-cover object-top"
                            loading="lazy"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/assets/faculty/placeholder-faculty.svg';
                            }}
                          />
                          {isLeadership && (
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-white" title="Department Chair" />
                          )}
                        </div>

                        {/* Identity & Department */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                              isDoctorate 
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                                : 'bg-blue-50 text-blue-800 border border-blue-200'
                            }`}>
                              {isDoctorate ? 'Dr.' : 'Prof.'}
                            </span>
                            <span className="font-mono text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              {fac.department_code || 'RVSCET'}
                            </span>
                          </div>

                          <h3 
                            onClick={() => setSelectedFaculty(fac)}
                            className="text-sm font-black text-slate-900 tracking-tight line-clamp-1 hover:text-blue-900 cursor-pointer transition-colors"
                            title={fac.name}
                          >
                            {fac.name}
                          </h3>

                          <p className="text-[11px] font-bold text-blue-900 mt-0.5 line-clamp-1" title={fac.designation}>
                            {fac.designation || 'Faculty Member'}
                          </p>

                          <p className="text-[10px] text-slate-500 truncate mt-0.5" title={fac.department}>
                            {fac.department || 'RVS College of Engg. & Tech.'}
                          </p>
                        </div>
                      </div>

                      {/* Specialization Pill */}
                      {fac.specialization && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100">
                          <div className="flex items-start gap-1 text-[11px] text-slate-600">
                            <BookOpen className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                            <span className="text-[10px] text-slate-600 line-clamp-2 leading-snug">
                              <strong className="text-slate-800 font-semibold">Specialization:</strong> {fac.specialization}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Strip */}
                    <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                      {fac.email ? (
                        <a
                          href={`mailto:${fac.email}`}
                          className="text-[10px] font-mono text-slate-500 hover:text-blue-900 flex items-center gap-1 truncate max-w-[170px]"
                          title={fac.email}
                        >
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{fac.email.replace('@rvscollege.ac.in', '')}</span>
                        </a>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Campus Directory</span>
                      )}

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => openFacultyAttendance(fac)}
                          className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg shadow-2xs hover:bg-emerald-100 transition-colors cursor-pointer"
                          title="View Faculty Attendance History"
                        >
                          Attendance
                        </button>
                        <button
                          onClick={() => setSelectedFaculty(fac)}
                          className="text-[11px] font-bold text-blue-900 hover:text-blue-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-2xs hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                        >
                          Profile
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DEPARTMENT HIERARCHY VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'departments' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3">
            <Building2 className="w-5 h-5 text-blue-900 shrink-0" />
            <p className="text-xs text-blue-950 font-medium">
              Academic structure automatically grouped by department directly from the faculty database (single source of truth). Showing leadership chairs, associate professors, and department lecturers.
            </p>
          </div>

          <div className="space-y-6">
            {Object.entries(groupedByDept).map(([deptName, members]) => {
              const hod = members.find(m => /head|hod|incharge|dean/i.test(m.designation || ''));
              const otherMembers = members.filter(m => m !== hod);

              return (
                <div key={deptName} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  {/* Department Bar */}
                  <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-4 h-4 text-amber-400" />
                      <h2 className="text-sm sm:text-base font-black tracking-tight">{deptName}</h2>
                    </div>
                    <span className="text-xs text-slate-300 font-semibold bg-slate-800 px-2.5 py-1 rounded-md w-max">
                      {members.length} Appointed Faculty
                    </span>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* HOD / Department Chair Spotlight */}
                    {hod && (
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={hod.avatar || '/assets/faculty/placeholder-faculty.svg'}
                            alt={hod.name}
                            className="w-14 h-16 object-cover object-top rounded-xl border border-amber-300 shadow-xs"
                          />
                          <div>
                            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                              Department Chair / Incharge
                            </span>
                            <h3 className="text-base font-black text-slate-950 mt-1">{hod.name}</h3>
                            <p className="text-xs font-bold text-amber-900">{hod.designation}</p>
                            {hod.specialization && (
                              <p className="text-[11px] text-slate-600 mt-0.5">Specialization: {hod.specialization}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {hod.email && (
                            <a
                              href={`mailto:${hod.email}`}
                              className="text-xs bg-white border border-amber-300 text-amber-950 px-3 py-1.5 rounded-lg font-bold hover:bg-amber-100 flex items-center gap-1.5"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span>{hod.email}</span>
                            </a>
                          )}
                          <Button size="sm" variant="outline" onClick={() => setSelectedFaculty(hod)}>
                            Full Profile
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Faculty Members Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {otherMembers.map(f => (
                        <div
                          key={f.id || f.name}
                          onClick={() => setSelectedFaculty(f)}
                          className="p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-3"
                        >
                          <img
                            src={f.avatar || '/assets/faculty/placeholder-faculty.svg'}
                            alt={f.name}
                            className="w-10 h-12 object-cover object-top rounded-lg bg-slate-100 border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-slate-900 truncate">{f.name}</h4>
                            <p className="text-[10px] text-slate-500 truncate">{f.designation}</p>
                            {f.specialization && (
                              <p className="text-[9px] text-blue-900 truncate font-medium">{f.specialization}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ADMIN FACULTY MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'admin' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-slate-900">Institutional Faculty Roster & ERP Controls</h2>
              <p className="text-xs text-slate-500">
                Manage appointment designations, update portrait photographs, toggle public directory visibility, or deactivate faculty accounts.
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => {
                setEditingFaculty(null);
                setFormData({
                  name: '',
                  title: 'Prof.',
                  designation: 'Assistant Professor',
                  department_code: 'CSE',
                  department_name: 'Computer Science & Engineering',
                  qualification: 'M.Tech',
                  specialization: '',
                  email: '',
                  phone: '7033000777',
                  profile_photo: '/assets/faculty/placeholder-faculty.svg',
                  workload_hours: 18,
                  public_profile: true
                });
                setShowAddModal(true);
              }}
            >
              Add New Faculty
            </Button>
          </div>

          {/* Admin Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3.5 px-4">Faculty Member</th>
                    <th className="py-3.5 px-4">Employee ID</th>
                    <th className="py-3.5 px-4">Designation</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">Workload</th>
                    <th className="py-3.5 px-4">Public Visibility</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                  {facultyList.map((fac) => (
                    <tr key={fac.id || fac.employee_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={fac.avatar || '/assets/faculty/placeholder-faculty.svg'}
                            alt={fac.name}
                            className="w-9 h-11 object-cover object-top rounded-lg bg-slate-100 border border-slate-200 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{fac.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{fac.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-[11px] text-slate-600">
                        {fac.employee_id || `RVS-FAC-${fac.id}`}
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {fac.designation}
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-200">
                          {fac.department_code || 'CSE'}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-700">
                        {fac.workload_hours || 16} hrs/wk
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleTogglePublic(fac)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                            fac.public_profile !== false
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-100 text-slate-500 border border-slate-300'
                          }`}
                        >
                          {fac.public_profile !== false ? '● Published' : '○ Hidden'}
                        </button>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          fac.status === 'active' || !fac.status
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {fac.status || 'active'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(fac)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-900 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Edit Profile"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeactivate(fac)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Deactivate Faculty"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: DETAILED FACULTY PROFILE MODAL */}
      {/* ========================================================================= */}
      {selectedFaculty && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header Color Band */}
            <div className="bg-gradient-to-r from-[#0a192f] via-[#0f2347] to-[#1e3a8a] text-white p-6 relative">
              <button
                onClick={() => setSelectedFaculty(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-start gap-4 pr-8">
                <img
                  src={selectedFaculty.avatar || '/assets/faculty/placeholder-faculty.svg'}
                  alt={selectedFaculty.name}
                  className="w-20 h-24 object-cover object-top rounded-2xl bg-white p-1 border-2 border-amber-400 shadow-md shrink-0"
                />
                <div>
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                      {selectedFaculty.department_code || 'RVSCET'}
                    </span>
                    <span className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">
                      Official Verified Faculty
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white tracking-tight">{selectedFaculty.name}</h2>
                  <p className="text-xs font-bold text-amber-300 mt-0.5">{selectedFaculty.designation}</p>
                  <p className="text-[11px] text-slate-300 mt-0.5">{selectedFaculty.department}</p>
                </div>
              </div>
            </div>

            {/* Modal Body Details */}
            <div className="p-6 space-y-4 text-xs text-slate-700 max-h-[65vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Academic Qualification</span>
                  <span className="font-bold text-slate-900">{selectedFaculty.qualification || 'M.Tech / Ph.D'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Weekly Workload</span>
                  <span className="font-bold text-slate-900">{selectedFaculty.workload_hours || 16} hours/week</span>
                </div>
              </div>

              {selectedFaculty.specialization && (
                <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100">
                  <span className="text-[10px] text-blue-800 uppercase font-black block mb-1">
                    Specialization & Core Research Areas
                  </span>
                  <p className="text-xs text-slate-800 font-medium leading-relaxed">
                    {selectedFaculty.specialization}
                  </p>
                </div>
              )}

              {/* Institutional Contact Information */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Institutional Contact Information
                </span>
                <div className="flex items-center gap-2 text-slate-800 font-mono text-xs">
                  <Mail className="w-4 h-4 text-blue-900 shrink-0" />
                  <span>{selectedFaculty.email || 'info@rvscet.com'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-800 font-mono text-xs">
                  <Phone className="w-4 h-4 text-blue-900 shrink-0" />
                  <span>{selectedFaculty.phone || '7033000777 (RVS Campus Line)'}</span>
                </div>
              </div>

              {/* Department Affiliations */}
              {selectedFaculty.all_departments && selectedFaculty.all_departments.length > 1 && (
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1.5">
                    Associated Academic Programs
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedFaculty.all_departments.map((dept, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {dept}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Source Verification Link */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  Verified: {new Date(selectedFaculty.last_verified_at || Date.now()).toLocaleDateString('en-IN')}
                </span>
                {selectedFaculty.source_url && (
                  <a
                    href={selectedFaculty.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-900 hover:underline font-bold flex items-center gap-1"
                  >
                    <span>View on Official RVS Website</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setSelectedFaculty(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD / EDIT FACULTY MODAL */}
      {/* ========================================================================= */}
      {(showAddModal || editingFaculty) && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black tracking-tight">
                  {editingFaculty ? `Edit Faculty: ${editingFaculty.name}` : 'Add New Faculty Member'}
                </h3>
              </div>
              <button
                onClick={() => { setShowAddModal(false); setEditingFaculty(null); }}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFaculty} className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Title</label>
                  <select
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  >
                    <option value="Prof.">Prof.</option>
                    <option value="Dr.">Dr.</option>
                    <option value="Mr.">Mr.</option>
                    <option value="Ms.">Ms.</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900"
                    placeholder="e.g. Jeevan Kumar"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900"
                    placeholder="Associate Professor / HOD"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={formData.department_code}
                    onChange={(e) => {
                      const code = e.target.value;
                      const deptObj = departments.find(d => d.code === code);
                      setFormData({ 
                        ...formData, 
                        department_code: code,
                        department_name: deptObj ? deptObj.label : code 
                      });
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                  >
                    {departments.filter(d => d.code !== 'ALL').map(d => (
                      <option key={d.code} value={d.code}>{d.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Institutional Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
                    placeholder="faculty@rvscollege.ac.in"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Qualification</label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900"
                    placeholder="Ph.D, M.Tech (CSE)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Specialization & Research Areas</label>
                <textarea
                  rows="2"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900"
                  placeholder="Artificial Intelligence, Machine Learning, Power Systems..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Weekly Lecture Hours</label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={formData.workload_hours}
                    onChange={(e) => setFormData({ ...formData, workload_hours: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Profile Photo URL</label>
                  <input
                    type="text"
                    value={formData.profile_photo}
                    onChange={(e) => setFormData({ ...formData, profile_photo: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900"
                    placeholder="/assets/faculty/name.jpg"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.public_profile}
                    onChange={(e) => setFormData({ ...formData, public_profile: e.target.checked })}
                    className="rounded text-blue-900 focus:ring-blue-900 w-4 h-4"
                  />
                  <span className="font-semibold text-slate-800">Publish in Public College Directory</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => { setShowAddModal(false); setEditingFaculty(null); }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  size="sm" 
                  loading={actionLoading}
                >
                  {editingFaculty ? 'Save Changes' : 'Create Faculty Profile'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* FACULTY ATTENDANCE HISTORY MODAL (ADMIN / LEADERSHIP INSPECT) */}
      {/* ========================================================== */}
      {attendanceFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white border border-slate-200 text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl my-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-900 rounded-xl border border-blue-100">
                  <UserCheck className="w-5 h-5 text-blue-900" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {attendanceFaculty.name} &bull; Attendance History
                  </h3>
                  <p className="text-xs text-slate-500">
                    {attendanceFaculty.designation || 'Faculty Member'} &bull; {attendanceFaculty.department || attendanceFaculty.department_name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAttendanceFaculty(null)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {facultyAttLoading ? (
              <div className="py-16 text-center text-slate-400">
                <div className="w-6 h-6 border-2 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading Faculty Biometric Attendance Records...
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Summary KPI Row */}
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Attendance %</span>
                    <p className="text-base font-black font-mono text-emerald-700 mt-0.5">
                      {facultyAttData?.summary?.attendancePct || 0}%
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Working Days</span>
                    <p className="text-base font-bold text-slate-800 mt-0.5">{facultyAttData?.summary?.totalWorkingDays || 0}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                    <span className="text-[10px] text-emerald-700 uppercase font-semibold">Present</span>
                    <p className="text-base font-bold text-emerald-800 mt-0.5">{facultyAttData?.summary?.presentDays || 0}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100">
                    <span className="text-[10px] text-indigo-700 uppercase font-semibold">Half Days</span>
                    <p className="text-base font-bold text-indigo-800 mt-0.5">{facultyAttData?.summary?.halfDays || 0}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                    <span className="text-[10px] text-blue-700 uppercase font-semibold">Leave</span>
                    <p className="text-base font-bold text-blue-800 mt-0.5">{facultyAttData?.summary?.leaveDays || 0}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100">
                    <span className="text-[10px] text-amber-700 uppercase font-semibold">Working Hours</span>
                    <p className="text-base font-bold text-amber-800 font-mono mt-0.5">{facultyAttData?.summary?.totalWorkingHours || '0h'}</p>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <select
                      value={facultyAttStatus}
                      onChange={(e) => setFacultyAttStatus(e.target.value)}
                      className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="all">All Statuses</option>
                      <option value="Present">Present</option>
                      <option value="Late">Late</option>
                      <option value="Half Day">Half Day</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Absent">Absent</option>
                    </select>

                    <select
                      value={facultyAttMonth}
                      onChange={async (e) => {
                        const m = Number(e.target.value);
                        setFacultyAttMonth(m);
                        setFacultyAttLoading(true);
                        try {
                          const res = await api.get(`/rvs/attendance/faculty/history?faculty_id=${attendanceFaculty.id}&month=${m}&year=2026`);
                          if (res.data?.success) setFacultyAttData(res.data);
                        } catch (err) {
                          console.error(err);
                        } finally {
                          setFacultyAttLoading(false);
                        }
                      }}
                      className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                    >
                      {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, idx) => (
                        <option key={m} value={idx + 1}>{m} 2026</option>
                      ))}
                    </select>
                  </div>

                  <span className="text-xs text-slate-500 font-medium">
                    Showing {(facultyAttData?.records || []).filter(r => facultyAttStatus === 'all' || r.status.toLowerCase() === facultyAttStatus.toLowerCase()).length} records
                  </span>
                </div>

                {/* History Table */}
                <div className="overflow-x-auto max-h-72 overflow-y-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs erp-table">
                    <thead className="bg-slate-50 text-slate-600 font-bold sticky top-0">
                      <tr>
                        <th>Date & Day</th>
                        <th>Check-In</th>
                        <th>Check-Out</th>
                        <th>Working Hours</th>
                        <th>Status</th>
                        <th>Leave Type</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(facultyAttData?.records || [])
                        .filter(r => facultyAttStatus === 'all' || r.status.toLowerCase() === facultyAttStatus.toLowerCase())
                        .slice(0, 30)
                        .map((r) => (
                          <tr key={r.id} className="hover:bg-slate-50/80">
                            <td className="font-mono text-slate-900 whitespace-nowrap">
                              {r.attendance_date} <span className="text-[10px] text-slate-500">({r.day})</span>
                            </td>
                            <td className="font-mono text-emerald-800 font-bold whitespace-nowrap">{r.check_in || '—'}</td>
                            <td className="font-mono text-blue-900 font-bold whitespace-nowrap">{r.check_out || '—'}</td>
                            <td className="font-mono font-bold text-slate-800 whitespace-nowrap">{r.working_hours}</td>
                            <td className="whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                r.status === 'Present' ? 'bg-emerald-100 text-emerald-800' :
                                r.status === 'Half Day' ? 'bg-indigo-100 text-indigo-800' :
                                r.status === 'On Leave' ? 'bg-purple-100 text-purple-800' :
                                r.status === 'Late' ? 'bg-amber-100 text-amber-800' :
                                'bg-rose-100 text-rose-800'
                              }`}>
                                {r.status}
                              </span>
                            </td>
                            <td className="text-slate-600 whitespace-nowrap">{r.leave_type || '—'}</td>
                            <td className="text-slate-500 text-[11px] truncate max-w-xs">{r.remarks || '—'}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setAttendanceFaculty(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
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
