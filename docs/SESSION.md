# Current Session

**Version:** v0.5 complete; v0.5.1 H.1–H.6 complete
**Phase:** H.7 — documentation reconciliation and v0.5.1 release is next
**First market:** Modesto, CA (roofing)
**Authorized repo:** `ndxtraders/authority-site-generator-gpt`

## Where we are

Phases 0–3 produced a working section framework, page content model, initial validator,
SEO/schema engine, click-to-call flow, Server Action form path, legal templates, and mobile
navigation. An independent production-readiness review confirmed the architecture and
clean build, then identified hardening work that must precede page and niche expansion.

The PRD is now v1.1 with decisions D7–D11. `docs/IMPLEMENTATION_PLAN.md` contains Phase H,
seven sequenced v0.5.1 tasks. H.1 provides the shared executable content contract, H.2
isolates lead-delivery configuration on the server, H.3 validates and protects lead
submission, H.4 separates sample content from verified production evidence, H.5
completes structured-data and indexation safety, and H.6 adds regression coverage and
CI; H.7 remains. Each H task is a natural Codex session boundary.

## Completed in the planning session

- Reviewed local code, built output, Git history, and the GitHub repository
- Verified validation, lint, typecheck, and an isolated 16-route production build
- Identified the client serialization of the full conversion object and raw PII logging
- Identified shallow nested-prop validation, unverified trust claims, unsafe JSON-LD
  serialization, disconnected review schema, thank-you indexation, and missing tests/CI
- Added PRD decisions for runtime schemas, truth gates, server-only conversion data,
  connected structured data, and `/contact` as the required v1 conversion destination
- Added Phase H tasks H.1–H.7 with acceptance criteria and commit/session boundaries
- Persisted the GPT repository Prime Directive in `AGENTS.md`
- Corrected this checkout's `origin` from the protected upstream to the GPT repository
- Created local recovery branch `backup/pre-v0-5-1-planning`

## Completed in H.1

- Added strict Zod runtime schemas for the complete site, page, section, nested-prop,
  shared-item, format, and enum contract in `src/lib/content-schema.ts`
- Inferred the public TypeScript content types from those schemas
- Replaced loader-boundary JSON casts with shared runtime parsing before content enters
  pages or components
- Made the Node validator use the same parser for shape, URL/phone/path formats,
  route/slug agreement, schema relationships, title/canonical uniqueness, navigation,
  redirects, and internal-link resolution
- Added 14 negative fixture files and 15 contract tests covering the H.1 failure classes
- Added `zod` as a direct runtime dependency and `npm test` for the fixture suite

H.1 verification results:

- `npm run validate` — passed, 5 pages checked; 8 existing development warnings
- `npm run lint` — passed
- `npx tsc --noEmit` — passed
- `npm test` — passed, 15/15
- `npm run build` — passed, 16 routes generated (required network access for configured
  Google fonts)

## Completed in H.2

- Removed `formEndpoint` from public content and the executable content contract
- Added `src/lib/server/conversion-config.ts`, marked with `server-only`, as the only
  module that reads `LEAD_DELIVERY_ENDPOINT` and `LEAD_DELIVERY_AUTHORIZATION`
- Removed the conversion object and bound redirect argument from the ContactForm Client
  Component; the Server Action now reads the validated thank-you path itself
- Replaced raw lead logging with request ID, status category, and duration only
- Kept provider delivery as the success boundary: redirect occurs only after a successful
  provider response
- Documented server-only deployment configuration in `docs/DEPLOYMENT.md`

H.2 verification results:

- `npm run validate` — passed, 5 pages checked; 8 existing development warnings
- `npm run lint` — passed
- `npx tsc --noEmit` — passed
- `npm test` — passed, 16/16, including rejection of provider endpoints from public content
- Sentinel production build — passed, 16 routes generated
- Sentinel endpoint, authorization value, and environment-variable names — absent from
  27 client static assets and 90 built HTML/RSC/text payloads
- Live unconfigured submission — returned the visitor-safe error path; production log
  contained only request ID, `delivery_not_configured`, and duration
- Live mock-provider submission — provider accepted the server-only authorization value,
  then the action returned `303 Location: /thank-you`; success log contained metadata only

## Completed in H.3

- Added `src/lib/contact-submission.ts` as a framework-neutral, dependency-injected lead
  validation and provider-delivery contract used by the Server Action
- Added server-side normalization, required checks, per-field maximums, an 8 KB aggregate
  limit, email validation, and a 10–15 digit practical phone policy
