const OPENFDA_BASE = "https://api.fda.gov/drug/label.json";

export interface OpenFDACountResult {
  term: string;
  count: number;
}

export interface OpenFDALabel {
  set_id: string;
  effective_time?: string;
  openfda?: {
    generic_name?: string[];
    brand_name?: string[];
    pharm_class_epc?: string[];
    product_type?: string[];
    application_number?: string[];
    route?: string[];
  };
  // Prescription drug fields
  indications_and_usage?: string[];
  dosage_and_administration?: string[];
  warnings?: string[];
  warnings_and_cautions?: string[];
  adverse_reactions?: string[];
  drug_interactions?: string[];
  pregnancy?: string[];
  pregnancy_or_breast_feeding?: string[];
  storage_and_handling?: string[];
  description?: string[];
  boxed_warning?: string[];
  contraindications?: string[];
  overdosage?: string[];
  mechanism_of_action?: string[];
  dosage_forms_and_strengths?: string[];
  how_supplied?: string[];
  geriatric_use?: string[];
  pediatric_use?: string[];
  // OTC drug fields
  purpose?: string[];
  active_ingredient?: string[];
  do_not_use?: string[];
  stop_use?: string[];
  ask_doctor?: string[];
  ask_doctor_or_pharmacist?: string[];
  when_using?: string[];
  keep_out_of_reach_of_children?: string[];
}

function apiKeyParam(): string {
  const key = process.env.OPENFDA_API_KEY;
  return key ? `&api_key=${key}` : "";
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) {
    throw new Error(`openFDA API error: ${res.status} ${res.statusText} for ${url}`);
  }
  return res.json();
}

export async function fetchDrugCountsByLetter(letter: string): Promise<OpenFDACountResult[]> {
  const url = `${OPENFDA_BASE}?search=openfda.generic_name:${letter}*&count=openfda.generic_name.exact&limit=1000${apiKeyParam()}`;
  try {
    const data = await fetchJson<{ results: OpenFDACountResult[] }>(url);
    return data.results || [];
  } catch {
    return [];
  }
}

export async function fetchLatestLabel(genericName: string): Promise<OpenFDALabel | null> {
  const encoded = encodeURIComponent(`"${genericName}"`);
  const url = `${OPENFDA_BASE}?search=openfda.generic_name.exact:${encoded}&sort=effective_time:desc&limit=1${apiKeyParam()}`;
  try {
    const data = await fetchJson<{ results?: OpenFDALabel[] }>(url);
    return data.results?.[0] || null;
  } catch {
    return null;
  }
}

export async function fetchLabelBySetId(setId: string): Promise<OpenFDALabel | null> {
  const url = `${OPENFDA_BASE}?search=set_id:"${setId}"&sort=effective_time:desc&limit=1${apiKeyParam()}`;
  try {
    const data = await fetchJson<{ results?: OpenFDALabel[] }>(url);
    return data.results?.[0] || null;
  } catch {
    return null;
  }
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function titleCase(name: string): string {
  return name
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function cleanFdaHtml(raw: string | undefined): string {
  if (!raw) return "";
  return raw
    .replace(/<[^>]*>/g, "") // strip HTML tags
    .replace(/\s+/g, " ") // collapse whitespace
    .trim();
}

/** Clean FDA HTML and truncate to a max character limit at a sentence boundary */
function cleanAndTruncate(raw: string | undefined, maxChars: number): string {
  const cleaned = cleanFdaHtml(raw);
  if (!cleaned || cleaned.length <= maxChars) return cleaned;

  // Try to cut at a sentence boundary
  const truncated = cleaned.substring(0, maxChars);
  const lastPeriod = truncated.lastIndexOf(". ");
  if (lastPeriod > maxChars * 0.4) {
    return truncated.substring(0, lastPeriod + 1);
  }
  return truncated.trimEnd() + "...";
}

export function firstField(arr?: string[]): string {
  return arr?.[0] || "";
}

/** Combine multiple FDA text fields, cleaning and joining with spaces */
function combineFields(...fields: (string | undefined)[]): string {
  return fields
    .map((f) => cleanFdaHtml(f))
    .filter(Boolean)
    .join(" ");
}

export function labelToDrugFields(label: OpenFDALabel) {
  const isOTC = label.openfda?.product_type?.[0]?.includes("OTC") ||
    Boolean(label.purpose?.[0]) ||
    Boolean(label.active_ingredient?.[0]);

  // --- Description ---
  // For Rx drugs: use the first 500 chars of `description`, falling back to `indications_and_usage`
  // For OTC drugs: use `purpose` or `indications_and_usage`
  let description: string;
  if (isOTC) {
    const purpose = cleanFdaHtml(firstField(label.purpose));
    const indications = cleanAndTruncate(firstField(label.indications_and_usage), 500);
    description = purpose || indications;
  } else {
    const rawDesc = cleanAndTruncate(firstField(label.description), 500);
    const indications = cleanAndTruncate(firstField(label.indications_and_usage), 500);
    description = rawDesc || indications;
  }

  // --- Uses / Indications ---
  const uses = cleanAndTruncate(firstField(label.indications_and_usage), 800);

  // --- Dosage ---
  const dosage = cleanAndTruncate(firstField(label.dosage_and_administration), 800);

  // --- Side Effects ---
  // Rx: adverse_reactions. OTC: when_using + stop_use
  let sideEffects: string;
  if (isOTC) {
    sideEffects = combineFields(
      firstField(label.when_using),
      firstField(label.stop_use)
    );
    if (!sideEffects) {
      sideEffects = cleanAndTruncate(firstField(label.adverse_reactions), 800);
    }
  } else {
    sideEffects = cleanAndTruncate(firstField(label.adverse_reactions), 800);
  }

  // --- Warnings ---
  // Rx: boxed_warning > warnings_and_cautions > warnings + contraindications
  // OTC: warnings + do_not_use
  let warnings: string;
  if (isOTC) {
    warnings = combineFields(
      firstField(label.warnings),
      firstField(label.do_not_use)
    );
  } else {
    const boxed = cleanAndTruncate(firstField(label.boxed_warning), 500);
    const warningsText = cleanAndTruncate(
      firstField(label.warnings_and_cautions) || firstField(label.warnings),
      800
    );
    const contra = cleanAndTruncate(firstField(label.contraindications), 400);
    warnings = [boxed, warningsText, contra].filter(Boolean).join(" ");
  }

  // --- Interactions ---
  // Rx: drug_interactions. OTC: ask_doctor + ask_doctor_or_pharmacist
  let interactions: string;
  if (isOTC) {
    interactions = combineFields(
      firstField(label.ask_doctor),
      firstField(label.ask_doctor_or_pharmacist)
    );
    if (!interactions) {
      interactions = cleanAndTruncate(firstField(label.drug_interactions), 600);
    }
  } else {
    interactions = cleanAndTruncate(firstField(label.drug_interactions), 800);
  }

  // --- Pregnancy ---
  const pregnancy = cleanAndTruncate(
    firstField(label.pregnancy) || firstField(label.pregnancy_or_breast_feeding),
    600
  );

  // --- Storage ---
  const storage = cleanAndTruncate(
    firstField(label.storage_and_handling) || firstField(label.how_supplied),
    400
  );

  return {
    description,
    uses,
    dosage,
    sideEffects,
    warnings,
    interactions,
    pregnancy: pregnancy || null,
    storage: storage || null,
  };
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
