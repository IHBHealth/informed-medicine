import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Pill,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Baby,
  Package,
  Lightbulb,
  HelpCircle,
  FileText,
} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import { db } from "@/lib/db";
import { fdaDrugs } from "@/lib/schema";
import type { CuratedDrugData } from "@/lib/schema";
import { eq, ne, sql } from "drizzle-orm";
import { fetchLatestLabel, labelToDrugFields, titleCase, cleanFdaHtml, firstField } from "@/lib/openfda";
import drugsData from "@/data/drugs.json";
import type { Drug } from "@/lib/types";
import { SITE_URL } from "@/lib/utils";

export const revalidate = 86400; // ISR: revalidate every 24 hours
export const dynamicParams = true;

interface DrugDisplay {
  slug: string;
  name: string;
  genericName: string;
  brandNames: string[];
  drugClass: string;
  description: string;
  uses: string;
  dosage: string;
  sideEffects: string;
  warnings: string;
  interactions: string;
  pregnancy: string | null;
  storage: string | null;
  prescriptionRequired: boolean;
  schedule: string | null;
  source: "curated" | "fda" | "static";
}

async function getDrug(slug: string): Promise<DrugDisplay | null> {
  // 1. Try the database first
  try {
    const rows = await db
      .select()
      .from(fdaDrugs)
      .where(eq(fdaDrugs.slug, slug))
      .limit(1);

    if (rows[0]) {
      const row = rows[0];
      const curated = row.curatedData as CuratedDrugData | null;

      if (curated) {
        return {
          slug: row.slug,
          name: row.displayName,
          genericName: row.genericName,
          brandNames: row.brandNames,
          drugClass: row.drugClass || "",
          description: curated.description,
          uses: curated.uses,
          dosage: curated.dosage,
          sideEffects: curated.sideEffects,
          warnings: curated.warnings,
          interactions: curated.interactions,
          pregnancy: curated.pregnancy,
          storage: curated.storage,
          prescriptionRequired: row.prescriptionRequired ?? false,
          schedule: curated.schedule,
          source: "curated",
        };
      }

      // DB entry without curated data — fetch label from openFDA
      if (row.setId) {
        const label = await fetchLatestLabel(row.genericName);
        if (label) {
          const fields = labelToDrugFields(label);
          return {
            slug: row.slug,
            name: row.displayName,
            genericName: row.genericName,
            brandNames: row.brandNames,
            drugClass: row.drugClass || label.openfda?.pharm_class_epc?.[0] || "",
            ...fields,
            prescriptionRequired: row.prescriptionRequired ?? false,
            schedule: null,
            source: "fda",
          };
        }
      }

      // DB entry but no openFDA label available — use what we have
      return {
        slug: row.slug,
        name: row.displayName,
        genericName: row.genericName,
        brandNames: row.brandNames,
        drugClass: row.drugClass || "",
        description: row.description || "",
        uses: "",
        dosage: "",
        sideEffects: "",
        warnings: "",
        interactions: "",
        pregnancy: null,
        storage: null,
        prescriptionRequired: row.prescriptionRequired ?? false,
        schedule: null,
        source: "fda",
      };
    }
  } catch {
    // DB unavailable — continue to fallback
  }

  // 2. Fallback to static JSON
  const staticDrug = (drugsData as Drug[]).find((d) => d.slug === slug);
  if (staticDrug) {
    return {
      slug: staticDrug.slug,
      name: staticDrug.name,
      genericName: staticDrug.genericName,
      brandNames: staticDrug.brandNames,
      drugClass: staticDrug.drugClass,
      description: staticDrug.description,
      uses: staticDrug.uses,
      dosage: staticDrug.dosage,
      sideEffects: staticDrug.sideEffects,
      warnings: staticDrug.warnings,
      interactions: staticDrug.interactions,
      pregnancy: staticDrug.pregnancy,
      storage: staticDrug.storage,
      prescriptionRequired: staticDrug.prescriptionRequired,
      schedule: staticDrug.schedule,
      source: "static",
    };
  }

  return null;
}

