import { db } from "@/lib/db";
import { newsroomArticles } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { Metadata } from "next";
import Link from "next/link";
import { Newspaper, Clock, Eye, ArrowRight } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { SITE_URL, categoryLabel, CATEGORY_COLORS, cn, formatNumber } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Health News - Latest Medical Research & Health Updates",
  description: "Stay informed with the latest health news, medical research findings, and wellness updates from trusted medical professionals.",
  openGraph: {
    title: "Health News | InformedMedicine",
    description: "Latest health news and medical research updates.",
    url: `${SITE_URL}/news`,
  },
  alternates: { canonical: `${SITE_URL}/news` },
};

// Revalidate every 60 seconds to pick up new articles
export const revalidate = 60;

export default async function NewsPage() {
  const articles = await db
    .select()
    .from(newsroomArticles)
    .where(eq(newsroomArticles.status, "published"))
    .orderBy(desc(newsroomArticles.publishedAt))
    .limit(50);

  // Also try to load static articles for fallback
  let staticArticles: any[] = [];
  try {
    const data = await import("@/data/articles.json");
    staticArticles = data.default.filter((a: any) => a.section === "news");
  } catch {}

  const allArticles = [...articles.map(a => ({
    ...a,
    publishedAt: a.publishedAt?.toISOString() || new Date().toISOString(),
  })), ...staticArticles];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Health News" }]} />

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Newspaper className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold">Health News</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Stay informed with the latest medical research, health developments, and evidence-based wellness updates.
        </p>
      </div>

      {allArticles.length === 0 ? (
        <div className="text-center py-16">
          <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No articles yet</h2>
          <p className="text-muted-foreground">Check back soon for the latest health news.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allArticles.map((article) => (
            <article key={article.id || article.slug} className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              {article.imageUrl && (
                <Link href={`/article/${article.slug}`}>
                  <div className="h-48 overflow-hidden bg-muted">
                    <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                </Link>
              )}
              <div className="p-5">
                <span className={cn("text-xs font-semibold px-2 py-1 rounded-full", CATEGORY_COLORS[article.category] || CATEGORY_COLORS.general)}>
                  {categoryLabel(article.category)}
                </span>
                <Link href={`/article/${article.slug}`}>
                  <h2 className="text-lg font-bold mt-3 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h2>
                </Link>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{article.summary}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{article.readTime} min</span>
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{formatNumber(article.views)} views</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
