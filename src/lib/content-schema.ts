import { z } from "zod";

// Runtime schemas are the content contract. Keep this module free of Next and
// React imports so both the application loader and the plain Node validator can
// use exactly the same parser.

const nonEmptyString = z.string().refine((value) => value.trim().length > 0, {
  message: "must not be empty",
});

const rootRelativePath = z.string().refine(
  (value) =>
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("?") &&
    !value.includes("#"),
  { message: "must be a root-relative path without a query or fragment" },
);

const absoluteUrl = z.string().url({ message: "must be a valid absolute URL" });

const siteOrigin = absoluteUrl.refine(
  (value) => {
    try {
      const url = new URL(value);
      return (url.protocol === "http:" || url.protocol === "https:") && url.origin === value;
    } catch {
      return false;
    }
  },
  { message: "must be an absolute HTTP(S) origin without a path or trailing slash" },
);

const optionalCoordinate = (minimum: number, maximum: number) =>
  z.string().refine(
    (value) => {
      if (value === "") return true;
      const coordinate = Number(value);
      return Number.isFinite(coordinate) && coordinate >= minimum && coordinate <= maximum;
    },
    { message: `must be empty or a number from ${minimum} to ${maximum}` },
  );

const titledItemSchema = z
  .object({
    title: nonEmptyString,
    description: nonEmptyString,
  })
  .strict();

const serviceItemSchema = titledItemSchema
  .extend({
    bullets: z.array(nonEmptyString).min(1),
  })
  .strict();

const proofStatSchema = z
  .object({
    value: nonEmptyString,
    label: nonEmptyString,
  })
  .strict();

const testimonialItemSchema = z
  .object({
    quote: nonEmptyString,
    author: nonEmptyString,
    role: nonEmptyString,
    rating: z.number().min(1).max(5).optional(),
  })
  .strict();

const faqItemSchema = z
  .object({
    question: nonEmptyString,
    answer: nonEmptyString,
  })
  .strict();

const headedSectionShape = {
  eyebrow: nonEmptyString,
  title: nonEmptyString,
  description: nonEmptyString,
} as const;

export const HeroPropsSchema = z
  .object({
    eyebrow: nonEmptyString,
    headline: nonEmptyString,
    subheadline: nonEmptyString,
    primaryButton: nonEmptyString,
    secondaryButton: nonEmptyString,
  })
  .strict();

export const ServicesPropsSchema = z
  .object({
    ...headedSectionShape,
    items: z.array(serviceItemSchema).min(1),
    itemCta: nonEmptyString,
  })
  .strict();

export const WhyChooseUsPropsSchema = z
  .object({
    ...headedSectionShape,
    items: z.array(titledItemSchema).min(1),
  })
  .strict();

export const ProofPropsSchema = z
  .object({
    ...headedSectionShape,
    stats: z.array(proofStatSchema).min(1),
  })
  .strict();

export const ProcessPropsSchema = z
  .object({
    ...headedSectionShape,
    steps: z.array(titledItemSchema).min(1),
  })
  .strict();

export const TestimonialsPropsSchema = z
  .object({
    ...headedSectionShape,
    items: z.array(testimonialItemSchema).min(1),
  })
  .strict();

export const FAQPropsSchema = z
  .object({
    ...headedSectionShape,
    items: z.array(faqItemSchema).min(1),
  })
  .strict();

export const CTAPropsSchema = z
  .object({
    eyebrow: nonEmptyString,
    title: nonEmptyString,
    description: nonEmptyString,
    primaryButton: nonEmptyString,
    secondaryButton: nonEmptyString,
  })
  .strict();

export const AuthorityPropsSchema = z
  .object({
    ...headedSectionShape,
    items: z.array(titledItemSchema).min(1),
    callout: nonEmptyString,
  })
  .strict();

export const AnswerPropsSchema = z
  .object({
    question: nonEmptyString,
    answer: nonEmptyString,
  })
  .strict();

export const ContactInfoPropsSchema = z
  .object({
    title: nonEmptyString,
    description: nonEmptyString,
    phoneLabel: nonEmptyString,
    emailLabel: nonEmptyString,
    areaLabel: nonEmptyString,
  })
  .strict();

