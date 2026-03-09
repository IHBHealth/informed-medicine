import { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Clock, Eye, User } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import articlesData from "@/data/articles.json";
import type { Article } from "@/lib/types";
import { SITE_URL, formatNumber, timeAgo, categoryLabel, CATEGORY_COLORS } from "@/lib/utils";

const articles = articlesData as Article[];
const adviceArticles = articles.filter((a) => a.section === "advice");
// If no advice-specific articles, show all articles as a fallback
const displayArticles = adviceArticles.length > 0 ? adviceArticles : articles;

export const metadata: Metadata = {
  title: "Health Advice - Expert Tips & Medical Guidance",
  description:
    "Get expert health advice on nutrition, exercise, mental health, medications, and more. Evidence-based tips and guidance from healthcare professionals.",
  keywords: [
    "health advice",
    "medical tips",
    "health guidance",
    "wellness advice",
    "healthy living",
    "medical guidance",
  ],
  openGraph: {
    title: "Health Advice - Expert Tips & Medical Guidance",
    description:
      "Expert health advice on nutrition, exercise, mental health, and more from healthcare professionals.",
    type: "website",
    url: `${SITE_URL}/advice`,
    siteName: "InformedMedicine",
  },
  twitter: {
    card: "summary_large_image",
    title: "Health Advice - Expert Tips & Medical Guidance",
    description: "Evidence-based health tips and guidance.",
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
      name: "Advice",
      item: `${SITE_URL}/advice`,
    },
  ],
};

const collectionJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Health Advice",
  description:
    "Expert health advice and evidence-based guidance on nutrition, exercise, mental health, and wellness.",
  url: `${SITE_URL}/advice`,
  mainEntity: {
    "@type": "MedicalWebPage",
    name: "Health Advice",
    description: "Browse expert health advice and medical guidance articles.",
  },
};

export default function AdvicePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/50">
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={collectionJsonLd} />

      <div className="container mx-auto px-4 py-12">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Advice" },
          ]}
        />

        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Health Advice & Guidance
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-6 leading-relaxed">
            Evidence-based health advice from medical professionals. Our articles cover
            nutrition, exercise, mental wellness, chronic disease management, medication
            guidance, and practical tips for living a healthier life. Each article is
            reviewed for medical accuracy and written in plain language so you can take
            action.
          </p>
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="w-5 h-5 text-primary" />
              <span>{displayArticles.length} articles</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {displayArticles.map((article) => {
            const colors = CATEGORY_COLORS[article.category] || "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300";

            return (
              <Link
                key={article.id}
                href={`/article/${article.slug}`}
                className="group bg-white dark:bg-slate-900 rounded-lg border border-border dark:border-slate-800 overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all duration-200"
              >
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors}`}
                    >
                      {categoryLabel(article.category)}
                    </span>
                    {article.featured && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                        Featured
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
                    {article.title}
                  </h3>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {article.summary}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {article.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {article.readTime} min read
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {formatNumber(article.views)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg p-6">
          <div className="flex gap-3">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">
                About Our Health Advice
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Our health advice articles are written and reviewed by medical professionals
                to ensure accuracy. However, this content is for informational purposes only
                and should not replace personalized medical advice from your healthcare
                provider. Always consult with your doctor before making changes to your
                health routine, medications, or treatment plan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
