# Current Session

**Version:** v0.5 complete; v0.5.1 H.1–H.2 complete
**Phase:** H.3 — lead validation, timeout, and abuse controls is next
**First market:** Modesto, CA (roofing)
**Authorized repo:** `ndxtraders/authority-site-generator-gpt`

## Where we are

Phases 0–3 produced a working section framework, page content model, initial validator,
SEO/schema engine, click-to-call flow, Server Action form path, legal templates, and mobile
navigation. An independent production-readiness review confirmed the architecture and
clean build, then identified hardening work that must precede page and niche expansion.

The PRD is now v1.1 with decisions D7–D11. `docs/IMPLEMENTATION_PLAN.md` contains Phase H,
seven sequenced v0.5.1 tasks. H.1 provides the shared executable content contract and
H.2 isolates lead-delivery configuration on the server; H.3–H.7 remain. Each H task is
a natural Codex session boundary.

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
- `npm test` — passed, 16/16, including rejection of provider endpoints from public content
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
- `npm test` — passed, 15/15
- Sentinel production build — passed, 16 routes generated
- Sentinel endpoint, authorization value, and environment-variable names — absent from
  27 client static assets and 90 built HTML/RSC/text payloads
- Live unconfigured submission — returned the visitor-safe error path; production log
  contained only request ID, `delivery_not_configured`, and duration
- Live mock-provider submission — provider accepted the server-only authorization value,
  then the action returned `303 Location: /thank-you`; success log contained metadata only

## Next — exact starting point

Start a fresh Codex task for **H.3 — Validate and protect lead submission** in
`docs/IMPLEMENTATION_PLAN.md`. Do not start H.4 or Phase 4.

H.3 begins with bounded server-side field validation, then adds accessible errors,
honeypot/timing controls, provider timeout and failure handling, and a documented
rate-control owner. Preserve H.1's parser and H.2's server-only configuration boundary.

## Known launch blockers

- Current business phone and tracking number use reserved 555 data
- Address, postal code, geo, hours, sameAs, and licence number are incomplete
- Form delivery is not configured because no provider endpoint has been selected
- Current trust statistics and testimonials have not been verified
- Generated legal templates have not been reviewed by counsel
- Review/AggregateRating schema has no verified ratings and is not entity-connected
- The thank-you page is currently indexable and in the sitemap
- Starter assets remain; the manifest references an icon that does not exist
- Mobile navigation has not had a real browser keyboard pass
- No project test suite or CI protects the acceptance criteria

## Session checkpoint rule

At the end of each H task: run its checks, commit the checkpoint, update this file with
results and the exact next task, update `docs/HANDOFF.md` if architecture changed, and
start the next numbered task in a fresh Codex session.

## Repository boundary

Only `authority-site-generator-gpt` is authorized for edits and pushes. The local and
GitHub `authority-site-generator` upstreams are protected and must not be modified unless
Rev proactively initiates that exact request.
