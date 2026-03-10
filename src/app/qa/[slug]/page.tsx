import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Eye, Clock, ArrowLeft, User, Stethoscope } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import questionsData from "@/data/questions.json";
import type { Question } from "@/lib/types";
import { SITE_URL, formatNumber, timeAgo, categoryLabel } from "@/lib/utils";

const questions = questionsData as Question[];

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  return questions.map((q) => ({ slug: q.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const question = questions.find((q) => q.slug === params.slug);
  if (!question) return {};

  const plainAnswer = question.answer?.replace(/<[^>]*>/g, '').substring(0, 160) || '';

  return {
    title: `${question.title} - Health Q&A`,
    description: plainAnswer || question.body.substring(0, 160),
    openGraph: {
      title: question.title,
      description: plainAnswer || question.body.substring(0, 160),
      type: "article",
      url: `${SITE_URL}/qa/${question.slug}`,
    },
  };
}

export default function QuestionDetailPage({ params }: PageProps) {
  const question = questions.find((q) => q.slug === params.slug);
  if (!question) notFound();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Q&A", item: `${SITE_URL}/qa` },
      { "@type": "ListItem", position: 3, name: question.title, item: `${SITE_URL}/qa/${question.slug}` },
    ],
  };

  const qaJsonLd = question.answer ? {
    "@context": "https://schema.org",
    "@type": "QAPage",
    mainEntity: {
      "@type": "Question",
      name: question.title,
      text: question.body,
      dateCreated: question.createdAt,
      author: { "@type": "Person", name: question.authorName },
      answerCount: 1,
      acceptedAnswer: {
        "@type": "Answer",
        text: question.answer.replace(/<[^>]*>/g, ''),
        author: { "@type": "Person", name: question.answeredBy },
      },
    },
  } : undefined;

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/50">
      <JsonLd data={breadcrumbJsonLd} />
      {qaJsonLd && <JsonLd data={qaJsonLd} />}

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Q&A", href: "/qa" },
            { label: question.title.length > 50 ? question.title.substring(0, 50) + '...' : question.title },
          ]}
        />

        <Link
          href="/qa"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all questions
        </Link>

        {/* Question */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-border dark:border-slate-800 p-8 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              {categoryLabel(question.category)}
            </span>
            {question.answered && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Answered
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4 leading-tight">
            {question.title}
          </h1>

          <p className="text-base text-muted-foreground leading-relaxed mb-6">
            {question.body}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-t border-border pt-4">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              {question.authorName}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {timeAgo(question.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {formatNumber(question.views)} views
            </span>
          </div>
        </div>

        {/* Answer */}
        {question.answer && (
          <div className="bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200 dark:border-green-800/50 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 dark:bg-green-800/30 rounded-lg">
                <Stethoscope className="w-5 h-5 text-green-700 dark:text-green-400" />
              </div>
              <div>
                <h2 className="font-bold text-green-900 dark:text-green-200">Expert Answer</h2>
                {question.answeredBy && (
                  <p className="text-sm text-green-700 dark:text-green-400">{question.answeredBy}</p>
                )}
              </div>
            </div>

            <div
              className="prose prose-green max-w-none text-gray-800 dark:text-gray-200
                prose-headings:text-green-900 dark:prose-headings:text-green-200
                prose-h3:text-lg prose-h3:font-bold prose-h3:mt-6 prose-h3:mb-3
                prose-p:leading-relaxed prose-p:mb-4
                prose-ul:my-3 prose-li:my-1
                prose-strong:text-green-900 dark:prose-strong:text-green-100
                prose-em:text-gray-600 dark:prose-em:text-gray-400"
              dangerouslySetInnerHTML={{ __html: question.answer }}
            />
          </div>
        )}

        {/* Related questions */}
        {(() => {
          const related = questions
            .filter((q) => q.id !== question.id && (q.category === question.category || q.answered))
            .slice(0, 3);
          if (related.length === 0) return null;

          return (
            <div className="mt-12">
              <h2 className="text-xl font-bold text-foreground mb-4">Related Questions</h2>
              <div className="space-y-3">
                {related.map((q) => (
                  <Link
                    key={q.id}
                    href={`/qa/${q.slug}`}
                    className="flex items-start gap-3 p-4 bg-white dark:bg-slate-900 rounded-lg border border-border hover:border-blue-200 hover:shadow-sm transition-all group"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <h3 className="font-medium text-foreground group-hover:text-blue-600 transition-colors line-clamp-1">
                        {q.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {categoryLabel(q.category)} · {formatNumber(q.views)} views
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </main>
  );
}