const formFieldSchema = z
  .object({
    label: nonEmptyString,
    placeholder: nonEmptyString,
  })
  .strict();

export const ContactFormPropsSchema = z
  .object({
    title: nonEmptyString,
    description: nonEmptyString,
    fields: z
      .object({
        name: formFieldSchema,
        phone: formFieldSchema,
        email: formFieldSchema,
        message: formFieldSchema,
      })
      .strict(),
    submitLabel: nonEmptyString,
    submittingLabel: nonEmptyString,
    errorMessage: nonEmptyString,
  })
  .strict();

export const SECTION_TYPES = [
  "Hero",
  "Services",
  "WhyChooseUs",
  "Proof",
  "Process",
  "Testimonials",
  "FAQ",
  "CTA",
  "Authority",
  "Answer",
  "ContactInfo",
  "ContactForm",
] as const;

export const SectionTypeSchema = z.enum(SECTION_TYPES);

export const SECTION_PROP_SCHEMAS = {
  Hero: HeroPropsSchema,
  Services: ServicesPropsSchema,
  WhyChooseUs: WhyChooseUsPropsSchema,
  Proof: ProofPropsSchema,
  Process: ProcessPropsSchema,
  Testimonials: TestimonialsPropsSchema,
  FAQ: FAQPropsSchema,
  CTA: CTAPropsSchema,
  Authority: AuthorityPropsSchema,
  Answer: AnswerPropsSchema,
  ContactInfo: ContactInfoPropsSchema,
  ContactForm: ContactFormPropsSchema,
} satisfies Record<(typeof SECTION_TYPES)[number], z.ZodType>;

export const SectionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("Hero"), props: HeroPropsSchema }).strict(),
  z.object({ type: z.literal("Services"), props: ServicesPropsSchema }).strict(),
  z.object({ type: z.literal("WhyChooseUs"), props: WhyChooseUsPropsSchema }).strict(),
  z.object({ type: z.literal("Proof"), props: ProofPropsSchema }).strict(),
  z.object({ type: z.literal("Process"), props: ProcessPropsSchema }).strict(),
  z.object({ type: z.literal("Testimonials"), props: TestimonialsPropsSchema }).strict(),
  z.object({ type: z.literal("FAQ"), props: FAQPropsSchema }).strict(),
  z.object({ type: z.literal("CTA"), props: CTAPropsSchema }).strict(),
  z.object({ type: z.literal("Authority"), props: AuthorityPropsSchema }).strict(),
  z.object({ type: z.literal("Answer"), props: AnswerPropsSchema }).strict(),
  z.object({ type: z.literal("ContactInfo"), props: ContactInfoPropsSchema }).strict(),
  z.object({ type: z.literal("ContactForm"), props: ContactFormPropsSchema }).strict(),
]);

export const PageTypeSchema = z.enum([
  "home",
  "about",
  "contact",
  "services",
  "service",
  "location",
  "faq",
  "legal",
  "thank-you",
]);

export const SchemaGraphSchema = z.enum([
  "WebSite",
  "Service",
  "FAQPage",
  "BreadcrumbList",
  "LocalBusiness",
  "Review",
]);

export const ContentStateSchema = z.enum(["sample", "verified"]);

const verificationStatusSchema = z.enum(["pending", "verified"]);

const verificationDateSchema = z.string().refine(
  (value) => {
    if (value === "" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return value === "";
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
  },
  { message: "must be empty or an ISO date in YYYY-MM-DD format" },
);

const productionReviewSchema = z
  .object({
    status: verificationStatusSchema,
    source: z.string(),
    reviewer: z.string(),
    reviewedAt: verificationDateSchema,
  })
  .strict();

const claimLocationSchema = z
  .object({
    source: z.string().regex(
      /^content\/(?:site\.json|(?:pages|services|locations|faq)\/[a-z0-9-]+\.json)$/,
      { message: "must identify a supported content JSON file" },
    ),
    path: nonEmptyString,
  })
  .strict();

const trustClaimSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "must be a lowercase kebab-case identifier",
    }),
    category: z.enum([
      "licence-insurance",
      "experience-statistic",
      "availability-response",
      "warranty-guarantee",
      "testimonial-rating",
      "service-capability",
      "local-expertise",
    ]),
    summary: nonEmptyString,
    status: verificationStatusSchema,
    source: z.string(),
    reviewer: z.string(),
    reviewedAt: verificationDateSchema,
    locations: z.array(claimLocationSchema).min(1),
  })
  .strict();

