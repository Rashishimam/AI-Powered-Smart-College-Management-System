import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import {
  FileCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  X,
  Eye,
  Check,
  Ban,
  ShieldCheck,
  FileText,
  Clock
} from 'lucide-react';
import { RVS_CONFIG } from '../../config/rvsConfig';

export default function DocumentVerificationModule() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'super_admin' || user?.role === 'college_admin';

  const [documents, setDocuments] = useState([]);
  const [summary, setSummary] = useState({ total: 0, verified: 0, pending: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  // Verify / Reject Modal
  const [actionDoc, setActionDoc] = useState(null);
  const [actionType, setActionType] = useState('verify'); // verify or reject
  const [actionRemarks, setActionRemarks] = useState('');
  const [processing, setProcessing] = useState(false);
  const [notification, setNotification] = useState('');

  // Preview Modal
  const [previewDoc, setPreviewDoc] = useState(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedStatus !== 'all') params.status = selectedStatus;
      if (selectedType !== 'all') params.doc_type = selectedType;
      if (search) params.search = search;

      const res = await api.get('/rvs/documents', { params });
      if (res.data?.success) {
        setDocuments(res.data.documents || []);
        setSummary(res.data.summary || { total: 0, verified: 0, pending: 0, rejected: 0 });
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [selectedStatus, selectedType, search]);

  const handleConfirmAction = async (e) => {
    e.preventDefault();
    if (!actionDoc) return;

    try {
      setProcessing(true);
      const endpoint = actionType === 'verify'
        ? `/rvs/documents/${actionDoc.id}/verify`
        : `/rvs/documents/${actionDoc.id}/reject`;

      const res = await api.post(endpoint, { remarks: actionRemarks });
      if (res.data?.success) {
        setNotification(res.data.message);
        setActionDoc(null);
        fetchDocuments();
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
              RVS Academic Registrar & Admissions Desk
            </span>
            <span className="text-xs text-slate-500">
              Confidential Student Credentials Verification
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Student Document Verification & Scrutiny Registry
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verify matriculation marksheets, higher secondary credentials, JEE allotments, caste/income certificates, and migration dossiers.
          </p>
        </div>
      </div>

      {/* Global Notification */}
      {notification && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">Total Submitted</span>
          <p className="text-2xl font-black text-slate-900 mt-1 font-mono">{summary.total}</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Academic dossiers</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">Verified & Approved</span>
          <p className="text-2xl font-black text-emerald-600 mt-1 font-mono">{summary.verified}</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Valid credentials</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">Pending Scrutiny</span>
          <p className="text-2xl font-black text-amber-600 mt-1 font-mono">{summary.pending}</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Awaiting physical verification</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">Rejected / Deficient</span>
          <p className="text-2xl font-black text-rose-600 mt-1 font-mono">{summary.rejected}</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Requires resubmission</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student, roll no, file name..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-600/20"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-600/20"
          >
            <option value="all">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="VERIFIED">VERIFIED</option>
            <option value="REJECTED">REJECTED</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-600/20"
          >
            <option value="all">All Document Types</option>
            <option value="Class X Secondary Marksheet">Class X Marksheet</option>
            <option value="Class XII Higher Secondary Marksheet">Class XII Marksheet</option>
            <option value="JCECE / JEE Seat Allotment Letter">JEE Allotment Letter</option>
            <option value="Migration / Transfer Certificate">Migration / Transfer</option>
            <option value="Aadhaar Card / Government ID">Aadhaar / Gov ID</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Document Type</th>
                <th className="py-3 px-4">File Name</th>
                <th className="py-3 px-4">Upload Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Verification Audit Note</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-blue-900/20 border-t-blue-900 rounded-full animate-spin mx-auto mb-2"></div>
                    Loading document registry...
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    No documents matching current filters.
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900 text-xs">{doc.student_name}</p>
                      <span className="font-mono text-[10px] text-blue-900">{doc.roll_no}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {doc.doc_type}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                      {doc.file_name}
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-[11px]">
                      {doc.upload_date}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        doc.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                        doc.status === 'REJECTED' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                        'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-600 max-w-xs truncate" title={doc.remarks}>
                      {doc.verified_by ? (
                        <span>
                          <strong className="text-slate-800">{doc.verified_by}:</strong> {doc.remarks}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Pending inspection</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-900 text-[11px] font-bold transition-all border border-slate-200 cursor-pointer"
                          title="Preview Document"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {isAdmin && (
                          <>
                            {doc.status !== 'VERIFIED' && (
                              <button
                                onClick={() => {
                                  setActionDoc(doc);
                                  setActionType('verify');
                                  setActionRemarks('Verified against original physical credentials presented.');
                                }}
                                className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold transition-all border border-emerald-200 cursor-pointer"
                                title="Approve & Verify"
                              >
                                Verify
                              </button>
                            )}

                            {doc.status !== 'REJECTED' && (
                              <button
                                onClick={() => {
                                  setActionDoc(doc);
                                  setActionType('reject');
                                  setActionRemarks('Discrepancy in marksheet / Unreadable scan copy.');
                                }}
                                className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 text-[11px] font-bold transition-all border border-rose-200 cursor-pointer"
                                title="Reject Document"
                              >
                                Reject
                              </button>
                            )}
                          </>
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

      {/* Verify / Reject Confirmation Modal */}
      {actionDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-950 border border-slate-800 text-slate-100 rounded-3xl p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setActionDoc(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className={`text-base font-bold flex items-center gap-2 ${
                actionType === 'verify' ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {actionType === 'verify' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                {actionType === 'verify' ? 'Verify Student Document' : 'Reject Student Document'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Candidate: <strong className="text-white">{actionDoc.student_name}</strong> ({actionDoc.roll_no})
              </p>
              <p className="text-xs text-amber-400 font-semibold mt-0.5">{actionDoc.doc_type}</p>
            </div>

            <form onSubmit={handleConfirmAction} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Official Verification Remarks *</label>
                <textarea
                  rows="3"
                  required
                  value={actionRemarks}
                  onChange={(e) => setActionRemarks(e.target.value)}
                  placeholder={actionType === 'verify' ? 'e.g. Verified against original board marksheet.' : 'e.g. Scanned copy blurred / Details mismatch with admission form.'}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActionDoc(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className={`px-5 py-2 rounded-xl text-white font-bold cursor-pointer disabled:opacity-50 ${
                    actionType === 'verify' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  {processing ? 'Processing...' : (actionType === 'verify' ? 'Confirm Verification' : 'Confirm Rejection')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-950 border border-slate-800 text-slate-100 rounded-3xl p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setPreviewDoc(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{previewDoc.doc_type}</h3>
                <p className="text-xs text-slate-400 font-mono">File: {previewDoc.file_name}</p>
              </div>
            </div>

            <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 text-center space-y-2">
              <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="text-sm font-bold text-slate-200">Confidential Encrypted Document Record</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Student: <strong>{previewDoc.student_name}</strong> ({previewDoc.roll_no})
              </p>
              <p className="text-[11px] text-slate-500 font-mono">Uploaded: {previewDoc.upload_date}</p>
            </div>

            <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 text-xs space-y-1">
              <p className="flex justify-between"><span className="text-slate-400">Current Status:</span> <strong className="text-white">{previewDoc.status}</strong></p>
              <p className="flex justify-between"><span className="text-slate-400">Verified By:</span> <span className="text-slate-200">{previewDoc.verified_by || 'Pending'}</span></p>
              <p className="flex justify-between"><span className="text-slate-400">Remarks:</span> <span className="text-slate-200">{previewDoc.remarks || '-'}</span></p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
