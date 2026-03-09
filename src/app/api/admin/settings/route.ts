import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { newsroom_settings } from '@/lib/schema';
import { verifyApiKey, isAuthenticated } from '@/lib/auth';

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

    const result = await db.select().from(newsroom_settings);

    // If no settings exist, create defaults
    if (result.length === 0) {
      const defaults = {
        articlesPerDay: 4,
        generateImages: true,
        autoPublish: false,
        updatedAt: new Date(),
      };

      const created = await db
        .insert(newsroom_settings)
        .values(defaults)
        .returning();

      return NextResponse.json(created[0]);
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('GET settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const { articlesPerDay, generateImages, autoPublish } =
      await request.json();

    // Validate articlesPerDay
    if (articlesPerDay !== undefined) {
      if (typeof articlesPerDay !== 'number' || articlesPerDay < 1 || articlesPerDay > 50) {
        return NextResponse.json(
          { error: 'articlesPerDay must be between 1 and 50' },
          { status: 400 }
        );
      }
    }

    const updates: any = {};
    if (articlesPerDay !== undefined) updates.articlesPerDay = articlesPerDay;
    if (generateImages !== undefined) updates.generateImages = generateImages;
    if (autoPublish !== undefined) updates.autoPublish = autoPublish;
    updates.updatedAt = new Date();

    // Update the first (and only) settings row
    const result = await db
      .update(newsroom_settings)
      .set(updates)
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Settings not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('PUT settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
