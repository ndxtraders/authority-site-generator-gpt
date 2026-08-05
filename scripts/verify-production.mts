/**
 * Production truth gate. This command is intentionally separate from the
 * development validator: sample content may build, but it may not deploy.
 *
 * Run directly: npm run verify:production
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import {
  ContentContractError,
  ProductionVerificationSchema,
  parseContentBundle,
  type RawPageRecord,
} from "../src/lib/content-schema.ts";
import { assessProductionReadiness } from "../src/lib/production-readiness.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = join(ROOT, "content");
const PAGES_DIR = join(CONTENT, "pages");
const PUBLIC_DIR = join(ROOT, "public");

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

function listFiles(directory: string): string[] {
  if (!existsSync(directory)) return [];
  const files: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...listFiles(path));
    else if (entry.isFile()) files.push(relative(PUBLIC_DIR, path));
  }
  return files;
}

try {
  const pageRecords: RawPageRecord[] = readdirSync(PAGES_DIR)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => {
      const slug = file.slice(0, -".json".length);
      return {
        source: `content/pages/${file}`,
        routePath: slug === "home" ? "/" : `/${slug}`,
        data: readJson(join(PAGES_DIR, file)),
      };
    });

  const parsed = parseContentBundle(
    { source: "content/site.json", data: readJson(join(CONTENT, "site.json")) },
    pageRecords,
  );
  const verification = ProductionVerificationSchema.parse(
    readJson(join(CONTENT, "production.json")),
  );
  const issues = assessProductionReadiness({
    site: parsed.site,
    pages: parsed.pages.map((page, index) => ({
      source: pageRecords[index].source,
      page,
    })),
    verification,
    publicFiles: listFiles(PUBLIC_DIR),
    // Operational verification is the only non-application reader of this
    // deployment value. It never logs or serializes the endpoint.
    leadDeliveryEndpoint: process.env.LEAD_DELIVERY_ENDPOINT,
  });

  if (issues.length > 0) {
    console.error(`\n✖ Production verification failed — ${issues.length} blocker${issues.length === 1 ? "" : "s"}\n`);
    for (const blocker of issues) console.error(`   [${blocker.code}] ${blocker.message}`);
    console.error("");
    process.exit(1);
  }

  console.log("\n✓ Production verification passed\n");
} catch (cause) {
  if (cause instanceof ContentContractError) {
    console.error(`\n✖ Production verification could not parse content\n\n${cause.message}\n`);
    process.exit(1);
  }
  const message = cause instanceof Error ? cause.message : "Unknown verification error";
  console.error(`\n✖ Production verification could not run\n\n${message}\n`);
  process.exit(1);
}