- Rejected unexpected, duplicate, non-string, malformed, and oversized form fields before
  any provider request
- Added a client-populated honeypot, submission timestamp, and stable submission ID;
  too-fast, stale, and bot-trap submissions fail with visitor-safe errors
- Added accessible field errors with `aria-invalid`, `aria-describedby`, a form-level live
  alert, and no echoing of submitted values
- Added an eight-second timeout covering both the provider request and response body,
  explicit network/non-2xx/malformed-response handling, and a required
  `{ "accepted": true }` provider acknowledgment
- Added `Idempotency-Key` and `X-Request-ID` headers; repeat attempts retain the same
  idempotency key so a supporting provider can deduplicate them
- Documented the provider contract, accountable rate-control owner, required thresholds,
  and launch-blocking activation evidence in `docs/DEPLOYMENT.md`
- Added 26 H.3 tests; the combined suite now contains 42 tests

H.3 verification results:

- `npm run validate` — passed, 5 pages checked; 8 existing development warnings
- `npm run lint` — passed
- `npx tsc --noEmit` — passed
- `npm test` — passed, 42/42
- `npm run build` — passed, 16 routes generated

## Completed in H.4

- Added required `contentState: "sample" | "verified"` to the public content contract;
  current roofing content is explicitly `sample`
- Added `content/production.json` as a separate, non-application evidence ledger for
  claim locations, sources, reviewers, dates, and human-owned reviews
- Inventoried 19 current claim groups across all detected Services, WhyChooseUs, Proof,
  Testimonials, response-time, licence/insurance, warranty, insurance-support, local
  expertise, and trust-language paths; all remain pending rather than being fabricated
- Added `src/lib/production-readiness.ts` and `npm run verify:production`, which reject
  sample state, reserved phones, incomplete identity/schema fields, missing provider
  delivery, missing real images, incomplete human review, unverified/stale claims, and
  unsupported trust claims absent from the ledger
- Kept the development build usable: the ordinary validator checks the evidence schema
  and emits an explicit sample warning without treating real-world launch dependencies as
  structural errors
- Added a fully verified passing fixture and named failing fixtures for every H.4 blocker
  category, including unsupported new trust content
- Updated the deployment checklist with the required source and accountable reviewer for
  business identity, local knowledge, testimonials/ratings, legal text, GBP alignment,
  rate control, and image rights

H.4 verification results:

- `npm run validate` — passed, 5 pages checked; 9 expected development warnings
- `npm run verify:production` — failed as required with 39 documented blockers on the
  current sample content; no detected trust claim is missing from the evidence ledger
- `npm run lint` — passed
- `npx tsc --noEmit` — passed
- `npm test` — passed, 67/67
- `npm run build` — passed, 16 routes generated (required network access for configured
  Google fonts)
- Production-ledger claim IDs and fixture evidence sentinels — absent from built output

## Completed in H.5

- Added required `seo.indexable` page content so indexation is explicit and reusable;
  authored and generated public pages are indexable while `/thank-you` is `noindex`
- Made page metadata emit `noindex, follow` for non-indexable routes and made the sitemap
  exclude them from the same executable content field
- Removed deployment-time sitemap modification dates rather than presenting builds as
  content updates; replaced the missing manifest `/icon.png` with the existing favicon
- Safely serialized JSON-LD by escaping HTML-significant characters and script-closing
  content before insertion into the `application/ld+json` element
- Added stable business, website, service, aggregate-rating, and review `@id` values;
  connected WebSite publisher, Service provider, Review itemReviewed, and AggregateRating
  itemReviewed to the same LocalBusiness entity
- Gated Review/AggregateRating output on verified content and retained strict 1–5 rating
  validation; current sample testimonials continue to emit no rating claims
- Added representative home, service, FAQ, location, and rated-testimonial fixtures plus
  safety tests for connected graphs, unsupported sample ratings, and script termination
- Removed `serviceType` from LocalBusiness after the official schema.org validator
  identified it as unsupported there; retained it on Service, where it is valid

H.5 verification results:

- `npm run validate` — passed, 5 pages checked; 9 expected development warnings
- `npm run verify:production` — failed as required with the documented blockers on the
  current sample content and no un-inventoried trust claims
- `npm run lint` — passed
- `npx tsc --noEmit` — passed
- `npm test` — passed, 76/76
- `npm run build` — passed, 16 routes generated (required network access for configured
  Google fonts)
- Built output — `/thank-you` emitted `noindex, follow` and was absent from the sitemap;
  sitemap contained no false modification dates; manifest referenced existing favicon
