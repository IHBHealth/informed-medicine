'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageCirclePlus, X, Send, CheckCircle, LogIn } from 'lucide-react';
import { useUser } from './UserProvider';

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "heart-health", label: "Heart Health" },
  { value: "mental-health", label: "Mental Health" },
  { value: "nutrition", label: "Nutrition" },
  { value: "fitness", label: "Fitness" },
  { value: "sleep", label: "Sleep" },
  { value: "diabetes", label: "Diabetes" },
  { value: "medications", label: "Medications" },
  { value: "womens-health", label: "Women's Health" },
  { value: "mens-health", label: "Men's Health" },
  { value: "pediatrics", label: "Pediatrics" },
];

export default function AskQuestionForm() {
  const { user, loading } = useUser();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [question, setQuestion] = useState('');
  const [details, setDetails] = useState('');
  const [category, setCategory] = useState('general');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/qa/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user!.name,
          email: user!.email,
          question,
          details,
          category,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit');
      }

      setSubmitted(true);
      setQuestion('');
      setDetails('');
      setCategory('general');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  // Not logged in — show sign-in prompt
  if (!user) {
    if (!open) {
      return (
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <MessageCirclePlus className="w-5 h-5" />
          Ask a Question
        </button>
      );
    }

    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-border dark:border-slate-800 p-8 max-w-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-foreground">Sign in to Ask a Question</h3>
          <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-muted-foreground mb-6">
          Create a free account or sign in to submit your health question to our expert team.
        </p>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-slate-800 text-foreground font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  // Logged in — show button or form
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
      >
        <MessageCirclePlus className="w-5 h-5" />
        Ask a Question
      </button>
    );
  }

  if (submitted) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-green-200 dark:border-green-800/50 p-8 max-w-xl">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
          <h3 className="text-xl font-bold text-foreground">Question Submitted!</h3>
        </div>
        <p className="text-muted-foreground mb-4">
          Thank you for your question. Our team will review it and provide an expert answer.
          You&apos;ll see it appear on this page once it&apos;s been answered.
        </p>
        <button
          onClick={() => { setSubmitted(false); setOpen(false); }}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-border dark:border-slate-800 p-8 max-w-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-foreground">Ask a Health Question</h3>
          <p className="text-sm text-muted-foreground mt-1">Posting as {user.name}</p>
        </div>
        <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Your Question *</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            maxLength={500}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="e.g., Is it safe to take ibuprofen daily?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Additional Details (optional)</label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            maxLength={2000}
            rows={3}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            placeholder="Any context that might help our experts give a better answer..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          {submitting ? 'Submitting...' : 'Submit Question'}
        </button>
      </form>

      <p className="text-xs text-muted-foreground mt-4">
        Questions are reviewed by our medical team before being published.
        This is not a substitute for professional medical advice.
      </p>
    </div>
  );
}
