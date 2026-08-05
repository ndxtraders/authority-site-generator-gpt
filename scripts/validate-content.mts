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
  ProductionVerificationSchema,
  parseContentBundle,
  type PageContent,
  type RawPageRecord,
} from "../src/lib/content-schema.ts";
import {
  assessParsedContentQuality,
  scanAuthoredContent,
} from "../src/lib/content-quality.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = join(ROOT, "content");
const PAGES_DIR = join(CONTENT, "pages");
const PRODUCTION_SOURCE = "content/production.json";

const errors: string[] = [];
const warnings: string[] = [];

const error = (file: string, message: string) => errors.push(`${file} — ${message}`);
const warn = (file: string, message: string) => warnings.push(`${file} — ${message}`);

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
const productionData = readJson(join(CONTENT, "production.json"));
const pageFiles = readdirSync(PAGES_DIR).filter((file) => file.endsWith(".json")).sort();
const pageRecords: RawPageRecord[] = pageFiles.map((file) => {
  const slug = file.slice(0, -".json".length);
  return {
    source: `content/pages/${file}`,
    routePath: slug === "home" ? "/" : `/${slug}`,
    data: readJson(join(PAGES_DIR, file)),
  };
});

for (const [value, source] of [
  [siteData, siteSource],
  ...pageRecords.map((record) => [record.data, record.source]),
  [productionData, PRODUCTION_SOURCE],
] as Array<[unknown, string]>) {
  const result = scanAuthoredContent(value, source);
  result.errors.forEach((issue) => error(issue.file, issue.message));
  result.warnings.forEach((issue) => warn(issue.file, issue.message));
}

if (!hasInvalidJson) {
  const productionResult = ProductionVerificationSchema.safeParse(productionData);
  if (!productionResult.success) {
    for (const issue of productionResult.error.issues) {
      error(
        PRODUCTION_SOURCE,
        `${issue.path.map(String).join(".") || "value"}: ${issue.message}`,
      );
    }
  }
}

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
  const result = assessParsedContentQuality(
    parsed.site,
    parsed.pages,
    pageRecords.map((record) => record.source),
    siteSource,
  );
  result.errors.forEach((issue) => error(issue.file, issue.message));
  result.warnings.forEach((issue) => warn(issue.file, issue.message));
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
