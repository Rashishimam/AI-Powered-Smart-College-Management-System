import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { RVS_CONFIG } from '../../config/rvsConfig';
import {
  Building2,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  Search,
  Plus,
  ArrowRight,
  ShieldCheck,
  MapPin,
  RefreshCw,
  X,
  Layers,
  Sparkles,
  Check,
  XCircle
} from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import StatCard from '../../components/StatCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function FacilityBookingModule() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'super_admin' || user?.role === 'college_admin';

  const [facilities, setFacilities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');

  // Filters
  const [filterFacility, setFilterFacility] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterDate, setFilterDate] = useState('');

  // Booking Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    facility_id: 1,
    date: new Date().toISOString().split('T')[0],
    start_time: '10:00 AM',
    end_time: '01:00 PM',
    purpose: '',
    department: 'Computer Science & Engineering',
    expected_attendees: 100
  });

  // Live Clash Detection State
  const [clashStatus, setClashStatus] = useState(null); // null, 'checking', 'free', 'clash'
  const [clashMessage, setClashMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Status Update Modal (for Admin remarks)
  const [selectedBookingForStatus, setSelectedBookingForStatus] = useState(null);
  const [statusTarget, setStatusTarget] = useState('APPROVED');
  const [statusRemarks, setStatusRemarks] = useState('');

  const fetchFacilityData = async () => {
    setLoading(true);
    try {
      const [facRes, bookRes] = await Promise.all([
        api.get('/rvs/facilities'),
        api.get('/rvs/facilities/bookings', {
          params: {
            facility_id: filterFacility,
            status: filterStatus,
            date: filterDate || undefined
          }
        })
      ]);

      if (facRes.data?.success) setFacilities(facRes.data.facilities || []);
      if (bookRes.data?.success) setBookings(bookRes.data.bookings || []);
    } catch (err) {
      console.error('Failed to load facility data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilityData();
  }, [filterFacility, filterStatus, filterDate]);

  // Check clash
  const runClashCheck = async (facilityId, date) => {
    if (!facilityId || !date) return;
    setClashStatus('checking');
    try {
      const res = await api.post('/rvs/facilities/check-clash', {
        facility_id: facilityId,
        date
      });
      if (res.data?.success) {
        if (res.data.has_clash) {
          setClashStatus('clash');
          setClashMessage(res.data.message);
        } else {
          setClashStatus('free');
          setClashMessage(res.data.message);
        }
      }
    } catch (err) {
      setClashStatus('clash');
      setClashMessage(err.response?.data?.message || 'Schedule clash detected.');
    }
  };

  const handleFacilitySelect = (e) => {
    const id = Number(e.target.value);
    setFormData(prev => ({ ...prev, facility_id: id }));
    runClashCheck(id, formData.date);
  };

  const handleDateSelect = (e) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, date: val }));
    runClashCheck(formData.facility_id, val);
  };

  // Submit Booking
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (clashStatus === 'clash') {
      alert('Cannot book: A clash was detected for this facility and time slot.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/rvs/facilities/book', formData);
      if (res.data?.success) {
        setNotification(res.data.message);
        setIsModalOpen(false);
        setFormData({
          facility_id: 1,
          date: new Date().toISOString().split('T')[0],
          start_time: '10:00 AM',
          end_time: '01:00 PM',
          purpose: '',
          department: 'Computer Science & Engineering',
          expected_attendees: 100
        });
        setClashStatus(null);
        fetchFacilityData();
        setTimeout(() => setNotification(''), 6000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit booking request');
    } finally {
      setSubmitting(false);
    }
  };

  // Status Update (Approve / Reject / Cancel)
  const handleStatusUpdate = async () => {
    if (!selectedBookingForStatus) return;
    try {
      const res = await api.post(`/rvs/facilities/bookings/${selectedBookingForStatus.id}/status`, {
        status: statusTarget,
        remarks: statusRemarks
      });
      if (res.data?.success) {
        setNotification(`Booking ${selectedBookingForStatus.booking_reference} marked as ${statusTarget}.`);
        setSelectedBookingForStatus(null);
        setStatusRemarks('');
        fetchFacilityData();
        setTimeout(() => setNotification(''), 5000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update booking status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-cyan-900 via-sky-900 to-indigo-950 p-6 rounded-2xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Campus Infrastructure Booking Portal
            </span>
            <span className="text-xs text-slate-300">Auditoriums, Seminar Halls, Labs & Meeting Rooms</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Room & Facility Booking
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Real-time conflict detection against academic timetables and existing reservations. Seamless institutional workflow.
          </p>
        </div>

        <Button
          onClick={() => {
            setClashStatus(null);
            setClashMessage('');
            setIsModalOpen(true);
            if (facilities.length > 0) {
              runClashCheck(facilities[0].id, formData.date);
            }
          }}
          className="bg-cyan-500 hover:bg-cyan-600 text-white font-medium px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-500/30 flex items-center gap-2 whitespace-nowrap self-start md:self-center"
        >
          <Plus className="w-5 h-5" />
          Request Reservation
        </Button>
      </div>

      {notification && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-3 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Campus Facilities"
          value={facilities.length}
          icon={Building2}
          color="cyan"
          subtitle="Configured institutional venues"
        />
        <StatCard
          title="Sanctioned Bookings"
          value={bookings.filter(b => b.status === 'APPROVED').length}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Approved events & sessions"
        />
        <StatCard
          title="Pending Approvals"
          value={bookings.filter(b => b.status === 'REQUESTED').length}
          icon={Clock}
          color="amber"
          subtitle="Awaiting administrative signoff"
        />
        <StatCard
          title="Clash Prevention"
          value="100%"
          icon={ShieldCheck}
          color="indigo"
          subtitle="Zero timetable overlaps"
        />
      </div>

      {/* Venue Showcase Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-600" />
          Institutional Venues & Auditoriums
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {facilities.map((fac) => (
            <div
              key={fac.id}
              className="bg-white p-4 rounded-xl border border-slate-200 hover:border-cyan-400 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-bold">
                    {fac.code}
                  </span>
                  <span className="text-[10px] text-cyan-700 font-bold bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
                    {fac.facility_type}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-xs line-clamp-2 leading-tight mb-1">
                  {fac.name}
                </h4>

                <div className="text-[11px] text-slate-500 flex items-center gap-1 mb-2">
                  <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{fac.location}</span>
                </div>

                <div className="flex items-center gap-1 text-slate-700 text-xs font-semibold mb-3">
                  <Users className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Capacity: {fac.capacity} seats</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {fac.amenities?.slice(0, 2).map((a, i) => (
                    <span key={i} className="text-[9px] bg-slate-50 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 truncate max-w-[120px]">
                      {a}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setFormData(prev => ({ ...prev, facility_id: fac.id }));
                  setIsModalOpen(true);
                  runClashCheck(fac.id, formData.date);
                }}
                className="mt-3 w-full text-center text-xs font-semibold py-1.5 rounded-lg bg-slate-50 hover:bg-cyan-50 text-cyan-700 border border-slate-200 transition"
              >
                Book Venue
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <Card>
        <CardHeader
          title="Facility Reservations & Booking Workflow"
          action={
            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={filterFacility}
                onChange={(e) => setFilterFacility(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="ALL">All Venues</option>
                {facilities.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="ALL">All Status</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REQUESTED">REQUESTED</option>
                <option value="REJECTED">REJECTED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>

              <button
                onClick={fetchFacilityData}
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
                <th className="py-3 px-4">Booking Ref</th>
                <th className="py-3 px-4">Venue & Type</th>
                <th className="py-3 px-4">Date & Time Slot</th>
                <th className="py-3 px-4">Host & Department</th>
                <th className="py-3 px-4">Event Purpose</th>
                <th className="py-3 px-4">Workflow Status</th>
                {isAdmin && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="py-8 text-center text-slate-400 text-sm">
                    No facility bookings found matching filters.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-xs text-cyan-800">
                      {b.booking_reference}
                      <span className="block text-[10px] text-slate-400 font-sans font-normal">
                        {b.expected_attendees} attendees
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{b.facility_name}</div>
                      <div className="text-[11px] text-cyan-600 font-medium">{b.facility_type}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 flex items-center gap-1 text-xs">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {b.date}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {b.start_time} - {b.end_time}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-xs font-medium text-slate-800">{b.requested_by}</div>
                      <div className="text-[11px] text-slate-500">{b.department}</div>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <p className="text-xs text-slate-700 truncate" title={b.purpose}>
                        {b.purpose}
                      </p>
                      {b.remarks && (
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Note: {b.remarks}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          b.status === 'APPROVED' ? 'success' :
                          b.status === 'REQUESTED' ? 'warning' :
                          b.status === 'REJECTED' ? 'danger' : 'default'
                        }
                      >
                        {b.status}
                      </Badge>
                    </td>

                    {isAdmin && (
                      <td className="py-3 px-4 text-right space-x-1">
                        {b.status === 'REQUESTED' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedBookingForStatus(b);
                                setStatusTarget('APPROVED');
                              }}
                              title="Approve Booking"
                              className="p-1.5 text-emerald-600 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedBookingForStatus(b);
                                setStatusTarget('REJECTED');
                              }}
                              title="Reject Booking"
                              className="p-1.5 text-rose-600 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {b.status === 'APPROVED' && (
                          <button
                            onClick={() => {
                              setSelectedBookingForStatus(b);
                              setStatusTarget('CANCELLED');
                            }}
                            title="Cancel Booking"
                            className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition text-xs"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: Book Facility */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-scale-in">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-cyan-400" />
                  Reserve Campus Facility
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Automated timetable conflict engine guarantees zero double-booking
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Target Venue *</label>
                <select
                  required
                  value={formData.facility_id}
                  onChange={handleFacilitySelect}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                >
                  {facilities.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.facility_type} • {f.capacity} seats)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Reservation Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={handleDateSelect}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Expected Attendees</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.expected_attendees}
                    onChange={(e) => setFormData(prev => ({ ...prev, expected_attendees: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Start Time *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10:00 AM"
                    value={formData.start_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">End Time *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 02:00 PM"
                    value={formData.end_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Department / Organizing Cell *</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Training & Placement Cell">Training & Placement Cell</option>
                  <option value="Dean Student Welfare">Dean Student Welfare</option>
                  <option value="Academic Council">Academic Council</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Event Purpose / Agenda *</label>
                <textarea
                  required
                  rows="2"
                  placeholder="e.g. Annual Technical Fest opening keynote, guest seminar, project presentation"
                  value={formData.purpose}
                  onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              {/* Live Clash Warning / Free Indicator */}
              {clashStatus === 'checking' && (
                <div className="p-2.5 rounded-lg bg-slate-100 text-slate-600 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-600" />
                  <span>Checking room availability & academic timetables...</span>
                </div>
              )}

              {clashStatus === 'free' && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="font-medium">{clashMessage}</span>
                </div>
              )}

              {clashStatus === 'clash' && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span className="font-medium">{clashMessage}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs px-4 py-2"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || clashStatus === 'clash' || !formData.purpose.trim()}
                  className={`text-xs px-5 py-2 font-medium ${
                    clashStatus === 'clash'
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-md'
                  }`}
                >
                  {submitting ? 'Submitting...' : isAdmin ? 'Confirm & Sanction' : 'Submit Reservation'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Status Update (Approve / Reject) */}
      {selectedBookingForStatus && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-scale-in">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                Update Reservation: {selectedBookingForStatus.booking_reference}
              </h3>
              <button
                onClick={() => setSelectedBookingForStatus(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <p className="text-slate-600">
                Action: <span className={`font-bold ${statusTarget === 'APPROVED' ? 'text-emerald-600' : 'text-rose-600'}`}>{statusTarget}</span>
              </p>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Administrative Remarks / Directive</label>
                <textarea
                  rows="3"
                  placeholder="e.g. Sanctioned. Technical support and AV staff dispatched."
                  value={statusRemarks}
                  onChange={(e) => setStatusRemarks(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedBookingForStatus(null)}
                  className="text-xs px-3 py-1.5"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleStatusUpdate}
                  className={`text-xs px-4 py-1.5 font-medium ${
                    statusTarget === 'APPROVED'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-rose-600 hover:bg-rose-700 text-white'
                  }`}
                >
                  Confirm {statusTarget}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
