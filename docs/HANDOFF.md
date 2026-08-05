# Handoff — v0.5.1 hardening through v1.0

**Written:** 2026-08-04
**Repo:** `ndxtraders/authority-site-generator-gpt`
**State:** Phases 0–3 and H.1–H.6 complete. Start at H.7.
**Published checkpoint:** GitHub branch `agent/v0-5-1-h6` includes H.6; `main` remains at H.5.

> **Prime Directive:** Work only in the GPT local folder and GitHub repository. The local
> and GitHub `authority-site-generator` upstreams are protected unless Rev proactively
> initiates a request to modify them. Verify `pwd` and `git remote -v` before writing.

---

## Read these first, in this order

1. `docs/FRAMEWORK_PRD.md` — what we're building. **Source of truth.** If anything
   contradicts it, the PRD wins.
2. `docs/IMPLEMENTATION_PLAN.md` — your task list. Phase H (v0.5.1) is active; H.7 is
   next, and it must finish before Phase 4.
3. `docs/SESSION.md` — current status snapshot and the "known stubs" list (do not ship
   items). Kept up to date at the end of every phase; trust it over memory.
4. `docs/CHANGELOG.md` — what shipped in each version, in more implementation detail
   than SESSION.md.
5. `AGENTS.md` — repository boundary, session protocol, and the warning that this is
   Next.js 16. Read the relevant bundled guide before touching loading, routing,
   metadata, forms, or build behavior.

Don't start work by re-deriving context that's already written down in one of the five
files above. If something in this handoff conflicts with the plan or the PRD, the plan
and PRD win — this file is a summary, not the source of truth.

## Copy/paste starter for the next session

> Work only in `/Users/raulvaughn/Documents/authority-site-generator-gpt` and
> `ndxtraders/authority-site-generator-gpt`; do not modify the protected upstream
> `authority-site-generator` repositories. Read `AGENTS.md`, `README.md`,
> `docs/FRAMEWORK_PRD.md`, `docs/IMPLEMENTATION_PLAN.md`, `docs/SESSION.md`, and
> `docs/HANDOFF.md`, then verify `pwd`, `git remote -v`, branch, and status. Start and
> complete H.7 only: reconcile package and documentation versions, document runtime
> schemas, sample-versus-verified content, server-only conversion configuration,
> production verification, tests, CI, and `/contact`; audit all documented paths and
> workflow claims; run `npm run verify` and inspect production output; update the handoff
> so Phase 4.1 is next. Commit and push the v0.5.1 release checkpoint, then stop before
> Phase 4.

---

## Start here — H.7, not Phase 4

The production-readiness review found that the architecture is sound but required a
stricter executable contract, conversion boundary, lead controls, truth gate, connected
structured data, and CI. H.1–H.6 have closed the content-contract,
server-only-conversion-boundary, lead-submission, production-truth, structured-data, and
automated-enforcement findings. Documentation reconciliation and the release checkpoint
remain.

Phase H addresses those risks before the framework multiplies routes and niches:

1. **H.1** — runtime schemas and strict content parsing — **complete**
2. **H.2** — server-only conversion configuration — **complete**
3. **H.3** — lead validation, timeout, and abuse controls — **complete**
4. **H.4** — sample/verified content states and production truth gate — **complete**
5. **H.5** — JSON-LD safety, connected entities, and indexation — **complete**
6. **H.6** — automated tests, browser checks, and GitHub CI — **complete**
7. **H.7** — documentation reconciliation and v0.5.1 release — **next**

Treat each task as one Codex session. H.6 is the completed checkpoint; begin H.7 in a
fresh session. When its acceptance checks pass, commit, update `docs/SESSION.md`, and
stop before Phase 4. Do not switch sessions in the middle of a failing build or partial
migration.

### H.1 checkpoint

- `src/lib/content-schema.ts` is the single executable contract. It contains strict Zod
  schemas and inferred types for site, pages, all 12 section variants, nested props, and
  shared item shapes.
- `src/lib/content.ts` parses every imported JSON object before exposing it. The old
  `as unknown as` loader casts are gone.
