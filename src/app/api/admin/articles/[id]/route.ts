import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { newsroom_articles } from '@/lib/schema';
import { verifyApiKey, isAuthenticated } from '@/lib/auth';
import { eq } from 'drizzle-orm';

const calculateReadTime = (content: string): number => {
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / 200);
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    const result = await db
      .select()
      .from(newsroom_articles)
      .where(eq(newsroom_articles.id, id));

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('GET article error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    const body = await request.json();
    const {
      title,
      content,
      category,
      section,
      author,
      status,
      imageUrl,
      seoTitle,
      seoDescription,
      featured,
      faqData,
    } = body;

    // Get current article
    const current = await db
      .select()
      .from(newsroom_articles)
      .where(eq(newsroom_articles.id, id));

    if (current.length === 0) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) {
      updates.content = content;
      updates.readTime = calculateReadTime(content);
    }
    if (category !== undefined) updates.category = category;
    if (section !== undefined) updates.section = section;
    if (author !== undefined) updates.author = author;
    if (status !== undefined) {
      updates.status = status;
      // Set publishedAt if changing to published and it's not already set
      if (status === 'published' && !current[0].publishedAt) {
        updates.publishedAt = new Date();
      }
    }
    if (imageUrl !== undefined) updates.imageUrl = imageUrl;
    if (seoTitle !== undefined) updates.seoTitle = seoTitle;
    if (seoDescription !== undefined) updates.seoDescription = seoDescription;
    if (featured !== undefined) updates.featured = featured;
    if (faqData !== undefined) updates.faqData = faqData;

    updates.updatedAt = new Date();

    const result = await db
      .update(newsroom_articles)
      .set(updates)
      .where(eq(newsroom_articles.id, id))
      .returning();

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('PUT article error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    const result = await db
      .update(newsroom_articles)
      .set({ status: 'archived' })
      .where(eq(newsroom_articles.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('DELETE article error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
