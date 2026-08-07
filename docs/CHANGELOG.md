# Changelog

Implementation history. Current state and the next task live in `docs/SESSION.md`; this
file is the only place completed work is described in detail.

## v0.5.1 — Production hardening (H.1–H.6 complete, H.7 open)

An independent production-readiness review confirmed the architecture and clean build,
then identified hardening work that had to precede page and niche expansion. PRD decisions
D7–D11 and Phase H followed. Each H task was one session.

### H.1 — Executable content contract

- Added strict Zod runtime schemas for the complete site, page, section, nested-prop,
  shared-item, format, and enum contract in `src/lib/content-schema.ts`; the public
  TypeScript content types are inferred from those schemas
- Replaced loader-boundary JSON casts with shared runtime parsing before content reaches
  pages or components
- Made the Node validator use the same parser for shape, URL/phone/path formats,
  route/slug agreement, schema relationships, title/canonical uniqueness, navigation,
  redirects, and internal-link resolution
- Added 14 negative fixtures and 15 contract tests; added `zod` as a direct dependency

Checks: validate (5 pages, 8 warnings), lint, tsc, 15/15 tests, 16-route build.

### H.2 — Server-only conversion boundary

- Removed `formEndpoint` from public content and the content contract
- Added `src/lib/server/conversion-config.ts`, marked `server-only`, as the sole reader of
  `LEAD_DELIVERY_ENDPOINT` and `LEAD_DELIVERY_AUTHORIZATION`
- Removed the conversion object and bound redirect argument from the ContactForm Client
  Component; the Server Action re-reads the validated thank-you path itself
- Replaced raw lead logging with request ID, status category, and duration only
- Kept provider delivery as the success boundary: redirect only after a successful response

Checks: validate, lint, tsc, 16/16 tests, sentinel build. Sentinel endpoint, authorization
value, and env names absent from 27 client assets and 90 built payloads. Live unconfigured
and mock-provider submissions both logged metadata only.

### H.3 — Lead validation and abuse controls

- Added `src/lib/contact-submission.ts` as a framework-neutral, dependency-injected
  validation and delivery contract used by the Server Action
- Added normalization, required checks, per-field maximums, an 8 KB aggregate limit, email
  validation, and a 10–15 digit phone policy; rejected unexpected, duplicate, non-string,
  malformed, and oversized fields before any provider request
- Added a honeypot, submission timestamp, and stable submission ID; too-fast, stale, and
  bot-trap submissions fail with visitor-safe errors
- Added accessible field errors with `aria-invalid`/`aria-describedby`, a form-level live
  alert, and no echoing of submitted values
- Added an 8-second timeout across request and response body, explicit
  network/non-2xx/malformed handling, and a required `{ "accepted": true }` acknowledgment
- Added `Idempotency-Key` and `X-Request-ID`; retries reuse the same idempotency key

Checks: validate, lint, tsc, 42/42 tests, 16-route build.

### H.4 — Sample/verified content states and truth gate

- Added required `contentState: "sample" | "verified"`; roofing content is `sample`
- Added `content/production.json` as a separate, non-application evidence ledger for claim
  locations, sources, reviewers, dates, and human-owned reviews
- Inventoried 19 claim groups across Services, WhyChooseUs, Proof, Testimonials,
  response-time, licence/insurance, warranty, insurance-support, and local-expertise paths;
  all left pending rather than fabricated
- Added `src/lib/production-readiness.ts` and `npm run verify:production`, rejecting sample
  state, reserved phones, incomplete identity/schema fields, missing provider delivery,
  missing real images, incomplete human review, and unverified/stale/unsupported claims
- Added a fully verified passing fixture and named failing fixtures per blocker category

Checks: validate (9 warnings), lint, tsc, 67/67 tests, 16-route build.
`verify:production` failed as required with 39 documented blockers.

### H.5 — Indexation and structured-data safety

- Added required `seo.indexable`; `/thank-you` emits `noindex, follow` and is excluded from
  the sitemap through that same field
- Removed deployment-time sitemap modification dates; replaced the missing manifest
  `/icon.png` with the existing favicon
