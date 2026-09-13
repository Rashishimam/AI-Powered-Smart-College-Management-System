import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { RVS_CONFIG } from '../../config/rvsConfig';
import {
  LifeBuoy,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Plus,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  X,
  MessageSquare,
  Filter,
  UserCheck,
  Tag,
  Check
} from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import StatCard from '../../components/StatCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function HelpdeskModule() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'super_admin' || user?.role === 'college_admin' || user?.role === 'faculty';

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [notification, setNotification] = useState('');

  // Create Ticket Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: 'Academic',
    subject: '',
    description: ''
  });
  const [submittingTicket, setSubmittingTicket] = useState(false);

  // Update Ticket Modal
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [targetStatus, setTargetStatus] = useState('IN PROGRESS');
  const [assignedStaff, setAssignedStaff] = useState('');
  const [resolutionText, setResolutionText] = useState('');

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/rvs/helpdesk/tickets', {
        params: {
          category: filterCategory,
          status: filterStatus
        }
      });
      if (res.data?.success) {
        setTickets(res.data.tickets || []);
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filterCategory, filterStatus]);

  // Handle New Ticket Submit
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmittingTicket(true);
    try {
      const res = await api.post('/rvs/helpdesk/tickets', formData);
      if (res.data?.success) {
        setNotification(res.data.message);
        setIsCreateOpen(false);
        setFormData({ category: 'Academic', subject: '', description: '' });
        fetchTickets();
        setTimeout(() => setNotification(''), 5000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit ticket');
    } finally {
      setSubmittingTicket(false);
    }
  };

  // Handle Ticket Status Update
  const handleUpdateTicket = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;
    try {
      const res = await api.post(`/rvs/helpdesk/tickets/${selectedTicket.id}/update`, {
        status: targetStatus,
        assigned_staff: assignedStaff,
        resolution: resolutionText
      });
      if (res.data?.success) {
        setNotification(res.data.message);
        setSelectedTicket(null);
        fetchTickets();
        setTimeout(() => setNotification(''), 5000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update ticket');
    }
  };

  // Filtered tickets by search
  const filteredTickets = tickets.filter(t =>
    t.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.user_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-violet-950 via-purple-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30">
              Campus Support Desk & Ticketing
            </span>
            <span className="text-xs text-slate-300">Fast Resolution Workflow</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Helpdesk & Issue Resolution
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Submit academic, fee, IT, hostel, and infrastructure tickets. Transparent multi-stage triage from creation to closure.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-violet-600 hover:bg-violet-700 text-white font-medium px-5 py-2.5 rounded-xl shadow-lg shadow-violet-500/30 flex items-center gap-2 whitespace-nowrap self-start md:self-center"
        >
          <Plus className="w-5 h-5" />
          Create Support Ticket
        </Button>
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
          title="Total Tickets"
          value={tickets.length}
          icon={LifeBuoy}
          color="indigo"
          subtitle="All filed service requests"
        />
        <StatCard
          title="Open / Assigned"
          value={tickets.filter(t => t.status === 'OPEN' || t.status === 'ASSIGNED').length}
          icon={AlertCircle}
          color="amber"
          subtitle="Pending staff review"
        />
        <StatCard
          title="In Progress"
          value={tickets.filter(t => t.status === 'IN PROGRESS').length}
          icon={Clock}
          color="blue"
          subtitle="Active remediation"
        />
        <StatCard
          title="Resolved"
          value={tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Successfully closed"
        />
      </div>

      {/* Tickets Table */}
      <Card>
        <CardHeader
          title="Support Tickets Registry & Status Tracker"
          action={
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search ticket #, subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 w-44 sm:w-56"
                />
              </div>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="ALL">All Categories</option>
                <option value="Academic">Academic</option>
                <option value="Accounts">Accounts / Fees</option>
                <option value="IT / Wi-Fi">IT / Wi-Fi</option>
                <option value="Library">Library</option>
                <option value="Hostel">Hostel</option>
                <option value="Transport">Transport</option>
                <option value="General">General</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="ALL">All Status</option>
                <option value="OPEN">OPEN</option>
                <option value="ASSIGNED">ASSIGNED</option>
                <option value="IN PROGRESS">IN PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
              </select>

              <button
                onClick={fetchTickets}
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
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Subject & Description</th>
                <th className="py-3 px-4">Submitted By</th>
                <th className="py-3 px-4">Assigned Staff</th>
                <th className="py-3 px-4">Status</th>
                {isAdmin && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="py-8 text-center text-slate-400 text-sm">
                    No tickets found matching filters.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-xs text-violet-700">
                      {t.ticket_number}
                      <span className="block text-[10px] text-slate-400 font-sans font-normal">{t.created_date}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {t.category}
                      </span>
                    </td>

                    <td className="py-3 px-4 max-w-sm">
                      <div className="font-semibold text-slate-900 text-xs">{t.subject}</div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{t.description}</p>
                      {t.resolution && (
                        <div className="mt-1 bg-emerald-50 text-emerald-800 text-[10px] p-1.5 rounded border border-emerald-200">
                          <strong>Resolution:</strong> {t.resolution}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-xs">
                      <div className="font-medium text-slate-800">{t.user_name}</div>
                      <span className="text-[10px] text-slate-400 uppercase">{t.user_role}</span>
                    </td>

                    <td className="py-3 px-4 text-xs text-slate-600">
                      {t.assigned_staff || <span className="text-slate-400 italic">Unassigned</span>}
                    </td>

                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          t.status === 'RESOLVED' || t.status === 'CLOSED' ? 'success' :
                          t.status === 'IN PROGRESS' ? 'info' :
                          t.status === 'ASSIGNED' ? 'warning' : 'default'
                        }
                      >
                        {t.status}
                      </Badge>
                    </td>

                    {isAdmin && (
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedTicket(t);
                            setTargetStatus(t.status);
                            setAssignedStaff(t.assigned_staff || '');
                            setResolutionText(t.resolution || '');
                          }}
                          className="text-xs px-2.5 py-1 rounded bg-slate-100 hover:bg-violet-100 text-violet-700 font-medium transition"
                        >
                          Manage
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: Create Ticket */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-scale-in">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <LifeBuoy className="w-5 h-5 text-violet-400" />
                  New Support Request
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Submit academic, hostel, fee, or technical grievances
                </p>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Issue Category *</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none"
                >
                  <option value="Academic">Academic / Marks / Attendance</option>
                  <option value="Accounts">Accounts / Tuition & Exam Fees</option>
                  <option value="IT / Wi-Fi">IT / Wi-Fi & Software Lab</option>
                  <option value="Library">Library Books & Book Bank</option>
                  <option value="Hostel">Hostel & Mess Facilities</option>
                  <option value="Transport">College Bus & Transport</option>
                  <option value="General">General Administrative Support</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="Brief summary of the issue..."
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Detailed Description *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Explain the issue with relevant details (e.g. subject code, room number, date)..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="text-xs px-4 py-2">
                  Cancel
                </Button>
                <Button type="submit" disabled={submittingTicket} className="bg-violet-600 hover:bg-violet-700 text-white text-xs px-5 py-2 font-medium">
                  {submittingTicket ? 'Submitting...' : 'Submit Ticket'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Manage Ticket (Admin / Staff) */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-scale-in">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                Manage Ticket: {selectedTicket.ticket_number}
              </h3>
              <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateTicket} className="p-5 space-y-3.5 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">{selectedTicket.subject}</div>
                <p className="text-slate-600">{selectedTicket.description}</p>
                <div className="text-[10px] text-slate-400">
                  Submitted by {selectedTicket.user_name} ({selectedTicket.category}) on {selectedTicket.created_date}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Status Workflow *</label>
                  <select
                    value={targetStatus}
                    onChange={(e) => setTargetStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="ASSIGNED">ASSIGNED</option>
                    <option value="IN PROGRESS">IN PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Assign Staff Member</label>
                  <input
                    type="text"
                    placeholder="e.g. Prof. Priya Sen / Er. Sandeep"
                    value={assignedStaff}
                    onChange={(e) => setAssignedStaff(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Resolution Summary / Remediation Notes</label>
                <textarea
                  rows="3"
                  placeholder="Details of the action taken to resolve this ticket..."
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button variant="outline" type="button" onClick={() => setSelectedTicket(null)} className="text-xs px-3 py-1.5">
                  Cancel
                </Button>
                <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white text-xs px-4 py-1.5 font-medium">
                  Update Ticket
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
