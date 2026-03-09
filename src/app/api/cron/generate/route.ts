import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  newsroom_settings,
  newsroom_topics,
  newsroom_articles,
  newsroom_generation_log,
} from '@/lib/schema';
import { eq, desc, sql, and } from 'drizzle-orm';
import { generateArticle } from '@/lib/ai-generator';
import { generateAndUploadImage } from '@/lib/image-generator';
import { verifyCronSecret } from '@/lib/auth';

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const calculateReadTime = (content: string): number => {
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / 200);
};

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const isValid = await verifyCronSecret(request);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get settings
    const settings = await db.select().from(newsroom_settings);
    if (settings.length === 0) {
      return NextResponse.json(
        { error: 'Settings not configured' },
        { status: 500 }
      );
    }
    const setting = settings[0];

    // Count articles generated today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayStats = await db
      .select({
        count: sql`count(*)`.mapWith(Number),
      })
      .from(newsroom_generation_log)
      .where(
        and(
          sql`DATE(${newsroom_generation_log.createdAt}) = DATE(${sql.raw(
            "'" + today.toISOString().split('T')[0] + "'"
          )})`,
        )
      );

    const generatedToday = todayStats[0]?.count || 0;

    // Check if we've reached the limit
    if (generatedToday >= setting.articlesPerDay) {
      return NextResponse.json({
        skipped: true,
        reason: 'Daily article limit reached',
        generatedToday,
        limit: setting.articlesPerDay,
      });
    }

    // Calculate how many to generate this run
    // Assume 4 cron runs per day
    const toGenerateThisRun = Math.max(
      1,
      Math.floor(setting.articlesPerDay / 4)
    );
    const remaining = setting.articlesPerDay - generatedToday;
    const toGenerate = Math.min(toGenerateThisRun, remaining);

    // Get active topics
    const topics = await db
      .select()
      .from(newsroom_topics)
      .where(eq(newsroom_topics.active, true))
      .orderBy(desc(newsroom_topics.priority));

    if (topics.length === 0) {
      return NextResponse.json({
        skipped: true,
        reason: 'No active topics available',
      });
    }

    const generatedArticles = [];
    let topicIndex = 0;

    for (let i = 0; i < toGenerate; i++) {
      try {
        // Round-robin through topics weighted by priority
        const topic = topics[topicIndex % topics.length];
        topicIndex++;

        // Generate article
        const generatedArticle = await generateArticle(
          topic.name,
          topic.category,
          topic.promptTemplate
        );

        let imageUrl = null;
        if (setting.generateImages) {
          try {
            imageUrl = await generateAndUploadImage(topic.name, topic.slug);
          } catch (imageError) {
            console.error('Image generation failed:', imageError);
            // Continue without image
          }
        }

        // Determine status
        const status = setting.autoPublish ? 'published' : 'draft';
        const publishedAt = setting.autoPublish ? new Date() : null;

        // Save article
        const slug = slugify(generatedArticle.article.title);
        const readTime = calculateReadTime(generatedArticle.article.content);

        const article = await db
          .insert(newsroom_articles)
          .values({
            title: generatedArticle.article.title,
            slug,
            summary: generatedArticle.article.summary || generatedArticle.article.content.substring(0, 200),
            content: generatedArticle.article.content,
            category: topic.category || 'general',
            section: 'news',
            author: 'AI Generated',
            status,
            imageUrl: imageUrl || null,
            seoTitle: generatedArticle.article.title,
            seoDescription: generatedArticle.article.content.substring(0, 160),
            featured: false,
            faqData: null,
            readTime,
            views: 0,
            publishedAt,
            generatedAt: new Date(),
          })
          .returning();

        // Log generation
        await db.insert(newsroom_generation_log).values({
          topicId: topic.id,
          articleId: article[0].id,
          status: 'success',
          tokensUsed: generatedArticle.tokensUsed || 0,
          costEstimate: '0.00',
          imageGenerated: !!imageUrl,
        });

        generatedArticles.push(article[0]);
      } catch (articleError) {
        console.error('Error generating article:', articleError);
        // Continue to next article
      }
    }

    return NextResponse.json({
      skipped: false,
      generated: generatedArticles.length,
      articles: generatedArticles,
      totalGeneratedToday: generatedToday + generatedArticles.length,
    });
  } catch (error) {
    console.error('Cron generate error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
