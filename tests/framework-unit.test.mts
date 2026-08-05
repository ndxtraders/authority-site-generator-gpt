import assert from "node:assert/strict";
import test from "node:test";

import { getAllPages, getPage, getPagesByType, getSite } from "../src/lib/content.ts";
import { getAllLegalPages, getLegalPage, LEGAL_SLUGS } from "../src/lib/legal.ts";
import { buildPageMetadata } from "../src/lib/metadata.ts";
import { absoluteUrl, siteOrigin } from "../src/lib/url.ts";

test("content loader exposes only parsed, known pages", () => {
  const site = getSite();
  const pages = getAllPages();

  assert.equal(site.url, "https://roofrepairmodesto.com");
  assert.deepEqual(
    pages.map((page) => page.slug),
    ["home", "about", "services", "contact", "thank-you"],
  );
  assert.equal(getPage("contact").pageType, "contact");
  assert.deepEqual(getPagesByType("home").map((page) => page.slug), ["home"]);
  assert.throws(
    () => getPage("missing" as Parameters<typeof getPage>[0]),
    /No content found for page "missing"/,
  );
});

test("URL assembly uses the validated site origin and rejects relative input", () => {
  assert.equal(siteOrigin(), "https://roofrepairmodesto.com");
  assert.equal(absoluteUrl("/"), "https://roofrepairmodesto.com");
  assert.equal(absoluteUrl("/contact"), "https://roofrepairmodesto.com/contact");
  assert.throws(() => absoluteUrl("contact"), /expects a root-relative path/);
});

test("metadata stays aligned across canonical, social, and indexation fields", () => {
  const contact = buildPageMetadata(getPage("contact"));
  assert.equal(contact.title, "Contact Us | Roof Repair Modesto");
  assert.equal(contact.alternates?.canonical, "/contact");
  assert.equal(contact.openGraph?.url, "/contact");
  assert.equal(contact.twitter?.title, contact.title);
  assert.equal(contact.robots, undefined);

  const thankYou = buildPageMetadata(getPage("thank-you"));
  assert.equal(thankYou.alternates?.canonical, "/thank-you");
  assert.deepEqual(thankYou.robots, {
    index: false,
    follow: true,
    googleBot: { index: false, follow: true },
  });
});

test("legal generation produces the complete, unique content-backed set", () => {
  const site = getSite();
  const pages = getAllLegalPages(site);

  assert.deepEqual(pages.map(({ page }) => page.slug), [...LEGAL_SLUGS]);
  assert.equal(new Set(pages.map(({ page }) => page.seo.title)).size, LEGAL_SLUGS.length);
  assert.equal(new Set(pages.map(({ page }) => page.seo.canonicalPath)).size, LEGAL_SLUGS.length);

  const privacy = getLegalPage("privacy-policy", site);
  assert.match(JSON.stringify(privacy.blocks), new RegExp(site.business.email));
  assert.equal(privacy.page.seo.indexable, true);
});
