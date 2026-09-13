import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  FileCheck,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Building,
  Calendar,
  User,
  ShieldCheck,
  Download
} from 'lucide-react';

export default function InternshipModule() {
  const [loading, setLoading] = useState(true);
  const [internships, setInternships] = useState([]);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [toast, setToast] = useState(null);

  // Submit form state
  const [form, setForm] = useState({
    company: '',
    role: '',
    internship_type: 'Industrial Training',
    mode: 'In-Office',
    start_date: '',
    end_date: '',
    stipend_amount: '',
    description: '',
    offer_letter_url: '',
    completion_cert_url: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Verify form state
  const [verifyForm, setVerifyForm] = useState({
    action: 'APPROVED',
    remarks: ''
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
    fetchInternships();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchInternships = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/rvs/adv/internships');
      if (res.data?.success) {
        setInternships(res.data.internships || []);
      }
    } catch (err) {
      console.error('Error fetching internships:', err);
      showToast('Error loading internships', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/api/rvs/adv/internships', form);
      if (res.data?.success) {
        showToast(res.data.message || 'Internship submitted successfully!');
        setShowSubmitModal(false);
        setForm({
          company: '',
          role: '',
          internship_type: 'Industrial Training',
          mode: 'In-Office',
          start_date: '',
          end_date: '',
          stipend_amount: '',
          description: '',
          offer_letter_url: '',
          completion_cert_url: ''
        });
        fetchInternships();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to submit internship', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!selectedInternship) return;
    try {
      const res = await api.post(`/api/rvs/adv/internships/${selectedInternship.id}/verify`, verifyForm);
      if (res.data?.success) {
        showToast(res.data.message || `Internship marked as ${verifyForm.action}`);
        setShowVerifyModal(false);
        fetchInternships();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Verification failed', 'error');
    }
  };

  const filtered = internships.filter(item => {
    const q = searchQuery.toLowerCase();
    const matchSearch = (item.student_name || '').toLowerCase().includes(q) ||
      (item.company || '').toLowerCase().includes(q) ||
      (item.role || '').toLowerCase().includes(q) ||
      (item.roll_no || '').toLowerCase().includes(q);

    if (activeFilter !== 'ALL') return matchSearch && item.status === activeFilter;
    return matchSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> Approved</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200"><AlertTriangle className="w-3.5 h-3.5" /> Rejected</span>;
      case 'UNDER REVIEW':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200"><Clock className="w-3.5 h-3.5" /> Under Review</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200"><Clock className="w-3.5 h-3.5" /> {status}</span>;
    }
  };

  const isStaff = ['super_admin', 'college_admin', 'faculty'].includes(currentUser?.role);

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
              <Briefcase className="w-4 h-4" />
              <span>Career & Industrial Exposure</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
              Internship Management
              <span className="text-xs bg-indigo-100 text-indigo-800 font-semibold px-2.5 py-1 rounded-full border border-indigo-200">
                Industry Credits
              </span>
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Student industrial training submissions, T&P verifications, stipend logs, and authorized corporate records for RVS College.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Internship
            </button>
            <button
              onClick={fetchInternships}
              className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition border border-slate-300"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search student name, company, roll no..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'SUBMITTED', 'UNDER REVIEW', 'APPROVED', 'REJECTED'].map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeFilter === f
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {f === 'ALL' ? 'All Records' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Internships */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
          <p className="text-slate-500 text-xs">Loading internship records...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">No internship records found</h3>
          <p className="text-slate-400 text-xs mt-1">Submit your corporate offer letter to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {item.internship_type}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{item.company}</h3>
                    <p className="text-xs font-semibold text-slate-600">{item.role}</p>
                  </div>
                  {getStatusBadge(item.status)}
                </div>

                <div className="text-xs text-slate-500 space-y-1.5 pt-3 border-t border-slate-100 mb-3">
                  <div className="flex items-center justify-between">
                    <span>Student:</span>
                    <strong className="text-slate-800">{item.student_name} ({item.roll_no})</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Duration:</span>
                    <span className="text-slate-700">{item.start_date} to {item.end_date}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Mode & Stipend:</span>
                    <span className="font-medium text-slate-800">{item.mode} • {item.stipend_amount}</span>
                  </div>
                </div>

                {item.description && (
                  <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3 line-clamp-2">
                    {item.description}
                  </p>
                )}

                {/* Verification History Log */}
                {item.verification_history?.length > 0 && (
                  <div className="text-[10px] bg-slate-50/80 p-2 rounded-lg border border-slate-100 mb-3 text-slate-500">
                    <span className="font-bold text-slate-700">Audit: </span>
                    {item.verification_history[item.verification_history.length - 1].action} by {item.verification_history[item.verification_history.length - 1].verified_by}
                    {item.verification_history[item.verification_history.length - 1].remarks && (
                      <span className="italic"> - "{item.verification_history[item.verification_history.length - 1].remarks}"</span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-400 font-medium">ID #{item.id}</span>
                <div className="flex items-center gap-2">
                  {isStaff && (
                    <button
                      onClick={() => {
                        setSelectedInternship(item);
                        setVerifyForm({ action: 'APPROVED', remarks: '' });
                        setShowVerifyModal(true);
                      }}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-lg transition border border-indigo-200"
                    >
                      Verify / Review
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Internship Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5 text-indigo-700">
                <Briefcase className="w-5 h-5" />
                <h3 className="text-lg font-bold text-slate-900">Add Internship Record</h3>
              </div>
              <button onClick={() => setShowSubmitModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Company / Organization *</label>
                  <input
                    type="text"
                    placeholder="e.g. Tata Steel, Infosys, Wipro"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Internship Role *</label>
                  <input
                    type="text"
                    placeholder="e.g. Full Stack Intern, QA Trainee"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Internship Type</label>
                  <select
                    value={form.internship_type}
                    onChange={(e) => setForm({ ...form, internship_type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Industrial Training">Industrial Training</option>
                    <option value="Summer Internship">Summer Internship</option>
                    <option value="Winter Internship">Winter Internship</option>
                    <option value="Full Semester Internship">Full Semester Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Work Mode</label>
                  <select
                    value={form.mode}
                    onChange={(e) => setForm({ ...form, mode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="In-Office">In-Office</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">End Date *</label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Stipend (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. ₹ 15,000 / month or Unpaid"
                  value={form.stipend_amount}
                  onChange={(e) => setForm({ ...form, stipend_amount: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Internship Description / Learning Outcomes</label>
                <textarea
                  rows="3"
                  placeholder="Briefly describe technologies used, project assignments and deliverables..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Internship'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verify Modal */}
      {showVerifyModal && selectedInternship && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5 text-indigo-700">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="text-lg font-bold text-slate-900">Verify Internship Record</h3>
              </div>
              <button onClick={() => setShowVerifyModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs mb-4">
              <div className="font-bold text-slate-900">{selectedInternship.student_name} ({selectedInternship.roll_no})</div>
              <div className="text-slate-600">{selectedInternship.role} at {selectedInternship.company}</div>
              <div className="text-slate-500 text-[11px]">{selectedInternship.start_date} to {selectedInternship.end_date}</div>
            </div>

            <form onSubmit={handleVerify} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Verification Decision *</label>
                <select
                  value={verifyForm.action}
                  onChange={(e) => setVerifyForm({ ...verifyForm, action: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="APPROVED">APPROVED (Verified for Academic Credits)</option>
                  <option value="UNDER REVIEW">UNDER REVIEW (Pending Employer Email / Docs)</option>
                  <option value="REJECTED">REJECTED (Invalid or Incomplete Documents)</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Verification Remarks *</label>
                <textarea
                  rows="3"
                  placeholder="e.g. Offer letter confirmed with HR. Recommended 6 academic credits."
                  value={verifyForm.remarks}
                  onChange={(e) => setVerifyForm({ ...verifyForm, remarks: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  required
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm"
                >
                  Save Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