- Official schema.org validator — 0 errors and 0 warnings across 6 connected items:
  BreadcrumbList, WebSite, Service, Review, AggregateRating, and FAQPage

## Completed in H.6

- Kept the native Node test runner and added `tsx` only for reliable application-module
  loading; expanded unit coverage for the parsed content loader, URL assembly, metadata,
  legal generation, and existing contact/schema/production contracts
- Extracted authored-content and anti-thin checks into `src/lib/content-quality.ts` so
  the validator and fixture suite execute the same placeholder, CTA, NAP-warning, and
  local-specificity rules
- Added negative fixtures for placeholder content, missing CTAs, and thin location pages;
  combined with H.1–H.5 fixtures, the unit suite now contains 84 tests that assert failure
  reasons for schema, canonical, link, truth-gate, form-boundary, and schema-safety defects
- Added a sentinel production-build runner and 5 integration assertions covering all 9
  HTML routes, unique titles/canonicals, explicit indexation, truthful sitemap/manifest,
  connected JSON-LD, `tel:` links, and absence of server-only configuration from client
  assets and built browser payloads
- Added Playwright Chromium coverage at 375px for keyboard mobile navigation, Escape and
  selection closure, accessible contact field errors, unconfigured-delivery errors, and
  stable retry idempotency metadata
- Fixed the browser-discovered retry defect by restoring the same client-generated timing
  and submission ID values after each completed Server Action
- Added `.github/workflows/ci.yml` for every push and pull request and documented the one
  clean-checkout command, `npm run verify`, in `docs/TESTING.md`

H.6 verification results:

- `npm run verify` — passed end to end
- Development validation — passed, 5 pages checked; 9 expected warnings
- ESLint and TypeScript — passed
- Unit/negative-fixture suite — passed, 84/84
- Sentinel production build — passed, 16 routes generated
- Production-build integration suite — passed, 5/5
- Playwright Chromium suite — passed, 2/2 at 375px
- `npm run verify:production` — failed as required with the same 39 documented real-world
  blockers; current sample content remains impossible to mistake for production-ready
- `npm audit --omit=dev` — reported 4 upstream production advisories (1 moderate, 3
  high); npm's complete fix upgrades pinned Next 16.2.12 to 16.3.0, so dependency
  remediation is recorded for a separately scoped framework upgrade rather than forced
  into H.6

## Next — exact starting point

Start a fresh Codex task for **H.7 — Reconcile documentation and release v0.5.1** in
`docs/IMPLEMENTATION_PLAN.md`. Do not start Phase 4 before H.7 passes.

Preserve H.4's split: `contentState` is public-safe site content,
`content/production.json` is verification evidence, and the latter must not enter the
application loader or browser payloads. Do not mark pending facts verified without the
recorded source and accountable human reviewer required by `docs/DEPLOYMENT.md`.

## Known launch blockers

- Current business phone and tracking number use reserved 555 data
- Address, postal code, geo, hours, sameAs, and licence number are incomplete
- Form delivery is not configured because no provider endpoint has been selected
- Provider/edge rate control is documented but cannot be activated until a provider is selected
- All 19 current trust/service claim groups remain pending in `content/production.json`
- Business identity, local knowledge, testimonials, legal, GBP, rate-control, and
  image-rights human reviews remain pending
- Generated legal templates have not been reviewed by counsel
- Review/AggregateRating schema is connected and safely gated, but current content has no
  verified ratings to emit
- Starter assets remain and real, rights-cleared production images are still required
- The production dependency audit reports current Hono, bundled PostCSS, and Sharp
  advisories; the available full remediation changes the pinned Next version and requires
  a separately scoped upgrade with Next 16 documentation review and full verification

## Session checkpoint rule

At the end of each H task: run its checks, commit the checkpoint, update this file with
results and the exact next task, update `docs/HANDOFF.md` if architecture changed, and
start the next numbered task in a fresh Codex session.

## Repository boundary

Only `authority-site-generator-gpt` is authorized for edits and pushes. The local and
GitHub `authority-site-generator` upstreams are protected and must not be modified unless
Rev proactively initiates that exact request.

Intentional local-only state: `Archive/h4-pre-change-2026-08-04/` and
`Archive/h5-pre-change-2026-08-04/` contain required pre-edit safety copies. The
pre-existing `Archive/handoff-main-publish-2026-08-04/` also remains untracked.
`Archive/h6-pre-change-2026-08-04.tar.gz` is the H.6 recovery snapshot. All four are
excluded from the product checkpoint.