/**
 * Production evidence is intentionally separate from SiteConfig. Reviewer names
 * and internal source references must never become public site data.
 */
export const ProductionVerificationSchema = z
  .object({
    claims: z.array(trustClaimSchema).refine(
      (claims) => new Set(claims.map((claim) => claim.id)).size === claims.length,
      { message: "must not contain duplicate claim identifiers" },
    ),
    humanReviews: z
      .object({
        businessIdentity: productionReviewSchema,
        localKnowledge: productionReviewSchema,
        testimonials: productionReviewSchema,
        legalLanguage: productionReviewSchema,
        gbpAlignment: productionReviewSchema,
        rateControl: productionReviewSchema,
        imageRights: productionReviewSchema,
      })
      .strict(),
  })
  .strict();

export const PageContentSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "must be a lowercase kebab-case slug",
    }),
    pageType: PageTypeSchema,
    seo: z
      .object({
        title: nonEmptyString,
        description: nonEmptyString,
        canonicalPath: rootRelativePath,
        indexable: z.boolean(),
        ogImage: rootRelativePath.optional(),
      })
      .strict(),
    schema: z.array(SchemaGraphSchema).refine((items) => new Set(items).size === items.length, {
      message: "must not contain duplicate schema names",
    }),
    sections: z.array(SectionSchema).min(1),
    internalLinks: z.array(rootRelativePath),
  })
  .strict();

export const SiteConfigSchema = z
  .object({
    url: siteOrigin,
    contentState: ContentStateSchema,
    business: z
      .object({
        name: nonEmptyString,
        industry: nonEmptyString,
        primaryService: nonEmptyString,
        city: nonEmptyString,
        state: nonEmptyString,
        region: nonEmptyString,
        phone: nonEmptyString,
        email: z.string().email(),
        licenseNumber: z.string(),
        priceRange: nonEmptyString,
        address: z
          .object({
            street: z.string(),
            city: nonEmptyString,
            state: nonEmptyString,
            postalCode: z.string(),
            country: nonEmptyString,
          })
          .strict(),
        geo: z
          .object({
            latitude: optionalCoordinate(-90, 90),
            longitude: optionalCoordinate(-180, 180),
          })
          .strict(),
        hours: z.array(nonEmptyString),
        sameAs: z.array(absoluteUrl),
      })
      .strict(),
    branding: z
      .object({
        primaryColor: nonEmptyString,
        accentColor: nonEmptyString,
      })
      .strict(),
    navigation: z
      .object({
        links: z
          .array(
            z
              .object({
                label: nonEmptyString,
                href: rootRelativePath,
              })
              .strict(),
          )
          .min(1),
        cta: nonEmptyString,
      })
      .strict(),
    footer: z
      .object({
        headline: nonEmptyString,
        copyright: nonEmptyString,
      })
      .strict(),
    schema: z
      .object({
        businessType: z.string().regex(/^[A-Z][A-Za-z0-9]*$/, {
          message: "must be a schema.org type name",
        }),
      })
      .strict(),
    conversion: z
      .object({
        trackingPhone: z.string().regex(/^\+[1-9]\d{7,14}$/, {
          message: "must be an E.164 phone number",
        }),
        displayPhone: nonEmptyString,
        thankYouPath: rootRelativePath,
        model: z.enum(["emergency", "considered", "mixed"]),
      })
      .strict(),
  })
  .strict();

