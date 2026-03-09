import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { fdaDrugs } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { fetchDrugCountsByLetter, fetchLatestLabel, slugify, titleCase, sleep } from '@/lib/openfda';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  // Verify with CRON_SECRET header or admin auth
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const letter = (searchParams.get('letter') || 'A').toUpperCase();

  if (!/^[A-Z]$/.test(letter)) {
    return NextResponse.json({ error: 'Invalid letter parameter' }, { status: 400 });
  }

  let drugsFound = 0;
  let drugsUpserted = 0;
  let errors = 0;

  try {
    // Get all unique generic names starting with this letter
    const counts = await fetchDrugCountsByLetter(letter);
    drugsFound = counts.length;

    // Process in batches of 5 with delays to respect rate limits
    for (let i = 0; i < counts.length; i += 5) {
      const batch = counts.slice(i, i + 5);

      await Promise.all(batch.map(async ({ term }) => {
        try {
          const label = await fetchLatestLabel(term);
          if (!label) return;

          const slug = slugify(term);
          if (!slug) return;

          const brandNames = label.openfda?.brand_name?.map(b => titleCase(b)) || [];
          const drugClass = label.openfda?.pharm_class_epc?.[0] || null;
          const productType = label.openfda?.product_type?.[0] || '';
          const isPrescription = productType.includes('Prescription');

          // Short description from the label
          const rawDesc = label.description?.[0] || label.indications_and_usage?.[0] || '';
          const description = rawDesc.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().substring(0, 500);

          // Check if a curated (featured) entry exists - don't overwrite those
          const existing = await db.select({ id: fdaDrugs.id, isFeatured: fdaDrugs.isFeatured })
            .from(fdaDrugs)
            .where(eq(fdaDrugs.slug, slug))
            .limit(1);

          if (existing.length > 0 && existing[0].isFeatured) {
            // Update only setId and brandNames for curated drugs, keep their content
            await db.update(fdaDrugs)
              .set({ setId: label.set_id, brandNames, lastSyncedAt: new Date() })
              .where(eq(fdaDrugs.slug, slug));
          } else if (existing.length > 0) {
            // Update existing openFDA entry
            await db.update(fdaDrugs)
              .set({
                displayName: titleCase(term),
                brandNames,
                drugClass,
                setId: label.set_id,
                description,
                prescriptionRequired: isPrescription,
                lastSyncedAt: new Date(),
              })
              .where(eq(fdaDrugs.slug, slug));
          } else {
            // Insert new drug
            await db.insert(fdaDrugs).values({
              genericName: term.toLowerCase(),
              slug,
              displayName: titleCase(term),
              brandNames,
              drugClass,
              setId: label.set_id,
              description,
              prescriptionRequired: isPrescription,
              isFeatured: false,
              lastSyncedAt: new Date(),
            });
          }
          drugsUpserted++;
        } catch (e) {
          errors++;
        }
      }));

      // Rate limit: wait 350ms between batches
      if (i + 5 < counts.length) {
        await sleep(350);
      }
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message, letter, drugsFound, drugsUpserted, errors }, { status: 500 });
  }

  return NextResponse.json({ letter, drugsFound, drugsUpserted, errors });
}
