import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { 
  Globe, 
  Save, 
  CheckCircle2, 
  Users, 
  FileText, 
  Eye, 
  AlertCircle,
  Megaphone,
  Award,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import StatCard from '../../components/StatCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Tabs from '../../components/ui/Tabs';

export default function WebsiteCMSModule() {
  const [activeTab, setActiveTab] = useState('cms'); // 'cms' or 'admissions'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState('');

  // CMS Content State
  const [cmsForm, setCmsForm] = useState({
    bannerHeadline: '',
    bannerSubtitle: '',
    admissionsNotice: '',
    placementHighlight: '',
    campusAlert: ''
  });

  // Admission Applications State
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [converting, setConverting] = useState(false);

  const loadCMSData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/rvs/cms/content');
      if (res.data?.success && res.data.content) {
        setCmsForm(res.data.content);
      }
    } catch (err) {
      console.error('Failed to load CMS content:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    try {
      setLoadingApps(true);
      const res = await api.get('/rvs/admissions/applications');
      if (res.data?.success) {
        setApplications(res.data.applications || []);
      }
    } catch (err) {
      console.error('Failed to load admission applications:', err);
    } finally {
      setLoadingApps(false);
    }
  };

  useEffect(() => {
    loadCMSData();
    loadApplications();
  }, []);

  const handleSaveCMS = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/rvs/cms/content', cmsForm);
      if (res.data?.success) {
        setNotification('Public website content successfully updated and published!');
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update CMS');
    } finally {
      setSaving(false);
    }
  };

  const handleConvertToStudent = async (appId) => {
    if (!window.confirm('Convert this applicant into a registered RVS student? This will auto-generate their Roll Number, Registration Number, and Student ERP account.')) {
      return;
    }

    setConverting(true);
    try {
      const res = await api.post(`/rvs/admissions/applications/${appId}/convert-to-student`);
      if (res.data?.success) {
        setNotification(res.data.message);
        loadApplications();
        setTimeout(() => setNotification(''), 5000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Conversion failed');
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary" size="sm">
              RVS Public Information & Web Directorate
            </Badge>
            <span className="text-xs text-slate-500">Live Website Content & Admissions Funnel</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Official Website CMS & Admission Pipeline
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage public website hero text, alerts, admissions announcements, and process applicant conversion.
          </p>
        </div>

        {notification && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notification}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('cms')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'cms' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Website CMS Content
        </button>
        <button
          onClick={() => setActiveTab('admissions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'admissions' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Admission Inquiries</span>
          <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-bold">
            {applications.length}
          </span>
        </button>
      </div>

      {/* Tab 1: CMS Content Editor */}
      {activeTab === 'cms' && (
        <Card>
          <CardHeader
            title="Public Homepage Content Management"
            subtitle="Changes published here immediately reflect across the public landing website without redeploy."
            icon={Globe}
          />

          <form onSubmit={handleSaveCMS} className="space-y-5 pt-4">
            <Input
              label="Hero Banner Main Headline"
              value={cmsForm.bannerHeadline || ''}
              onChange={(e) => setCmsForm({ ...cmsForm, bannerHeadline: e.target.value })}
              placeholder="e.g. Engineering Minds, Shaping the Future."
              required
            />

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Hero Subtitle & Institutional Accreditation Text
              </label>
              <textarea
                rows={3}
                className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:outline-none"
                value={cmsForm.bannerSubtitle || ''}
                onChange={(e) => setCmsForm({ ...cmsForm, bannerSubtitle: e.target.value })}
                placeholder="Institutional description on hero section..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Admissions Open Circular Highlight
                </label>
                <textarea
                  rows={2}
                  className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  value={cmsForm.admissionsNotice || ''}
                  onChange={(e) => setCmsForm({ ...cmsForm, admissionsNotice: e.target.value })}
                  placeholder="e.g. Admissions Open for B.Tech & MCA 2026-2027 Session..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Placement Headline Highlight
                </label>
                <textarea
                  rows={2}
                  className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  value={cmsForm.placementHighlight || ''}
                  onChange={(e) => setCmsForm({ ...cmsForm, placementHighlight: e.target.value })}
                  placeholder="e.g. 86% Placed in 2025-26 with ₹9.0 LPA Top Package..."
                />
              </div>
            </div>

            <Input
              label="Live Campus Emergency / Notification Alert Banner"
              value={cmsForm.campusAlert || ''}
              onChange={(e) => setCmsForm({ ...cmsForm, campusAlert: e.target.value })}
              placeholder="e.g. JUT Odd Semester Examination Form Filling active through campus portal."
            />

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={saving}
                icon={Save}
                className="bg-blue-900 hover:bg-blue-800 font-bold"
              >
                Publish Live to Public Website
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tab 2: Admission Applications & Conversion */}
      {activeTab === 'admissions' && (
        <Card>
          <CardHeader
            title="Online Admission Inquiries & Conversion Funnel"
            subtitle="Review prospective applicants and convert qualified candidates directly into enrolled students."
            icon={UserCheck}
          />

          <div className="pt-4 overflow-x-auto">
            <table className="w-full text-left text-xs erp-table">
              <thead>
                <tr>
                  <th>Application No</th>
                  <th>Applicant Name</th>
                  <th>Contact Info</th>
                  <th>Target Dept</th>
                  <th>12th / Diploma %</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.length > 0 ? (
                  applications.map((app) => (
                    <tr key={app.id}>
                      <td className="font-mono font-bold text-blue-900">{app.application_no}</td>
                      <td className="font-bold text-slate-900">{app.applicant_name}</td>
                      <td>
                        <p className="text-slate-800">{app.email}</p>
                        <p className="text-[11px] text-slate-500">{app.phone}</p>
                      </td>
                      <td>
                        <Badge variant="primary" size="sm">
                          {app.department_code}
                        </Badge>
                      </td>
                      <td className="font-semibold text-slate-800">{app.marks_12th_or_diploma}%</td>
                      <td>
                        <Badge
                          variant={app.status === 'ADMITTED' ? 'success' : app.status === 'OFFERED' ? 'gold' : 'neutral'}
                          size="sm"
                        >
                          {app.status}
                        </Badge>
                      </td>
                      <td className="text-right">
                        {app.status === 'ADMITTED' ? (
                          <span className="text-emerald-700 font-bold text-[11px] flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Enrolled
                          </span>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            loading={converting}
                            onClick={() => handleConvertToStudent(app.id)}
                            className="bg-emerald-700 hover:bg-emerald-600 font-bold"
                          >
                            Convert to Student
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No admission inquiries logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
