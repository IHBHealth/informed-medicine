'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, CheckCircle2, Clock, Trash2, Eye, Send } from 'lucide-react';

interface Submission {
  id: string;
  name: string;
  email: string | null;
  question: string;
  details: string | null;
  category: string;
  status: string;
  answer: string | null;
  answeredBy: string | null;
  answeredAt: string | null;
  createdAt: string;
}

export default function AdminQAPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'answered' | 'rejected'>('all');
  const [answering, setAnswering] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [answerBy, setAnswerBy] = useState('Dr. Sarah Chen, MD');
  const [saving, setSaving] = useState(false);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch(`/api/admin/qa?status=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions);
      }
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [filter]);

  const handleAnswer = async (id: string) => {
    if (!answerText.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/qa`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, answer: answerText, answeredBy: answerBy, status: 'answered' }),
      });
      if (res.ok) {
        setAnswering(null);
        setAnswerText('');
        fetchSubmissions();
      }
    } catch (err) {
      console.error('Failed to save answer:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await fetch(`/api/admin/qa`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      fetchSubmissions();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700"><Clock className="w-3 h-3" /> Pending</span>;
      case 'answered':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700"><CheckCircle2 className="w-3 h-3" /> Answered</span>;
      case 'rejected':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700"><Trash2 className="w-3 h-3" /> Rejected</span>;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Q&A Submissions</h1>
          <p className="text-sm text-gray-500 mt-1">Review and answer questions from visitors</p>
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'answered', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No submissions found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <div key={sub.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{sub.question}</h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <span>{sub.name}</span>
                    {sub.email && <span>({sub.email})</span>}
                    <span className="capitalize px-2 py-0.5 rounded bg-gray-100 text-xs">{sub.category}</span>
                    <span>{new Date(sub.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                {statusBadge(sub.status)}
              </div>

              {sub.details && (
                <p className="text-sm text-gray-600 bg-gray-50 rounded p-3 mb-4">{sub.details}</p>
              )}

              {sub.answer && (
                <div className="bg-green-50 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-green-800 mb-1">Answer by {sub.answeredBy}:</p>
                  <p className="text-sm text-green-900">{sub.answer}</p>
                </div>
              )}

              {answering === sub.id ? (
                <div className="space-y-3 border-t pt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Answered By</label>
                    <input
                      type="text"
                      value={answerBy}
                      onChange={(e) => setAnswerBy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                    <textarea
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Write your expert answer here..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAnswer(sub.id)}
                      disabled={saving}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save Answer'}
                    </button>
                    <button
                      onClick={() => { setAnswering(null); setAnswerText(''); }}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 border-t pt-4">
                  {sub.status === 'pending' && (
                    <>
                      <button
                        onClick={() => setAnswering(sub.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Answer
                      </button>
                      <button
                        onClick={() => handleStatusChange(sub.id, 'rejected')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </>
                  )}
                  {sub.status === 'answered' && (
                    <button
                      onClick={() => { setAnswering(sub.id); setAnswerText(sub.answer || ''); }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Edit Answer
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
