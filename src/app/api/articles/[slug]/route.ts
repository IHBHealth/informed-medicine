import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { newsroom_articles } from '@/lib/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Get article by slug
    const result = await db
      .select()
      .from(newsroom_articles)
      .where(
        eq(newsroom_articles.slug, slug)
      );

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    const article = result[0];

    // Check if published
    if (article.status !== 'published') {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Increment views
    await db
      .update(newsroom_articles)
      .set({
        views: sql`${newsroom_articles.views} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(newsroom_articles.id, article.id));

    // Return article with updated views
    const updated = await db
      .select()
      .from(newsroom_articles)
      .where(eq(newsroom_articles.id, article.id));

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('GET article error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
