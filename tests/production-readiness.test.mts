import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  PageContentSchema,
  ProductionVerificationSchema,
  SiteConfigSchema,
} from "../src/lib/content-schema.ts";
import {
  assessProductionReadiness,
  type ProductionReadinessInput,
} from "../src/lib/production-readiness.ts";

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), "fixtures/production-readiness");
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

interface BlockerFixture {
  name: string;
  path: string;
  value: unknown;
  expectedCode: string;
}

function readFixture(name: string): unknown {
  return JSON.parse(readFileSync(join(FIXTURES, name), "utf8"));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function cloneFixture(): Record<string, unknown> {
  const fixture = readFixture("verified.json");
  assert.ok(isRecord(fixture));
  return structuredClone(fixture);
}

function setPath(target: Record<string, unknown>, path: string, value: unknown): void {
  const segments = path.split(".");
  let current: unknown = target;
  for (const segment of segments.slice(0, -1)) {
    assert.ok(current !== null && typeof current === "object");
    current = Array.isArray(current)
      ? current[Number(segment)]
      : (current as Record<string, unknown>)[segment];
  }
  assert.ok(current !== null && typeof current === "object");
  const finalSegment = segments.at(-1);
  assert.ok(finalSegment);
  if (Array.isArray(current)) current[Number(finalSegment)] = value;
  else (current as Record<string, unknown>)[finalSegment] = value;
}

function parseInput(fixture: Record<string, unknown>): ProductionReadinessInput {
  assert.ok(Array.isArray(fixture.pages));
  return {
    site: SiteConfigSchema.parse(fixture.site),
    pages: fixture.pages.map((record) => {
      assert.ok(isRecord(record));
      const source = record.source;
      if (typeof source !== "string") throw new TypeError("fixture source must be a string");
      return {
        source,
        page: PageContentSchema.parse(record.page),
      };
    }),
    verification: ProductionVerificationSchema.parse(fixture.verification),
    publicFiles: fixture.publicFiles as string[],
    leadDeliveryEndpoint:
      typeof fixture.leadDeliveryEndpoint === "string"
        ? fixture.leadDeliveryEndpoint
        : undefined,
  };
}

test("verified production fixture passes every readiness check", () => {
  assert.deepEqual(assessProductionReadiness(parseInput(cloneFixture())), []);
});

test("current sample is blocked with every detected trust claim inventoried", () => {
  const pagesDirectory = join(ROOT, "content/pages");
  const pages = readdirSync(pagesDirectory)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => ({
      source: `content/pages/${file}`,
      page: PageContentSchema.parse(
        JSON.parse(readFileSync(join(pagesDirectory, file), "utf8")),
      ),
    }));
  const issues = assessProductionReadiness({
    site: SiteConfigSchema.parse(
      JSON.parse(readFileSync(join(ROOT, "content/site.json"), "utf8")),
    ),
    pages,
    verification: ProductionVerificationSchema.parse(
      JSON.parse(readFileSync(join(ROOT, "content/production.json"), "utf8")),
    ),
    publicFiles: readdirSync(join(ROOT, "public")),
  });

  assert.ok(issues.some((candidate) => candidate.code === "content-state"));
  assert.ok(!issues.some((candidate) => candidate.code === "unsupported-claim"));
  assert.ok(!issues.some((candidate) => candidate.code === "claim-inventory"));
});

const blockerFixtures = readFixture("blockers.json");
assert.ok(Array.isArray(blockerFixtures));

for (const blocker of blockerFixtures as BlockerFixture[]) {
  test(`${blocker.name} fails production verification`, () => {
    const fixture = cloneFixture();
    setPath(fixture, blocker.path, blocker.value);
    const issues = assessProductionReadiness(parseInput(fixture));
    assert.ok(
      issues.some((candidate) => candidate.code === blocker.expectedCode),
      `expected ${blocker.expectedCode}, received ${issues.map((candidate) => candidate.code).join(", ")}`,
    );
  });
}

test("the production evidence contract rejects unknown fields", () => {
  const fixture = cloneFixture();
  assert.ok(isRecord(fixture.verification));
  fixture.verification.untrackedApproval = true;
  assert.throws(() => ProductionVerificationSchema.parse(fixture.verification));
});
