> Part of the build plan. Conventions, guardrails, and the phase index are in
> `docs/IMPLEMENTATION_PLAN.md`. Known defects are in `docs/DEFECTS.md`.


# Phase H — v0.5.1: Production hardening

Goal: make the framework honest, safe, testable, and difficult to deploy incorrectly
before multiplying pages and niches. **Do not start Phase 4 until H.1–H.7 pass.**

Each H task is intentionally scoped as one Codex session. Finish its acceptance checks,
update `docs/SESSION.md`, and commit before starting the next task in a fresh session.

### H.1 — Establish the executable content contract

**Primary files:** `src/lib/content.ts`, `src/types/`, `src/lib/section-types.ts`,
`scripts/validate-content.mts`, new runtime-schema module(s), test fixtures

1. Choose one runtime schema approach that can run in both the Next build and the plain
   Node validator. Prefer a single source for runtime schemas and inferred TypeScript
   types; if existing types remain separate, add compile-time equivalence tests.
2. Define strict schemas for `SiteConfig`, every `PageContent` field, every section's
   nested props, and shared items. Reject unknown keys where silent typos would be unsafe.
3. Remove `as unknown as` as the mechanism that makes imported content appear valid.
   Parse content at the loader boundary and return typed data only after validation.
4. Validate formats and relationships: absolute site origin, root-relative canonicals and
   redirects, E.164 tracking phone, valid conversion model and schema names, slug/route
   agreement, unique titles/canonicals, and resolvable internal links.
5. Design the loader so Phase 4 can apply the same parser to `services/`, `locations/`,
   and `faq/` without duplicating validation logic.

**Acceptance:**

- `npm run validate`, lint, typecheck, and production build pass on current content
- Fixture tests prove that a missing nested Hero/FAQ/form prop, wrong type, unknown prop,
  duplicate canonical, malformed phone/URL, and broken internal link all fail validation
- Components and pages never receive unparsed content

**Commit:** `v0.5.1 H1: enforce runtime content schemas`

**Session boundary:** start H.2 in a fresh task.

### H.2 — Make the conversion boundary server-only

**Primary files:** `src/lib/actions/contact.ts`, `src/components/forms/ContactForm.tsx`,
`src/components/sections/ContactForm.tsx`, `src/lib/sections.tsx`, `src/types/site.ts`,
deployment documentation

1. Stop passing the full `ConversionConfig` through the ContactForm Client Component.
   The Server Action reads the endpoint and thank-you path from trusted server config.
2. Move endpoint URLs, credentials, signing secrets, and provider tokens out of public
   content and into server-only deployment configuration. Keep only display-safe values
   in content.
3. Remove raw lead fields from logs. Operational logs may contain a generated request ID,
   provider status category, and non-sensitive timing only.
4. Validate the redirect as a known internal path; never accept it as a client-bound
   argument.
5. Inspect built HTML/RSC output and client bundles for endpoint names, secret values, and
   serialized server configuration.

**Acceptance:**

- A sentinel endpoint/secret configured for the test cannot be found in built browser
  payloads or client JavaScript
- Failed and unconfigured submissions do not log name, phone, email, or message
- Success redirects only after the server confirms provider delivery
- Server-only configuration is documented without committing real credentials

**Commit:** `v0.5.1 H2: isolate conversion configuration`

**Session boundary:** start H.3 in a fresh task.

### H.3 — Validate and protect lead submission

**Primary files:** `src/lib/actions/contact.ts`, form components, validation tests,
deployment/provider adapter

1. Enforce server-side field normalization, required values, maximum lengths, email
   format, and a practical phone-number policy. Reject unexpected fields and oversized
   payloads with generic visitor-safe errors.
2. Add accessible field-level or form-level error handling without echoing sensitive
   submitted values.
3. Add a low-friction spam control suitable for static local-business sites. At minimum,
   use a honeypot and submission timing check; document provider-side rate limiting or
   add a durable rate limiter before public launch.
4. Add an explicit provider timeout with predictable handling for network errors,
   non-2xx responses, and malformed provider responses.
5. Test duplicate submissions and ensure the provider contract is idempotent where the
   selected provider supports it.

**Acceptance:**

- Tests cover valid submission, every invalid field, oversized input, bot trap, timeout,
  provider error, and successful redirect
- No rejected input reaches the provider
- A public launch checklist identifies the active rate-control owner and configuration

**Commit:** `v0.5.1 H3: harden lead submission`

**Session boundary:** start H.4 in a fresh task.

### H.4 — Add truth and production-readiness gates

**Primary files:** `content/site.json`, content types/schemas, validator, deployment
checklist, current sample content

1. Add an explicit content lifecycle state such as `sample` versus `verified`. Current
   roofing content starts as `sample`.
2. Add `npm run verify:production` (or an equivalent predeploy command) that rejects
   sample status, reserved phone numbers, incomplete NAP, unreviewed legal text, missing
   form delivery, missing real images, and other launch blockers.
