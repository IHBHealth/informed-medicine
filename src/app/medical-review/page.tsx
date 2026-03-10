import { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, SITE_NAME } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Medical Review Process - How Our Content Is Clinician-Reviewed",
  description:
    "Learn how InformedMedicine ensures clinical accuracy. Every article, drug guide, and Q&A is reviewed by licensed physicians, pharmacists, and nurse practitioners before publication.",
  keywords: [
    "medical review process",
    "clinical review",
    "health content accuracy",
    "physician reviewed",
    "pharmacist reviewed",
    "medical editorial policy",
  ],
  openGraph: {
    title: "Medical Review Process - How Our Content Is Clinician-Reviewed",
    description:
      "Every piece of health content on InformedMedicine is reviewed by licensed clinicians for medical accuracy and safety.",
    type: "website",
    url: `${SITE_URL}/medical-review`,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: "Medical Review Process - InformedMedicine",
    description:
      "Learn how licensed clinicians review every piece of content on InformedMedicine.",
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
      name: "Medical Review Process",
      item: `${SITE_URL}/medical-review`,
    },
  ],
};

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "MedicalWebPage",
  name: "Medical Review Process",
  description:
    "How InformedMedicine ensures clinical accuracy through licensed clinician review of all health content.",
  url: `${SITE_URL}/medical-review`,
  lastReviewed: "2026-03-10",
  reviewedBy: {
    "@type": "Organization",
    name: SITE_NAME,
  },
};

