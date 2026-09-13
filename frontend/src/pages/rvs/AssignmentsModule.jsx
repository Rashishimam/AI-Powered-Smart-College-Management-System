import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { 
  FileText, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Upload, 
  Award, 
  BookOpen,
  Calendar,
  User,
  AlertCircle,
  X,
  Send,
  Eye,
  Check
} from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import StatCard from '../../components/StatCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';

export default function AssignmentsModule() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');

  // Create Assignment Modal (Faculty / Admin)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    course_code: 'CS-601',
    title: '',
    description: '',
    deadline: '2026-11-20',
    max_marks: 25,
    department: 'CSE',
    semester: '6th Semester'
  });
  const [creating, setCreating] = useState(false);

  // Submit Modal (Student)
  const [submittingAssignment, setSubmittingAssignment] = useState(null);
  const [submitForm, setSubmitForm] = useState({ file_name: '', submission_text: '' });
  const [submitting, setSubmitting] = useState(false);

  // Review Submissions Modal (Faculty)
  const [inspectAssignment, setInspectAssignment] = useState(null);
  const [gradingSub, setGradingSub] = useState(null);
  const [gradeForm, setGradeForm] = useState({ marks: '', feedback: '' });
  const [grading, setGrading] = useState(false);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/rvs/assignments');
      if (res.data?.success) {
        setAssignments(res.data.assignments || []);
      }
    } catch (err) {
      console.error('Failed to load assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post('/rvs/assignments', createForm);
      if (res.data?.success) {
        setNotification('Assignment created and published to students!');
        setShowCreateModal(false);
        setCreateForm({
          course_code: 'CS-601',
          title: '',
          description: '',
          deadline: '2026-11-20',
          max_marks: 25,
          department: 'CSE',
          semester: '6th Semester'
        });
        fetchAssignments();
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create assignment.');
    } finally {
      setCreating(false);
    }
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!submittingAssignment) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/rvs/assignments/${submittingAssignment.id}/submit`, submitForm);
      if (res.data?.success) {
        setNotification('Assignment solution uploaded successfully!');
        setSubmittingAssignment(null);
        setSubmitForm({ file_name: '', submission_text: '' });
        fetchAssignments();
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGradeSubmission = async (e) => {
    e.preventDefault();
    if (!inspectAssignment || !gradingSub) return;
    setGrading(true);
    try {
      const res = await api.post(`/rvs/assignments/${inspectAssignment.id}/grade`, {
        student_id: gradingSub.student_id,
        marks: gradeForm.marks,
        feedback: gradeForm.feedback
      });
      if (res.data?.success) {
        setNotification('Evaluation saved successfully!');
        setGradingSub(null);
        setGradeForm({ marks: '', feedback: '' });
        fetchAssignments();
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Grading failed.');
    } finally {
      setGrading(false);
    }
  };

  const isFacultyOrAdmin = user?.role === 'faculty' || user?.role === 'college_admin' || user?.role === 'super_admin';
  const submittedCount = assignments.filter(a => a.submitted).length;

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary" size="sm">
              RVS Continuous Assessment Directorate
            </Badge>
            <span className="text-xs text-slate-500">Internal Coursework & Lab Submissions</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Academic Assignments & Lab Work
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit coursework, track submission deadlines, and review professor evaluations and feedback.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {notification && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{notification}</span>
            </div>
          )}

          {isFacultyOrAdmin && (
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-900 hover:bg-blue-800 font-bold"
            >
              Create Assignment
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Tasks"
          value={assignments.length}
          subtitle="Active semester assignments"
          icon={FileText}
          color="blue"
        />
        <StatCard
          title={user?.role === 'student' ? 'My Submissions' : 'Submissions Logged'}
          value={user?.role === 'student' ? submittedCount : assignments.reduce((acc, a) => acc + (a.submissions_count || 0), 0)}
          subtitle="Processed in LMS"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Pending Due"
          value={assignments.length - submittedCount}
          subtitle="Awaiting final submission"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Course Weightage"
          value="25 Marks"
          subtitle="Continuous Internal Evaluation"
          icon={Award}
          color="gold"
        />
      </div>

      {/* Assignments List */}
      <Card>
        <CardHeader
          title="Active Coursework Assignments"
          subtitle="All submissions are evaluated per Jharkhand University of Technology continuous internal marks rubric."
          icon={BookOpen}
        />

        <div className="pt-4 space-y-4">
          {assignments.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-blue-900/30 transition-all"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-blue-900 text-white font-mono text-xs font-bold">
                    {item.course_code}
                  </span>
                  <Badge variant="outline" size="sm">
                    {item.department} &bull; {item.semester}
                  </Badge>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Deadline: <strong className="text-slate-700">{item.deadline}</strong>
                  </span>
                  <span className="text-xs text-slate-500">
                    Max: <strong>{item.max_marks} Marks</strong>
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base">{item.title}</h3>
                {item.description && (
                  <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                )}

                {/* Student's Submission Feedback Display */}
                {item.submitted && item.marks !== null && (
                  <div className="mt-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-center gap-3">
                    <div className="font-bold text-emerald-900 text-sm">
                      Marks: {item.marks} / {item.max_marks}
                    </div>
                    {item.feedback && (
                      <div className="text-emerald-800 text-xs">
                        &bull; Feedback: &quot;{item.feedback}&quot;
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="shrink-0 flex items-center gap-2">
                {user?.role === 'student' ? (
                  item.submitted ? (
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Submitted
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSubmittingAssignment(item);
                          setSubmitForm({ file_name: '', submission_text: '' });
                        }}
                      >
                        Re-Submit
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Upload}
                      onClick={() => {
                        setSubmittingAssignment(item);
                        setSubmitForm({ file_name: '', submission_text: '' });
                      }}
                      className="bg-blue-900 font-bold"
                    >
                      Submit Assignment
                    </Button>
                  )
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Eye}
                    onClick={() => setInspectAssignment(item)}
                    className="font-bold text-blue-900"
                  >
                    View Submissions ({item.submissions_count || 0})
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Create Assignment Modal (Faculty/Admin) */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Academic Assignment"
          size="md"
        >
          <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Course Code"
                value={createForm.course_code}
                onChange={(e) => setCreateForm({ ...createForm, course_code: e.target.value })}
                placeholder="e.g. CS-601"
                required
              />
              <Input
                label="Max Marks"
                type="number"
                value={createForm.max_marks}
                onChange={(e) => setCreateForm({ ...createForm, max_marks: e.target.value })}
                required
              />
            </div>

            <Input
              label="Assignment Title"
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              placeholder="e.g. Implementation of Lexical Analyzer in Flex"
              required
            />

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Detailed Instructions & Lab Objectives
              </label>
              <textarea
                rows={3}
                className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-900 focus:outline-none"
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                placeholder="Specify submission guidelines, test cases, and file requirements..."
              />
            </div>

            <Input
              label="Submission Deadline Date"
              type="date"
              value={createForm.deadline}
              onChange={(e) => setCreateForm({ ...createForm, deadline: e.target.value })}
              required
            />

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" loading={creating} className="bg-blue-900 font-bold">
                Publish Assignment
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Student Submit Modal */}
      {submittingAssignment && (
        <Modal
          isOpen={Boolean(submittingAssignment)}
          onClose={() => setSubmittingAssignment(null)}
          title={`Submit: ${submittingAssignment.title}`}
          size="md"
        >
          <form onSubmit={handleSubmitAssignment} className="space-y-4 text-xs">
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-900">
              <p className="font-bold">{submittingAssignment.course_code} &bull; Max Marks: {submittingAssignment.max_marks}</p>
              <p className="text-[11px] text-blue-800 mt-0.5">Deadline: {submittingAssignment.deadline}</p>
            </div>

            <Input
              label="Archive / Report File Name"
              value={submitForm.file_name}
              onChange={(e) => setSubmitForm({ ...submitForm, file_name: e.target.value })}
              placeholder={`e.g. ${user?.name ? user.name.replace(/\s+/g, '_') : 'Student'}_Assgn_${submittingAssignment.course_code}.pdf`}
              required
            />

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Student Notes / Execution Remarks
              </label>
              <textarea
                rows={3}
                className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-900 focus:outline-none"
                value={submitForm.submission_text}
                onChange={(e) => setSubmitForm({ ...submitForm, submission_text: e.target.value })}
                placeholder="Include link to repo, compiler notes, or test results..."
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setSubmittingAssignment(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" loading={submitting} className="bg-blue-900 font-bold">
                Upload Submission
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Faculty Submissions Review Modal */}
      {inspectAssignment && (
        <Modal
          isOpen={Boolean(inspectAssignment)}
          onClose={() => { setInspectAssignment(null); setGradingSub(null); }}
          title={`Submissions for: ${inspectAssignment.title}`}
          size="lg"
        >
          <div className="space-y-4 text-xs">
            {gradingSub ? (
              <form onSubmit={handleGradeSubmission} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h4 className="font-bold text-slate-900">
                    Grading: {gradingSub.student_name} ({gradingSub.roll_no})
                  </h4>
                  <button type="button" onClick={() => setGradingSub(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label={`Marks (Out of ${inspectAssignment.max_marks})`}
                    type="number"
                    max={inspectAssignment.max_marks}
                    value={gradeForm.marks}
                    onChange={(e) => setGradeForm({ ...gradeForm, marks: e.target.value })}
                    required
                  />
                  <Input
                    label="Evaluator Feedback"
                    value={gradeForm.feedback}
                    onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                    placeholder="e.g. Well-structured code, passes all test cases."
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setGradingSub(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm" loading={grading} className="bg-emerald-700 font-bold">
                    Save Marks & Feedback
                  </Button>
                </div>
              </form>
            ) : null}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs erp-table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>Submitted File</th>
                    <th>Submission Date</th>
                    <th>Status / Marks</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(inspectAssignment.submissions || []).length > 0 ? (
                    inspectAssignment.submissions.map((sub, i) => (
                      <tr key={i}>
                        <td className="font-mono font-bold text-blue-900">{sub.roll_no}</td>
                        <td className="font-bold text-slate-900">{sub.student_name}</td>
                        <td className="font-mono text-slate-600">{sub.file_name}</td>
                        <td>{new Date(sub.submitted_at).toLocaleDateString('en-IN')}</td>
                        <td>
                          {sub.marks !== null ? (
                            <Badge variant="success" size="sm">
                              {sub.marks} / {inspectAssignment.max_marks}
                            </Badge>
                          ) : (
                            <Badge variant="warning" size="sm">
                              Pending Evaluation
                            </Badge>
                          )}
                        </td>
                        <td className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setGradingSub(sub);
                              setGradeForm({ marks: sub.marks || '', feedback: sub.feedback || '' });
                            }}
                          >
                            {sub.marks !== null ? 'Re-Grade' : 'Enter Marks'}
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No student submissions uploaded yet for this assignment.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