3. Inventory factual claims in current content, including licence/insurance, 25+ years,
   1,200+ projects, 24/7 response, warranties, testimonials, and ratings. Each is verified
   against a recorded source or removed. Do not invent replacements.
4. Keep the ordinary development build usable with clearly marked sample content while
   making it impossible to mistake that build for production-ready output.
5. Produce a human review checklist for facts that software cannot prove: business
   identity, local knowledge, testimonials, legal language, and GBP alignment.

**Acceptance:**

- Current sample content passes development validation but fails production verification
- A verified fixture passes; each launch blocker has a failing fixture
- No unsupported trust claim remains eligible for production output
- Human-owned verification items name the required source and reviewer

**Commit:** `v0.5.1 H4: add production truth gate`

**Session boundary:** stop here if real business facts or legal review are required;
record the exact dependency rather than fabricating content. Otherwise start H.5 fresh.

### H.5 — Correct indexation and structured-data safety

**Primary files:** `src/components/common/JsonLd.tsx`, `src/lib/schema/`,
`src/lib/metadata.ts`, `src/app/sitemap.ts`, `content/pages/thank-you.json`, manifest

1. Safely serialize JSON-LD so authored content cannot terminate the script element.
2. Give the LocalBusiness and WebSite stable `@id` values. Connect Service provider,
   Review `itemReviewed`, and AggregateRating to the same business entity.
3. Emit review/rating data only from verified source content and validate rating ranges.
4. Mark `/thank-you` `noindex` and remove it from the sitemap. Add a reusable indexation
   field if future utility pages need the same treatment.
5. Use truthful sitemap modification dates or omit them; deployment time is not a content
   update. Remove manifest references to missing assets or add the actual valid asset.
6. Validate representative graphs against schema.org tooling and preserve fixtures of the
   expected connected graph.

**Acceptance:**

- A JSON-LD fixture containing `</script>` cannot escape the script payload
- Home, service, FAQ, location, and rated-testimonial fixtures form the expected connected
  graph without unsupported nodes
- `/thank-you` has `noindex` and is absent from the sitemap
- Sitemap and manifest reference only truthful dates and existing assets

**Commit:** `v0.5.1 H5: harden schema and indexation`

> **Implementation note.** Schema.org's validator found that `serviceType` is valid on
> the `Service` node but not on `HomeAndConstructionBusiness`. H.5 removed it from
> `LocalBusiness` while retaining it on `Service`. The representative connected graph
> then passed the official validator with 0 errors and 0 warnings across BreadcrumbList,
> WebSite, Service, Review, AggregateRating, and FAQPage.

**Session boundary:** start H.6 in a fresh task.

### H.6 — Add automated tests and CI

**Primary files:** test configuration, test fixtures, `.github/workflows/`, `package.json`

1. Use the smallest test stack that supports TypeScript modules reliably. Add unit tests
   for runtime schemas, content loading, URL assembly, metadata, schema builders, legal
   page generation, and contact-action behavior.
2. Add fixture-driven negative tests for every validator defect class introduced through
   H.5. Tests must assert the failure reason, not just a nonzero exit code.
3. Add a production-build integration check for routes, unique titles/canonicals,
   indexation, JSON-LD graphs, `tel:` links, and absence of server-only configuration.
4. Add browser coverage for mobile navigation and the contact form's validation/error
   states. Keep full Lighthouse testing for Phase 6, but make browser correctness part of
   CI now.
5. Add GitHub Actions for validation, lint, typecheck, tests, and production build on pull
   requests and pushes to the development repository.

**Acceptance:** a clean checkout runs one documented verification command and CI enforces
the same required checks. Deliberately breaking a schema fixture, canonical, form
boundary, or client-secret assertion causes CI to fail.

**Commit:** `v0.5.1 H6: add regression suite and CI`

**Session boundary:** start H.7 in a fresh task.

### H.7 — Reconcile documentation and release v0.5.1

**Primary files:** `README.md`, `package.json`, `docs/CHANGELOG.md`, `docs/SESSION.md`,
`docs/HANDOFF.md`, `docs/CONTENT_SCHEMA.md`, `docs/DEPLOYMENT.md`

1. Update package and documentation versions to v0.5.1.
2. Document runtime schemas, sample versus verified content, server-only conversion
   configuration, production verification, tests, CI, and the decision that `/contact`
   is the required v1 conversion destination.
3. Audit every README path and workflow claim against the actual tree. Do not describe
   `niches/` or dynamic content directories as present until they exist.
4. Run the complete v0.5.1 verification command and inspect the production output.
5. Update the handoff so a cold session starts at Phase 4.1 without re-auditing H.1–H.7.

**Acceptance:** docs agree on version, current phase, repository, commands, and next task;
all automated checks pass; the production gate still rejects the sample roofing site for
the documented real-world dependencies.

**Commit:** `v0.5.1: production hardening`

**Phase boundary:** begin Phase 4 in a new Codex task.

