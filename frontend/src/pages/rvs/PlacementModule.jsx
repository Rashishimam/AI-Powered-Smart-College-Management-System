import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { RVS_CONFIG } from '../../config/rvsConfig';
import { 
  Briefcase, 
  TrendingUp, 
  Award, 
  Building2, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  Phone,
  ShieldCheck,
  Info,
  ExternalLink,
  Users,
  Building,
  GraduationCap,
  AlertTriangle,
  Plus,
  Eye,
  X,
  FileCheck
} from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import StatCard from '../../components/StatCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function PlacementModule() {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';
  const isAdmin = user?.role === 'super_admin' || user?.role === 'college_admin';

  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');

  // Admin: Candidate Roster Modal
  const [rosterDrive, setRosterDrive] = useState(null);
  const [rosterData, setRosterData] = useState(null);
  const [loadingRoster, setLoadingRoster] = useState(false);

  // Admin: Create Drive Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCompany, setNewCompany] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newPackage, setNewPackage] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newMinCgpa, setNewMinCgpa] = useState(6.5);
  const [newMaxBacklogs, setNewMaxBacklogs] = useState(0);
  const [newMinAttendance, setNewMinAttendance] = useState(75);
  const [newDepts, setNewDepts] = useState(['CSE', 'ECE']);
  const [creating, setCreating] = useState(false);

  const fetchDrives = async () => {
    try {
      setLoading(true);
      if (isStudent) {
        const res = await api.get('/rvs/placements/student/my-eligibility');
        if (res.data?.success) {
          setDrives(res.data.drives || []);
        }
      } else {
        const res = await api.get('/rvs/placements/drives');
        if (res.data?.success) {
          setDrives(res.data.drives || []);
        }
      }
    } catch (err) {
      console.error('Failed to load placement drives:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, [isStudent]);

  // Student Apply Action
  const handleApply = async (driveId) => {
    try {
      const res = await api.post(`/rvs/placements/drives/${driveId}/apply`);
      if (res.data?.success) {
        setNotification(res.data.message);
        fetchDrives();
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Application failed');
    }
  };

  // Admin View Candidate Roster
  const handleOpenRoster = async (drive) => {
    setRosterDrive(drive);
    setLoadingRoster(true);
    try {
      const res = await api.get(`/rvs/placements/drives/${drive.id}/evaluation`);
      if (res.data?.success) {
        setRosterData(res.data);
      }
    } catch (err) {
      alert('Failed to evaluate candidates for this drive');
    } finally {
      setLoadingRoster(false);
    }
  };

  // Admin Create Drive
  const handleCreateDrive = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      const res = await api.post('/rvs/placements/drives', {
        company_name: newCompany,
        job_role: newRole,
        package: newPackage,
        drive_date: newDate,
        min_cgpa: Number(newMinCgpa),
        max_active_backlogs: Number(newMaxBacklogs),
        min_attendance: Number(newMinAttendance),
        allowed_departments: newDepts
      });
      if (res.data?.success) {
        setNotification(res.data.message);
        setIsCreateOpen(false);
        fetchDrives();
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create drive');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
              RVS Training & Placement Directorate (T&P Cell)
            </span>
            <span className="text-xs text-slate-500">
              Autonomous Placement & Industry Relations
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Campus Placement & Automated Eligibility Engine
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isStudent
              ? 'Real-time candidate eligibility evaluation based on live CGPA, active backlogs, and attendance records.'
              : 'Configurable recruitment drive criteria, automated student academic evaluations, and drive rosters.'}
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Campus Drive
            </button>
          </div>
        )}
      </div>

      {/* Global Notification */}
      {notification && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* T&P Headline Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Placement Rate"
          value="86.4%"
          subtitle="Batch of 2025-2026"
          icon={TrendingUp}
          color="emerald"
          trend="86% benchmark verified"
          trendType="up"
        />
        <StatCard
          title="Highest Package (CTC)"
          value="14.5 LPA"
          subtitle="Recruiter: Tata Digital"
          icon={Award}
          color="gold"
          trend="RVSCET Record"
          trendType="up"
        />
        <StatCard
          title="Active Placement Drives"
          value={drives.length || 3}
          subtitle="Currently Open"
          icon={Briefcase}
          color="blue"
          trend="On-Campus"
          trendType="up"
        />
        <StatCard
          title="Partner Companies"
          value="45+"
          subtitle="Tata Steel, TCS, Wipro, Capgemini"
          icon={Building2}
          color="purple"
          trend="MoU Engaged"
        />
      </div>

      {/* Drives Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            {isStudent ? 'Your Campus Drives & Automated Eligibility Status' : 'Active Campus Recruitment Drives'}
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {drives.length} Drives Registered
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drives.map((drive) => {
            const driveId = drive.id || drive.drive_id;
            const criteria = drive.criteria || {};
            const isEligible = drive.is_eligible;
            const reasons = drive.reasons || [];
            const hasApplied = drive.has_applied;

            return (
              <div key={driveId} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-800 border border-blue-200">
                      {drive.status || 'Active Drive'}
                    </span>
                    <span className="font-mono font-bold text-amber-600 text-xs">
                      {drive.package}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{drive.company_name}</h4>
                    <p className="text-xs text-slate-600 font-medium">{drive.job_role}</p>
                  </div>

                  <div className="space-y-1 text-xs text-slate-500 pt-1">
                    <p className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Drive Date: <strong className="text-slate-700">{drive.drive_date}</strong>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      Venue: {drive.venue}
                    </p>
                  </div>

                  {/* Configurable Eligibility Criteria Box */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] space-y-1 text-slate-600">
                    <span className="font-bold text-slate-800 block text-[10px] uppercase tracking-wider">Drive Cutoff Criteria:</span>
                    <p>&bull; Min CGPA: <strong className="text-slate-900 font-mono">{criteria.min_cgpa || 6.5}</strong></p>
                    <p>&bull; Max Active Backlogs: <strong className="text-slate-900 font-mono">{criteria.max_active_backlogs ?? 0}</strong></p>
                    <p>&bull; Min Attendance: <strong className="text-slate-900 font-mono">{criteria.min_attendance || 75}%</strong></p>
                    <p>&bull; Target Depts: <strong className="text-slate-900 font-mono">{(criteria.allowed_departments || []).join(', ')}</strong></p>
                  </div>

                  {/* Student View: Automated Personalized Eligibility Clearance */}
                  {isStudent && (
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Your Eligibility Evaluation:</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isEligible ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}>
                          {isEligible ? 'Eligible' : 'Not Eligible'}
                        </span>
                      </div>

                      {!isEligible && reasons.length > 0 && (
                        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-800 space-y-0.5">
                          <span className="font-bold block">Ineligibility Factors:</span>
                          {reasons.map((r, i) => (
                            <p key={i}>&bull; {r}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {isStudent ? (
                    hasApplied ? (
                      <span className="w-full py-2 text-center rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Application Submitted
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApply(driveId)}
                        disabled={!isEligible}
                        className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isEligible
                            ? 'bg-blue-900 hover:bg-blue-800 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                        }`}
                      >
                        {isEligible ? 'Apply for Drive' : 'Criteria Not Met'}
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => handleOpenRoster(drive)}
                      className="w-full py-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-800 hover:text-blue-900 text-xs font-bold transition-all border border-slate-200 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5" />
                      View Candidate Eligibility Roster
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Admin: Candidate Eligibility Roster Modal */}
      {rosterDrive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 text-slate-100 rounded-3xl p-6 shadow-2xl my-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => {
                setRosterDrive(null);
                setRosterData(null);
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{rosterDrive.company_name}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {rosterDrive.job_role}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Automated student eligibility evaluation against drive criteria (Min CGPA: {rosterDrive.criteria?.min_cgpa}, Max Backlogs: {rosterDrive.criteria?.max_active_backlogs})
              </p>
            </div>

            {loadingRoster ? (
              <div className="py-12 text-center text-slate-400">
                <div className="w-6 h-6 border-2 border-blue-900/20 border-t-blue-900 rounded-full animate-spin mx-auto mb-2"></div>
                Evaluating student records...
              </div>
            ) : rosterData ? (
              <div className="space-y-4">
                {/* Summary KPIs */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400">Total Evaluated</span>
                    <p className="text-base font-bold text-white font-mono mt-0.5">{rosterData.summary?.total_students}</p>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-emerald-400">Eligible Candidates</span>
                    <p className="text-base font-bold text-emerald-400 font-mono mt-0.5">{rosterData.summary?.eligible_count}</p>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-rose-400">Ineligible</span>
                    <p className="text-base font-bold text-rose-400 font-mono mt-0.5">{rosterData.summary?.not_eligible_count}</p>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-blue-400">Registered / Applied</span>
                    <p className="text-base font-bold text-blue-400 font-mono mt-0.5">{rosterData.summary?.applied_count}</p>
                  </div>
                </div>

                {/* Candidate Table */}
                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-400 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Student Name</th>
                        <th className="p-3">Roll No</th>
                        <th className="p-3">Branch</th>
                        <th className="p-3 text-center">CGPA</th>
                        <th className="p-3 text-center">Active Backlogs</th>
                        <th className="p-3">Eligibility Status</th>
                        <th className="p-3">Application</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-200">
                      {(rosterData.students || []).map((s) => (
                        <tr key={s.student_id} className="hover:bg-slate-900/50">
                          <td className="p-3 font-semibold text-white">{s.name}</td>
                          <td className="p-3 font-mono text-amber-400">{s.roll_no}</td>
                          <td className="p-3">{s.department_code}</td>
                          <td className="p-3 text-center font-mono font-bold text-slate-200">{s.metrics?.cgpa}</td>
                          <td className="p-3 text-center font-mono font-bold text-slate-200">{s.metrics?.activeBacklogs}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              s.is_eligible ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}>
                              {s.is_eligible ? 'Eligible' : 'Not Eligible'}
                            </span>
                            {!s.is_eligible && s.reasons?.length > 0 && (
                              <p className="text-[10px] text-rose-400 mt-0.5 max-w-xs truncate" title={s.reasons.join('; ')}>
                                {s.reasons.join('; ')}
                              </p>
                            )}
                          </td>
                          <td className="p-3">
                            {s.has_applied ? (
                              <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Applied
                              </span>
                            ) : (
                              <span className="text-slate-500 text-[11px]">Not Applied</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Admin: Create Placement Drive Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-950 border border-slate-800 text-slate-100 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-amber-400" />
                Create Campus Placement Drive
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Define recruitment drive criteria. The engine automatically evaluates all students in real time.
              </p>
            </div>

            <form onSubmit={handleCreateDrive} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="e.g. Tata Motors"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Job Role *</label>
                  <input
                    type="text"
                    required
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    placeholder="e.g. GET - Automation"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Package (CTC) *</label>
                  <input
                    type="text"
                    required
                    value={newPackage}
                    onChange={(e) => setNewPackage(e.target.value)}
                    placeholder="e.g. ₹6.5 LPA"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Drive Date *</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                <span className="font-bold text-amber-400 block text-[10px] uppercase tracking-wider">
                  Configurable Eligibility Cutoffs
                </span>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1">Min CGPA</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      required
                      value={newMinCgpa}
                      onChange={(e) => setNewMinCgpa(e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1">Max Backlogs</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      required
                      value={newMaxBacklogs}
                      onChange={(e) => setNewMaxBacklogs(e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1">Min Attendance %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={newMinAttendance}
                      onChange={(e) => setNewMinAttendance(e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] mb-1">Target Departments</label>
                  <div className="flex gap-2 flex-wrap">
                    {['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL'].map(dept => (
                      <label key={dept} className="flex items-center gap-1 text-[11px] text-slate-300">
                        <input
                          type="checkbox"
                          checked={newDepts.includes(dept)}
                          onChange={(e) => {
                            if (e.target.checked) setNewDepts(prev => [...prev, dept]);
                            else setNewDepts(prev => prev.filter(d => d !== dept));
                          }}
                          className="rounded border-slate-700"
                        />
                        {dept}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {creating ? 'Saving...' : 'Publish Drive & Run Eligibility'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