- `scripts/validate-content.mts` uses the same bundle parser, then applies placeholder,
  CTA, local-specificity, and development-warning rules.
- The bundle parser accepts source/route records, so Phase 4 can pass service, location,
  and FAQ collections through the same contract without duplicating schema logic.
- `tests/fixtures/content-contract/` and `tests/content-contract.test.mts` cover missing
  Hero/FAQ/form props, wrong types, unknown keys, bad formats/enums, route disagreement,
  duplicate titles/canonicals, and broken internal links.
- H.1 checks passed: validation (5 pages, 8 known warnings), lint, TypeScript, 15 tests,
  and a 16-route production build.

### H.2 checkpoint

- Public content now contains display-safe conversion values only; the provider endpoint
  and authorization credential come from non-public deployment environment variables.
- `src/lib/server/conversion-config.ts` is marked `server-only` and is the application's
  sole reader of lead-provider environment variables. The production verification CLI
  checks endpoint presence and shape operationally without logging its value.
- The ContactForm Client Component receives UI copy only. The Server Action re-reads the
  validated thank-you path and never accepts a redirect or provider setting from the client.
- Operational form logs contain request ID, status category, and duration only. Raw name,
  phone, email, message, endpoint, and authorization values are never logged.
- A sentinel build passed all 16 routes; its endpoint, credential, and environment names
  were absent from client static assets and built HTML/RSC payloads.
- Live production-server checks covered the unconfigured error path and a successful
  authenticated mock-provider delivery; only the successful provider response produced
  `303 Location: /thank-you`, and both paths logged metadata only.

### H.3 checkpoint

- `src/lib/contact-submission.ts` owns normalized server-side field validation, strict
  field and aggregate limits, phone/email policies, spam checks, provider delivery, and
  visitor-safe result shaping. It is framework-neutral so Node tests exercise the same
  function the Server Action calls.
- The Client Component supplies a honeypot, browser-start timestamp, and stable submission
  ID. Accessible field errors identify invalid controls without echoing submitted values.
- Rejected, malformed, oversized, duplicate-field, bot-trap, and timing-failed input never
  reaches the provider.
- Provider delivery has an eight-second timeout across the request and response body,
  explicit network/non-2xx/malformed-acknowledgment handling, and redirects only after a
  2xx `{ "accepted": true }` response.
- Provider requests carry `Idempotency-Key` from the stable submission ID and
  `X-Request-ID` for non-sensitive tracing. Repeat attempts use the same idempotency key.
- `docs/DEPLOYMENT.md` names Rev Vaughn as accountable activation owner and requires a
  provider/edge cap of 10 requests/minute, burst no greater than 5, and duplicate-key
  suppression for at least 24 hours. No provider is selected, so activation remains a
  launch blocker rather than a false production claim.
- H.3 checks passed: validation (5 pages, 8 known warnings), lint, TypeScript, 42 tests,
  and a 16-route production build.

### H.4 checkpoint

- `content/site.json` now declares the public-safe `contentState`; current roofing
  content is explicitly `sample`, so it can build for development but cannot pass the
  production gate.
- `content/production.json` is the separate evidence ledger. It is schema-validated but
  never imported by the application loader, keeping reviewer/source references out of
  public content.
- The ledger inventories 19 current claim groups across Services, WhyChooseUs, Proof,
  Testimonials, licence/insurance, availability, warranty, insurance support, local
  expertise, and other detected trust language. Every current claim remains pending.
- `src/lib/production-readiness.ts` detects structured and risky trust claims and rejects
  unverified claims, stale evidence paths, or new claim paths absent from the ledger.
- `npm run verify:production` also rejects sample status, reserved phones, incomplete
  identity/NAP/schema data, missing provider delivery, missing real images, and pending
  human reviews.
- `docs/DEPLOYMENT.md` names the required source and accountable reviewer for business
  identity, local knowledge, testimonials/ratings, legal language, GBP alignment, rate
  control, and image rights.
- H.4 checks passed: development validation (5 pages, 9 expected warnings), lint,
  TypeScript, 67 tests, and a 16-route production build. The current site failed
  production verification as required with 39 documented blockers and no un-inventoried
  detected trust claims; production-ledger claim IDs and fixture evidence sentinels were
  absent from built output.

