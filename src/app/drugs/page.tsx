import { Metadata } from "next";
import Link from "next/link";
import { Pill, ShieldCheck, ShieldAlert, ChevronLeft, ChevronRight } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import DrugSearch from "@/components/DrugSearch";
import { db } from "@/lib/db";
import { fdaDrugs } from "@/lib/schema";
import { sql, ilike, or } from "drizzle-orm";
import { SITE_URL } from "@/lib/utils";
import drugsData from "@/data/drugs.json";
import type { Drug } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Drug Database - Medication Information & Side Effects",
  description:
    "Browse our comprehensive drug database with medication information, side effects, dosage, interactions, and warnings for thousands of FDA-approved medications.",
  openGraph: {
    title: "Drug Database - Medication Information & Side Effects",
    description:
      "Browse our comprehensive drug database with information on thousands of FDA-approved medications.",
    type: "website",
    url: `${SITE_URL}/drugs`,
  },
};

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const PER_PAGE = 30;

interface SearchParams {
  page?: string;
  q?: string;
  letter?: string;
}

export default async function DrugsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1"));
  const query = params.q || "";
  const letter = params.letter || "";

  let drugs: Array<{
    id: string;
    slug: string;
    displayName: string;
    genericName: string;
    brandNames: string[];
    drugClass: string | null;
    description: string | null;
    prescriptionRequired: boolean | null;
    isFeatured: boolean;
  }> = [];
  let totalCount = 0;
  let filteredCount = 0;
  let usingDb = false;

  try {
    // Always get the total database count for the header
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(fdaDrugs);
    totalCount = Number(totalResult[0]?.count || 0);

    const conditions = [];
    if (query) {
      conditions.push(
        or(
          ilike(fdaDrugs.displayName, `%${query}%`),
          ilike(fdaDrugs.genericName, `%${query}%`),
          sql`${fdaDrugs.brandNames}::text ILIKE ${"%" + query + "%"}`
        )
      );
    }
    if (letter) {
      conditions.push(ilike(fdaDrugs.displayName, `${letter}%`));
    }

    const whereClause =
      conditions.length === 2
        ? sql`${conditions[0]} AND ${conditions[1]}`
        : conditions[0];

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(fdaDrugs)
      .where(whereClause);
    filteredCount = Number(countResult[0]?.count || 0);

    drugs = await db
      .select({
        id: fdaDrugs.id,
        slug: fdaDrugs.slug,
        displayName: fdaDrugs.displayName,
        genericName: fdaDrugs.genericName,
        brandNames: fdaDrugs.brandNames,
        drugClass: fdaDrugs.drugClass,
        description: fdaDrugs.description,
        prescriptionRequired: fdaDrugs.prescriptionRequired,
        isFeatured: fdaDrugs.isFeatured,
      })
      .from(fdaDrugs)
      .where(whereClause)
      .orderBy(sql`${fdaDrugs.isFeatured} DESC, ${fdaDrugs.displayName} ASC`)
      .limit(PER_PAGE)
      .offset((page - 1) * PER_PAGE);

    usingDb = true;
  } catch {
    // DB unavailable — fall back to static data
  }

  // Fallback to static JSON
  if (!usingDb || (totalCount === 0 && !query && !letter)) {
    const staticDrugs = (drugsData as Drug[]).map((d) => ({
      id: d.id,
      slug: d.slug,
      displayName: d.name,
      genericName: d.genericName,
      brandNames: d.brandNames,
      drugClass: d.drugClass,
      description: d.description,
      prescriptionRequired: d.prescriptionRequired,
      isFeatured: true,
    }));

    totalCount = staticDrugs.length;

    let filtered = staticDrugs;
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.displayName.toLowerCase().includes(q) ||
          d.genericName.toLowerCase().includes(q)
      );
    }
    if (letter) {
      filtered = filtered.filter((d) =>
        d.displayName.toUpperCase().startsWith(letter)
      );
    }

    filteredCount = filtered.length;
    drugs = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  }

  const totalPages = Math.max(1, Math.ceil(filteredCount / PER_PAGE));

  function pageUrl(p: number) {
    const u = new URLSearchParams();
    if (query) u.set("q", query);
    if (letter) u.set("letter", letter);
    if (p > 1) u.set("page", String(p));
    const qs = u.toString();
    return `/drugs${qs ? `?${qs}` : ""}`;
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Drug Database", item: `${SITE_URL}/drugs` },
    ],
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/50">
      <JsonLd data={breadcrumbJsonLd} />

      <div className="container mx-auto px-4 py-12">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Drug Database" }]} />

        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Drug & Medication Database
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-6">
            Browse {totalCount.toLocaleString()} FDA-approved medications with detailed information
            about uses, dosage, side effects, and interactions.
          </p>
          <DrugSearch />
        </div>

        {/* Letter navigation */}
        <div className="flex flex-wrap gap-1 mb-8">
          <Link
            href="/drugs"
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              !letter
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            All
          </Link>
          {LETTERS.map((l) => (
            <Link
              key={l}
              href={`/drugs?letter=${l}`}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                letter === l
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {l}
            </Link>
          ))}
        </div>

        {drugs.length === 0 ? (
          <div className="text-center py-16">
            <Pill className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No medications found</h2>
            <p className="text-muted-foreground">
              {query
                ? `No results for "${query}". Try a different search term.`
                : "No medications found for this filter."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {drugs.map((drug) => (
                <Link
                  key={drug.id}
                  href={`/drugs/${drug.slug}`}
                  className="group bg-white dark:bg-slate-900 rounded-lg border border-border dark:border-slate-800 p-6 hover:shadow-lg hover:border-primary/50 transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                        {drug.displayName}
                      </h3>
                      <p className="text-sm text-muted-foreground italic">{drug.genericName}</p>
                    </div>
                    {drug.isFeatured && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 px-2 py-0.5 rounded-full font-medium shrink-0">
                        Featured
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {drug.drugClass && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {drug.drugClass.length > 40
                          ? drug.drugClass.substring(0, 37) + "..."
                          : drug.drugClass}
                      </span>
                    )}
                    {drug.prescriptionRequired === true ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                        <ShieldAlert className="w-3 h-3" />
                        Rx
                      </span>
                    ) : drug.prescriptionRequired === false ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                        <ShieldCheck className="w-3 h-3" />
                        OTC
                      </span>
                    ) : null}
                  </div>

                  {drug.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {drug.description}
                    </p>
                  )}

                  {drug.brandNames.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold">Brands:</span>{" "}
                      {drug.brandNames.slice(0, 3).join(", ")}
                      {drug.brandNames.length > 3 && ` +${drug.brandNames.length - 3} more`}
                    </p>
                  )}
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <nav className="flex items-center justify-center gap-2 mb-8">
                {page > 1 && (
                  <Link
                    href={pageUrl(page - 1)}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-border text-sm hover:bg-accent transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Link>
                )}
                <span className="px-4 py-2 text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <Link
                    href={pageUrl(page + 1)}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-border text-sm hover:bg-accent transition-colors"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </nav>
            )}
          </>
        )}

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg p-6">
          <div className="flex gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-1">
                Medical Disclaimer
              </h3>
              <p className="text-sm text-amber-800 dark:text-amber-300">
                This drug database is for informational purposes only. Drug information is sourced
                from the FDA National Drug Code Directory and Structured Product Labeling. Always
                consult with a healthcare provider before starting, stopping, or changing any
                medication.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
