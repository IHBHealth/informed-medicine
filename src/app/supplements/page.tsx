import { Metadata } from "next";
import Link from "next/link";
import { Leaf, Apple, ShieldCheck, Sparkles } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import supplementsData from "@/data/supplements.json";
import type { Supplement } from "@/lib/types";
import { SITE_URL } from "@/lib/utils";

const supplements = supplementsData as Supplement[];

export const metadata: Metadata = {
  title: "Supplements Guide - Vitamins, Minerals & Natural Health",
  description:
    "Browse our evidence-based supplements guide covering vitamins, minerals, and natural supplements. Learn about benefits, dosage, food sources, side effects, and interactions.",
  keywords: [
    "supplements",
    "vitamins",
    "minerals",
    "natural health",
    "dietary supplements",
    "nutrition",
  ],
  openGraph: {
    title: "Supplements Guide - Vitamins, Minerals & Natural Health",
    description:
      "Evidence-based supplements guide covering vitamins, minerals, benefits, dosage, and interactions.",
    type: "website",
    url: `${SITE_URL}/supplements`,
    siteName: "InformedMedicine",
  },
  twitter: {
    card: "summary_large_image",
    title: "Supplements Guide - Vitamins, Minerals & Natural Health",
    description:
      "Evidence-based supplements guide with dosage, benefits, and safety information.",
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
      name: "Supplements",
      item: `${SITE_URL}/supplements`,
    },
  ],
};

const collectionJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Supplements Guide",
  description:
    "Evidence-based guide to dietary supplements including vitamins, minerals, and natural health products.",
  url: `${SITE_URL}/supplements`,
  mainEntity: {
    "@type": "MedicalWebPage",
    name: "Supplements Guide",
    description:
      "Browse supplements with detailed information about benefits, dosage, interactions, and safety.",
  },
};

export default function SupplementsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/50">
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={collectionJsonLd} />

      <div className="container mx-auto px-4 py-12">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Supplements" },
          ]}
        />

        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Supplements & Vitamins Guide
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-6 leading-relaxed">
            Dietary supplements can play an important role in supporting your health, but
            understanding what to take, how much, and potential risks is essential. Our
            evidence-based supplements guide provides detailed information about vitamins,
            minerals, and natural health products to help you make informed decisions with
            your healthcare provider.
          </p>
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Leaf className="w-5 h-5 text-primary" />
              <span>{supplements.length} supplements</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Apple className="w-5 h-5 text-primary" />
              <span>Food sources included</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span>Safety information</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {supplements.map((supp) => (
            <Link
              key={supp.id}
              href={`/supplements/${supp.slug}`}
              className="group bg-white dark:bg-slate-900 rounded-lg border border-border dark:border-slate-800 p-6 hover:shadow-lg hover:border-primary/50 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {supp.name}
                  </h3>
                  {supp.alternateNames.length > 0 && (
                    <p className="text-sm text-muted-foreground italic">
                      {supp.alternateNames.slice(0, 2).join(", ")}
                    </p>
                  )}
                </div>
                <Leaf className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                  {supp.category}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {supp.form}
                </span>
                {supp.naturalSource && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                    <Sparkles className="w-3 h-3" />
                    Natural
                  </span>
                )}
              </div>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {supp.description}
              </p>

              <div className="flex items-center gap-2 text-primary font-medium text-sm group-hover:gap-3 transition-all">
                Learn more
                <span className="text-lg">&rarr;</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-lg p-6 mb-8">
          <div className="flex gap-3">
            <Leaf className="w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-200 mb-1">
                Supplement Safety
              </h3>
              <p className="text-sm text-green-800 dark:text-green-300">
                Dietary supplements are not regulated by the FDA in the same way as
                prescription medications. Always consult with your healthcare provider before
                starting any supplement, especially if you are pregnant, nursing, taking
                medications, or have a medical condition. Supplements can interact with
                medications and may not be safe for everyone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
