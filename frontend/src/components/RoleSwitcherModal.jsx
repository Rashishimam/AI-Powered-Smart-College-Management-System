import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Building2, BookOpen, UserCheck, X, ArrowRight } from 'lucide-react';

const accounts = [
  {
    role: 'super_admin',
    name: 'RVS Trust Board',
    email: 'superadmin@rvscet.ac.in',
    password: 'Admin@123',
    title: 'Super Admin',
    desc: 'Multi-branch governance, system telemetry, and audit logs',
    color: 'from-rose-500/20 to-purple-500/20 border-rose-500/40 text-rose-400',
    icon: ShieldCheck
  },
  {
    role: 'college_admin',
    name: 'Prof. (Dr.) Rajesh Kumar Tiwari',
    email: 'admin@rvscet.ac.in',
    password: 'Admin@123',
    title: 'College Admin',
    desc: 'Students, Faculty, Departments, Exams, Fees, Placements',
    color: 'from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-400',
    icon: Building2
  },
  {
    role: 'director',
    name: 'Dr. R. N. Gupta',
    email: 'director@rvscet.ac.in',
    password: 'Director@123',
    title: 'Director / Dean',
    desc: 'Students Overview, Faculty Overview, Performance, Placement Overview',
    color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/40 text-purple-400',
    icon: Building2
  },
  {
    role: 'hod',
    name: 'Prof. Jeevan Kumar',
    email: 'hod.cse@rvscet.ac.in',
    password: 'Hod@123',
    title: 'HOD (Dept. Head)',
    desc: 'Dept Students, Dept Faculty, Attendance, Results, Timetable, Reports',
    color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/40 text-blue-400',
    icon: BookOpen
  },
  {
    role: 'faculty',
    name: 'Prof. Rajesh Sharma',
    email: 'faculty.cse@rvscet.ac.in',
    password: 'Faculty@123',
    title: 'Faculty Member',
    desc: 'My Profile, My Classes, Attendance, Assignments, Internal Marks',
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-400',
    icon: BookOpen
  },
  {
    role: 'student',
    name: 'Rahul Kumar Verma',
    email: 'student.rvs@rvscet.ac.in',
    password: 'Student@123',
    title: 'Enrolled Student',
    desc: 'My Profile, Attendance, Timetable, Assignments, Exams, Fees, Library',
    color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-cyan-400',
    icon: UserCheck
  }
];

export default function RoleSwitcherModal({ isOpen, onClose }) {
  const { login, user: currentUser } = useAuth();

  if (!isOpen) return null;

  const handleSelect = async (acc) => {
    try {
      await login(acc.email, acc.password);
      onClose();
    } catch (err) {
      console.error('Failed to switch role:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white">Switch Role Demo Session</h2>
            <p className="text-xs text-slate-400 mt-1">
              Select any role below to instantly authenticate and inspect its custom dashboard.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {accounts.map((acc) => {
            const Icon = acc.icon;
            const isCurrent = currentUser?.role === acc.role;
            return (
              <button
                key={acc.role}
                onClick={() => handleSelect(acc)}
                className={`text-left p-4 rounded-2xl border transition-all duration-200 relative group bg-gradient-to-br ${acc.color} hover:scale-[1.02] ${
                  isCurrent ? 'ring-2 ring-indigo-400 border-indigo-400' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-white/5">
                    <Icon className="w-5 h-5" />
                  </div>
                  {isCurrent ? (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500 text-white">
                      Active
                    </span>
                  ) : (
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  )}
                </div>

                <div className="mt-3">
                  <h4 className="font-semibold text-white text-sm">{acc.title}</h4>
                  <p className="text-xs text-slate-300 font-medium">{acc.name}</p>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{acc.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
