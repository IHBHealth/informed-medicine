import { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, SITE_NAME } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Editorial Policy - How We Create Trustworthy Health Content",
  description:
    "Learn about InformedMedicine's editorial standards, content creation process, and commitment to accurate, evidence-based health information reviewed by medical professionals.",
  keywords: [
    "editorial policy",
    "content standards",
    "medical accuracy",
    "health information standards",
    "evidence-based content",
  ],
  openGraph: {
    title: "Editorial Policy - How We Create Trustworthy Health Content",
    description:
      "Our commitment to accurate, evidence-based health information. Learn about our editorial standards and content review process.",
    type: "website",
    url: `${SITE_URL}/editorial-policy`,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: "Editorial Policy - InformedMedicine",
    description:
      "Our commitment to accurate, evidence-based health information.",
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
      name: "Editorial Policy",
      item: `${SITE_URL}/editorial-policy`,
    },
  ],
};

export default function EditorialPolicyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/50">
      <JsonLd data={breadcrumbJsonLd} />

      <div className="container mx-auto px-4 py-12">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Editorial Policy" },
          ]}
        />

        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Editorial Policy
          </h1>
          <p className="text-sm text-muted-foreground mb-12">
            Effective Date: March 10, 2026
          </p>

          {/* Our Mission */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Our Mission
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {SITE_NAME} exists to make health information accessible,
              evidence-based, and easy to understand. We believe that everyone
              deserves clear, reliable answers to their health questions —
              without needing a medical degree to understand them.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our goal is to bridge the gap between complex medical literature
              and the everyday person seeking to make informed decisions about
              their health. We translate clinical data, FDA guidelines, and
              peer-reviewed research into plain language that empowers you to
              have better conversations with your healthcare provider.
            </p>
          </section>

          {/* Content Standards */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Content Standards
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Every piece of content published on {SITE_NAME} is held to four
              core standards:
            </p>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex gap-3">
                <span className="font-semibold text-foreground min-w-[100px]">
                  Accuracy
                </span>
                <span className="leading-relaxed">
                  All health claims are supported by credible sources. We do not
                  publish speculation, unverified claims, or anecdotal evidence
                  as fact.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-foreground min-w-[100px]">
                  Clarity
                </span>
                <span className="leading-relaxed">
                  We write in plain, accessible language. Medical jargon is
                  explained when necessary, and content is structured for easy
                  scanning and comprehension.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-foreground min-w-[100px]">
                  Timeliness
                </span>
                <span className="leading-relaxed">
                  Content reflects current medical knowledge and guidelines. We
                  monitor for updates to drug information, clinical guidelines,
                  and health recommendations, and revise our content accordingly.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-foreground min-w-[100px]">
                  Objectivity
                </span>
                <span className="leading-relaxed">
                  We present balanced, unbiased information. We do not promote
                  specific products, brands, or treatments over others unless
                  the evidence clearly supports a recommendation.
                </span>
              </li>
            </ul>
          </section>

          {/* Sources and Evidence */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Sources and Evidence
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Our content is grounded in evidence from trusted, authoritative
              sources. We rely on:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
              <li>
                Peer-reviewed medical journals and systematic reviews
              </li>
              <li>
                U.S. Food and Drug Administration (FDA) drug labels and safety
                communications
              </li>
              <li>
                National Institutes of Health (NIH) and its component agencies
                (NLM, NCCIH, NCI)
              </li>
              <li>
                Centers for Disease Control and Prevention (CDC) guidelines and
                data
              </li>
              <li>
                World Health Organization (WHO) publications and recommendations
              </li>
              <li>
                Professional medical society clinical practice guidelines
              </li>
              <li>
                Established pharmacology and clinical reference databases
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Our drug information is sourced directly from the openFDA database,
              which provides access to official FDA-approved drug labeling. This
              ensures that the medication data we present — including uses, side
              effects, warnings, and dosage information — is drawn from the same
              regulatory source that healthcare professionals rely on.
            </p>
          </section>

          {/* Content Creation Process */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Content Creation Process
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Each piece of content on {SITE_NAME} follows a structured process
              to ensure quality and accuracy:
            </p>
            <ol className="space-y-4 text-muted-foreground">
              <li className="flex gap-3">
                <span className="font-semibold text-foreground min-w-[24px]">
                  1.
                </span>
                <div>
                  <span className="font-semibold text-foreground">
                    Research
                  </span>
                  <p className="leading-relaxed mt-1">
                    Topics are identified based on public health relevance,
                    search demand, and gaps in accessible consumer health
                    information. Source materials are gathered from authoritative
                    references.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-foreground min-w-[24px]">
                  2.
                </span>
                <div>
                  <span className="font-semibold text-foreground">Writing</span>
                  <p className="leading-relaxed mt-1">
                    Content is drafted with a focus on accuracy, readability, and
                    practical value for everyday readers. Complex medical
                    concepts are broken down into clear, actionable language.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-foreground min-w-[24px]">
                  3.
                </span>
                <div>
                  <span className="font-semibold text-foreground">
                    Medical Review
                  </span>
                  <p className="leading-relaxed mt-1">
                    All content is reviewed by qualified medical professionals to
                    verify clinical accuracy, appropriate context, and
                    completeness.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-foreground min-w-[24px]">
                  4.
                </span>
                <div>
                  <span className="font-semibold text-foreground">
                    Publication
                  </span>
                  <p className="leading-relaxed mt-1">
                    Approved content is published with appropriate metadata,
                    structured data, and clear attribution. Publication dates and
                    review dates are recorded.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-foreground min-w-[24px]">
                  5.
                </span>
                <div>
                  <span className="font-semibold text-foreground">
                    Periodic Updates
                  </span>
                  <p className="leading-relaxed mt-1">
                    Published content is revisited on a regular schedule to
                    ensure it remains current with the latest medical evidence,
                    FDA updates, and clinical guidelines.
                  </p>
                </div>
              </li>
            </ol>
          </section>

          {/* AI-Assisted Content */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              AI-Assisted Content
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We believe in full transparency about how our content is created.
              {" "}{SITE_NAME} uses artificial intelligence tools to assist in
              drafting and organizing health content. AI helps us process large
              volumes of medical data, structure information clearly, and
              maintain consistency across our growing library of resources.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              However, AI is a tool in our process — not the final authority.
              Every piece of AI-assisted content is reviewed, verified, and
              approved by medical professionals before publication. Our editorial
              team ensures that all information is clinically accurate,
              appropriately contextualized, and free of errors or
              misrepresentations that AI models may occasionally produce.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We do not publish AI-generated content without human oversight.
              Our commitment to accuracy and reliability remains the same
              regardless of what tools are used in the drafting process.
            </p>
          </section>

          {/* Corrections Policy */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Corrections Policy
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We take accuracy seriously. If an error is identified in any of our
              content — whether by our team, a reader, or a medical professional
              — we act promptly to correct it.
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
              <li>
                Minor errors (typos, formatting) are corrected immediately
                without a formal notice.
              </li>
              <li>
                Substantive errors (incorrect medical information, outdated
                data) are corrected with a clear note indicating what was changed
                and when the correction was made.
              </li>
              <li>
                If a correction materially changes the guidance provided in an
                article, readers are notified through an editorial note at the
                top of the page.
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              If you believe you have found an inaccuracy in our content, please
              contact us at{" "}
              <a
                href="mailto:editorial@informedmedicine.com"
                className="text-primary hover:underline"
              >
                editorial@informedmedicine.com
              </a>
              . We review all reports and respond within five business days.
            </p>
          </section>

          {/* Editorial Independence */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Editorial Independence
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Our editorial content is independent of any commercial influence.
              Advertisers, sponsors, and partners have no say in what we publish,
              how we present information, or what conclusions we draw from the
              evidence.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              If {SITE_NAME} ever features sponsored content or partnerships,
              they will be clearly labeled and separated from our editorial
              content. Commercial relationships will never compromise the
              integrity or objectivity of our health information.
            </p>
          </section>

          {/* Content Categories */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Content Categories
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {SITE_NAME} provides health information across several categories,
              each with its own standards and sources:
            </p>
            <ul className="space-y-4 text-muted-foreground">
              <li>
                <h3 className="font-semibold text-foreground">Drug Guides</h3>
                <p className="leading-relaxed mt-1">
                  Comprehensive medication profiles sourced from FDA-approved
                  labeling via the openFDA database. Includes uses, dosage, side
                  effects, warnings, drug interactions, pregnancy information,
                  and storage instructions.
                </p>
              </li>
              <li>
                <h3 className="font-semibold text-foreground">
                  Health Articles
                </h3>
                <p className="leading-relaxed mt-1">
                  In-depth articles on health conditions, treatments, wellness
                  strategies, and medical topics. Written for a general audience
                  and grounded in peer-reviewed evidence.
                </p>
              </li>
              <li>
                <h3 className="font-semibold text-foreground">
                  Lab Test Guides
                </h3>
                <p className="leading-relaxed mt-1">
                  Clear explanations of common laboratory tests — what they
                  measure, why they are ordered, how to prepare, and what
                  results mean. Designed to help patients understand their lab
                  work.
                </p>
              </li>
              <li>
                <h3 className="font-semibold text-foreground">
                  Supplement Reviews
                </h3>
                <p className="leading-relaxed mt-1">
                  Evidence-based information on dietary supplements, vitamins,
                  and herbal products. We present what the research shows —
                  including where evidence is limited or inconclusive.
                </p>
              </li>
              <li>
                <h3 className="font-semibold text-foreground">
                  Questions &amp; Answers
                </h3>
                <p className="leading-relaxed mt-1">
                  Responses to common health questions from our readers.
                  Answers are researched and reviewed to the same standard as
                  our other content categories.
                </p>
              </li>
            </ul>
          </section>

          {/* Updates and Reviews */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Updates and Reviews
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Health information changes as new research emerges, guidelines are
              updated, and drug labels are revised. We are committed to keeping
              our content current.
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
              <li>
                All content displays a &ldquo;last reviewed&rdquo; date so you
                know how recently it was verified.
              </li>
              <li>
                Drug information is automatically synchronized with the FDA
                database on a weekly basis to capture new safety updates and
                label changes.
              </li>
              <li>
                Articles and guides are reviewed on a periodic schedule, with
                priority given to content covering rapidly evolving topics.
              </li>
              <li>
                Outdated content that can no longer be updated to reflect current
                evidence is retired and clearly marked.
              </li>
            </ul>
          </section>

          {/* Contact */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Contact Our Editorial Team
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We welcome feedback, corrections, and questions about our editorial
              process. You can reach our editorial team at:
            </p>
            <p className="text-muted-foreground leading-relaxed">
              <a
                href="mailto:editorial@informedmedicine.com"
                className="text-primary hover:underline font-medium"
              >
                editorial@informedmedicine.com
              </a>
            </p>
          </section>

          {/* Disclaimer */}
          <section className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg p-6 mt-12">
            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
              Medical Disclaimer
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
              The content on {SITE_NAME} is for informational purposes only and
              is not a substitute for professional medical advice, diagnosis, or
              treatment. Always seek the advice of your physician or other
              qualified health provider with any questions you may have
              regarding a medical condition. Never disregard professional
              medical advice or delay seeking it because of something you have
              read on this website.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
