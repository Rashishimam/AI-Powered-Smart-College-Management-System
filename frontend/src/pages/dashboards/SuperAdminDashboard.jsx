import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import StatCard from '../../components/StatCard';
import RVSLogo from '../../components/RVSLogo';
import { RVS_CONFIG } from '../../config/rvsConfig';
import { 
  Building2, 
  Users, 
  GraduationCap, 
  BookOpen, 
  ShieldCheck, 
  Activity, 
  Plus, 
  CheckCircle2, 
  MapPin, 
  Server
} from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';

export default function SuperAdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCollege, setNewCollege] = useState({ name: '', code: '', city: '', state: '' });
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      if (res.data?.success) {
        setData(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to load super admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleCreateCollege = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/colleges', newCollege);
      if (res.data?.success) {
        setNotification(`College "${newCollege.name}" registered successfully!`);
        setShowAddModal(false);
        setNewCollege({ name: '', code: '', city: '', state: '' });
        fetchStats();
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create college');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-900/20 border-t-blue-900 rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-medium">Loading Trust Governance Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="erp-card bg-gradient-to-r from-[#0a192f] via-[#0f2347] to-[#1e3a8a] text-white p-6 rounded-2xl relative overflow-hidden shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-4">
            <RVSLogo size="md" variant="light" showText={false} subtitle={false} className="shrink-0" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500 text-white">
                  RVS Educational Trust Secretariat
                </span>
                <span className="text-xs text-blue-200">Global Governance & ERP Core</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                RVS Educational Trust Board
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Chairman: {RVS_CONFIG.leadership.chairman} &bull; Secretary: {RVS_CONFIG.leadership.secretary}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="gold"
              size="sm"
              icon={Plus}
              onClick={() => setShowAddModal(true)}
            >
              Add Trust Campus
            </Button>
          </div>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Constituent Institutions"
          value={data?.totalColleges || 3}
          subtitle="Engineering & Polytechnic"
          icon={Building2}
          color="navy"
          trend="Active"
        />
        <StatCard
          title="Total Trust Students"
          value={data?.totalStudents || 398}
          subtitle="All programs across campuses"
          icon={Users}
          color="blue"
          trend="+12% YoY"
          trendType="up"
        />
        <StatCard
          title="Academic Faculty"
          value={data?.totalFaculty || 42}
          subtitle="Professors & Teaching Staff"
          icon={GraduationCap}
          color="emerald"
          trend="100% Filled"
        />
        <StatCard
          title="Cloud ERP Nodes"
          value="Online (99.9%)"
          subtitle="PostgreSQL Database Cluster"
          icon={Server}
          color="cyan"
          trend="Healthy"
          trendType="up"
        />
      </div>

      {/* Registered Campuses Table */}
      <Card>
        <CardHeader
          title="RVS Trust Institutions Directory"
          subtitle="Affiliated technical and vocational colleges operating under RVS Educational Trust"
          action={
            <Badge variant="primary" size="sm">
              Primary: RVSCET Jamshedpur
            </Badge>
          }
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left erp-table">
            <thead>
              <tr>
                <th>College / Institute</th>
                <th>Code</th>
                <th>Location</th>
                <th>Status</th>
                <th>Students</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {(data?.colleges || [
                { id: 1, name: 'RVS College of Engineering & Technology', code: 'RVSCET', city: 'Jamshedpur', state: 'Jharkhand', is_active: true }
              ]).map((col) => (
                <tr key={col.id}>
                  <td className="font-bold text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center font-bold text-xs border border-blue-200">
                        {col.code?.slice(0, 3) || 'RVS'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{col.name}</p>
                        <p className="text-[10px] text-slate-400">Approved by AICTE, Affiliated to JUT</p>
                      </div>
                    </div>
                  </td>
                  <td className="font-mono text-xs font-bold text-blue-900">{col.code}</td>
                  <td>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{col.city || 'Jamshedpur'}, {col.state || 'Jharkhand'}</span>
                    </div>
                  </td>
                  <td>
                    <Badge variant={col.is_active ? 'success' : 'neutral'} size="sm">
                      {col.is_active ? 'Operational' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="font-bold text-slate-900">{data?.totalStudents || 398}</td>
                  <td className="text-right">
                    <Button variant="outline" size="sm">
                      Inspect ERP
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add College Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Register Trust Campus"
        subtitle="Add a new institution to the RVS Smart Campus management cluster"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateCollege} className="space-y-4">
          <Input
            label="College Name"
            required
            value={newCollege.name}
            onChange={(e) => setNewCollege({ ...newCollege, name: e.target.value })}
            placeholder="e.g. RVS Polytechnic College"
          />
          <Input
            label="College Code"
            required
            value={newCollege.code}
            onChange={(e) => setNewCollege({ ...newCollege, code: e.target.value.toUpperCase() })}
            placeholder="e.g. RVSPC"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="City"
              required
              value={newCollege.city}
              onChange={(e) => setNewCollege({ ...newCollege, city: e.target.value })}
              placeholder="e.g. Jamshedpur"
            />
            <Input
              label="State"
              required
              value={newCollege.state}
              onChange={(e) => setNewCollege({ ...newCollege, state: e.target.value })}
              placeholder="e.g. Jharkhand"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={submitting}>
              Register Campus
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
