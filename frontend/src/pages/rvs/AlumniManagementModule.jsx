import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { RVS_CONFIG } from '../../config/rvsConfig';
import {
  GraduationCap,
  Award,
  Briefcase,
  Building2,
  Calendar,
  Search,
  Plus,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Users,
  RefreshCw,
  X,
  Mail
} from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import StatCard from '../../components/StatCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function AlumniManagementModule() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'super_admin' || user?.role === 'college_admin';

  const [alumniList, setAlumniList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('ALL');
  const [filterYear, setFilterYear] = useState('ALL');
  const [notification, setNotification] = useState('');

  // Transition Modal State
  const [isTransitionModalOpen, setIsTransitionModalOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [transitionFormData, setTransitionFormData] = useState({
    student_id: '',
    graduation_year: new Date().getFullYear(),
    current_organization: '',
    job_title: '',
    higher_studies: '',
    achievements: ''
  });
  const [submittingTransition, setSubmittingTransition] = useState(false);

  const fetchAlumni = async () => {
    setLoading(true);
    try {
      const res = await api.get('/rvs/alumni', {
        params: {
          search: searchQuery,
          department: filterDept,
          graduation_year: filterYear
        }
      });
      if (res.data?.success) {
        setAlumniList(res.data.alumni || []);
      }
    } catch (err) {
      console.error('Failed to load alumni:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumni();
  }, [filterDept, filterYear]);

  // Load graduating candidates for transition modal
  const openTransitionModal = async () => {
    setIsTransitionModalOpen(true);
    try {
      const uRes = await api.get('/users');
      if (uRes.data?.users) {
        setStudents(uRes.data.users.filter(u => u.role === 'student'));
      }
    } catch (e) {}
  };

  const handleTransitionSubmit = async (e) => {
    e.preventDefault();
    setSubmittingTransition(true);
    try {
      const res = await api.post('/rvs/alumni/transition', transitionFormData);
      if (res.data?.success) {
        setNotification(res.data.message);
        setIsTransitionModalOpen(false);
        setTransitionFormData({
          student_id: '',
          graduation_year: new Date().getFullYear(),
          current_organization: '',
          job_title: '',
          higher_studies: '',
          achievements: ''
        });
        fetchAlumni();
        setTimeout(() => setNotification(''), 6000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to transition student to alumni');
    } finally {
      setSubmittingTransition(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-amber-950 via-yellow-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              RVSCET Alumni Association Network
            </span>
            <span className="text-xs text-slate-300">Global Leaders, Researchers & Entrepreneurs</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Alumni Management & Transition
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Seamless graduation transition preserves complete historical academic records while elevating students into the alumni ecosystem.
          </p>
        </div>

        {isAdmin && (
          <Button
            onClick={openTransitionModal}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/30 flex items-center gap-2 whitespace-nowrap self-start md:self-center"
          >
            <GraduationCap className="w-5 h-5" />
            Transition to Alumni
          </Button>
        )}
      </div>

      {notification && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-3 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Distinguished Alumni"
          value={alumniList.length}
          icon={GraduationCap}
          color="amber"
          subtitle="Registered graduates"
        />
        <StatCard
          title="Industry Leaders"
          value="85%"
          icon={Briefcase}
          color="indigo"
          subtitle="Tata Steel, TCS, Schneider, AWS"
        />
        <StatCard
          title="Higher Studies"
          value="15%"
          icon={Award}
          color="emerald"
          subtitle="IITs, NITs & International MS"
        />
        <StatCard
          title="Placement Mentors"
          value={alumniList.length}
          icon={Users}
          color="blue"
          subtitle="Available for student mock drives"
        />
      </div>

      {/* Alumni Directory Cards */}
      <Card>
        <CardHeader
          title="RVSCET Alumni Directory & Career Highlights"
          action={
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search alumni, company, role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchAlumni()}
                  className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 w-48 sm:w-64"
                />
              </div>

              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="ALL">All Departments</option>
                <option value="Computer Science & Engineering">CSE</option>
                <option value="Electronics & Communication">ECE</option>
                <option value="Mechanical Engineering">Mechanical</option>
                <option value="Civil Engineering">Civil</option>
                <option value="Electrical & Electronics">EEE</option>
              </select>

              <button
                onClick={fetchAlumni}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          }
        />

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-3 text-center py-10 text-slate-400 text-sm">
              Loading alumni directory...
            </div>
          ) : alumniList.length === 0 ? (
            <div className="col-span-3 text-center py-10 text-slate-400 text-sm">
              No alumni records match the search criteria.
            </div>
          ) : (
            alumniList.map((a) => (
              <div
                key={a.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 text-white font-bold flex items-center justify-center text-base shadow-sm">
                        {a.name?.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm leading-snug">{a.name}</h4>
                        <span className="text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          Class of {a.graduation_year} ({a.batch})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 mt-2">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="font-semibold text-slate-800">{a.job_title}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="text-slate-700">{a.current_organization}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="text-slate-600 truncate">{a.course}</span>
                    </div>

                    {a.higher_studies && a.higher_studies !== 'None' && (
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-[11px] text-slate-700 mt-2">
                        <strong>Higher Studies:</strong> {a.higher_studies}
                      </div>
                    )}

                    {a.achievements && (
                      <p className="text-[11px] text-slate-500 italic line-clamp-2 mt-1">
                        "{a.achievements}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  {a.email && (
                    <a
                      href={`mailto:${a.email}`}
                      className="text-slate-500 hover:text-amber-600 flex items-center gap-1 transition"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Contact</span>
                    </a>
                  )}
                  {a.linkedin && (
                    <a
                      href={a.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Modal: Transition Student to Alumni */}
      {isTransitionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-scale-in">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-amber-400" />
                  Transition Graduated Student to Alumni
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Historical marks, semester records, and certificates are permanently preserved
                </p>
              </div>
              <button
                onClick={() => setIsTransitionModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransitionSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Graduating Student *</label>
                <select
                  required
                  value={transitionFormData.student_id}
                  onChange={(e) => setTransitionFormData(prev => ({ ...prev, student_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="">-- Choose Student --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Graduation Year *</label>
                  <input
                    type="number"
                    required
                    value={transitionFormData.graduation_year}
                    onChange={(e) => setTransitionFormData(prev => ({ ...prev, graduation_year: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Current Organization / Employer</label>
                  <input
                    type="text"
                    placeholder="e.g. Tata Steel / TCS / Cognizant"
                    value={transitionFormData.current_organization}
                    onChange={(e) => setTransitionFormData(prev => ({ ...prev, current_organization: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Job Designation / Role</label>
                <input
                  type="text"
                  placeholder="e.g. Assistant Manager / Associate Software Engineer"
                  value={transitionFormData.job_title}
                  onChange={(e) => setTransitionFormData(prev => ({ ...prev, job_title: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Higher Studies (If applicable)</label>
                <input
                  type="text"
                  placeholder="e.g. M.Tech in AI (IIT Delhi) / MBA (XLRI Jamshedpur)"
                  value={transitionFormData.higher_studies}
                  onChange={(e) => setTransitionFormData(prev => ({ ...prev, higher_studies: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Key Achievements / Honors</label>
                <textarea
                  rows="2"
                  placeholder="e.g. University Gold Medalist, Hackathon Winner, Lead Organizer"
                  value={transitionFormData.achievements}
                  onChange={(e) => setTransitionFormData(prev => ({ ...prev, achievements: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsTransitionModalOpen(false)}
                  className="text-xs px-4 py-2"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submittingTransition || !transitionFormData.student_id}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs px-5 py-2 font-medium"
                >
                  {submittingTransition ? 'Transitioning...' : 'Confirm Graduation Transition'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
