import React from 'react';
import { useAuth } from '../context/AuthContext';
import RVSLogo from './RVSLogo';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  QrCode, 
  Receipt, 
  Award, 
  FileText, 
  Calendar, 
  Briefcase, 
  CreditCard, 
  BookOpen, 
  Megaphone, 
  LifeBuoy,
  Layers,
  FileCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  TrendingUp,
  BarChart3,
  CalendarRange,
  Globe
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  onSelectTab, 
  isOpen, 
  onClose,
  isCollapsed,
  onToggleCollapse
}) {
  const { user } = useAuth();
  const role = user?.role || 'student';

  // Role-specific navigation configurations exactly as requested
  const roleMenuMap = {
    student: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'profile', label: 'My Profile', icon: Users },
      { id: 'attendance', label: 'Attendance', icon: QrCode },
      { id: 'timetable', label: 'Timetable', icon: Calendar },
      { id: 'assignments', label: 'Assignments', icon: FileText },
      { id: 'exams', label: 'Examinations', icon: CreditCard },
      { id: 'results', label: 'Results', icon: Award },
      { id: 'fees', label: 'Fees & Payments', icon: Receipt },
      { id: 'library', label: 'Library', icon: BookOpen },
      { id: 'notices', label: 'Notices', icon: Megaphone },
      { id: 'leave', label: 'Leave Application', icon: LifeBuoy },
      { id: 'placements', label: 'Placements', icon: Briefcase }
    ],
    faculty: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'profile', label: 'My Profile', icon: Users },
      { id: 'my_classes', label: 'My Classes', icon: GraduationCap },
      { id: 'attendance', label: 'Attendance', icon: QrCode },
      { id: 'assignments', label: 'Assignments', icon: FileText },
      { id: 'internal_marks', label: 'Internal Marks', icon: FileCheck },
      { id: 'exams', label: 'Examinations', icon: CreditCard },
      { id: 'student_progress', label: 'Student Progress', icon: TrendingUp },
      { id: 'timetable', label: 'Timetable', icon: Calendar },
      { id: 'notices', label: 'Notices', icon: Megaphone }
    ],
    hod: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'dept_students', label: 'Department Students', icon: Users },
      { id: 'dept_faculty', label: 'Department Faculty', icon: GraduationCap },
      { id: 'attendance', label: 'Attendance', icon: QrCode },
      { id: 'results', label: 'Results', icon: Award },
      { id: 'timetable', label: 'Timetable', icon: Calendar },
      { id: 'reports', label: 'Academic Reports', icon: BarChart3 },
      { id: 'notices', label: 'Notices', icon: Megaphone }
    ],
    admin: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'students', label: 'Students', icon: Users },
      { id: 'faculty', label: 'Faculty', icon: GraduationCap },
      { id: 'departments', label: 'Departments', icon: Layers },
      { id: 'academic_management', label: 'Academic Management', icon: CalendarRange },
      { id: 'exams', label: 'Examinations', icon: CreditCard },
      { id: 'fees', label: 'Fees Management', icon: Receipt },
      { id: 'library', label: 'Library', icon: BookOpen },
      { id: 'placements', label: 'Placements', icon: Briefcase },
      { id: 'notices', label: 'Notices & Events', icon: Megaphone },
      { id: 'reports', label: 'Reports', icon: BarChart3 },
      { id: 'settings', label: 'Settings', icon: Settings },
      { id: 'public_website', label: 'Public College Website', icon: Globe, badge: 'Portal' }
    ],
    director: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'students_overview', label: 'Students Overview', icon: Users },
      { id: 'faculty_overview', label: 'Faculty Overview', icon: GraduationCap },
      { id: 'academic_performance', label: 'Academic Performance', icon: Award },
      { id: 'placement_overview', label: 'Placement Overview', icon: Briefcase },
      { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
      { id: 'notices', label: 'Notices', icon: Megaphone }
    ]
  };

  // Map user role string to key
  let roleKey = 'student';
  if (role === 'super_admin' || role === 'college_admin' || role === 'admin') {
    roleKey = 'admin';
  } else if (role === 'director' || role === 'dean') {
    roleKey = 'director';
  } else if (role === 'hod') {
    roleKey = 'hod';
  } else if (role === 'faculty') {
    roleKey = 'faculty';
  }

  const currentMenuItems = roleMenuMap[roleKey] || roleMenuMap.student;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 z-50 md:z-30 h-screen
          bg-[#0a192f] text-slate-200 border-r border-slate-800
          flex flex-col transition-all duration-300 ease-in-out select-none
          ${isCollapsed ? 'md:w-20' : 'md:w-64'}
          ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Sidebar Header: Official Logo + Collapse Toggle */}
        <div className="h-16 flex items-center justify-between px-3.5 border-b border-slate-800/90 bg-[#071324]">
          <div className="flex items-center gap-2 overflow-hidden">
            <RVSLogo 
              size="sm" 
              showText={false} 
              subtitle={false} 
              variant="light"
              imgContainerClassName={isCollapsed ? 'max-w-[50px]' : 'max-w-[185px]'}
            />
          </div>

          <div className="flex items-center">
            {/* Desktop Collapse Toggle */}
            <button
              onClick={onToggleCollapse}
              className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {/* Mobile Close Button */}
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 md:hidden cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Role Badge Indicator */}
        {!isCollapsed && (
          <div className="px-3.5 py-2 border-b border-slate-800/60 bg-[#050f1d] flex items-center justify-between text-[11px]">
            <span className="font-medium text-slate-400">ROLE PORTAL</span>
            <span className="font-bold text-amber-400 uppercase tracking-wider bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
              {roleKey.toUpperCase()}
            </span>
          </div>
        )}

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1">
          {currentMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onClose) onClose();
                }}
                title={isCollapsed ? item.label : undefined}
                className={`
                  w-full flex items-center rounded-xl text-xs font-semibold transition-all cursor-pointer
                  ${isCollapsed ? 'justify-center p-3' : 'justify-between px-3 py-2.5'}
                  ${isActive
                    ? 'bg-blue-900/80 text-amber-300 border-l-4 border-amber-400 shadow-xs font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border-l-4 border-transparent'
                  }
                `}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  {!isCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </div>

                {!isCollapsed && item.badge && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive 
                      ? 'bg-amber-400 text-slate-950' 
                      : 'bg-slate-800 text-sky-300 border border-slate-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer info in sidebar */}
        <div className="p-3 border-t border-slate-800 bg-[#071324]">
          {!isCollapsed ? (
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-left">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="font-bold text-xs text-slate-200">RVSCET ERP 2026</p>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Approved AICTE &bull; JUT Ranchi</p>
            </div>
          ) : (
            <div className="flex justify-center text-amber-400" title="RVS CET Jamshedpur">
              <Sparkles className="w-4 h-4" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

