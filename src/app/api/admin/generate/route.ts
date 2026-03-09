import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  newsroom_settings,
  newsroom_topics,
  newsroom_articles,
  newsroom_generation_log,
} from '@/lib/schema';
import { verifyApiKey, isAuthenticated } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { generateArticle } from '@/lib/ai-generator';
import { generateAndUploadImage } from '@/lib/image-generator';

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const calculateReadTime = (content: string): number => {
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / 200);
};

export async function POST(request: NextRequest) {
  try {
    // Check auth
    const apiKeyValid = await verifyApiKey(request);
    const sessionValid = await isAuthenticated();

    if (!apiKeyValid && !sessionValid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { topicId } = await request.json();

    // Get settings
    const settings = await db.select().from(newsroom_settings);
    if (settings.length === 0) {
      return NextResponse.json(
        { error: 'Settings not configured' },
        { status: 500 }
      );
    }
    const setting = settings[0];

    // Get topic
    let topic;
    if (topicId) {
      const topics = await db
        .select()
        .from(newsroom_topics)
        .where(eq(newsroom_topics.id, topicId));
      if (topics.length === 0) {
        return NextResponse.json(
          { error: 'Topic not found' },
          { status: 404 }
        );
      }
      topic = topics[0];
    } else {
      // Pick a random active topic
      const topics = await db
        .select()
        .from(newsroom_topics)
        .where(eq(newsroom_topics.active, true));
      if (topics.length === 0) {
        return NextResponse.json(
          { error: 'No active topics available' },
          { status: 500 }
        );
      }
      topic = topics[Math.floor(Math.random() * topics.length)];
    }

    // Generate article
    const generatedArticle = await generateArticle(
      topic.name,
      topic.category,
      topic.promptTemplate
    );

    let imageUrl = null;
    if (setting.generateImages) {
      imageUrl = await generateAndUploadImage(topic.name, topic.slug);
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

    return NextResponse.json(article[0], { status: 201 });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
