import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import RVSLogo from './RVSLogo';
import Avatar from './ui/Avatar';
import Dropdown from './ui/Dropdown';
import { 
  LogOut, 
  ShieldCheck, 
  Building2, 
  BookOpen, 
  UserCheck, 
  Sparkles, 
  Bell, 
  Menu, 
  Search, 
  ChevronRight, 
  User, 
  Settings, 
  HelpCircle 
} from 'lucide-react';

const roleMeta = {
  super_admin: {
    label: 'Trust Board Admin',
    color: 'bg-rose-50 text-rose-800 border-rose-200',
    icon: ShieldCheck
  },
  college_admin: {
    label: 'Principal / Admin',
    color: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: Building2
  },
  faculty: {
    label: 'Faculty / HOD',
    color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: BookOpen
  },
  student: {
    label: 'RVS Student',
    color: 'bg-blue-50 text-blue-800 border-blue-200',
    icon: UserCheck
  }
};

const tabTitleMap = {
  dashboard: 'Executive Dashboard',
  programs: 'Academic Programs & Departments',
  students: 'Student Information & Registry',
  faculty: 'Faculty & Department HODs',
  attendance: 'Live Attendance & QR Tracking',
  fees: 'Fee Analytics & Receipts',
  exams: 'Examinations & SGPA Results',
  assignments: 'Assignments & Coursework',
  timetable: 'Weekly Class & Lab Timetable',
  placements: 'Training & Placement (T&P) Cell',
  idcards: 'Student & Faculty ID Cards',
  library: 'Central Library Management',
  notices: 'Official College Notice Board',
  grievances: 'Leave Requests & Grievance Cell',
  backlogs: 'Academic Backlog Management',
  internal_marks: 'Internal Assessment & Marks Audit',
  admit_cards: 'Examination Admit Cards',
  certificates: 'Official Certificate Generation & QR',
  documents: 'Student Document Verification',
  labs: 'Laboratory & Asset Maintenance',
  substitution: 'Faculty Timetable Substitution',
  gate_visitors: 'Perimeter Gate & Visitor Management',
  facility_booking: 'Room & Facility Booking',
  hostel_transport: 'Hostel & Transport Services',
  alumni: 'Alumni Association Network',
  helpdesk: 'Campus Helpdesk & Support Tickets',
  feedback: 'Student Feedback System (IQAC)',
  promotion: 'Student Promotion & Graduation'
};

