import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const baseUrl = new URL(request.url).origin;
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const results: Record<string, any> = {};

  for (const letter of letters) {
    try {
      const res = await fetch(`${baseUrl}/api/admin/fda-sync?letter=${letter}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cronSecret}`,
        },
      });
      results[letter] = await res.json();
    } catch (e: any) {
      results[letter] = { error: e.message };
    }
  }

  const totalDrugs = Object.values(results).reduce((sum: number, r: any) => sum + (r.drugsUpserted || 0), 0);
  const totalErrors = Object.values(results).reduce((sum: number, r: any) => sum + (r.errors || 0), 0);

  return NextResponse.json({
    status: 'complete',
    totalDrugs,
    totalErrors,
    results
  });
}
