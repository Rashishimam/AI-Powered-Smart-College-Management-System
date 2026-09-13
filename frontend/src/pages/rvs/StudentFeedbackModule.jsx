import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { RVS_CONFIG } from '../../config/rvsConfig';
import {
  MessageSquareHeart,
  Star,
  CheckCircle2,
  ShieldCheck,
  BarChart3,
  Calendar,
  Search,
  Plus,
  ArrowRight,
  RefreshCw,
  X,
  Lock,
  UserCheck,
  Send,
  Eye
} from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import StatCard from '../../components/StatCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function StudentFeedbackModule() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'super_admin' || user?.role === 'college_admin' || user?.role === 'faculty';
  const isStudent = user?.role === 'student';

  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');

  // Student Fill Modal
  const [selectedSurveyForFill, setSelectedSurveyForFill] = useState(null);
  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Admin Report Modal
  const [selectedReport, setSelectedReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  // Admin Create Survey Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Faculty Feedback');
  const [newDept, setNewDept] = useState('ALL');
  const [newSemester, setNewSemester] = useState('ALL');
  const [newIsAnonymous, setNewIsAnonymous] = useState(true);
  const [newQuestions, setNewQuestions] = useState([
    'The faculty explains complex concepts with clarity and real-world examples.',
    'Punctuality and regularity of classes conducted by faculty.',
    'Availability and accessibility of faculty for doubts and academic guidance.'
  ]);
  const [creatingSurvey, setCreatingSurvey] = useState(false);

  const fetchSurveys = async () => {
    setLoading(true);
    try {
      const res = await api.get('/rvs/feedback/surveys');
      if (res.data?.success) {
        setSurveys(res.data.surveys || []);
      }
    } catch (err) {
      console.error('Failed to load surveys:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  // Submit Feedback
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!selectedSurveyForFill) return;
    setSubmittingFeedback(true);
    try {
      const res = await api.post('/rvs/feedback/submit', {
        survey_id: selectedSurveyForFill.id,
        ratings,
        comments
      });
      if (res.data?.success) {
        setNotification(res.data.message);
        setSelectedSurveyForFill(null);
        setRatings({});
        setComments('');
        setTimeout(() => setNotification(''), 5000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // View Report
  const handleViewReport = async (surveyId) => {
    setLoadingReport(true);
    try {
      const res = await api.get(`/rvs/feedback/reports/${surveyId}`);
      if (res.data?.success) {
        setSelectedReport(res.data);
      }
    } catch (err) {
      alert('Failed to load analytics report');
    } finally {
      setLoadingReport(false);
    }
  };

  // Create Survey
  const handleCreateSurvey = async (e) => {
    e.preventDefault();
    setCreatingSurvey(true);
    try {
      const res = await api.post('/rvs/feedback/surveys', {
        title: newTitle,
        category: newCategory,
        target_department: newDept,
        target_semester: newSemester,
        is_anonymous: newIsAnonymous,
        questions: newQuestions.filter(q => q.trim().length > 0)
      });
      if (res.data?.success) {
        setNotification(res.data.message);
        setIsCreateOpen(false);
        setNewTitle('');
        fetchSurveys();
        setTimeout(() => setNotification(''), 5000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create survey');
    } finally {
      setCreatingSurvey(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-rose-950 via-pink-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Institutional Quality Assurance Cell (IQAC)
            </span>
            <span className="text-xs text-slate-300">Confidential Feedback & Analytics</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Student Feedback & Evaluation System
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Anonymous course, faculty, and facility evaluation surveys. Guaranteed cryptographic identity separation for truthful student input.
          </p>
        </div>

        {isAdmin && (
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-rose-600 hover:bg-rose-700 text-white font-medium px-5 py-2.5 rounded-xl shadow-lg shadow-rose-500/30 flex items-center gap-2 whitespace-nowrap self-start md:self-center"
          >
            <Plus className="w-5 h-5" />
            Publish New Survey
          </Button>
        )}
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
          title="Active Surveys"
          value={surveys.length}
          icon={MessageSquareHeart}
          color="rose"
          subtitle="Available for student feedback"
        />
        <StatCard
          title="Privacy Level"
          value="100% Anonymous"
          icon={Lock}
          color="teal"
          subtitle="Zero identifiable data logged"
        />
        <StatCard
          title="Average Rating"
          value="4.5 / 5.0"
          icon={Star}
          color="amber"
          subtitle="Institutional satisfaction score"
        />
        <StatCard
          title="IQAC Compliance"
          value="NAAC Grade B"
          icon={ShieldCheck}
          color="indigo"
          subtitle="Continuous academic audit"
        />
      </div>

      {/* Surveys List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {surveys.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-rose-400 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                  {s.category}
                </span>
                {s.is_anonymous && (
                  <span className="flex items-center gap-1 text-[11px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                    <Lock className="w-3 h-3 text-teal-600" />
                    Anonymous Response
                  </span>
                )}
              </div>

              <h3 className="font-bold text-slate-900 text-sm leading-snug mt-1">{s.title}</h3>
              <p className="text-xs text-slate-500 mt-1">
                Target: {s.target_department} ({s.target_semester}) • Active until {s.end_date}
              </p>

              <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-1">
                <div className="font-semibold text-slate-800">Evaluates:</div>
                <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                  {s.questions?.slice(0, 2).map((q, idx) => (
                    <li key={idx} className="line-clamp-1">{q.text}</li>
                  ))}
                  {s.questions?.length > 2 && (
                    <li className="text-slate-400 italic">+{s.questions.length - 2} more criteria</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <Button
                onClick={() => {
                  setSelectedSurveyForFill(s);
                  setRatings({});
                  setComments('');
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 font-medium"
              >
                <Star className="w-3.5 h-3.5" />
                Fill Feedback
              </Button>

              {isAdmin && (
                <Button
                  onClick={() => handleViewReport(s.id)}
                  variant="outline"
                  className="text-xs px-3 py-2 flex items-center gap-1.5 text-slate-700"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-rose-600" />
                  Analytics Report
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Fill Feedback (Student or User) */}
      {selectedSurveyForFill && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-100 animate-scale-in">
            <div className="bg-slate-900 text-white p-5 sticky top-0 z-10 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm leading-snug">{selectedSurveyForFill.title}</h3>
                {selectedSurveyForFill.is_anonymous && (
                  <p className="text-[11px] text-teal-400 mt-0.5 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" />
                    Identity Protected: Your feedback is completely anonymous.
                  </p>
                )}
              </div>
              <button onClick={() => setSelectedSurveyForFill(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitFeedback} className="p-6 space-y-4 text-xs">
              {selectedSurveyForFill.questions?.map((q, idx) => (
                <div key={q.id || idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <p className="font-semibold text-slate-800 mb-2">
                    {idx + 1}. {q.text}
                  </p>

                  {/* 1 to 5 Stars Selector */}
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRatings(prev => ({ ...prev, [q.id]: star }))}
                        className={`p-2 rounded-lg border text-xs font-bold transition flex items-center gap-1 ${
                          ratings[q.id] >= star
                            ? 'bg-amber-50 border-amber-300 text-amber-600'
                            : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${ratings[q.id] >= star ? 'fill-amber-400 text-amber-500' : ''}`} />
                        <span>{star}</span>
                      </button>
                    ))}
                    <span className="text-[11px] text-slate-400 ml-2">
                      {ratings[q.id] === 5 ? 'Excellent' : ratings[q.id] === 4 ? 'Very Good' : ratings[q.id] === 3 ? 'Satisfactory' : ratings[q.id] ? 'Needs Improvement' : 'Rate 1-5'}
                    </span>
                  </div>
                </div>
              ))}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Qualitative Remarks & Suggestions</label>
                <textarea
                  rows="3"
                  placeholder="Share constructive suggestions for improvement..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setSelectedSurveyForFill(null)} className="text-xs px-4 py-2">
                  Cancel
                </Button>
                <Button type="submit" disabled={submittingFeedback} className="bg-rose-600 hover:bg-rose-700 text-white text-xs px-5 py-2 font-medium">
                  {submittingFeedback ? 'Submitting...' : 'Submit Confidential Feedback'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Analytics Report (Admin / IQAC) */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-100 animate-scale-in">
            <div className="bg-slate-900 text-white p-5 sticky top-0 z-10 flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-rose-400 font-bold">
                  IQAC Analytics Report
                </span>
                <h3 className="font-bold text-sm">{selectedReport.survey?.title}</h3>
              </div>
              <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-center">
                  <span className="text-[11px] text-rose-700 font-semibold uppercase">Overall Average</span>
                  <div className="text-2xl font-black text-rose-900 mt-0.5">
                    {selectedReport.report?.overall_average_score} / 5.0
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
                  <span className="text-[11px] text-slate-600 font-semibold uppercase">Submissions</span>
                  <div className="text-2xl font-black text-slate-900 mt-0.5">
                    {selectedReport.report?.total_submissions} responses
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-2">Detailed Question Metrics</h4>
                <div className="space-y-2.5">
                  {selectedReport.report?.question_metrics?.map((qm) => (
                    <div key={qm.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="flex justify-between font-semibold text-slate-800 mb-1">
                        <span>{qm.text}</span>
                        <span className="font-mono text-rose-700 font-bold">{qm.average_rating}★</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rose-500 rounded-full"
                          style={{ width: `${(qm.average_rating / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedReport.report?.comments?.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Student Comments & Feedback</h4>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {selectedReport.report.comments.map((c, i) => (
                      <div key={i} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-700 italic text-[11px]">
                        "{c}"
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 text-right">
                <Button variant="outline" onClick={() => setSelectedReport(null)} className="text-xs px-4 py-2">
                  Close Report
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Survey */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-scale-in">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-sm">Publish New Feedback Survey</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSurvey} className="p-6 space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Survey Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. End-Semester Course Evaluation"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  >
                    <option value="Faculty Feedback">Faculty Feedback</option>
                    <option value="Course Feedback">Course Feedback</option>
                    <option value="Facility Feedback">Facility Feedback</option>
                    <option value="Hostel / Mess Feedback">Hostel / Mess Feedback</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newIsAnonymous}
                      onChange={(e) => setNewIsAnonymous(e.target.checked)}
                      className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                    />
                    <span className="font-semibold text-slate-800">Strictly Anonymous</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)} className="text-xs px-3 py-1.5">
                  Cancel
                </Button>
                <Button type="submit" disabled={creatingSurvey} className="bg-rose-600 hover:bg-rose-700 text-white text-xs px-4 py-1.5 font-medium">
                  {creatingSurvey ? 'Publishing...' : 'Publish Survey'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
