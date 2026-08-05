import type {
  PageContent,
  ProductionReview,
  ProductionVerification,
  SiteConfig,
} from "./content-schema";

export interface ProductionPageRecord {
  source: string;
  page: PageContent;
}

export interface ProductionReadinessInput {
  site: SiteConfig;
  pages: ProductionPageRecord[];
  verification: ProductionVerification;
  publicFiles: readonly string[];
  leadDeliveryEndpoint?: string;
}

export interface ProductionReadinessIssue {
  code: string;
  message: string;
}

interface TrustClaimCandidate {
  source: string;
  path: string;
  value: string;
}

const REVIEW_LABELS: Record<
  keyof ProductionVerification["humanReviews"],
  string
> = {
  businessIdentity: "business identity",
  localKnowledge: "local knowledge",
  testimonials: "testimonials and ratings",
  legalLanguage: "legal language",
  gbpAlignment: "Google Business Profile alignment",
  rateControl: "provider or edge rate control",
  imageRights: "image authenticity and usage rights",
};

const RISKY_TRUST_LANGUAGE =
  /\btrust(?:ed)?\b|\bexpert\b|licen[cs](?:e|ed|ing)?|insur(?:ed|ance)|warrant(?:y|ied)|guarantee|certif(?:ied|ication)|award(?:ed|s)?|accredit(?:ed|ation)|bonded|locally owned|local (?:experience|knowledge)|years? of experience|projects? completed|24\s*\/\s*7|emergency response|fast (?:response|scheduling)|respond quickly|resolved it fast|follow up shortly|get back to you (?:soon|right away)|we(?:'|’)?ll pick up|available for urgent/i;

const REAL_IMAGE_EXTENSION = /\.(?:avif|jpe?g|png|webp)$/i;
const EVIDENCE_PLACEHOLDER = /\b(?:todo|tbd|unknown|pending)\b|placeholder|example\.com/i;

function issue(
  issues: ProductionReadinessIssue[],
  code: string,
  message: string,
): void {
  issues.push({ code, message });
}

function isBlank(value: unknown): boolean {
  return typeof value !== "string" || value.trim() === "";
}

function isReservedNorthAmericanPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  const national = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  return /^\d{3}55501\d{2}$/.test(national);
}

function reviewEvidenceComplete(review: ProductionReview): boolean {
  return (
    review.status === "verified" &&
    !isBlank(review.source) &&
    !EVIDENCE_PLACEHOLDER.test(review.source) &&
    !isBlank(review.reviewer) &&
    !EVIDENCE_PLACEHOLDER.test(review.reviewer) &&
    !isBlank(review.reviewedAt)
  );
}

function locationKey(source: string, path: string): string {
  return `${source}#${path}`;
}