### H.5 checkpoint

- Every authored or generated page now carries explicit `seo.indexable`; `/thank-you`
  emits `noindex, follow` and is excluded from the sitemap through that shared field.
- Sitemap entries omit modification dates until truthful content dates exist. The
  manifest now references the existing `/favicon.ico`, not missing `/icon.png`.
- JSON-LD serialization escapes HTML-significant characters so authored `</script>`
  content cannot terminate the script element.
- LocalBusiness and WebSite have stable IDs. WebSite publisher, Service provider, Review
  itemReviewed, and AggregateRating itemReviewed all reference the same business ID;
  service, review, and rating nodes have stable page-scoped IDs.
- Review and AggregateRating nodes emit only when content state is `verified` and ratings
  pass the strict 1–5 content schema. The private production ledger remains outside the
  application loader and browser payloads.
- Representative home, service, FAQ, location, and rated-testimonial fixtures cover the
  connected graph. Sample-rating and JSON-LD script-termination cases are negative tests.
- The official schema.org validator identified `serviceType` as unsupported on
  LocalBusiness. It was removed there and retained on Service; the corrected connected
  graph passed with 0 errors and 0 warnings across 6 detected items.
- H.5 checks passed: validation (5 pages, 9 expected warnings), lint, TypeScript, 76
  tests, and a 16-route production build. Production verification still failed on the
  documented real-world blockers, as required.

### H.6 checkpoint

- The native Node runner remains the unit harness; `tsx` supplies reliable TypeScript,
  JSON-import, and `@/` alias loading without changing production dependencies.
- `src/lib/content-quality.ts` is the shared pure seam for placeholder scanning,
  development warnings, CTA enforcement, and location-specificity rules. The CLI
  validator delegates to it, and negative fixtures assert exact failure reasons.
- The 84-test unit suite now covers runtime schemas, content loading, URL assembly,
  metadata, schema builders, legal generation, production readiness, and contact
  submission behavior.
- `scripts/run-build-integration.mts` builds with sentinel server-only configuration;
  `tests/build-output.integration.mts` asserts 9 HTML routes, unique titles/canonicals,
  explicit indexation, safe connected JSON-LD, `tel:` links, truthful sitemap/manifest,
  and no endpoint, authorization, or environment name in browser-delivered output.
- Playwright tests run against `next start` at 375px. Mobile navigation passed keyboard,
  Escape, and selection checks; contact validation and unconfigured-delivery states are
  accessible and metadata-only. A browser-discovered reset of hidden retry metadata was
  fixed while preserving the stable submission ID across attempts.
- `.github/workflows/ci.yml` installs dependencies and Chromium, then runs the same
  documented `npm run verify` command on every push and pull request.
- H.6 checks passed: validation (5 pages, 9 expected warnings), lint, TypeScript, 84 unit
  tests, a 16-route production build, 5 build integration checks, and 2 Chromium tests.
  Production verification still fails on the same 39 documented blockers, as required.
- `npm audit --omit=dev` reports one moderate Hono advisory and three high advisories in
  Next's bundled PostCSS/Sharp dependency chain. npm's complete fix moves pinned Next
  16.2.12 to 16.3.0, so do not apply `npm audit fix --force` casually; handle the Next
  upgrade as a separately scoped, fully verified task.

---

## What already exists

Phases 0–3 and H.1–H.6 are done. You are extending a working framework, not starting one.

