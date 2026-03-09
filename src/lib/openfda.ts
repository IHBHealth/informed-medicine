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
  do_not_use?: string[];
  stop_use?: string[];
  ask_doctor?: string[];
  mechanism_of_action?: string[];
  dosage_forms_and_strengths?: string[];
  how_supplied?: string[];
  geriatric_use?: string[];
  pediatric_use?: string[];
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
  const url = `${OPENFDA_BASE}?search=openfda.generic_name:${letter}*&count=openfda.generic_name.exact${apiKeyParam()}`;
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

export function firstField(arr?: string[]): string {
  return arr?.[0] || "";
}

export function labelToDrugFields(label: OpenFDALabel) {
  const uses = cleanFdaHtml(firstField(label.indications_and_usage));
  const desc = cleanFdaHtml(firstField(label.description));
  const dosage = cleanFdaHtml(firstField(label.dosage_and_administration));
  const sideEffects = cleanFdaHtml(firstField(label.adverse_reactions));
  const warnings = cleanFdaHtml(
    firstField(label.boxed_warning) ||
    firstField(label.warnings_and_cautions) ||
    firstField(label.warnings)
  );
  const interactions = cleanFdaHtml(firstField(label.drug_interactions));
  const pregnancy = cleanFdaHtml(
    firstField(label.pregnancy) || firstField(label.pregnancy_or_breast_feeding)
  );
  const storage = cleanFdaHtml(
    firstField(label.storage_and_handling) || firstField(label.how_supplied)
  );

  return {
    description: desc || uses,
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
