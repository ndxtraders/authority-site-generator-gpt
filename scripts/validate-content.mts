/**
 * Content validator — the anti-thin gate.
 *
 * Runs as `prebuild`, so a content defect fails the build rather than shipping.
 * Every rule here exists because the defect it catches was found in real output:
 * the reference locksmith site shipped "Modesto, Fl" on all 20 pages, eight
 * "Content coming soon" pages, and a placeholder phone number; this framework
 * shipped four pages all claiming the home page as canonical.
 *
 * Errors fail the build. Warnings are printed and do not.
 *
 * Run directly: `npm run validate`
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { isSectionType, SECTION_TYPES } from "../src/lib/section-types.ts";

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

function scanStrings(
  value: unknown,
  file: string,
  path = "",
): void {
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
    value.forEach((item, i) => scanStrings(item, file, `${path}[${i}]`));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      scanStrings(child, file, path ? `${path}.${key}` : key);
    }
  }
}

// ---------------------------------------------------------------------------
// Load
// ---------------------------------------------------------------------------

function readJson(path: string): Record<string, unknown> {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (cause) {
    errors.push(`${path} — invalid JSON: ${(cause as Error).message}`);
    return {};
  }
}

if (!existsSync(PAGES_DIR)) {
  console.error(`✖ content/pages/ not found at ${PAGES_DIR}`);
  process.exit(1);
}

const site = readJson(join(CONTENT, "site.json"));
const pageFiles = readdirSync(PAGES_DIR).filter((f) => f.endsWith(".json"));
const pages = pageFiles.map((f) => ({
  file: `content/pages/${f}`,
  data: readJson(join(PAGES_DIR, f)),
}));

// ---------------------------------------------------------------------------
// Site-level rules
// ---------------------------------------------------------------------------

scanStrings(site, "content/site.json");

const business = (site.business ?? {}) as Record<string, never>;

if (!site.url) error("content/site.json", "missing url");
else if (String(site.url).endsWith("/"))
  error("content/site.json", "url must not have a trailing slash");

// Incomplete NAP degrades LocalBusiness schema but should not block a build
// while the framework is still pre-launch.
const nap: Array<[string, unknown]> = [
  ["business.licenseNumber", business.licenseNumber],
  ["business.address.street", (business.address as Record<string, unknown>)?.street],
  ["business.address.postalCode", (business.address as Record<string, unknown>)?.postalCode],
  ["business.geo.latitude", (business.geo as Record<string, unknown>)?.latitude],
  ["business.hours", business.hours],
  ["business.sameAs", business.sameAs],
];
for (const [label, value] of nap) {
  const empty = value === undefined || value === "" || (Array.isArray(value) && value.length === 0);
  if (empty) warn("content/site.json", `${label} is empty — LocalBusiness schema will be incomplete`);
}

// ---------------------------------------------------------------------------
// Page-level rules
// ---------------------------------------------------------------------------

const titles = new Map<string, string[]>();
const canonicals = new Map<string, string[]>();
const knownPaths = new Set<string>();

// First pass: collect every canonical path so internal links can be resolved.
for (const { data } of pages) {
  const seo = (data.seo ?? {}) as Record<string, string>;
  if (seo.canonicalPath) knownPaths.add(seo.canonicalPath);
}

for (const { file, data } of pages) {
  scanStrings(data, file);

  const seo = (data.seo ?? {}) as Record<string, string>;

  // Required SEO fields
  for (const field of ["title", "description", "canonicalPath"] as const) {
    if (!seo[field] || !String(seo[field]).trim()) {
      error(file, `missing seo.${field}`);
    }
  }

  if (seo.canonicalPath && !seo.canonicalPath.startsWith("/")) {
    error(file, `seo.canonicalPath must be root-relative, got "${seo.canonicalPath}"`);
  }

  if (seo.title) titles.set(seo.title, [...(titles.get(seo.title) ?? []), file]);
  if (seo.canonicalPath) {
    canonicals.set(seo.canonicalPath, [...(canonicals.get(seo.canonicalPath) ?? []), file]);
  }

  // Sections
  const sections = data.sections;
  if (!Array.isArray(sections) || sections.length === 0) {
    error(file, "has no sections");
  } else {
    sections.forEach((section: unknown, i: number) => {
      const s = section as { type?: unknown; props?: unknown };
      if (typeof s.type !== "string") {
        error(file, `sections[${i}] has no type`);
        return;
      }
      if (!isSectionType(s.type)) {
        error(
          file,
          `sections[${i}] unknown type "${s.type}" — known types: ${SECTION_TYPES.join(", ")}`,
        );
      }
      if (!s.props || typeof s.props !== "object") {
        error(file, `sections[${i}] (${s.type}) has no props`);
      }
    });

    // Every page needs a way to convert.
    const types = sections.map((s: { type?: string }) => s.type);
    const hasCta = types.some(
      (t) => t === "CTA" || t === "ContactForm" || t === "ContactInfo" || t === "Hero",
    );
    if (!hasCta) error(file, "has no call to action (CTA, ContactForm, ContactInfo, or Hero)");
  }

  // Internal links must resolve
  const links = Array.isArray(data.internalLinks) ? data.internalLinks : [];
  for (const link of links as string[]) {
    if (!knownPaths.has(link)) {
      warn(file, `internalLinks target "${link}" does not resolve to a known page yet`);
    }
  }
  if (links.length === 0) warn(file, "has no internal links");

  // Location pages must carry genuine local detail (PRD §7).
  if (data.pageType === "location") {
    const text = JSON.stringify(data).toLowerCase();
    const signals = ["neighborhood", "climate", "permit", "county", "weather", "soil"];
    const found = signals.filter((s) => text.includes(s));
    if (found.length < 2) {
      error(
        file,
        `location page lacks local specificity — needs at least 2 of: ${signals.join(", ")}`,
      );
    }
  }
}

// Cross-page uniqueness — the defect that made 3 of 4 pages non-indexable.
for (const [title, files] of titles) {
  if (files.length > 1) {
    error(files.join(" + "), `duplicate seo.title "${title}"`);
  }
}
for (const [path, files] of canonicals) {
  if (files.length > 1) {
    error(files.join(" + "), `duplicate seo.canonicalPath "${path}"`);
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

const pageCount = pages.length;

if (warnings.length) {
  console.warn(`\n⚠  ${warnings.length} warning${warnings.length === 1 ? "" : "s"}`);
  for (const w of warnings) console.warn(`   ${w}`);
}

if (errors.length) {
  console.error(`\n✖ Content validation failed — ${errors.length} error${errors.length === 1 ? "" : "s"}\n`);
  for (const e of errors) console.error(`   ${e}`);
  console.error("");
  process.exit(1);
}

console.log(`\n✓ Content valid — ${pageCount} page${pageCount === 1 ? "" : "s"} checked, ${warnings.length} warning${warnings.length === 1 ? "" : "s"}\n`);
