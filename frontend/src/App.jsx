import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import RoleSwitcherModal from './components/RoleSwitcherModal';
import RVSLogo from './components/RVSLogo';
import { ToastProvider } from './components/ui/Toast';
import { RVS_CONFIG } from './config/rvsConfig';

// Dashboards
import SuperAdminDashboard from './pages/dashboards/SuperAdminDashboard';
import CollegeAdminDashboard from './pages/dashboards/CollegeAdminDashboard';
import FacultyDashboard from './pages/dashboards/FacultyDashboard';
import StudentDashboard from './pages/dashboards/StudentDashboard';

// RVS Specialized Modules
import StudentManagement from './pages/rvs/StudentManagement';
import FacultyManagement from './pages/rvs/FacultyManagement';
import AttendanceQRModule from './pages/rvs/AttendanceQRModule';
import FeesReceiptModule from './pages/rvs/FeesReceiptModule';
import ProgramsModule from './pages/rvs/ProgramsModule';
import ExamsResultsModule from './pages/rvs/ExamsResultsModule';
import AssignmentsModule from './pages/rvs/AssignmentsModule';
import TimetableModule from './pages/rvs/TimetableModule';
import PlacementModule from './pages/rvs/PlacementModule';
import IDCardsModule from './pages/rvs/IDCardsModule';
import LibraryModule from './pages/rvs/LibraryModule';
import NoticeBoardModule from './pages/rvs/NoticeBoardModule';
import LeaveGrievanceModule from './pages/rvs/LeaveGrievanceModule';

// Upgraded Phase 1-6 Modules
import BacklogManagementModule from './pages/rvs/BacklogManagementModule';
import InternalMarksModule from './pages/rvs/InternalMarksModule';
import AdmitCardModule from './pages/rvs/AdmitCardModule';
import CertificateModule from './pages/rvs/CertificateModule';
import DocumentVerificationModule from './pages/rvs/DocumentVerificationModule';
import LabsInventoryModule from './pages/rvs/LabsInventoryModule';
import FacultySubstitutionModule from './pages/rvs/FacultySubstitutionModule';
import GateVisitorModule from './pages/rvs/GateVisitorModule';
import FacilityBookingModule from './pages/rvs/FacilityBookingModule';
import HostelTransportModule from './pages/rvs/HostelTransportModule';
import AlumniManagementModule from './pages/rvs/AlumniManagementModule';
import HelpdeskModule from './pages/rvs/HelpdeskModule';
import StudentFeedbackModule from './pages/rvs/StudentFeedbackModule';
import StudentPromotionModule from './pages/rvs/StudentPromotionModule';

// Advanced 28 Modules Upgrade - Phase 1
import MentorMenteeModule from './pages/rvs/MentorMenteeModule';
import SyllabusTrackerModule from './pages/rvs/SyllabusTrackerModule';
import FacultyWorkloadModule from './pages/rvs/FacultyWorkloadModule';
import AcademicSessionModule from './pages/rvs/AcademicSessionModule';

// Advanced 28 Modules Upgrade - Phase 2
import ProjectManagementModule from './pages/rvs/ProjectManagementModule';
import InternshipModule from './pages/rvs/InternshipModule';
import TrainingManagementModule from './pages/rvs/TrainingManagementModule';

// Advanced 28 Modules Upgrade - Phase 3
import ScholarshipModule from './pages/rvs/ScholarshipModule';
import NoDuesModule from './pages/rvs/NoDuesModule';
import SemesterRegistrationModule from './pages/rvs/SemesterRegistrationModule';
import WebsiteCMSModule from './pages/rvs/WebsiteCMSModule';
import PublicWebsite from './pages/public/PublicWebsite';