| Thing | Where | Notes |
|---|---|---|
| Content model | `content/site.json` + `content/pages/*.json` | 5 pages today: home, about, services, contact, thank-you |
| Runtime contract | `src/lib/content-schema.ts` | Strict shared Zod schemas; TypeScript content types are inferred from them |
| Section union | `src/types/sections.ts` | Re-exports schema-inferred `SectionPropsMap`, `Section`, and `SectionType` |
| Section dispatch | `src/lib/sections.tsx` | Exhaustive switch — **do not convert to a lookup table**, read the file's own comment first. Also the injection point for display-safe site-wide data into sections that need more than their JSON content |
| Content loader | `src/lib/content.ts` | The only module that knows where content lives. Parses static imports through the shared contract. **Still a static `PAGES` map — see "The one architectural thing" below** |
| Validator | `scripts/validate-content.mts` | Uses the shared bundle parser and gates `next build` via `prebuild`; errors fail, development warnings print only |
| Metadata | `src/lib/metadata.ts` | `buildPageMetadata(page)` — unique title/description/canonical plus explicit indexation |
| Schema engine | `src/lib/schema/` | Safe serialization and a connected `@id` graph; ratings require verified content and valid 1–5 values |
| Public conversion config | `src/types/site.ts` → `ConversionConfig`, `content/site.json` → `conversion` block | Display-safe `trackingPhone`, `displayPhone`, `thankYouPath`, and `model` only |
| Server conversion config | `src/lib/server/conversion-config.ts` | Reads non-public `LEAD_DELIVERY_ENDPOINT` and optional `LEAD_DELIVERY_AUTHORIZATION`; never import into a Client Component |
| Lead submission contract | `src/lib/contact-submission.ts` | Validates/normalizes input, enforces spam and size controls, applies provider timeout/acknowledgment/idempotency rules, and emits metadata-only outcomes |
| Content lifecycle | `content/site.json` → `contentState` | Public-safe `sample`/`verified` state; current content is `sample` |
| Production evidence | `content/production.json` | Non-application claim and human-review ledger; never import into the site loader |
| Production gate | `src/lib/production-readiness.ts` + `scripts/verify-production.mts` | Rejects launch blockers and unsupported trust claims; run with `npm run verify:production` |
| Click-to-call | `src/components/common/CallLink.tsx` | Plain `<a href="tel:...">`, styled via `buttonVariants()` where it needs to look like a button — **not** `Button`'s `render` prop (injects `role="button"` onto real links, wrong) |
| Contact form | `src/components/forms/ContactForm.tsx` + `src/lib/actions/contact.ts` | Accessible `useActionState` form with honeypot/timing/idempotency fields; the thin Server Action injects trusted configuration and redirects only after confirmed delivery |
| Legal pages | `src/lib/legal.ts` + `src/app/(legal)/[slug]/page.tsx` | Generated templates, real business fields only, **not legal-reviewed** |
| Mobile nav | `src/components/layout/MobileNav.tsx` | Client component isolated from `Header` (stays a Server Component); native `<button>`/`<Link>`, `aria-expanded`/`aria-controls`, closes on Escape/selection |
| Test harness | `tests/`, `playwright.config.ts`, `docs/TESTING.md` | 84 unit/fixture tests, 5 built-output assertions, 2 Chromium browser checks; `npm run verify` is the clean-checkout command |
| CI | `.github/workflows/ci.yml` | Runs the full verification command on every push and pull request |

All pages are still thin orchestrators. There is **no business copy in `src/`** — keep it
that way.

---

## After hardening: the architectural task Phase 4 must resolve

`src/lib/content.ts` loads pages via static imports into a `PAGES` object:

```ts
const parsedContent = parseContentBundle(
  { source: "content/site.json", data: siteData },
  [
    { source: "content/pages/home.json", routePath: "/", data: homePage },
    // ...one manually imported record per current page
  ],
);

const PAGES = {
  home: parsedContent.pages[0],
  // ...
} satisfies Record<string, PageContent>;
```

H.1 made every import pass through the runtime parser, but the import list is still
manual because every current page is known and named at build time. That enumeration
stops scaling at 4.1: `services/[slug]`, `service-area/[slug]`, and `faq/[slug]` each
need `generateStaticParams` over a **directory** of content files
(`content/services/*.json`, `content/locations/*.json`, `content/faq/*.json` — see
`CONTENT_SCHEMA.md`'s target shape), not a hand-maintained map entry per file. The
`content.ts` file comment and the 2.4 revision note both already flag this as deferred to
Phase 4 — this is that phase.

You'll likely add something like `getServiceSlugs()` / `getServiceBySlug(slug)` (and the
location/FAQ equivalents) backed by `readdirSync` + static per-file imports, or a
`import.meta.glob`-equivalent pattern — check what Next 16 actually supports for this
before assuming. This is exactly the kind of routing/data-loading question `AGENTS.md`
says to check the bundled docs for rather than pattern-matching on older Next.js
knowledge.

