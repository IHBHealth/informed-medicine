/**
 * Bulk Load FDA Drug Labels
 *
 * Downloads the entire FDA drug label database from bulk download files
 * and loads all unique drugs into the Neon database.
 *
 * Usage: npx tsx scripts/bulk-load-fda.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createWriteStream, createReadStream, unlinkSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { execSync } from 'child_process';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as schema from '../src/lib/schema';
import { labelToDrugFields, slugify, titleCase } from '../src/lib/openfda';
import type { CuratedDrugData } from '../src/lib/schema';

// Streaming JSON parser for large files
import { parser } from 'stream-json';
import { streamArray } from 'stream-json/streamers/StreamArray';
import { chain } from 'stream-chain';

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const DOWNLOAD_DIR = resolve(__dirname, '../tmp-fda-data');
const TOTAL_PARTS = 13;
const BASE_URL = 'https://download.open.fda.gov/drug/label';

interface DrugEntry {
  slug: string;
  genericName: string;
  displayName: string;
  brandNames: string[];
  drugClass: string | null;
  setId: string;
  prescriptionRequired: boolean;
  label: any;
  effectiveTime: string;
}

async function downloadFile(url: string, dest: string): Promise<void> {
  console.log(`  Downloading ${url}...`);
  // Use curl for reliable downloads with progress
  execSync(`curl -L -o "${dest}" "${url}" 2>&1`, { stdio: 'inherit' });
  console.log('  Download complete ✓');
}

function unzipFile(zipPath: string): string {
  console.log(`  Unzipping...`);
  execSync(`unzip -o "${zipPath}" -d "${DOWNLOAD_DIR}" 2>/dev/null`, { stdio: 'pipe' });

  const files = readdirSync(DOWNLOAD_DIR).filter(f => f.endsWith('.json'));
  const jsonFile = files.find(f => f.includes('drug-label'));
  if (!jsonFile) throw new Error('No JSON file found in zip');

  console.log(`  Unzipped: ${jsonFile} ✓`);
  return resolve(DOWNLOAD_DIR, jsonFile);
}

/**
 * Stream-parse a large JSON file and extract unique drugs.
 * The file structure is: { "meta": {...}, "results": [...labels...] }
 * We stream through the results array without loading it all into memory.
 */
async function streamExtractDrugs(jsonPath: string, allDrugs: Map<string, DrugEntry>): Promise<{ labelsProcessed: number; newDrugs: number }> {
  return new Promise((resolve, reject) => {
    let labelsProcessed = 0;
    let newDrugs = 0;

    // We need to extract just the "results" array from the top-level object.
    // Use stream-json to pick the results array and stream its items.
    const pipeline = chain([
      createReadStream(jsonPath),
      parser(),
      streamArray(),
    ]);

    pipeline.on('data', ({ value: label }: { value: any }) => {
      labelsProcessed++;

      if (labelsProcessed % 5000 === 0) {
        process.stdout.write(`\r  Processed ${labelsProcessed} labels, ${allDrugs.size} unique drugs...`);
      }

      const genericNames = label?.openfda?.generic_name || [];
      if (genericNames.length === 0) return;

      for (const name of genericNames) {
        const slug = slugify(name);
        if (!slug || slug.length < 2) continue;

        const effectiveTime = label.effective_time || '0';
        const existing = allDrugs.get(slug);

        if (!existing || effectiveTime > existing.effectiveTime) {
          if (!existing) newDrugs++;

          const brandNames = (label.openfda?.brand_name || []).map((b: string) => titleCase(b));
          const drugClass = label.openfda?.pharm_class_epc?.[0] || null;
          const productType = label.openfda?.product_type?.[0] || '';

          allDrugs.set(slug, {
            slug,
            genericName: name.toLowerCase(),
            displayName: titleCase(name),
            brandNames,
            drugClass,
            setId: label.set_id,
            prescriptionRequired: productType.includes('Prescription'),
            label,
            effectiveTime,
          });
        }
      }
    });

    pipeline.on('end', () => {
      console.log(`\r  Processed ${labelsProcessed} labels, ${newDrugs} new unique drugs                `);
      resolve({ labelsProcessed, newDrugs });
    });

    pipeline.on('error', (err: Error) => {
      // stream-json with streamArray expects the top-level to be an array.
      // openFDA files are { "meta": ..., "results": [...] }
      // We need to handle this differently.
      reject(err);
    });
  });
}

/**
 * Alternative: Use jq to extract results array, then stream parse.
 * This handles the { "meta": ..., "results": [...] } structure.
 */