async function getRelatedDrugs(currentSlug: string): Promise<Array<{ slug: string; name: string; genericName: string; drugClass: string; description: string }>> {
  try {
    const rows = await db
      .select({
        slug: fdaDrugs.slug,
        displayName: fdaDrugs.displayName,
        genericName: fdaDrugs.genericName,
        drugClass: fdaDrugs.drugClass,
        description: fdaDrugs.description,
      })
      .from(fdaDrugs)
      .where(ne(fdaDrugs.slug, currentSlug))
      .orderBy(sql`RANDOM()`)
      .limit(3);

    return rows.map((r) => ({
      slug: r.slug,
      name: r.displayName,
      genericName: r.genericName,
      drugClass: r.drugClass || "",
      description: r.description || "",
    }));
  } catch {
    // DB unavailable — fall back to static
    return (drugsData as Drug[])
      .filter((d) => d.slug !== currentSlug)
      .slice(0, 3)
      .map((d) => ({
        slug: d.slug,
        name: d.name,
        genericName: d.genericName,
        drugClass: d.drugClass,
        description: d.description,
      }));
  }
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = (await params).slug;
  const drug = await getDrug(slug);

  if (!drug) {
    return {};
  }

  const title = `${drug.name} (${drug.genericName}) - Uses, Dosage, Side Effects`;
  const description = (drug.description || drug.uses || "").substring(0, 160);

  return {
    title,
    description,
    keywords: [
      drug.name,
      drug.genericName,
      "side effects",
      "dosage",
      "interactions",
      "warnings",
      drug.drugClass,
    ].filter(Boolean),
    openGraph: {
      title,
      description,
      type: "article",
      url: `${SITE_URL}/drugs/${drug.slug}`,
      siteName: "InformedMedicine",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

interface FAQItem {
  question: string;
  answer: string;
}

function generateFAQs(drug: DrugDisplay): FAQItem[] {
  const faqs: FAQItem[] = [];

  if (drug.uses) {
    faqs.push({
      question: `What is ${drug.name} used for?`,
      answer: drug.uses,
    });
  }

  if (drug.sideEffects) {
    faqs.push({
      question: `What are the side effects of ${drug.name}?`,
      answer: drug.sideEffects,
    });
  }

  if (drug.pregnancy) {
    faqs.push({
      question: `Can I take ${drug.name} during pregnancy?`,
      answer: drug.pregnancy,
    });
  }

  if (drug.warnings) {
    faqs.push({
      question: `What are the important warnings for ${drug.name}?`,
      answer: drug.warnings,
    });
  }

  return faqs;
}

function generateDrugJsonLd(drug: DrugDisplay) {
  return {
    "@context": "https://schema.org",
    "@type": "Drug",
    name: drug.name,
    alternateName: drug.genericName,
    description: drug.description,
    activeIngredient: drug.genericName,
    ...(drug.drugClass && {
      drugClass: {
        "@type": "DrugClass",
        name: drug.drugClass,
      },
    }),
    prescriptionStatus: drug.prescriptionRequired ? "PrescriptionOnly" : "OTC",
    ...(drug.warnings && { warning: drug.warnings }),
    ...(drug.sideEffects && { adverseOutcome: drug.sideEffects }),
    ...(drug.interactions && { interactingDrug: drug.interactions }),
  };
}

function generateFAQPageJsonLd(drug: DrugDisplay) {
  const faqs = generateFAQs(drug);
  if (faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

function generateBreadcrumbJsonLd(drug: DrugDisplay) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Drug Database", item: `${SITE_URL}/drugs` },
      { "@type": "ListItem", position: 3, name: drug.name, item: `${SITE_URL}/drugs/${drug.slug}` },
    ],
  };
}

export default async function DrugDetailPage({ params }: Props) {
  const slug = (await params).slug;
  const drug = await getDrug(slug);

  if (!drug) {
    notFound();
  }

  const faqs = generateFAQs(drug);
  const relatedDrugs = await getRelatedDrugs(slug);
  const faqJsonLd = generateFAQPageJsonLd(drug);

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/50">
      <JsonLd data={generateBreadcrumbJsonLd(drug)} />
      <JsonLd data={generateDrugJsonLd(drug)} />
      {faqJsonLd && <JsonLd data={faqJsonLd} />}

      <div className="container mx-auto px-4 py-12">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Drug Database", href: "/drugs" },
            { label: drug.name },
          ]}
        />

        <article className="max-w-4xl">
          <div className="mb-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                  {drug.name}
                </h1>
                <h2 className="text-xl text-muted-foreground italic">
                  Generic Name: {drug.genericName}
                </h2>
              </div>
              <Pill className="w-12 h-12 text-primary flex-shrink-0" />
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {drug.drugClass && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  {drug.drugClass}
                </span>
              )}

              {drug.prescriptionRequired ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                  <ShieldAlert className="w-4 h-4" />
                  Prescription Required
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                  <ShieldCheck className="w-4 h-4" />
                  Over-the-Counter (OTC)
                </span>
              )}

              {drug.schedule && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                  Schedule {drug.schedule}
                </span>
              )}

              {drug.source === "fda" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                  <FileText className="w-4 h-4" />
                  FDA Label
                </span>
              )}
            </div>

            {drug.brandNames.length > 0 && (
              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <p className="text-sm font-semibold text-muted-foreground mb-2">Brand Names:</p>
                <p className="text-foreground">{drug.brandNames.join(", ")}</p>
              </div>
            )}
          </div>

          {drug.description && (
            <div className="prose dark:prose-invert max-w-none mb-8">
              <p className="lead text-lg text-muted-foreground leading-relaxed">
                {drug.description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {drug.description && (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-border dark:border-slate-800 p-6">
                <h3 className="flex items-center gap-2 text-lg font-bold mb-3 text-foreground">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  Overview
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{drug.description}</p>
              </div>
            )}

            {drug.uses && (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-border dark:border-slate-800 p-6">
                <h3 className="flex items-center gap-2 text-lg font-bold mb-3 text-foreground">
                  <Pill className="w-5 h-5 text-primary" />
                  Uses
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{drug.uses}</p>
              </div>
            )}

            {drug.dosage && (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-border dark:border-slate-800 p-6">
                <h3 className="flex items-center gap-2 text-lg font-bold mb-3 text-foreground">
                  <Package className="w-5 h-5 text-primary" />
                  Dosage
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{drug.dosage}</p>
              </div>
            )}

            {drug.sideEffects && (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-amber-200 dark:border-amber-800/50 p-6 bg-amber-50 dark:bg-amber-900/10">
                <h3 className="flex items-center gap-2 text-lg font-bold mb-3 text-amber-900 dark:text-amber-200">
                  <AlertCircle className="w-5 h-5" />
                  Side Effects
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                  {drug.sideEffects}
                </p>
              </div>
            )}

            {drug.interactions && (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-amber-200 dark:border-amber-800/50 p-6 bg-amber-50 dark:bg-amber-900/10">
                <h3 className="flex items-center gap-2 text-lg font-bold mb-3 text-amber-900 dark:text-amber-200">
                  <AlertCircle className="w-5 h-5" />
                  Interactions
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                  {drug.interactions}
                </p>
              </div>
            )}

            {drug.warnings && (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-red-200 dark:border-red-800/50 p-6 bg-red-50 dark:bg-red-900/10">
                <h3 className="flex items-center gap-2 text-lg font-bold mb-3 text-red-900 dark:text-red-200">
                  <AlertTriangle className="w-5 h-5" />
                  Warnings
                </h3>
                <p className="text-sm text-red-800 dark:text-red-300 leading-relaxed">
                  {drug.warnings}
                </p>
              </div>
            )}

            {drug.pregnancy && (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-border dark:border-slate-800 p-6">
                <h3 className="flex items-center gap-2 text-lg font-bold mb-3 text-foreground">
                  <Baby className="w-5 h-5 text-primary" />
                  Pregnancy
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{drug.pregnancy}</p>
              </div>
            )}

            {drug.storage && (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-border dark:border-slate-800 p-6">
                <h3 className="flex items-center gap-2 text-lg font-bold mb-3 text-foreground">
                  <Package className="w-5 h-5 text-primary" />
                  Storage
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{drug.storage}</p>
              </div>
            )}
          </div>

          {faqs.length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-6 text-foreground">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <details
                    key={index}
                    className="group bg-white dark:bg-slate-900 rounded-lg border border-border dark:border-slate-800 p-6 cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <summary className="flex items-center gap-3 font-semibold text-foreground hover:text-primary transition-colors list-none">
                      <HelpCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>{faq.question}</span>
                      <span className="ml-auto text-primary group-open:rotate-180 transition-transform">
                        ▼
                      </span>
                    </summary>
                    <p className="mt-4 pl-8 text-sm text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {relatedDrugs.length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-6 text-foreground">Related Medications</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedDrugs.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/drugs/${related.slug}`}
                    className="group bg-white dark:bg-slate-900 rounded-lg border border-border dark:border-slate-800 p-4 hover:shadow-lg hover:border-primary/50 transition-all"
                  >
                    <h4 className="font-bold text-foreground group-hover:text-primary transition-colors mb-1">
                      {related.name}
                    </h4>
                    <p className="text-xs text-muted-foreground italic mb-2">
                      {related.genericName}
                    </p>
                    {related.drugClass && (
                      <p className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded px-2 py-1 inline-block mb-3">
                        {related.drugClass}
                      </p>
                    )}
                    {related.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {related.description}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg p-6">
            <div className="flex gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-1">
                  Medical Disclaimer
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  This drug information is for educational purposes only and should not replace
                  professional medical advice. Drug information is sourced from the FDA National Drug
                  Code Directory and Structured Product Labeling. Always consult with a healthcare
                  provider before starting, stopping, or changing any medication.
                </p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
