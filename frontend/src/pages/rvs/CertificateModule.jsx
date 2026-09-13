import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import {
  ShieldCheck,
  Search,
  Filter,
  Plus,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
  Ban,
  FileCheck,
  Eye,
  Sparkles,
  QrCode,
  Award
} from 'lucide-react';
import RVSLogo from '../../components/RVSLogo';
import { RVS_CONFIG } from '../../config/rvsConfig';

export default function CertificateModule() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'super_admin' || user?.role === 'college_admin';

  const [certificates, setCertificates] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [notification, setNotification] = useState('');

  // Modal States
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [previewCert, setPreviewCert] = useState(null);
  const [revokeCert, setRevokeCert] = useState(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [revoking, setRevoking] = useState(false);

  // Generate Form State
  const [genStudentId, setGenStudentId] = useState('');
  const [genTemplateType, setGenTemplateType] = useState('Bonafide Certificate');
  const [genPurpose, setGenPurpose] = useState('Education Loan Renewal & Scholarship Application');
  const [genSignatory, setGenSignatory] = useState('Prof. (Dr.) Rajesh Kumar Tiwari, Principal RVSCET');
  const [genCustomText, setGenCustomText] = useState('');
  const [generating, setGenerating] = useState(false);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedType !== 'all') params.template_type = selectedType;
      if (selectedStatus !== 'all') params.status = selectedStatus;
      if (search) params.search = search;

      const [certRes, tmplRes, stuRes] = await Promise.all([
        api.get('/rvs/certificates', { params }),
        api.get('/rvs/certificates/templates'),
        api.get('/rvs/students?limit=50')
      ]);

      if (certRes.data?.success) setCertificates(certRes.data.certificates || []);
      if (tmplRes.data?.success) setTemplates(tmplRes.data.templates || []);
      if (stuRes.data?.success) {
        setStudents(stuRes.data.students || []);
        if (stuRes.data.students?.length > 0 && !genStudentId) {
          setGenStudentId(stuRes.data.students[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [selectedType, selectedStatus, search]);

  // Handle Template Change in Form
  const handleTemplateChange = (typeName) => {
    setGenTemplateType(typeName);
    const tmpl = templates.find(t => t.name === typeName);
    if (tmpl) {
      setGenPurpose(tmpl.default_purpose);
      setGenCustomText(tmpl.template_text);
    }
  };

  // Generate Certificate Submission
  const handleGenerateSubmit = async (e) => {
    e.preventDefault();
    if (!genStudentId) {
      alert('Please select a student.');
      return;
    }
    try {
      setGenerating(true);
      const res = await api.post('/rvs/certificates/generate', {
        student_id: genStudentId,
        template_type: genTemplateType,
        purpose: genPurpose,
        custom_text: genCustomText,
        signatory: genSignatory
      });
      if (res.data?.success) {
        setNotification(res.data.message);
        setIsGenerateOpen(false);
        setPreviewCert(res.data.certificate);
        fetchCertificates();
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate certificate');
    } finally {
      setGenerating(false);
    }
  };

  // Revoke Certificate Submission
  const handleRevokeSubmit = async (e) => {
    e.preventDefault();
    if (!revokeCert || !revokeReason.trim()) return;
    try {
      setRevoking(true);
      const res = await api.post(`/rvs/certificates/${revokeCert.id}/revoke`, {
        reason: revokeReason
      });
      if (res.data?.success) {
        setNotification(res.data.message);
        setRevokeCert(null);
        fetchCertificates();
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to revoke certificate');
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 no-print">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
              RVS Institutional Registry & Certification Directorate
            </span>
            <span className="text-xs text-slate-500">
              Approved by AICTE &bull; JUT Ranchi Affiliated
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Official Certificates Registry & Verification Engine
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate Bonafide, Character, Course Completion, and Achievement Certificates with cryptographically verifiable QR tokens.
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsGenerateOpen(true);
                handleTemplateChange(templates[0]?.name || 'Bonafide Certificate');
              }}
              className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Generate Certificate
            </button>
          </div>
        )}
      </div>

      {/* Global Notification */}
      {notification && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in no-print">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3 no-print">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search certificate no, student, roll no..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-600/20"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-600/20"
          >
            <option value="all">All Certificate Templates</option>
            {templates.map(t => (
              <option key={t.id} value={t.name}>{t.name}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-600/20"
          >
            <option value="all">All Statuses</option>
            <option value="VALID">VALID</option>
            <option value="REVOKED">REVOKED</option>
          </select>
        </div>
      </div>

      {/* Certificate History Table */}
      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs no-print">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Certificate No</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Certificate Type</th>
                <th className="py-3 px-4">Purpose</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-blue-900/20 border-t-blue-900 rounded-full animate-spin mx-auto mb-2"></div>
                    Loading certificate records...
                  </td>
                </tr>
              ) : certificates.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    No certificates found matching criteria.
                  </td>
                </tr>
              ) : (
                certificates.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-950">
                      {c.certificate_no}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900 text-xs">{c.student_name}</p>
                      <span className="font-mono text-[10px] text-slate-500">{c.roll_no}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {c.template_type}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={c.purpose}>
                      {c.purpose}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                      {c.issue_date}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        c.status === 'VALID'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPreviewCert(c)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-900 text-[11px] font-bold transition-all border border-slate-200 cursor-pointer flex items-center gap-1"
                          title="Preview Certificate"
                        >
                          <Eye className="w-3 h-3" />
                          Preview
                        </button>

                        <a
                          href={`/verify/certificate/${encodeURIComponent(c.certificate_no)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-[11px] font-bold transition-all border border-slate-200 cursor-pointer flex items-center gap-1"
                          title="Public Verification"
                        >
                          <QrCode className="w-3 h-3 text-emerald-600" />
                          Verify
                        </a>

                        {isAdmin && c.status === 'VALID' && (
                          <button
                            onClick={() => {
                              setRevokeCert(c);
                              setRevokeReason('');
                            }}
                            className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 text-[11px] font-bold transition-all border border-rose-200 cursor-pointer"
                            title="Revoke Certificate"
                          >
                            <Ban className="w-3 h-3" />
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

      {/* Generate Certificate Modal */}
      {isGenerateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in no-print">
          <div className="relative w-full max-w-lg bg-slate-950 border border-slate-800 text-slate-100 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsGenerateOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                Generate Institutional Certificate
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Creates a numbered certificate with an official QR verification record in the RVSCET registry.
              </p>
            </div>

            <form onSubmit={handleGenerateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Select Candidate / Student *</label>
                <select
                  required
                  value={genStudentId}
                  onChange={(e) => setGenStudentId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.roll_no}) &bull; {s.department_code} ({s.semester})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Certificate Template *</label>
                <select
                  required
                  value={genTemplateType}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                >
                  {templates.map(t => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Official Purpose *</label>
                <input
                  type="text"
                  required
                  value={genPurpose}
                  onChange={(e) => setGenPurpose(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Authorized Signatory Name & Title</label>
                <input
                  type="text"
                  required
                  value={genSignatory}
                  onChange={(e) => setGenSignatory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Custom Certificate Body Text</label>
                <textarea
                  rows="4"
                  value={genCustomText}
                  onChange={(e) => setGenCustomText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white resize-none text-[11px]"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Supports placeholders: [STUDENT_NAME], [ROLL_NO], [REG_NO], [COURSE], [DEPARTMENT], [SESSION]
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGenerateOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {generating ? 'Generating...' : 'Issue Certificate & Register QR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Certificate Modal */}
      {previewCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl my-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800 no-print">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Official Institutional Certificate Preview
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Document
                </button>
                <button
                  onClick={() => setPreviewCert(null)}
                  className="p-1.5 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Certificate Canvas */}
            <CertificateCanvas cert={previewCert} />
          </div>
        </div>
      )}

      {/* Revoke Certificate Modal */}
      {revokeCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in no-print">
          <div className="relative w-full max-w-md bg-slate-950 border border-slate-800 text-slate-100 rounded-3xl p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setRevokeCert(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
                <Ban className="w-5 h-5" />
                Revoke Certificate
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Certificate No: <strong className="text-white font-mono">{revokeCert.certificate_no}</strong> ({revokeCert.student_name})
              </p>
            </div>

            <form onSubmit={handleRevokeSubmit} className="space-y-3 text-xs">
              <p className="text-rose-300 text-[11px] bg-rose-950/40 border border-rose-800/40 p-3 rounded-xl">
                <strong>Warning:</strong> Revoking this certificate immediately invalidates its public QR verification status. Subsequent verification scans will report <strong>REVOKED</strong>.
              </p>

              <div>
                <label className="block text-slate-400 mb-1">Mandatory Institutional Revocation Reason *</label>
                <textarea
                  rows="3"
                  required
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder="e.g. Superseded by updated documentation / Correction of roll number..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRevokeCert(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={revoking}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {revoking ? 'Revoking...' : 'Confirm Revocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Visual Certificate Layout Canvas
function CertificateCanvas({ cert }) {
  if (!cert) return null;

  return (
    <div className="bg-[#fffdf7] text-slate-900 p-8 sm:p-12 rounded-2xl border-4 border-double border-amber-600/80 shadow-2xl max-w-3xl mx-auto space-y-8 font-serif relative overflow-hidden">
      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
        <RVSLogo size="xl" showText={false} />
      </div>

      {/* Header */}
      <div className="text-center space-y-1 border-b-2 border-amber-800/40 pb-6 relative z-10">
        <div className="flex justify-center mb-2">
          <RVSLogo size="md" showText={false} />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-blue-950 uppercase tracking-wide font-sans">
          {RVS_CONFIG.name}
        </h2>
        <p className="text-[11px] text-slate-600 font-sans">
          Approved by AICTE, New Delhi &bull; Affiliated to Jharkhand University of Technology (JUT), Ranchi
        </p>
        <p className="text-[10px] font-semibold text-slate-700 font-sans">
          NAAC Accredited &bull; Jamshedpur, Jharkhand - 831012
        </p>
      </div>

      {/* Certificate Title */}
      <div className="text-center space-y-2 relative z-10">
        <span className="text-xs uppercase font-sans font-bold tracking-widest text-amber-700">
          Official Institutional Certificate
        </span>
        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase underline decoration-amber-500 underline-offset-8">
          {cert.template_type}
        </h3>
        <p className="font-mono text-xs text-slate-500 pt-1 font-sans">
          Certificate No: <strong className="text-blue-950">{cert.certificate_no}</strong>
        </p>
      </div>

      {/* Main Certificate Content */}
      <div className="text-sm sm:text-base leading-relaxed text-slate-800 text-justify px-2 sm:px-6 relative z-10">
        <p>{cert.content_text}</p>
      </div>

      {/* Purpose Badge */}
      <div className="px-6 text-xs text-slate-600 font-sans relative z-10">
        <p>
          <strong className="text-slate-800">Purpose:</strong> {cert.purpose}
        </p>
        <p>
          <strong className="text-slate-800">Issue Date:</strong> {cert.issue_date}
        </p>
      </div>

      {/* Footer: QR Code & Signatories */}
      <div className="grid grid-cols-3 gap-4 items-end pt-6 border-t border-slate-300 font-sans relative z-10">
        {/* QR Verification */}
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-white rounded-lg border border-slate-300">
            <QrCode className="w-12 h-12 text-slate-900" />
          </div>
          <div className="text-[9px] text-slate-500 leading-tight">
            <span className="font-bold text-slate-700 block">Scan to Verify</span>
            Official RVSCET Public Security Record
          </div>
        </div>

        {/* Institution Seal */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full border-2 border-amber-600/60 flex items-center justify-center text-center p-1 text-[8px] uppercase font-bold text-amber-800 leading-tight">
            OFFICIAL EMBOSSED SEAL
          </div>
        </div>

        {/* Signatory */}
        <div className="text-right space-y-0.5">
          <div className="h-10 flex items-end justify-end border-b border-dashed border-slate-400 mb-1">
            <span className="font-serif italic font-bold text-blue-950 text-sm">{cert.signatory.split(',')[0]}</span>
          </div>
          <strong className="text-xs text-slate-900 block">{cert.signatory}</strong>
          <span className="text-[10px] text-slate-500">RVSCET Jamshedpur</span>
        </div>
      </div>
    </div>
  );
}
