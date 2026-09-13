import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { RVS_CONFIG } from '../../config/rvsConfig';
import { 
  GraduationCap, 
  Layers, 
  Clock, 
  Users, 
  BookOpen, 
  CheckCircle2, 
  Edit3, 
  Save, 
  X, 
  Search, 
  Filter, 
  Info,
  ExternalLink,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import StatCard from '../../components/StatCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';

export default function ProgramsModule() {
  const { user } = useAuth();
  const [programs, setPrograms] = useState(RVS_CONFIG.programs);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [degreeFilter, setDegreeFilter] = useState('all');
  const [editingProgram, setEditingProgram] = useState(null);
  const [editForm, setEditForm] = useState({
    duration_years: 4,
    semester_count: 8,
    intake_seats: 150,
    eligibility: ''
  });
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const isAdmin = user?.role === 'super_admin' || user?.role === 'college_admin';

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const res = await api.get('/rvs/programs');
      if (res.data?.success && res.data.programs?.length > 0) {
        setPrograms(res.data.programs);
      }
    } catch (err) {
      console.warn('Using local RVS_CONFIG programs fallback:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (prog) => {
    setEditingProgram(prog);
    setEditForm({
      duration_years: prog.duration_years || prog.durationYears || 4,
      semester_count: prog.semester_count || prog.semesterCount || 8,
      intake_seats: prog.intake_seats || prog.intakeSeats || 60,
      eligibility: prog.eligibility || ''
    });
    setStatusMessage(null);
  };

  const handleSaveEdit = async () => {
    if (!editingProgram) return;
    setSaving(true);
    try {
      const res = await api.put(`/rvs/programs/${editingProgram.id}`, editForm);
      if (res.data?.success) {
        setPrograms(prev => prev.map(p => p.id === editingProgram.id ? { ...p, ...res.data.program } : p));
        setStatusMessage({ type: 'success', text: `Configuration for ${editingProgram.name} updated successfully!` });
        setEditingProgram(null);
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update program configuration.' });
    } finally {
      setSaving(false);
    }
  };

  const filteredPrograms = programs.filter(prog => {
    const q = search.toLowerCase();
    const name = (prog.name || '').toLowerCase();
    const code = (prog.code || '').toLowerCase();
    const degree = (prog.degree || '').toLowerCase();
    const matchesSearch = name.includes(q) || code.includes(q);
    const matchesDegree = degreeFilter === 'all' || degree.includes(degreeFilter.toLowerCase());
    return matchesSearch && matchesDegree;
  });

  const totalSeats = programs.reduce((sum, p) => sum + Number(p.intake_seats || p.intakeSeats || 0), 0);

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner with Official College Reference */}
      <div className="erp-card bg-gradient-to-r from-[#0a192f] via-[#0f2347] to-[#1e3a8a] text-white p-6 sm:p-8 rounded-2xl relative overflow-hidden shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-slate-950 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                OFFICIAL AICTE DATA
              </span>
              <span className="text-xs text-blue-200">
                Verified from <a href="https://www.rvscollege.ac.in/" target="_blank" rel="noopener noreferrer" className="text-amber-300 hover:underline inline-flex items-center gap-0.5">rvscollege.ac.in <ExternalLink className="w-2.5 h-2.5" /></a>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Academic Programs & Approved Seat Matrix
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Configured around official AICTE-approved degree and diploma offerings of <strong>RVS College of Engineering & Technology, Jamshedpur</strong>. Duration, semester count, and intake seats are dynamically configurable.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-center">
              <span className="block text-[10px] uppercase tracking-wider text-slate-300 font-bold">Programs</span>
              <span className="text-lg font-black text-white">{programs.length} Offerings</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 text-center shadow-xs">
              <span className="block text-[10px] uppercase tracking-wider font-extrabold">Approved Intake</span>
              <span className="text-lg font-black">{totalSeats} Seats</span>
            </div>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-xl border text-xs flex items-center justify-between ${statusMessage.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Flagship CSE Spotlight Card */}
      <Card className="border-amber-300 bg-amber-50/50 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">B.Tech Computer Science & Engineering (CSE)</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950 uppercase tracking-wider">
                  Flagship Discipline
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Official specifications per RVS College portal: <strong>4 Years</strong> &bull; <strong>8 Semesters</strong> &bull; Approved intake capacity: <strong className="text-blue-900 text-sm">150 Seats</strong>
              </p>
            </div>
          </div>

          {isAdmin && (
            <Button
              variant="gold"
              size="sm"
              icon={Edit3}
              onClick={() => {
                const cseProg = programs.find(p => (p.code || '').includes('CSE') && !(p.code || '').includes('MTECH'));
                if (cseProg) startEdit(cseProg);
              }}
            >
              Configure Seats
            </Button>
          )}
        </div>
      </Card>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search programs by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['all', 'B.Tech', 'M.Tech', 'BCA', 'MCA', 'Diploma'].map((deg) => (
            <button
              key={deg}
              onClick={() => setDegreeFilter(deg)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                degreeFilter === deg
                  ? 'bg-blue-900 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {deg === 'all' ? 'All Programs' : deg}
            </button>
          ))}
        </div>
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPrograms.map((prog) => {
          const duration = prog.duration_years || prog.durationYears || 4;
          const semesters = prog.semester_count || prog.semesterCount || 8;
          const intake = prog.intake_seats || prog.intakeSeats || 60;
          const isFlagship = (prog.code || '').includes('BTECH-CSE') && !(prog.code || '').includes('AIML');

          return (
            <Card
              key={prog.id || prog.code}
              hover
              className={`p-5 flex flex-col justify-between ${
                isFlagship ? 'border-amber-400 shadow-md ring-1 ring-amber-400/20' : ''
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {prog.code}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="success" size="sm">
                      AICTE Approved
                    </Badge>
                    {isAdmin && (
                      <button
                        onClick={() => startEdit(prog)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                        title="Configure intake seats & duration"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {prog.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Degree Level: <span className="text-slate-800 font-semibold">{prog.degree}</span>
                </p>

                {prog.eligibility && (
                  <p className="text-[11px] text-slate-600 mt-2.5 line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-800">Eligibility:</span> {prog.eligibility}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3.5 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <Clock className="w-3.5 h-3.5 mx-auto text-blue-800 mb-0.5" />
                  <span className="block text-[10px] text-slate-500 font-medium">Duration</span>
                  <span className="font-bold text-slate-900">{duration} Yrs</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <Layers className="w-3.5 h-3.5 mx-auto text-indigo-700 mb-0.5" />
                  <span className="block text-[10px] text-slate-500 font-medium">Semesters</span>
                  <span className="font-bold text-slate-900">{semesters}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <Users className="w-3.5 h-3.5 mx-auto text-emerald-600 mb-0.5" />
                  <span className="block text-[10px] text-slate-500 font-medium">Intake</span>
                  <span className="font-bold text-emerald-800">{intake}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Edit Program Configuration Modal */}
      <Modal
        isOpen={!!editingProgram}
        onClose={() => setEditingProgram(null)}
        title="Configure Program Parameters"
        subtitle={editingProgram ? `${editingProgram.name} (${editingProgram.code})` : ''}
        maxWidth="max-w-md"
      >
        {editingProgram && (
          <div className="space-y-4 text-xs">
            <Input
              label="Approved Intake Seats"
              type="number"
              min="5"
              max="500"
              value={editForm.intake_seats}
              onChange={(e) => setEditForm({ ...editForm, intake_seats: e.target.value })}
              helperText="For B.Tech CSE, the official website lists 150 approved seats."
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Duration (Years)"
                type="number"
                min="1"
                max="6"
                value={editForm.duration_years}
                onChange={(e) => setEditForm({ ...editForm, duration_years: e.target.value })}
              />
              <Input
                label="Total Semesters"
                type="number"
                min="2"
                max="12"
                value={editForm.semester_count}
                onChange={(e) => setEditForm({ ...editForm, semester_count: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Eligibility Criteria
              </label>
              <textarea
                rows="3"
                value={editForm.eligibility}
                onChange={(e) => setEditForm({ ...editForm, eligibility: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-blue-600 focus:outline-none"
                placeholder="e.g. 10+2 with PCM >= 45% + JEE Main / JCECE rank"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setEditingProgram(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" loading={saving} onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
