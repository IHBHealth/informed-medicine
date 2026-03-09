import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { newsroom_articles } from '@/lib/schema';
import { verifyApiKey, isAuthenticated } from '@/lib/auth';
import { desc, eq } from 'drizzle-orm';

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const calculateReadTime = (content: string): number => {
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / 200);
};

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = db.select().from(newsroom_articles);

    if (status) {
      query = query.where(eq(newsroom_articles.status, status));
    }

    const offset = (page - 1) * limit;
    const articles = await query
      .orderBy(desc(newsroom_articles.generatedAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      articles,
      page,
      limit,
      count: articles.length,
    });
  } catch (error) {
    console.error('GET articles error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const {
      title,
      content,
      category,
      section,
      author,
      status = 'draft',
      imageUrl,
      seoTitle,
      seoDescription,
      featured = false,
      faqData,
    } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const slug = slugify(title);
    const readTime = calculateReadTime(content);
    const finalSeoTitle = seoTitle || title;
    const finalSeoDescription =
      seoDescription || content.substring(0, 160);
    const publishedAt = status === 'published' ? new Date() : null;

    const result = await db
      .insert(newsroom_articles)
      .values({
        title,
        slug,
        content,
        category: category || null,
        section: section || null,
        author: author || null,
        status,
        imageUrl: imageUrl || null,
        seoTitle: finalSeoTitle,
        seoDescription: finalSeoDescription,
        featured,
        faqData: faqData || null,
        readTime,
        views: 0,
        publishedAt,
        generatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('POST articles error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
