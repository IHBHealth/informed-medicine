import Link from "next/link";
import { Metadata } from "next";
import {
  ArrowRight,
  TrendingUp,
  MessageSquare,
  Newspaper,
  Lightbulb,
  Users,
  Heart,
  Clock,
  Eye,
} from "lucide-react";

import { Article, Question, ForumPost } from "@/lib/types";
import {
  cn,
  categoryLabel,
  CATEGORY_COLORS,
  formatNumber,
  timeAgo,
  SITE_NAME,
  SITE_URL,
} from "@/lib/utils";

import articlesData from "@/data/articles.json";
import questionsData from "@/data/questions.json";
import forumPostsData from "@/data/forum-posts.json";

export const metadata: Metadata = {
  title: "Health Knowledge You Can Trust | Evidence-Based Medical Information",
  description:
    "Discover evidence-based health articles, expert Q&A, drug information, and supplement guides. Get trusted health knowledge from verified medical professionals.",
  openGraph: {
    title: "Health Knowledge You Can Trust | InformedMedicine",
    description:
      "Evidence-based health articles, expert Q&A, drug information, and supplement guides.",
    url: SITE_URL,
    type: "website",
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
      },
    ],
  },
};

// JSON-LD for Homepage
function HomepageJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "InformedMedicine - Health Knowledge You Can Trust",
    description:
      "Evidence-based health information including articles, Q&A, drug guides, and supplements.",
    url: SITE_URL,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function HomePage() {
  // Cast JSON data to typed arrays
  const articles = articlesData as Article[];
  const questions = questionsData as Question[];
  const forumPosts = forumPostsData as ForumPost[];

  // Filter and sort data
  const featuredArticles = articles
    .filter((a) => a.featured)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    .slice(0, 2);

  const newsArticles = articles
    .filter((a) => a.section === "news")
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    .slice(0, 3);

  const adviceArticles = articles
    .filter((a) => a.section === "advice")
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    .slice(0, 3);

  const recentQuestions = questions
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 3);

  const recentForumPosts = forumPosts
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 2);

  // Trending categories
  const trendingCategories = [
    { label: "Heart Health", value: "heart-health" },
    { label: "Mental Health", value: "mental-health" },
    { label: "Nutrition", value: "nutrition" },
    { label: "Sleep", value: "sleep" },
    { label: "Diabetes", value: "diabetes" },
    { label: "Fitness", value: "fitness" },
  ];

  return (
    <>
      <HomepageJsonLd />

      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center overflow-hidden bg-gradient-to-r from-[#0c2d48] via-[#145374] to-[#1a7fa0] py-20">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Health knowledge you can trust
            </h1>
            <p className="text-xl text-gray-100 mb-8 leading-relaxed">
              Evidence-based articles from medical professionals, trusted answers
              to your health questions, and comprehensive drug information to help
              you make informed decisions.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/news"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-[#0c2d48] font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Explore Articles
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="/qa"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
              >
                Ask Questions
                <MessageSquare className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Topics Bar */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-4 no-scrollbar">
            {trendingCategories.map((category) => (
              <Link
                key={category.value}
                href={`/news?category=${category.value}`}
                className="flex-shrink-0 px-4 py-2 bg-gray-100 text-gray-800 rounded-full font-medium text-sm hover:bg-gray-200 transition-colors whitespace-nowrap"
              >
                {category.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <div className="min-h-screen bg-gray-50">
        {/* Featured Articles Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-6 h-6 text-[#1a7fa0]" />
              <h2 className="text-3xl font-bold text-gray-900">Featured</h2>
            </div>
            <p className="text-gray-600">
              Our most important health insights this week
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {featuredArticles.map((article) => (
              <article
                key={article.id}
                className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
              >
                <Link href={`/article/${article.slug}`}>
                  {article.imageUrl && (
                    <div className="relative h-64 overflow-hidden bg-gray-200">
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                </Link>

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={cn(
                        "text-xs font-semibold px-3 py-1 rounded-full",
                        CATEGORY_COLORS[article.category] ||
                          CATEGORY_COLORS.general
                      )}
                    >
                      {categoryLabel(article.category)}
                    </span>
                  </div>

                  <Link href={`/article/${article.slug}`}>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#1a7fa0] transition-colors">
                      {article.title}
                    </h3>
                  </Link>

                  <p className="text-gray-600 mb-4">{article.summary}</p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{article.author}</span>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {article.readTime} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {formatNumber(article.views)} views
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/article/${article.slug}`}
                    className="text-[#1a7fa0] font-semibold hover:text-[#0c2d48] transition-colors flex items-center gap-1"
                  >
                    Read More <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Health News + Sidebar Layout */}
        <section className="container mx-auto px-4 pb-16">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2">
              {/* Health News */}
              <div className="mb-16">
                <div className="flex items-center gap-2 mb-4">
                  <Newspaper className="w-6 h-6 text-[#1a7fa0]" />
                  <h2 className="text-3xl font-bold text-gray-900">
                    Health News
                  </h2>
                </div>
                <p className="text-gray-600 mb-8">
                  Latest research and health developments
                </p>

                <div className="grid md:grid-cols-3 gap-6">
                  {newsArticles.map((article) => (
                    <article
                      key={article.id}
                      className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow flex flex-col"
                    >
                      <Link href={`/article/${article.slug}`}>
                        {article.imageUrl && (
                          <div className="relative h-48 overflow-hidden bg-gray-200">
                            <img
                              src={article.imageUrl}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                      </Link>

                      <div className="p-5 flex-1 flex flex-col">
                        <span
                          className={cn(
                            "text-xs font-semibold px-2 py-1 rounded-full w-fit mb-3",
                            CATEGORY_COLORS[article.category] ||
                              CATEGORY_COLORS.general
                          )}
                        >
                          {categoryLabel(article.category)}
                        </span>

                        <Link href={`/article/${article.slug}`}>
                          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#1a7fa0] transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                        </Link>

                        <p className="text-sm text-gray-600 mb-4 flex-1 line-clamp-2">
                          {article.summary}
                        </p>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {article.readTime} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {formatNumber(article.views)} views
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              {/* Everyday Advice */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-6 h-6 text-[#1a7fa0]" />
                  <h2 className="text-3xl font-bold text-gray-900">
                    Everyday Advice
                  </h2>
                </div>
                <p className="text-gray-600 mb-8">
                  Practical health tips and wellness guidance
                </p>

                <div className="grid md:grid-cols-3 gap-6">
                  {adviceArticles.map((article) => (
                    <article
                      key={article.id}
                      className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow flex flex-col"
                    >
                      <Link href={`/article/${article.slug}`}>
                        {article.imageUrl && (
                          <div className="relative h-48 overflow-hidden bg-gray-200">
                            <img
                              src={article.imageUrl}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                      </Link>

                      <div className="p-5 flex-1 flex flex-col">
                        <span
                          className={cn(
                            "text-xs font-semibold px-2 py-1 rounded-full w-fit mb-3",
                            CATEGORY_COLORS[article.category] ||
                              CATEGORY_COLORS.general
                          )}
                        >
                          {categoryLabel(article.category)}
                        </span>

                        <Link href={`/article/${article.slug}`}>
                          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#1a7fa0] transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                        </Link>

                        <p className="text-sm text-gray-600 mb-4 flex-1 line-clamp-2">
                          {article.summary}
                        </p>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {article.readTime} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {formatNumber(article.views)} views
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              {/* Recent Q&A Widget */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="w-5 h-5 text-[#1a7fa0]" />
                  <h3 className="text-xl font-bold text-gray-900">Recent Q&A</h3>
                </div>

                <div className="space-y-4">
                  {recentQuestions.map((question) => (
                    <Link
                      key={question.id}
                      href={`/qa#${question.id}`}
                      className="group block pb-4 border-b border-gray-200 last:border-b-0 last:pb-0"
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className={cn(
                            "text-xs font-semibold px-2 py-1 rounded flex-shrink-0 mt-1",
                            CATEGORY_COLORS[question.category] ||
                              CATEGORY_COLORS.general
                          )}
                        >
                          {categoryLabel(question.category)}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#1a7fa0] transition-colors mt-2 line-clamp-2">
                        {question.title}
                      </h4>

                      <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                        <span>
                          by {question.authorName.substring(0, 15)}
                          {question.authorName.length > 15 ? "..." : ""}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {formatNumber(question.views)}
                        </span>
                      </div>

                      {question.answered && (
                        <div className="text-xs text-green-600 font-semibold mt-2">
                          Answered
                        </div>
                      )}
                    </Link>
                  ))}
                </div>

                <Link
                  href="/qa"
                  className="inline-flex items-center gap-2 text-[#1a7fa0] font-semibold hover:text-[#0c2d48] transition-colors mt-4 text-sm"
                >
                  View All Questions <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Community Forum Widget */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-[#1a7fa0]" />
                  <h3 className="text-xl font-bold text-gray-900">
                    Community Forum
                  </h3>
                </div>

                <div className="space-y-4">
                  {recentForumPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/forum#${post.id}`}
                      className="group block pb-4 border-b border-gray-200 last:border-b-0 last:pb-0"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={cn(
                                "text-xs font-semibold px-2 py-1 rounded",
                                CATEGORY_COLORS[post.category] ||
                                  CATEGORY_COLORS.general
                              )}
                            >
                              {categoryLabel(post.category)}
                            </span>
                            {post.pinned && (
                              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded font-semibold">
                                Pinned
                              </span>
                            )}
                          </div>

                          <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#1a7fa0] transition-colors line-clamp-2">
                            {post.title}
                          </h4>

                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                            <span>by {post.authorName.substring(0, 12)}...</span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              {post.replyCount} replies
                            </span>
                            <span>{timeAgo(post.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                <Link
                  href="/forum"
                  className="inline-flex items-center gap-2 text-[#1a7fa0] font-semibold hover:text-[#0c2d48] transition-colors mt-4 text-sm"
                >
                  Join Community <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </>
  );
}
