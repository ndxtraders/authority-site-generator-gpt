import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  ContentContractError,
  parseContentBundle,
  type RawPageRecord,
} from "../src/lib/content-schema.ts";

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), "fixtures/content-contract");

function readFixture(name: string): unknown {
  return JSON.parse(readFileSync(join(FIXTURES, name), "utf8"));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function fixtureRecord(name: string): Record<string, unknown> {
  const value = readFixture(name);
  assert.ok(isRecord(value), `${name} must contain an object`);
  return value;
}

function fixtureString(name: string): string {
  const value = readFixture(name);
  if (typeof value !== "string") throw new TypeError(`${name} must contain a string`);
  return value;
}

function stringProperty(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== "string") throw new TypeError(`${key} must be a string`);
  return value;
}

function baseSite() {
  return {
    url: "https://authority.test",
    contentState: "sample",
    business: {
      name: "Authority Test",
      industry: "Testing",
      primaryService: "Contract testing",
      city: "Test City",
      state: "CA",
      region: "Test City, CA",
      phone: "(209) 555-0148",
      email: "hello@authority.test",
      licenseNumber: "",
      priceRange: "$$",
      address: {
        street: "",
        city: "Test City",
        state: "CA",
        postalCode: "",
        country: "US",
      },
      geo: { latitude: "", longitude: "" },
      hours: [],
      sameAs: [],
    },
    branding: { primaryColor: "blue", accentColor: "slate" },
    navigation: { links: [{ label: "Home", href: "/" }], cta: "Contact" },
    footer: { headline: "Test footer", copyright: "Copyright" },
    schema: { businessType: "RoofingContractor" },
    conversion: {
      trackingPhone: "+12095550148",
      displayPhone: "(209) 555-0148",
      thankYouPath: "/",
      model: "considered",
    },
  };
}

function basePage(): Record<string, unknown> {
  return {
    slug: "home",
    pageType: "home",
    seo: {
      title: "Authority Test",
      description: "A valid content-contract test page.",
      canonicalPath: "/",
      indexable: true,
    },
    schema: ["WebSite"],
    internalLinks: [],
    sections: [
      {
        type: "Hero",
        props: {
          eyebrow: "Test",
          headline: "Valid headline",
          subheadline: "Valid subheadline",
          primaryButton: "Primary",
          secondaryButton: "Secondary",
        },
      },
    ],
  };
}

function pageRecord(
  data: unknown = basePage(),
  source = "fixture/home.json",
  routePath = "/",
): RawPageRecord {
  return { source, routePath, data };
}

