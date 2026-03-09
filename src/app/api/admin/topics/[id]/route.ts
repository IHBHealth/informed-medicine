import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { newsroom_topics } from '@/lib/schema';
import { verifyApiKey, isAuthenticated } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

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
    const { name, slug, promptTemplate, category, active, priority } = body;

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (slug !== undefined) updates.slug = slug;
    else if (name !== undefined) updates.slug = slugify(name);
    if (promptTemplate !== undefined) updates.promptTemplate = promptTemplate;
    if (category !== undefined) updates.category = category;
    if (active !== undefined) updates.active = active;
    if (priority !== undefined) updates.priority = priority;

    const result = await db
      .update(newsroom_topics)
      .set(updates)
      .where(eq(newsroom_topics.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('PUT topic error:', error);
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
      .update(newsroom_topics)
      .set({ active: false })
      .where(eq(newsroom_topics.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('DELETE topic error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
