import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const ROOT = process.cwd();
const APP_OUTPUT = join(ROOT, ".next/server/app");
const STATIC_OUTPUT = join(ROOT, ".next/static");
const ORIGIN = "https://roofrepairmodesto.com";

const ROUTES = [
  { path: "/", file: "index.html" },
  { path: "/about", file: "about.html" },
  { path: "/services", file: "services.html" },
  { path: "/contact", file: "contact.html" },
  { path: "/thank-you", file: "thank-you.html" },
  { path: "/privacy-policy", file: "privacy-policy.html" },
  { path: "/terms-conditions", file: "terms-conditions.html" },
  { path: "/disclaimer", file: "disclaimer.html" },
  { path: "/accessibility", file: "accessibility.html" },
] as const;

const INDEXABLE_PATHS = ROUTES.map((route) => route.path).filter(
  (path) => path !== "/thank-you",
);

const FORBIDDEN_BROWSER_VALUES = [
  "LEAD_DELIVERY_ENDPOINT",
  "LEAD_DELIVERY_AUTHORIZATION",
  "https://h6-build-sentinel.invalid/leads",
  "Bearer h6-build-sentinel-authorization",
] as const;

function output(path: string): string {
  return readFileSync(join(APP_OUTPUT, path), "utf8");
}

function firstMatch(html: string, pattern: RegExp, label: string): string {
  const match = pattern.exec(html);
  assert.ok(match?.[1], `expected ${label}`);
  return match[1];
}

function canonicalFor(path: string): string {
  return path === "/" ? ORIGIN : `${ORIGIN}${path}`;
}

function filesRecursively(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? filesRecursively(path) : [path];
  });
}

function assertNoServerConfiguration(content: Buffer, path: string): void {
  for (const value of FORBIDDEN_BROWSER_VALUES) {
    assert.ok(!content.includes(Buffer.from(value)), `${value} leaked into ${path}`);
  }
}

test("production build emits every required route with unique titles and canonicals", () => {
  const titles = new Set<string>();
  const canonicals = new Set<string>();

  for (const route of ROUTES) {
    const html = output(route.file);
    const title = firstMatch(html, /<title>([^<]+)<\/title>/, `${route.path} title`);
    const canonical = firstMatch(
      html,
      /<link rel="canonical" href="([^"]+)"\/?\s*>/,
      `${route.path} canonical`,
    );

    assert.equal(canonical, canonicalFor(route.path));
    assert.ok(!titles.has(title), `duplicate built title: ${title}`);
    assert.ok(!canonicals.has(canonical), `duplicate built canonical: ${canonical}`);
    titles.add(title);
    canonicals.add(canonical);
  }
});

test("built pages contain safe, connected JSON-LD and telephone links", () => {
  for (const route of ROUTES) {
    const html = output(route.file);
    const serialized = firstMatch(
      html,
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
      `${route.path} JSON-LD`,
    );
    const payload = JSON.parse(serialized) as {
      "@context": string;
      "@graph": Array<Record<string, unknown>>;
    };

    assert.equal(payload["@context"], "https://schema.org");
    assert.ok(Array.isArray(payload["@graph"]));
    assert.ok(
      payload["@graph"].some(
        (graph) => graph["@id"] === `${ORIGIN}/#business`,
      ),
      `${route.path} must retain the stable business entity`,
    );
    assert.ok(!serialized.toLowerCase().includes("</script"));
    assert.match(html, /href="tel:\+12095550148"/);
  }

  const homePayload = JSON.parse(
    firstMatch(
      output("index.html"),
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
      "home JSON-LD",
    ),
  ) as { "@graph": Array<Record<string, unknown>> };
  const website = homePayload["@graph"].find((graph) => graph["@type"] === "WebSite");
  assert.deepEqual(website?.publisher, { "@id": `${ORIGIN}/#business` });
  assert.ok(!homePayload["@graph"].some((graph) => graph["@type"] === "Review"));
  assert.ok(!homePayload["@graph"].some((graph) => graph["@type"] === "AggregateRating"));
});

test("indexation, sitemap, and manifest stay truthful and asset-backed", () => {
  const thankYou = output("thank-you.html");
  assert.match(thankYou, /<meta name="robots" content="noindex, follow"\/?\s*>/);

  for (const route of ROUTES.filter(({ path }) => path !== "/thank-you")) {
    assert.doesNotMatch(output(route.file), /<meta name="robots" content="noindex/);
  }

  const sitemap = output("sitemap.xml.body");
  assert.doesNotMatch(sitemap, /<lastmod>/);
  assert.doesNotMatch(sitemap, /\/thank-you<\/loc>/);
  for (const path of INDEXABLE_PATHS) {
    assert.match(sitemap, new RegExp(`<loc>${canonicalFor(path)}</loc>`));
  }

  const manifest = JSON.parse(output("manifest.webmanifest.body")) as {
    icons?: Array<{ src?: string; type?: string }>;
  };
  assert.deepEqual(manifest.icons, [
    { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
  ]);
  assert.ok(existsSync(join(APP_OUTPUT, "favicon.ico.body")));
});

test("browser-delivered build output contains no server-only configuration", () => {
  const payloadFiles = filesRecursively(APP_OUTPUT).filter((path) =>
    /\.(?:html|rsc|body)$/.test(path) && !path.endsWith("favicon.ico.body"),
  );
  const browserFiles = [...payloadFiles, ...filesRecursively(STATIC_OUTPUT)];

  for (const path of browserFiles) {
    assertNoServerConfiguration(readFileSync(path), path);
  }
});

test("client-secret assertion rejects a simulated browser leak", () => {
  assert.throws(
    () =>
      assertNoServerConfiguration(
        Buffer.from("window.endpoint = 'https://h6-build-sentinel.invalid/leads'"),
        "simulated-client.js",
      ),
    /h6-build-sentinel\.invalid.*leaked into simulated-client\.js/,
  );
});
