import fs from "fs";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { newsroomArticles } from "../src/lib/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

interface Article {
  title: string; slug: string; summary: string; content: string; category: string;
  author: string; seoTitle: string; seoDescription: string; imagePrompt: string;
  faqData: Array<{question: string; answer: string}>;
}

async function main() {
  const articlesDir = "scripts/articles";
  const files = fs.readdirSync(articlesDir).filter(f => f.endsWith(".json")).sort();

  console.log(`Found ${files.length} article files to process\n`);

  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of files) {
    const article: Article = JSON.parse(fs.readFileSync(`${articlesDir}/${file}`, "utf-8"));
    console.log(`Processing: ${article.slug}`);

    try {
      const wordCount = article.content.split(/\s+/).length;
      const hasImage = fs.existsSync(`public/images/${article.slug}.png`);

      const result = await db.insert(newsroomArticles).values({
        title: article.title,
        slug: article.slug,
        summary: article.summary,
        content: article.content,
        category: article.category,
        section: "news",
        author: article.author,
        readTime: Math.ceil(wordCount / 200),
        views: 0,
        featured: false,
        status: "published",
        imageUrl: hasImage ? `/images/${article.slug}.png` : null,
        seoTitle: article.seoTitle,
        seoDescription: article.seoDescription,
        faqData: article.faqData,
        publishedAt: new Date(),
        generatedAt: new Date(),
      }).returning();

      console.log(`  ✓ Inserted (${wordCount} words, ID: ${result[0].id}, image: ${hasImage ? 'yes' : 'no'})\n`);
      inserted++;
    } catch (err: any) {
      if (err.message?.includes("unique constraint")) {
        console.log(`  ⏭ Already exists, skipping\n`);
        skipped++;
      } else {
        console.error(`  ✗ Error: ${err.message}\n`);
        errors++;
      }
    }
  }

  console.log(`\nDone! Inserted: ${inserted}, Skipped: ${skipped}, Errors: ${errors}`);
}

main().catch(console.error);
