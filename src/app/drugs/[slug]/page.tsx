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
} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import drugsData from "@/data/drugs.json";
import type { Drug } from "@/lib/types";
import { SITE_URL } from "@/lib/utils";

const drugs = drugsData as Drug[];

export async function generateStaticParams() {
  return drugs.map((drug) => ({
    slug: drug.slug,
  }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = (await params).slug;
  const drug = drugs.find((d) => d.slug === slug);

  if (!drug) {
    return {};
  }

  const title = `${drug.name} (${drug.genericName}) - Uses, Dosage, Side Effects`;
  const description = drug.description.substring(0, 160);

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
    ],
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

function generateFAQs(drug: Drug): FAQItem[] {
  const faqs: FAQItem[] = [];

  // FAQ 1: What is [drug] used for?
  faqs.push({
    question: `What is ${drug.name} used for?`,
    answer: drug.uses,
  });

  // FAQ 2: What are the side effects?
  faqs.push({
    question: `What are the side effects of ${drug.name}?`,
    answer: drug.sideEffects,
  });

  // FAQ 3: Can I take during pregnancy?
  if (drug.pregnancy) {
    faqs.push({
      question: `Can I take ${drug.name} during pregnancy?`,
      answer: drug.pregnancy,
    });
  }

  // FAQ 4: What are the important warnings?
  faqs.push({
    question: `What are the important warnings for ${drug.name}?`,
    answer: drug.warnings,
  });

  return faqs;
}

function generateDrugJsonLd(drug: Drug) {
  return {
    "@context": "https://schema.org",
    "@type": "Drug",
    name: drug.name,
    alternateName: drug.genericName,
    description: drug.description,
    activeIngredient: drug.genericName,
    drugClass: {
      "@type": "DrugClass",
      name: drug.drugClass,
    },
    prescriptionStatus: drug.prescriptionRequired ? "PrescriptionOnly" : "OTC",
    warning: drug.warnings,
    adverseOutcome: drug.sideEffects,
    interactingDrug: drug.interactions,
    dosageForm: "Tablet, Capsule, Solution",
    manufacturer: {
      "@type": "Organization",
      name: "Pharmaceutical Manufacturer",
    },
    administrationRoute: "Oral",
  };
}

function generateFAQPageJsonLd(drug: Drug) {
  const faqs = generateFAQs(drug);
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

function generateMedicalWebPageJsonLd(drug: Drug) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: `${drug.name} - Drug Information`,
    description: drug.description,
    url: `${SITE_URL}/drugs/${drug.slug}`,
    isPartOf: {
      "@type": "WebSite",
      name: "InformedMedicine",
      url: SITE_URL,
    },
    about: {
      "@type": "Drug",
      name: drug.name,
    },
    mentions: {
      "@type": "MedicalCondition",
      name: drug.uses,
    },
  };
}

function generateBreadcrumbJsonLd(drug: Drug) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${SITE_URL}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Drug Database",
        item: `${SITE_URL}/drugs`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: drug.name,
        item: `${SITE_URL}/drugs/${drug.slug}`,
      },
    ],
  };
}

export default async function DrugDetailPage({ params }: Props) {
  const slug = (await params).slug;
  const drug = drugs.find((d) => d.slug === slug);

  if (!drug) {
    notFound();
  }

  const faqs = generateFAQs(drug);
  const relatedDrugs = drugs.filter((d) => d.id !== drug.id).slice(0, 3);

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/50">
      <JsonLd data={generateBreadcrumbJsonLd(drug)} />
      <JsonLd data={generateDrugJsonLd(drug)} />
      <JsonLd data={generateFAQPageJsonLd(drug)} />
      <JsonLd data={generateMedicalWebPageJsonLd(drug)} />

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
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                {drug.drugClass}
              </span>

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
            </div>

            {drug.brandNames.length > 0 && (
              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <p className="text-sm font-semibold text-muted-foreground mb-2">Brand Names:</p>
                <p className="text-foreground">{drug.brandNames.join(", ")}</p>
              </div>
            )}
          </div>

          <div className="prose dark:prose-invert max-w-none mb-8">
            <p className="lead text-lg text-muted-foreground leading-relaxed">
              {drug.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-border dark:border-slate-800 p-6">
              <h3 className="flex items-center gap-2 text-lg font-bold mb-3 text-foreground">
                <Lightbulb className="w-5 h-5 text-primary" />
                Overview
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{drug.description}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg border border-border dark:border-slate-800 p-6">
              <h3 className="flex items-center gap-2 text-lg font-bold mb-3 text-foreground">
                <Pill className="w-5 h-5 text-primary" />
                Uses
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{drug.uses}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg border border-border dark:border-slate-800 p-6">
              <h3 className="flex items-center gap-2 text-lg font-bold mb-3 text-foreground">
                <Package className="w-5 h-5 text-primary" />
                Dosage
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{drug.dosage}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg border border-amber-200 dark:border-amber-800/50 p-6 bg-amber-50 dark:bg-amber-900/10">
              <h3 className="flex items-center gap-2 text-lg font-bold mb-3 text-amber-900 dark:text-amber-200">
                <AlertCircle className="w-5 h-5" />
                Side Effects
              </h3>
              <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                {drug.sideEffects}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg border border-amber-200 dark:border-amber-800/50 p-6 bg-amber-50 dark:bg-amber-900/10">
              <h3 className="flex items-center gap-2 text-lg font-bold mb-3 text-amber-900 dark:text-amber-200">
                <AlertCircle className="w-5 h-5" />
                Interactions
              </h3>
              <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                {drug.interactions}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg border border-red-200 dark:border-red-800/50 p-6 bg-red-50 dark:bg-red-900/10">
              <h3 className="flex items-center gap-2 text-lg font-bold mb-3 text-red-900 dark:text-red-200">
                <AlertTriangle className="w-5 h-5" />
                Warnings
              </h3>
              <p className="text-sm text-red-800 dark:text-red-300 leading-relaxed">
                {drug.warnings}
              </p>
            </div>

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

          {relatedDrugs.length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-6 text-foreground">Related Medications</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedDrugs.map((related) => (
                  <Link
                    key={related.id}
                    href={`/drugs/${related.slug}`}
                    className="group bg-white dark:bg-slate-900 rounded-lg border border-border dark:border-slate-800 p-4 hover:shadow-lg hover:border-primary/50 transition-all"
                  >
                    <h4 className="font-bold text-foreground group-hover:text-primary transition-colors mb-1">
                      {related.name}
                    </h4>
                    <p className="text-xs text-muted-foreground italic mb-2">
                      {related.genericName}
                    </p>
                    <p className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded px-2 py-1 inline-block mb-3">
                      {related.drugClass}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {related.description}
                    </p>
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
                  professional medical advice. Always consult with a healthcare provider before
                  starting, stopping, or changing any medication. Do not use this information for
                  self-diagnosis or self-treatment. In case of overdose or emergency, contact poison
                  control or emergency services immediately.
                </p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
