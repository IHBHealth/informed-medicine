import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  TestTube,
  Clock,
  Droplets,
  AlertTriangle,
  ClipboardList,
  Stethoscope,
  HelpCircle,
  DollarSign,
} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import labTestsData from "@/data/lab-tests.json";
import type { LabTest } from "@/lib/types";
import { SITE_URL } from "@/lib/utils";

const labTests = labTestsData as LabTest[];

export async function generateStaticParams() {
  return labTests.map((test) => ({
    slug: test.slug,
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
  const test = labTests.find((t) => t.slug === slug);

  if (!test) {
    return {};
  }

  const title = `${test.name} - Purpose, Normal Ranges, Results`;
  const description = test.description.substring(0, 160);

  return {
    title,
    description,
    keywords: [
      test.name,
      ...test.alternateNames.slice(0, 3),
      "normal range",
      "blood test",
      test.testCategory,
    ],
    openGraph: {
      title,
      description,
      type: "article",
      url: `${SITE_URL}/lab-tests/${test.slug}`,
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

function generateFAQs(test: LabTest): FAQItem[] {
  const faqs: FAQItem[] = [];

  faqs.push({
    question: `What is a ${test.name} test?`,
    answer: test.description,
  });

  faqs.push({
    question: `What is the normal range for a ${test.name}?`,
    answer: test.normalRange,
  });

  faqs.push({
    question: `How do I prepare for a ${test.name}?`,
    answer: test.preparation,
  });

  faqs.push({
    question: `What do abnormal ${test.name} results mean?`,
    answer: test.abnormalResults,
  });

  return faqs;
}

function generateMedicalTestJsonLd(test: LabTest) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalTest",
    name: test.name,
    alternateName: test.alternateNames,
    description: test.description,
    usedToDiagnose: test.purpose,
    normalRange: test.normalRange,
    usesDevice: {
      "@type": "MedicalDevice",
      name: `${test.sampleType} collection equipment`,
    },
  };
}

function generateFAQPageJsonLd(test: LabTest) {
  const faqs = generateFAQs(test);
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

function generateBreadcrumbJsonLd(test: LabTest) {
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
        name: "Lab Tests",
        item: `${SITE_URL}/lab-tests`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: test.name,
        item: `${SITE_URL}/lab-tests/${test.slug}`,
      },
    ],
  };
}

export default async function LabTestDetailPage({ params }: Props) {
  const slug = (await params).slug;
  const test = labTests.find((t) => t.slug === slug);

  if (!test) {
    notFound();
  }

  const faqs = generateFAQs(test);
  const relatedTests = labTests.filter((t) => t.id !== test.id).slice(0, 3);

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/50">
      <JsonLd data={generateBreadcrumbJsonLd(test)} />
      <JsonLd data={generateMedicalTestJsonLd(test)} />
      <JsonLd data={generateFAQPageJsonLd(test)} />

      <div className="container mx-auto px-4 py-12">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Lab Tests", href: "/lab-tests" },
            { label: test.name },
          ]}
        />

        <article className="max-w-4xl">
          <div className="mb-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                  {test.name}
                </h1>
                {test.alternateNames.length > 0 && (
                  <h2 className="text-xl text-muted-foreground italic">
                    Also known as: {test.alternateNames.join(", ")}
                  </h2>
                )}
              </div>
              <TestTube className="w-12 h-12 text-primary flex-shrink-0" />
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                {test.testCategory}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <Droplets className="w-4 h-4" />
                {test.sampleType}
              </span>
              {test.fastingRequired && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                  <Clock className="w-4 h-4" />
                  Fasting Required
                </span>
              )}
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none mb-8">
            <p className="lead text-lg text-muted-foreground leading-relaxed">
              {test.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-border dark:border-slate-800 p-6">
              <h3 className="flex items-center gap-2 text-lg font-bold mb-3 text-foreground">
                <Stethoscope className="w-5 h-5 text-primary" />
                Purpose
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{test.purpose}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg border border-border dark:border-slate-800 p-6">
              <h3 className="flex items-center gap-2 text-lg font-bold mb-3 text-foreground">
                <ClipboardList className="w-5 h-5 text-primary" />
                Preparation
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{test.preparation}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg border border-border dark:border-slate-800 p-6">
              <h3 className="flex items-center gap-2 text-lg font-bold mb-3 text-foreground">
                <TestTube className="w-5 h-5 text-primary" />
                Procedure
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{test.procedure}</p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800/50 p-6">
              <h3 className="flex items-center gap-2 text-lg font-bold mb-3 text-green-900 dark:text-green-200">
                <ClipboardList className="w-5 h-5" />
                Normal Range
              </h3>
              <p className="text-sm text-green-800 dark:text-green-300 leading-relaxed">
                {test.normalRange}
              </p>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800/50 p-6">
              <h3 className="flex items-center gap-2 text-lg font-bold mb-3 text-amber-900 dark:text-amber-200">
                <AlertTriangle className="w-5 h-5" />
                Abnormal Results
              </h3>
              <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                {test.abnormalResults}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg border border-border dark:border-slate-800 p-6">
              <h3 className="flex items-center gap-2 text-lg font-bold mb-3 text-foreground">
                <AlertTriangle className="w-5 h-5 text-primary" />
                Risks
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{test.risks}</p>
            </div>

            {test.turnaroundTime && (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-border dark:border-slate-800 p-6">
                <h3 className="flex items-center gap-2 text-lg font-bold mb-3 text-foreground">
                  <Clock className="w-5 h-5 text-primary" />
                  Turnaround Time
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {test.turnaroundTime}
                </p>
              </div>
            )}

            {test.cost && (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-border dark:border-slate-800 p-6">
                <h3 className="flex items-center gap-2 text-lg font-bold mb-3 text-foreground">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Estimated Cost
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{test.cost}</p>
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

          {relatedTests.length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-6 text-foreground">Related Lab Tests</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedTests.map((related) => (
                  <Link
                    key={related.id}
                    href={`/lab-tests/${related.slug}`}
                    className="group bg-white dark:bg-slate-900 rounded-lg border border-border dark:border-slate-800 p-4 hover:shadow-lg hover:border-primary/50 transition-all"
                  >
                    <h4 className="font-bold text-foreground group-hover:text-primary transition-colors mb-1">
                      {related.name}
                    </h4>
                    <p className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded px-2 py-1 inline-block mb-3">
                      {related.testCategory}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {related.description}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg p-6">
            <div className="flex gap-3">
              <TestTube className="w-5 h-5 text-blue-600 dark:text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">
                  Medical Disclaimer
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  This lab test information is for educational purposes only and should not
                  replace professional medical advice. Lab results should always be interpreted
                  by a qualified healthcare provider who knows your complete medical history.
                  Normal ranges may vary between laboratories.
                </p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
