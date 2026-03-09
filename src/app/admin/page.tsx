'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart3, FileText, TrendingUp, DollarSign } from 'lucide-react';

interface Stats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  articlesCreatedToday: number;
  estimatedCostToday: number;
  estimatedCostThisMonth: number;
}

interface Article {
  id: string;
  title: string;
  status: 'draft' | 'published';
  createdAt: string;
  views: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stats
        const statsResponse = await fetch('/api/admin/stats');
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }

        // Fetch recent articles
        const articlesResponse = await fetch('/api/admin/articles?limit=5');
        if (articlesResponse.ok) {
          const articlesData = await articlesResponse.json();
          setRecentArticles(articlesData.articles || []);
        }
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-gray-500">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to InformedMedicine Admin</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Articles */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Articles</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalArticles}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.publishedArticles} published, {stats.draftArticles} draft
                </p>
              </div>
              <FileText className="w-12 h-12 text-blue-500 opacity-10" />
            </div>
          </div>

          {/* Articles Today */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Articles Today</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.articlesCreatedToday}
                </p>
                <p className="text-xs text-gray-500 mt-1">Created in last 24 hours</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-500 opacity-10" />
            </div>
          </div>

          {/* Est. Cost Today */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Est. Cost Today</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  ${stats.estimatedCostToday.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Generation + images</p>
              </div>
              <DollarSign className="w-12 h-12 text-orange-500 opacity-10" />
            </div>
          </div>

          {/* Est. Cost This Month */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Est. Cost This Month</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  ${stats.estimatedCostThisMonth.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Projected for month</p>
              </div>
              <BarChart3 className="w-12 h-12 text-red-500 opacity-10" />
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Link
          href="/admin/articles/new"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition"
        >
          New Article
        </Link>
        <button
          className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-3 px-6 rounded-lg transition"
          disabled
        >
          Generate Article Now
        </button>
      </div>

      {/* Recent Articles */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Articles</h2>
        </div>
        {recentArticles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {article.title}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          article.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {article.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(article.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {article.views}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Link
                        href={`/admin/articles/${article.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-8 text-center text-gray-500">
            <p>No articles yet. Create one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