export default function Navbar({ 
  activeTab = 'dashboard', 
  onSwitchRoleClick, 
  onToggleSidebar,
  onNavigate
}) {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.get('/rvs/search', { params: { q: searchQuery.trim() } });
        if (res.data?.success) {
          setSearchResults(res.data.results);
        }
      } catch (err) {
        console.error('Smart Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const currentRole = roleMeta[user?.role] || roleMeta.student;
  const RoleIcon = currentRole.icon;
  const pageTitle = tabTitleMap[activeTab] || 'Campus ERP';

  const userMenuItems = [
    {
      label: `${user?.name || 'User'} (${currentRole.label})`,
      icon: User,
      onClick: () => {}
    },
    {
      label: 'Switch Demo Role',
      icon: Sparkles,
      onClick: onSwitchRoleClick
    },
    {
      label: 'College Info: RVSCET',
      icon: HelpCircle,
      onClick: () => window.open('https://www.rvscollege.ac.in', '_blank')
    },
    { divider: true },
    {
      label: 'Sign Out',
      icon: LogOut,
      danger: true,
      onClick: logout
    }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle + Page Title & Breadcrumb */}
        <div className="flex items-center space-x-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors md:hidden cursor-pointer shrink-0"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Official RVS College Logo in Top Navbar */}
          <div className="shrink-0 flex items-center">
            <RVSLogo size="xs" showText={false} variant="dark" />
          </div>

          {/* Breadcrumb & Title */}
          <div className="min-w-0">
            <nav className="hidden sm:flex items-center space-x-1.5 text-[11px] text-slate-400 font-medium">
              <span>RVS Smart Campus</span>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span className="text-slate-700 font-semibold truncate">{pageTitle}</span>
            </nav>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 truncate tracking-tight font-sans">
              {pageTitle}
            </h2>
          </div>
        </div>

        {/* Center: Global Smart Search Bar */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-4 relative">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSearchResults(true)}
              placeholder="Search students, faculty, roll no, notices, drives..."
              className="w-full pl-9 pr-12 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
            />
            {isSearching ? (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <div className="w-3.5 h-3.5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
                <span className="text-[10px] bg-white border border-slate-200 text-slate-400 px-1.5 py-0.5 rounded font-mono shadow-2xs">
                  ⌘K
                </span>
              </div>
            )}
          </div>

          {/* Grouped Smart Search Results Dropdown */}
          {showSearchResults && searchResults && searchQuery.length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 max-h-[80vh] overflow-y-auto animate-scale-in">
              <div className="p-2.5 bg-slate-900 text-white flex items-center justify-between text-xs font-semibold">
                <span>Smart Campus Search Results</span>
                <button
                  onClick={() => setShowSearchResults(false)}
                  className="text-slate-400 hover:text-white p-0.5"
                >
                  ✕
                </button>
              </div>

              {/* Check if all groups are empty */}
              {Object.values(searchResults).every(arr => !arr || arr.length === 0) ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No matching campus records found for "{searchQuery}".
                </div>
              ) : (
                <div className="p-2 space-y-3 text-xs">
                  {/* Students Group */}
                  {searchResults.students?.length > 0 && (
                    <div>
                      <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Students ({searchResults.students.length})
                      </div>
                      <div className="space-y-1">
                        {searchResults.students.map(s => (
                          <div
                            key={s.id}
                            onClick={() => {
                              if (onNavigate) onNavigate('students');
                              setShowSearchResults(false);
                            }}
                            className="p-2 rounded-lg hover:bg-blue-50 cursor-pointer flex items-center justify-between transition"
                          >
                            <div>
                              <div className="font-semibold text-slate-900">{s.name}</div>
                              <span className="text-[11px] text-slate-500 font-mono">{s.roll_no} • {s.department}</span>
                            </div>
                            <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">
                              Student 360°
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Faculty Group */}
                  {searchResults.faculty?.length > 0 && (
                    <div className="border-t border-slate-100 pt-2">
                      <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Faculty & Professors ({searchResults.faculty.length})
                      </div>
                      <div className="space-y-1">
                        {searchResults.faculty.map(f => (
                          <div
                            key={f.id}
                            onClick={() => {
                              if (onNavigate) onNavigate('faculty');
                              setShowSearchResults(false);
                            }}
                            className="p-2 rounded-lg hover:bg-emerald-50 cursor-pointer flex items-center justify-between transition"
                          >
                            <div>
                              <div className="font-semibold text-slate-900">{f.name}</div>
                              <span className="text-[11px] text-slate-500">{f.designation} ({f.department})</span>
                            </div>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                              Faculty
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Courses Group */}
                  {searchResults.courses?.length > 0 && (
                    <div className="border-t border-slate-100 pt-2">
                      <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Academic Programs ({searchResults.courses.length})
                      </div>
                      <div className="space-y-1">
                        {searchResults.courses.map(c => (
                          <div
                            key={c.id || c.code}
                            onClick={() => {
                              if (onNavigate) onNavigate('programs');
                              setShowSearchResults(false);
                            }}
                            className="p-2 rounded-lg hover:bg-indigo-50 cursor-pointer flex items-center justify-between transition"
                          >
                            <div className="font-semibold text-slate-900">{c.name}</div>
                            <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                              {c.code}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Placement Drives Group */}
                  {searchResults.placement_drives?.length > 0 && (
                    <div className="border-t border-slate-100 pt-2">
                      <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Placement Drives ({searchResults.placement_drives.length})
                      </div>
                      <div className="space-y-1">
                        {searchResults.placement_drives.map(d => (
                          <div
                            key={d.id}
                            onClick={() => {
                              if (onNavigate) onNavigate('placements');
                              setShowSearchResults(false);
                            }}
                            className="p-2 rounded-lg hover:bg-amber-50 cursor-pointer flex items-center justify-between transition"
                          >
                            <div>
                              <div className="font-semibold text-slate-900">{d.company_name}</div>
                              <span className="text-[11px] text-slate-500">{d.job_role}</span>
                            </div>
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                              Drive
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certificates Group (Admin) */}
                  {searchResults.certificates?.length > 0 && (
                    <div className="border-t border-slate-100 pt-2">
                      <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Certificates ({searchResults.certificates.length})
                      </div>
                      <div className="space-y-1">
                        {searchResults.certificates.map(cert => (
                          <div
                            key={cert.id}
                            onClick={() => {
                              if (onNavigate) onNavigate('certificates');
                              setShowSearchResults(false);
                            }}
                            className="p-2 rounded-lg hover:bg-purple-50 cursor-pointer flex items-center justify-between transition"
                          >
                            <div>
                              <div className="font-semibold text-slate-900">{cert.student_name}</div>
                              <span className="text-[11px] text-slate-500 font-mono">{cert.certificate_no}</span>
                            </div>
                            <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded">
                              {cert.type}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Quick Role Switcher, Notification Bell, User Profile Dropdown */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Role Badge */}
          <div className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${currentRole.color}`}>
            <RoleIcon className="w-3.5 h-3.5" />
            <span>{currentRole.label}</span>
          </div>

          {/* Quick Role Switcher Button */}
          <button
            onClick={onSwitchRoleClick}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 shadow-2xs transition-colors cursor-pointer"
            title="Switch demo roles (Super Admin, Principal, Faculty, Student)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Role Switcher</span>
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
            </button>

            {/* Notification Dropdown Panel */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-scale-up text-left">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900">Campus Notifications</h4>
                  <span className="text-[10px] text-blue-600 font-semibold cursor-pointer">Mark all read</span>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="p-2 rounded-lg bg-blue-50/60 border border-blue-100">
                    <p className="font-semibold text-slate-900">Odd Sem Mid-Term Exams</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Commencing from Oct 15, 2026. Schedule published.</p>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-50/60 border border-amber-100">
                    <p className="font-semibold text-slate-900">Tata Motors Campus Drive</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Eligible B.Tech CSE/ME/EEE batches apply before Friday.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="pl-1 border-l border-slate-200">
            <Dropdown
              align="right"
              items={userMenuItems}
              trigger={
                <button className="flex items-center space-x-2 p-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer select-none">
                  <Avatar
                    src={user?.avatar}
                    name={user?.name || 'User'}
                    size="sm"
                    status="online"
                  />
                  <div className="hidden xl:block text-left">
                    <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[130px]">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate max-w-[130px]">
                      {user?.department || 'RVSCET JSR'}
                    </p>
                  </div>
                </button>
              }
            />
          </div>
        </div>
      </div>
    </header>
  );
}
