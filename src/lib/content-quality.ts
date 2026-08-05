import type { PageContent, SiteConfig } from "./content-schema.ts";

export interface ContentQualityMessage {
  file: string;
  message: string;
}

export interface ContentQualityResult {
  errors: ContentQualityMessage[];
  warnings: ContentQualityMessage[];
}

interface ContentPattern {
  pattern: RegExp;
  label: string;
  /** Content paths where this pattern is legitimate rather than a defect. */
  exempt?: RegExp;
}

const PLACEHOLDER_PATTERNS: ContentPattern[] = [
  { pattern: /555-5555|555 5555/i, label: "placeholder phone number (555-5555)" },
  { pattern: /content coming soon/i, label: '"Content coming soon" placeholder' },
  { pattern: /lorem ipsum/i, label: "lorem ipsum filler" },
  { pattern: /\bTODO\b|\bTBD\b/, label: "TODO/TBD marker" },
  {
    pattern: /example\.com/i,
    label: "example.com placeholder",
    exempt: /\.placeholder$/,
  },
  { pattern: /\byour (business|company) name\b/i, label: "unreplaced template token" },
];

const SUSPICIOUS_PATTERNS: Array<[RegExp, string]> = [
  [/\(\d{3}\)\s*555-\d{4}/, "phone number uses the 555 reserved range"],
  [/\b\d{3}-555-\d{4}\b/, "phone number uses the 555 reserved range"],
];

/** Scan authored values before parsing so placeholders are reported with their JSON path. */
export function scanAuthoredContent(value: unknown, file: string): ContentQualityResult {
  const result: ContentQualityResult = { errors: [], warnings: [] };

  function scan(current: unknown, path = ""): void {
    if (typeof current === "string") {
      for (const { pattern, label, exempt } of PLACEHOLDER_PATTERNS) {
        if (exempt?.test(path)) continue;
        if (pattern.test(current)) {
          result.errors.push({ file, message: `${path || "value"} contains ${label}` });
        }
      }
      for (const [pattern, label] of SUSPICIOUS_PATTERNS) {
        if (pattern.test(current)) {
          result.warnings.push({ file, message: `${path || "value"}: ${label}` });
        }
      }
      return;
    }

    if (Array.isArray(current)) {
      current.forEach((item, index) => scan(item, `${path}[${index}]`));
      return;
    }

    if (current && typeof current === "object") {
      for (const [key, child] of Object.entries(current)) {
        scan(child, path ? `${path}.${key}` : key);
      }
    }
  }

  scan(value);
  return result;
}

/** Apply the anti-thin and development-warning rules after runtime parsing succeeds. */
export function assessParsedContentQuality(
  site: SiteConfig,
  pages: readonly PageContent[],
  pageSources: readonly string[],
  siteSource: string,
): ContentQualityResult {
  const result: ContentQualityResult = { errors: [], warnings: [] };

  if (site.contentState === "sample") {
    result.warnings.push({
      file: siteSource,
      message:
        'contentState is "sample" — development builds are allowed, production verification will fail',
    });
  }

  const { business } = site;
  const nap: Array<[string, unknown]> = [
    ["business.licenseNumber", business.licenseNumber],
    ["business.address.street", business.address.street],
    ["business.address.postalCode", business.address.postalCode],
    ["business.geo.latitude", business.geo.latitude],
    ["business.hours", business.hours],
    ["business.sameAs", business.sameAs],
  ];

  for (const [label, value] of nap) {
    const empty = value === "" || (Array.isArray(value) && value.length === 0);
    if (empty) {
      result.warnings.push({
        file: siteSource,
        message: `${label} is empty — LocalBusiness schema will be incomplete`,
      });
    }
  }

  pages.forEach((page, index) => {
    const file = pageSources[index] ?? `page[${index}]`;
    const sectionTypes = page.sections.map((section) => section.type);
    const hasCta = sectionTypes.some(
      (type) =>
        type === "CTA" ||
        type === "ContactForm" ||
        type === "ContactInfo" ||
        type === "Hero",
    );
    if (!hasCta) {
      result.errors.push({
        file,
        message: "has no call to action (CTA, ContactForm, ContactInfo, or Hero)",
      });
    }

    if (page.internalLinks.length === 0) {
      result.warnings.push({ file, message: "has no internal links" });
    }

    if (page.pageType === "location") {
      const text = JSON.stringify(page).toLowerCase();
      const signals = ["neighborhood", "climate", "permit", "county", "weather", "soil"];
      const found = signals.filter((signal) => text.includes(signal));
      if (found.length < 2) {
        result.errors.push({
          file,
          message: `location page lacks local specificity — needs at least 2 of: ${signals.join(", ")}`,
        });
      }
    }
  });

  return result;
}
