import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { fdaDrugs } from '@/lib/schema';
import type { CuratedDrugData } from '@/lib/schema';
import drugsData from '@/data/drugs.json';
import type { Drug } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const drugs = drugsData as Drug[];
  let seeded = 0;
  let skipped = 0;

  for (const drug of drugs) {
    const curatedData: CuratedDrugData = {
      description: drug.description,
      uses: drug.uses,
      dosage: drug.dosage,
      sideEffects: drug.sideEffects,
      warnings: drug.warnings,
      interactions: drug.interactions,
      pregnancy: drug.pregnancy,
      storage: drug.storage,
      schedule: drug.schedule,
      views: drug.views,
    };

    try {
      await db.insert(fdaDrugs).values({
        genericName: drug.genericName.toLowerCase(),
        slug: drug.slug,
        displayName: drug.name,
        brandNames: drug.brandNames,
        drugClass: drug.drugClass,
        description: drug.description.substring(0, 500),
        prescriptionRequired: drug.prescriptionRequired,
        isFeatured: true,
        curatedData,
      }).onConflictDoUpdate({
        target: fdaDrugs.slug,
        set: {
          displayName: drug.name,
          brandNames: drug.brandNames,
          drugClass: drug.drugClass,
          description: drug.description.substring(0, 500),
          prescriptionRequired: drug.prescriptionRequired,
          isFeatured: true,
          curatedData,
        },
      });
      seeded++;
    } catch (e) {
      skipped++;
    }
  }

  return NextResponse.json({ seeded, skipped, total: drugs.length });
}
