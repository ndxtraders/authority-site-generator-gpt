# Handoff — architecture and hard-won rules

**Written:** 2026-08-04 · **Restructured:** 2026-08-06
**Repo:** `ndxtraders/authority-site-generator-gpt`

> **This file holds architecture and the rules that cost something to learn.** It is not a
> status file — current state and the next task are in `docs/SESSION.md`. It is not a
> history file — completed work is in `docs/CHANGELOG.md`. It is not a bug list — defects
> are in `docs/DEFECTS.md`. Read it when you need to understand how the system fits
> together or why a decision was made, not to find out what to do next.

> **Prime Directive:** Work only in the GPT local folder and GitHub repository. The local
> and GitHub `authority-site-generator` upstreams are protected unless Rev proactively
> initiates a request to modify them. Verify `pwd` and `git remote -v` before writing.

If this file conflicts with `docs/FRAMEWORK_PRD.md` or the plan, the PRD and plan win.

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
| Content quality rules | `src/lib/content-quality.ts` | Shared pure seam for placeholder scanning, CTA enforcement, NAP warnings, and location specificity |
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
| Legal pages | `src/lib/legal.ts` + `src/app/(legal)/[slug]/page.tsx` | Generated templates, real business fields only, **not legal-reviewed**, and **outside the content contract — see defect #41** |
| Mobile nav | `src/components/layout/MobileNav.tsx` | Client component isolated from `Header` (stays a Server Component); native `<button>`/`<Link>`, `aria-expanded`/`aria-controls`, closes on Escape/selection |
| Test harness | `tests/`, `playwright.config.ts`, `docs/TESTING.md` | 84 unit/fixture tests, 5 built-output assertions, 2 Chromium browser checks; `npm run verify` is the clean-checkout command |
| CI | `.github/workflows/ci.yml` | Runs the full verification command on every push and pull request |

All pages are thin orchestrators. There is **no business copy in `src/`** — keep it that
way.

---

## The one architectural thing Phase 4 must resolve

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

H.1 made every import pass through the runtime parser, but the import list is still manual
because every current page is known and named at build time. That enumeration stops scaling
at 4.1: `services/[slug]`, `service-area/[slug]`, and `faq/[slug]` each need
`generateStaticParams` over a **directory** of content files (`content/services/*.json`,
`content/locations/*.json`, `content/faq/*.json` — see `CONTENT_SCHEMA.md`'s target shape),
not a hand-maintained map entry per file. The `content.ts` file comment and the 2.4 revision
note both already flag this as deferred to Phase 4 — this is that phase.

You'll likely add something like `getServiceSlugs()` / `getServiceBySlug(slug)` (and the
location/FAQ equivalents) backed by `readdirSync` + static per-file imports, or an
`import.meta.glob`-equivalent pattern — check what Next 16 actually supports before
assuming. This is exactly the kind of routing/data-loading question `AGENTS.md` says to
check the bundled docs for rather than pattern-matching on older Next.js knowledge.

**Related:** `parseContentBundle` already accepts source/route records and an
`additionalKnownPaths` parameter, so Phase 4 can pass service, location, and FAQ
collections through the same contract without duplicating schema logic. That parameter is
currently dead (defect #42) and legal routes are the reason it needs wiring.

---

## Resolved route decision

PRD D11 resolves the old `/estimate` discrepancy: `/contact` is the required v1 estimate
and inquiry destination. A separate `/estimate` route is optional only when it serves a
materially different campaign or form intent. Note that `/contact` is currently hardcoded
in four components rather than content-driven (defect #44).

---

## Rules that matter most here

**Never put business-specific strings in `src/`.** No copy, city names, phone numbers, or
domains. `content/` only. Check yourself with:

```bash
grep -rniE '\b(roof|modesto|shingle|gutter)\b' src/components src/lib src/types src/app
```

**Run the full build, unfiltered.** Do not pipe it through `grep` and read the first
"Compiled successfully" as a pass. That exact mistake hid a real type-check failure during
Phase 1. Run `npm run build` and read the whole output.

**Server Actions, not Route Handlers, for form-like submissions.** Established in 3.3 —
`useActionState` + a `"use server"` action is this framework's idiomatic pattern per
`forms.md`. Don't reach for `fetch()` + a Route Handler out of habit from older Next.js
projects.

**Style real links as buttons with `buttonVariants()`, never `Button`'s `render` prop.**
Established in 3.2 — `render` injects `role="button"` onto whatever it wraps, which is
wrong for a genuine navigational `<a href>`. `buttonVariants()` is the plain `cva()`
className function, already exported from `button.tsx` for this.

**Never emit an empty or unproven claim in structured data.** Omit the field instead. See
`src/lib/schema/localBusiness.ts` and `src/lib/schema/review.ts` — both refuse to fabricate,
and the second returns `[]` rather than invent a rating.

**Commit at every completed session task.** Rev has granted standing permission for
reasonable commits and pushes to `ndxtraders/authority-site-generator-gpt`. Never apply that
permission to the protected upstream repository.

**Never delete a file without asking.** Move it to `Archive/` instead.

**Keep documentation cheap.** One fact, one home. See the documentation rules in
`AGENTS.md`.

---

## If the plan turns out to be wrong

Stop and say so. Do not improvise around it.

This has happened four times so far and each time the plan (not the code) was the thing that
needed correcting. All four are recorded as revision notes in the phase files, in place, at
the task they correct:

- **1.2** — a component lookup table with `@ts-expect-error` couldn't be made type-safe.
  Replaced with a switch.
- **1.5** — two new sections were specified; three were needed, because the contact form had
  nowhere else to live.
- **2.4** — the "zero-code-change bar" acceptance check doesn't hold until Phase 4 makes
  `content.ts` real directory enumeration. Documented, deferred, not faked.
- **3.1–3.5** — five separate notes: `formEndpoint` shipped empty rather than a fake URL;
  `buttonVariants()` over `Button`'s `render` prop; the Server Actions pivot; the legal
  pages' "template, not legal review" caveat; mobile nav verified via HTML output, not an
  actual browser (no browser tool was available that session).

Follow the same pattern: implement the better thing, then update the plan so the next reader
isn't misled. **A plan that lies is worse than no plan.**

There is one explicit tripwire in Phase 5.3: if the locksmith niche needs more than one new
component, **halt and report**. That would challenge PRD decision D1 (one framework, not
per-niche forks), which is Rev's call, not yours.
