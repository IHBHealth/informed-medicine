import { Metadata } from "next";
import Link from "next/link";
import { Pill, Eye, ShieldCheck, ShieldAlert } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import drugsData from "@/data/drugs.json";
import type { Drug } from "@/lib/types";
import { SITE_URL } from "@/lib/utils";

const drugs = drugsData as Drug[];

export const metadata: Metadata = {
  title: "Drug Database - Medication Information & Side Effects",
  description:
    "Browse our comprehensive drug database with medication information, side effects, dosage, interactions, and warnings. Get reliable health information about prescription and over-the-counter medications.",
  keywords: [
    "drug database",
    "medications",
    "side effects",
    "dosage",
    "drug interactions",
    "prescription drugs",
  ],
  openGraph: {
    title: "Drug Database - Medication Information & Side Effects",
    description:
      "Browse our comprehensive drug database with medication information, side effects, dosage, interactions, and warnings.",
    type: "website",
    url: `${SITE_URL}/drugs`,
    siteName: "InformedMedicine",
  },
  twitter: {
    card: "summary_large_image",
    title: "Drug Database - Medication Information & Side Effects",
    description:
      "Browse our comprehensive drug database with medication information, side effects, dosage, interactions, and warnings.",
  },
};

const breadcrumbJsonLd = {
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
  ],
};

const collectionJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Drug Database",
  description:
    "Comprehensive database of medications with information about uses, dosage, side effects, and interactions.",
  url: `${SITE_URL}/drugs`,
  mainEntity: {
    "@type": "MedicalWebPage",
    name: "Drug Database",
    description:
      "Browse medications and get detailed information about prescription and over-the-counter drugs.",
  },
};

export default function DrugsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/50">
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={collectionJsonLd} />

      <div className="container mx-auto px-4 py-12">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Drug Database" },
          ]}
        />

        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Drug & Medication Database
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-6 leading-relaxed">
            Welcome to our comprehensive drug and medication database. Find detailed, evidence-based
            information about prescription and over-the-counter medications including uses, dosage
            instructions, side effects, drug interactions, and important warnings. Our database is
            designed to help you understand your medications better and make informed healthcare
            decisions.
          </p>
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Pill className="w-5 h-5 text-primary" />
              <span>{drugs.length} medications</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="w-5 h-5 text-primary" />
              <span>Detailed information</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldAlert className="w-5 h-5 text-primary" />
              <span>Safety data</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {drugs.map((drug) => (
            <Link
              key={drug.id}
              href={`/drugs/${drug.slug}`}
              className="group bg-white dark:bg-slate-900 rounded-lg border border-border dark:border-slate-800 p-6 hover:shadow-lg hover:border-primary/50 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {drug.name}
                  </h3>
                  <p className="text-sm text-muted-foreground italic">{drug.genericName}</p>
                </div>
                <Pill className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  {drug.drugClass}
                </span>
                {drug.prescriptionRequired ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                    <ShieldAlert className="w-3 h-3" />
                    Rx Only
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    <ShieldCheck className="w-3 h-3" />
                    OTC
                  </span>
                )}
              </div>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {drug.description}
              </p>

              {drug.brandNames.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Brand Names:</p>
                  <p className="text-xs text-muted-foreground">
                    {drug.brandNames.slice(0, 2).join(", ")}
                    {drug.brandNames.length > 2 && " +more"}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 text-primary font-medium text-sm group-hover:gap-3 transition-all">
                Learn more
                <span className="text-lg">→</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg p-6 mb-8">
          <div className="flex gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-1">
                Medical Disclaimer
              </h3>
              <p className="text-sm text-amber-800 dark:text-amber-300">
                This drug database is for informational purposes only and should not replace
                professional medical advice. Always consult with a healthcare provider before
                starting, stopping, or changing any medication. Do not use this information for
                self-diagnosis or self-treatment. In case of overdose or emergency, contact poison
                control or emergency services immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
