import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { RVS_CONFIG } from '../../config/rvsConfig';
import {
  Shield,
  QrCode,
  UserCheck,
  UserX,
  Users,
  Clock,
  Calendar,
  Building,
  CheckCircle2,
  AlertTriangle,
  Search,
  Plus,
  Printer,
  LogOut,
  RefreshCw,
  X,
  CreditCard,
  Camera,
  MapPin,
  Phone,
  FileBadge
} from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import StatCard from '../../components/StatCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function GateVisitorModule() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'super_admin' || user?.role === 'college_admin';

  const [activeTab, setActiveTab] = useState('gate'); // 'gate' | 'visitors'
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');

  // Gate State
  const [gateStats, setGateStats] = useState({ currently_inside: 0, total_entries_today: 0, student_entries: 0, faculty_entries: 0 });
  const [gateLogs, setGateLogs] = useState([]);
  const [gateFilterDate, setGateFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [gateFilterType, setGateFilterType] = useState('ALL');
  const [gateFilterStatus, setGateFilterStatus] = useState('ALL');
  const [gateSearch, setGateSearch] = useState('');

  // Gate Scanner Bar
  const [scanIdentifier, setScanIdentifier] = useState('');
  const [scanGate, setScanGate] = useState('Main Gate 1');
  const [scanAction, setScanAction] = useState('auto');
  const [scanMethod, setScanMethod] = useState('Smart Card RFID');
  const [scanning, setScanning] = useState(false);
  const [scanFeedback, setScanFeedback] = useState(null);

  // Visitors State
  const [visitors, setVisitors] = useState([]);
  const [visitorSearch, setVisitorSearch] = useState('');
  const [visitorFilterStatus, setVisitorFilterStatus] = useState('all');
  const [isVisitorModalOpen, setIsVisitorModalOpen] = useState(false);
  const [visitorFormData, setVisitorFormData] = useState({
    visitor_name: '',
    phone: '',
    company_or_org: '',
    purpose: '',
    person_to_meet: '',
    department_to_meet: 'Computer Science & Engineering',
    id_proof_type: 'Aadhaar Card'
  });
  const [creatingVisitor, setCreatingVisitor] = useState(false);
  const [printablePass, setPrintablePass] = useState(null);

  // Fetch Gate Data
  const fetchGateData = async () => {
    try {
      const statsRes = await api.get('/rvs/gate/stats');
      if (statsRes.data?.success) setGateStats(statsRes.data.stats);

      const logsRes = await api.get('/rvs/gate/logs', {
        params: {
          date: gateFilterDate,
          user_type: gateFilterType,
          status: gateFilterStatus,
          search: gateSearch
        }
      });
      if (logsRes.data?.success) setGateLogs(logsRes.data.logs || []);
    } catch (err) {
      console.error('Gate fetch error:', err);
    }
  };

  // Fetch Visitors Data
  const fetchVisitorData = async () => {
    try {
      const res = await api.get('/rvs/visitors', {
        params: {
          status: visitorFilterStatus,
          search: visitorSearch
        }
      });
      if (res.data?.success) setVisitors(res.data.visitors || []);
    } catch (err) {
      console.error('Visitor fetch error:', err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchGateData(), fetchVisitorData()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [gateFilterDate, gateFilterType, gateFilterStatus, visitorFilterStatus]);

  // Handle Gate Scan
  const handleScanSubmit = async (e) => {
    e.preventDefault();
    if (!scanIdentifier.trim()) return;
    setScanning(true);
    setScanFeedback(null);
    try {
      const res = await api.post('/rvs/gate/scan', {
        identifier: scanIdentifier.trim(),
        gate: scanGate,
        action: scanAction,
        method: scanMethod
      });
      if (res.data?.success) {
        setScanFeedback({
          type: 'success',
          event: res.data.event,
          message: res.data.message,
          person: res.data.person
        });
        setScanIdentifier('');
        fetchGateData();
      }
    } catch (err) {
      setScanFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Access Denied / ID Not Found.'
      });
    } finally {
      setScanning(false);
    }
  };

  // Handle New Visitor Check-In
  const handleVisitorSubmit = async (e) => {
    e.preventDefault();
    setCreatingVisitor(true);
    try {
      const res = await api.post('/rvs/visitors/check-in', visitorFormData);
      if (res.data?.success) {
        setNotification(`Visitor pass ${res.data.visitor.pass_number} generated for ${res.data.visitor.visitor_name}`);
        setIsVisitorModalOpen(false);
        setPrintablePass(res.data.visitor);
        setVisitorFormData({
          visitor_name: '',
          phone: '',
          company_or_org: '',
          purpose: '',
          person_to_meet: '',
          department_to_meet: 'Computer Science & Engineering',
          id_proof_type: 'Aadhaar Card'
        });
        fetchVisitorData();
        setTimeout(() => setNotification(''), 6000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to check in visitor');
    } finally {
      setCreatingVisitor(false);
    }
  };

  // Handle Visitor Checkout
  const handleVisitorCheckout = async (id, name) => {
    if (!window.confirm(`Check out visitor ${name}?`)) return;
    try {
      const res = await api.post(`/rvs/visitors/${id}/check-out`);
      if (res.data?.success) {
        setNotification(`Visitor ${name} checked out successfully.`);
        fetchVisitorData();
        setTimeout(() => setNotification(''), 5000);
      }
    } catch (err) {
      alert('Checkout failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 rounded-2xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Campus Perimeter & Security Desk
            </span>
            <span className="text-xs text-slate-300">Authorized Gate Scanner & Visitor Registration</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Gate Entry & Visitor Management
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Automated turnstile & gate scanning for students and faculty. Controlled visitor pass generation with non-invasive privacy compliance.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          <div className="bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 flex items-center">
            <button
              onClick={() => setActiveTab('gate')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'gate'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Gate Access
            </button>
            <button
              onClick={() => setActiveTab('visitors')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'visitors'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Visitors ({visitors.filter(v => v.pass_status === 'Active').length} Active)
            </button>
          </div>

          {activeTab === 'visitors' && (
            <Button
              onClick={() => setIsVisitorModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              New Visitor Pass
            </Button>
          )}
        </div>
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
          title="Currently Inside Campus"
          value={gateStats.currently_inside}
          icon={Users}
          color="indigo"
          subtitle="Students & Faculty on campus"
        />
        <StatCard
          title="Today's Gate Entries"
          value={gateStats.total_entries_today}
          icon={CheckCircle2}
          color="blue"
          subtitle="Total verified turnstile passes"
        />
        <StatCard
          title="Student Ingress"
          value={gateStats.student_entries}
          icon={UserCheck}
          color="emerald"
          subtitle="Verified RFID & QR events"
        />
        <StatCard
          title="Active Visitors"
          value={visitors.filter(v => v.pass_status === 'Active').length}
          icon={Shield}
          color="amber"
          subtitle="Temporary campus passes"
        />
      </div>

      {/* TAB 1: GATE ACCESS LOGS & LIVE SCANNER */}
      {activeTab === 'gate' && (
        <div className="space-y-6">
          {/* Security Terminal Scanner Console */}
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Perimeter Scanner Terminal Active
                </span>
              </div>
              <span className="text-xs text-slate-400">Main Security Gate Desk</span>
            </div>

            <form onSubmit={handleScanSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="md:col-span-2">
                <label className="block text-[11px] text-slate-400 uppercase font-semibold mb-1">
                  Scan Roll No / Emp ID / Barcode
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. 23RVSCSE007, Rahul, EMP-001..."
                    value={scanIdentifier}
                    onChange={(e) => setScanIdentifier(e.target.value)}
                    className="w-full bg-slate-800/90 border border-slate-700 text-white pl-9 pr-3 py-2 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 uppercase font-semibold mb-1">
                  Gate Point
                </label>
                <select
                  value={scanGate}
                  onChange={(e) => setScanGate(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 text-white px-3 py-2 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Main Gate 1">Main Gate 1 (Front Entrance)</option>
                  <option value="North Gate 2">North Gate 2 (Hostel & Sports)</option>
                  <option value="Library Turnstile">Library Turnstile A</option>
                  <option value="Academic Block Turnstile">Academic Block Turnstile</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 uppercase font-semibold mb-1">
                  Action Mode
                </label>
                <select
                  value={scanAction}
                  onChange={(e) => setScanAction(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 text-white px-3 py-2 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="auto">Auto-Detect (Toggle In/Out)</option>
                  <option value="entry">Force Campus Entry</option>
                  <option value="exit">Force Campus Exit</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  type="submit"
                  disabled={scanning || !scanIdentifier.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 rounded-lg shadow-lg shadow-blue-500/20 flex items-center justify-center gap-1.5"
                >
                  <QrCode className="w-4 h-4" />
                  {scanning ? 'Verifying...' : 'Record Gate Pass'}
                </Button>
              </div>
            </form>

            {/* Scan Feedback Banner */}
            {scanFeedback && (
              <div
                className={`mt-4 p-3 rounded-xl border flex items-center justify-between text-xs animate-fade-in ${
                  scanFeedback.type === 'success'
                    ? 'bg-emerald-950/80 border-emerald-700/60 text-emerald-200'
                    : 'bg-rose-950/80 border-rose-700/60 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {scanFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                  )}
                  <div>
                    <span className="font-bold">{scanFeedback.message}</span>
                    {scanFeedback.person && (
                      <span className="ml-2 text-slate-300">
                        ({scanFeedback.person.department} • {scanFeedback.person.gate} • {scanFeedback.person.time})
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setScanFeedback(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Gate Logs Table */}
          <Card>
            <CardHeader
              title="Perimeter Access Logs & Movement History"
              action={
                <div className="flex flex-wrap items-center gap-2.5">
                  <input
                    type="date"
                    value={gateFilterDate}
                    onChange={(e) => setGateFilterDate(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <select
                    value={gateFilterType}
                    onChange={(e) => setGateFilterType(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">All Users</option>
                    <option value="student">Students</option>
                    <option value="faculty">Faculty / Staff</option>
                  </select>

                  <select
                    value={gateFilterStatus}
                    onChange={(e) => setGateFilterStatus(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">All Status</option>
                    <option value="Inside Campus">Inside Campus</option>
                    <option value="Exited">Exited</option>
                  </select>

                  <button
                    onClick={fetchGateData}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              }
            />

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Person Details</th>
                    <th className="py-3 px-4">Role & ID</th>
                    <th className="py-3 px-4">Gate Point</th>
                    <th className="py-3 px-4">Entry Time</th>
                    <th className="py-3 px-4">Exit Time</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Campus Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {gateLogs.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-400 text-sm">
                        No perimeter access logs recorded for selected criteria.
                      </td>
                    </tr>
                  ) : (
                    gateLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{log.person_name}</div>
                          <div className="text-xs text-slate-500">{log.department}</div>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                            log.user_type === 'faculty' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {log.user_type === 'faculty' ? 'Faculty' : 'Student'}
                          </span>
                          <div className="font-mono text-xs text-slate-600 mt-0.5">{log.roll_or_emp_id}</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {log.gate}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-emerald-500" />
                            {log.entry_time || '--'}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {log.exit_time || <span className="text-emerald-600 font-normal">Active On Campus</span>}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-xs text-slate-600">
                          <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {log.verification_method}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <Badge variant={log.status === 'Inside Campus' ? 'success' : 'default'}>
                            {log.status}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: VISITOR PASS MANAGEMENT */}
      {activeTab === 'visitors' && (
        <Card>
          <CardHeader
            title="Campus Visitor Registry & Pass History"
            action={
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search visitor, pass, host..."
                    value={visitorSearch}
                    onChange={(e) => setVisitorSearch(e.target.value)}
                    className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 sm:w-64"
                  />
                </div>

                <select
                  value={visitorFilterStatus}
                  onChange={(e) => setVisitorFilterStatus(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Passes</option>
                  <option value="Active">Active On Campus</option>
                  <option value="Checked Out">Checked Out</option>
                </select>

                <button
                  onClick={fetchVisitorData}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            }
          />

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Pass Number</th>
                  <th className="py-3 px-4">Visitor Details</th>
                  <th className="py-3 px-4">Purpose</th>
                  <th className="py-3 px-4">Meeting With</th>
                  <th className="py-3 px-4">Check-In / Out</th>
                  <th className="py-3 px-4">Pass Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visitors.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400 text-sm">
                      No visitor records found.
                    </td>
                  </tr>
                ) : (
                  visitors.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-xs text-blue-700">
                        {v.pass_number}
                        <span className="block text-[10px] text-slate-400 font-sans font-normal">
                          {v.id_proof_type}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{v.visitor_name}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {v.phone} • {v.company_or_org}
                        </div>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <span className="text-xs text-slate-700 line-clamp-2" title={v.purpose}>
                          {v.purpose}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-xs font-medium text-slate-800">{v.person_to_meet}</div>
                        <div className="text-[11px] text-slate-500">{v.department_to_meet}</div>
                      </td>

                      <td className="py-3 px-4 text-xs">
                        <div className="text-slate-800 font-medium">
                          In: {new Date(v.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {v.check_out ? (
                          <div className="text-slate-500 text-[11px]">
                            Out: {new Date(v.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        ) : (
                          <div className="text-emerald-600 font-bold text-[11px]">On Campus</div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <Badge variant={v.pass_status === 'Active' ? 'success' : 'default'}>
                          {v.pass_status}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => setPrintablePass(v)}
                          title="Print Official Visitor Gate Pass"
                          className="p-1.5 text-slate-600 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        {v.pass_status === 'Active' && (
                          <button
                            onClick={() => handleVisitorCheckout(v.id, v.visitor_name)}
                            title="Check Out Visitor"
                            className="p-1.5 text-rose-600 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition"
                          >
                            <LogOut className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal: New Visitor Pass Form */}
      {isVisitorModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-scale-in">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <FileBadge className="w-5 h-5 text-blue-400" />
                  Generate Campus Visitor Pass
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Official RVS security screening & gate access pass
                </p>
              </div>
              <button
                onClick={() => setIsVisitorModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVisitorSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Visitor Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. A. K. Banerjee"
                  value={visitorFormData.visitor_name}
                  onChange={(e) => setVisitorFormData(prev => ({ ...prev, visitor_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={visitorFormData.phone}
                    onChange={(e) => setVisitorFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Company / Organization</label>
                  <input
                    type="text"
                    placeholder="e.g. TCS / Parent / Vendor"
                    value={visitorFormData.company_or_org}
                    onChange={(e) => setVisitorFormData(prev => ({ ...prev, company_or_org: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Host / Person to Meet *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Principal / Dr. Vikram Sharma"
                    value={visitorFormData.person_to_meet}
                    onChange={(e) => setVisitorFormData(prev => ({ ...prev, person_to_meet: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Department</label>
                  <select
                    value={visitorFormData.department_to_meet}
                    onChange={(e) => setVisitorFormData(prev => ({ ...prev, department_to_meet: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Principal Office">Principal Office</option>
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Training & Placement Cell">Training & Placement Cell</option>
                    <option value="Accounts & Finance">Accounts & Finance</option>
                    <option value="Hostel Administration">Hostel Administration</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">ID Proof Presented</label>
                <select
                  value={visitorFormData.id_proof_type}
                  onChange={(e) => setVisitorFormData(prev => ({ ...prev, id_proof_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Aadhaar Card">Aadhaar Card</option>
                  <option value="Voter ID">Voter ID</option>
                  <option value="Driving License">Driving License</option>
                  <option value="Company / Official ID">Company / Official ID</option>
                  <option value="Passport">Passport</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Purpose of Visit *</label>
                <textarea
                  required
                  rows="2"
                  placeholder="e.g. Official campus placement coordination, fee payment, guest speaker"
                  value={visitorFormData.purpose}
                  onChange={(e) => setVisitorFormData(prev => ({ ...prev, purpose: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsVisitorModalOpen(false)}
                  className="text-xs px-4 py-2"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creatingVisitor}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-5 py-2 font-medium"
                >
                  {creatingVisitor ? 'Issuing Pass...' : 'Issue Visitor Pass'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Printable Official Visitor Pass */}
      {printablePass && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-scale-in">
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-blue-400">
                Visitor Badge / Gate Pass
              </span>
              <button
                onClick={() => setPrintablePass(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Pass Body */}
            <div className="p-6 border-b border-slate-200 print:p-0 space-y-4 text-center">
              <div className="flex flex-col items-center justify-center">
                <img
                  src={RVS_CONFIG.logoUrl}
                  alt="RVS College Logo"
                  className="w-14 h-14 object-contain mb-2"
                />
                <h4 className="font-bold text-slate-900 text-base leading-snug">
                  {RVS_CONFIG.collegeName}
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  {RVS_CONFIG.address}
                </p>
                <div className="mt-2 bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1 rounded-full text-xs font-mono font-bold">
                  PASS #{printablePass.pass_number}
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500">Visitor:</span>
                  <span className="font-bold text-slate-900">{printablePass.visitor_name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500">Organization:</span>
                  <span className="font-medium text-slate-800">{printablePass.company_or_org}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500">Meeting:</span>
                  <span className="font-semibold text-blue-900">{printablePass.person_to_meet} ({printablePass.department_to_meet})</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500">Check-In Time:</span>
                  <span className="font-mono text-slate-800">{new Date(printablePass.check_in).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Purpose:</span>
                  <span className="text-slate-700 italic">{printablePass.purpose}</span>
                </div>
              </div>

              {/* QR Verification Box */}
              <div className="p-3 bg-slate-100 rounded-lg border border-dashed border-slate-300 flex flex-col items-center">
                <div className="p-2 bg-white rounded border border-slate-200 shadow-sm">
                  <QrCode className="w-16 h-16 text-slate-800" />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 font-mono">
                  Scan at Exit Gate Turnstile
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setPrintablePass(null)}
                className="text-xs px-4 py-2"
              >
                Close
              </Button>
              <Button
                onClick={() => window.print()}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-5 py-2 flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print Pass
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
