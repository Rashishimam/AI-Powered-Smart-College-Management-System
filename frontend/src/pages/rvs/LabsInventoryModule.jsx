import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import {
  Layers,
  Search,
  Filter,
  Plus,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building,
  User,
  X,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Monitor,
  Check
} from 'lucide-react';
import { RVS_CONFIG } from '../../config/rvsConfig';

export default function LabsInventoryModule() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'super_admin' || user?.role === 'college_admin';

  const [activeTab, setActiveTab] = useState('inventory'); // inventory, maintenance, issues
  const [equipment, setEquipment] = useState([]);
  const [summary, setSummary] = useState({});
  const [maintenanceTickets, setMaintenanceTickets] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [notification, setNotification] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [reportModalAsset, setReportModalAsset] = useState(null);
  const [issueModalAsset, setIssueModalAsset] = useState(null);
  const [updateTicketModal, setUpdateTicketModal] = useState(null);

  // Forms
  const [addForm, setAddForm] = useState({
    asset_id: '',
    equipment_name: '',
    category: 'Computers',
    department_code: 'CSE',
    laboratory: 'Advanced Computing Lab (Room 301)',
    location: 'Academic Block B',
    quantity: 1,
    condition: 'Excellent',
    assigned_person: 'Prof. Jeevan Kumar'
  });

  const [reportProblem, setReportProblem] = useState('');
  const [reportTech, setReportTech] = useState('Campus IT Support Cell');
  const [reportCost, setReportCost] = useState(0);

  const [issueToName, setIssueToName] = useState('');
  const [issueRollNo, setIssueRollNo] = useState('');
  const [issuePurpose, setIssuePurpose] = useState('Minor Project Hardware Testing');
  const [issueDueDate, setIssueDueDate] = useState('2026-04-10');

  const [ticketStatus, setTicketStatus] = useState('Resolved');
  const [ticketRemarks, setTicketRemarks] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedDept !== 'all') params.department = selectedDept;
      if (selectedStatus !== 'all') params.status = selectedStatus;
      if (search) params.search = search;

      const [equipRes, maintRes, issuesRes] = await Promise.all([
        api.get('/rvs/labs/equipment', { params }),
        api.get('/rvs/assets/maintenance'),
        api.get('/rvs/labs/issues')
      ]);

      if (equipRes.data?.success) {
        setEquipment(equipRes.data.equipment || []);
        setSummary(equipRes.data.summary || {});
      }
      if (maintRes.data?.success) setMaintenanceTickets(maintRes.data.maintenance || []);
      if (issuesRes.data?.success) setIssues(issuesRes.data.issues || []);
    } catch (err) {
      console.error('Failed to load lab inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDept, selectedStatus, search]);

  // Add Equipment Handler
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/rvs/labs/equipment', addForm);
      if (res.data?.success) {
        setNotification(res.data.message);
        setIsAddOpen(false);
        fetchData();
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to register equipment');
    }
  };

  // Report Maintenance Problem
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportModalAsset || !reportProblem.trim()) return;
    try {
      const res = await api.post('/rvs/assets/maintenance/report', {
        asset_id: reportModalAsset.asset_id,
        problem: reportProblem,
        assigned_technician: reportTech,
        cost: reportCost
      });
      if (res.data?.success) {
        setNotification(res.data.message);
        setReportModalAsset(null);
        fetchData();
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to report problem');
    }
  };

  // Issue Equipment
  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    if (!issueModalAsset) return;
    try {
      const res = await api.post(`/rvs/labs/equipment/${issueModalAsset.id}/issue`, {
        issued_to_name: issueToName,
        roll_no: issueRollNo,
        purpose: issuePurpose,
        due_date: issueDueDate
      });
      if (res.data?.success) {
        setNotification(res.data.message);
        setIssueModalAsset(null);
        fetchData();
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to issue equipment');
    }
  };

  // Return Equipment
  const handleReturnEquipment = async (equipId) => {
    try {
      const res = await api.post(`/rvs/labs/equipment/${equipId}/return`, {
        condition: 'Good',
        remarks: 'Inspected and returned to lab inventory'
      });
      if (res.data?.success) {
        setNotification(res.data.message);
        fetchData();
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Return failed');
    }
  };

  // Update Maintenance Ticket
  const handleUpdateTicket = async (e) => {
    e.preventDefault();
    if (!updateTicketModal) return;
    try {
      const res = await api.post(`/rvs/assets/maintenance/${updateTicketModal.id}/update`, {
        status: ticketStatus,
        remarks: ticketRemarks
      });
      if (res.data?.success) {
        setNotification(res.data.message);
        setUpdateTicketModal(null);
        fetchData();
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
              RVS Laboratories, Assets & Equipment Maintenance
            </span>
            <span className="text-xs text-slate-500">
              Institutional Asset Registry & Workstation Management
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Labs, Equipment Inventory & Asset Maintenance
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage computing workstations, electronics lab equipment, overhead projectors, issue/return logs, and breakdown repair work-orders.
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Register Asset
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

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 block">Total Equipment</span>
          <p className="text-xl font-black text-slate-900 mt-1 font-mono">{summary.total || 0}</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 block">Available</span>
          <p className="text-xl font-black text-emerald-600 mt-1 font-mono">{summary.available || 0}</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 block">In Use</span>
          <p className="text-xl font-black text-blue-600 mt-1 font-mono">{summary.in_use || 0}</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 block">Under Maintenance</span>
          <p className="text-xl font-black text-amber-600 mt-1 font-mono">{summary.under_maintenance || 0}</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[11px] text-slate-500 block">Active Work Orders</span>
          <p className="text-xl font-black text-purple-600 mt-1 font-mono">
            {maintenanceTickets.filter(m => m.status !== 'Resolved').length}
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-fit">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'inventory' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          Equipment & Inventory ({equipment.length})
        </button>

        <button
          onClick={() => setActiveTab('maintenance')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'maintenance' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          Asset Maintenance ({maintenanceTickets.length})
        </button>

        <button
          onClick={() => setActiveTab('issues')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'issues' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Issue & Return Logs ({issues.length})
        </button>
      </div>

      {/* TAB 1: EQUIPMENT INVENTORY */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search asset ID, equipment, lab name..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-600/20"
              >
                <option value="all">All Departments</option>
                {RVS_CONFIG.departments.map(d => (
                  <option key={d.code} value={d.code}>{d.code} - {d.name}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-600/20"
              >
                <option value="all">All Statuses</option>
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="IN USE">IN USE</option>
                <option value="UNDER MAINTENANCE">UNDER MAINTENANCE</option>
                <option value="DAMAGED">DAMAGED</option>
                <option value="RETIRED">RETIRED</option>
              </select>
            </div>
          </div>

          {/* Equipment Table */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Asset ID</th>
                    <th className="py-3 px-4">Equipment Description</th>
                    <th className="py-3 px-4">Laboratory & Location</th>
                    <th className="py-3 px-4 text-center">Quantity</th>
                    <th className="py-3 px-4">Condition</th>
                    <th className="py-3 px-4">In-Charge</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-slate-400">
                        <div className="w-6 h-6 border-2 border-blue-900/20 border-t-blue-900 rounded-full animate-spin mx-auto mb-2"></div>
                        Loading equipment inventory...
                      </td>
                    </tr>
                  ) : equipment.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-slate-500">
                        No equipment records found matching filters.
                      </td>
                    </tr>
                  ) : (
                    equipment.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-blue-950">
                          {item.asset_id}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900 text-xs">{item.equipment_name}</p>
                          <span className="text-[10px] text-slate-500">{item.category}</span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-800">{item.laboratory}</p>
                          <span className="text-[10px] text-slate-500">{item.location}</span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">
                          {item.quantity}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-slate-700 font-medium text-[11px]">{item.condition}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-[11px]">
                          {item.assigned_person}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            item.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                            item.status === 'IN USE' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                            item.status === 'UNDER MAINTENANCE' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                            'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {item.status === 'AVAILABLE' && (
                              <button
                                onClick={() => {
                                  setIssueModalAsset(item);
                                  setIssueToName('');
                                  setIssueRollNo('');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-bold transition-all border border-blue-200 cursor-pointer"
                              >
                                Issue
                              </button>
                            )}

                            {item.status === 'IN USE' && (
                              <button
                                onClick={() => handleReturnEquipment(item.id)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold transition-all border border-emerald-200 cursor-pointer"
                              >
                                Return
                              </button>
                            )}

                            {item.status !== 'UNDER MAINTENANCE' && (
                              <button
                                onClick={() => {
                                  setReportModalAsset(item);
                                  setReportProblem('');
                                }}
                                className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold transition-all border border-amber-200 cursor-pointer"
                                title="Report Maintenance Issue"
                              >
                                <Wrench className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ASSET MAINTENANCE TICKETS */}
      {activeTab === 'maintenance' && (
        <div className="space-y-4">
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-3">Ticket ID</th>
                    <th className="p-3">Asset ID & Equipment</th>
                    <th className="p-3">Reported Problem</th>
                    <th className="p-3">Reported Date</th>
                    <th className="p-3">Assigned Technician / Vendor</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {maintenanceTickets.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-400">
                        No maintenance work orders active. All assets operational.
                      </td>
                    </tr>
                  ) : (
                    maintenanceTickets.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-slate-900">#{t.id}</td>
                        <td className="p-3">
                          <span className="font-mono font-bold text-amber-700 block">{t.asset_id}</span>
                          <p className="font-semibold text-slate-900">{t.equipment_name}</p>
                        </td>
                        <td className="p-3 text-slate-700 max-w-xs">{t.problem}</td>
                        <td className="p-3 font-mono text-slate-500 text-[11px]">{t.reported_date}</td>
                        <td className="p-3 text-slate-700">{t.assigned_technician}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            t.status === 'Resolved' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                            t.status === 'Under Repair' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                            'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {t.status !== 'Resolved' && (
                            <button
                              onClick={() => {
                                setUpdateTicketModal(t);
                                setTicketStatus('Resolved');
                                setTicketRemarks('');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-bold transition-all border border-blue-200 cursor-pointer"
                            >
                              Update / Resolve
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EQUIPMENT ISSUES & RETURNS */}
      {activeTab === 'issues' && (
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">Asset ID & Equipment</th>
                <th className="p-3">Issued To</th>
                <th className="p-3">Purpose</th>
                <th className="p-3">Issue Date</th>
                <th className="p-3">Due Date</th>
                <th className="p-3">Return Date</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {issues.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No issue/return history logged.
                  </td>
                </tr>
              ) : (
                issues.map((iss) => (
                  <tr key={iss.id} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-900">
                      <span className="font-mono text-amber-700 block text-[10px]">{iss.asset_id}</span>
                      {iss.equipment_name}
                    </td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{iss.issued_to_name}</p>
                      <span className="font-mono text-[10px] text-slate-500">{iss.roll_no}</span>
                    </td>
                    <td className="p-3 text-slate-600 max-w-xs truncate">{iss.purpose}</td>
                    <td className="p-3 font-mono text-slate-500">{iss.issue_date}</td>
                    <td className="p-3 font-mono text-slate-500">{iss.due_date}</td>
                    <td className="p-3 font-mono text-slate-500">{iss.return_date || '-'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        iss.status === 'Returned' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-blue-50 text-blue-800 border border-blue-200'
                      }`}>
                        {iss.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Equipment Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-950 border border-slate-800 text-slate-100 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsAddOpen(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Monitor className="w-5 h-5 text-amber-400" />
                Register Lab Equipment / Institutional Asset
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Assign asset IDs, laboratory allocation, and in-charge faculty.</p>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Asset ID *</label>
                  <input
                    type="text"
                    required
                    value={addForm.asset_id}
                    onChange={(e) => setAddForm({ ...addForm, asset_id: e.target.value })}
                    placeholder="e.g. RVS-LAB-CSE-004"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Category *</label>
                  <select
                    value={addForm.category}
                    onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="Computers">Computers & Workstations</option>
                    <option value="Lab Equipment">Lab Equipment</option>
                    <option value="Projectors">Projectors & AV Gear</option>
                    <option value="Electrical equipment">Electrical Equipment</option>
                    <option value="Network Infrastructure">Network Infrastructure</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Equipment Name / Technical Model *</label>
                <input
                  type="text"
                  required
                  value={addForm.equipment_name}
                  onChange={(e) => setAddForm({ ...addForm, equipment_name: e.target.value })}
                  placeholder="e.g. HP Z2 G9 Mini Workstation Core i9"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Department</label>
                  <select
                    value={addForm.department_code}
                    onChange={(e) => setAddForm({ ...addForm, department_code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  >
                    {RVS_CONFIG.departments.map(d => (
                      <option key={d.code} value={d.code}>{d.code} - {d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={addForm.quantity}
                    onChange={(e) => setAddForm({ ...addForm, quantity: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Laboratory Room</label>
                  <input
                    type="text"
                    value={addForm.laboratory}
                    onChange={(e) => setAddForm({ ...addForm, laboratory: e.target.value })}
                    placeholder="e.g. AI & Robotics Lab"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Campus Location</label>
                  <input
                    type="text"
                    value={addForm.location}
                    onChange={(e) => setAddForm({ ...addForm, location: e.target.value })}
                    placeholder="e.g. Academic Block B, Room 304"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer"
                >
                  Register Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Problem Modal */}
      {reportModalAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-950 border border-slate-800 text-slate-100 rounded-3xl p-6 shadow-2xl space-y-4">
            <button onClick={() => setReportModalAsset(null)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-400" />
                Report Asset Breakdown / Issue
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">{reportModalAsset.asset_id} &bull; {reportModalAsset.equipment_name}</p>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Problem Description / Defect Details *</label>
                <textarea
                  rows="3"
                  required
                  value={reportProblem}
                  onChange={(e) => setReportProblem(e.target.value)}
                  placeholder="Describe the hardware/software malfunction or physical damage..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Assigned Vendor / Technician</label>
                <input
                  type="text"
                  value={reportTech}
                  onChange={(e) => setReportTech(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReportModalAsset(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer"
                >
                  File Maintenance Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Issue Asset Modal */}
      {issueModalAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-950 border border-slate-800 text-slate-100 rounded-3xl p-6 shadow-2xl space-y-4">
            <button onClick={() => setIssueModalAsset(null)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-base font-bold text-white">Issue Equipment / Asset</h3>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">{issueModalAsset.asset_id} &bull; {issueModalAsset.equipment_name}</p>
            </div>

            <form onSubmit={handleIssueSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Issued To (Name) *</label>
                <input
                  type="text"
                  required
                  value={issueToName}
                  onChange={(e) => setIssueToName(e.target.value)}
                  placeholder="e.g. Rahul Kumar Verma"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Roll No / Employee ID</label>
                <input
                  type="text"
                  value={issueRollNo}
                  onChange={(e) => setIssueRollNo(e.target.value)}
                  placeholder="e.g. 23RVSCSE042"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Purpose of Issue</label>
                <input
                  type="text"
                  value={issuePurpose}
                  onChange={(e) => setIssuePurpose(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Return Due Date *</label>
                <input
                  type="date"
                  required
                  value={issueDueDate}
                  onChange={(e) => setIssueDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIssueModalAsset(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer"
                >
                  Confirm Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Maintenance Ticket Modal */}
      {updateTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-950 border border-slate-800 text-slate-100 rounded-3xl p-6 shadow-2xl space-y-4">
            <button onClick={() => setUpdateTicketModal(null)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-base font-bold text-white">Update Work Order #{updateTicketModal.id}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{updateTicketModal.equipment_name} ({updateTicketModal.asset_id})</p>
            </div>

            <form onSubmit={handleUpdateTicket} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Status</label>
                <select
                  value={ticketStatus}
                  onChange={(e) => setTicketStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                >
                  <option value="Under Repair">Under Repair</option>
                  <option value="Resolved">Resolved (Restores Asset to AVAILABLE)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Technician / Vendor Remarks</label>
                <textarea
                  rows="3"
                  value={ticketRemarks}
                  onChange={(e) => setTicketRemarks(e.target.value)}
                  placeholder="e.g. SMPS replaced; stress test conducted for 4 hours; working normally."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUpdateTicketModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                >
                  Save & Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
