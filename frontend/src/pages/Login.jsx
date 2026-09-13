import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import RVSLogo from '../components/RVSLogo';
import { RVS_CONFIG } from '../config/rvsConfig';
import { 
  Lock, 
  Mail, 
  ShieldCheck, 
  Building2, 
  BookOpen, 
  UserCheck, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Sparkles,
  MapPin,
  Phone,
  Globe,
  Award,
  CheckCircle2,
  GraduationCap
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const demoCredentials = [
  {
    role: 'super_admin',
    label: 'Trust Board Admin',
    email: 'superadmin@rvscet.ac.in',
    password: 'Admin@123',
    icon: ShieldCheck,
    badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
    desc: 'Trust Secretariat & Governance'
  },
  {
    role: 'college_admin',
    label: 'Principal / Admin',
    email: 'admin@rvscet.ac.in',
    password: 'Admin@123',
    icon: Building2,
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    desc: 'Prof. (Dr.) R. K. Tiwari'
  },
  {
    role: 'faculty',
    label: 'Faculty / HOD',
    email: 'faculty.cse@rvscet.ac.in',
    password: 'Faculty@123',
    icon: BookOpen,
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    desc: 'Prof. Jeevan Kumar (CSE)'
  },
  {
    role: 'student',
    label: 'RVS Student',
    email: 'student.rvs@rvscet.ac.in',
    password: 'Student@123',
    icon: UserCheck,
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
    desc: 'Rahul Verma (B.Tech CSE)'
  }
];

export default function Login({ onBackToWebsite }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@rvscet.ac.in');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'User ID or Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email) && !email.includes('.')) {
      errs.email = 'Please enter a valid academic email or ID';
    }
    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 4) {
      errs.password = 'Password must be at least 4 characters';
    }
    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validate()) return;
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demo) => {
    setEmail(demo.email);
    setPassword(demo.password);
    setValidationErrors({});
    setError('');
    setLoading(true);
    login(demo.email, demo.password)
      .catch((err) => {
        setError(err.response?.data?.message || err.message || 'Authentication failed.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 font-sans">
      {/* ========================================================================= */}
      {/* LEFT SIDE: Academic Identity & Visual Branding (Deep Navy & Subtle Gold) */}
      {/* ========================================================================= */}
      <div className="lg:w-1/2 bg-gradient-to-br from-[#0a192f] via-[#0f2347] to-[#0d1b38] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Background decorative patterns */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        {/* Top Header: Logo + College Title */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <RVSLogo size="lg" variant="light" showText={false} subtitle={false} />
          </div>
          <div className="mt-4 border-l-2 border-amber-400/80 pl-3">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
              RVS College of Engineering & Technology
            </h2>
            <p className="text-xs text-amber-400 font-semibold tracking-wider uppercase mt-0.5">
              Jamshedpur &bull; Estd. 1993
            </p>
          </div>
        </div>

        {/* Center: System Identity & Campus Highlights */}
        <div className="my-10 relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-700/50 text-blue-300 text-xs font-semibold mb-4">
            <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
            <span>Official Campus ERP Gateway</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            Smart Campus <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-sky-300">
              Management System
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base mt-4 leading-relaxed font-normal">
            Unified academic and administrative operations platform powering admissions, attendance, examinations, fee collection, central library, and training & placements.
          </p>

          {/* Academic Accreditations Badges */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="p-2 rounded-lg bg-blue-600/30 text-sky-400 shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white">AICTE Approved</p>
                <p className="text-[11px] text-slate-400">Govt. of India, New Delhi</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white">Affiliated to JUT Ranchi</p>
                <p className="text-[11px] text-slate-400">Kolhan Univ. / NAAC Accredited</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Contact & Verified Location */}
        <div className="relative z-10 pt-6 border-t border-slate-800 text-xs text-slate-400 space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Edalbera, P.O. Bhilai Pahari, NH-33, Jamshedpur - 831012</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>7033000777 / 9110969068</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <a href={RVS_CONFIG.website} target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">
                www.rvscollege.ac.in
              </a>
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT SIDE: Premium Modern Light Login Card & Quick Access */}
      {/* ========================================================================= */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 p-7 sm:p-9">
            {onBackToWebsite && (
              <button
                type="button"
                onClick={onBackToWebsite}
                className="mb-4 text-xs font-bold text-blue-900 hover:text-blue-700 flex items-center gap-1.5 cursor-pointer"
              >
                <span>&larr;</span> Back to RVS College Website
              </button>
            )}

            {/* Header */}
            <div className="text-left mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-700 animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900">
                  RVS Secure ERP Portal
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight font-sans">
                Welcome Back
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Sign in with your institutional credentials to access your dashboard.
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2 animate-shake">
                <div className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Institutional Email / User ID"
                id="login-email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. admin@rvscet.ac.in"
                icon={Mail}
                error={validationErrors.email}
                required
              />

              <Input
                label="Password"
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                icon={Lock}
                endIcon={showPassword ? EyeOff : Eye}
                onEndIconClick={() => setShowPassword(!showPassword)}
                error={validationErrors.password}
                required
              />

              {/* Options: Remember me & Forgot password */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <label className="flex items-center gap-2 text-slate-600 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-900 focus:ring-blue-700 cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => alert('For password resets, please contact the RVSCET IT Cell / System Administrator at info@rvscet.com.')}
                  className="font-semibold text-blue-900 hover:text-blue-700 hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {/* Sign In Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={loading}
                  className="w-full font-bold py-2.5 text-sm"
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  Sign In to ERP
                </Button>
              </div>
            </form>

            {/* Quick Demo Credentials */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>1-Click Demo Logins:</span>
                </p>
                <span className="text-[10px] text-slate-400">Click to switch & test</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {demoCredentials.map((demo) => {
                  const Icon = demo.icon;
                  const isSelected = email === demo.email;
                  return (
                    <button
                      key={demo.role}
                      type="button"
                      onClick={() => handleQuickLogin(demo)}
                      className={`
                        p-2.5 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between cursor-pointer
                        ${isSelected 
                          ? 'border-blue-700 bg-blue-50/70 shadow-2xs ring-1 ring-blue-700' 
                          : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 hover:border-slate-300'
                        }
                      `}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {demo.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">{demo.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-5 text-center text-xs text-slate-400">
            <span>&copy; {new Date().getFullYear()} RVS College of Engineering & Technology, Jamshedpur. All rights reserved.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