- Escaped HTML-significant and script-closing content before JSON-LD insertion
- Added stable business, website, service, rating, and review `@id` values and connected
  WebSite publisher, Service provider, Review itemReviewed, and AggregateRating
  itemReviewed to the same LocalBusiness entity
- Gated Review/AggregateRating on verified content with strict 1–5 rating validation
- Removed `serviceType` from LocalBusiness after the official validator flagged it as
  unsupported there; retained it on Service

Checks: validate, lint, tsc, 76/76 tests, 16-route build. Official schema.org validator
reported 0 errors and 0 warnings across 6 connected items.

### H.6 — Regression suite and CI

- Kept the native Node test runner; added `tsx` only for application-module loading
- Extracted authored-content and anti-thin checks into `src/lib/content-quality.ts` so the
  validator and fixture suite run the same rules
- Grew the unit suite to 84 tests asserting failure reasons for schema, canonical, link,
  truth-gate, form-boundary, and schema-safety defects
- Added a sentinel production-build runner and 5 integration assertions across all 9 HTML
  routes covering titles/canonicals, indexation, sitemap/manifest truthfulness, connected
  JSON-LD, `tel:` links, and absence of server-only config from client output
- Added Playwright Chromium coverage at 375px for keyboard mobile navigation, Escape and
  selection closure, accessible contact errors, unconfigured-delivery errors, and retry
  idempotency
- Fixed a browser-discovered retry defect by restoring client-generated timing and
  submission ID values after each completed Server Action
- Added `.github/workflows/ci.yml` and documented `npm run verify` in `docs/TESTING.md`

Checks: `npm run verify` passed end to end — validate (9 warnings), lint, tsc, 84/84 unit,
16-route build, 5/5 integration, 2/2 Chromium. `npm audit --omit=dev` reported 4 upstream
production advisories; the complete fix moves pinned Next 16.2.12 to 16.3.0, so it was
recorded as a separately scoped upgrade rather than forced into H.6.

## v0.5 — Conversion layer

- Added `conversion` block to `SiteConfig`/`content/site.json` — `trackingPhone`
  (E.164, used in `tel:` hrefs), `displayPhone`, `formEndpoint`, `thankYouPath`, `model`.
  Kept distinct from `business.phone` (official NAP, used in schema/legal) per PRD §8's
  call-tracking rationale
- Added `CallLink` (`src/components/common/CallLink.tsx`) — real `tel:` links in
  header, footer, `Hero`, and `CTA`; primary CTAs now link to `/contact` instead of
  going nowhere. Styled with `buttonVariants()` directly rather than `Button`'s `render`
  prop, which would incorrectly add `role="button"` to a real navigational link
