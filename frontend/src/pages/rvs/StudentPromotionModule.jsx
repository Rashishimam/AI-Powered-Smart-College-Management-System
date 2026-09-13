import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { RVS_CONFIG } from '../../config/rvsConfig';
import {
  TrendingUp,
  Award,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Users,
  Settings,
  ArrowRight,
  Clock,
  BookOpen,
  Check,
  XCircle
} from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import StatCard from '../../components/StatCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function StudentPromotionModule() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'super_admin' || user?.role === 'college_admin';

  const [config, setConfig] = useState({
    max_active_backlogs_allowed: 3,
    min_attendance_pct: 75.0,
    min_cgpa: 5.0,
    require_fee_clearance: false
  });
  const [history, setHistory] = useState([]);
  const [evalData, setEvalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [notification, setNotification] = useState('');

  // Evaluation Filters
  const [department, setDepartment] = useState('CSE');
  const [fromSemester, setFromSemester] = useState('6th Semester');
  const [toSemester, setToSemester] = useState('7th Semester');

  // Selected students for promotion
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  // Config Edit Modal
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [tempConfig, setTempConfig] = useState(config);

  const fetchConfigAndHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/rvs/promotion/config');
      if (res.data?.success) {
        setConfig(res.data.config);
        setTempConfig(res.data.config);
        setHistory(res.data.history || []);
      }
    } catch (err) {
      console.error('Failed to load promotion config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigAndHistory();
  }, []);

  const handleEvaluate = async () => {
    setEvaluating(true);
    try {
      const res = await api.post('/rvs/promotion/evaluate', {
        department,
        current_semester: fromSemester
      });
      if (res.data?.success) {
        setEvalData(res.data);
        // Pre-select all eligible students
        const eligibleIds = (res.data.students || []).filter(s => s.is_eligible).map(s => s.id);
        setSelectedStudentIds(eligibleIds);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to evaluate students');
    } finally {
      setEvaluating(false);
    }
  };

  const handleExecutePromotion = async () => {
    if (!selectedStudentIds.length) {
      alert('Please select at least one eligible student to promote.');
      return;
    }
    if (!window.confirm(`Are you sure you want to promote ${selectedStudentIds.length} students to ${toSemester}? Past semester records will be safely archived.`)) return;

    setPromoting(true);
    try {
      const res = await api.post('/rvs/promotion/execute', {
        department,
        from_semester: fromSemester,
        to_semester: toSemester,
        student_ids: selectedStudentIds
      });
      if (res.data?.success) {
        setNotification(res.data.message);
        handleEvaluate(); // Refresh roster
        fetchConfigAndHistory(); // Refresh history
        setTimeout(() => setNotification(''), 6000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to execute promotion');
    } finally {
      setPromoting(false);
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/rvs/promotion/config', tempConfig);
      if (res.data?.success) {
        setConfig(res.data.config);
        setIsConfigOpen(false);
        setNotification('Promotion eligibility policy rules updated successfully.');
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (e) {
      alert('Failed to save config');
    }
  };

  const toggleStudentSelection = (id) => {
    setSelectedStudentIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Academic Progression Engine
            </span>
            <span className="text-xs text-slate-300">Semester Promotion & Graduation Validation</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Student Promotion & Progression
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Automated compliance check against active backlogs, minimum attendance, and CGPA. Permanent transcript preservation.
          </p>
        </div>

        {isAdmin && (
          <Button
            onClick={() => setIsConfigOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2.5 rounded-xl shadow flex items-center gap-2 text-xs self-start md:self-center"
          >
            <Settings className="w-4 h-4" />
            Config Rules
          </Button>
        )}
      </div>

      {notification && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-3 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* Rules Criteria Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Max Backlogs Allowed"
          value={`≤ ${config.max_active_backlogs_allowed}`}
          icon={AlertTriangle}
          color="amber"
          subtitle="JUT / Kolhan University rule"
        />
        <StatCard
          title="Min Attendance Requirement"
          value={`${config.min_attendance_pct}%`}
          icon={Clock}
          color="indigo"
          subtitle="Mandatory lecture criteria"
        />
        <StatCard
          title="Min CGPA Threshold"
          value={`${config.min_cgpa}`}
          icon={TrendingUp}
          color="teal"
          subtitle="Academic qualifying bar"
        />
        <StatCard
          title="Fee Clearance Check"
          value={config.require_fee_clearance ? 'Required' : 'Advisory Only'}
          icon={ShieldCheck}
          color="emerald"
          subtitle="Institutional accounts policy"
        />
      </div>

      {/* Promotion Evaluation Console */}
      <Card>
        <CardHeader
          title="Semester Progression & Batch Advancement Console"
          action={
            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="CSE">Computer Science & Engg (CSE)</option>
                <option value="ECE">Electronics & Comm Engg (ECE)</option>
                <option value="MECH">Mechanical Engg (MECH)</option>
                <option value="CIVIL">Civil Engg (CIVIL)</option>
                <option value="EEE">Electrical & Electronics (EEE)</option>
              </select>

              <select
                value={fromSemester}
                onChange={(e) => setFromSemester(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="1st Semester">1st Semester</option>
                <option value="2nd Semester">2nd Semester</option>
                <option value="3rd Semester">3rd Semester</option>
                <option value="4th Semester">4th Semester</option>
                <option value="5th Semester">5th Semester</option>
                <option value="6th Semester">6th Semester</option>
                <option value="7th Semester">7th Semester</option>
              </select>

              <ArrowRight className="w-4 h-4 text-slate-400" />

              <select
                value={toSemester}
                onChange={(e) => setToSemester(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="2nd Semester">2nd Semester</option>
                <option value="3rd Semester">3rd Semester</option>
                <option value="4th Semester">4th Semester</option>
                <option value="5th Semester">5th Semester</option>
                <option value="6th Semester">6th Semester</option>
                <option value="7th Semester">7th Semester</option>
                <option value="8th Semester">8th Semester</option>
                <option value="Graduated">Graduated / Degree Awarded</option>
              </select>

              <Button
                onClick={handleEvaluate}
                disabled={evaluating}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-1.5 rounded-lg flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${evaluating ? 'animate-spin' : ''}`} />
                {evaluating ? 'Evaluating...' : 'Run Eligibility Check'}
              </Button>
            </div>
          }
        />

        {evalData ? (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <div className="flex items-center gap-4">
                <span>Total Evaluated: <strong>{evalData.total_evaluated}</strong></span>
                <span className="text-emerald-700 font-bold">Eligible: {evalData.eligible_count}</span>
                <span className="text-rose-700 font-bold">Held Back: {evalData.ineligible_count}</span>
                <span className="text-slate-500">Selected for Promotion: <strong>{selectedStudentIds.length}</strong></span>
              </div>

              {isAdmin && (
                <Button
                  onClick={handleExecutePromotion}
                  disabled={promoting || !selectedStudentIds.length}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-1.5 rounded-lg font-medium shadow-sm"
                >
                  {promoting ? 'Promoting...' : `Promote ${selectedStudentIds.length} Students to ${toSemester}`}
                </Button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4 w-10">Select</th>
                    <th className="py-3 px-4">Student & Roll No</th>
                    <th className="py-3 px-4">Active Backlogs</th>
                    <th className="py-3 px-4">Attendance %</th>
                    <th className="py-3 px-4">Current CGPA</th>
                    <th className="py-3 px-4">Eligibility Status</th>
                    <th className="py-3 px-4">Audit Reasons</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {evalData.students?.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedStudentIds.includes(s.id)}
                          onChange={() => toggleStudentSelection(s.id)}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 text-xs">{s.name}</div>
                        <span className="font-mono text-[11px] text-slate-500">{s.roll_no}</span>
                      </td>

                      <td className="py-3 px-4 font-mono text-xs">
                        <span className={`font-bold ${s.active_backlogs > config.max_active_backlogs_allowed ? 'text-rose-600' : 'text-slate-700'}`}>
                          {s.active_backlogs}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-xs">
                        <span className={`font-bold ${s.attendance_pct < config.min_attendance_pct ? 'text-rose-600' : 'text-emerald-700'}`}>
                          {s.attendance_pct}%
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-xs font-bold text-slate-800">
                        {s.cgpa}
                      </td>

                      <td className="py-3 px-4">
                        <Badge variant={s.is_eligible ? 'success' : 'danger'}>
                          {s.is_eligible ? 'ELIGIBLE' : 'HELD BACK'}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-xs">
                        {s.reasons?.length > 0 ? (
                          <ul className="text-rose-600 text-[11px] list-disc pl-3 space-y-0.5">
                            {s.reasons.map((r, i) => <li key={i}>{r}</li>)}
                          </ul>
                        ) : (
                          <span className="text-emerald-600 text-[11px] font-medium flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> All criteria satisfied
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs">
            Select department and semesters above, then click <strong>Run Eligibility Check</strong> to evaluate students.
          </div>
        )}
      </Card>

      {/* Promotion History Table */}
      <Card>
        <CardHeader title="Historical Progression & Advancement Logs" />
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Department & Batch</th>
                <th className="py-3 px-4">Progression</th>
                <th className="py-3 px-4">Students Promoted</th>
                <th className="py-3 px-4">Sanctioned By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50/80 transition-colors text-xs">
                  <td className="py-3 px-4 font-mono text-slate-600">{h.date}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{h.department} ({h.batch})</td>
                  <td className="py-3 px-4 text-emerald-800 font-medium">
                    {h.from_semester} → {h.to_semester}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800">{h.promoted_count} Students</td>
                  <td className="py-3 px-4 text-slate-500">{h.promoted_by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: Config Rules */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-scale-in">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Configure Promotion Eligibility Rules</h3>
              <button onClick={() => setIsConfigOpen(false)} className="text-slate-400 hover:text-white p-1">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Max Active Backlogs Allowed *</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  required
                  value={tempConfig.max_active_backlogs_allowed}
                  onChange={(e) => setTempConfig(prev => ({ ...prev, max_active_backlogs_allowed: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Minimum Attendance % *</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={tempConfig.min_attendance_pct}
                  onChange={(e) => setTempConfig(prev => ({ ...prev, min_attendance_pct: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Minimum CGPA Required *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  required
                  value={tempConfig.min_cgpa}
                  onChange={(e) => setTempConfig(prev => ({ ...prev, min_cgpa: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tempConfig.require_fee_clearance}
                    onChange={(e) => setTempConfig(prev => ({ ...prev, require_fee_clearance: e.target.checked }))}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-semibold text-slate-800">Require Institutional Fee Clearance</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button variant="outline" type="button" onClick={() => setIsConfigOpen(false)} className="text-xs px-3 py-1.5">
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-1.5 font-medium">
                  Save Rules
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
