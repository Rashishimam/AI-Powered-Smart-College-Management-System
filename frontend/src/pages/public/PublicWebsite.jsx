import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import RVSLogo from '../../components/RVSLogo';
import { RVS_CONFIG } from '../../config/rvsConfig';
import PublicVerificationPage from '../rvs/PublicVerificationPage';
import {
  GraduationCap,
  Building2,
  Users,
  Award,
  BookOpen,
  Briefcase,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe,
  ArrowRight,
  Search,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Lock,
  Menu,
  X,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Send,
  Download
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';

export default function PublicWebsite({ onOpenLogin }) {
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [programs, setPrograms] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [notices, setNotices] = useState([]);
  const [cmsContent, setCmsContent] = useState(null);
  const [searchFaculty, setSearchFaculty] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  // Admission Form State
  const [admissionForm, setAdmissionForm] = useState({
    applicant_name: '',
    email: '',
    phone: '',
    program_code: 'BTECH-CSE',
    department_code: 'CSE',
    marks_12th_or_diploma: '',
    entrance_exam: 'JEE Main'
  });
  const [admissionSubmitting, setAdmissionSubmitting] = useState(false);
  const [admissionSuccess, setAdmissionSuccess] = useState(null);
  const [admissionError, setAdmissionError] = useState('');

  useEffect(() => {
    // Load public datasets
    const loadPublicData = async () => {
      try {
        const [progRes, facRes, notRes, cmsRes] = await Promise.all([
          api.get('/rvs/programs').catch(() => ({ data: { programs: [] } })),
          api.get('/rvs/faculty/public').catch(() => ({ data: { faculty: [] } })),
          api.get('/rvs/notices?category=all').catch(() => ({ data: { notices: [] } })),
          api.get('/rvs/cms/content').catch(() => ({ data: { content: null } }))
        ]);

        if (progRes.data?.programs?.length > 0) setPrograms(progRes.data.programs);
        if (facRes.data?.faculty?.length > 0) setFaculty(facRes.data.faculty);
        if (notRes.data?.notices?.length > 0) setNotices(notRes.data.notices);
        if (cmsRes.data?.content) setCmsContent(cmsRes.data.content);
      } catch (err) {
        console.warn('Using local configuration for public website data:', err.message);
      }
    };

    loadPublicData();
  }, []);

  const handleAdmissionSubmit = async (e) => {
    e.preventDefault();
    setAdmissionSubmitting(true);
    setAdmissionError('');
    setAdmissionSuccess(null);

    try {
      const res = await api.post('/rvs/admissions/apply', admissionForm);
      if (res.data?.success) {
        setAdmissionSuccess(res.data);
        setAdmissionForm({
          applicant_name: '',
          email: '',
          phone: '',
          program_code: 'BTECH-CSE',
          department_code: 'CSE',
          marks_12th_or_diploma: '',
          entrance_exam: 'JEE Main'
        });
      }
    } catch (err) {
      setAdmissionError(err.response?.data?.message || 'Submission failed. Please check details.');
    } finally {
      setAdmissionSubmitting(false);
    }
  };

  const filteredFaculty = faculty.filter(f => {
    const q = searchFaculty.toLowerCase();
    const matchQuery = (f.name || '').toLowerCase().includes(q) ||
      (f.designation || '').toLowerCase().includes(q) ||
      (f.department_name || '').toLowerCase().includes(q);
    const matchDept = selectedDept === 'ALL' || f.department_code === selectedDept;
    return matchQuery && matchDept;
  });

  const scrollToSection = (id) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Banner with Affiliations & Contact */}
      <div className="bg-[#071324] text-slate-300 py-1.5 px-4 sm:px-8 text-xs border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="text-amber-400 font-semibold">AICTE Approved</span>
            <span>&bull;</span>
            <span>Affiliated to JUT Ranchi & Kolhan University</span>
            <span className="hidden md:inline">&bull;</span>
            <span className="hidden md:inline">Estd. 1993</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-amber-400" />
              7033000777 / 9110969068
            </span>
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3 text-amber-400" />
              info@rvscet.com
            </span>
            <button
              onClick={() => setShowVerifyModal(true)}
              className="text-amber-400 hover:text-amber-300 font-medium underline flex items-center gap-1 cursor-pointer"
            >
              <ShieldCheck className="w-3 h-3" />
              Verify Certificate
            </button>
          </div>
        </div>
      </div>

      {/* Main Header & Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection('home')}>
            <RVSLogo size="sm" showText={false} subtitle={false} />
            <div>
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-blue-950 font-sans leading-tight">
                RVS College of Engineering & Technology
              </h1>
              <p className="text-[11px] text-amber-600 font-bold tracking-wider uppercase">
                Jamshedpur &bull; NAAC Accredited &bull; AICTE Approved
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-700">
            <button onClick={() => scrollToSection('home')} className="hover:text-blue-900 cursor-pointer">Home</button>
            <button onClick={() => scrollToSection('about')} className="hover:text-blue-900 cursor-pointer">About</button>
            <button onClick={() => scrollToSection('programs')} className="hover:text-blue-900 cursor-pointer">Programs</button>
            <button onClick={() => scrollToSection('admissions')} className="hover:text-blue-900 cursor-pointer">Admissions</button>
            <button onClick={() => scrollToSection('placements')} className="hover:text-blue-900 cursor-pointer">Placements</button>
            <button onClick={() => scrollToSection('faculty')} className="hover:text-blue-900 cursor-pointer">Faculty</button>
            <button onClick={() => scrollToSection('notices')} className="hover:text-blue-900 cursor-pointer">Notices</button>
            <button onClick={() => scrollToSection('contact')} className="hover:text-blue-900 cursor-pointer">Contact</button>
          </nav>

          {/* Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              icon={Lock}
              onClick={onOpenLogin}
              className="bg-blue-900 hover:bg-blue-800 font-bold shadow-sm"
            >
              ERP Portal Login
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-700 hover:text-blue-900 focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3 text-sm font-semibold text-slate-800">
            <div className="flex flex-col gap-2">
              <button onClick={() => scrollToSection('home')} className="text-left py-1 hover:text-blue-900">Home</button>
              <button onClick={() => scrollToSection('about')} className="text-left py-1 hover:text-blue-900">About</button>
              <button onClick={() => scrollToSection('programs')} className="text-left py-1 hover:text-blue-900">Programs & Degrees</button>
              <button onClick={() => scrollToSection('admissions')} className="text-left py-1 hover:text-blue-900">Admissions 2026</button>
              <button onClick={() => scrollToSection('placements')} className="text-left py-1 hover:text-blue-900">Placements</button>
              <button onClick={() => scrollToSection('faculty')} className="text-left py-1 hover:text-blue-900">Faculty Directory</button>
              <button onClick={() => scrollToSection('notices')} className="text-left py-1 hover:text-blue-900">Notices & Circulars</button>
              <button onClick={() => scrollToSection('contact')} className="text-left py-1 hover:text-blue-900">Contact</button>
            </div>
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Button
                variant="primary"
                size="md"
                icon={Lock}
                onClick={onOpenLogin}
                className="w-full justify-center bg-blue-900 font-bold"
              >
                Sign In to ERP Portal
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="home" className="relative bg-gradient-to-br from-[#0a192f] via-[#0d2244] to-[#071324] text-white py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-900/60 border border-blue-600/40 text-blue-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>30+ Years of Academic & Technical Leadership</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                {cmsContent?.bannerHeadline || 'Engineering Minds, Shaping the Future.'}
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
                {cmsContent?.bannerSubtitle || 'RVS College of Engineering & Technology (RVSCET), Jamshedpur is a premier engineering institution approved by AICTE, New Delhi and affiliated to Jharkhand University of Technology (JUT), Ranchi.'}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  variant="gold"
                  size="lg"
                  icon={ArrowRight}
                  onClick={() => scrollToSection('admissions')}
                  className="font-bold shadow-lg"
                >
                  Apply for Admissions 2026
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  icon={BookOpen}
                  onClick={() => scrollToSection('programs')}
                  className="border-slate-400 text-slate-100 hover:bg-white/10 font-bold"
                >
                  Explore Programs
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  icon={Lock}
                  onClick={onOpenLogin}
                  className="bg-white/10 text-white hover:bg-white/20 border border-white/20 font-bold"
                >
                  ERP Login
                </Button>
              </div>

              {/* Accreditations Strip */}
              <div className="pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <p className="text-slate-400">Approval</p>
                  <p className="font-bold text-white text-sm">AICTE New Delhi</p>
                </div>
                <div>
                  <p className="text-slate-400">Affiliation</p>
                  <p className="font-bold text-white text-sm">JUT Ranchi</p>
                </div>
                <div>
                  <p className="text-slate-400">Campus</p>
                  <p className="font-bold text-white text-sm">30+ Acres, NH-33</p>
                </div>
                <div>
                  <p className="text-slate-400">Top Recruiters</p>
                  <p className="font-bold text-amber-400 text-sm">Tata Steel, TCS, Vedanta</p>
                </div>
              </div>
            </div>

            {/* Hero Quick Stat Card */}
            <div className="lg:col-span-5">
              <div className="bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-white/20 shadow-2xl space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-white/15">
                  <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Key Institutional Highlights</h3>
                    <p className="text-xs text-slate-300">Verified official campus telemetry</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                    <p className="text-2xl sm:text-3xl font-black text-amber-400">86%</p>
                    <p className="text-xs text-slate-300 mt-1">Placement Conversion</p>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                    <p className="text-2xl sm:text-3xl font-black text-sky-400">₹9.0 LPA</p>
                    <p className="text-xs text-slate-300 mt-1">Highest Package</p>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                    <p className="text-2xl sm:text-3xl font-black text-emerald-400">46+</p>
                    <p className="text-xs text-slate-300 mt-1">Ph.D / M.Tech Faculty</p>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                    <p className="text-2xl sm:text-3xl font-black text-rose-400">25,000+</p>
                    <p className="text-xs text-slate-300 mt-1">Library Volumes</p>
                  </div>
                </div>

                {cmsContent?.campusAlert && (
                  <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0"></span>
                    <span>{cmsContent.campusAlert}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About RVSCET */}
      <section id="about" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-4">
              <Badge variant="primary" size="sm">About RVSCET Jamshedpur</Badge>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Pioneering Engineering Education in Jharkhand
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                R.V.S. Educational Trust established RVS College of Engineering & Technology in 1993 with a commitment to provide world-class technical education to students across Eastern India.
              </p>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Located on NH-33 in Edalbera, Bhilai Pahari, Jamshedpur, the campus sprawls across lush green grounds equipped with advanced high-performance computing clusters, specialized mechanical workshops, civil surveying apparatus, robotics stations, and IEEE/DELNET e-libraries.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Approved by AICTE</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Affiliated to JUT Ranchi</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>NAAC Accredited</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Industry-Aligned Pedagogy</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <Building2 className="w-8 h-8 text-blue-900 mb-2" />
                <h4 className="font-bold text-slate-900">Modern Infrastructure</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  State-of-the-art academic blocks, Wi-Fi enabled campus, air-conditioned seminar halls, and smart multimedia classrooms.
                </p>
              </div>
              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <Users className="w-8 h-8 text-amber-600 mb-2" />
                <h4 className="font-bold text-slate-900">Distinguished Faculty</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Faculty members from premier institutes with extensive industrial experience and research publications in international journals.
                </p>
              </div>
              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <Briefcase className="w-8 h-8 text-emerald-600 mb-2" />
                <h4 className="font-bold text-slate-900">Placement Record</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Active Training & Placement Cell coordinating annual campus drives with global manufacturing and software leaders.
                </p>
              </div>
              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <BookOpen className="w-8 h-8 text-rose-600 mb-2" />
                <h4 className="font-bold text-slate-900">Central E-Library</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Over 25,000 volumes, automated RFID borrowing, DELNET union catalog, and subscription to IEEE Xplore digital library.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Academic Programs & Departments */}
      <section id="programs" className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <Badge variant="primary" size="sm">Academic Degrees & Intake</Badge>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Undergraduate & Postgraduate Programs
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              Official degree programs approved by AICTE, New Delhi and affiliated to Jharkhand University of Technology (JUT), Ranchi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(programs.length > 0 ? programs : RVS_CONFIG.departments.map((d, i) => ({
              id: i + 1,
              code: d.code,
              name: d.name,
              degree: 'B.Tech (UG)',
              duration_years: 4,
              intake_seats: d.intake || 60,
              eligibility: '10+2 with Physics, Mathematics & Chemistry (Min 45%)'
            }))).map((prog) => (
              <div
                key={prog.code || prog.id}
                className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md hover:border-blue-900/30 transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md bg-blue-900 text-white font-mono text-xs font-bold">
                      {prog.code}
                    </span>
                    <Badge variant="outline" size="sm">
                      {prog.degree || 'B.Tech'}
                    </Badge>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-900 transition-colors">
                    {prog.name}
                  </h3>

                  <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-200">
                    <p className="flex items-center justify-between">
                      <span className="text-slate-500">Duration:</span>
                      <span className="font-semibold text-slate-800">{prog.duration_years || 4} Years ({(prog.duration_years || 4) * 2} Semesters)</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-slate-500">Approved Intake:</span>
                      <span className="font-bold text-blue-900">{prog.intake_seats || 60} Seats</span>
                    </p>
                    <p className="text-[11px] text-slate-500 pt-1">
                      <strong className="text-slate-700">Eligibility:</strong> {prog.eligibility || '10+2 with PCM (Min 45%)'}
                    </p>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-200/80">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-center text-blue-900 font-bold group-hover:bg-blue-900 group-hover:text-white transition-all"
                    onClick={() => {
                      setAdmissionForm(prev => ({
                        ...prev,
                        program_code: prog.code,
                        department_code: prog.department_code || prog.code
                      }));
                      scrollToSection('admissions');
                    }}
                  >
                    Apply for this Program &rarr;
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Admissions 2026 Inquiry Section */}
      <section id="admissions" className="py-16 sm:py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-6 space-y-6">
              <Badge variant="gold" size="sm">Admissions Open 2026-2027</Badge>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                Begin Your Engineering Journey at RVSCET
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Direct admissions and counseling quota admissions are open for eligible students. Submit your inquiry to receive a call from our admissions directorate and reserve your seat.
              </p>

              <div className="space-y-4 text-xs text-slate-300">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="p-2 rounded-lg bg-blue-600/30 text-sky-400 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Eligibility Criteria (UG)</h4>
                    <p className="mt-0.5 text-slate-400">10+2 with Physics, Mathematics, and Chemistry/Computer Science with minimum 45% aggregate (40% for reserved categories).</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Entrance Pathways</h4>
                    <p className="mt-0.5 text-slate-400">Valid scores in JEE Main, JCECEB state engineering counseling, or direct institutional merit evaluation.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Admissions Desk Direct Lines</h4>
                    <p className="mt-0.5 text-slate-400">Campus Helpline: 7033000777 / 9110969068 &bull; Email: admission@rvscet.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Admission Inquiry Form */}
            <div className="lg:col-span-6 bg-white text-slate-900 p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-1">
                Online Admission Application
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Fill the form below to receive your official application tracking number.
              </p>

              {admissionSuccess ? (
                <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-emerald-900 text-lg">Application Submitted!</h4>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    {admissionSuccess.message}
                  </p>
                  <div className="p-3 bg-white rounded-lg border border-emerald-300 font-mono text-xs font-bold text-slate-900">
                    Application ID: {admissionSuccess.application?.application_no}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAdmissionSuccess(null)}
                    className="mt-2"
                  >
                    Submit Another Application
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleAdmissionSubmit} className="space-y-4 text-xs">
                  {admissionError && (
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                      {admissionError}
                    </div>
                  )}

                  <Input
                    label="Applicant Full Name"
                    required
                    value={admissionForm.applicant_name}
                    onChange={(e) => setAdmissionForm({ ...admissionForm, applicant_name: e.target.value })}
                    placeholder="e.g. Adarsh Sharma"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Email Address"
                      type="email"
                      required
                      value={admissionForm.email}
                      onChange={(e) => setAdmissionForm({ ...admissionForm, email: e.target.value })}
                      placeholder="e.g. applicant@gmail.com"
                    />
                    <Input
                      label="Contact Mobile"
                      type="tel"
                      required
                      value={admissionForm.phone}
                      onChange={(e) => setAdmissionForm({ ...admissionForm, phone: e.target.value })}
                      placeholder="e.g. 9876543210"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Target Department</label>
                      <select
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-900"
                        value={admissionForm.department_code}
                        onChange={(e) => setAdmissionForm({ ...admissionForm, department_code: e.target.value })}
                      >
                        <option value="CSE">Computer Science (CSE)</option>
                        <option value="AIML">CSE (AI & Machine Learning)</option>
                        <option value="CE">Civil Engineering (CE)</option>
                        <option value="ME">Mechanical Engineering (ME)</option>
                        <option value="ECE">Electronics & Comm (ECE)</option>
                        <option value="EEE">Electrical & Electronics (EEE)</option>
                        <option value="MCA">Master of Comp Applications (MCA)</option>
                      </select>
                    </div>

                    <Input
                      label="12th / Diploma %"
                      type="number"
                      step="0.1"
                      value={admissionForm.marks_12th_or_diploma}
                      onChange={(e) => setAdmissionForm({ ...admissionForm, marks_12th_or_diploma: e.target.value })}
                      placeholder="e.g. 84.5"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    loading={admissionSubmitting}
                    className="w-full justify-center bg-blue-900 font-bold py-2.5"
                    icon={Send}
                  >
                    Submit Official Application
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Training & Placements Section */}
      <section id="placements" className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <Badge variant="gold" size="sm">Corporate Relations & Placements</Badge>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Top Corporate Recruiters & Campus Drives
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              Our dedicated Training & Placement Cell prepares students through industry bootcamps, technical mock interviews, and live coding hackathons.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            {['Tata Steel', 'TCS', 'Vedanta', 'Capgemini', 'Wipro', 'Infosys'].map((recruiter) => (
              <div key={recruiter} className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col items-center justify-center hover:border-blue-900/40 transition-all">
                <Briefcase className="w-6 h-6 text-blue-900 mb-2" />
                <p className="font-bold text-slate-900 text-sm">{recruiter}</p>
                <p className="text-[11px] text-slate-500">Campus Partner</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold">Want to recruit from RVS CET Jamshedpur?</h3>
              <p className="text-xs sm:text-sm text-blue-200 max-w-xl">
                Contact our Training & Placement Directorate for corporate campus drives, intern hiring, and sponsored hackathons.
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-3">
              <Button
                variant="gold"
                size="md"
                className="font-bold shadow-md"
                onClick={() => scrollToSection('contact')}
              >
                Contact T&P Cell
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Faculty Directory (Public & Non-Sensitive) */}
      <section id="faculty" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <Badge variant="primary" size="sm">Academic Faculty Council</Badge>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Public Faculty Directory
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              Explore profiles of our academic faculty, heads of departments, and professors across engineering disciplines.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search faculty name or title..."
                value={searchFaculty}
                onChange={(e) => setSearchFaculty(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-slate-500">Department:</span>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-900"
              >
                <option value="ALL">All Departments</option>
                <option value="CSE">Computer Science (CSE)</option>
                <option value="CE">Civil Engineering (CE)</option>
                <option value="ME">Mechanical Engineering (ME)</option>
                <option value="ECE">Electronics & Comm (ECE)</option>
                <option value="EEE">Electrical & Electronics (EEE)</option>
                <option value="MCA">MCA Department</option>
              </select>
            </div>
          </div>

          {/* Faculty Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredFaculty.length > 0 ? (
              filteredFaculty.slice(0, 8).map((fac) => (
                <div key={fac.id} className="bg-white rounded-2xl border border-slate-200 p-5 text-center flex flex-col items-center hover:shadow-md transition-all">
                  <div className="w-20 h-20 rounded-full overflow-hidden mb-3 border-2 border-slate-100 shadow-xs bg-slate-100 flex items-center justify-center">
                    {fac.profile_photo ? (
                      <img src={fac.profile_photo} alt={fac.name} className="w-full h-full object-cover" />
                    ) : (
                      <GraduationCap className="w-8 h-8 text-slate-400" />
                    )}
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{fac.name}</h4>
                  <p className="text-xs text-blue-900 font-semibold mt-0.5">{fac.designation}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{fac.department_name}</p>
                  <p className="text-[10px] text-slate-400 mt-2 line-clamp-1">{fac.qualification || 'M.Tech / Ph.D'}</p>
                  <div className="mt-3 pt-3 border-t border-slate-100 w-full flex items-center justify-center gap-1 text-[11px] text-emerald-700 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Faculty</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-slate-500 text-xs">
                No faculty members found matching your filter criteria.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Public Notices & Circulars */}
      <section id="notices" className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <Badge variant="primary" size="sm">Electronic Notice Board</Badge>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Official Campus Circulars & Notifications
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              Real-time circulars from Jharkhand University of Technology (JUT) and RVSCET academic secretariat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notices.slice(0, 6).map((not) => (
              <div key={not.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant={not.priority === 'urgent' ? 'danger' : 'primary'} size="sm">
                      {not.category || 'Academic'}
                    </Badge>
                    <span className="text-[11px] text-slate-400">
                      {not.created_at ? new Date(not.created_at).toLocaleDateString('en-IN') : 'Recent'}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm leading-snug">{not.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{not.content}</p>
                </div>
                <div className="pt-3 border-t border-slate-200 text-xs text-blue-900 font-semibold flex items-center justify-between">
                  <span>Official Circular</span>
                  <span className="text-[11px] text-slate-500">RVSCET Dean Office</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & Map Section */}
      <section id="contact" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <Badge variant="primary" size="sm">Campus Directorate & Helpdesk</Badge>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Connect with RVS College of Engineering & Technology
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              Visit our NH-33 campus or reach out via official communications lines.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="p-3 w-fit bg-blue-50 text-blue-900 rounded-xl">
                <MapPin className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Campus Location</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Edalbera, P.O. Bhilai Pahari, NH-33, Jamshedpur - 831012, Jharkhand, India
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="p-3 w-fit bg-amber-50 text-amber-600 rounded-xl">
                <Phone className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Telephone & Helpline</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Admissions: 7033000777 / 9110969068<br />
                Campus Office: 0657-2363061 / 2363062<br />
                Training & Placements: +91 94311 12345
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="p-3 w-fit bg-emerald-50 text-emerald-600 rounded-xl">
                <Mail className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Official Electronic Mail</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                General Inquiries: info@rvscet.com<br />
                Admissions: admission@rvscet.com<br />
                Training & Placement: placement@rvscet.com
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#071324] text-slate-400 py-12 px-4 sm:px-8 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <RVSLogo size="xs" showText={false} variant="light" />
            <div>
              <p className="font-bold text-white text-sm">
                RVS College of Engineering & Technology, Jamshedpur
              </p>
              <p className="text-[11px] text-slate-400">
                Approved by AICTE, New Delhi &bull; Affiliated to JUT Ranchi &bull; Estd. 1993
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <button onClick={() => setShowVerifyModal(true)} className="hover:text-amber-400 underline">
              Verify Certificate
            </button>
            <span>&bull;</span>
            <button onClick={onOpenLogin} className="hover:text-white underline font-semibold text-blue-300">
              ERP Sign In
            </button>
          </div>
        </div>
      </footer>

      {/* Public Certificate Verification Modal */}
      {showVerifyModal && (
        <Modal
          isOpen={showVerifyModal}
          onClose={() => setShowVerifyModal(false)}
          title="Cryptographic Public Certificate Verification"
          size="lg"
        >
          <PublicVerificationPage onClose={() => setShowVerifyModal(false)} />
        </Modal>
      )}
    </div>
  );
}
