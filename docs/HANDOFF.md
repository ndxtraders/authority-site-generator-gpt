# Handoff — Phases 4 through 6

**Written:** 2026-08-04
**Repo:** `ndxtraders/authority-site-generator`, branch `main`, at `f8abd8d` (pushed)
**State:** Phases 0–3 complete. Build green, 16 routes, tsc/lint/validator all clean.
Start at Phase 4.1.

---

## Read these first, in this order

1. `docs/FRAMEWORK_PRD.md` — what we're building. **Source of truth.** If anything
   contradicts it, the PRD wins.
2. `docs/IMPLEMENTATION_PLAN.md` — your task list. Phase 4 is next; its full text (tasks
   4.1–4.5) sits right after the Phase 3 section, which now carries revision notes on
   3.1–3.5 worth skimming — they record real decisions, not just history.
3. `docs/SESSION.md` — current status snapshot and the "known stubs" list (do not ship
   items). Kept up to date at the end of every phase; trust it over memory.
4. `docs/CHANGELOG.md` — what shipped in each version, in more implementation detail
   than SESSION.md.
5. `AGENTS.md` — **this is Next.js 16, not the Next.js in your training data.** Read the
   bundled guide in `node_modules/next/dist/docs/` before writing code that touches
   routing, metadata, or forms. Phase 4 is dynamic routes end to end — read
   `generate-static-params.md` and `dynamic-routes.md` before 4.1, not during.

Don't start work by re-deriving context that's already written down in one of the five
files above. If something in this handoff conflicts with the plan or the PRD, the plan
and PRD win — this file is a summary, not the source of truth.

---

## What already exists

Phases 0–3 are done. You are extending a working framework, not starting one.

| Thing | Where | Notes |
|---|---|---|
| Content model | `content/site.json` + `content/pages/*.json` | 5 pages today: home, about, services, contact, thank-you |
| Section union | `src/types/sections.ts` | `SectionPropsMap` is the single source; `Section`/`SectionType` derive from it |
| Section dispatch | `src/lib/sections.tsx` | Exhaustive switch — **do not convert to a lookup table**, read the file's own comment first. Also the injection point for site-wide data (`business`, `conversion`) into section props that need more than their JSON content |
| Content loader | `src/lib/content.ts` | The only module that knows where content lives. **Currently a static import map (`PAGES` object) — see "The one architectural thing" below** |
| Validator | `scripts/validate-content.mts` | Gates `next build` via `prebuild`. Errors fail the build; warnings print only |
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

## The one architectural thing Phase 4 has to resolve

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

## Start here: Phase 4.1, then 4.2, then 4.3

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

Work one task at a time, in order. Don't start a task until the previous one's acceptance
check passes.

---

## One PRD/plan discrepancy worth surfacing to Rev before Phase 4 goes far

`FRAMEWORK_PRD.md` §5's route table lists a dedicated `/estimate` page as part of the
conversion flow, alongside `/thank-you`. `IMPLEMENTATION_PLAN.md` never schedules a task
for it — it's absent from every phase, including Phase 3 where the conversion layer was
actually built. Phase 3.2 pointed every primary CTA ("Free Estimate" etc.) at the
existing `/contact` page instead, since that was the only real destination available
without inventing a route the plan never asked for. That's a reasonable call, but it's a
real gap between what the PRD's route table promises and what exists — worth a decision
from Rev (keep pointing at `/contact`, or add `/estimate` as its own task) rather than
silently resolving itself. Flagged here rather than acted on unilaterally.

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

**Commit per phase, not per task.** Ask before pushing to `main` — unless Rev has
already granted standing permission for the current phase in chat, as happened for
Phase 3. That permission does not automatically carry forward to Phase 4; ask again.

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

---

## Definition of done

From the PRD, unchanged:

1. A new site in an existing niche launches with **zero** changes under `src/`
2. A plumbing site builds from the same `src/` with a different niche pack and content
3. Every PRD §10 checklist item passes on the generated roofing site
4. The validator catches all 25 defect classes in the plan's ledger
5. Lighthouse ≥ 95 across all categories
