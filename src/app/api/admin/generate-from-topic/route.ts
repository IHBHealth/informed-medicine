import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { newsroomArticles } from '@/lib/schema';
import { isAuthenticated } from '@/lib/auth';
import { generateArticle } from '@/lib/ai-generator';
import { generateAndUploadImage } from '@/lib/image-generator';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export async function POST(request: NextRequest) {
  try {
    const sessionValid = await isAuthenticated();
    if (!sessionValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { topic, category, author, wordCount, generateImage } = await request.json();

    if (!topic || !topic.trim()) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    const targetWordCount = wordCount || 2000;
    const articleCategory = category || 'general';
    const articleAuthor = author || 'InformedMedicine AI Newsroom';

    // Generate article content via Claude
    const prompt = `Write a ${targetWordCount}-word evidence-based health article about: ${topic}

Category: ${articleCategory}

IMPORTANT REQUIREMENTS:
- Write approximately ${targetWordCount} words of HTML content
- Use h2, h3, p, ul, li, strong, em, sup tags
- Include at least 5 real journal citations with sup tags [1]-[5]+
- Include a References section as an ordered list at the bottom
- Include 3-5 FAQs
- End with a medical disclaimer in italics
- Be evidence-based and accessible to general audiences
- Include specific data, statistics, and research references`;

    const result = await generateArticle(
      topic,
      articleCategory,
      prompt,
      targetWordCount,
      'claude-sonnet-4-5-20250514'
    );

    const article = result.article;
    const slug = article.slug || slugify(article.title);

    // Generate image if requested
    let imageUrl = null;
    if (generateImage && article.imagePrompt) {
      imageUrl = await generateAndUploadImage(
        article.imagePrompt,
        slug,
        'Editorial health photography, clean professional aesthetic'
      );
    }

    // Calculate read time
    const wordCountActual = article.content.split(/\s+/).length;
    const readTime = Math.ceil(wordCountActual / 200);

    // Save to database
    const saved = await db
      .insert(newsroomArticles)
      .values({
        title: article.title,
        slug,
        summary: article.summary || article.seoDescription || article.content.substring(0, 200),
        content: article.content,
        category: articleCategory,
        section: 'news',
        author: articleAuthor,
        status: 'published',
        imageUrl,
        seoTitle: article.seoTitle || article.title.substring(0, 60),
        seoDescription: article.seoDescription || article.summary || article.content.substring(0, 160),
        featured: false,
        faqData: article.faqs || null,
        readTime,
        views: 0,
        publishedAt: new Date(),
        generatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      article: saved[0],
      tokensUsed: result.tokensUsed,
      wordCount: wordCountActual,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Generate from topic error:', error);

    if (error.message?.includes('unique constraint')) {
      return NextResponse.json(
        { error: 'An article with this title already exists. Try a different topic or angle.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to generate article' },
      { status: 500 }
    );
  }
}
