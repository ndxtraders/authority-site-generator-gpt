# Handoff — v0.5.1 hardening through v1.0

**Written:** 2026-08-04
**Repo:** `ndxtraders/authority-site-generator-gpt`
**State:** Phases 0–3 and H.1 complete. Start at H.2.

> **Prime Directive:** Work only in the GPT local folder and GitHub repository. The local
> and GitHub `authority-site-generator` upstreams are protected unless Rev proactively
> initiates a request to modify them. Verify `pwd` and `git remote -v` before writing.

---

## Read these first, in this order

1. `docs/FRAMEWORK_PRD.md` — what we're building. **Source of truth.** If anything
   contradicts it, the PRD wins.
2. `docs/IMPLEMENTATION_PLAN.md` — your task list. Phase H (v0.5.1) is next; H.1–H.7
   must finish before Phase 4.
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

---

## Start here — H.2, not Phase 4

The production-readiness review found that the architecture is sound but the quality gate
is shallower than its documentation, the conversion boundary leaks future server
configuration into browser payloads, failed forms log raw PII, trust claims can ship
without verification, structured-data nodes are unsafe/disconnected, and no tests or CI
enforce the acceptance criteria.

Phase H addresses those risks before the framework multiplies routes and niches:

1. **H.1** — runtime schemas and strict content parsing — **complete**
2. **H.2** — server-only conversion configuration — **next**
3. **H.3** — lead validation, timeout, and abuse controls
4. **H.4** — sample/verified content states and production truth gate
5. **H.5** — JSON-LD safety, connected entities, and indexation
6. **H.6** — automated tests, browser checks, and GitHub CI
7. **H.7** — documentation reconciliation and v0.5.1 release

Treat each task as one Codex session. H.1 is the completed checkpoint; begin H.2 in a
fresh session. When its acceptance checks pass, commit, update `docs/SESSION.md`, and
stop before H.3. Do not switch sessions in the middle of a failing build or partial
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

---

## What already exists

Phases 0–3 are done. You are extending a working framework, not starting one.

| Thing | Where | Notes |
|---|---|---|
| Content model | `content/site.json` + `content/pages/*.json` | 5 pages today: home, about, services, contact, thank-you |
| Runtime contract | `src/lib/content-schema.ts` | Strict shared Zod schemas; TypeScript content types are inferred from them |
| Section union | `src/types/sections.ts` | Re-exports schema-inferred `SectionPropsMap`, `Section`, and `SectionType` |
| Section dispatch | `src/lib/sections.tsx` | Exhaustive switch — **do not convert to a lookup table**, read the file's own comment first. Also the injection point for site-wide data (`business`, `conversion`) into section props that need more than their JSON content |
| Content loader | `src/lib/content.ts` | The only module that knows where content lives. Parses static imports through the shared contract. **Still a static `PAGES` map — see "The one architectural thing" below** |
| Validator | `scripts/validate-content.mts` | Uses the shared bundle parser and gates `next build` via `prebuild`; errors fail, development warnings print only |
| Metadata | `src/lib/metadata.ts` | `buildPageMetadata(page)` — every page has a unique title/description/canonical |
| Schema engine | `src/lib/schema/` | `buildSchema(page, site)` — LocalBusiness + BreadcrumbList always; FAQPage/Review conditional on section presence; WebSite/Service on `page.schema` opt-in |
| Conversion config | `src/types/site.ts` → `ConversionConfig`, `content/site.json` → `conversion` block | `trackingPhone`/`displayPhone` for `tel:` links, `formEndpoint` (empty — see stubs), `thankYouPath`, `model` |
| Click-to-call | `src/components/common/CallLink.tsx` | Plain `<a href="tel:...">`, styled via `buttonVariants()` where it needs to look like a button — **not** `Button`'s `render` prop (injects `role="button"` onto real links, wrong) |
| Contact form | `src/components/forms/ContactForm.tsx` + `src/lib/actions/contact.ts` | Server Action + `useActionState`, the framework's own idiomatic pattern per `forms.md`. Redirects to `conversion.thankYouPath` on success |
| Legal pages | `src/lib/legal.ts` + `src/app/(legal)/[slug]/page.tsx` | Generated templates, real business fields only, **not legal-reviewed** |
| Mobile nav | `src/components/layout/MobileNav.tsx` | Client component isolated from `Header` (stays a Server Component); native `<button>`/`<Link>`, `aria-expanded`/`aria-controls`, closes on Escape/selection |

All pages are still thin orchestrators. There is **no business copy in `src/`** — keep it
that way.

---

## After hardening: the architectural task Phase 4 must resolve

`src/lib/content.ts` loads pages via static imports into a `PAGES` object:

```ts
const PAGES = {
  home: homePage as unknown as PageContent,
  about: aboutPage as unknown as PageContent,
  // ...
} satisfies Record<string, PageContent>;
```

This was fine through Phase 3 because every page was known and named at build time. It
stops being fine at 4.1: `services/[slug]`, `service-area/[slug]`, and `faq/[slug]` each
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

1. **`conversion.formEndpoint` is empty.** No lead-delivery provider (email/CRM) is
   wired up yet. The Server Action (`src/lib/actions/contact.ts`) is honest about this —
   it returns a real error instead of a fake success — but no lead submitted through the
   live form is delivered anywhere. Someone needs to pick a provider and set this before
   launch. Not a Phase 4 task; flagging so it doesn't get lost.
2. **Legal pages need real legal review.** `src/lib/legal.ts` generates from real
   business fields only, no fabricated claims — but it's a template, not counsel-reviewed
   content.
3. **Mobile nav's keyboard-only behavior was verified via built HTML output, not an
   actual browser.** No browser automation tool was available in the Phase 3 session. Do
   a manual pass at 375px before shipping if one still hasn't happened.
4. **NAP data is incomplete** — `business.address.street`, `postalCode`, `geo`, `hours`,
   `sameAs`, `licenseNumber` are all empty; phone is a 555 placeholder. The validator
   warns on all six (does not fail the build). **Do not invent values** — these are
   factual claims about a real business; ask Rev. Should become hard errors before
   launch.
5. **`TestimonialItem.rating` is unset on every testimonial**, so `Review`/
   `AggregateRating` schema is never emitted (PRD §6 wants it). Needs real ratings from
   the business, not a placeholder value.
6. **Runtime content validation was completed in H.1.** Keep
   `src/lib/content-schema.ts` as the single parser/type source and do not reintroduce
   loader casts.
7. **Future form configuration crosses the client boundary.** The ContactForm Client
   Component receives the full conversion object, and the unconfigured failure path logs
   raw lead fields. H.2 removes both behaviors.
8. **Lead abuse and failure controls are incomplete.** There are no maximum lengths,
   provider timeout, bot trap, or documented rate-control owner. H.3.
9. **Current proof and testimonial content is not verified.** The development sample
   includes licence/insurance language, numerical statistics, response-time claims, and
   testimonials that must be sourced or removed. H.4.
10. **Schema and indexation need correction.** JSON-LD needs safe serialization and
    connected `@id` references; `/thank-you` must be noindex and leave the sitemap. H.5.
11. **No automated project tests or CI exist.** H.6 establishes the regression suite
    before routing and niche expansion.

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