export type TitledItem = z.infer<typeof titledItemSchema>;
export type ServiceItem = z.infer<typeof serviceItemSchema>;
export type ProofStat = z.infer<typeof proofStatSchema>;
export type TestimonialItem = z.infer<typeof testimonialItemSchema>;
export type FAQItem = z.infer<typeof faqItemSchema>;
export type HeroProps = z.infer<typeof HeroPropsSchema>;
export type ServicesProps = z.infer<typeof ServicesPropsSchema>;
export type WhyChooseUsProps = z.infer<typeof WhyChooseUsPropsSchema>;
export type ProofProps = z.infer<typeof ProofPropsSchema>;
export type ProcessProps = z.infer<typeof ProcessPropsSchema>;
export type TestimonialsProps = z.infer<typeof TestimonialsPropsSchema>;
export type FAQProps = z.infer<typeof FAQPropsSchema>;
export type CTAProps = z.infer<typeof CTAPropsSchema>;
export type AuthorityProps = z.infer<typeof AuthorityPropsSchema>;
export type AnswerProps = z.infer<typeof AnswerPropsSchema>;
export type ContactInfoProps = z.infer<typeof ContactInfoPropsSchema>;
export type FormField = z.infer<typeof formFieldSchema>;
export type ContactFormProps = z.infer<typeof ContactFormPropsSchema>;
export type Section = z.infer<typeof SectionSchema>;
export type SectionType = z.infer<typeof SectionTypeSchema>;
export type PageType = z.infer<typeof PageTypeSchema>;
export type SchemaGraph = z.infer<typeof SchemaGraphSchema>;
export type ContentState = z.infer<typeof ContentStateSchema>;
export type PageContent = z.infer<typeof PageContentSchema>;
export type PageSeo = PageContent["seo"];
export type SiteConfig = z.infer<typeof SiteConfigSchema>;
export type Business = SiteConfig["business"];
export type PostalAddress = Business["address"];
export type GeoCoordinates = Business["geo"];
export type Branding = SiteConfig["branding"];
export type Navigation = SiteConfig["navigation"];
export type NavigationLink = Navigation["links"][number];
export type FooterConfig = SiteConfig["footer"];
export type SchemaConfig = SiteConfig["schema"];
export type ConversionConfig = SiteConfig["conversion"];
export type ProductionVerification = z.infer<typeof ProductionVerificationSchema>;
export type ProductionReview = ProductionVerification["humanReviews"][keyof ProductionVerification["humanReviews"]];
export type TrustClaim = ProductionVerification["claims"][number];

export type SectionPropsMap = {
  [Type in keyof typeof SECTION_PROP_SCHEMAS]: z.infer<
    (typeof SECTION_PROP_SCHEMAS)[Type]
  >;
};

export interface ContentIssue {
  source: string;
  path: string;
  message: string;
}

export class ContentContractError extends Error {
  readonly issues: ContentIssue[];

  constructor(issues: ContentIssue[]) {
    super(issues.map(formatContentIssue).join("\n"));
    this.name = "ContentContractError";
    this.issues = issues;
  }
}

export interface RawSiteRecord {
  source: string;
  data: unknown;
}

export interface RawPageRecord {
  source: string;
  routePath: string;
  data: unknown;
}

export interface ParsedContentBundle {
  site: SiteConfig;
  pages: PageContent[];
}

function formatContentIssue(issue: ContentIssue): string {
  return `${issue.source} — ${issue.path || "value"}: ${issue.message}`;
}

function schemaIssues(source: string, error: z.ZodError): ContentIssue[] {
  return error.issues.map((issue) => ({
    source,
    path: issue.path.map(String).join("."),
    message: issue.message,
  }));
}

export function isSectionType(value: string): value is SectionType {
  return SectionTypeSchema.safeParse(value).success;
}

export function expectedRouteForPage(page: Pick<PageContent, "slug" | "pageType">): string {
  switch (page.pageType) {
    case "home":
      return "/";
    case "about":
      return "/about";
    case "contact":
      return "/contact";
    case "services":
      return "/services";
    case "thank-you":
      return "/thank-you";
    case "service":
      return `/services/${page.slug}`;
    case "location":
      return `/service-area/${page.slug}`;
    case "faq":
      return `/faq/${page.slug}`;
    case "legal":
      return `/${page.slug}`;
  }
}

