import { db } from "@/lib/db";
import { newsroomArticles } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { Clock, Eye, ArrowLeft, Calendar, User } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import { SITE_NAME, SITE_URL, categoryLabel, CATEGORY_COLORS, cn, formatDate, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Props {
  params: { slug: string };
}

async function getArticle(slug: string) {
  const articles = await db
    .select()
    .from(newsroomArticles)
    .where(and(eq(newsroomArticles.slug, slug), eq(newsroomArticles.status, "published")));
  return articles[0] || null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticle(params.slug);
  if (!article) return { title: "Article Not Found" };

  const title = article.seoTitle || article.title;
  const description = article.seoDescription || article.summary;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      authors: [article.author],
      url: `${SITE_URL}/article/${article.slug}`,
      images: article.imageUrl ? [{ url: article.imageUrl, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: article.imageUrl ? [article.imageUrl] : [],
    },
    alternates: {
      canonical: `${SITE_URL}/article/${article.slug}`,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const article = await getArticle(params.slug);
  if (!article) notFound();

  // Increment views (fire and forget)
  db.update(newsroomArticles)
    .set({ views: article.views + 1 })
    .where(eq(newsroomArticles.id, article.id))
    .execute()
    .catch(() => {});

  const faqs = (article.faqData as Array<{question: string; answer: string}>) || [];

  // Article JSON-LD
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary,
    image: article.imageUrl || undefined,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.publishedAt?.toISOString(),
    author: {
      "@type": "Person",
      name: article.author,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/article/${article.slug}`,
    },
  };

  // FAQ JSON-LD (if FAQs exist)
  const faqJsonLd = faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  } : null;

  // MedicalWebPage JSON-LD
  const medicalPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: article.title,
    description: article.summary,
    url: `${SITE_URL}/article/${article.slug}`,
    lastReviewed: article.publishedAt?.toISOString(),
    medicalAudience: {
      "@type": "MedicalAudience",
      audienceType: "Patient",
    },
  };

  return (
    <>
      <JsonLd data={articleJsonLd} />
      {faqJsonLd && <JsonLd data={faqJsonLd} />}
      <JsonLd data={medicalPageJsonLd} />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: article.section === "advice" ? "Everyday Advice" : "Health News", href: article.section === "advice" ? "/advice" : "/news" },
            { label: article.title },
          ]}
        />

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className={cn("text-xs font-semibold px-3 py-1 rounded-full", CATEGORY_COLORS[article.category] || CATEGORY_COLORS.general)}>
              {categoryLabel(article.category)}
            </span>
            {article.featured && (
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">Featured</span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-4">
            {article.title}
          </h1>

          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            {article.summary}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-y border-border py-4">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              {article.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {article.publishedAt ? formatDate(article.publishedAt) : "Draft"}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {article.readTime} min read
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              {formatNumber(article.views)} views
            </span>
          </div>
        </header>

        {/* Featured Image */}
        {article.imageUrl && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-auto object-cover max-h-[500px]"
            />
          </div>
        )}

        {/* Article Content */}
        <div
          className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* FAQ Section */}
        {faqs.length > 0 && (
          <section className="mt-12 border-t border-border pt-8">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <details key={index} className="group border border-border rounded-lg">
                  <summary className="flex items-center justify-between p-4 cursor-pointer font-medium hover:bg-accent/50 rounded-lg">
                    {faq.question}
                    <span className="ml-2 text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="px-4 pb-4 text-muted-foreground">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Medical Disclaimer */}
        <div className="mt-12 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>Medical Disclaimer:</strong> This article is for educational purposes only and does not constitute medical advice. Always consult your healthcare provider before making health decisions.
          </p>
        </div>

        {/* Back link */}
        <div className="mt-8">
          <Link href="/news" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
            <ArrowLeft className="w-4 h-4" />
            Back to Health News
          </Link>
        </div>
      </article>
    </>
  );
}
