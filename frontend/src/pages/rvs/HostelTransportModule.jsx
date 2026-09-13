import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { RVS_CONFIG } from '../../config/rvsConfig';
import {
  Home,
  Bus,
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
  Phone,
  Clock,
  ToggleLeft,
  ToggleRight,
  Wrench,
  Bed,
  Check,
  Building,
  Navigation
} from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import StatCard from '../../components/StatCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function HostelTransportModule() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'super_admin' || user?.role === 'college_admin';

  const [activeTab, setActiveTab] = useState('hostel'); // 'hostel' | 'transport'
  const [notification, setNotification] = useState('');
  const [loading, setLoading] = useState(true);

  // Hostel State
  const [hostelStatus, setHostelStatus] = useState({ enabled: true, summary: {} });
  const [buildings, setBuildings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [filterBuilding, setFilterBuilding] = useState('ALL');
  const [filterRoomStatus, setFilterRoomStatus] = useState('ALL');

  // Allocation Modal
  const [isAllocModalOpen, setIsAllocModalOpen] = useState(false);
  const [studentsList, setStudentsList] = useState([]);
  const [allocFormData, setAllocFormData] = useState({
    student_id: '',
    building_id: 1,
    room_number: 'A-101',
    bed_no: 'Bed-1',
    fee_status: 'PAID'
  });
  const [submittingAlloc, setSubmittingAlloc] = useState(false);

  // Complaint Modal
  const [isCompModalOpen, setIsCompModalOpen] = useState(false);
  const [compFormData, setCompFormData] = useState({
    room_number: '',
    category: 'Electrical / Fan Regulator',
    description: ''
  });

  // Transport State
  const [transportStatus, setTransportStatus] = useState({ enabled: true, summary: {} });
  const [routes, setRoutes] = useState([]);
  const [isRouteAllocModalOpen, setIsRouteAllocModalOpen] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState(1);
  const [passengerName, setPassengerName] = useState('');

  const fetchHostelData = async () => {
    try {
      const [statusRes, bldRes, roomRes, allocRes, compRes] = await Promise.all([
        api.get('/rvs/hostel/status'),
        api.get('/rvs/hostel/buildings'),
        api.get('/rvs/hostel/rooms', { params: { building_id: filterBuilding, status: filterRoomStatus } }),
        api.get('/rvs/hostel/allocations'),
        api.get('/rvs/hostel/complaints')
      ]);

      if (statusRes.data?.success) setHostelStatus(statusRes.data);
      if (bldRes.data?.success) setBuildings(bldRes.data.buildings || []);
      if (roomRes.data?.success) setRooms(roomRes.data.rooms || []);
      if (allocRes.data?.success) setAllocations(allocRes.data.allocations || []);
      if (compRes.data?.success) setComplaints(compRes.data.complaints || []);
    } catch (err) {
      console.error('Hostel fetch error:', err);
    }
  };

  const fetchTransportData = async () => {
    try {
      const [statusRes, routesRes] = await Promise.all([
        api.get('/rvs/transport/status'),
        api.get('/rvs/transport/routes')
      ]);

      if (statusRes.data?.success) setTransportStatus(statusRes.data);
      if (routesRes.data?.success) setRoutes(routesRes.data.routes || []);
    } catch (err) {
      console.error('Transport fetch error:', err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchHostelData(), fetchTransportData()]);

    // Fetch students list for allocation dropdown
    try {
      const uRes = await api.get('/users');
      if (uRes.data?.users) {
        setStudentsList(uRes.data.users.filter(u => u.role === 'student'));
      }
    } catch (e) {}

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [filterBuilding, filterRoomStatus]);

  // Toggle Modules
  const toggleHostelModule = async () => {
    try {
      const res = await api.post('/rvs/hostel/toggle');
      if (res.data?.success) {
        setNotification(res.data.message);
        fetchHostelData();
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (e) {
      alert('Failed to toggle hostel module');
    }
  };

  const toggleTransportModule = async () => {
    try {
      const res = await api.post('/rvs/transport/toggle');
      if (res.data?.success) {
        setNotification(res.data.message);
        fetchTransportData();
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (e) {
      alert('Failed to toggle transport module');
    }
  };

  // Submit Room Allocation
  const handleAllocSubmit = async (e) => {
    e.preventDefault();
    setSubmittingAlloc(true);
    try {
      const res = await api.post('/rvs/hostel/allocate', allocFormData);
      if (res.data?.success) {
        setNotification(res.data.message);
        setIsAllocModalOpen(false);
        fetchHostelData();
        setTimeout(() => setNotification(''), 5000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to allocate room');
    } finally {
      setSubmittingAlloc(false);
    }
  };

  // Submit Hostel Complaint
  const handleCompSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/rvs/hostel/complaints', compFormData);
      if (res.data?.success) {
        setNotification('Hostel maintenance complaint lodged.');
        setIsCompModalOpen(false);
        setCompFormData({ room_number: '', category: 'Electrical / Fan Regulator', description: '' });
        fetchHostelData();
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (e) {
      alert('Failed to submit complaint');
    }
  };

  // Submit Route Allocation
  const handleRouteAllocSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/rvs/transport/allocate', {
        route_id: selectedRouteId,
        student_name: passengerName
      });
      if (res.data?.success) {
        setNotification(res.data.message);
        setIsRouteAllocModalOpen(false);
        setPassengerName('');
        fetchTransportData();
        setTimeout(() => setNotification(''), 5000);
      }
    } catch (e) {
      alert('Failed to allocate transport');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Campus Logistics & Residential Services
            </span>
            <span className="text-xs text-slate-300">Hostels, Rooms & College Bus Fleet</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Hostel & Transport Management
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Optional modular services configurable by administration. Track room allotments, fee clearances, bus routes, and passenger seating.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-center">
          <div className="bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 flex items-center">
            <button
              onClick={() => setActiveTab('hostel')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'hostel'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              Hostels ({hostelStatus.enabled ? 'Enabled' : 'Disabled'})
            </button>
            <button
              onClick={() => setActiveTab('transport')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'transport'
                  ? 'bg-teal-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bus className="w-3.5 h-3.5" />
              Transport ({transportStatus.enabled ? 'Enabled' : 'Disabled'})
            </button>
          </div>

          {isAdmin && (
            <Button
              onClick={activeTab === 'hostel' ? toggleHostelModule : toggleTransportModule}
              variant="outline"
              className="text-xs border-slate-700 text-slate-200 hover:bg-slate-800 flex items-center gap-1.5"
            >
              {activeTab === 'hostel' ? (
                hostelStatus.enabled ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />
              ) : (
                transportStatus.enabled ? <ToggleRight className="w-4 h-4 text-teal-400" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />
              )}
              {activeTab === 'hostel' ? (hostelStatus.enabled ? 'Disable Module' : 'Enable Module') : (transportStatus.enabled ? 'Disable Module' : 'Enable Module')}
            </Button>
          )}
        </div>
      </div>

      {notification && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-3 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* TAB 1: HOSTEL MANAGEMENT */}
      {activeTab === 'hostel' && (
        <div className="space-y-6">
          {/* Hostel Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Hostel Buildings"
              value={buildings.length}
              icon={Building}
              color="emerald"
              subtitle="Boys & Girls Blocks"
            />
            <StatCard
              title="Available Rooms"
              value={hostelStatus.summary?.available_rooms || 0}
              icon={Bed}
              color="teal"
              subtitle="Vacant beds ready for allotment"
            />
            <StatCard
              title="Active Boarders"
              value={hostelStatus.summary?.total_residents || 0}
              icon={Users}
              color="indigo"
              subtitle="Registered hostel residents"
            />
            <StatCard
              title="Maintenance"
              value={hostelStatus.summary?.maintenance_rooms || 0}
              icon={Wrench}
              color="amber"
              subtitle="Under renovation / repair"
            />
          </div>

          {/* Building Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {buildings.map(b => (
              <div key={b.id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    b.type === 'Girls' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {b.type} Hostel
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{b.total_floors} Floors • {b.total_rooms} Rooms</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{b.name}</h3>
                <p className="text-xs text-slate-500 mt-1">Total Capacity: {b.capacity_beds} Beds</p>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-600">Warden: <strong className="text-slate-800">{b.warden_name}</strong></span>
                  <span className="text-slate-400 font-mono text-[11px]">{b.warden_phone}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Rooms and Allocations */}
          <Card>
            <CardHeader
              title="Hostel Room Inventory & Resident Allocation"
              action={
                <div className="flex flex-wrap items-center gap-2.5">
                  <select
                    value={filterBuilding}
                    onChange={(e) => setFilterBuilding(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="ALL">All Blocks</option>
                    {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>

                  <select
                    value={filterRoomStatus}
                    onChange={(e) => setFilterRoomStatus(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="ALL">All Room Status</option>
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="OCCUPIED">OCCUPIED</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                  </select>

                  {isAdmin && (
                    <Button
                      onClick={() => setIsAllocModalOpen(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Allocate Room
                    </Button>
                  )}

                  <Button
                    onClick={() => setIsCompModalOpen(true)}
                    variant="outline"
                    className="text-xs px-3 py-1.5 flex items-center gap-1.5 text-slate-700"
                  >
                    <Wrench className="w-3.5 h-3.5 text-amber-500" />
                    Lodge Complaint
                  </Button>
                </div>
              }
            />

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Room No</th>
                    <th className="py-3 px-4">Floor & Block</th>
                    <th className="py-3 px-4">Capacity</th>
                    <th className="py-3 px-4">Occupancy</th>
                    <th className="py-3 px-4">Fee / Semester</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rooms.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold font-mono text-slate-900">{r.room_number}</td>
                      <td className="py-3 px-4 text-xs text-slate-700">
                        {r.floor} • Block {r.building_id === 1 ? 'A' : r.building_id === 2 ? 'B' : 'C'}
                      </td>
                      <td className="py-3 px-4 text-xs font-medium text-slate-700">{r.bed_capacity} Beds</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                            <div
                              className={`h-full ${r.occupied_beds >= r.bed_capacity ? 'bg-rose-500' : 'bg-emerald-500'}`}
                              style={{ width: `${(r.occupied_beds / r.bed_capacity) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono text-slate-600">{r.occupied_beds}/{r.bed_capacity}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-800">₹{r.fee_per_semester.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <Badge variant={r.status === 'AVAILABLE' ? 'success' : r.status === 'OCCUPIED' ? 'danger' : 'warning'}>
                          {r.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: TRANSPORT MANAGEMENT */}
      {activeTab === 'transport' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Active Bus Routes"
              value={routes.length}
              icon={Navigation}
              color="teal"
              subtitle="Jamshedpur Campus Fleet"
            />
            <StatCard
              title="Total Fleet Capacity"
              value={transportStatus.summary?.total_capacity || 0}
              icon={Bus}
              color="indigo"
              subtitle="Comfortable high-back seats"
            />
            <StatCard
              title="Allocated Students"
              value={transportStatus.summary?.allocated_passengers || 0}
              icon={Users}
              color="emerald"
              subtitle="Registered daily commuters"
            />
            <StatCard
              title="Fleet Compliance"
              value="100%"
              icon={ShieldCheck}
              color="blue"
              subtitle="GPS tracked & speed governed"
            />
          </div>

          <div className="space-y-4">
            {routes.map((rt) => (
              <div key={rt.id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:border-teal-400 transition">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
                  <div>
                    <span className="font-mono text-xs bg-teal-50 text-teal-800 font-bold px-2 py-0.5 rounded border border-teal-200">
                      {rt.bus_number}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base mt-1">{rt.route_name}</h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs text-slate-500">Driver: <strong className="text-slate-800">{rt.driver_name}</strong></span>
                      <div className="text-[11px] text-slate-400 font-mono">{rt.driver_phone}</div>
                    </div>
                    {isAdmin && (
                      <Button
                        onClick={() => {
                          setSelectedRouteId(rt.id);
                          setIsRouteAllocModalOpen(true);
                        }}
                        className="bg-teal-600 hover:bg-teal-700 text-white text-xs px-3.5 py-2 rounded-lg"
                      >
                        Allocate Seat
                      </Button>
                    )}
                  </div>
                </div>

                {/* Stops Timeline */}
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Route Stops & Timings
                  </h4>
                  <div className="flex flex-wrap items-center gap-2">
                    {rt.stops?.map((stop, idx) => (
                      <React.Fragment key={idx}>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-teal-600" />
                          <span className="font-medium text-slate-800">{stop.name}</span>
                          <span className="text-[11px] font-mono font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">
                            {stop.time}
                          </span>
                        </div>
                        {idx < rt.stops.length - 1 && (
                          <ArrowRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span>Occupancy: <strong>{rt.allocated_students} / {rt.seating_capacity} Seats</strong></span>
                  <span className="text-emerald-600 font-semibold">{rt.seating_capacity - rt.allocated_students} Available</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Allocate Hostel Room */}
      {isAllocModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-scale-in">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Bed className="w-4 h-4 text-emerald-400" />
                Allocate Hostel Bed
              </h3>
              <button onClick={() => setIsAllocModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAllocSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Student *</label>
                <select
                  required
                  value={allocFormData.student_id}
                  onChange={(e) => setAllocFormData(prev => ({ ...prev, student_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="">-- Choose Student --</option>
                  {studentsList.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Hostel Building *</label>
                <select
                  value={allocFormData.building_id}
                  onChange={(e) => setAllocFormData(prev => ({ ...prev, building_id: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Room Number *</label>
                  <input
                    type="text"
                    required
                    value={allocFormData.room_number}
                    onChange={(e) => setAllocFormData(prev => ({ ...prev, room_number: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Bed Number *</label>
                  <input
                    type="text"
                    required
                    value={allocFormData.bed_no}
                    onChange={(e) => setAllocFormData(prev => ({ ...prev, bed_no: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Hostel Fee Status</label>
                <select
                  value={allocFormData.fee_status}
                  onChange={(e) => setAllocFormData(prev => ({ ...prev, fee_status: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="PAID">PAID</option>
                  <option value="PENDING">PENDING</option>
                  <option value="EXEMPTED">INSTITUTION SCHOLARSHIP</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button variant="outline" type="button" onClick={() => setIsAllocModalOpen(false)} className="text-xs px-3 py-1.5">
                  Cancel
                </Button>
                <Button type="submit" disabled={submittingAlloc} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-1.5 font-medium">
                  {submittingAlloc ? 'Allocating...' : 'Confirm Allocation'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Lodge Complaint */}
      {isCompModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-scale-in">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-400" />
                Hostel Maintenance Complaint
              </h3>
              <button onClick={() => setIsCompModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCompSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Room Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. A-101"
                  value={compFormData.room_number}
                  onChange={(e) => setCompFormData(prev => ({ ...prev, room_number: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Category</label>
                <select
                  value={compFormData.category}
                  onChange={(e) => setCompFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Electrical / Fan Regulator">Electrical / Fan / Lights</option>
                  <option value="Plumbing / Water Supply">Plumbing / Water Supply</option>
                  <option value="Carpentry / Bed / Door">Carpentry / Bed / Lock</option>
                  <option value="Wi-Fi / Network">Wi-Fi / LAN Port</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Describe the problem..."
                  value={compFormData.description}
                  onChange={(e) => setCompFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="outline" type="button" onClick={() => setIsCompModalOpen(false)} className="text-xs px-3 py-1.5">
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-1.5 font-medium">
                  Submit Complaint
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Allocate Transport Route */}
      {isRouteAllocModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100 animate-scale-in">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Assign Bus Pass</h3>
              <button onClick={() => setIsRouteAllocModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRouteAllocSubmit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Student / Passenger Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Kumar Verma"
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="outline" type="button" onClick={() => setIsRouteAllocModalOpen(false)} className="text-xs px-3 py-1.5">
                  Cancel
                </Button>
                <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white text-xs px-4 py-1.5 font-medium">
                  Allocate Bus Seat
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