export default function App() {
  const { user, loading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showLoginView, setShowLoginView] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-900/20 border-t-blue-900 rounded-full animate-spin"></div>
          <p className="text-xs text-blue-950 font-semibold tracking-wide">
            Initializing RVS Smart Campus System...
          </p>
        </div>
      </div>
    );
  }

  // Unauthenticated Visitors: Default to Public RVS Website with 1-Click ERP Portal Gateway
  if (!isAuthenticated || !user) {
    return (
      <ToastProvider>
        {showLoginView ? (
          <Login onBackToWebsite={() => setShowLoginView(false)} />
        ) : (
          <PublicWebsite onOpenLogin={() => setShowLoginView(true)} />
        )}
      </ToastProvider>
    );
  }

  // Allowed tabs mapping for RBAC enforcement
  const getRoleKey = (userRole) => {
    if (userRole === 'super_admin' || userRole === 'college_admin' || userRole === 'admin') return 'admin';
    if (userRole === 'director' || userRole === 'dean') return 'director';
    if (userRole === 'hod') return 'hod';
    if (userRole === 'faculty') return 'faculty';
    return 'student';
  };

  const roleKey = getRoleKey(user?.role);

  const allowedTabsMap = {
    student: ['dashboard', 'profile', 'attendance', 'timetable', 'assignments', 'exams', 'results', 'fees', 'library', 'notices', 'leave', 'placements', 'public_website'],
    faculty: ['dashboard', 'profile', 'my_classes', 'attendance', 'assignments', 'internal_marks', 'exams', 'student_progress', 'timetable', 'notices', 'public_website'],
    hod: ['dashboard', 'dept_students', 'dept_faculty', 'attendance', 'results', 'timetable', 'reports', 'notices', 'public_website'],
    admin: ['dashboard', 'students', 'faculty', 'departments', 'academic_management', 'exams', 'fees', 'library', 'placements', 'notices', 'reports', 'settings', 'public_website'],
    director: ['dashboard', 'students_overview', 'faculty_overview', 'academic_performance', 'placement_overview', 'reports', 'notices', 'public_website']
  };

  // Render role-specific dashboard
  const renderRoleDashboard = () => {
    switch (roleKey) {
      case 'admin':
        return user?.role === 'super_admin' 
          ? <SuperAdminDashboard onNavigate={(tab) => setActiveTab(tab)} />
          : <CollegeAdminDashboard onNavigate={(tab) => setActiveTab(tab)} />;
      case 'director':
        return <CollegeAdminDashboard onNavigate={(tab) => setActiveTab(tab)} />;
      case 'hod':
        return <FacultyDashboard onNavigate={(tab) => setActiveTab(tab)} />;
      case 'faculty':
        return <FacultyDashboard onNavigate={(tab) => setActiveTab(tab)} />;
      case 'student':
      default:
        return <StudentDashboard onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  // Render content based on active navigation tab with strict RBAC protection
  const renderContent = () => {
    const allowed = allowedTabsMap[roleKey] || allowedTabsMap.student;

    // RBAC: If tab is not allowed for user role, default to dashboard
    if (!allowed.includes(activeTab)) {
      return renderRoleDashboard();
    }

    switch (activeTab) {
      case 'dashboard':
        return renderRoleDashboard();
      
      // Profiles
      case 'profile':
        return roleKey === 'faculty' 
          ? <FacultyManagement defaultTab="profile" /> 
          : <StudentManagement defaultTab="profile" />;

      // Student Management variants
      case 'students':
      case 'dept_students':
      case 'students_overview':
      case 'my_classes':
        return <StudentManagement />;

      // Faculty Management variants
      case 'faculty':
      case 'dept_faculty':
      case 'faculty_overview':
        return <FacultyManagement />;

      // Academic Management & Departments
      case 'departments':
        return <ProgramsModule />;
      case 'academic_management':
        return <AcademicSessionModule />;

      // Attendance & QR
      case 'attendance':
        return <AttendanceQRModule />;

      // Timetable
      case 'timetable':
        return <TimetableModule />;

      // Assignments
      case 'assignments':
        return <AssignmentsModule />;

      // Evaluation & Marks
      case 'internal_marks':
        return <InternalMarksModule />;
      case 'exams':
        return <ExamsResultsModule defaultTab="exams" />;
      case 'results':
      case 'academic_performance':
        return <ExamsResultsModule defaultTab="results" />;
      case 'student_progress':
        return <StudentPromotionModule />;

      // Fees & Receipts
      case 'fees':
        return <FeesReceiptModule />;

      // Library
      case 'library':
        return <LibraryModule />;

      // Notices & Events
      case 'notices':
        return <NoticeBoardModule />;

      // Leave Application
      case 'leave':
        return <LeaveGrievanceModule defaultTab="leave" />;

      // Placements & Drives
      case 'placements':
      case 'placement_overview':
        return <PlacementModule />;

      // Website CMS & Settings
      case 'settings':
        return <WebsiteCMSModule />;
      
      // Academic Reports & Analytics
      case 'reports':
        return (
          <div className="space-y-6">
            <div className="erp-card bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 rounded-2xl">
              <h1 className="text-xl font-bold">RVS Institutional Reports & Analytics</h1>
              <p className="text-xs text-blue-200 mt-1">
                Official AICTE & JUT Ranchi Academic Performance Telemetry
              </p>
            </div>
            <ExamsResultsModule defaultTab="results" />
          </div>
        );

      // Public Website
      case 'public_website':
        return <PublicWebsite onOpenLogin={() => setActiveTab('dashboard')} />;

      default:
        return renderRoleDashboard();
    }
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-amber-500 selection:text-slate-950">
        {/* Top Navbar */}
        <Navbar 
          activeTab={activeTab}
          onSwitchRoleClick={() => setIsRoleModalOpen(true)} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onNavigate={(tab) => setActiveTab(tab)}
        />

        <div className="flex-1 flex w-full">
          {/* Responsive & Collapsible Sidebar Navigation */}
          <Sidebar
            activeTab={activeTab}
            onSelectTab={(tabId) => setActiveTab(tabId)}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />

          {/* Main ERP Workspace */}
          <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 max-w-[1600px] mx-auto w-full">
            {renderContent()}
          </main>
        </div>

        {/* Footer with Official RVS Accreditation, Affiliation & Logo */}
        <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500 no-print">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <RVSLogo size="xs" showText={false} />
              <div>
                <p className="font-bold text-slate-900">
                  {RVS_CONFIG.name}, Jamshedpur
                </p>
                <p className="text-[11px] text-slate-500">
                  {RVS_CONFIG.systemName} &bull; Official Campus Operations ERP
                </p>
              </div>
            </div>

            <div className="text-center md:text-right text-[11px] text-slate-500 space-y-0.5">
              <p>
                <span className="font-semibold text-slate-700">Affiliation:</span> AICTE Approved &bull; JUT Ranchi / Kolhan University &bull; NAAC Accredited
              </p>
              <p>
                &copy; {new Date().getFullYear()} RVSCET Jamshedpur. Campus Helpline: {RVS_CONFIG.phone} &bull;{' '}
                <a href={RVS_CONFIG.website} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">
                  rvscollege.ac.in
                </a>
              </p>
            </div>
          </div>
        </footer>

        {/* Instant Role Switcher Modal for interactive testing */}
        <RoleSwitcherModal
          isOpen={isRoleModalOpen}
          onClose={() => setIsRoleModalOpen(false)}
        />
      </div>
    </ToastProvider>
  );
}
