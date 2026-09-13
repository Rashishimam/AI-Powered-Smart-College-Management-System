import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import RVSLogo from '../../components/RVSLogo';
import {
  FileCheck2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Printer,
  ShieldCheck,
  Building2,
  Sparkles,
  RefreshCw,
  Award,
  Download,
  AlertCircle
} from 'lucide-react';

export default function NoDuesModule() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [toast, setToast] = useState(null);

  // Request form
  const [purpose, setPurpose] = useState('Final Semester Exam Clearance & Degree Processing');

  // Unit update form
  const [unitForm, setUnitForm] = useState({
    status: 'CLEARED',
    remarks: 'Clearance verified and approved.'
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {
        console.error(e);
      }
    }
    fetchRequests();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/rvs/adv/no-dues');
      if (res.data?.success) {
        setRequests(res.data.requests || []);
        if (res.data.requests?.length > 0 && !selectedRequest) {
          setSelectedRequest(res.data.requests[0]);
        } else if (selectedRequest) {
          const updated = res.data.requests.find(r => r.id === selectedRequest.id);
          if (updated) setSelectedRequest(updated);
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading No-Dues records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/rvs/adv/no-dues/request', { purpose });
      if (res.data?.success) {
        showToast('No-Dues clearance request initiated!');
        setShowRequestModal(false);
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to submit request', 'error');
    }
  };

  const handleUpdateUnit = async (e) => {
    e.preventDefault();
    if (!selectedRequest || !selectedUnit) return;
    try {
      const res = await api.post(`/api/rvs/adv/no-dues/${selectedRequest.id}/unit-clearance`, {
        unit_name: selectedUnit.name,
        status: unitForm.status,
        remarks: unitForm.remarks
      });
      if (res.data?.success) {
        showToast(res.data.message || 'Unit clearance updated');
        setShowUnitModal(false);
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to update clearance', 'error');
    }
  };

  const isStaff = ['super_admin', 'college_admin', 'faculty'].includes(currentUser?.role);

  const getStatusBadge = (st) => {
    switch (st) {
      case 'CLEARED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> Cleared</span>;
      case 'HOLD':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200"><AlertTriangle className="w-3.5 h-3.5" /> Dues On Hold</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200"><Clock className="w-3.5 h-3.5" /> Pending</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/30 p-4 md:p-6 lg:p-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-white transition-all transform animate-bounce ${toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'}`}>
          <Sparkles className="w-5 h-5" />
          <span className="font-medium text-sm">{toast.msg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-indigo-700 uppercase mb-1">
              <FileCheck2 className="w-4 h-4" />
              <span>Multi-Departmental Clearance Protocol</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
              No-Dues Clearance System
              <span className="text-xs bg-indigo-100 text-indigo-800 font-semibold px-2.5 py-1 rounded-full border border-indigo-200">
                Institutional Audits
              </span>
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Automated multi-desk clearance for Accounts, Library, Laboratories, Hostel, Transport, and Training & Placement.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowRequestModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Request No-Dues
            </button>
            <button
              onClick={fetchRequests}
              className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition border border-slate-300"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Requests List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Clearance Applications ({requests.length})
          </div>
          {loading ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
              <p className="text-slate-400 text-xs">Loading requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
              <FileCheck2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-700 font-bold text-sm">No clearance requests</p>
            </div>
          ) : (
            requests.map((r) => {
              const isSelected = selectedRequest?.id === r.id;
              const clearedCount = (r.units || []).filter(u => u.status === 'CLEARED').length;
              const totalUnits = r.units?.length || 6;

              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRequest(r)}
                  className={`p-4 rounded-2xl border cursor-pointer transition select-none ${
                    isSelected
                      ? 'bg-white border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      Req #{r.id} • {r.academic_session}
                    </span>
                    {getStatusBadge(r.overall_status)}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{r.student_name}</h3>
                  <div className="text-xs text-slate-500">{r.roll_no} • {r.department}</div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">{r.purpose}</span>
                    <span className="font-bold text-slate-800">{clearedCount}/{totalUnits} Cleared</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Detailed Clearance Matrix */}
        <div className="lg:col-span-8">
          {selectedRequest ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-6">
              {/* Header of Request */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      Application ID #{selectedRequest.id}
                    </span>
                    {getStatusBadge(selectedRequest.overall_status)}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedRequest.student_name}</h2>
                  <p className="text-xs text-slate-500">
                    Roll No: <strong>{selectedRequest.roll_no}</strong> • Program: {selectedRequest.program}
                  </p>
                </div>

                {selectedRequest.overall_status === 'CLEARED' && (
                  <button
                    onClick={() => setShowCertificateModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                  >
                    <Printer className="w-4 h-4" />
                    Download No-Dues Certificate
                  </button>
                )}
              </div>

              {/* Departmental Clearance Units Grid */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Department Clearance Desks ({selectedRequest.units?.filter(u => u.status === 'CLEARED').length || 0} of {selectedRequest.units?.length || 0} Cleared)
                </h3>
                <div className="space-y-3">
                  {(selectedRequest.units || []).map((u, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="w-4 h-4 text-indigo-600" />
                          <h4 className="font-bold text-slate-800">{u.name}</h4>
                          {getStatusBadge(u.status)}
                        </div>
                        <p className="text-slate-600 text-[11px] italic">"{u.remarks}"</p>
                        {u.cleared_by && (
                          <div className="text-[10px] text-slate-400 mt-1">
                            Audited by: {u.cleared_by} {u.updated_at ? `on ${u.updated_at}` : ''}
                          </div>
                        )}
                      </div>

                      {isStaff && (
                        <button
                          onClick={() => {
                            setSelectedUnit(u);
                            setUnitForm({ status: u.status, remarks: u.remarks || '' });
                            setShowUnitModal(true);
                          }}
                          className="self-start sm:self-auto px-3 py-1.5 bg-white hover:bg-slate-100 text-indigo-700 font-semibold rounded-lg border border-slate-300 transition text-[11px]"
                        >
                          Audit & Update
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600 font-bold">Select an application to inspect clearance status</p>
            </div>
          )}
        </div>
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Initiate No-Dues Clearance</h3>
            <p className="text-xs text-slate-500 mb-4">This will submit a clearance docket to all 6 college administrative units.</p>

            <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Clearance Purpose *</label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Final Semester Exam Clearance & Degree Processing">Final Semester Exam Clearance & Degree</option>
                  <option value="Provisional Certificate & Migration Clearance">Provisional Certificate & Migration Clearance</option>
                  <option value="Semester Registration Routine Clearance">Semester Registration Routine Clearance</option>
                  <option value="Hostel Vacating & Caution Deposit Refund">Hostel Vacating & Caution Deposit Refund</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Unit Clearance Modal for Staff */}
      {showUnitModal && selectedUnit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Clearance Audit: {selectedUnit.name}</h3>
            <p className="text-xs text-slate-500 mb-4">Student: {selectedRequest?.student_name} ({selectedRequest?.roll_no})</p>

            <form onSubmit={handleUpdateUnit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Desk Status *</label>
                <select
                  value={unitForm.status}
                  onChange={(e) => setUnitForm({ ...unitForm, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="CLEARED">CLEARED (No Outstanding Dues)</option>
                  <option value="HOLD">HOLD (Outstanding Dues / Books / Equipment)</option>
                  <option value="PENDING">PENDING (Verification In-Progress)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Remarks *</label>
                <textarea
                  rows="3"
                  value={unitForm.remarks}
                  onChange={(e) => setUnitForm({ ...unitForm, remarks: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  required
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUnitModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                >
                  Save Clearance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Certificate Modal */}
      {showCertificateModal && selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 border-4 border-indigo-900 my-8 text-slate-900">
            {/* Header */}
            <div className="text-center pb-6 border-b-2 border-indigo-900/20">
              <div className="flex justify-center mb-2">
                <RVSLogo size="md" showText={false} />
              </div>
              <h2 className="text-xl font-black text-indigo-950 uppercase tracking-wide">
                R.V.S. College of Engineering & Technology
              </h2>
              <p className="text-xs font-bold text-slate-600">
                Edalbera, PO: Bhilai Pahari, NH-33, Jamshedpur, Jharkhand - 831012
              </p>
              <div className="inline-block mt-4 px-4 py-1 rounded-full bg-indigo-950 text-white font-extrabold text-sm uppercase tracking-wider">
                Official Institutional No-Dues Clearance Certificate
              </div>
            </div>

            {/* Certificate Meta */}
            <div className="flex justify-between items-center text-xs font-bold text-slate-700 my-4 px-2">
              <div>Certificate No: <span className="font-mono text-indigo-900">{selectedRequest.certificate_no}</span></div>
              <div>Issue Date: {selectedRequest.completed_at || new Date().toISOString().split('T')[0]}</div>
            </div>

            {/* Body */}
            <div className="text-xs text-slate-800 leading-relaxed my-4 px-2 space-y-2">
              <p>
                This is to officially certify that <strong>{selectedRequest.student_name}</strong>, bearing Roll Number <strong>{selectedRequest.roll_no}</strong> of the Department of <strong>{selectedRequest.department}</strong>, has successfully cleared all institutional dues, library holdings, laboratory apparatus, hostel rents, and administrative accounts.
              </p>
              <p>
                Clearance Purpose: <strong>{selectedRequest.purpose}</strong>.
              </p>
            </div>

            {/* Table of Clearance Desks */}
            <div className="my-6 border border-slate-300 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-2.5">Clearance Desk</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Audited By</th>
                    <th className="p-2.5">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedRequest.units?.map((u, i) => (
                    <tr key={i}>
                      <td className="p-2.5 font-bold">{u.name}</td>
                      <td className="p-2.5 text-emerald-700 font-black">CLEARED</td>
                      <td className="p-2.5 text-slate-600">{u.cleared_by || 'Verified'}</td>
                      <td className="p-2.5 text-slate-500 text-[11px]">{u.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-3 gap-4 pt-10 text-center text-xs font-bold text-slate-800">
              <div className="border-t border-slate-400 pt-2">
                <div>Accounts Officer</div>
                <div className="text-[10px] text-slate-400">RVSCET Jamshedpur</div>
              </div>
              <div className="border-t border-slate-400 pt-2">
                <div>Chief Librarian</div>
                <div className="text-[10px] text-slate-400">Central Library</div>
              </div>
              <div className="border-t border-slate-400 pt-2">
                <div>Dean Academics / Principal</div>
                <div className="text-[10px] text-slate-400">Official Seal</div>
              </div>
            </div>

            {/* Print button */}
            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-200">
              <button
                onClick={() => setShowCertificateModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-900 hover:bg-indigo-950 rounded-xl shadow-sm flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                Print Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