function validatePageRelationships(
  record: RawPageRecord,
  page: PageContent,
  issues: ContentIssue[],
): void {
  const expectedRoute = expectedRouteForPage(page);

  if (record.routePath !== expectedRoute) {
    issues.push({
      source: record.source,
      path: "slug/pageType",
      message: `resolve to "${expectedRoute}" but the source route is "${record.routePath}"`,
    });
  }

  if (page.seo.canonicalPath !== record.routePath) {
    issues.push({
      source: record.source,
      path: "seo.canonicalPath",
      message: `must match source route "${record.routePath}"`,
    });
  }

  const sectionTypes = new Set(page.sections.map((section) => section.type));
  if (page.schema.includes("WebSite") && page.pageType !== "home") {
    issues.push({
      source: record.source,
      path: "schema",
      message: "WebSite is only valid for the home page",
    });
  }
  if (page.schema.includes("Service") && page.pageType !== "service") {
    issues.push({
      source: record.source,
      path: "schema",
      message: "Service is only valid for service pages",
    });
  }
  if (
    page.schema.includes("FAQPage") &&
    page.pageType !== "faq" &&
    !sectionTypes.has("FAQ")
  ) {
    issues.push({
      source: record.source,
      path: "schema",
      message: "FAQPage requires an FAQ page or FAQ section",
    });
  }
  if (page.schema.includes("Review") && !sectionTypes.has("Testimonials")) {
    issues.push({
      source: record.source,
      path: "schema",
      message: "Review requires a Testimonials section",
    });
  }
}

export function parseContentBundle(
  siteRecord: RawSiteRecord,
  pageRecords: RawPageRecord[],
  additionalKnownPaths: readonly string[] = [],
): ParsedContentBundle {
  const issues: ContentIssue[] = [];
  const siteResult = SiteConfigSchema.safeParse(siteRecord.data);
  if (!siteResult.success) issues.push(...schemaIssues(siteRecord.source, siteResult.error));

  const parsedPages: Array<{ record: RawPageRecord; page: PageContent }> = [];
  for (const record of pageRecords) {
    const result = PageContentSchema.safeParse(record.data);
    if (!result.success) {
      issues.push(...schemaIssues(record.source, result.error));
      continue;
    }
    validatePageRelationships(record, result.data, issues);
    parsedPages.push({ record, page: result.data });
  }

  const titles = new Map<string, string[]>();
  const canonicals = new Map<string, string[]>();
  for (const { record, page } of parsedPages) {
    titles.set(page.seo.title, [...(titles.get(page.seo.title) ?? []), record.source]);
    canonicals.set(page.seo.canonicalPath, [
      ...(canonicals.get(page.seo.canonicalPath) ?? []),
      record.source,
    ]);
  }

  for (const [title, sources] of titles) {
    if (sources.length > 1) {
      issues.push({
        source: sources.join(" + "),
        path: "seo.title",
        message: `duplicate title "${title}"`,
      });
    }
  }
  for (const [canonical, sources] of canonicals) {
    if (sources.length > 1) {
      issues.push({
        source: sources.join(" + "),
        path: "seo.canonicalPath",
        message: `duplicate canonical "${canonical}"`,
      });
    }
  }

  const knownPaths = new Set([
    ...parsedPages.map(({ page }) => page.seo.canonicalPath),
    ...additionalKnownPaths,
  ]);

  for (const { record, page } of parsedPages) {
    for (const link of page.internalLinks) {
      if (!knownPaths.has(link)) {
        issues.push({
          source: record.source,
          path: "internalLinks",
          message: `target "${link}" does not resolve to known content`,
        });
      }
    }
  }

  if (siteResult.success) {
    for (const [index, link] of siteResult.data.navigation.links.entries()) {
      if (!knownPaths.has(link.href)) {
        issues.push({
          source: siteRecord.source,
          path: `navigation.links.${index}.href`,
          message: `target "${link.href}" does not resolve to known content`,
        });
      }
    }
    if (!knownPaths.has(siteResult.data.conversion.thankYouPath)) {
      issues.push({
        source: siteRecord.source,
        path: "conversion.thankYouPath",
        message: `target "${siteResult.data.conversion.thankYouPath}" does not resolve to known content`,
      });
    }
  }

  if (issues.length > 0) throw new ContentContractError(issues);

  // Both values are guaranteed by the zero-issue branch above.
  if (!siteResult.success) throw new Error("Unreachable content parser state");
  return { site: siteResult.data, pages: parsedPages.map(({ page }) => page) };
}
