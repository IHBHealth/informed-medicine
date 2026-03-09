import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { fdaDrugs } from '@/lib/schema';
import type { CuratedDrugData } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { fetchDrugCountsByLetter, fetchLatestLabel, labelToDrugFields, slugify, titleCase, sleep } from '@/lib/openfda';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  // Verify with CRON_SECRET header or admin auth
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const letter = (searchParams.get('letter') || 'A').toUpperCase();
  const skip = parseInt(searchParams.get('skip') || '0');
  const limit = parseInt(searchParams.get('limit') || '1000');

  if (!/^[A-Z]$/.test(letter)) {
    return NextResponse.json({ error: 'Invalid letter parameter' }, { status: 400 });
  }

  let drugsFound = 0;
  let drugsUpserted = 0;
  let drugsSkipped = 0;
  let errors = 0;
  const startTime = Date.now();

  try {
    // Get all unique generic names starting with this letter (up to 1000 from openFDA count API)
    const allCounts = await fetchDrugCountsByLetter(letter);
    drugsFound = allCounts.length;

    // Apply skip/limit for pagination
    const counts = allCounts.slice(skip, skip + limit);

    // Process in batches of 5 with delays to respect rate limits
    for (let i = 0; i < counts.length; i += 5) {
      // Safety: stop if we're approaching the timeout (leave 15s buffer)
      if (Date.now() - startTime > 270_000) {
        return NextResponse.json({
          letter,
          drugsFound,
          drugsUpserted,
          drugsSkipped,
          errors,
          timedOut: true,
          resumeAt: skip + i,
          message: `Timed out after processing ${i} drugs. Resume with ?letter=${letter}&skip=${skip + i}`,
        });
      }

      const batch = counts.slice(i, i + 5);

      await Promise.all(batch.map(async ({ term }) => {
        try {
          const slug = slugify(term);
          if (!slug) return;

          // Skip drugs that already have curated_data (unless force refresh)
          if (!searchParams.has('force')) {
            const existing = await db.select({ id: fdaDrugs.id, curatedData: fdaDrugs.curatedData, isFeatured: fdaDrugs.isFeatured })
              .from(fdaDrugs)
              .where(eq(fdaDrugs.slug, slug))
              .limit(1);

            if (existing.length > 0 && (existing[0].curatedData || existing[0].isFeatured)) {
              drugsSkipped++;
              return;
            }
          }

          const label = await fetchLatestLabel(term);
          if (!label) return;

          const brandNames = label.openfda?.brand_name?.map(b => titleCase(b)) || [];
          const drugClass = label.openfda?.pharm_class_epc?.[0] || null;
          const productType = label.openfda?.product_type?.[0] || '';
          const isPrescription = productType.includes('Prescription');

          // Extract ALL structured fields from the FDA label
          const fields = labelToDrugFields(label);

          // Build the structured data object to store in curated_data
          const structuredData: CuratedDrugData = {
            description: fields.description,
            uses: fields.uses,
            dosage: fields.dosage,
            sideEffects: fields.sideEffects,
            warnings: fields.warnings,
            interactions: fields.interactions,
            pregnancy: fields.pregnancy,
            storage: fields.storage,
            schedule: null,
            views: 0,
          };

          // Short description for the listing page
          const shortDesc = (fields.description || fields.uses || '').substring(0, 500);

          // Check if entry exists
          const existing = await db.select({ id: fdaDrugs.id, isFeatured: fdaDrugs.isFeatured })
            .from(fdaDrugs)
            .where(eq(fdaDrugs.slug, slug))
            .limit(1);

          if (existing.length > 0 && existing[0].isFeatured) {
            // Update only setId and brandNames for hand-curated drugs, keep their content
            await db.update(fdaDrugs)
              .set({ setId: label.set_id, brandNames, lastSyncedAt: new Date() })
              .where(eq(fdaDrugs.slug, slug));
          } else if (existing.length > 0) {
            // Update existing openFDA entry with full structured data
            await db.update(fdaDrugs)
              .set({
                displayName: titleCase(term),
                brandNames,
                drugClass,
                setId: label.set_id,
                description: shortDesc,
                prescriptionRequired: isPrescription,
                curatedData: structuredData,
                lastSyncedAt: new Date(),
              })
              .where(eq(fdaDrugs.slug, slug));
          } else {
            // Insert new drug with full structured data
            await db.insert(fdaDrugs).values({
              genericName: term.toLowerCase(),
              slug,
              displayName: titleCase(term),
              brandNames,
              drugClass,
              setId: label.set_id,
              description: shortDesc,
              prescriptionRequired: isPrescription,
              isFeatured: false,
              curatedData: structuredData,
              lastSyncedAt: new Date(),
            });
          }
          drugsUpserted++;
        } catch (e) {
          errors++;
        }
      }));

      // Rate limit: wait 200ms between batches
      if (i + 5 < counts.length) {
        await sleep(200);
      }
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message, letter, drugsFound, drugsUpserted, drugsSkipped, errors }, { status: 500 });
  }

  return NextResponse.json({ letter, drugsFound, drugsUpserted, drugsSkipped, errors, timedOut: false });
}
