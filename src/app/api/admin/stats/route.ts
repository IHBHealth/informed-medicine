import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  newsroom_articles,
  newsroom_generation_log,
} from '@/lib/schema';
import { verifyApiKey, isAuthenticated } from '@/lib/auth';
import { eq, desc, sql, and } from 'drizzle-orm';

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

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    // Count articles by status
    const articleCounts = await db
      .select({
        status: newsroom_articles.status,
        count: sql`count(*)`.mapWith(Number),
      })
      .from(newsroom_articles)
      .groupBy(newsroom_articles.status);

    const statusCounts = articleCounts.reduce(
      (acc: any, row: any) => {
        acc[row.status] = row.count;
        return acc;
      },
      {}
    );

    // Articles generated today
    const todayStats = await db
      .select({
        count: sql`count(*)`.mapWith(Number),
      })
      .from(newsroom_generation_log)
      .where(
        and(
          sql`DATE(${newsroom_generation_log.generatedAt}) = DATE(${sql.raw(
            "'" + today.toISOString().split('T')[0] + "'"
          )})`,
        )
      );

    const articlesToday = todayStats[0]?.count || 0;

    // Token stats
    const tokenStats = await db
      .select({
        tokensUsed: sql`sum(${newsroom_generation_log.tokensUsed})`.mapWith(
          Number
        ),
        estimatedCost: sql`sum(${newsroom_generation_log.estimatedCost})`.mapWith(
          Number
        ),
      })
      .from(newsroom_generation_log)
      .where(
        and(
          sql`DATE(${newsroom_generation_log.generatedAt}) = DATE(${sql.raw(
            "'" + today.toISOString().split('T')[0] + "'"
          )})`,
        )
      );

    const tokensTodayUsed = tokenStats[0]?.tokensUsed || 0;
    const costToday = tokenStats[0]?.estimatedCost || 0;

    // Weekly cost
    const weekStats = await db
      .select({
        estimatedCost: sql`sum(${newsroom_generation_log.estimatedCost})`.mapWith(
          Number
        ),
      })
      .from(newsroom_generation_log)
      .where(
        and(
          sql`DATE(${newsroom_generation_log.generatedAt}) >= DATE(${sql.raw(
            "'" + weekAgo.toISOString().split('T')[0] + "'"
          )})`,
        )
      );

    const costWeek = weekStats[0]?.estimatedCost || 0;

    // Monthly cost
    const monthStats = await db
      .select({
        estimatedCost: sql`sum(${newsroom_generation_log.estimatedCost})`.mapWith(
          Number
        ),
      })
      .from(newsroom_generation_log)
      .where(
        and(
          sql`DATE(${newsroom_generation_log.generatedAt}) >= DATE(${sql.raw(
            "'" + monthAgo.toISOString().split('T')[0] + "'"
          )})`,
        )
      );

    const costMonth = monthStats[0]?.estimatedCost || 0;

    // Recent generation logs
    const recentLogs = await db
      .select()
      .from(newsroom_generation_log)
      .orderBy(desc(newsroom_generation_log.generatedAt))
      .limit(10);

    return NextResponse.json({
      articles: {
        byStatus: statusCounts,
        generatedToday: articlesToday,
      },
      tokens: {
        usedToday: tokensTodayUsed,
      },
      cost: {
        today: costToday,
        week: costWeek,
        month: costMonth,
      },
      recentGenerations: recentLogs,
    });
  } catch (error) {
    console.error('GET stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
