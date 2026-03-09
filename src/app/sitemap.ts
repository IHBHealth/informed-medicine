import { MetadataRoute } from "next";
import drugsData from "@/data/drugs.json";
import labTestsData from "@/data/lab-tests.json";
import supplementsData from "@/data/supplements.json";
import articlesData from "@/data/articles.json";
import { db } from "@/lib/db";
import { newsroomArticles, fdaDrugs } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

const SITE_URL = "https://informedmedicine.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static drugs from JSON (fallback)
  const staticDrugs = drugsData.map((drug: any) => ({
    url: `${SITE_URL}/drugs/${drug.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Try to get all drugs from DB (much larger set)
  let dbDrugs: MetadataRoute.Sitemap = [];
  try {
    const allDrugs = await db
      .select({ slug: fdaDrugs.slug, lastSyncedAt: fdaDrugs.lastSyncedAt })
      .from(fdaDrugs);

    dbDrugs = allDrugs.map((drug) => ({
      url: `${SITE_URL}/drugs/${drug.slug}`,
      lastModified: drug.lastSyncedAt || new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch {
    // DB unavailable — use static drugs only
  }

  // Use DB drugs if available, otherwise static
  const drugs = dbDrugs.length > 0 ? dbDrugs : staticDrugs;

  const labTests = labTestsData.map((test: any) => ({
    url: `${SITE_URL}/lab-tests/${test.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const supplements = supplementsData.map((supp: any) => ({
    url: `${SITE_URL}/supplements/${supp.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const articles = articlesData.map((article: any) => ({
    url: `${SITE_URL}/article/${article.slug}`,
    lastModified: new Date(article.publishedAt || new Date()),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  let dbArticles: MetadataRoute.Sitemap = [];
  try {
    const publishedArticles = await db
      .select()
      .from(newsroomArticles)
      .where(eq(newsroomArticles.status, "published"))
      .orderBy(desc(newsroomArticles.publishedAt));

    dbArticles = publishedArticles.map((article: any) => ({
      url: `${SITE_URL}/article/${article.slug}`,
      lastModified: new Date(article.publishedAt || new Date()),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));
  } catch {
    // DB unavailable
  }

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/news`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/advice`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/drugs`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/lab-tests`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/supplements`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/qa`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/forum`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    ...drugs,
    ...labTests,
    ...supplements,
    ...articles,
    ...dbArticles,
  ];
}
