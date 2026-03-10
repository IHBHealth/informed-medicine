import { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, CheckCircle2, Eye, Clock, ArrowRight } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import AskQuestionForm from "@/components/AskQuestionForm";
import questionsData from "@/data/questions.json";
import type { Question } from "@/lib/types";
import { SITE_URL, formatNumber, timeAgo, categoryLabel } from "@/lib/utils";

const questions = questionsData as Question[];

export const metadata: Metadata = {
  title: "Health Q&A - Ask Health Questions & Get Expert Answers",
  description:
    "Browse community health questions and expert answers. Find answers about heart health, mental health, medications, nutrition, and more from medical professionals.",
  keywords: [
    "health questions",
    "medical Q&A",
    "health answers",
    "ask a doctor",
    "health community",
  ],
  openGraph: {
    title: "Health Q&A - Ask Health Questions & Get Expert Answers",
    description:
      "Browse community health questions and expert answers on a wide range of medical topics.",
    type: "website",
    url: `${SITE_URL}/qa`,
    siteName: "InformedMedicine",
  },
  twitter: {
    card: "summary_large_image",
    title: "Health Q&A - Ask Health Questions & Get Expert Answers",
    description: "Community health questions and expert answers.",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: `${SITE_URL}`,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Q&A",
      item: `${SITE_URL}/qa`,
    },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: questions
    .filter((q) => q.answered && q.answer)
    .map((q) => ({
      "@type": "Question",
      name: q.title,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer?.replace(/<[^>]*>/g, '') || q.body,
      },
    })),
};

export default function QAPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/50">
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={faqJsonLd} />

      <div className="container mx-auto px-4 py-12">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Q&A" },
          ]}
        />

        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Health Questions & Answers
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-6 leading-relaxed">
            Browse real health questions answered by medical professionals. Evidence-based
            answers on heart health, nutrition, sleep, medications, and more.
          </p>
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageCircle className="w-5 h-5 text-primary" />
              <span>{questions.length} questions</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span>{questions.filter((q) => q.answered).length} answered</span>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <AskQuestionForm />
        </div>

        <div className="space-y-4 mb-12">
          {questions.map((question) => (
            <Link
              key={question.id}
              href={`/qa/${question.slug}`}
              className="block bg-white dark:bg-slate-900 rounded-lg border border-border dark:border-slate-800 p-6 hover:shadow-md hover:border-blue-200 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {question.answered ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : (
                    <MessageCircle className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-blue-600 transition-colors">
                    {question.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {question.body}
                  </p>
                  {question.answered && question.answeredBy && (
                    <p className="text-sm text-green-700 dark:text-green-400 mb-3">
                      Answered by {question.answeredBy}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      {categoryLabel(question.category)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {formatNumber(question.views)} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {timeAgo(question.createdAt)}
                    </span>
                    <span>Asked by {question.authorName}</span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-blue-500 flex-shrink-0 mt-2 transition-colors" />
              </div>
            </Link>
          ))}
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg p-6">
          <div className="flex gap-3">
            <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">
                Medical Advice Disclaimer
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                The Q&A section is for informational and educational purposes only. Answers
                provided here do not constitute medical advice and should not be used as a
                substitute for professional medical consultation. Always seek the guidance of
                your doctor or other qualified health professional with any questions you may
                have regarding your health or a medical condition.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
