import { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, SITE_NAME } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Terms of Service - InformedMedicine",
  description:
    "Read the Terms of Service for InformedMedicine. Understand your rights and responsibilities when using our health information website.",
  openGraph: {
    title: "Terms of Service - InformedMedicine",
    description:
      "Read the Terms of Service for InformedMedicine. Understand your rights and responsibilities when using our health information website.",
    type: "website",
    url: `${SITE_URL}/terms`,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary",
    title: "Terms of Service - InformedMedicine",
    description:
      "Terms of Service for InformedMedicine health information website.",
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
      name: "Terms of Service",
      item: `${SITE_URL}/terms`,
    },
  ],
};

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-background">
      <JsonLd data={breadcrumbJsonLd} />

      <div className="container mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Terms of Service" },
          ]}
        />

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-2">
          Terms of Service
        </h1>
        <p className="text-sm text-muted-foreground mb-10">
          Effective Date: March 10, 2026
        </p>

        <div className="space-y-10">
          {/* 1. Acceptance of Terms */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              1. Acceptance of Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using the InformedMedicine website located at{" "}
              <span className="font-medium text-foreground">
                informedmedicine.com
              </span>{" "}
              (the &ldquo;Site&rdquo;), you agree to be bound by these Terms of
              Service (the &ldquo;Terms&rdquo;). If you do not agree to all of
              these Terms, you must not access or use the Site. These Terms
              constitute a legally binding agreement between you and
              InformedMedicine. We reserve the right to update or modify these
              Terms at any time, and your continued use of the Site following any
              changes constitutes acceptance of those changes.
            </p>
          </section>

          {/* 2. Description of Service */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              2. Description of Service
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              InformedMedicine is a health information website that provides
              educational content including, but not limited to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed ml-2">
              <li>Drug information sourced from the FDA and other public databases</li>
              <li>Health articles and guides written or generated for educational purposes</li>
              <li>Lab test explanations and reference guides</li>
              <li>Supplement information and reviews</li>
              <li>Community Q&amp;A and discussion forums</li>
              <li>Health news and updates</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              The Site is intended solely for informational and educational
              purposes. InformedMedicine does not provide medical diagnoses,
              treatment plans, or prescriptions. The Site is not a healthcare
              provider and does not establish a doctor-patient relationship with
              any user.
            </p>
          </section>

          {/* 3. Medical Disclaimer */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              3. Medical Disclaimer
            </h2>
            <div className="bg-muted/50 border border-border rounded-lg p-5 mb-4">
              <p className="text-foreground font-medium leading-relaxed mb-3">
                The content on InformedMedicine is provided for general
                informational purposes only and is NOT intended as a substitute
                for professional medical advice, diagnosis, or treatment.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Always seek the advice of your physician or other qualified
                health provider with any questions you may have regarding a
                medical condition. Never disregard professional medical advice or
                delay seeking it because of something you have read on this Site.
              </p>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-3">
              If you think you may have a medical emergency, call your doctor,
              go to the emergency department, or call emergency services
              immediately. InformedMedicine does not recommend or endorse any
              specific tests, physicians, products, procedures, opinions, or
              other information that may be mentioned on the Site.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Reliance on any information provided by InformedMedicine, its
              employees, contracted writers, or other visitors to the Site is
              solely at your own risk. Drug information displayed on the Site is
              sourced from publicly available FDA data and may not reflect the
              most current research or labeling. Always verify drug information
              with your pharmacist or prescribing physician.
            </p>
          </section>

          {/* 4. User Accounts */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              4. User Accounts
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Certain features of the Site may require you to create an account.
              When registering, you agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed ml-2">
              <li>
                Provide accurate, current, and complete information during
                registration
              </li>
              <li>
                Maintain and promptly update your account information to keep it
                accurate and complete
              </li>
              <li>
                Maintain the security and confidentiality of your login
                credentials and not share them with any third party
              </li>
              <li>
                Accept responsibility for all activities that occur under your
                account
              </li>
              <li>
                Notify us immediately of any unauthorized use of your account
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We reserve the right to suspend or terminate your account at any
              time, with or without notice, for conduct that we determine, in
              our sole discretion, violates these Terms, is harmful to other
              users, or is otherwise objectionable. Upon termination, your right
              to use the Site will immediately cease.
            </p>
          </section>

          {/* 5. User Content */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              5. User Content
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The Site may allow you to submit, post, or share content including
              questions, answers, comments, and forum posts (collectively,
              &ldquo;User Content&rdquo;). By submitting User Content, you grant
              InformedMedicine a non-exclusive, worldwide, royalty-free,
              perpetual, irrevocable license to use, reproduce, modify, adapt,
              publish, translate, distribute, and display such content in
              connection with the Site.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              You are solely responsible for your User Content. You agree that
              your User Content will not:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed ml-2">
              <li>
                Contain false, misleading, or dangerously inaccurate health or
                medical information
              </li>
              <li>
                Constitute specific medical advice directed at any individual
              </li>
              <li>
                Infringe on the intellectual property rights of any third party
              </li>
              <li>
                Contain defamatory, obscene, abusive, hateful, or otherwise
                objectionable material
              </li>
              <li>
                Include personal medical records or protected health information
                of any individual
              </li>
              <li>Contain spam, advertising, or solicitations</li>
              <li>
                Promote the unauthorized sale of prescription medications or
                controlled substances
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We reserve the right to remove any User Content at our sole
              discretion and without prior notice.
            </p>
          </section>

          {/* 6. Intellectual Property */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              6. Intellectual Property
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              All content on the Site, including text, graphics, logos, icons,
              images, audio clips, data compilations, software, and the
              compilation thereof (collectively, &ldquo;Site Content&rdquo;), is
              the property of InformedMedicine or its content suppliers and is
              protected by United States and international copyright, trademark,
              and other intellectual property laws.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              You may access and display Site Content on your personal device
              for your own non-commercial, personal, educational use only. You
              may not reproduce, republish, distribute, sell, or modify any Site
              Content without our prior written consent. Certain drug
              information on the Site is sourced from publicly available
              government databases and may be subject to their respective terms
              of use.
            </p>
          </section>

          {/* 7. Prohibited Uses */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              7. Prohibited Uses
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              You agree not to use the Site for any of the following purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed ml-2">
              <li>
                Engaging in any activity that violates applicable local, state,
                national, or international law
              </li>
              <li>
                Attempting to gain unauthorized access to the Site, other user
                accounts, or any computer systems or networks connected to the
                Site
              </li>
              <li>
                Using automated systems, bots, or scrapers to collect data from
                the Site without written permission
              </li>
              <li>
                Impersonating any person or entity, including healthcare
                professionals
              </li>
              <li>
                Transmitting viruses, malware, or other harmful code
              </li>
              <li>
                Interfering with or disrupting the Site&apos;s infrastructure or
                other users&apos; experience
              </li>
              <li>
                Using the Site to provide or promote unauthorized medical
                services or products
              </li>
            </ul>
          </section>

          {/* 8. Limitation of Liability */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              8. Limitation of Liability
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              To the fullest extent permitted by applicable law,
              InformedMedicine, its owners, officers, directors, employees,
              agents, and affiliates shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages, including
              but not limited to loss of profits, data, use, goodwill, or other
              intangible losses, arising out of or related to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed ml-2">
              <li>Your access to, use of, or inability to use the Site</li>
              <li>
                Any content, information, or recommendations obtained from the
                Site
              </li>
              <li>
                Any health decisions or actions taken based on information
                provided on the Site
              </li>
              <li>
                Unauthorized access to or alteration of your data or
                transmissions
              </li>
              <li>Any third-party content or conduct on the Site</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              The Site and its content are provided on an &ldquo;as is&rdquo;
              and &ldquo;as available&rdquo; basis without warranties of any
              kind, either express or implied. We do not warrant that the Site
              will be uninterrupted, error-free, or free of viruses or other
              harmful components.
            </p>
          </section>

          {/* 9. Indemnification */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              9. Indemnification
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to indemnify, defend, and hold harmless InformedMedicine
              and its owners, officers, directors, employees, agents, and
              affiliates from and against any and all claims, liabilities,
              damages, losses, costs, and expenses (including reasonable
              attorneys&apos; fees) arising out of or related to your use of the
              Site, your User Content, your violation of these Terms, or your
              violation of any rights of a third party.
            </p>
          </section>

          {/* 10. Third-Party Links */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              10. Third-Party Links
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              The Site may contain links to third-party websites, services, or
              resources that are not owned or controlled by InformedMedicine. We
              have no control over, and assume no responsibility for, the
              content, privacy policies, or practices of any third-party
              websites or services. You acknowledge and agree that
              InformedMedicine shall not be responsible or liable, directly or
              indirectly, for any damage or loss caused or alleged to be caused
              by or in connection with the use of or reliance on any content,
              goods, or services available on or through any such third-party
              websites or services. We strongly encourage you to read the terms
              and conditions and privacy policies of any third-party websites
              that you visit.
            </p>
          </section>

          {/* 11. Changes to Terms */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              11. Changes to Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify or replace these Terms at any time
              at our sole discretion. If a revision is material, we will provide
              at least 30 days&apos; notice prior to any new terms taking effect
              by posting a notice on the Site. What constitutes a material
              change will be determined at our sole discretion. By continuing to
              access or use the Site after any revisions become effective, you
              agree to be bound by the revised Terms. If you do not agree to the
              new Terms, please stop using the Site.
            </p>
          </section>

          {/* 12. Governing Law */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              12. Governing Law
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be governed by and construed in accordance with
              the laws of the United States. Any disputes arising under or in
              connection with these Terms shall be subject to the exclusive
              jurisdiction of the courts located within the United States. You
              agree to waive any objection to the exercise of jurisdiction over
              you by such courts and to the venue of such courts.
            </p>
          </section>

          {/* 13. Contact Information */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              13. Contact Information
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms of Service, please
              contact us at:
            </p>
            <div className="mt-4 bg-muted/50 border border-border rounded-lg p-5">
              <p className="text-foreground font-medium">InformedMedicine</p>
              <p className="text-muted-foreground mt-1">
                Email:{" "}
                <a
                  href="mailto:contact@informedmedicine.com"
                  className="text-primary hover:underline"
                >
                  contact@informedmedicine.com
                </a>
              </p>
              <p className="text-muted-foreground mt-1">
                Website:{" "}
                <a
                  href="https://informedmedicine.com"
                  className="text-primary hover:underline"
                >
                  informedmedicine.com
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
