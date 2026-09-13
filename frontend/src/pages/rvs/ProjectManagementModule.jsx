import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import {
  FolderGit2,
  Users,
  Award,
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Upload,
  UserCheck,
  Download,
  Calendar,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export default function ProjectManagementModule() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [showAssignGuideModal, setShowAssignGuideModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [toast, setToast] = useState(null);

  // Propose form state
  const [proposeForm, setProposeForm] = useState({
    title: '',
    category: 'Capstone / Major Project',
    department: 'CSE',
    abstract: '',
    technologies: '',
    group_name: '',
    members: []
  });
  const [similarityWarning, setSimilarityWarning] = useState(null);
  const [submittingProposal, setSubmittingProposal] = useState(false);

  // Guide assign state
  const [guideForm, setGuideForm] = useState({
    guide_name: '',
    co_guide_name: '',
    status: 'TOPIC APPROVED'
  });

  // Review state
  const [reviewForm, setReviewForm] = useState({
    review_number: 'Review 1 (Synopsis & Problem Definition)',
    scheduled_date: new Date().toISOString().split('T')[0],
    panel_text: 'Dr. Vikramaditya Sharma, Dr. Rajesh Kumar',
    problem_definition: 18,
    technical_progress: 18,
    implementation: 26,
    documentation: 14,
    presentation: 14,
    comments: ''
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
    fetchProjects();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/rvs/adv/projects');
      if (res.data?.success) {
        setProjects(res.data.projects || []);
        if (res.data.projects?.length > 0 && !selectedProject) {
          setSelectedProject(res.data.projects[0]);
        } else if (selectedProject) {
          const updated = res.data.projects.find(p => p.id === selectedProject.id);
          if (updated) setSelectedProject(updated);
        }
      }
    } catch (err) {
      console.error('Error loading projects:', err);
      showToast('Error loading project database', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Live Title Similarity Check
  const handleTitleChange = async (val) => {
    setProposeForm(prev => ({ ...prev, title: val }));
    if (val.trim().length > 6) {
      try {
        const res = await api.get(`/api/rvs/adv/projects/check-title?title=${encodeURIComponent(val)}`);
        if (res.data?.is_duplicate) {
          setSimilarityWarning(`Warning: An existing project with a very similar title already exists ("${res.data.similar[0].title}"). Please review to avoid duplicate submissions.`);
        } else {
          setSimilarityWarning(null);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      setSimilarityWarning(null);
    }
  };

  const handleProposeProject = async (e) => {
    e.preventDefault();
    setSubmittingProposal(true);
    try {
      const res = await api.post('/api/rvs/adv/projects', proposeForm);
      if (res.data?.success) {
        showToast(res.data.message || 'Project proposed successfully!');
        setShowProposeModal(false);
        setProposeForm({
          title: '',
          category: 'Capstone / Major Project',
          department: currentUser?.department || 'CSE',
          abstract: '',
          technologies: '',
          group_name: '',
          members: []
        });
        setSimilarityWarning(null);
        fetchProjects();
      }
    } catch (err) {
      console.error('Error proposing project:', err);
      showToast(err.response?.data?.message || 'Failed to submit project proposal', 'error');
    } finally {
      setSubmittingProposal(false);
    }
  };

  const handleAssignGuide = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;
    try {
      const res = await api.post(`/api/rvs/adv/projects/${selectedProject.id}/assign-guide`, guideForm);
      if (res.data?.success) {
        showToast(`Guide assigned to ${selectedProject.title}`);
        setShowAssignGuideModal(false);
        fetchProjects();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to assign guide', 'error');
    }
  };

  const handleRecordReview = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;
    try {
      const panel = reviewForm.panel_text.split(',').map(s => s.trim()).filter(Boolean);
      const criteria = {
        problem_definition: Number(reviewForm.problem_definition),
        technical_progress: Number(reviewForm.technical_progress),
        implementation: Number(reviewForm.implementation),
        documentation: Number(reviewForm.documentation),
        presentation: Number(reviewForm.presentation)
      };

      const res = await api.post(`/api/rvs/adv/projects/${selectedProject.id}/reviews`, {
        review_number: reviewForm.review_number,
        scheduled_date: reviewForm.scheduled_date,
        panel,
        criteria,
        comments: reviewForm.comments,
        status: 'Completed'
      });

      if (res.data?.success) {
        showToast(`Review evaluation saved (${res.data.review?.total_marks}/100)`);
        setShowReviewModal(false);
        fetchProjects();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to record review', 'error');
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Category', 'Department', 'Session', 'Status', 'Guide', 'Team Leader'];
    const rows = projects.map(p => [
      p.id,
      `"${p.title.replace(/"/g, '""')}"`,
      p.category,
      p.department,
      p.academic_session,
      p.status,
      p.guide_name,
      p.leader_student_name
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RVSCET_Projects_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Project repository exported as CSV');
  };

  const filteredProjects = projects.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchSearch = (p.title || '').toLowerCase().includes(q) ||
      (p.guide_name || '').toLowerCase().includes(q) ||
      (p.group_name || '').toLowerCase().includes(q) ||
      (p.leader_student_name || '').toLowerCase().includes(q);

    if (activeTab === 'MY') return matchSearch && p.is_user_project;
    if (activeTab !== 'ALL') return matchSearch && p.status === activeTab;
    return matchSearch;
  });

  const getStatusBadge = (st) => {
    switch (st) {
      case 'COMPLETED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> Completed</span>;
      case 'IN PROGRESS':
      case 'TOPIC APPROVED':
      case 'GUIDE ASSIGNED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200"><Clock className="w-3.5 h-3.5" /> {st}</span>;
      case 'REVIEW 1':
      case 'REVIEW 2':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200"><Award className="w-3.5 h-3.5" /> {st}</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200"><Clock className="w-3.5 h-3.5" /> {st}</span>;
    }
  };

  const canManage = ['super_admin', 'college_admin', 'faculty'].includes(currentUser?.role);

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
              <FolderGit2 className="w-4 h-4" />
              <span>Academics & Research Projects</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
              Final Year Project & Review Management
              <span className="text-xs bg-indigo-100 text-indigo-800 font-semibold px-2.5 py-1 rounded-full border border-indigo-200">
                Capstone Engine
              </span>
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              End-to-end group formations, guide allocation, configurable review rubrics, duplicate detection, and milestone evaluation.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowProposeModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Propose New Project
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition border border-slate-300"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={fetchProjects}
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
            placeholder="Search title, guide, student leader..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {['ALL', 'MY', 'PROPOSED', 'IN PROGRESS', 'REVIEW 1', 'COMPLETED'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab === 'ALL' ? 'All Projects' : tab === 'MY' ? 'My Projects' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Project List & Project Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Project Catalog */}
        <div className="lg:col-span-5 space-y-3">
          {loading ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
              <p className="text-slate-500 text-xs">Loading projects...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
              <FolderGit2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-700 font-bold text-sm">No projects found</p>
              <p className="text-slate-400 text-xs mt-1">Try adjusting your filters or propose a new project.</p>
            </div>
          ) : (
            filteredProjects.map(p => {
              const isSelected = selectedProject?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProject(p)}
                  className={`p-4 rounded-2xl border cursor-pointer transition select-none ${
                    isSelected
                      ? 'bg-white border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {p.department} • {p.academic_session}
                    </span>
                    {getStatusBadge(p.status)}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-2 mb-2">{p.title}</h3>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span>Guide: <strong className="text-slate-700">{p.guide_name}</strong></span>
                    <span>{p.members?.length || 1} Members</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Detailed Project Workspace & Reviews */}
        <div className="lg:col-span-7">
          {selectedProject ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-6">
              {/* Top Banner of Selected Project */}
              <div className="pb-4 border-b border-slate-100">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {selectedProject.category} • {selectedProject.academic_session}
                  </span>
                  {getStatusBadge(selectedProject.status)}
                </div>
                <h2 className="text-xl font-black text-slate-900 mb-2">{selectedProject.title}</h2>
                <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                  <span className="bg-slate-100 px-2.5 py-1 rounded-lg font-medium">
                    Group: <strong>{selectedProject.group_name}</strong>
                  </span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-lg font-medium">
                    Department: <strong>{selectedProject.department}</strong>
                  </span>
                </div>
              </div>

              {/* Guide Assignment Bar */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Project Faculty Guide</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">{selectedProject.guide_name}</div>
                  {selectedProject.co_guide_name && (
                    <div className="text-slate-500 text-[11px]">Co-Guide: {selectedProject.co_guide_name}</div>
                  )}
                </div>
                {canManage && (
                  <button
                    onClick={() => {
                      setGuideForm({
                        guide_name: selectedProject.guide_name !== 'Unassigned' ? selectedProject.guide_name : 'Dr. Vikramaditya Sharma',
                        co_guide_name: selectedProject.co_guide_name || '',
                        status: selectedProject.status
                      });
                      setShowAssignGuideModal(true);
                    }}
                    className="self-start sm:self-auto px-3 py-1.5 bg-white hover:bg-slate-100 text-indigo-700 font-semibold rounded-lg border border-slate-300 shadow-2xs transition"
                  >
                    Assign / Change Guide
                  </button>
                )}
              </div>

              {/* Abstract */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Project Abstract</h4>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                  {selectedProject.abstract}
                </p>
              </div>

              {/* Tech Stack & Team Members */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                  <h4 className="font-bold text-slate-500 uppercase tracking-wider mb-2">Technologies / Domain</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProject.technologies?.map((tech, i) => (
                      <span key={i} className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-semibold border border-indigo-100">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                  <h4 className="font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Team Members ({selectedProject.members?.length || 0})
                  </h4>
                  <div className="space-y-1">
                    {selectedProject.members?.map((m, i) => (
                      <div key={i} className="flex justify-between items-center text-slate-700">
                        <span><strong>{m.name}</strong> ({m.roll_no})</span>
                        <span className="text-[10px] bg-slate-200 px-1.5 py-0.2 rounded font-medium">{m.role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reviews & Evaluation Section */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-900">Project Reviews & Marking Rubrics</h3>
                  </div>
                  {canManage && (
                    <button
                      onClick={() => setShowReviewModal(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Record Review / Marks
                    </button>
                  )}
                </div>

                {selectedProject.reviews?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No reviews recorded yet for this project.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedProject.reviews?.map((rev) => (
                      <div key={rev.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-slate-900">{rev.review_number}</h4>
                          <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-emerald-100 text-emerald-800">
                            {rev.total_marks !== null ? `${rev.total_marks} / ${rev.max_marks} Marks` : 'Pending Marks'}
                          </span>
                        </div>
                        <div className="text-slate-500 mb-2">
                          Date: <strong className="text-slate-700">{rev.scheduled_date || 'N/A'}</strong> • Panel: {rev.panel?.join(', ')}
                        </div>

                        {/* Breakdown */}
                        {rev.criteria && Object.keys(rev.criteria).length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 my-2.5 p-2.5 bg-white rounded-lg border border-slate-200 text-center">
                            <div>
                              <div className="text-[10px] text-slate-400 font-semibold">Problem Def</div>
                              <div className="font-black text-slate-800">{rev.criteria.problem_definition} / 20</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-slate-400 font-semibold">Tech Progress</div>
                              <div className="font-black text-slate-800">{rev.criteria.technical_progress} / 20</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-slate-400 font-semibold">Implementation</div>
                              <div className="font-black text-slate-800">{rev.criteria.implementation} / 30</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-slate-400 font-semibold">Documentation</div>
                              <div className="font-black text-slate-800">{rev.criteria.documentation} / 15</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-slate-400 font-semibold">Presentation</div>
                              <div className="font-black text-slate-800">{rev.criteria.presentation} / 15</div>
                            </div>
                          </div>
                        )}

                        <div className="text-slate-600 bg-white p-2 rounded-lg border border-slate-100 text-[11px] italic">
                          "{rev.comments}"
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <FolderGit2 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600 font-bold">Select a project to inspect details</p>
            </div>
          )}
        </div>
      </div>

      {/* Propose Modal */}
      {showProposeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5 text-indigo-700">
                <FolderGit2 className="w-5 h-5" />
                <h3 className="text-lg font-bold text-slate-900">Propose Final Year Project</h3>
              </div>
              <button onClick={() => setShowProposeModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {similarityWarning && (
              <div className="p-3 mb-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{similarityWarning}</span>
              </div>
            )}

            <form onSubmit={handleProposeProject} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Project Title *</label>
                <input
                  type="text"
                  placeholder="e.g., IoT Enabled Smart Solar Inverter for Rural Energy"
                  value={proposeForm.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={proposeForm.category}
                    onChange={(e) => setProposeForm({ ...proposeForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Capstone / Major Project">Capstone / Major Project</option>
                    <option value="Industry Sponsored">Industry Sponsored</option>
                    <option value="Research & Development">Research & Development</option>
                    <option value="Rural / Social Innovation">Rural / Social Innovation</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Group Name</label>
                  <input
                    type="text"
                    placeholder="Team InnoTech"
                    value={proposeForm.group_name}
                    onChange={(e) => setProposeForm({ ...proposeForm, group_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Technologies / Domains (Comma separated) *</label>
                <input
                  type="text"
                  placeholder="Python, ROS2, PyTorch, React, Embedded C"
                  value={proposeForm.technologies}
                  onChange={(e) => setProposeForm({ ...proposeForm, technologies: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Project Abstract & Scope *</label>
                <textarea
                  rows="4"
                  placeholder="Briefly describe the engineering problem, proposed technical methodology, and deliverables..."
                  value={proposeForm.abstract}
                  onChange={(e) => setProposeForm({ ...proposeForm, abstract: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                  required
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProposeModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingProposal}
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm disabled:opacity-50"
                >
                  {submittingProposal ? 'Submitting...' : 'Submit Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Guide Modal */}
      {showAssignGuideModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5 text-indigo-700">
                <UserCheck className="w-5 h-5" />
                <h3 className="text-lg font-bold text-slate-900">Assign Faculty Guide</h3>
              </div>
              <button onClick={() => setShowAssignGuideModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAssignGuide} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Faculty Guide Name *</label>
                <input
                  type="text"
                  value={guideForm.guide_name}
                  onChange={(e) => setGuideForm({ ...guideForm, guide_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Co-Guide Name (Optional)</label>
                <input
                  type="text"
                  placeholder="Prof. Ananya Sen"
                  value={guideForm.co_guide_name}
                  onChange={(e) => setGuideForm({ ...guideForm, co_guide_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAssignGuideModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm"
                >
                  Save Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Evaluation Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5 text-indigo-700">
                <Award className="w-5 h-5" />
                <h3 className="text-lg font-bold text-slate-900">Record Review & Marks</h3>
              </div>
              <button onClick={() => setShowReviewModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleRecordReview} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Review Milestone</label>
                  <select
                    value={reviewForm.review_number}
                    onChange={(e) => setReviewForm({ ...reviewForm, review_number: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Review 1 (Synopsis & Problem Definition)">Review 1 (Synopsis & Problem)</option>
                    <option value="Review 2 (Prototype & Midterm)">Review 2 (Prototype & Midterm)</option>
                    <option value="Final Submission & Viva Voce">Final Submission & Viva Voce</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Evaluation Date</label>
                  <input
                    type="date"
                    value={reviewForm.scheduled_date}
                    onChange={(e) => setReviewForm({ ...reviewForm, scheduled_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Panel Members (Comma separated)</label>
                <input
                  type="text"
                  value={reviewForm.panel_text}
                  onChange={(e) => setReviewForm({ ...reviewForm, panel_text: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Rubrics Breakdown */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                <div className="font-bold text-slate-700 uppercase text-[11px] mb-1">
                  Marking Rubrics (Total: 100 Marks)
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-600 font-medium">Problem Definition (Max 20)</label>
                    <input
                      type="number"
                      max="20"
                      min="0"
                      value={reviewForm.problem_definition}
                      onChange={(e) => setReviewForm({ ...reviewForm, problem_definition: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 font-medium">Technical Progress (Max 20)</label>
                    <input
                      type="number"
                      max="20"
                      min="0"
                      value={reviewForm.technical_progress}
                      onChange={(e) => setReviewForm({ ...reviewForm, technical_progress: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 font-medium">Implementation (Max 30)</label>
                    <input
                      type="number"
                      max="30"
                      min="0"
                      value={reviewForm.implementation}
                      onChange={(e) => setReviewForm({ ...reviewForm, implementation: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 font-medium">Documentation (Max 15)</label>
                    <input
                      type="number"
                      max="15"
                      min="0"
                      value={reviewForm.documentation}
                      onChange={(e) => setReviewForm({ ...reviewForm, documentation: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-slate-600 font-medium">Presentation & Q&A (Max 15)</label>
                  <input
                    type="number"
                    max="15"
                    min="0"
                    value={reviewForm.presentation}
                    onChange={(e) => setReviewForm({ ...reviewForm, presentation: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    required
                  />
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-800">
                  <span>Computed Total Marks:</span>
                  <span className="text-indigo-700 text-sm">
                    {Number(reviewForm.problem_definition) +
                      Number(reviewForm.technical_progress) +
                      Number(reviewForm.implementation) +
                      Number(reviewForm.documentation) +
                      Number(reviewForm.presentation)} / 100
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Panel Feedback / Comments *</label>
                <textarea
                  rows="2"
                  value={reviewForm.comments}
                  onChange={(e) => setReviewForm({ ...reviewForm, comments: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  required
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm"
                >
                  Save Evaluation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