async function extractDrugsWithJq(jsonPath: string, allDrugs: Map<string, DrugEntry>): Promise<{ labelsProcessed: number; newDrugs: number }> {
  console.log(`  Extracting drug data (streaming)...`);

  // Use jq to stream the results array as individual JSON objects (one per line)
  const jqOutputPath = jsonPath + '.jsonl';

  try {
    // Check if jq is available
    execSync('which jq', { stdio: 'pipe' });
  } catch {
    // If jq is not available, try python
    console.log('  jq not found, using python to extract...');
    return await extractDrugsWithPython(jsonPath, allDrugs);
  }

  // Use jq to stream results as JSONL
  console.log('  Using jq to extract results...');
  execSync(`jq -c '.results[]' "${jsonPath}" > "${jqOutputPath}"`, {
    stdio: 'pipe',
    maxBuffer: 1024 * 1024 * 10,
  });

  let labelsProcessed = 0;
  let newDrugs = 0;

  // Read JSONL line by line
  const { createInterface } = await import('readline');
  const rl = createInterface({
    input: createReadStream(jqOutputPath),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (!line.trim()) continue;

    try {
      const label = JSON.parse(line);
      labelsProcessed++;

      if (labelsProcessed % 5000 === 0) {
        process.stdout.write(`\r  Processed ${labelsProcessed} labels, ${allDrugs.size} unique drugs...`);
      }

      const genericNames = label?.openfda?.generic_name || [];
      if (genericNames.length === 0) continue;

      for (const name of genericNames) {
        const slug = slugify(name);
        if (!slug || slug.length < 2) continue;

        const effectiveTime = label.effective_time || '0';
        const existing = allDrugs.get(slug);

        if (!existing || effectiveTime > existing.effectiveTime) {
          if (!existing) newDrugs++;

          const brandNames = (label.openfda?.brand_name || []).map((b: string) => titleCase(b));
          const drugClass = label.openfda?.pharm_class_epc?.[0] || null;
          const productType = label.openfda?.product_type?.[0] || '';

          allDrugs.set(slug, {
            slug,
            genericName: name.toLowerCase(),
            displayName: titleCase(name),
            brandNames,
            drugClass,
            setId: label.set_id,
            prescriptionRequired: productType.includes('Prescription'),
            label,
            effectiveTime,
          });
        }
      }
    } catch {
      // Skip malformed lines
    }
  }

  // Cleanup JSONL file
  try { unlinkSync(jqOutputPath); } catch {}

  console.log(`\r  Processed ${labelsProcessed} labels, ${newDrugs} new unique drugs                `);
  return { labelsProcessed, newDrugs };
}

/**
 * Fallback: Use Python to extract results from JSON
 */
async function extractDrugsWithPython(jsonPath: string, allDrugs: Map<string, DrugEntry>): Promise<{ labelsProcessed: number; newDrugs: number }> {
  console.log('  Using python to extract results...');
  const jqOutputPath = jsonPath + '.jsonl';

  // Use Python to stream-extract labels
  const pythonScript = `
import json, sys

with open("${jsonPath}", "r") as f:
    # Skip to "results" key by reading through the file
    data = json.load(f)
    results = data.get("results", [])
    for label in results:
        print(json.dumps(label))
`;

  execSync(`python3 -c '${pythonScript.replace(/'/g, "\\'")}' > "${jqOutputPath}"`, {
    stdio: 'pipe',
    maxBuffer: 1024 * 1024 * 10,
  });

  let labelsProcessed = 0;
  let newDrugs = 0;

  const { createInterface } = await import('readline');
  const rl = createInterface({
    input: createReadStream(jqOutputPath),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (!line.trim()) continue;

    try {
      const label = JSON.parse(line);
      labelsProcessed++;

      if (labelsProcessed % 5000 === 0) {
        process.stdout.write(`\r  Processed ${labelsProcessed} labels, ${allDrugs.size} unique drugs...`);
      }

      const genericNames = label?.openfda?.generic_name || [];
      if (genericNames.length === 0) continue;

      for (const name of genericNames) {
        const slug = slugify(name);
        if (!slug || slug.length < 2) continue;

        const effectiveTime = label.effective_time || '0';
        const existing = allDrugs.get(slug);

        if (!existing || effectiveTime > existing.effectiveTime) {
          if (!existing) newDrugs++;

          const brandNames = (label.openfda?.brand_name || []).map((b: string) => titleCase(b));
          const drugClass = label.openfda?.pharm_class_epc?.[0] || null;
          const productType = label.openfda?.product_type?.[0] || '';

          allDrugs.set(slug, {
            slug,
            genericName: name.toLowerCase(),
            displayName: titleCase(name),
            brandNames,
            drugClass,
            setId: label.set_id,
            prescriptionRequired: productType.includes('Prescription'),
            label,
            effectiveTime,
          });
        }
      }
    } catch {
      // Skip malformed lines
    }
  }

  try { unlinkSync(jqOutputPath); } catch {}

  console.log(`\r  Processed ${labelsProcessed} labels, ${newDrugs} new unique drugs                `);
  return { labelsProcessed, newDrugs };
}

async function getExistingSlugs(): Promise<Set<string>> {
  console.log('\nFetching existing drug slugs from database...');
  const existing = await db.select({ slug: schema.fdaDrugs.slug })
    .from(schema.fdaDrugs);
  const slugSet = new Set(existing.map(e => e.slug));
  console.log(`  Found ${slugSet.size} existing drugs in database`);
  return slugSet;
}

async function insertDrugs(drugs: DrugEntry[], existingSlugs: Set<string>): Promise<number> {
  let inserted = 0;
  const newDrugs = drugs.filter(d => !existingSlugs.has(d.slug));

  console.log(`\n${newDrugs.length} new drugs to insert into database`);

  // Insert in batches of 10 (parallel DB calls)
  for (let i = 0; i < newDrugs.length; i += 10) {
    const batch = newDrugs.slice(i, i + 10);

    await Promise.all(batch.map(async (drug) => {
      try {
        const fields = labelToDrugFields(drug.label as any);
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

        const shortDesc = (fields.description || fields.uses || '').substring(0, 500);

        await db.insert(schema.fdaDrugs).values({
          genericName: drug.genericName,
          slug: drug.slug,
          displayName: drug.displayName,
          brandNames: drug.brandNames,
          drugClass: drug.drugClass,
          setId: drug.setId,
          description: shortDesc,
          prescriptionRequired: drug.prescriptionRequired,
          isFeatured: false,
          curatedData: structuredData,
          lastSyncedAt: new Date(),
        });

        inserted++;
        existingSlugs.add(drug.slug);
      } catch (e: any) {
        if (!e.message?.includes('duplicate') && !e.message?.includes('unique')) {
          // Only log non-duplicate errors
        }
      }
    }));

    if ((i % 200 === 0 && i > 0) || i + 10 >= newDrugs.length) {
      process.stdout.write(`\r  Progress: ${Math.min(i + 10, newDrugs.length)}/${newDrugs.length} processed, ${inserted} inserted...`);
    }
  }

  console.log(`\r  Done! Inserted ${inserted} new drugs                                    `);
  return inserted;
}

async function processFile(partNumber: number, allDrugs: Map<string, DrugEntry>): Promise<number> {
  const paddedNum = String(partNumber).padStart(4, '0');
  const paddedTotal = String(TOTAL_PARTS).padStart(4, '0');
  const fileName = `drug-label-${paddedNum}-of-${paddedTotal}.json.zip`;
  const url = `${BASE_URL}/${fileName}`;
  const zipPath = resolve(DOWNLOAD_DIR, fileName);

  console.log(`\n========== Part ${partNumber}/${TOTAL_PARTS} ==========`);

  try {
    // Download
    await downloadFile(url, zipPath);

    // Unzip
    const jsonPath = unzipFile(zipPath);

    // Extract drugs using jq (streams, handles large files)
    const result = await extractDrugsWithJq(jsonPath, allDrugs);

    // Cleanup
    try { unlinkSync(zipPath); } catch {}
    try { unlinkSync(jsonPath); } catch {}

    console.log(`  Total unique drugs so far: ${allDrugs.size}`);
    return result.labelsProcessed;
  } catch (error: any) {
    console.error(`  Error processing part ${partNumber}: ${error.message}`);
    // Cleanup on error
    try { unlinkSync(zipPath); } catch {}
    return 0;
  }
}

async function main() {
  console.log('========================================');
  console.log('FDA Bulk Drug Label Loader');
  console.log('========================================');

  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL not set. Make sure .env.local exists.');
    process.exit(1);
  }

  console.log(`Database connected ✓`);

  // Create download directory
  if (!existsSync(DOWNLOAD_DIR)) {
    mkdirSync(DOWNLOAD_DIR, { recursive: true });
  }

  // Collect all unique drugs across all files
  const allDrugs = new Map<string, DrugEntry>();
  let totalLabels = 0;

  // Process each file
  for (let part = 1; part <= TOTAL_PARTS; part++) {
    const count = await processFile(part, allDrugs);
    totalLabels += count;
  }

  console.log('\n========================================');
  console.log(`Total labels processed: ${totalLabels}`);
  console.log(`Total unique drugs found: ${allDrugs.size}`);
  console.log('========================================');

  // Get existing drugs from database
  const existingSlugs = await getExistingSlugs();

  // Insert new drugs
  const drugsToInsert = Array.from(allDrugs.values());
  const inserted = await insertDrugs(drugsToInsert, existingSlugs);

  // Final count
  const finalCount = await db.select({ slug: schema.fdaDrugs.slug }).from(schema.fdaDrugs);
  console.log(`\n========================================`);
  console.log(`FINAL DATABASE COUNT: ${finalCount.length} drugs`);
  console.log('========================================');

  // Cleanup temp directory
  try {
    const { rmSync } = await import('fs');
    rmSync(DOWNLOAD_DIR, { recursive: true, force: true });
    console.log('Cleaned up temporary files ✓');
  } catch {}
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
