import { Metadata } from "next";
import Link from "next/link";
import { TestTube, Clock, FlaskConical, Droplets } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import labTestsData from "@/data/lab-tests.json";
import type { LabTest } from "@/lib/types";
import { SITE_URL } from "@/lib/utils";

const labTests = labTestsData as LabTest[];

export const metadata: Metadata = {
  title: "Lab Tests Guide - Understanding Your Blood Work & Diagnostics",
  description:
    "Browse our comprehensive lab test guide. Understand blood work, diagnostic tests, normal ranges, preparation instructions, and what your results mean.",
  keywords: [
    "lab tests",
    "blood tests",
    "diagnostic tests",
    "normal ranges",
    "blood work",
    "medical tests",
  ],
  openGraph: {
    title: "Lab Tests Guide - Understanding Your Blood Work & Diagnostics",
    description:
      "Browse our comprehensive lab test guide. Understand blood work, diagnostic tests, normal ranges, and what your results mean.",
    type: "website",
    url: `${SITE_URL}/lab-tests`,
    siteName: "InformedMedicine",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lab Tests Guide - Understanding Your Blood Work & Diagnostics",
    description:
      "Browse our comprehensive lab test guide with normal ranges, preparation, and result interpretation.",
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
      name: "Lab Tests",
      item: `${SITE_URL}/lab-tests`,
    },
  ],
};

const collectionJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Lab Tests Guide",
  description:
    "Comprehensive guide to laboratory tests with normal ranges, preparation instructions, and result interpretation.",
  url: `${SITE_URL}/lab-tests`,
  mainEntity: {
    "@type": "MedicalWebPage",
    name: "Lab Tests Guide",
    description:
      "Browse lab tests and understand what your blood work and diagnostic results mean.",
  },
};

export default function LabTestsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/50">
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={collectionJsonLd} />

      <div className="container mx-auto px-4 py-12">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Lab Tests" },
          ]}
        />

        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Lab Tests & Diagnostics Guide
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-6 leading-relaxed">
            Understanding your lab results is an important part of managing your health. Our
            comprehensive lab test guide explains what each test measures, how to prepare, what
            normal ranges look like, and what abnormal results may indicate. Use this resource
            to have more informed conversations with your healthcare provider.
          </p>
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TestTube className="w-5 h-5 text-primary" />
              <span>{labTests.length} tests covered</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FlaskConical className="w-5 h-5 text-primary" />
              <span>Normal ranges included</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-5 h-5 text-primary" />
              <span>Prep instructions</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {labTests.map((test) => (
            <Link
              key={test.id}
              href={`/lab-tests/${test.slug}`}
              className="group bg-white dark:bg-slate-900 rounded-lg border border-border dark:border-slate-800 p-6 hover:shadow-lg hover:border-primary/50 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {test.name}
                  </h3>
                  {test.alternateNames.length > 0 && (
                    <p className="text-sm text-muted-foreground italic">
                      {test.alternateNames.slice(0, 2).join(", ")}
                    </p>
                  )}
                </div>
                <TestTube className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                  {test.testCategory}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <Droplets className="w-3 h-3" />
                  {test.sampleType}
                </span>
                {test.fastingRequired && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                    Fasting Required
                  </span>
                )}
              </div>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {test.description}
              </p>

              <div className="flex items-center gap-2 text-primary font-medium text-sm group-hover:gap-3 transition-all">
                View details
                <span className="text-lg">&rarr;</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg p-6 mb-8">
          <div className="flex gap-3">
            <TestTube className="w-5 h-5 text-blue-600 dark:text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">
                Understanding Your Results
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Lab test results should always be interpreted by a qualified healthcare provider
                who knows your complete medical history. Normal ranges can vary between
                laboratories and may be affected by age, sex, medications, and other factors.
                Never make medical decisions based solely on lab values without consulting your
                doctor.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
