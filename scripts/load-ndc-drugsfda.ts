/**
 * Load NDC Directory + Drugs@FDA into the database
 *
 * Downloads bulk files, extracts unique drugs not already in the DB,
 * and inserts them with structured data. Ensures no duplicates.
 *
 * Usage: npx tsx scripts/load-ndc-drugsfda.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync, mkdirSync, unlinkSync, createReadStream } from 'fs';
import { execSync } from 'child_process';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../src/lib/schema';
import { slugify, titleCase, cleanFdaHtml } from '../src/lib/openfda';
import type { CuratedDrugData } from '../src/lib/schema';

config({ path: resolve(__dirname, '../.env.local') });

const sql_conn = neon(process.env.DATABASE_URL!);
const db = drizzle(sql_conn, { schema });

const DOWNLOAD_DIR = resolve(__dirname, '../tmp-fda-data');

interface DrugToInsert {
  slug: string;
  genericName: string;
  displayName: string;
  brandNames: string[];
  drugClass: string | null;
  setId: string | null;
  description: string;
  prescriptionRequired: boolean;
  curatedData: CuratedDrugData;
}

// ─── Helpers ───

function ensureDir() {
  if (!existsSync(DOWNLOAD_DIR)) mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

function download(url: string, dest: string) {
  console.log(`  Downloading ${url}...`);
  execSync(`curl -sL -o "${dest}" "${url}"`, { stdio: 'pipe' });
  console.log('  Downloaded ✓');
}

function unzip(zipPath: string): string {
  execSync(`unzip -o "${zipPath}" -d "${DOWNLOAD_DIR}" 2>/dev/null`, { stdio: 'pipe' });
  // Delete zip to save space
  try { unlinkSync(zipPath); } catch {}
  // Find the actual extracted JSON file
  const { readdirSync } = require('fs');
  const files = readdirSync(DOWNLOAD_DIR).filter((f: string) => f.endsWith('.json'));
  if (files.length === 0) throw new Error('No JSON file found after unzip');
  return resolve(DOWNLOAD_DIR, files[files.length - 1]);
}

async function getExistingSlugs(): Promise<Set<string>> {
  console.log('Fetching existing slugs from database...');
  const rows = await db.select({ slug: schema.fdaDrugs.slug }).from(schema.fdaDrugs);
  const slugs = new Set(rows.map(r => r.slug));
  console.log(`  ${slugs.size} drugs already in database`);
  return slugs;
}

async function insertDrugs(drugs: DrugToInsert[], existingSlugs: Set<string>): Promise<number> {
  const newDrugs = drugs.filter(d => !existingSlugs.has(d.slug));
  console.log(`  ${newDrugs.length} new drugs to insert (${drugs.length - newDrugs.length} already exist)`);

  let inserted = 0;
  for (let i = 0; i < newDrugs.length; i += 10) {
    const batch = newDrugs.slice(i, i + 10);
    await Promise.all(batch.map(async (drug) => {
      try {
        await db.insert(schema.fdaDrugs).values({
          genericName: drug.genericName,
          slug: drug.slug,
          displayName: drug.displayName,
          brandNames: drug.brandNames,
          drugClass: drug.drugClass,
          setId: drug.setId,
          description: drug.description,
          prescriptionRequired: drug.prescriptionRequired,
          isFeatured: false,
          curatedData: drug.curatedData,
          lastSyncedAt: new Date(),
        });
        inserted++;
        existingSlugs.add(drug.slug);
      } catch (e: any) {
        // Duplicate slug — skip silently
      }
    }));

    if ((i % 200 === 0 && i > 0) || i + 10 >= newDrugs.length) {
      process.stdout.write(`\r  Progress: ${Math.min(i + 10, newDrugs.length)}/${newDrugs.length}, ${inserted} inserted...`);
    }
  }

  console.log(`\r  Inserted ${inserted} new drugs                                    `);
  return inserted;
}

// ─── NDC Directory Processing ───

async function processNDC(existingSlugs: Set<string>): Promise<number> {
  console.log('\n========================================');
  console.log('Processing NDC Directory (132,458 products)');
  console.log('========================================');

  const zipPath = resolve(DOWNLOAD_DIR, 'drug-ndc.json.zip');
  const url = 'https://download.open.fda.gov/drug/ndc/drug-ndc-0001-of-0001.json.zip';

  download(url, zipPath);
  const jsonPath = unzip(zipPath);

  // Use jq to stream as JSONL
  console.log('  Extracting with jq...');
  const jsonlPath = jsonPath + '.jsonl';
  execSync(`jq -c '.results[]' "${jsonPath}" > "${jsonlPath}"`, { stdio: 'pipe' });
  try { unlinkSync(jsonPath); } catch {}

  // Parse JSONL and extract unique drugs
  const drugMap = new Map<string, DrugToInsert>();
  const { createInterface } = await import('readline');
  const rl = createInterface({ input: createReadStream(jsonlPath), crlfDelay: Infinity });

  let processed = 0;
  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const record = JSON.parse(line);
      processed++;

      if (processed % 20000 === 0) {
        process.stdout.write(`\r  Processed ${processed} NDC records, ${drugMap.size} unique drugs...`);
      }

      const genericName = record.generic_name;
      if (!genericName || typeof genericName !== 'string') continue;

      const slug = slugify(genericName);
      if (!slug || slug.length < 2) continue;
      if (drugMap.has(slug) || existingSlugs.has(slug)) continue;

      const brandName = record.brand_name || '';
      const brandNameBase = record.brand_name_base || '';
      const brandNames: string[] = [];
      if (brandName) brandNames.push(titleCase(brandName));
      if (brandNameBase && brandNameBase !== brandName) brandNames.push(titleCase(brandNameBase));

      const productType = record.product_type || '';
      const isPrescription = productType.includes('PRESCRIPTION');
      const dosageForm = record.dosage_form || '';
      const route = Array.isArray(record.route) ? record.route.join(', ') : '';
      const marketingCategory = record.marketing_category || '';

      // Build active ingredients string
      const activeIngredients = (record.active_ingredients || [])
        .map((ai: any) => `${ai.name} (${ai.strength})`)
        .join('; ');

      // Build description from available NDC fields
      const descParts = [];
      if (dosageForm) descParts.push(`Dosage form: ${dosageForm}.`);
      if (route) descParts.push(`Route: ${route}.`);
      if (activeIngredients) descParts.push(`Active ingredients: ${activeIngredients}.`);
      if (marketingCategory) descParts.push(`Category: ${marketingCategory}.`);
      const description = descParts.join(' ');

      // Build curated data from NDC fields
      const curatedData: CuratedDrugData = {
        description: description,
        uses: '',
        dosage: dosageForm ? `Available as ${dosageForm.toLowerCase()}${route ? ` for ${route.toLowerCase()} use` : ''}.` : '',
        sideEffects: '',
        warnings: '',
        interactions: '',
        pregnancy: null,
        storage: null,
        schedule: null,
        views: 0,
      };

      drugMap.set(slug, {
        slug,
        genericName: genericName.toLowerCase(),
        displayName: titleCase(genericName),
        brandNames,
        drugClass: null,
        setId: record.spl_id || null,
        description: description.substring(0, 500),
        prescriptionRequired: isPrescription,
        curatedData,
      });
    } catch {}
  }

  try { unlinkSync(jsonlPath); } catch {}
  console.log(`\r  Processed ${processed} NDC records, found ${drugMap.size} new unique drugs     `);

  // Insert new drugs
  const drugs = Array.from(drugMap.values());
  return await insertDrugs(drugs, existingSlugs);
}

// ─── Drugs@FDA Processing ───

async function processDrugsFDA(existingSlugs: Set<string>): Promise<number> {
  console.log('\n========================================');
  console.log('Processing Drugs@FDA (28,904 applications)');
  console.log('========================================');

  const zipPath = resolve(DOWNLOAD_DIR, 'drug-drugsfda.json.zip');
  const url = 'https://download.open.fda.gov/drug/drugsfda/drug-drugsfda-0001-of-0001.json.zip';

  download(url, zipPath);
  const jsonPath = unzip(zipPath);

  // Use jq to stream
  console.log('  Extracting with jq...');
  const jsonlPath = jsonPath + '.jsonl';
  execSync(`jq -c '.results[]' "${jsonPath}" > "${jsonlPath}"`, { stdio: 'pipe' });
  try { unlinkSync(jsonPath); } catch {}

  const drugMap = new Map<string, DrugToInsert>();
  const { createInterface } = await import('readline');
  const rl = createInterface({ input: createReadStream(jsonlPath), crlfDelay: Infinity });

  let processed = 0;
  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const record = JSON.parse(line);
      processed++;

      if (processed % 5000 === 0) {
        process.stdout.write(`\r  Processed ${processed} Drugs@FDA records, ${drugMap.size} unique drugs...`);
      }

      const openfda = record.openfda || {};
      const products = record.products || [];
      const appNumber = record.application_number || '';
      const sponsorName = record.sponsor_name || '';

      // Get generic names from openfda
      const genericNames: string[] = openfda.generic_name || [];
      // Also collect brand names
      const brandNamesRaw: string[] = openfda.brand_name || [];

      // If no generic names in openfda, try to get from products
      if (genericNames.length === 0) {
        for (const prod of products) {
          const activeIngredients = prod.active_ingredients || [];
          if (Array.isArray(activeIngredients)) {
            for (const ai of activeIngredients) {
              if (ai.name && typeof ai.name === 'string') {
                genericNames.push(ai.name);
              }
            }
          }
        }
      }

      // Process each unique generic name
      for (const name of genericNames) {
        const slug = slugify(name);
        if (!slug || slug.length < 2) continue;
        if (drugMap.has(slug) || existingSlugs.has(slug)) continue;

        const brandNames = brandNamesRaw.map(b => titleCase(b));
        const drugClass = openfda.pharm_class_epc?.[0] || null;

        // Get product type and route from products
        let dosageForm = '';
        let route = '';
        let isPrescription = false;
        let activeIngredientsStr = '';

        for (const prod of products) {
          if (prod.dosage_form) dosageForm = prod.dosage_form;
          if (prod.route) route = prod.route;
          if (prod.marketing_status?.includes('Prescription')) isPrescription = true;

          const ais = prod.active_ingredients || [];
          if (Array.isArray(ais) && ais.length > 0) {
            activeIngredientsStr = ais
              .map((ai: any) => ai.strength ? `${ai.name} (${ai.strength})` : ai.name)
              .join('; ');
          }
        }

        // Also check openfda for product_type
        if (openfda.product_type?.[0]?.includes('PRESCRIPTION')) isPrescription = true;

        // Build description
        const descParts = [];
        if (sponsorName) descParts.push(`Manufactured by ${sponsorName}.`);
        if (dosageForm) descParts.push(`Dosage form: ${dosageForm}.`);
        if (route) descParts.push(`Route: ${route}.`);
        if (activeIngredientsStr) descParts.push(`Active ingredients: ${activeIngredientsStr}.`);
        if (appNumber) descParts.push(`Application: ${appNumber}.`);
        const description = descParts.join(' ');

        const curatedData: CuratedDrugData = {
          description: description,
          uses: '',
          dosage: dosageForm ? `Available as ${dosageForm.toLowerCase()}${route ? ` for ${route.toLowerCase()} use` : ''}.` : '',
          sideEffects: '',
          warnings: '',
          interactions: '',
          pregnancy: null,
          storage: null,
          schedule: null,
          views: 0,
        };

        drugMap.set(slug, {
          slug,
          genericName: name.toLowerCase(),
          displayName: titleCase(name),
          brandNames,
          drugClass,
          setId: null,
          description: description.substring(0, 500),
          prescriptionRequired: isPrescription,
          curatedData,
        });
      }
    } catch {}
  }

  try { unlinkSync(jsonlPath); } catch {}
  console.log(`\r  Processed ${processed} Drugs@FDA records, found ${drugMap.size} new unique drugs     `);

  const drugs = Array.from(drugMap.values());
  return await insertDrugs(drugs, existingSlugs);
}

// ─── Deduplication Check ───

async function checkAndFixDuplicates(): Promise<number> {
  console.log('\n========================================');
  console.log('Checking for duplicates...');
  console.log('========================================');

  // Check for duplicate generic_names (different slugs, same name)
  const { sql } = await import('drizzle-orm');
  const dupes = await db.execute(sql`
    SELECT generic_name, COUNT(*) as cnt
    FROM fda_drugs
    GROUP BY generic_name
    HAVING COUNT(*) > 1
    ORDER BY cnt DESC
  `);

  if (dupes.rows.length === 0) {
    console.log('  No duplicate generic names found ✓');
    return 0;
  }

  console.log(`  Found ${dupes.rows.length} generic names with duplicates`);

  let removed = 0;
  for (const row of dupes.rows) {
    const name = row.generic_name as string;
    // Get all entries for this generic name
    const entries = await db.execute(sql`
      SELECT id, slug, is_featured, curated_data IS NOT NULL as has_data, created_at
      FROM fda_drugs
      WHERE generic_name = ${name}
      ORDER BY is_featured DESC, created_at ASC
    `);

    // Keep the first one (featured > earliest), delete the rest
    const toKeep = entries.rows[0];
    const toDelete = entries.rows.slice(1);

    for (const entry of toDelete) {
      await db.execute(sql`DELETE FROM fda_drugs WHERE id = ${entry.id as string}`);
      removed++;
    }
  }

  console.log(`  Removed ${removed} duplicate entries ✓`);
  return removed;
}

// ─── Main ───

async function main() {
  console.log('========================================');
  console.log('NDC Directory + Drugs@FDA Loader');
  console.log('========================================');

  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL not set');
    process.exit(1);
  }

  ensureDir();

  // Get existing slugs once
  const existingSlugs = await getExistingSlugs();

  // Process NDC Directory
  const ndcInserted = await processNDC(existingSlugs);

  // Process Drugs@FDA
  const drugsFdaInserted = await processDrugsFDA(existingSlugs);

  // Final deduplication check
  await checkAndFixDuplicates();

  // Final count
  const finalRows = await db.select({ slug: schema.fdaDrugs.slug }).from(schema.fdaDrugs);

  console.log('\n========================================');
  console.log('RESULTS');
  console.log('========================================');
  console.log(`  NDC Directory: +${ndcInserted} new drugs`);
  console.log(`  Drugs@FDA:     +${drugsFdaInserted} new drugs`);
  console.log(`  TOTAL IN DB:   ${finalRows.length} drugs`);
  console.log('========================================');

  // Cleanup
  try {
    const { rmSync } = await import('fs');
    rmSync(DOWNLOAD_DIR, { recursive: true, force: true });
    console.log('Cleaned up temp files ✓');
  } catch {}
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
