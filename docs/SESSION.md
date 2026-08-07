# Current state

**Version:** v0.5 complete; v0.5.1 H.1–H.6 complete
**Next task:** **H.7** — documentation reconciliation and v0.5.1 release
**Branch:** `agent/v0-5-1-h6` (includes H.6); `main` is at H.5, three commits behind
**First market:** Modesto, CA (roofing)
**Authorized repo:** `ndxtraders/authority-site-generator-gpt`

> Current state only. Completed work is described in `docs/CHANGELOG.md`; known bugs are
> in `docs/DEFECTS.md`. Keep this file under ~120 lines.

## Where we are

Phases 0–3 produced the section framework, page content model, validator, SEO/schema
engine, click-to-call flow, Server Action form path, legal templates, and mobile
navigation. Phase H then hardened it: H.1 gave a shared executable content contract, H.2
isolated lead-delivery configuration on the server, H.3 validated and protected lead
submission, H.4 separated sample content from verified production evidence, H.5 completed
structured-data and indexation safety, and H.6 added regression coverage and CI.

The PRD is at v1.1 with decisions D7–D11. H.7 remains, then Phase 4.

## Last verified state

All checks pass on `agent/v0-5-1-h6` as of 2026-08-06:

| Check | Result |
|---|---|
| `npm run validate` | 5 pages, 9 expected development warnings |
| `npm run lint` | pass |
| `npm run typecheck` | pass |
| `npm test` | 84/84 |
| `npm run test:build` | 5/5, 16 routes |
| `npm run test:browser` | 2/2 Chromium at 375px |
| `npm run verify:production` | **fails as required** — 39 documented blockers on sample content |

## Next — exact starting point

Start a fresh session for **H.7 — Reconcile documentation and release v0.5.1**
(`docs/plan/phase-h.md`). Do not start Phase 4 before H.7 passes.

Preserve H.4's split: `contentState` is public-safe site content, `content/production.json`
is verification evidence, and the latter must never enter the application loader or browser
payloads. Do not mark pending facts verified without the recorded source and accountable
human reviewer required by `docs/DEPLOYMENT.md`.

Note for H.7: `package.json` still reads `"version": "0.3.0"` (defect #39), and the
documentation restructure of 2026-08-06 is already done — H.7 should verify it rather than
repeat it.

## Known launch blockers

Real-world dependencies, not code defects. Code defects are in `docs/DEFECTS.md`.

- Business phone and tracking number use reserved 555 data
- Address, postal code, geo, hours, `sameAs`, and licence number are incomplete
- Form delivery is not configured — no provider endpoint has been selected
- Provider/edge rate control is documented but cannot be activated until a provider exists
- All 19 trust/service claim groups remain pending in `content/production.json`
- Business identity, local knowledge, testimonials, legal, GBP, rate-control, and
  image-rights human reviews remain pending
- Generated legal templates have not been reviewed by counsel
- Review/AggregateRating schema is connected and gated, but no verified ratings exist yet
- Starter assets remain; real, rights-cleared production images are required
- `npm audit --omit=dev` reports Hono, bundled PostCSS, and Sharp advisories. The complete
  fix moves pinned Next 16.2.12 to 16.3.0 — handle as a separately scoped upgrade with
  bundled Next 16 documentation review and full verification.

**Do not invent values for any of these.** They are factual claims about a real business;
ask Rev.

## Intentional uncommitted state

`Archive/h4-pre-change-2026-08-04/`, `Archive/h5-pre-change-2026-08-04/`,
`Archive/h6-pre-change-2026-08-04.tar.gz`, `Archive/handoff-main-publish-2026-08-04/`,
`Archive/systems-thinking-pre-idea-register-2026-08-04.tar.gz`, and
`Archive/docs-restructure-2026-08-06/` are local pre-edit safety copies, excluded from
product checkpoints.

## Repository boundary

Only `authority-site-generator-gpt` is authorized for edits and pushes. The local and
GitHub `authority-site-generator` upstreams are protected and must not be modified unless
Rev proactively initiates that exact request.
