# Current Session

**Version:** v0.5 complete; v0.5.1 H.1 complete
**Phase:** H.2 — server-only conversion boundary is next
**First market:** Modesto, CA (roofing)
**Authorized repo:** `ndxtraders/authority-site-generator-gpt`

## Where we are

Phases 0–3 produced a working section framework, page content model, initial validator,
SEO/schema engine, click-to-call flow, Server Action form path, legal templates, and mobile
navigation. An independent production-readiness review confirmed the architecture and
clean build, then identified hardening work that must precede page and niche expansion.

The PRD is now v1.1 with decisions D7–D11. `docs/IMPLEMENTATION_PLAN.md` contains Phase H,
seven sequenced v0.5.1 tasks. H.1 now provides the shared executable content contract;
H.2–H.7 remain. Each H task is a natural Codex session boundary.

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

## Next — exact starting point

Start a fresh Codex task for **H.2 — Make the conversion boundary server-only** in
`docs/IMPLEMENTATION_PLAN.md`. Do not start H.3 or Phase 4.

H.2 begins by separating display-safe conversion values from endpoint/provider
configuration, then updating the Server Action and ContactForm boundary so the browser
never receives the full conversion object. Preserve H.1's parser as the only content
loader boundary.

## Known launch blockers

- Current business phone and tracking number use reserved 555 data
- Address, postal code, geo, hours, sameAs, and licence number are incomplete
- Form delivery is not configured and the current boundary would expose a future endpoint
- Raw lead data is logged when delivery is not configured
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