---

## Phase 4 preview — do not start until H.1–H.7 pass

Read the full Phase 4 section in `docs/IMPLEMENTATION_PLAN.md` — it's short (4.1–4.5).
Summary:

- **4.1** — `src/app/services/[slug]/page.tsx`, `service-area/[slug]/page.tsx`,
  `faq/[slug]/page.tsx`. Each needs `generateStaticParams` + `generateMetadata`. This is
  where the `content.ts` directory-enumeration change above has to land.
- **4.2** — `/service-area` and `/faq` hub/index pages, generated from the same content
  directories.
- **4.3** — Seed content: 3 services, 3 locations (Modesto + 2 spokes), 5 FAQ pages.
  **This needs genuine local knowledge** — climate, permits, neighborhoods, common local
  failure modes (PRD §7). The validator's location-page rule already enforces this (see
  `scripts/validate-content.mts`, the `pageType === "location"` block — requires 2+ of
  neighborhood/climate/permit/county/weather/soil). **Do not invent specifics you don't
  know.** Write the structure, flag what needs a real answer from Rev, and say plainly
  which parts are placeholders.
- **4.4** — Render `internalLinks` as a related-pages block; service cards link to
  service pages; location pages link to services + the hub. Acceptance: no orphan pages,
  every page reachable by 2+ internal links.
- **4.5** — Commit: `v0.6: dynamic routing for services, locations, and FAQ`.

Work one task at a time, in order. This sequence begins only after the v0.5.1 handoff says
H.7 passed.

---

## Resolved route decision

PRD D11 resolves the old `/estimate` discrepancy: `/contact` is the required v1 estimate
and inquiry destination. A separate `/estimate` route is optional only when it serves a
materially different campaign or form intent.

---

## Rules that matter most here

**Never put business-specific strings in `src/`.** No copy, city names, phone numbers, or
domains. `content/` only. Check yourself with:

```bash
grep -rniE '\b(roof|modesto|shingle|gutter)\b' src/components src/lib src/types src/app
```

**Run the full build, unfiltered.** Do not pipe it through `grep` and read the first
"Compiled successfully" as a pass. That exact mistake hid a real type-check failure
during Phase 1. Run `npm run build` and read the whole output.

**Server Actions, not Route Handlers, for form-like submissions.** Established in 3.3 —
`useActionState` + a `"use server"` action is this framework's idiomatic pattern per
`forms.md`. Don't reach for `fetch()` + a Route Handler out of habit from older Next.js
projects.

**Style real links as buttons with `buttonVariants()`, never `Button`'s `render` prop.**
Established in 3.2 — `render` injects `role="button"` onto whatever it wraps, which is
wrong for a genuine navigational `<a href>`. `buttonVariants()` is the plain `cva()`
className function, already exported from `button.tsx` for this.

**Commit at every completed session task.** Rev has granted standing permission for
reasonable commits and pushes to `ndxtraders/authority-site-generator-gpt`. Never apply
that permission to the protected upstream repository.

**Never delete a file without asking.** Move it to `Archive/` instead.

---

## If the plan turns out to be wrong

Stop and say so. Do not improvise around it.

This has happened four times so far and each time the plan (not the code) was the thing
that needed correcting. All four are recorded as revision notes in
`docs/IMPLEMENTATION_PLAN.md`, in place, at the task they correct:

- **1.2** — a component lookup table with `@ts-expect-error` couldn't be made type-safe.
  Replaced with a switch.
- **1.5** — two new sections were specified; three were needed, because the contact form
  had nowhere else to live.
- **2.4** — the "zero-code-change bar" acceptance check doesn't hold until Phase 4
  (this phase) makes `content.ts` real directory enumeration. Documented, deferred, not
  faked.
