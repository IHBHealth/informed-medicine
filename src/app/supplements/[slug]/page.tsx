import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Leaf,
  Apple,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  HelpCircle,
  Pill,
  HeartPulse,
} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import supplementsData from "@/data/supplements.json";
import type { Supplement } from "@/lib/types";
import { SITE_URL } from "@/lib/utils";

const supplements = supplementsData as Supplement[];

export async function generateStaticParams() {
  return supplements.map((supp) => ({
    slug: supp.slug,
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
  const supp = supplements.find((s) => s.slug === slug);

  if (!supp) {
    return {};
  }

  const title = `${supp.name} - Benefits, Dosage, Side Effects & Food Sources`;
  const description = supp.description.substring(0, 160);

  return {
    title,
    description,
    keywords: [
      supp.name,
      ...supp.alternateNames.slice(0, 3),
      "benefits",
      "dosage",
      "side effects",
      supp.category,
    ],
    openGraph: {
      title,
      description,
      type: "article",
      url: `${SITE_URL}/supplements/${supp.slug}`,
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

function generateFAQs(supp: Supplement): FAQItem[] {
  const faqs: FAQItem[] = [];

  faqs.push({
    question: `What are the benefits of ${supp.name}?`,
    answer: supp.benefits,
  });

  faqs.push({
    question: `What is the recommended dosage for ${supp.name}?`,
    answer: supp.dosage,
  });

  faqs.push({
    question: `What foods contain ${supp.name}?`,
    answer: supp.foodSources,
  });

  faqs.push({
    question: `What are the side effects of ${supp.name}?`,
    answer: supp.sideEffects,
  });

  faqs.push({
    question: `What are the symptoms of ${supp.name} deficiency?`,
    answer: supp.deficiencySymptoms,
  });

  return faqs;
}

function generateSupplementJsonLd(supp: Supplement) {
  return {
    "@context": "https://schema.org",
    "@type": "DietarySupplement",
    name: supp.name,
    alternateName: supp.alternateNames,
    description: supp.description,
    activeIngredient: supp.name,
    safetyConsideration: supp.warnings,
    recommendedIntake: supp.dosage,
  };
}

function generateFAQPageJsonLd(supp: Supplement) {
  const faqs = generateFAQs(supp);
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

function generateBreadcrumbJsonLd(supp: Supplement) {
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
        name: "Supplements",
        item: `${SITE_URL}/supplements`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: supp.name,
        item: `${SITE_URL}/supplements/${supp.slug}`,
      },
    ],
  };
}

export default async function SupplementDetailPage({ params }: Props) {
  const slug = (await params).slug;
  const supp = supplements.find((s) => s.slug === slug);

  if (!supp) {
    notFound();
  }

  const faqs = generateFAQs(supp);
  const relatedSupplements = supplements.filter((s) => s.id !== supp.id).slice(0, 3);

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/50">
      <JsonLd data={generateBreadcrumbJsonLd(supp)} />
      <JsonLd data={generateSupplementJsonLd(supp)} />
      <JsonLd data={generateFAQPageJsonLd(supp)} />

      <div className="container mx-auto px-4 py-12">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Supplements", href: "/supplements" },
            { label: supp.name },
          ]}
        />

        <article className="max-w-4xl">
          <div className="mb-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                  {supp.name}
                </h1>
                {supp.alternateNames.length > 0 && (
                  <h2 className="text-xl text-muted-foreground italic">
                    Also known as: {supp.alternateNames.join(", ")}
                  </h2>
                )}
              </div>
              <Leaf className="w-12 h-12 text-primary flex-shrink-0" />
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                {supp.category}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {supp.form}
              </span>
              {supp.naturalSource && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  <Sparkles className="w-4 h-4" />
                  Natural Source
                </span>
              )}
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none mb-8">
            <p className="lead text-lg text-muted-foreground leading-relaxed">
              {supp.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-border dark:border-slate-800 p-6">
              <h3 className="flex items-center gap-2 text-lg font-bold mb-3 text-foreground">
                <HeartPulse className="w-5 h-5 text-primary" />
                Benefits
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{supp.benefits}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg border border-border dark:border-slate-800 p-6">
              <h3 className="flex items-center gap-2 text-lg font-bold mb-3 text-foreground">
                <Pill className="w-5 h-5 text-primary" />
                Recommended Dosage
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{supp.dosage}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg border border-border dark:border-slate-800 p-6">
              <h3 className="flex items-center gap-2 text-lg font-bold mb-3 text-foreground">
                <Apple className="w-5 h-5 text-primary" />
                Food Sources
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{supp.foodSources}</p>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800/50 p-6">
              <h3 className="flex items-center gap-2 text-lg font-bold mb-3 text-amber-900 dark:text-amber-200">
                <AlertCircle className="w-5 h-5" />
                Side Effects
              </h3>
              <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                {supp.sideEffects}
              </p>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800/50 p-6">
              <h3 className="flex items-center gap-2 text-lg font-bold mb-3 text-amber-900 dark:text-amber-200">
                <AlertCircle className="w-5 h-5" />
                Interactions
              </h3>
              <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                {supp.interactions}
              </p>
            </div>

            <div className="bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800/50 p-6">
              <h3 className="flex items-center gap-2 text-lg font-bold mb-3 text-red-900 dark:text-red-200">
                <AlertTriangle className="w-5 h-5" />
                Warnings
              </h3>
              <p className="text-sm text-red-800 dark:text-red-300 leading-relaxed">
                {supp.warnings}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg border border-border dark:border-slate-800 p-6 md:col-span-2">
              <h3 className="flex items-center gap-2 text-lg font-bold mb-3 text-foreground">
                <AlertTriangle className="w-5 h-5 text-primary" />
                Deficiency Symptoms
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {supp.deficiencySymptoms}
              </p>
            </div>
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
                      &#9660;
                    </span>
                  </summary>
                  <p className="mt-4 pl-8 text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {relatedSupplements.length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-6 text-foreground">Related Supplements</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedSupplements.map((related) => (
                  <Link
                    key={related.id}
                    href={`/supplements/${related.slug}`}
                    className="group bg-white dark:bg-slate-900 rounded-lg border border-border dark:border-slate-800 p-4 hover:shadow-lg hover:border-primary/50 transition-all"
                  >
                    <h4 className="font-bold text-foreground group-hover:text-primary transition-colors mb-1">
                      {related.name}
                    </h4>
                    <p className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded px-2 py-1 inline-block mb-3">
                      {related.category}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {related.description}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-lg p-6">
            <div className="flex gap-3">
              <Leaf className="w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900 dark:text-green-200 mb-1">
                  Supplement Disclaimer
                </h3>
                <p className="text-sm text-green-800 dark:text-green-300">
                  This supplement information is for educational purposes only and should not
                  replace professional medical advice. Dietary supplements are not intended to
                  diagnose, treat, cure, or prevent any disease. Always consult with a
                  healthcare provider before starting any supplement, especially if you are
                  pregnant, nursing, taking medications, or have a medical condition.
                </p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
