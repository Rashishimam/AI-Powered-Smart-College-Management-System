import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { 
  Megaphone, 
  Plus, 
  Tag, 
  Calendar, 
  Clock, 
  Download, 
  Printer, 
  CheckCircle2, 
  X, 
  AlertCircle,
  FileText,
  Paperclip,
  Share2,
  Eye
} from 'lucide-react';
import RVS_CONFIG from '../../config/rvsConfig';
import RVSLogo from '../../components/RVSLogo';
import Card, { CardHeader } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';

export default function NoticeBoardModule() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [notification, setNotification] = useState('');

  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    category: 'Academic',
    priority: 'normal',
    target_role: 'all'
  });

  const categories = ['All', 'Academic', 'Examination', 'Placement', 'Events', 'Scholarship', 'General'];

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/rvs/notices', {
        params: { category: selectedCategory === 'All' ? 'all' : selectedCategory }
      });
      if (res.data?.success) {
        setNotices(res.data.notices);
      }
    } catch (err) {
      console.error('Failed to load notices:', err);
      // Fallback notices
      setNotices([
        {
          id: 1,
          title: 'Jharkhand University of Technology (JUT) Odd Semester Examination Schedule 2026',
          category: 'Examination',
          priority: 'urgent',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          content: 'The end-semester theory and laboratory examinations for B.Tech (2nd, 4th, 6th, 8th Sem) and MCA will commence from October 15, 2026. Students must verify their internal marks and download their authenticated admit cards from the campus portal.',
          attachment_name: 'JUT_Exam_Schedule_Winter2026.pdf'
        },
        {
          id: 2,
          title: 'Campus Placement Drive: Tata Steel & Tata Motors GET Recruitment 2026',
          category: 'Placement',
          priority: 'urgent',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          content: 'Eligible candidates from B.Tech CSE, ME, EEE, and ECE with aggregate percentage >= 65% are required to submit their resumes before October 24, 2026. Pre-placement talk will be held in Auditorium 1.',
          attachment_name: 'Tata_Steel_GET_Criteria.pdf'
        },
        {
          id: 3,
          title: 'E-Kalyan Jharkhand Government Post-Matric Scholarship Verification Deadline',
          category: 'Scholarship',
          priority: 'normal',
          created_at: new Date(Date.now() - 259200000).toISOString(),
          content: 'All SC/ST/OBC students applying for tuition reimbursement under the Jharkhand E-Kalyan portal must submit their income certificates and fee receipts at the Administrative Block Counter 3.',
          attachment_name: 'EKalyan_Verification_Checklist.pdf'
        },
        {
          id: 4,
          title: 'Annual Tech Fest "TECHNO-RVS 2026" Hackathon & Robotics Championship',
          category: 'Events',
          priority: 'normal',
          created_at: new Date(Date.now() - 345600000).toISOString(),
          content: 'Registration is now live for the state-level coding sprint, autonomous robot racing, and model exhibition. Prizes worth ₹1,50,000 to be awarded by distinguished industry guests.',
          attachment_name: 'TechnoRVS_Events_Brochure.pdf'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [selectedCategory]);

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/announcements', newNotice);
      if (res.data?.success) {
        setNotification('Notice published to RVS Notice Board!');
        setShowAddModal(false);
        setNewNotice({ title: '', content: '', category: 'Academic', priority: 'normal', target_role: 'all' });
        fetchNotices();
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post notice');
    }
  };

  const isFacultyOrAdmin = user?.role === 'super_admin' || user?.role === 'college_admin' || user?.role === 'faculty';

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 no-print">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary" size="sm">
              RVS Administrative & Academic Directorate
            </Badge>
            <span className="text-xs text-slate-500">Official Electronic Notice Board</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Campus Circulars & Directives
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified institutional notices for students, faculty, examination timetables, and placement alerts.
          </p>
        </div>

        {isFacultyOrAdmin && (
          <Button
            variant="gold"
            size="sm"
            icon={Plus}
            onClick={() => setShowAddModal(true)}
          >
            Broadcast Notice
          </Button>
        )}
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-print">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === cat
                ? 'bg-blue-900 text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notice Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 no-print">
        {loading ? (
          <div className="col-span-2 py-16 text-center text-xs text-slate-400">
            <div className="w-6 h-6 border-2 border-blue-900/20 border-t-blue-900 rounded-full animate-spin mx-auto mb-2"></div>
            Loading official circulars...
          </div>
        ) : notices.length === 0 ? (
          <div className="col-span-2 py-16 text-center text-xs text-slate-400">
            No notices found under this category.
          </div>
        ) : (
          notices.map((notice) => (
            <Card key={notice.id} hover className="flex flex-col justify-between p-5">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        notice.category === 'Examination'
                          ? 'primary'
                          : notice.category === 'Placement'
                          ? 'gold'
                          : notice.category === 'Scholarship'
                          ? 'success'
                          : 'default'
                      }
                      size="sm"
                    >
                      {notice.category}
                    </Badge>

                    {notice.priority === 'urgent' && (
                      <Badge variant="danger" size="sm">
                        Urgent
                      </Badge>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(notice.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug tracking-tight">
                  {notice.title}
                </h3>

                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {notice.content}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                {notice.attachment_name ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-blue-700 font-medium">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[180px]">{notice.attachment_name}</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400">Official Directorate Notice</span>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Eye}
                    onClick={() => setSelectedNotice(notice)}
                  >
                    Read & Print
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Official Printable Circular Modal */}
      <Modal
        isOpen={!!selectedNotice}
        onClose={() => setSelectedNotice(null)}
        title="Official College Notice"
        subtitle="RVS College of Engineering & Technology, Jamshedpur"
        maxWidth="max-w-2xl"
      >
        {selectedNotice && (
          <div className="space-y-4">
            <div className="printable-area border-2 border-slate-300 rounded-2xl p-6 sm:p-8 bg-white text-slate-900">
              {/* College Header with Logo */}
              <div className="flex items-start justify-between pb-4 border-b-2 border-slate-900 gap-4">
                <div className="flex items-center gap-3">
                  <RVSLogo size="sm" showText={false} />
                  <div>
                    <h3 className="text-sm sm:text-base font-black uppercase tracking-tight text-slate-900 font-sans">
                      RVS College of Engineering & Technology
                    </h3>
                    <p className="text-[10px] text-slate-600 font-semibold uppercase">
                      Approved by AICTE, New Delhi &bull; Affiliated to JUT Ranchi
                    </p>
                    <p className="text-[9px] text-slate-500">
                      Edalbera, Bhilai Pahari, NH-33, Jamshedpur, Jharkhand - 831012
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200 text-[10px] font-bold uppercase">
                    OFFICIAL CIRCULAR
                  </span>
                  <p className="text-xs font-mono font-bold text-slate-800 mt-1">
                    REF: RVSCET/CIR/{selectedNotice.id}/2026
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Date: {new Date(selectedNotice.created_at).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Title & Subject */}
              <div className="py-4 border-b border-slate-200">
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge variant="primary" size="sm">{selectedNotice.category}</Badge>
                  {selectedNotice.priority === 'urgent' && <Badge variant="danger" size="sm">Urgent</Badge>}
                </div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  Subject: {selectedNotice.title}
                </h2>
              </div>

              {/* Notice Body */}
              <div className="py-4 text-xs leading-relaxed text-slate-800 space-y-3">
                <p>{selectedNotice.content}</p>
                <p className="text-slate-600">
                  All concerned students and department heads are advised to take necessary note and comply within the announced timelines.
                </p>
              </div>

              {/* Signatory Authority */}
              <div className="pt-8 mt-6 border-t border-slate-200 flex items-end justify-between text-xs">
                <div>
                  <p className="text-[10px] text-slate-500">Copy to:</p>
                  <p className="text-[9px] text-slate-400">1. All HODs & Deans</p>
                  <p className="text-[9px] text-slate-400">2. College Notice Boards</p>
                  <p className="text-[9px] text-slate-400">3. College ERP Portal</p>
                </div>

                <div className="text-right">
                  <div className="w-32 border-b border-slate-900 pb-1 mb-1">
                    <span className="font-serif italic font-bold text-blue-950">Prof. (Dr.) R. K. Tiwari</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-900 uppercase">Principal & Director</p>
                  <p className="text-[9px] text-slate-500">RVSCET Jamshedpur</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 no-print">
              <Button variant="outline" size="sm" onClick={() => setSelectedNotice(null)}>
                Close
              </Button>
              <Button variant="primary" size="sm" icon={Printer} onClick={() => window.print()}>
                Print Notice
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Broadcast Notice Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Broadcast College Notice"
        subtitle="Publish a signed circular across the campus portal"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateNotice} className="space-y-4">
          <Input
            label="Notice Subject"
            required
            value={newNotice.title}
            onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
            placeholder="e.g. End-Semester Examination Registration"
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Notice Full Body *
            </label>
            <textarea
              rows="4"
              required
              value={newNotice.content}
              onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
              className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:border-blue-600 focus:outline-none"
              placeholder="Enter official circular details..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Category"
              value={newNotice.category}
              onChange={(e) => setNewNotice({ ...newNotice, category: e.target.value })}
              options={categories.filter(c => c !== 'All').map(c => ({ value: c, label: c }))}
            />
            <Select
              label="Priority"
              value={newNotice.priority}
              onChange={(e) => setNewNotice({ ...newNotice, priority: e.target.value })}
              options={[
                { value: 'normal', label: 'Normal Circular' },
                { value: 'urgent', label: 'Urgent Circular' }
              ]}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Publish Notice
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
