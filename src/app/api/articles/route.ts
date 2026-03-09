import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { newsroom_articles } from '@/lib/schema';
import { eq, desc, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const section = searchParams.get('section');
    const featured = searchParams.get('featured') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const offset = (page - 1) * limit;

    // Build query conditions
    const conditions = [eq(newsroom_articles.status, 'published')];

    if (category) {
      conditions.push(eq(newsroom_articles.category, category));
    }

    if (section) {
      conditions.push(eq(newsroom_articles.section, section));
    }

    if (featured) {
      conditions.push(eq(newsroom_articles.featured, true));
    }

    // Build combined where clause
    let query = db.select().from(newsroom_articles).$dynamic();

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const articles = await query
      .orderBy(desc(newsroom_articles.publishedAt))
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
