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
  const { searchParams } = new URL(request.url);

  // Support syncing a specific letter range (e.g., ?from=A&to=F)
  const fromLetter = (searchParams.get('from') || 'A').toUpperCase();
  const toLetter = (searchParams.get('to') || 'Z').toUpperCase();

  const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const fromIdx = allLetters.indexOf(fromLetter);
  const toIdx = allLetters.indexOf(toLetter);
  const letters = allLetters.slice(
    fromIdx >= 0 ? fromIdx : 0,
    (toIdx >= 0 ? toIdx : 25) + 1
  );

  const results: Record<string, any> = {};
  const startTime = Date.now();

  for (const letter of letters) {
    // Safety: stop if approaching timeout (leave 20s buffer)
    if (Date.now() - startTime > 270_000) {
      const nextLetterIdx = allLetters.indexOf(letter);
      return NextResponse.json({
        status: 'partial',
        message: `Timed out. Completed through letter ${allLetters[nextLetterIdx - 1] || 'none'}. Resume with ?from=${letter}&to=${toLetter}`,
        completedLetters: Object.keys(results),
        totalDrugs: Object.values(results).reduce((sum: number, r: any) => sum + (r.drugsUpserted || 0), 0),
        totalSkipped: Object.values(results).reduce((sum: number, r: any) => sum + (r.drugsSkipped || 0), 0),
        totalErrors: Object.values(results).reduce((sum: number, r: any) => sum + (r.errors || 0), 0),
        results,
      });
    }

    let skip = 0;
    const letterResults: any[] = [];

    // Auto-paginate: keep calling the sync route until no more drugs to process
    while (true) {
      try {
        const res = await fetch(
          `${baseUrl}/api/admin/fda-sync?letter=${letter}&skip=${skip}`,
          {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${cronSecret}` },
          }
        );
        const data = await res.json();
        letterResults.push(data);

        // If it timed out, resume from where it left off
        if (data.timedOut && data.resumeAt) {
          skip = data.resumeAt;
          continue;
        }

        // Done with this letter
        break;
      } catch (e: any) {
        letterResults.push({ error: e.message });
        break;
      }
    }

    // Combine results for this letter
    results[letter] = {
      drugsFound: letterResults[0]?.drugsFound || 0,
      drugsUpserted: letterResults.reduce((s: number, r: any) => s + (r.drugsUpserted || 0), 0),
      drugsSkipped: letterResults.reduce((s: number, r: any) => s + (r.drugsSkipped || 0), 0),
      errors: letterResults.reduce((s: number, r: any) => s + (r.errors || 0), 0),
      pages: letterResults.length,
    };
  }

  const totalDrugs = Object.values(results).reduce((sum: number, r: any) => sum + (r.drugsUpserted || 0), 0);
  const totalSkipped = Object.values(results).reduce((sum: number, r: any) => sum + (r.drugsSkipped || 0), 0);
  const totalErrors = Object.values(results).reduce((sum: number, r: any) => sum + (r.errors || 0), 0);

  return NextResponse.json({
    status: 'complete',
    totalDrugs,
    totalSkipped,
    totalErrors,
    results,
  });
}

// Also support GET for Vercel cron (cron jobs send GET requests)
export async function GET(request: NextRequest) {
  return POST(request);
}
