import type { PageContent } from "@/types/page";
import type { SiteConfig } from "@/types/site";

/**
 * Legal pages, generated from templates rather than authored per business.
 *
 * The body copy below is standard, generic boilerplate — it makes no claim
 * this framework cannot back up (no fabricated compliance certifications, no
 * invented retention periods, no legal advice). Every value it inserts comes
 * from real `SiteConfig` fields. **This is a starting template, not a
 * substitute for legal review** — see the note in `docs/SESSION.md`.
 */

export const LEGAL_SLUGS = ["privacy-policy", "terms-conditions", "disclaimer", "accessibility"] as const;
export type LegalSlug = (typeof LEGAL_SLUGS)[number];

export function isLegalSlug(slug: string): slug is LegalSlug {
  return (LEGAL_SLUGS as readonly string[]).includes(slug);
}

export interface LegalBlock {
  heading: string;
  paragraphs: string[];
}

export interface LegalPage {
  page: PageContent;
  title: string;
  blocks: LegalBlock[];
}

const TITLES: Record<LegalSlug, string> = {
  "privacy-policy": "Privacy Policy",
  "terms-conditions": "Terms & Conditions",
  disclaimer: "Disclaimer",
  accessibility: "Accessibility Statement",
};

function buildPage(slug: LegalSlug, site: SiteConfig, description: string): PageContent {
  return {
    slug,
    pageType: "legal",
    seo: {
      title: `${TITLES[slug]} | ${site.business.name}`,
      description,
      canonicalPath: `/${slug}`,
      indexable: true,
    },
    schema: [],
    sections: [],
    internalLinks: [],
  };
}

function buildBlocks(slug: LegalSlug, site: SiteConfig): LegalBlock[] {
  const { business, url } = site;

  switch (slug) {
    case "privacy-policy":
      return [
        {
          heading: "Overview",
          paragraphs: [
            `${business.name} ("we", "us", "our") operates the website at ${url}. This page explains what information we collect from visitors and how we use it.`,
          ],
        },
        {
          heading: "Information We Collect",
          paragraphs: [
            "When you submit our contact form, we collect the information you provide directly: your name, phone number, email address, and any message you include. We do not knowingly collect personal information through this site by any other means.",
          ],
        },
        {
          heading: "How We Use Your Information",
          paragraphs: [
            "We use the information you submit to respond to your inquiry and, if you engage our services, to provide them. We do not sell or rent your personal information to third parties.",
          ],
        },
        {
          heading: "Data Retention & Security",
          paragraphs: [
            "We retain contact form submissions only as long as needed to respond to your inquiry or fulfill a service engagement, and we take reasonable measures to protect the information you share with us.",
          ],
        },
        {
          heading: "Your Rights",
          paragraphs: [
            `You may contact us at ${business.email} at any time to ask what information we hold about you or to request that it be deleted.`,
          ],
        },
        {
          heading: "Changes to This Policy",
          paragraphs: [
            "We may update this policy from time to time. Continued use of this site after a change means you accept the revised policy.",
          ],
        },
      ];

    case "terms-conditions":
      return [
        {
          heading: "Acceptance of Terms",
          paragraphs: [
            `By using the website at ${url}, you agree to these terms. If you do not agree, please do not use this site.`,
          ],
        },
        {
          heading: "Use of This Site",
          paragraphs: [
            `This site provides general information about ${business.name}'s ${business.primaryService.toLowerCase()} services in ${business.region}. It is provided for informational purposes and does not itself form a contract for service — any engagement is governed by a separate estimate or agreement.`,
          ],
        },
        {
          heading: "No Warranty",
          paragraphs: [
            "This site and its content are provided \"as is,\" without warranty of any kind, express or implied, including as to accuracy or completeness.",
          ],
        },
        {
          heading: "Limitation of Liability",
          paragraphs: [
            `To the fullest extent permitted by law, ${business.name} is not liable for any indirect, incidental, or consequential damages arising from your use of this site.`,
          ],
        },
        {
          heading: "Governing Law",
          paragraphs: [
            `These terms are governed by the laws of the State of ${business.state}, without regard to conflict-of-law principles.`,
          ],
        },
        {
          heading: "Contact",
          paragraphs: [`Questions about these terms can be directed to ${business.email}.`],
        },
      ];

    case "disclaimer":
      return [
        {
          heading: "General Information Only",
          paragraphs: [
            `The content on this site about ${business.primaryService.toLowerCase()} services in ${business.region} is general in nature and is not a guarantee of outcome, pricing, or timeline for any specific project. Every property is different — request a real inspection or estimate before making decisions.`,
          ],
        },
        {
          heading: "No Professional Relationship",
          paragraphs: [
            "Browsing this site does not create a service relationship between you and us. That relationship begins only once you engage us directly, such as by scheduling an estimate.",
          ],
        },
        {
          heading: "Verify Before You Act",
          paragraphs: [
            `Contact us directly at ${business.phone} or ${business.email} to confirm current pricing, availability, and service details before making a decision based on anything published on this site.`,
          ],
        },
      ];

    case "accessibility":
      return [
        {
          heading: "Our Commitment",
          paragraphs: [
            `${business.name} is committed to making ${url} usable by as many visitors as possible, including people with disabilities.`,
          ],
        },
        {
          heading: "Ongoing Effort",
          paragraphs: [
            "We aim to conform to common web accessibility guidelines (WCAG 2.1, level AA) and are working to identify and fix issues as they're found. This is an ongoing effort, not a certified claim of full conformance.",
          ],
        },
        {
          heading: "Feedback",
          paragraphs: [
            `If you encounter a barrier using this site, please let us know at ${business.email} or ${business.phone} so we can address it.`,
          ],
        },
      ];
  }
}

export function getLegalPage(slug: LegalSlug, site: SiteConfig): LegalPage {
  const blocks = buildBlocks(slug, site);
  const description = blocks[0]?.paragraphs[0] ?? TITLES[slug];
  return {
    page: buildPage(slug, site, description),
    title: TITLES[slug],
    blocks,
  };
}

export function getAllLegalPages(site: SiteConfig): LegalPage[] {
  return LEGAL_SLUGS.map((slug) => getLegalPage(slug, site));
}
