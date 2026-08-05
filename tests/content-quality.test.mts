import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { PageContentSchema, SiteConfigSchema } from "../src/lib/content-schema.ts";
import {
  assessParsedContentQuality,
  scanAuthoredContent,
} from "../src/lib/content-quality.ts";

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), "fixtures/content-quality");

function readFixture(name: string): unknown {
  return JSON.parse(readFileSync(join(FIXTURES, name), "utf8"));
}

const site = SiteConfigSchema.parse({
  url: "https://authority.test",
  contentState: "verified",
  business: {
    name: "Authority Test",
    industry: "Testing",
    primaryService: "Contract testing",
    city: "Test City",
    state: "CA",
    region: "Test City, CA",
    phone: "(209) 555-0148",
    email: "hello@authority.test",
    licenseNumber: "TEST-1",
    priceRange: "$$",
    address: {
      street: "1 Test Way",
      city: "Test City",
      state: "CA",
      postalCode: "95350",
      country: "US"
    },
    geo: { latitude: "37.6", longitude: "-121.0" },
    hours: ["Mo-Fr 08:00-17:00"],
    sameAs: ["https://social.test/authority"]
  },
  branding: { primaryColor: "blue", accentColor: "slate" },
  navigation: { links: [{ label: "Home", href: "/" }], cta: "Contact" },
  footer: { headline: "Test footer", copyright: "Copyright" },
  schema: { businessType: "HomeAndConstructionBusiness" },
  conversion: {
    trackingPhone: "+12095550148",
    displayPhone: "(209) 555-0148",
    thankYouPath: "/thank-you",
    model: "considered"
  }
});

test("placeholder fixture reports each authored failure reason", () => {
  const result = scanAuthoredContent(
    readFixture("placeholder-content.json"),
    "fixture/placeholder-content.json",
  );

  assert.equal(result.errors.length, 2);
  assert.match(result.errors[0].message, /hero\.headline.*Content coming soon/);
  assert.match(result.errors[1].message, /hero\.description.*TODO\/TBD/);
});

test("form placeholder example addresses remain allowed", () => {
  const result = scanAuthoredContent(
    { fields: { email: { placeholder: "you@example.com" } } },
    "fixture/form.json",
  );

  assert.deepEqual(result.errors, []);
});

test("missing-CTA fixture fails with the actionable validator reason", () => {
  const page = PageContentSchema.parse(readFixture("missing-cta.json"));
  const result = assessParsedContentQuality(site, [page], ["fixture/missing-cta.json"], "fixture/site.json");

  assert.equal(result.errors.length, 1);
  assert.match(result.errors[0].message, /has no call to action/);
});

test("thin-location fixture fails with the local-specificity reason", () => {
  const page = PageContentSchema.parse(readFixture("thin-location.json"));
  const result = assessParsedContentQuality(site, [page], ["fixture/thin-location.json"], "fixture/site.json");

  assert.equal(result.errors.length, 1);
  assert.match(result.errors[0].message, /lacks local specificity/);
  assert.match(result.errors[0].message, /neighborhood, climate, permit/);
});
