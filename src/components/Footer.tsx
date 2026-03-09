import Link from "next/link";
import { Heart } from "lucide-react";
import { SITE_NAME } from "@/lib/utils";

const FOOTER_SECTIONS = [
  {
    title: "Health Topics",
    links: [
      { href: "/news?category=heart-health", label: "Heart Health" },
      { href: "/news?category=mental-health", label: "Mental Health" },
      { href: "/news?category=nutrition", label: "Nutrition" },
      { href: "/news?category=diabetes", label: "Diabetes" },
      { href: "/news?category=sleep", label: "Sleep Health" },
      { href: "/news?category=fitness", label: "Fitness" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/drugs", label: "Drug Database" },
      { href: "/lab-tests", label: "Lab Test Guide" },
      { href: "/supplements", label: "Supplement Reviews" },
      { href: "/qa", label: "Ask a Question" },
      { href: "/forum", label: "Community Forum" },
    ],
  },
  {
    title: "About",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/editorial-policy", label: "Editorial Policy" },
      { href: "/medical-review", label: "Medical Review Process" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                <Heart className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg tracking-tight">
                Informed<span className="text-primary">Medicine</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Evidence-based health information reviewed by medical professionals.
              Making complex health topics accessible and understandable.
            </p>
          </div>
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-sm mb-3">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-border mt-8 pt-8">
          <p className="text-xs text-muted-foreground text-center">
            <strong>Medical Disclaimer:</strong> The information on {SITE_NAME} is for educational purposes only
            and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice
            of your physician or other qualified health provider with any questions about a medical condition.
          </p>
          <p className="text-xs text-muted-foreground text-center mt-2">
            &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
            Content last reviewed: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}.
          </p>
        </div>
      </div>
    </footer>
  );
}