function resolvePath(value: unknown, path: string): unknown {
  let current = value;
  for (const segment of path.split(".")) {
    if (segment === "__proto__" || segment === "prototype" || segment === "constructor") {
      return undefined;
    }
    if (Array.isArray(current)) {
      if (!/^\d+$/.test(segment)) return undefined;
      current = current[Number(segment)];
      continue;
    }
    if (current === null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

function walkRiskyStrings(
  value: unknown,
  source: string,
  path: string,
  coveredPrefixes: readonly string[],
  candidates: Map<string, TrustClaimCandidate>,
): void {
  if (typeof value === "string") {
    if (
      RISKY_TRUST_LANGUAGE.test(value) &&
      !coveredPrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}.`))
    ) {
      candidates.set(locationKey(source, path), { source, path, value });
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      walkRiskyStrings(item, source, path ? `${path}.${index}` : String(index), coveredPrefixes, candidates),
    );
    return;
  }

  if (value !== null && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      walkRiskyStrings(
        child,
        source,
        path ? `${path}.${key}` : key,
        coveredPrefixes,
        candidates,
      );
    }
  }
}

export function collectTrustClaimCandidates(
  pages: readonly ProductionPageRecord[],
): TrustClaimCandidate[] {
  const candidates = new Map<string, TrustClaimCandidate>();

  for (const { source, page } of pages) {
    const coveredPrefixes: string[] = [];

    page.sections.forEach((section, sectionIndex) => {
      if (section.type === "Services") {
        section.props.items.forEach((service, itemIndex) => {
          const path = `sections.${sectionIndex}.props.items.${itemIndex}`;
          coveredPrefixes.push(path);
          candidates.set(locationKey(source, path), {
            source,
            path,
            value: `${service.title}: ${service.description}`,
          });
        });
      }

      if (section.type === "WhyChooseUs") {
        section.props.items.forEach((trustSignal, itemIndex) => {
          const path = `sections.${sectionIndex}.props.items.${itemIndex}`;
          coveredPrefixes.push(path);
          candidates.set(locationKey(source, path), {
            source,
            path,
            value: `${trustSignal.title}: ${trustSignal.description}`,
          });
        });
      }

      if (section.type === "Proof") {
        section.props.stats.forEach((stat, itemIndex) => {
          const path = `sections.${sectionIndex}.props.stats.${itemIndex}`;
          coveredPrefixes.push(path);
          candidates.set(locationKey(source, path), {
            source,
            path,
            value: `${stat.value} ${stat.label}`,
          });
        });
      }

      if (section.type === "Testimonials") {
        section.props.items.forEach((testimonial, itemIndex) => {
          const path = `sections.${sectionIndex}.props.items.${itemIndex}`;
          coveredPrefixes.push(path);
          candidates.set(locationKey(source, path), {
            source,
            path,
            value: `${testimonial.quote} — ${testimonial.author}`,
          });
        });
      }

      if (section.type === "Authority") {
        section.props.items.forEach((authoritySignal, itemIndex) => {
          const path = `sections.${sectionIndex}.props.items.${itemIndex}`;
          coveredPrefixes.push(path);
          candidates.set(locationKey(source, path), {
            source,
            path,
            value: `${authoritySignal.title}: ${authoritySignal.description}`,
          });
        });
        const calloutPath = `sections.${sectionIndex}.props.callout`;
        coveredPrefixes.push(calloutPath);
        candidates.set(locationKey(source, calloutPath), {
          source,
          path: calloutPath,
          value: section.props.callout,
        });
      }
    });

    walkRiskyStrings(page, source, "", coveredPrefixes, candidates);
  }

  return [...candidates.values()].sort((left, right) =>
    locationKey(left.source, left.path).localeCompare(locationKey(right.source, right.path)),
  );
}

function validateLeadEndpoint(
  endpoint: string | undefined,
  issues: ProductionReadinessIssue[],
): void {
  if (isBlank(endpoint)) {
    issue(issues, "lead-delivery", "lead delivery is not configured");
    return;
  }

  try {
    const url = new URL(endpoint as string);
    const blockedHost =
      url.hostname === "localhost" ||
      url.hostname.endsWith(".localhost") ||
      url.hostname.endsWith(".test") ||
      url.hostname === "example.com" ||
      url.hostname.endsWith(".example.com");
    if (url.protocol !== "https:" || blockedHost) {
      issue(
        issues,
        "lead-delivery",
        "lead delivery must use a real HTTPS provider endpoint",
      );
    }
  } catch {
    issue(issues, "lead-delivery", "lead delivery endpoint is not a valid URL");
  }
}

export function assessProductionReadiness(
  input: ProductionReadinessInput,
): ProductionReadinessIssue[] {
  const issues: ProductionReadinessIssue[] = [];
  const { business } = input.site;

  if (input.site.contentState !== "verified") {
    issue(issues, "content-state", 'contentState must be "verified" for production');
  }

  for (const [label, value] of [
    ["business phone", business.phone],
    ["tracking phone", input.site.conversion.trackingPhone],
    ["display phone", input.site.conversion.displayPhone],
  ] as const) {
    if (isReservedNorthAmericanPhone(value)) {
      issue(issues, "reserved-phone", `${label} uses the reserved 555-01xx range`);
    }
  }

  const requiredIdentityValues: Array<[string, unknown]> = [
    ["business.licenseNumber", business.licenseNumber],
    ["business.address.street", business.address.street],
    ["business.address.postalCode", business.address.postalCode],
    ["business.geo.latitude", business.geo.latitude],
    ["business.geo.longitude", business.geo.longitude],
  ];
  for (const [path, value] of requiredIdentityValues) {
    if (isBlank(value)) issue(issues, "incomplete-identity", `${path} is required`);
  }
  if (business.hours.length === 0) {
    issue(issues, "incomplete-identity", "business.hours requires at least one entry");
  }
  if (business.sameAs.length === 0) {
    issue(issues, "incomplete-identity", "business.sameAs requires at least one profile URL");
  }

  validateLeadEndpoint(input.leadDeliveryEndpoint, issues);

  if (!input.publicFiles.some((file) => REAL_IMAGE_EXTENSION.test(file))) {
    issue(
      issues,
      "real-images",
      "public assets require at least one real AVIF, JPEG, PNG, or WebP image",
    );
  }

  for (const [key, review] of Object.entries(input.verification.humanReviews) as Array<
    [keyof ProductionVerification["humanReviews"], ProductionReview]
  >) {
    if (!reviewEvidenceComplete(review)) {
      issue(
        issues,
        "human-review",
        `${REVIEW_LABELS[key]} requires verified status, source, reviewer, and review date`,
      );
    }
  }

  const contentBySource = new Map<string, unknown>([
    ["content/site.json", input.site],
    ...input.pages.map(({ source, page }) => [source, page] as const),
  ]);
  const candidates = collectTrustClaimCandidates(input.pages);
  const candidateKeys = new Set(
    candidates.map((candidate) => locationKey(candidate.source, candidate.path)),
  );
  const inventoriedLocations = new Map<string, string>();

  for (const claim of input.verification.claims) {
    if (!reviewEvidenceComplete(claim)) {
      issue(
        issues,
        "unverified-claim",
        `claim "${claim.id}" requires verified status, source, reviewer, and review date`,
      );
    }

    for (const location of claim.locations) {
      const key = locationKey(location.source, location.path);
      const priorClaim = inventoriedLocations.get(key);
      if (priorClaim) {
        issue(
          issues,
          "claim-inventory",
          `${key} is assigned to both "${priorClaim}" and "${claim.id}"`,
        );
        continue;
      }
      inventoriedLocations.set(key, claim.id);

      const sourceContent = contentBySource.get(location.source);
      if (sourceContent === undefined || resolvePath(sourceContent, location.path) === undefined) {
        issue(
          issues,
          "claim-inventory",
          `claim "${claim.id}" points to missing content at ${key}`,
        );
      } else if (!candidateKeys.has(key)) {
        issue(
          issues,
          "claim-inventory",
          `claim "${claim.id}" points to content that is no longer a detected trust claim at ${key}`,
        );
      }
    }
  }

  for (const candidate of candidates) {
    const key = locationKey(candidate.source, candidate.path);
    if (!inventoriedLocations.has(key)) {
      issue(
        issues,
        "unsupported-claim",
        `trust claim is not inventoried at ${key}: ${candidate.value}`,
      );
    }
  }

  return issues;
}
