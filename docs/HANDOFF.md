# Handoff — Phases 2 through 6

**Written:** 2026-08-04
**Repo:** `ndxtraders/authority-site-generator`, branch `main`, at `f9892d9`
**State:** Phases 0 and 1 complete. Build green. Start at Phase 2.1.

---

## Read these first, in this order

1. `docs/FRAMEWORK_PRD.md` — what we're building. **Source of truth.** If anything
   contradicts it, the PRD wins.
2. `docs/IMPLEMENTATION_PLAN.md` — your task list. Phases 2–6.
3. `docs/AI_GUIDELINES.md` — hard rules. Violating one is a bug, not a style call.
4. `AGENTS.md` — **this is Next.js 16, not the Next.js in your training data.**

Don't skip 4. Read the bundled guide in `node_modules/next/dist/docs/` before writing
code that touches routing, metadata, or forms. The plan's opening table maps each topic
to its exact file.

---

## What already exists

You are not starting from scratch. Phase 1 built the foundation:

| Thing | Where | Notes |
|---|---|---|
| Content model | `content/site.json` + `content/pages/*.json` | Page files carry `slug`, `pageType`, `seo`, `schema`, `sections`, `internalLinks` |
| Section union | `src/types/sections.ts` | `SectionPropsMap` is the single source; `Section` and `SectionType` derive from it |
| Section dispatch | `src/lib/sections.tsx` | Exhaustive switch. **Do not convert to a lookup table** — read the comment first |
| Section type set | `src/lib/section-types.ts` | Separate from `sections.tsx` so the validator can import it without React |
| Content loader | `src/lib/content.ts` | The only module that knows where content lives |
| Validator | `scripts/validate-content.mts` | Gates `next build` via `prebuild` |
| Page types | `src/types/page.ts` | `PageType` and `SchemaGraph` unions already include Phase 4's routes |

All four pages are 7-line orchestrators. There is **no business copy in `src/`** — keep
it that way.

---

## Start here: Phase 2.1, then 2.2

**2.2 is the highest-value task in the entire plan.** Right now every page emits the home
page's canonical:

```
index    -> canonical https://roofrepairmodesto.com
about    -> canonical https://roofrepairmodesto.com
services -> canonical https://roofrepairmodesto.com
contact  -> canonical https://roofrepairmodesto.com
```

That tells Google not to index three of four pages. It is a live SEO defect, not a nit.

The fix is mostly wiring: `content/pages/*.json` already carries a correct per-page `seo`
block with a unique title, description, and `canonicalPath`. You need `generateMetadata`
on each page, sourced from `page.seo`, plus `metadataBase` from `site.url`.

`src/app/layout.tsx` has two blocks marked `TEMPORARY` with the phase that replaces them.
Both are yours: 2.2 (metadata) and 2.3 (schema).

---

## Rules that matter most here

**Never put business-specific strings in `src/`.** No copy, city names, phone numbers, or
domains. `content/` and `niches/` only. Check yourself with:

```bash
grep -rniE '\b(roof|modesto|shingle|gutter)\b' src/components src/lib src/types src/app
```

**The domain appears exactly once.** After 2.1, `site.url` is the only place. Today it is
still hardcoded in `sitemap.ts`, `robots.ts`, and `manifest.ts` — that's 2.1 and 2.4.

**Run the full build, unfiltered.** Do not pipe it through `grep` and read the first
"Compiled successfully" as a pass. That exact mistake hid a real type-check failure
during Phase 1. Run `npm run build` and read the whole output.

**Commit per phase, not per task.** Never push to `main` without asking Rev.

**Never delete a file without asking.** Move it to `Archive/` instead.

---

## If the plan turns out to be wrong

Stop and say so. Do not improvise around it.

This has already happened twice and both times the plan was the thing that was wrong:

- **1.2** specified a component lookup table with a `@ts-expect-error`. It cannot be made
  type-safe. Replaced with a switch, and the plan was corrected.
- **1.5** specified two new sections. It needed three, because the contact form had
  nowhere else to live.

Both are recorded in the plan as revision notes. Follow that pattern: implement the
better thing, then update the plan so the next reader isn't misled. A plan that lies is
worse than no plan.

There is one explicit tripwire in Phase 5.3: if the locksmith niche needs more than one
new component, **halt and report**. That would challenge PRD decision D1 (one framework,
not per-niche forks), which is Rev's call and not yours.

---

## Two stubs that must not ship

Both are marked in-file and tracked in the plan. Neither is yours to leave behind.

1. **`submitLead()` in `src/components/forms/ContactForm.tsx` is simulated.** It awaits a
   timer and reports success for a lead that was never captured. Phase 3.3 makes it real.
   Until then the site cannot go live.

2. **NAP data is empty** — `business.address.street`, `postalCode`, `geo`, `hours`,
   `sameAs`, `licenseNumber`. The phone is a 555 placeholder. The validator warns on all
   six. **Do not invent values.** These are factual claims about a real business; ask Rev.
   Before launch these warnings should become errors.

---

## Content you should not write alone

Phase 4.3 asks for real local knowledge — Modesto climate, permits, neighborhoods, common
local roof failure modes. Per `AUTHORITY_MODEL.md` this is the entire competitive moat,
and fabricated local facts would poison it.

Write the structure, flag the specifics for Rev's review, and say plainly which parts are
placeholders. Generic filler will also fail the validator's location-page rule.

---

## Definition of done

From the PRD, unchanged:

1. A new site in an existing niche launches with **zero** changes under `src/`
2. A plumbing site builds from the same `src/` with a different niche pack and content
3. Every PRD §10 checklist item passes on the generated roofing site
4. The validator catches all 25 defect classes in the plan's ledger
5. Lighthouse ≥ 95 across all categories

Work one task at a time, in order. Don't start a task until the previous one's acceptance
check passes.