- Made the contact form real: `src/lib/actions/contact.ts` is a Server Action
  (`useActionState`, idiomatic per the framework's own docs) that validates input and
  redirects to `conversion.thankYouPath` on success. Replaces the old `submitLead()`
  stub that reported success for a lead that was never captured. `formEndpoint` is
  empty until a delivery provider is chosen, so submission currently returns an honest
  "not connected yet" error rather than a fake success — **do not ship until this is
  wired to a real inbox/CRM**
- Added `/thank-you` page (`content/pages/thank-you.json`, `"thank-you"` `PageType`)
- Added the legal page generator (`src/lib/legal.ts`,
  `src/app/(legal)/[slug]/page.tsx`) — `privacy-policy`, `terms-conditions`,
  `disclaimer`, `accessibility`, generated from generic templates populated only with
  real `business`/`site` fields. **Template only, not a substitute for legal review.**
  Linked from the footer and included in `sitemap.ts`
- Added mobile navigation (`src/components/layout/MobileNav.tsx`) — the header had no
  navigation at all below 768px; now an accessible disclosure toggle with
  `aria-expanded`/`aria-controls`, closes on Escape and on link selection

**Fixed:** defects 14 (form submission), plus the header CTA/no-`tel:`/no-mobile-nav/
no-legal-pages gaps tracked as "still open" since v0.2.

**Known gap, not yet actionable:** `conversion.formEndpoint` has no real provider
configured. The Server Action is honest about this (it errors rather than fakes
success), but no lead sent through the live form is actually delivered anywhere yet.

## v0.4 — SEO and schema engine

- Added `src/lib/url.ts` — `site.url` is now the only place the domain appears
- Added per-page `generateMetadata` (`src/lib/metadata.ts`) — every page emits a unique
  title, description, and self-referencing canonical
- Added the schema generator (`src/lib/schema/`) — `LocalBusiness` (`@type` driven by
  `site.schema.businessType`, not hardcoded), `BreadcrumbList` on every page;
  `WebSite` on home; `FAQPage` auto-added for any page with an FAQ section;
  `Review`/`AggregateRating` auto-added for testimonials that carry a real rating
- Added `JsonLd` component; removed the hardcoded `LocalBusiness` literal from
  `layout.tsx` — schema now varies per page, which a single shared script couldn't do
- `sitemap.ts` now enumerates `getAllPages()`; `manifest.ts` and `robots.ts` derive from
  content instead of hardcoded values
- Added `/llms.txt` — an AI-crawler page map generated from content

**Fixed:** defects 5, 6 (partially — see plan note), 8, 9, 10, 11, 12, 13 (partially),
24.

**Content-model finding, not yet actionable:** `TestimonialItem` has no rating field, so
`Review`/`AggregateRating` schema (required by PRD §6 for any page with testimonials)
cannot be honestly emitted yet — fabricating a star rating would be a false claim about
a real business. `rating` is now an optional field; schema emits only for testimonials
that actually carry one. Currently: none do, so home's testimonials don't produce
Review/AggregateRating nodes. Real ratings need to come from the business.

**Still open from the audit:** `tel:` links, mobile nav, branding tokens, hub-and-spoke
routing, niche packs, legal pages, local knowledge content. Phases 3–6.

## v0.3 — Page-based content model

- Split `content/site.json` into site-wide config plus `content/pages/*.json`
- Added `Section` discriminated union derived from a single `SectionPropsMap`
- Added type-safe section dispatch (`src/lib/sections.tsx`) — a switch, not a lookup
  table, so no cast is needed and a missing case is a compile error
- Added `src/lib/content.ts` as the only module that knows where content lives
- Added `Answer` (AEO answer-first block), `ContactInfo` (NAP), and `ContactForm` sections
- All four pages reduced to 7-line orchestrators — **zero business copy left in `src/`**
- Added `scripts/validate-content.mts`, gating `next build` via `prebuild`
- Expanded `business` with `address`, `geo`, `hours`, `sameAs`, `licenseNumber`,
  `priceRange` for the Phase 2 schema engine
- `Services` gained `itemCta`, retiring the hardcoded "Request Service" string
- Archived `src/lib/site.ts`, superseded by `content.ts`
- Renamed the package to `authority-site-generator`

**Fixed:** defects 1, 2, 18, 19 (partially 14 — form strings, not submission).

**Still open from the v0.2 audit:** canonicals, schema, sitemap/robots/manifest
hardcoding, `tel:` links, mobile nav, branding tokens. Phases 2–6.

## v0.2 — Reusable section architecture

- Added layout primitives: `Container`, `Section`, `SectionHeading`
- Added eight trade-agnostic section components: `Services`, `WhyChooseUs`, `Proof`,
  `Process`, `Testimonials`, `FAQ`, `CTA`, `Authority`
- Added `/about`, `/services`, `/contact` routes
- Added `ContactForm` (UI only — does not submit)
- Expanded `content/site.json` from 3 to 14 top-level keys
- Expanded `src/types/site.ts` to a complete typed content model
- Added `sitemap.ts`, `robots.ts`, `manifest.ts` (hardcoded values)
- Added `LocalBusiness` JSON-LD in the root layout (single hardcoded literal)

**Known incomplete in v0.2** — corrected by the 2026-08-03 audit:

- Metadata is root-level only. All four pages emit the homepage canonical.
- Schema is one hardcoded literal; `schema.businessType` is never read.
- `branding` is typed but referenced by zero components; ~100 hardcoded colors remain.
- Contact form reports success without submitting anywhere.
- No `tel:` links; header CTA has no `href`; no mobile navigation.
- `metadata.ts` was written but never imported.

Full list: `docs/DEFECTS.md`.

## v0.1 — Foundation

- Next.js, TypeScript, Tailwind, shadcn/ui
- JSON content architecture and content loader
- Shared layout with Header and Footer
- Hero component
- Initial documentation
