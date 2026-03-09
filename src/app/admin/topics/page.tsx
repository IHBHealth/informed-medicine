'use client';

import { useState, useEffect } from 'react';
import { Trash2, Check, X } from 'lucide-react';

interface Topic {
  id: string;
  name: string;
  category: string;
  active: boolean;
  priority: number;
  promptTemplate: string;
}

const CATEGORIES = [
  'Cardiology',
  'Neurology',
  'Oncology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'General Health',
  'Nutrition',
  'Exercise',
  'Mental Health',
];

const DEFAULT_PROMPT_TEMPLATE = `Write an informative article about {{topic}} for a general audience.
Include:
- Clear explanation of the condition/topic
- Common symptoms or signs
- Risk factors
- When to see a doctor
- Prevention tips if applicable
- Treatment options
- Lifestyle recommendations

Keep the tone friendly, informative, and easy to understand.`;

export default function AdminTopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [newTopic, setNewTopic] = useState({
    name: '',
    category: CATEGORIES[0],
    priority: 1,
    promptTemplate: DEFAULT_PROMPT_TEMPLATE,
  });

  // Fetch topics
  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/topics');
      if (response.ok) {
        const data = await response.json();
        setTopics(data.topics || []);
      }
    } catch (err) {
      setError('Failed to load topics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTopic),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to add topic');
        return;
      }

      setSuccess('Topic added successfully');
      setNewTopic({
        name: '',
        category: CATEGORIES[0],
        priority: 1,
        promptTemplate: DEFAULT_PROMPT_TEMPLATE,
      });
      setShowForm(false);
      fetchTopics();
    } catch (err) {
      setError('An error occurred');
      console.error(err);
    }
  };

  const handleToggleTopic = async (topicId: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/topics/${topicId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentActive }),
      });

      if (response.ok) {
        fetchTopics();
      }
    } catch (err) {
      setError('Failed to update topic');
      console.error(err);
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (!confirm('Are you sure you want to delete this topic?')) return;

    try {
      const response = await fetch(`/api/admin/topics/${topicId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Topic deleted');
        fetchTopics();
      }
    } catch (err) {
      setError('Failed to delete topic');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-gray-500">Loading topics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Topics Management</h1>
          <p className="text-gray-600 mt-1">Manage article topics and generation prompts</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
        >
          {showForm ? 'Cancel' : 'Add Topic'}
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* Add Topic Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <form onSubmit={handleAddTopic} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topic Name
                </label>
                <input
                  type="text"
                  required
                  value={newTopic.name}
                  onChange={(e) =>
                    setNewTopic({ ...newTopic, name: e.target.value })
                  }
                  placeholder="e.g., Hypertension Management"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newTopic.category}
                  onChange={(e) =>
                    setNewTopic({ ...newTopic, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={newTopic.priority}
                  onChange={(e) =>
                    setNewTopic({
                      ...newTopic,
                      priority: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Prompt Template */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prompt Template
              </label>
              <textarea
                value={newTopic.promptTemplate}
                onChange={(e) =>
                  setNewTopic({ ...newTopic, promptTemplate: e.target.value })
                }
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use {'{{topic}}'} as placeholder for the topic name
              </p>
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition"
              >
                Add Topic
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2 px-6 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Topics Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {topics.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {topics.map((topic) => (
                  <tr key={topic.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {topic.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {topic.category}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {topic.priority}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          topic.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {topic.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm space-x-3">
                      <button
                        onClick={() => handleToggleTopic(topic.id, topic.active)}
                        className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                      >
                        {topic.active ? (
                          <>
                            <X className="w-4 h-4" /> Deactivate
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" /> Activate
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteTopic(topic.id)}
                        className="text-red-600 hover:text-red-800 font-medium inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-gray-500">
            <p>No topics yet. Add one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