function expectFailure(
  expected: string,
  site: unknown = baseSite(),
  pages: RawPageRecord[] = [pageRecord()],
): void {
  assert.throws(
    () => parseContentBundle({ source: "fixture/site.json", data: site }, pages),
    (cause: unknown) => {
      assert.ok(cause instanceof ContentContractError);
      assert.match(cause.message, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
      return true;
    },
  );
}

test("a valid site and page parse into typed content", () => {
  const parsed = parseContentBundle(
    { source: "fixture/site.json", data: baseSite() },
    [pageRecord()],
  );

  assert.equal(parsed.site.url, "https://authority.test");
  assert.equal(parsed.pages[0].sections[0].type, "Hero");
});

for (const [fixture, expectedPath] of [
  ["missing-hero-prop.json", "sections.0.props.subheadline"],
  ["missing-faq-prop.json", "sections.0.props.items.0.answer"],
  ["missing-form-prop.json", "sections.0.props.fields.email.placeholder"],
  ["wrong-type.json", "sections.0.props.primaryButton"],
  ["unknown-prop.json", "Unrecognized key"],
] as const) {
  test(`${fixture} fails nested section validation`, () => {
    const page = basePage();
    page.sections = [readFixture(fixture)];
    expectFailure(expectedPath, baseSite(), [pageRecord(page)]);
  });
}

test("malformed E.164 phone fails validation", () => {
  const site = baseSite();
  site.conversion.trackingPhone = fixtureString("malformed-phone.json");
  expectFailure("conversion.trackingPhone", site);
});

test("malformed site origin fails validation", () => {
  const site = baseSite();
  site.url = fixtureString("malformed-url.json");
  expectFailure("url", site);
});

test("non-root-relative redirect fails validation", () => {
  const site = baseSite();
  site.conversion.thankYouPath = fixtureString("malformed-redirect.json");
  expectFailure("conversion.thankYouPath", site);
});

test("unknown conversion model fails validation", () => {
  const site: Record<string, unknown> = baseSite();
  const conversion = site.conversion;
  assert.ok(isRecord(conversion));
  conversion.model = fixtureString("invalid-conversion-model.json");
  expectFailure("conversion.model", site);
});

test("lead-delivery endpoint is rejected from public content", () => {
  const site: Record<string, unknown> = baseSite();
  const conversion = site.conversion;
  assert.ok(isRecord(conversion));
  conversion.formEndpoint = "https://provider.test/leads";
  expectFailure("Unrecognized key", site);
});

test("unknown schema name fails validation", () => {
  const page = basePage();
  page.schema = [fixtureString("invalid-schema-name.json")];
  expectFailure("schema.0", baseSite(), [pageRecord(page)]);
});

test("every page must declare its indexation state", () => {
  const page = basePage();
  const seo = page.seo;
  assert.ok(isRecord(seo));
  delete seo.indexable;
  expectFailure("seo.indexable", baseSite(), [pageRecord(page)]);
});

test("testimonial ratings outside the supported 1–5 range fail validation", () => {
  const page = basePage();
  page.sections = [
    {
      type: "Testimonials",
      props: {
        eyebrow: "Feedback",
        title: "Customer feedback",
        description: "Documented feedback.",
        items: [
          {
            quote: "Clear communication.",
            author: "Test Customer",
            role: "Customer",
            rating: 6,
          },
        ],
      },
    },
  ];
  expectFailure("rating", baseSite(), [pageRecord(page)]);
});

test("slug and page type must agree with the source route", () => {
  const fixture = fixtureRecord("route-mismatch.json");
  const page = basePage();
  page.slug = stringProperty(fixture, "slug");
  page.pageType = stringProperty(fixture, "pageType");
  const seo = page.seo;
  assert.ok(isRecord(seo));
  seo.canonicalPath = stringProperty(fixture, "canonicalPath");
  expectFailure("slug/pageType", baseSite(), [pageRecord(page)]);
});

test("duplicate canonical paths fail relationship validation", () => {
  const fixture = fixtureRecord("duplicate-canonical.json");
  const second = basePage();
  const seo = second.seo;
  assert.ok(isRecord(seo));
  seo.title = stringProperty(fixture, "title");
  seo.canonicalPath = stringProperty(fixture, "canonicalPath");

  expectFailure("duplicate canonical", baseSite(), [
    pageRecord(),
    pageRecord(second, "fixture/second-home.json", "/"),
  ]);
});

test("duplicate titles fail relationship validation", () => {
  const fixture = fixtureRecord("duplicate-title.json");
  const second = basePage();
  second.slug = stringProperty(fixture, "slug");
  second.pageType = stringProperty(fixture, "pageType");
  const seo = second.seo;
  assert.ok(isRecord(seo));
  seo.canonicalPath = stringProperty(fixture, "canonicalPath");

  expectFailure("duplicate title", baseSite(), [
    pageRecord(),
    pageRecord(second, "fixture/about.json", "/about"),
  ]);
});

test("broken internal links fail relationship validation", () => {
  const page = basePage();
  page.internalLinks = [fixtureString("broken-internal-link.json")];
  expectFailure("does not resolve to known content", baseSite(), [pageRecord(page)]);
});
