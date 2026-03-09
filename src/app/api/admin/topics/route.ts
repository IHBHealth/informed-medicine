import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { newsroom_topics } from '@/lib/schema';
import { verifyApiKey, isAuthenticated } from '@/lib/auth';
import { desc } from 'drizzle-orm';

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const DEFAULT_PROMPT_TEMPLATE = `Write a {wordCount}-word evidence-based health article about {topic} in the category of [CATEGORY].
Focus on recent research, practical advice, and actionable takeaways.
Include statistics and data where relevant.`;

export async function GET(request: NextRequest) {
  try {
    const topics = await db
      .select()
      .from(newsroom_topics)
      .orderBy(desc(newsroom_topics.priority));

    return NextResponse.json(topics);
  } catch (error) {
    console.error('GET topics error:', error);
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

    const { name, slug, promptTemplate, category, active = true, priority = 0 } =
      await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const finalSlug = slug || slugify(name);
    const finalTemplate = promptTemplate || DEFAULT_PROMPT_TEMPLATE;

    const result = await db
      .insert(newsroom_topics)
      .values({
        name,
        slug: finalSlug,
        promptTemplate: finalTemplate,
        category: category || 'general',
        active,
        priority,

      })
      .returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('POST topics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
