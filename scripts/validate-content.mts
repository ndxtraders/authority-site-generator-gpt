/**
 * Content validator — runtime contract plus the anti-thin quality gate.
 *
 * Runs as `prebuild`, so a content defect fails the build rather than shipping.
 * Runtime shape, format, and relationship rules live in `content-schema.ts` and
 * are shared with the Next loader. This file adds authored-content quality rules
 * and development warnings.
 *
 * Run directly: `npm run validate`
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  ContentContractError,
  parseContentBundle,
  type PageContent,
  type RawPageRecord,
} from "../src/lib/content-schema.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = join(ROOT, "content");
const PAGES_DIR = join(CONTENT, "pages");

const errors: string[] = [];
const warnings: string[] = [];

const error = (file: string, message: string) => errors.push(`${file} — ${message}`);
const warn = (file: string, message: string) => warnings.push(`${file} — ${message}`);

// ---------------------------------------------------------------------------
// Placeholder detection
// ---------------------------------------------------------------------------

interface ContentPattern {
  pattern: RegExp;
  label: string;
  /** Content paths where this pattern is legitimate rather than a defect. */
  exempt?: RegExp;
}

/** Hard failures. Content that is definitively unfinished. */
const PLACEHOLDER_PATTERNS: ContentPattern[] = [
  { pattern: /555-5555|555 5555/i, label: "placeholder phone number (555-5555)" },
  { pattern: /content coming soon/i, label: '"Content coming soon" placeholder' },
  { pattern: /lorem ipsum/i, label: "lorem ipsum filler" },
  { pattern: /\bTODO\b|\bTBD\b/, label: "TODO/TBD marker" },
  {
    pattern: /example\.com/i,
    label: "example.com placeholder",
    // Form inputs are supposed to show example text — "you@example.com" in a
    // placeholder attribute is correct UI, not unfinished content.
    exempt: /\.placeholder$/,
  },
  { pattern: /\byour (business|company) name\b/i, label: "unreplaced template token" },
];

/** Softer signals. Real but suspicious — reported, not fatal. */
const SUSPICIOUS_PATTERNS: Array<[RegExp, string]> = [
  [/\(\d{3}\)\s*555-\d{4}/, "phone number uses the 555 reserved range"],
  [/\b\d{3}-555-\d{4}\b/, "phone number uses the 555 reserved range"],
];

function scanStrings(value: unknown, file: string, path = ""): void {
  if (typeof value === "string") {
    for (const { pattern, label, exempt } of PLACEHOLDER_PATTERNS) {
      if (exempt?.test(path)) continue;
      if (pattern.test(value)) error(file, `${path || "value"} contains ${label}`);
    }
    for (const [pattern, label] of SUSPICIOUS_PATTERNS) {
      if (pattern.test(value)) warn(file, `${path || "value"}: ${label}`);
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => scanStrings(item, file, `${path}[${index}]`));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      scanStrings(child, file, path ? `${path}.${key}` : key);
    }
  }
}

// ---------------------------------------------------------------------------
// Load and parse through the shared executable contract
// ---------------------------------------------------------------------------

let hasInvalidJson = false;

function readJson(path: string): unknown {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (cause) {
    hasInvalidJson = true;
    errors.push(`${path} — invalid JSON: ${(cause as Error).message}`);
    return undefined;
  }
}

if (!existsSync(PAGES_DIR)) {
  console.error(`✖ content/pages/ not found at ${PAGES_DIR}`);
  process.exit(1);
}

const siteSource = "content/site.json";
const siteData = readJson(join(CONTENT, "site.json"));
const pageFiles = readdirSync(PAGES_DIR).filter((file) => file.endsWith(".json")).sort();
const pageRecords: RawPageRecord[] = pageFiles.map((file) => {
  const slug = file.slice(0, -".json".length);
  return {
    source: `content/pages/${file}`,
    routePath: slug === "home" ? "/" : `/${slug}`,
    data: readJson(join(PAGES_DIR, file)),
  };
});

scanStrings(siteData, siteSource);
for (const record of pageRecords) scanStrings(record.data, record.source);

let parsed:
  | {
      site: import("../src/lib/content-schema.ts").SiteConfig;
      pages: PageContent[];
    }
  | undefined;

if (!hasInvalidJson) {
  try {
    parsed = parseContentBundle({ source: siteSource, data: siteData }, pageRecords);
  } catch (cause) {
    if (cause instanceof ContentContractError) {
      for (const issue of cause.issues) {
        error(issue.source, `${issue.path || "value"}: ${issue.message}`);
      }
    } else {
      throw cause;
    }
  }
}

// ---------------------------------------------------------------------------
// Quality rules applied only after the runtime contract succeeds
// ---------------------------------------------------------------------------

if (parsed) {
  const { business } = parsed.site;
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
    if (empty) warn(siteSource, `${label} is empty — LocalBusiness schema will be incomplete`);
  }

  parsed.pages.forEach((page, index) => {
    const file = pageRecords[index].source;
    const sectionTypes = page.sections.map((section) => section.type);
    const hasCta = sectionTypes.some(
      (type) =>
        type === "CTA" ||
        type === "ContactForm" ||
        type === "ContactInfo" ||
        type === "Hero",
    );
    if (!hasCta) error(file, "has no call to action (CTA, ContactForm, ContactInfo, or Hero)");

    if (page.internalLinks.length === 0) warn(file, "has no internal links");

    // Location pages must carry genuine local detail (PRD §7).
    if (page.pageType === "location") {
      const text = JSON.stringify(page).toLowerCase();
      const signals = ["neighborhood", "climate", "permit", "county", "weather", "soil"];
      const found = signals.filter((signal) => text.includes(signal));
      if (found.length < 2) {
        error(
          file,
          `location page lacks local specificity — needs at least 2 of: ${signals.join(", ")}`,
        );
      }
    }
  });
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

const pageCount = pageRecords.length;

if (warnings.length) {
  console.warn(`\n⚠  ${warnings.length} warning${warnings.length === 1 ? "" : "s"}`);
  for (const warning of warnings) console.warn(`   ${warning}`);
}

if (errors.length) {
  console.error(`\n✖ Content validation failed — ${errors.length} error${errors.length === 1 ? "" : "s"}\n`);
  for (const contentError of errors) console.error(`   ${contentError}`);
  console.error("");
  process.exit(1);
}

console.log(
  `\n✓ Content valid — ${pageCount} page${pageCount === 1 ? "" : "s"} checked, ${warnings.length} warning${warnings.length === 1 ? "" : "s"}\n`,
);
