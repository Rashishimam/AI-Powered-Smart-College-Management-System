import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Search,
  Building,
  Calendar,
  Award,
  ExternalLink,
  Ban,
  Lock,
  ArrowRight
} from 'lucide-react';
import RVSLogo from '../../components/RVSLogo';
import { RVS_CONFIG } from '../../config/rvsConfig';

export default function PublicVerificationPage({ initialCertNo, onClose }) {
  const [certQuery, setCertQuery] = useState(initialCertNo || 'RVSCET/CERT/2026/001');
  const [loading, setLoading] = useState(false);
  const [verification, setVerification] = useState(null);
  const [error, setError] = useState(null);

  const performVerification = async (queryToVerify) => {
    const q = (queryToVerify || certQuery || '').trim();
    if (!q) return;

    try {
      setLoading(true);
      setError(null);
      setVerification(null);

      const res = await fetch(`/api/rvs/verify/certificate/${encodeURIComponent(q)}`);
      const data = await res.json();

      if (data?.success && data.verification) {
        setVerification(data.verification);
      } else {
        setError(data.message || 'No official record found for this certificate reference.');
      }
    } catch (err) {
      setError('Unable to contact the RVSCET Certificate Verification Engine. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCertNo) {
      performVerification(initialCertNo);
    } else {
      performVerification('RVSCET/CERT/2026/001');
    }
  }, [initialCertNo]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between font-sans selection:bg-amber-500 selection:text-slate-950 p-4 sm:p-8">
      {/* Top Navbar */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <RVSLogo size="sm" showText={false} />
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
              {RVS_CONFIG.name}
            </h1>
            <p className="text-[11px] text-slate-400">
              Official Public Document & Certificate Verification Portal
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
          >
            Back to System
          </button>
        )}
      </header>

      {/* Main Verification Card */}
      <main className="max-w-2xl mx-auto w-full my-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            Cryptographic Public Registry
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Verify Certificate Authenticity
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Verify bonafide, character, and course credentials issued by RVS College of Engineering & Technology, Jamshedpur.
          </p>
        </div>

        {/* Search / Lookup Input */}
        <div className="p-2 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-2 shadow-xl">
          <Search className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
          <input
            type="text"
            value={certQuery}
            onChange={(e) => setCertQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && performVerification()}
            placeholder="Enter Certificate No (e.g. RVSCET/CERT/2026/001)"
            className="flex-1 bg-transparent border-none text-xs text-white placeholder:text-slate-500 focus:outline-none font-mono"
          />
          <button
            onClick={() => performVerification()}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Verification Result Card */}
        {verification && (
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl space-y-5 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl ${
                  verification.status === 'VALID' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {verification.status === 'VALID' ? (
                    <CheckCircle2 className="w-7 h-7" />
                  ) : (
                    <Ban className="w-7 h-7" />
                  )}
                </div>
                <div>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    verification.status === 'VALID' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                  }`}>
                    {verification.status === 'VALID' ? 'AUTHENTIC & VALID' : 'CERTIFICATE REVOKED'}
                  </span>
                  <h3 className="text-lg font-black text-white mt-1">
                    {verification.template_type}
                  </h3>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Registry ID</span>
                <span className="font-mono text-xs font-bold text-amber-400">{verification.certificate_no}</span>
              </div>
            </div>

            {/* Non-Sensitive Public Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Issuing Institution</span>
                <strong className="text-slate-200 block text-xs">{verification.institution}</strong>
                <p className="text-[10px] text-slate-400">{verification.affiliation}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Issue Date</span>
                <strong className="text-slate-200 block font-mono">{verification.issue_date}</strong>
                <span className="text-[10px] text-slate-500 block">
                  Verified Timestamp: {new Date(verification.verified_at).toLocaleDateString()}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1 sm:col-span-2">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Authorized Signatory</span>
                <strong className="text-slate-200 block">{verification.signatory}</strong>
              </div>

              {verification.status === 'REVOKED' && (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 space-y-1 sm:col-span-2">
                  <span className="text-[10px] uppercase block font-bold text-rose-400">Institutional Revocation Notice:</span>
                  <p className="text-xs">{verification.revocation_reason}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                No Private Student Records Disclosed
              </span>
              <span>RVS College of Engineering & Technology</span>
            </div>
          </div>
        )}

        {/* Error Notice */}
        {error && (
          <div className="p-5 rounded-2xl bg-rose-950/50 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <p className="font-bold text-rose-200">Invalid or Unrecognized Certificate</p>
              <p className="text-[11px] text-rose-400 mt-0.5">{error}</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full py-4 border-t border-slate-800 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} RVS College of Engineering & Technology, Jamshedpur. All rights reserved.</p>
        <p className="text-[11px] text-slate-600 mt-0.5">
          Queries regarding document authenticity may be directed to <span className="text-slate-400 font-mono">registrar@rvscet.ac.in</span>
        </p>
      </footer>
    </div>
  );
}
