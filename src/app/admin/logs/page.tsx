'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, SkipCircle } from 'lucide-react';

type LogStatus = 'success' | 'failed' | 'skipped';

interface GenerationLog {
  id: string;
  date: string;
  topic: string;
  status: LogStatus;
  tokensUsed: number;
  imageGenerated: boolean;
  cost: number;
  error?: string;
}

interface LogSummary {
  costThisWeek: number;
  articlesGenerated: number;
  logs: GenerationLog[];
}

export default function AdminLogsPage() {
  const [summary, setSummary] = useState<LogSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('/api/admin/stats');
        if (response.ok) {
          const data = await response.json();
          setSummary(data);
        }
      } catch (err) {
        setError('Failed to load logs');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const getStatusIcon = (status: LogStatus) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'skipped':
        return <SkipCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusBadgeColor = (status: LogStatus) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'skipped':
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return <div className="text-gray-500">Loading logs...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Generation Logs</h1>
        <p className="text-gray-600 mt-1">Track article generation history and costs</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cost This Week */}
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Total Cost This Week</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              ${summary.costThisWeek.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">API calls + image generation</p>
          </div>

          {/* Articles Generated */}
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Articles Generated</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {summary.articlesGenerated}
            </p>
            <p className="text-xs text-gray-500 mt-1">This week</p>
          </div>
        </div>
      )}

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Generation History</h2>
        </div>

        {summary && summary.logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Topic
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Tokens Used
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Image Generated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {summary.logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(log.date).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {log.topic}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(log.status)}
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                            log.status
                          )}`}
                        >
                          {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {log.tokensUsed.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {log.imageGenerated ? (
                        <span className="inline-flex items-center gap-1 text-green-700">
                          <CheckCircle className="w-4 h-4" />
                          Yes
                        </span>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      ${log.cost.toFixed(4)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {log.error ? (
                        <span className="text-red-600 text-xs cursor-help" title={log.error}>
                          Error
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-gray-500">
            <p>No generation logs yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
