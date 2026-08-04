# Current Session

**Version:** v0.5 complete; v0.5.1 planned
**Phase:** H.1 — executable content contract is next
**First market:** Modesto, CA (roofing)
**Authorized repo:** `ndxtraders/authority-site-generator-gpt`

## Where we are

Phases 0–3 produced a working section framework, page content model, initial validator,
SEO/schema engine, click-to-call flow, Server Action form path, legal templates, and mobile
navigation. An independent production-readiness review confirmed the architecture and
clean build, then identified hardening work that must precede page and niche expansion.

The PRD is now v1.1 with decisions D7–D11. `docs/IMPLEMENTATION_PLAN.md` contains Phase H,
seven sequenced v0.5.1 tasks. Each H task is a natural Codex session boundary.

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

## Next — exact starting point

Start a fresh Codex task for **H.1 — Establish the executable content contract** in
`docs/IMPLEMENTATION_PLAN.md`. Do not start Phase 4 until H.1–H.7 pass.

H.1 begins by selecting the smallest shared runtime-schema approach, adding failing
fixtures for malformed nested props and formats, and replacing JSON casts at the loader
boundary. Read the relevant Next.js 16 bundled docs before changing build-time loading.

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