export default function MedicalReviewPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/50">
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={webPageJsonLd} />

      <div className="container mx-auto px-4 py-12">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Medical Review Process" },
          ]}
        />

        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Medical Review Process
          </h1>
          <p className="text-sm text-muted-foreground mb-10">
            Effective date: March 10, 2026
          </p>

          {/* Key message callout */}
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-lg p-6 mb-10">
            <h2 className="text-lg font-semibold text-emerald-900 dark:text-emerald-200 mb-2">
              Every Article Is Clinician-Reviewed
            </h2>
            <p className="text-emerald-800 dark:text-emerald-300 leading-relaxed">
              No health content is published on {SITE_NAME} without review and
              approval by a licensed medical professional. Our review team
              includes physicians, pharmacists, and nurse practitioners who
              verify medical accuracy, safety, and alignment with current
              clinical guidelines.
            </p>
          </div>

          {/* 1. Our Commitment */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Our Commitment to Clinical Accuracy
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Health information has real consequences. Inaccurate drug dosages,
              missing interaction warnings, or misleading guidance can put
              people at risk. That is why {SITE_NAME} requires that licensed
              medical professionals — physicians, pharmacists, nurses, and
              clinical specialists — review every piece of health content we
              publish.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We do not treat clinical review as optional or aspirational. It is
              a mandatory step in our publishing process. Whether the content
              covers a common medication, a lab test result, or a general
              wellness topic, a qualified clinician has reviewed it before it
              reaches you.
            </p>
          </section>

          {/* 2. The Review Process */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Our Review Process
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Every article, drug guide, and health resource goes through a
              structured six-step process before publication.
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  1. Initial Research
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our content team gathers information from authoritative
                  sources including the U.S. Food and Drug Administration (FDA),
                  the National Institutes of Health (NIH), peer-reviewed medical
                  journals, and established clinical references. We prioritize
                  primary sources and official labeling data over secondary
                  summaries.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  2. Content Drafting
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Medical writers and AI-assisted tools create initial drafts
                  based on the gathered research. These drafts are structured for
                  clarity and written in plain language so that anyone can
                  understand the information, regardless of their medical
                  background.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  3. Clinical Review
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  A licensed clinician — a physician (MD or DO), pharmacist
                  (PharmD), or nurse practitioner (NP) — reviews every article
                  for medical accuracy, appropriate clinical context, and
                  patient safety. The reviewer evaluates whether the content
                  reflects current medical understanding, uses correct
                  terminology, and provides appropriate caveats and warnings.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  4. Fact-Checking
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  All medical claims, statistics, and recommendations are
                  cross-referenced against authoritative sources such as
                  UpToDate, FDA-approved drug labels, clinical practice
                  guidelines from major medical societies, and peer-reviewed
                  literature. Any discrepancies are resolved before publication.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  5. Publication
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Content is published only after the reviewing clinician has
                  signed off. No article bypasses this step. If a reviewer
                  identifies concerns, the content is revised and re-reviewed
                  until it meets our standards for accuracy and safety.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  6. Ongoing Review
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Published content is not static. We re-review articles
                  periodically and update them when new clinical guidelines are
                  released, FDA labeling changes occur, or new safety
                  information becomes available. Our drug content is
                  automatically synced with the latest FDA data on a weekly
                  basis and reviewed for any significant changes.
                </p>
              </div>
            </div>
          </section>

          {/* 3. Our Review Team */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Our Review Team
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Our clinical review team is composed of licensed healthcare
              professionals with active credentials and clinical experience.
              The team includes:
            </p>
            <ul className="list-disc pl-6 space-y-3 text-muted-foreground leading-relaxed">
              <li>
                <span className="font-medium text-foreground">Physicians</span>{" "}
                across specialties including internal medicine, family medicine,
                cardiology, endocrinology, and other fields relevant to the
                content being reviewed.
              </li>
              <li>
                <span className="font-medium text-foreground">Pharmacists</span>{" "}
                who specialize in medication safety, drug interactions, dosage
                verification, and pharmaceutical guidance. They are the primary
                reviewers for all drug-related content.
              </li>
              <li>
                <span className="font-medium text-foreground">
                  Nurse Practitioners and Registered Nurses
                </span>{" "}
                who bring patient-facing clinical experience and ensure that
                health guidance is practical, actionable, and appropriate for a
                general audience.
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Content is routed to the reviewer whose clinical expertise best
              matches the subject matter. Drug content is reviewed by
              pharmacists. Condition-specific articles are reviewed by
              physicians in the relevant specialty. Patient education materials
              are evaluated by clinicians with direct patient care experience.
            </p>
          </section>

          {/* 4. What Clinicians Check */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              What Our Clinicians Check
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              During the clinical review, our reviewers evaluate content against
              a comprehensive set of criteria:
            </p>
            <ul className="list-disc pl-6 space-y-3 text-muted-foreground leading-relaxed">
              <li>
                <span className="font-medium text-foreground">
                  Medical accuracy
                </span>{" "}
                — All facts, statistics, and medical claims are verified against
                current evidence and clinical references.
              </li>
              <li>
                <span className="font-medium text-foreground">
                  Dosage information
                </span>{" "}
                — Any dosage ranges, administration instructions, or frequency
                recommendations are checked for correctness and appropriate
                context.
              </li>
              <li>
                <span className="font-medium text-foreground">
                  Drug interaction warnings
                </span>{" "}
                — Known interactions between medications, supplements, and foods
                are identified and clearly communicated.
              </li>
              <li>
                <span className="font-medium text-foreground">
                  Contraindications and safety warnings
                </span>{" "}
                — Conditions, populations, or circumstances where a medication or
                treatment should not be used are explicitly stated.
              </li>
              <li>
                <span className="font-medium text-foreground">
                  Alignment with clinical guidelines
                </span>{" "}
                — Content reflects the most current clinical practice guidelines
                from recognized medical organizations and regulatory agencies.
              </li>
              <li>
                <span className="font-medium text-foreground">
                  Responsible framing
                </span>{" "}
                — Content does not encourage self-diagnosis or self-treatment.
                Readers are consistently directed to consult their healthcare
                provider for personal medical decisions.
              </li>
            </ul>
          </section>

          {/* 5. Drug Content Review */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Drug Content Review
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Drug information carries particular responsibility. Incorrect
              dosage data or missing interaction warnings can have serious
              consequences. Our drug content undergoes additional scrutiny:
            </p>
            <ul className="list-disc pl-6 space-y-3 text-muted-foreground leading-relaxed">
              <li>
                All drug data is sourced from FDA-approved labeling through the
                openFDA database and verified against official prescribing
                information.
              </li>
              <li>
                A licensed pharmacist reviews every drug profile, including
                dosage information, side effects, interaction warnings,
                contraindications, and storage instructions.
              </li>
              <li>
                Drug interactions are cross-referenced with established
                pharmacological databases to ensure completeness.
              </li>
              <li>
                OTC and prescription status is verified against current FDA
                classification for each product.
              </li>
              <li>
                Drug content is automatically re-synced with FDA data weekly and
                flagged for clinical re-review when labeling changes are
                detected.
              </li>
            </ul>
          </section>

          {/* 6. Q&A Review */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Q&A Content Review
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Health questions submitted through our Q&A section are answered or
              reviewed by licensed medical professionals before responses are
              published. Clinicians ensure that answers are medically accurate,
              appropriately scoped, and include guidance to seek professional
              care when warranted. We do not publish answers to health questions
              without clinical oversight.
            </p>
          </section>

          {/* 7. Report an Issue */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              How to Report an Issue
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We take accuracy seriously and welcome feedback from readers,
              patients, and healthcare professionals. If you believe any content
              on {SITE_NAME} contains a factual error, outdated information, or
              a potential safety concern, please contact our medical review team.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg p-5">
              <p className="text-blue-900 dark:text-blue-200 font-medium mb-1">
                Report a potential inaccuracy
              </p>
              <p className="text-blue-800 dark:text-blue-300">
                Email:{" "}
                <a
                  href="mailto:medical-review@informedmedicine.com"
                  className="underline hover:no-underline font-medium"
                >
                  medical-review@informedmedicine.com
                </a>
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-2">
                Please include the page URL and a description of the concern.
                Our team will review the report and update the content if
                necessary.
              </p>
            </div>
          </section>

          {/* 8. Medical Disclaimer */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Medical Disclaimer
            </h2>
            <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
              <p className="text-muted-foreground leading-relaxed mb-4">
                The content on {SITE_NAME} is intended for educational and
                informational purposes only. It is not a substitute for
                professional medical advice, diagnosis, or treatment.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Always seek the advice of your physician, pharmacist, or other
                qualified healthcare provider with any questions you may have
                regarding a medical condition, medication, or treatment. Never
                disregard professional medical advice or delay in seeking it
                because of something you have read on this website.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                If you think you may have a medical emergency, call your doctor,
                go to the nearest emergency department, or call 911 (or your
                local emergency number) immediately.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
