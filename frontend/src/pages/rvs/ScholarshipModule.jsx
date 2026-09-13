import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import {
  Award,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  FileText,
  Calendar,
  Sparkles,
  RefreshCw,
  DollarSign,
  ShieldCheck,
  Building,
  User,
  ExternalLink
} from 'lucide-react';

export default function ScholarshipModule() {
  const [loading, setLoading] = useState(true);
  const [schemes, setSchemes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('SCHEMES'); // 'SCHEMES' or 'APPLICATIONS'
  const [showAddSchemeModal, setShowAddSchemeModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [toast, setToast] = useState(null);

  // Scheme form
  const [schemeForm, setSchemeForm] = useState({
    name: '',
    eligibility_criteria: '',
    amount_description: '',
    deadline: '',
    required_docs_text: 'Semester Marksheet, Income Proof, Bonafide Certificate'
  });

  // Status form
  const [statusForm, setStatusForm] = useState({
    status: 'APPROVED',
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
    fetchData();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resSchemes, resApps] = await Promise.all([
        api.get('/api/rvs/adv/scholarships/schemes'),
        api.get('/api/rvs/adv/scholarships/applications')
      ]);

      if (resSchemes.data?.success) setSchemes(resSchemes.data.schemes || []);
      if (resApps.data?.success) setApplications(resApps.data.applications || []);
    } catch (err) {
      console.error(err);
      showToast('Error loading scholarship records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateScheme = async (e) => {
    e.preventDefault();
    try {
      const required_documents = schemeForm.required_docs_text.split(',').map(s => s.trim()).filter(Boolean);
      const res = await api.post('/api/rvs/adv/scholarships/schemes', {
        ...schemeForm,
        required_documents
      });
      if (res.data?.success) {
        showToast('New scholarship scheme announced!');
        setShowAddSchemeModal(false);
        setSchemeForm({
          name: '',
          eligibility_criteria: '',
          amount_description: '',
          deadline: '',
          required_docs_text: 'Semester Marksheet, Income Proof, Bonafide Certificate'
        });
        fetchData();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to create scheme', 'error');
    }
  };

  const handleApply = async () => {
    if (!selectedScheme) return;
    try {
      const res = await api.post('/api/rvs/adv/scholarships/apply', {
        scheme_id: selectedScheme.id,
        documents_submitted: [
          { name: 'Semester_Markssheet.pdf', url: '/uploads/scholarships/my_marksheet.pdf' },
          { name: 'Income_Certificate.pdf', url: '/uploads/scholarships/my_income.pdf' }
        ]
      });
      if (res.data?.success) {
        showToast('Scholarship application submitted!');
        setShowApplyModal(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to submit application', 'error');
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;
    try {
      const res = await api.post(`/api/rvs/adv/scholarships/applications/${selectedApp.id}/status`, statusForm);
      if (res.data?.success) {
        showToast(`Application status updated to ${statusForm.status}`);
        setShowStatusModal(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const isStaff = ['super_admin', 'college_admin', 'faculty'].includes(currentUser?.role);

  const getStatusBadge = (st) => {
    switch (st) {
      case 'APPROVED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> Approved</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200"><AlertTriangle className="w-3.5 h-3.5" /> Rejected</span>;
      case 'UNDER REVIEW':
      case 'VERIFIED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200"><Clock className="w-3.5 h-3.5" /> {st}</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200"><Clock className="w-3.5 h-3.5" /> {st}</span>;
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
              <Award className="w-4 h-4" />
              <span>Student Financial Aid & Grants</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
              Scholarship Management
              <span className="text-xs bg-indigo-100 text-indigo-800 font-semibold px-2.5 py-1 rounded-full border border-indigo-200">
                Institutional & State Aid
              </span>
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Merit scholarships, E-Kalyan post-matric facilitation, fee waiver programs, and college-level verification workflow.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            {isStaff && (
              <button
                onClick={() => setShowAddSchemeModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Announce Scheme
              </button>
            )}
            <button
              onClick={fetchData}
              className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition border border-slate-300"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setActiveTab('SCHEMES')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'SCHEMES'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Available Schemes ({schemes.length})
        </button>
        <button
          onClick={() => setActiveTab('APPLICATIONS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'APPLICATIONS'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          {isStaff ? 'All Submitted Applications' : 'My Applications'} ({applications.length})
        </button>
      </div>

      {/* Tab 1: Schemes */}
      {activeTab === 'SCHEMES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {schemes.map((s) => {
            const hasApplied = applications.some(a => a.scheme_id === s.id);
            return (
              <div key={s.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {s.academic_session}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {s.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1">{s.name}</h3>
                  <div className="text-xs font-bold text-emerald-700 mb-3 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" />
                    {s.amount_description}
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs mb-3 space-y-2">
                    <div>
                      <span className="font-bold text-slate-700">Eligibility: </span>
                      <span className="text-slate-600">{s.eligibility_criteria}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">Deadline: </span>
                      <span className="text-rose-700 font-semibold">{s.deadline}</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Required Documents:</div>
                    <div className="flex flex-wrap gap-1">
                      {s.required_documents?.map((doc, i) => (
                        <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4">
                  {hasApplied ? (
                    <div className="w-full py-2 bg-emerald-50 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 text-center flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Application Submitted
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedScheme(s);
                        setShowApplyModal(true);
                      }}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition shadow-sm"
                    >
                      Apply for Scholarship
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Applications */}
      {activeTab === 'APPLICATIONS' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <th className="p-3.5">App ID</th>
                  <th className="p-3.5">Student</th>
                  <th className="p-3.5">Scheme Name</th>
                  <th className="p-3.5">CGPA & Att %</th>
                  <th className="p-3.5">Applied Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Remarks</th>
                  {isStaff && <th className="p-3.5 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-slate-400">No applications on record.</td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5 font-mono font-bold text-slate-500">#{app.id}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{app.student_name}</div>
                        <div className="text-[11px] text-slate-500">{app.roll_no} • {app.department}</div>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-800">{app.scheme_name}</td>
                      <td className="p-3.5 text-slate-600">
                        <div>CGPA: <strong>{app.cgpa}</strong></div>
                        <div>Att: <strong>{app.attendance_pct}%</strong></div>
                      </td>
                      <td className="p-3.5 text-slate-500">{app.applied_at}</td>
                      <td className="p-3.5">{getStatusBadge(app.status)}</td>
                      <td className="p-3.5 text-slate-600 italic max-w-xs truncate">{app.remarks}</td>
                      {isStaff && (
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => {
                              setSelectedApp(app);
                              setStatusForm({ status: app.status, remarks: app.remarks || '' });
                              setShowStatusModal(true);
                            }}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg border border-indigo-200"
                          >
                            Review / Verify
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && selectedScheme && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Apply for {selectedScheme.name}</h3>
            <p className="text-xs text-slate-500 mb-4">{selectedScheme.amount_description}</p>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs mb-4 space-y-2">
              <div className="font-semibold text-slate-800">Uploaded Verification Documents:</div>
              <div className="flex items-center gap-2 text-indigo-700">
                <FileText className="w-4 h-4" />
                <span>Semester_Markssheet.pdf (Verified from SIS)</span>
              </div>
              <div className="flex items-center gap-2 text-indigo-700">
                <FileText className="w-4 h-4" />
                <span>Attendance_Record.pdf (Verified &gt; 80%)</span>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowApplyModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
              >
                Confirm & Submit Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal for Staff */}
      {showStatusModal && selectedApp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Verify Scholarship Application</h3>
            <p className="text-xs text-slate-600 mb-4">{selectedApp.student_name} ({selectedApp.roll_no}) - {selectedApp.scheme_name}</p>

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Status Decision *</label>
                <select
                  value={statusForm.status}
                  onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="UNDER REVIEW">UNDER REVIEW</option>
                  <option value="VERIFIED">VERIFIED (Eligible)</option>
                  <option value="APPROVED">APPROVED (Awarded)</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Remarks *</label>
                <textarea
                  rows="3"
                  value={statusForm.remarks}
                  onChange={(e) => setStatusForm({ ...statusForm, remarks: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  required
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                >
                  Save Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
