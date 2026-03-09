'use client';

import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

interface Settings {
  articlesPerDay: number;
  autoPublish: boolean;
  defaultWordCount: number;
  generateImages: boolean;
  imageStyle: string;
  aiModel: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    articlesPerDay: 5,
    autoPublish: false,
    defaultWordCount: 800,
    generateImages: true,
    imageStyle: 'medical illustration',
    aiModel: 'claude-sonnet-4-5-20250514',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const aiModels = [
    { id: 'claude-sonnet-4-5-20250514', name: 'Claude Sonnet (Fast, $0.15/1M input)' },
    { id: 'claude-opus-4-6', name: 'Claude Opus (Powerful, $0.50/1M input)' },
    { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku (Budget, $0.08/1M input)' },
  ];

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (err) {
        setError('Failed to load settings');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const calculateEstimatedCosts = () => {
    const articlesPerDay = settings.articlesPerDay;

    // Get model cost per 1M tokens (approximate)
    let modelCostPer1M = 0.15; // Sonnet default
    if (settings.aiModel === 'claude-opus-4-6') {
      modelCostPer1M = 0.50;
    } else if (settings.aiModel === 'claude-haiku-4-5-20251001') {
      modelCostPer1M = 0.08;
    }

    // Estimate ~5000 tokens per article at this price point
    const tokensPerArticle = 5000;
    const articleCostPerDay =
      (articlesPerDay * tokensPerArticle * modelCostPer1M) / 1000000;

    // Image cost: $0.05 per image (simplified estimate)
    const imageCostPerDay = settings.generateImages ? articlesPerDay * 0.05 : 0;

    const dailyTotal = articleCostPerDay + imageCostPerDay;
    const monthlyEstimate = dailyTotal * 30;

    return {
      articleCostPerDay: articleCostPerDay.toFixed(2),
      imageCostPerDay: imageCostPerDay.toFixed(2),
      dailyTotal: dailyTotal.toFixed(2),
      monthlyEstimate: monthlyEstimate.toFixed(2),
    };
  };

  const costs = calculateEstimatedCosts();

  const handleChange = (field: keyof Settings, value: any) => {
    setSettings({ ...settings, [field]: value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to save settings');
        return;
      }

      setSuccess('Settings saved successfully');
    } catch (err) {
      setError('An error occurred while saving');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Configure generation behavior and costs</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Cost Control Section */}
        <div className="bg-white rounded-lg shadow p-6 border-2 border-orange-200">
          <div className="mb-6 pb-4 border-b-2 border-orange-200">
            <h2 className="text-xl font-bold text-orange-700 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Cost Control Settings
            </h2>
            <p className="text-sm text-orange-600 mt-1">
              These settings directly impact your API costs. Monitor carefully.
            </p>
          </div>

          <div className="space-y-6">
            {/* Articles Per Day */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Articles Per Day
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={settings.articlesPerDay}
                  onChange={(e) =>
                    handleChange('articlesPerDay', parseInt(e.target.value))
                  }
                  className="w-full px-4 py-2 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-lg font-semibold"
                />
                <p className="text-xs text-gray-600 mt-2">
                  Maximum articles to generate per day (1-50)
                </p>
              </div>

              {/* Cost Display */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-orange-900 mb-3">
                  Estimated Daily Cost
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-orange-800">Text Generation:</span>
                    <span className="font-bold text-orange-900">
                      ${costs.articleCostPerDay}
                    </span>
                  </div>
                  {settings.generateImages && (
                    <div className="flex justify-between">
                      <span className="text-orange-800">Image Generation:</span>
                      <span className="font-bold text-orange-900">
                        ${costs.imageCostPerDay}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-orange-200 pt-2 mt-2 flex justify-between font-bold">
                    <span className="text-orange-900">Total Daily:</span>
                    <span className="text-orange-900">${costs.dailyTotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-900">Monthly Estimate:</span>
                    <span className="text-orange-900">${costs.monthlyEstimate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Model Selection */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Model</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Model
            </label>
            <select
              value={settings.aiModel}
              onChange={(e) => handleChange('aiModel', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              {aiModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content Generation Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Content Generation
          </h3>

          <div className="space-y-4">
            {/* Default Word Count */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Word Count
              </label>
              <input
                type="number"
                min="100"
                max="5000"
                value={settings.defaultWordCount}
                onChange={(e) =>
                  handleChange('defaultWordCount', parseInt(e.target.value))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <p className="text-xs text-gray-600 mt-1">
                Target word count for generated articles (100-5000)
              </p>
            </div>

            {/* Image Generation Toggle */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.generateImages}
                  onChange={(e) =>
                    handleChange('generateImages', e.target.checked)
                  }
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm font-medium text-gray-900">
                  Generate Feature Images
                </span>
              </label>
              <p className="text-xs text-gray-600 mt-1 ml-7">
                Automatically create images for articles
              </p>
            </div>

            {/* Image Style */}
            {settings.generateImages && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image Style
                </label>
                <input
                  type="text"
                  value={settings.imageStyle}
                  onChange={(e) => handleChange('imageStyle', e.target.value)}
                  placeholder="e.g., medical illustration, scientific diagram, photo"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* Publishing Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Publishing</h3>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoPublish}
              onChange={(e) => handleChange('autoPublish', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm font-medium text-gray-900">
              Auto-publish Generated Articles
            </span>
          </label>
          <p className="text-xs text-gray-600 mt-2 ml-7">
            Automatically publish articles once they are generated (if unchecked,
            they will be created as drafts)
          </p>
        </div>

        {/* Save Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium py-3 px-8 rounded-lg transition"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
