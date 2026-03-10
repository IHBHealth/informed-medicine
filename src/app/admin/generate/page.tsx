'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Check, AlertCircle, ExternalLink, Image as ImageIcon } from 'lucide-react';

const CATEGORIES = [
  'nutrition',
  'heart-health',
  'brain-health',
  'respiratory-health',
  'environmental-health',
  'fitness',
  'sleep-health',
  'mental-health',
  'infectious-disease',
  'general',
];

const SUGGESTED_TOPICS = [
  'The health risks of sitting for 8+ hours a day',
  'How ultra-processed foods affect your gut microbiome',
  'Is intermittent fasting actually good for you?',
  'The link between poor sleep and weight gain',
  'How air pollution affects cardiovascular health',
  'The truth about collagen supplements',
  'Fluoride in drinking water: benefits and concerns',
  'How chronic stress damages your immune system',
  'The science behind cold plunge therapy',
  'Mercury in fish: which seafood is safe to eat?',
];

interface GeneratedArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  readTime: number;
  imageUrl: string | null;
}

export default function GenerateArticlePage() {
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState('general');
  const [author, setAuthor] = useState('');
  const [wordCount, setWordCount] = useState(2000);
  const [generateImage, setGenerateImage] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedArticle | null>(null);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    setStatusMessage('Generating article content with Claude AI...');

    try {
      const response = await fetch('/api/admin/generate-from-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          category,
          author: author.trim() || undefined,
          wordCount,
          generateImage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate article');
      }

      setResult(data.article);
      setStatusMessage('');
      setTopic('');
    } catch (err: any) {
      setError(err.message);
      setStatusMessage('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Sparkles className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Generate Article</h1>
          <p className="text-sm text-gray-500">Enter a topic and we'll create a full article with citations</p>
        </div>
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        {/* Topic Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            What should the article be about?
          </label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., The health dangers of eating too much processed sugar and its link to chronic inflammation"
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-400 resize-none"
            disabled={loading}
          />
        </div>

        {/* Quick Suggestions */}
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-2">Quick suggestions</label>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_TOPICS.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setTopic(suggestion)}
                disabled={loading}
                className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-purple-50 hover:text-purple-700 text-gray-600 rounded-full transition-colors disabled:opacity-50"
              >
                {suggestion.length > 45 ? suggestion.substring(0, 45) + '...' : suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Options Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 text-sm"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Word Count</label>
            <select
              value={wordCount}
              onChange={(e) => setWordCount(Number(e.target.value))}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 text-sm"
            >
              <option value={1000}>~1,000 words (5 min read)</option>
              <option value={2000}>~2,000 words (10 min read)</option>
              <option value={3000}>~3,000 words (15 min read)</option>
              <option value={5000}>~5,000 words (25 min read)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Auto-generated"
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 text-sm placeholder-gray-400"
            />
          </div>
        </div>

        {/* Image Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setGenerateImage(!generateImage)}
            disabled={loading}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              generateImage ? 'bg-purple-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                generateImage ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">Generate hero image (~$0.01)</span>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading || !topic.trim()}
          className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Article
            </>
          )}
        </button>

        {/* Status Message */}
        {statusMessage && (
          <div className="flex items-center gap-2 text-sm text-purple-600 bg-purple-50 px-4 py-3 rounded-lg">
            <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
            {statusMessage}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 px-4 py-3 rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* Success Result */}
        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <Check className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-800">Article Published</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{result.title}</h3>
            <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-4">
              <span className="px-2 py-0.5 bg-white rounded text-xs font-medium">
                {result.category}
              </span>
              <span>{result.readTime} min read</span>
              {result.imageUrl && <span className="text-green-600">Image generated</span>}
            </div>
            <div className="flex gap-3">
              <a
                href={`/article/${result.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-purple-600 hover:text-purple-800"
              >
                View Article <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href={`/admin/articles/${result.id}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-800"
              >
                Edit in Admin
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Cost Info */}
      <div className="mt-4 text-xs text-gray-400 text-center">
        Estimated cost: ~$0.02 per article (Claude Sonnet) + $0.01 per image (Flux)
      </div>
    </div>
  );
}
