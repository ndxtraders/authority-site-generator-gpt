import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  PageContentSchema,
  SiteConfigSchema,
  type PageContent,
} from "../src/lib/content-schema.ts";
import { buildSchema } from "../src/lib/schema/index.ts";
import { serializeJsonLd } from "../src/lib/schema/serialize.ts";
import type { JsonLdGraph } from "../src/lib/schema/types.ts";

const FIXTURE_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  "fixtures/schema/representative-content.json",
);

interface SchemaFixture {
  site: Record<string, unknown>;
  pages: Record<string, unknown>;
  expected: Record<string, string>;
}

const fixture = JSON.parse(readFileSync(FIXTURE_PATH, "utf8")) as SchemaFixture;
const site = SiteConfigSchema.parse(fixture.site);
const pages = Object.fromEntries(
  Object.entries(fixture.pages).map(([key, page]) => [key, PageContentSchema.parse(page)]),
) as Record<string, PageContent>;

function graphByType(graphs: JsonLdGraph[], type: string): JsonLdGraph {
  const graph = graphs.find((candidate) => candidate["@type"] === type);
  assert.ok(graph, `expected ${type} graph`);
  return graph;
}

function referenceId(value: unknown): string | undefined {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return undefined;
  const id = (value as Record<string, unknown>)["@id"];
  return typeof id === "string" ? id : undefined;
}

test("JSON-LD serialization keeps script-closing content inside the payload", () => {
  const payload = {
    "@context": "https://schema.org",
    "@graph": [{ "@type": "Thing", name: "</script><script>alert('x')</script>" }],
  };

  const serialized = serializeJsonLd(payload);

  assert.ok(!serialized.toLowerCase().includes("</script"));
  assert.match(serialized, /\\u003c\/script\\u003e/);
  assert.deepEqual(JSON.parse(serialized), payload);
});

test("home graph connects WebSite publisher to the stable business entity", () => {
  const graphs = buildSchema(pages.home, site);
  assert.deepEqual(
    graphs.map((graph) => graph["@type"]),
    ["HomeAndConstructionBusiness", "BreadcrumbList", "WebSite"],
  );
  assert.equal(graphs[0]["@id"], fixture.expected.businessId);
  const website = graphByType(graphs, "WebSite");
  assert.equal(website["@id"], fixture.expected.websiteId);
  assert.equal(referenceId(website.publisher), fixture.expected.businessId);
});

test("service graph references the same business as its provider", () => {
  const graphs = buildSchema(pages.service, site);
  assert.deepEqual(
    graphs.map((graph) => graph["@type"]),
    ["HomeAndConstructionBusiness", "BreadcrumbList", "Service"],
  );
  const service = graphByType(graphs, "Service");
  assert.equal(service["@id"], fixture.expected.serviceId);
  assert.equal(referenceId(service.provider), fixture.expected.businessId);
});

test("FAQ graph contains only content-backed questions", () => {
  const graphs = buildSchema(pages.faq, site);
  assert.deepEqual(
    graphs.map((graph) => graph["@type"]),
    ["HomeAndConstructionBusiness", "BreadcrumbList", "FAQPage"],
  );
  const faq = graphByType(graphs, "FAQPage");
  assert.ok(Array.isArray(faq.mainEntity));
  assert.equal(faq.mainEntity.length, 1);
});

test("location graph uses the verified area without changing the business identity", () => {
  const graphs = buildSchema(pages.location, site, {
    areaServed: fixture.expected.locationAreaServed,
  });
  assert.deepEqual(
    graphs.map((graph) => graph["@type"]),
    ["HomeAndConstructionBusiness", "BreadcrumbList"],
  );
  assert.equal(graphs[0]["@id"], fixture.expected.businessId);
  assert.equal(graphs[0].areaServed, fixture.expected.locationAreaServed);
});

test("verified ratings and reviews identify the business they describe", () => {
  const graphs = buildSchema(pages.ratedTestimonials, site);
  assert.deepEqual(
    graphs.map((graph) => graph["@type"]),
    ["HomeAndConstructionBusiness", "BreadcrumbList", "AggregateRating", "Review"],
  );

  const aggregate = graphByType(graphs, "AggregateRating");
  const review = graphByType(graphs, "Review");
  assert.equal(aggregate["@id"], fixture.expected.aggregateRatingId);
  assert.equal(review["@id"], fixture.expected.reviewId);
  assert.equal(referenceId(aggregate.itemReviewed), fixture.expected.businessId);
  assert.equal(referenceId(review.itemReviewed), fixture.expected.businessId);
});

test("sample content cannot emit rating or review claims", () => {
  const sampleSite = SiteConfigSchema.parse({ ...fixture.site, contentState: "sample" });
  const graphs = buildSchema(pages.ratedTestimonials, sampleSite);

  assert.ok(!graphs.some((graph) => graph["@type"] === "AggregateRating"));
  assert.ok(!graphs.some((graph) => graph["@type"] === "Review"));
});