- **3.1–3.5** — five separate notes: `formEndpoint` shipped empty rather than a fake URL;
  `buttonVariants()` over `Button`'s `render` prop; the Server Actions pivot; the legal
  pages' "template, not legal review" caveat; mobile nav verified via HTML output, not an
  actual browser (no browser tool was available that session).

Follow the same pattern: implement the better thing, then update the plan so the next
reader isn't misled. A plan that lies is worse than no plan.

There is one explicit tripwire in Phase 5.3: if the locksmith niche needs more than one
new component, **halt and report**. That would challenge PRD decision D1 (one framework,
not per-niche forks), which is Rev's call, not yours.

---

## Stubs that must not ship — tracked in `docs/SESSION.md`, kept here for visibility

1. **Lead delivery is not configured.** No lead-delivery provider (email/CRM) is wired
   up yet. The Server Action (`src/lib/actions/contact.ts`) reads its endpoint only from
   server deployment configuration and returns a real error when absent, but no lead
   submitted through the live form is delivered anywhere. Someone needs to pick a
   provider and set the documented deployment variables before launch.
2. **Legal pages need real legal review.** `src/lib/legal.ts` generates from real
   business fields only, no fabricated claims — but it's a template, not counsel-reviewed
   content.
3. **Mobile nav browser verification was completed in H.6.** Playwright exercises the
   real production build at 375px using Tab, Enter, Space, Escape, and link selection.
4. **NAP data is incomplete** — `business.address.street`, `postalCode`, `geo`, `hours`,
   `sameAs`, `licenseNumber` are all empty; phone is a 555 placeholder. The validator
   warns on all six (does not fail the build). **Do not invent values** — these are
   factual claims about a real business; ask Rev. Should become hard errors before
   launch.
5. **`TestimonialItem.rating` is unset on every testimonial**, so `Review`/
   `AggregateRating` schema is never emitted (PRD §6 wants it). The nodes are safely
   connected and verified-state gated; they still need real ratings from the business,
   not placeholder values.
6. **Runtime content validation was completed in H.1.** Keep
   `src/lib/content-schema.ts` as the single parser/type source and do not reintroduce
   loader casts.
7. **The form configuration boundary was completed in H.2.** Preserve the server-only
   environment module, client action signature, validated server-side redirect, and
   metadata-only operational logs.
8. **Lead abuse and failure controls were completed in H.3.** Preserve the bounded
   validation, honeypot/timing fields, eight-second provider timeout, acknowledgment
   contract, stable idempotency key, accessible errors, and metadata-only logs. Durable
   provider/edge rate control is documented but remains launch-blocked until a provider
   is selected and the deployment owner records activation evidence.
9. **Current proof and testimonial content is not verified.** The development sample
   includes licence/insurance language, numerical statistics, response-time claims, and
   testimonials. H.4 inventories every detected path and blocks production; the 19 claim
   groups must still be sourced or removed by accountable humans.
10. **Schema and indexation safety was completed in H.5.** Preserve safe serialization,
    connected stable IDs, verified-only ratings, explicit indexation, truthful sitemap
    dates, and valid manifest assets.
11. **The H.6 regression suite and CI are complete.** Preserve the shared validator
    fixtures, sentinel production-build assertions, Playwright checks, and the single
    `npm run verify` command as routing and niche coverage expand.
12. **Production dependency advisories remain.** `npm audit --omit=dev` reports current
    Hono, bundled PostCSS, and Sharp advisories. The offered full fix upgrades pinned Next
    16.2.12 to 16.3.0; review the matching bundled Next 16 documentation and run the full
    verification suite in a separately scoped upgrade rather than forcing it into H.7.

---

## Definition of done

From the PRD, unchanged:

1. A new site in an existing niche launches with **zero** changes under `src/`
2. A plumbing site builds from the same `src/` with a different niche pack and content
3. Every PRD §10 checklist item passes on the generated roofing site
4. Runtime validation and production verification enforce every machine-checkable defect
   class in the plan's ledger
5. Lighthouse ≥ 95 across all categories
6. Server-only conversion values and submitted PII never appear in browser payloads or logs
7. Validation, tests, browser checks, and production build pass in CI
