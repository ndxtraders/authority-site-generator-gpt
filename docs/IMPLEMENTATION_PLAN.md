# Implementation Plan — v0.3 through v1.0

**Target repo:** `ndxtraders/authority-site-generator`
**Companion doc:** `docs/FRAMEWORK_PRD.md` — read it before starting. It is the source of truth.
**Status:** Ready to execute
**Written:** 2026-08-03

---

## How to use this plan

Work **one task at a time, in order**. Each task lists the files it touches, what to do,
and an acceptance check. Do not start a task until the previous task's acceptance check
passes.

Phases map to versions in the PRD (§11). Commit at the end of each phase, not each task.

### Before writing any code

This is **Next.js 16.2.12 with Turbopack**, not the Next.js in your training data. APIs
and conventions differ. Read the relevant bundled guide first:

| Topic | Read |
|---|---|
| Routing, layouts | `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md` |
| Metadata | `node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md` |
| `generateMetadata` | `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md` |
| Dynamic routes | `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/dynamic-routes.md` |
| `generateStaticParams` | `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-static-params.md` |
| sitemap.ts | `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/sitemap.md` |
| robots.ts | `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/robots.md` |
| Forms | `node_modules/next/dist/docs/01-app/02-guides/forms.md` |
| CSS | `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md` |

Heed deprecation notices in those files.

### Guardrails

1. **Never delete a file without asking.** Move to `Archive/` if unsure.
2. **Never push to `main` without explicit permission.** Commit locally; ask before pushing.
3. **Run `npx next build` after every task.** A task is not done if the build breaks.
4. **No business-specific strings in `src/`.** If you type "roof," "Modesto," or a phone
   number into a file under `src/`, you have made a mistake. The only exceptions are
   `content/` and `niches/`.
5. **Smallest diff that works.** Do not refactor neighboring code or rename for style.
6. **If a task reveals the plan is wrong, stop and say so.** Do not improvise around it.

---

# Phase 0 — Migration and documentation

Goal: a clean repo that a cold session can boot into and understand.

### 0.1 — Migrate the working tree

`roof-repair-modesto` has 9 modified and 20 untracked files that were never pushed.
`authority-site-generator` is a duplicate sitting at the same HEAD commit (`4777ad8`)
without them.

1. Clone `authority-site-generator` fresh.
2. Copy from `roof-repair-modesto`, overwriting: `src/`, `content/`, `PROJECT.md`,
   `docs/`, `AGENTS.md`, `CLAUDE.md`.
3. Do **not** copy `node_modules/`, `.next/`, or `.git/`.
4. `npm install`, then `npx next build`.

**Acceptance:** build passes, 8 routes prerender, `git status` shows the new files as
additions.

**Leave `roof-repair-modesto` untouched.** It is the fallback.

### 0.2 — Delete dead code

Move to `Archive/`, do not delete outright:

- `src/components/CTA.tsx`, `FAQ.tsx`, `Hero.tsx`, `ServiceCard.tsx` — superseded by
  `sections/`, referenced by nothing (verified by grep)
- `src/app/metadata.ts` — dead; nothing imports it. Its logic is rebuilt in Phase 2.

**Acceptance:** `grep -rn "components/CTA\|components/ServiceCard" src/` returns nothing;
build still passes.

### 0.3 — Fix the documentation layer

The repo's `.md` docs are stale conversions full of escaped markdown (`\#\#`, `\-`), and
two key documents exist **only** as `.docx` on the Desktop and were never committed.

1. Convert `~/Desktop/authority-site-generator/docs/AUTHORITY_MODEL.docx` and
   `SYSTEMS_THINKING.docx` to clean markdown in `docs/`.
2. Rewrite `docs/AI_CONTEXT.md`, `AI_GUIDELINES.md`, `SESSION.md` without escape
   artifacts.
3. Update `PROJECT.md`: strip escapes, and replace its "Current Progress" section with a
   pointer to `FRAMEWORK_PRD.md`. `PROJECT.md` becomes vision only; the PRD owns specs.
4. Delete the `ARCHITECTURE.md` and `TODO.md` references in `AI_CONTEXT.md` and
   `PROJECT.md` — those files do not exist and never did.
5. Rewrite `README.md`: what this is, how to run it, how to create a new site, which doc
   to read first.

**Acceptance:** no `\#` or `\-` sequences anywhere in `docs/` or `PROJECT.md`; every
document referenced by another document actually exists.

### 0.4 — Commit

One commit: `Migrate framework work and clean documentation layer`. Do not push yet.

---

# Phase 1 — v0.3: Content model and section registry

This is the foundation. Everything else depends on it. Take the time to get it right.

### 1.1 — Define the section union

**File:** `src/types/sections.ts` (new)

Move each section's props interface out of its component and into this file. Export a
discriminated union:

```ts
export type Section =
  | { type: "Hero";         props: HeroProps }
  | { type: "Services";     props: ServicesProps }
  | { type: "WhyChooseUs";  props: WhyChooseUsProps }
  | { type: "Proof";        props: ProofProps }
  | { type: "Process";      props: ProcessProps }
  | { type: "Testimonials"; props: TestimonialsProps }
  | { type: "FAQ";          props: FAQProps }
  | { type: "CTA";          props: CTAProps }
  | { type: "Authority";    props: AuthorityProps }
  | { type: "Answer";       props: AnswerProps }      // new, Phase 1.5
  | { type: "ContactInfo";  props: ContactInfoProps } // new, Phase 1.5

export type SectionType = Section["type"]
```

Components import their props type from here. This keeps composition-as-data type-safe —
a wrong prop for a given `type` becomes a compile error.

**Acceptance:** `npx tsc --noEmit` passes.

### 1.2 — Build the section registry

**File:** `src/lib/sections.tsx` (new)

> **Revised during implementation.** The original sketch used a component lookup table
> with a `@ts-expect-error`. That does not work: `REGISTRY[section.type]` and
> `section.props` resolve independently, widening to a union of components and a union
> of props with nothing correlating them. Suppressing the error would let Hero props
> flow into the FAQ component — discarding the exact safety the union exists to give.
> Dispatch is a switch instead. See the comment in `src/lib/sections.tsx`.

Two exports, each enforcing exhaustiveness a different way:

```tsx
// Runtime list, for the validator. Record<SectionType, true> makes the compiler
// reject both a missing key and an invented one.
const SECTION_TYPE_SET: Record<SectionType, true> = { Hero: true, /* ... */ }
export const SECTION_TYPES = Object.keys(SECTION_TYPE_SET) as SectionType[]
export function isSectionType(v: string): v is SectionType { /* ... */ }

// Type-safe dispatch. A switch narrows type and props together — no casts.
export function renderSection(section: Section, key: Key): ReactElement {
  switch (section.type) {
    case "Hero": return <Hero key={key} {...section.props} />
    // ... one case per section type
    default: {
      const unhandled: never = section   // missing case = compile error
      throw new Error(`Unknown section type: ${JSON.stringify(unhandled)}`)
    }
  }
}
```

Adding a section type therefore requires three edits — the props map, the type set, and
a switch case — and omitting either of the last two fails the build.

**Acceptance:** build passes; adding a type to the union without registering it breaks
the build.

### 1.3 — Restructure content

**Files:** `content/` (restructure)

Split `content/site.json` per PRD §4:

```
content/
  site.json          business, branding, navigation, footer, legal, conversion
  pages/
    home.json
    about.json
    contact.json
    services.json
```

`site.json` keeps: `business`, `branding`, `navigation`, `footer`, `schema`, and a new
`conversion` block (see 3.1). It **loses** `hero`, `services`, `whyChooseUs`, `proof`,
`process`, `testimonials`, `faq`, `cta`, `seo` — those move into page files.

Each page file follows the PRD §4 shape: `slug`, `pageType`, `seo`, `schema`,
`sections`, `internalLinks`.

Move the existing homepage content into `pages/home.json` as a `sections` array.
Move the hardcoded copy currently living in `about/page.tsx`, `services/page.tsx`, and
`contact/page.tsx` into their respective page files — **that copy is the reason this
phase exists.**

Add `business.address`, `business.geo`, `business.hours`, `business.sameAs`, and
`business.licenseNumber` — needed by the schema engine in Phase 2.

**Acceptance:** `grep -rn "roof\|Modesto" src/ --include=*.tsx -i` returns nothing.

### 1.4 — Rewrite the content loader

**Files:** `src/lib/site.ts`, `src/lib/content.ts` (new)

```ts
// content.ts
export function getSite(): SiteConfig
export function getPage(slug: string): PageContent
export function getAllPages(): PageContent[]      // enumerates content/pages/
export function getPagesByType(t: PageType): PageContent[]
```

Use static imports or `import.meta.glob`-equivalent enumeration — **not** `fs` at runtime,
since output must stay statically prerenderable (PRD D5).

**Acceptance:** `getAllPages()` returns 4 pages; build stays fully static.

### 1.5 — New sections

**Files:** `src/components/sections/Answer.tsx`, `ContactInfo.tsx`, `ContactForm.tsx` (new)

- `Answer` — the AEO answer-first block. Question as heading, 2–3 sentence direct answer,
  visually distinct. This is what gets cited by AI engines (PRD §6).
- `ContactInfo` — NAP block: phone, email, service area.
- `ContactForm` — section wrapper around the client form, so the contact page has no
  bespoke markup left.

All trade-agnostic. All registered in 1.2.

> **Revised during implementation.** Three sections, not two. `ContactForm` was added
> because the contact page's form could not otherwise move out of React, which 1.6
> requires. The contact page's two-column layout became a stacked one: keeping the
> columns would have required a single coupled `Contact` mega-section, and independent
> sections compose better — a service page can now use `ContactForm` without `ContactInfo`.
>
> **Injection pattern.** `ContactInfo` needs the business NAP, which belongs to site
> config rather than page content. Server Components cannot use React context, so
> `SectionPropsMap` holds *content* props only and `renderSection` passes site data
> explicitly (`<ContactInfo {...section.props} business={site.business} />`). The
> compiler checks each injection. Any future section needing site-wide data follows
> this pattern rather than importing content directly.

### 1.6 — Convert pages to orchestrators

**Files:** `src/app/page.tsx`, `about/page.tsx`, `services/page.tsx`, `contact/page.tsx`

Every page collapses to the same shape:

```tsx
export default function AboutPage() {
  const page = getPage("about")
  return <>{renderSections(page.sections)}</>
}
```

No copy. No conditionals. No section imports.

**Acceptance:** all four page files are under 15 lines; build passes; rendered output
matches the previous site.

### 1.7 — Build the content validator

**Files:** `scripts/validate-content.mts` (new), `package.json`

Implement every rule in PRD §4 and §7:

- Missing `seo.title` / `seo.description` / `canonicalPath`
- Duplicate `title` or `canonicalPath` across pages
- Unknown section `type`
- Placeholder content — `555-5555`, `Content coming soon`, `Lorem`, `TODO`, `example.com`
- Location page without local specificity
- `internalLinks` target that doesn't resolve
- Page with no CTA section

Wire it as a prebuild step:

```json
"scripts": {
  "validate": "node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/validate-content.mts",
  "prebuild": "npm run validate",
  "build": "next build"
}
```

Output must name the file and the rule, e.g.
`content/pages/about.json — missing seo.description`.

**Acceptance:** temporarily set a page's description to `""` → `npm run build` fails with
a clear message. Restore it → build passes.

> **Revised during implementation.** Three notes for anyone extending the validator.
>
> **No new dependency.** Node 26 strips types natively, so the validator runs as `.mts`
> with no `tsx`/`ts-node`. This requires importing with explicit `.ts` extensions, which
> in turn requires `allowImportingTsExtensions` in `tsconfig.json` — otherwise the Next
> build's type-check pass fails even though the script itself runs fine.
>
> **Errors vs. warnings.** Errors fail the build; warnings print and don't. Incomplete
> NAP data (`business.address.street`, `geo`, `hours`, `sameAs`, `licenseNumber`) and
> 555-range phone numbers are warnings, because the framework is pre-launch and real
> business data isn't available yet. They must become errors before a site goes live —
> `LocalBusiness` schema is materially weaker without them.
>
> **Exempt paths.** Some patterns are legitimate in context: `you@example.com` is correct
> in a form `placeholder`. Patterns carry an optional `exempt` path regex rather than
> being dropped. Prefer narrowing a rule over deleting it.
>
> **`SECTION_TYPE_SET` lives in `src/lib/section-types.ts`,** not `sections.tsx`, so the
> validator can import it without pulling React into a plain Node process.

### 1.8 — Commit

`v0.3: page-based content model, section registry, content validator`

---

# Phase 2 — v0.4: SEO and schema engine

### 2.1 — Single source for site URL

**Files:** `content/site.json`, `src/lib/url.ts` (new)

`site.url` is the only place the domain appears. Export `absoluteUrl(path)`.

**Acceptance:** `grep -rn "roofrepairmodesto.com" src/` returns nothing.

*Replaces:* the domain currently hardcoded 4× in `sitemap.ts` and 1× in `robots.ts`.

### 2.2 — Per-page metadata

**Files:** all `src/app/**/page.tsx`

Export `generateMetadata` from every page, sourced from `page.seo`. Must produce a
**unique title, unique description, and self-referencing canonical** per page, plus OG
and Twitter tags from the same source.

Root `layout.tsx` keeps only `metadataBase`, `title.template`, and site-wide defaults —
no page-specific values.

**Acceptance — this is the important one.** After building:

```bash
npx next build
for f in $(find .next -name '*.html' -path '*server*'); do
  grep -o '<link rel="canonical" href="[^"]*"' "$f"
done | sort | uniq -c
```

Every canonical must be **distinct** and must match its own path. Currently all four
pages emit `https://roofrepairmodesto.com` — that is the defect being fixed.

Same check for `<title>`: zero duplicates.

### 2.3 — Schema generator

**Files:** `src/lib/schema/` (new — `localBusiness.ts`, `service.ts`, `faq.ts`,
`breadcrumb.ts`, `review.ts`, `website.ts`, `index.ts`)

Each exports a builder taking site config + page content and returning a JSON-LD object.
`index.ts` exports `buildSchema(page, site)` returning the array of graphs for that page's
declared `schema` types (PRD §6 table).

`LocalBusiness` must emit `@type` from `site.schema.businessType` — **not** hardcoded —
plus `name`, `telephone`, `email`, `url`, full `address`, `geo`, `openingHours`,
`areaServed`, `priceRange`, `sameAs`.

Any page with an `FAQ` section auto-adds `FAQPage`. Any page with `Testimonials`
auto-adds `Review` + `AggregateRating`.

**Files:** `src/components/common/JsonLd.tsx` (new) — renders the graphs.

Remove the hardcoded `structuredData` literal from `layout.tsx`.

**Acceptance:** every built page contains JSON-LD; a service page contains `Service`,
`LocalBusiness`, and `BreadcrumbList`; the FAQ page contains `FAQPage` with all questions.
Validate output against schema.org's validator before considering this done.

### 2.4 — Generated sitemap, robots, manifest

**Files:** `src/app/sitemap.ts`, `robots.ts`, `manifest.ts`

All three derive from content. `sitemap.ts` enumerates `getAllPages()` — never a
hand-maintained array. `manifest.ts` pulls name, description, and `theme_color` from
`site.branding`.

**Acceptance:** add a page file → it appears in `sitemap.xml` with no code change.

### 2.5 — llms.txt

**File:** `src/app/llms.txt/route.ts`

Generate an AI-crawler map from the content tree: site purpose, service area, page list
with one-line descriptions.

### 2.6 — Commit

`v0.4: SEO engine, schema generation, generated sitemap and robots`

---

# Phase 3 — v0.5: Conversion layer

### 3.1 — Conversion config

**File:** `content/site.json` → new `conversion` block

```jsonc
"conversion": {
  "trackingPhone": "+12095550148",
  "displayPhone": "(209) 555-0148",
  "formEndpoint": "https://...",
  "thankYouPath": "/thank-you",
  "model": "considered"
}
```

### 3.2 — Click-to-call

**Files:** `Header.tsx`, `Footer.tsx`, `Hero.tsx`, `CTA.tsx`, `src/components/common/CallLink.tsx` (new)

`CallLink` renders `<a href="tel:...">` from `conversion.trackingPhone`. Use it in header,
hero, footer, and inline in long-form sections.

Give the header CTA button a real `href`. It currently links nowhere.

**Acceptance:** `grep -c 'href="tel:' .next/server/app/index.html` ≥ 2.

### 3.3 — Make the form real

**File:** `src/components/forms/ContactForm.tsx`

The current implementation awaits a 600ms timer and reports success for a lead that was
never captured. Replace the `submitLead()` stub with a real submission to
`conversion.formEndpoint`, real error handling, and a redirect to
`conversion.thankYouPath`.

> **Partly done in Phase 1.5.** Labels, placeholders, button text, and success/error
> messages already come from `content/pages/contact.json`, and the error branch is
> wired. Only `submitLead()` is still a stub — it is isolated at the top of the file
> and marked. **Do not ship a site until this is real:** the form currently tells a
> visitor "we'll be in touch" for a lead that went nowhere.

Read `node_modules/next/dist/docs/01-app/02-guides/forms.md` first.

**Acceptance:** submitting produces a real network request; failure shows an error; success
navigates to the thank-you page.

### 3.4 — Legal page generator

**Files:** `src/app/(legal)/[slug]/page.tsx`, `src/lib/legal.ts` (new)

Generate `privacy-policy`, `terms-conditions`, `disclaimer`, `accessibility` from
templates populated with `business` fields. Never hand-authored.

*Rationale:* the locksmith reference site carries six such pages; this framework has zero.

### 3.5 — Mobile navigation

**File:** `src/components/layout/Header.tsx`

Nav is currently `hidden md:flex` with no fallback — **there is no navigation at all below
768px.** Add an accessible toggle: keyboard operable, `aria-expanded`, `aria-controls`,
closes on selection.

**Acceptance:** keyboard-only navigation works at 375px width.

### 3.6 — Commit

`v0.5: conversion layer, working form, legal pages, mobile navigation`

---

# Phase 4 — v0.6: Hub-and-spoke routing

### 4.1 — Dynamic routes

**Files:** `src/app/services/[slug]/page.tsx`, `service-area/[slug]/page.tsx`,
`faq/[slug]/page.tsx`

Each uses `generateStaticParams` over its content directory and `generateMetadata` per
PRD §5. Read the bundled `generate-static-params.md` first.

### 4.2 — Index pages

`/service-area` and `/faq` hubs, generated from their content directories.

### 4.3 — Seed content

Create real content for: 3 services, 3 locations (Modesto + 2 spokes), 5 FAQ pages.

**This content must carry genuine local knowledge** — climate, permits, neighborhoods,
common local failure modes (PRD §7). Generic filler will fail the validator and defeats
the purpose. Flag for Rev's review rather than inventing local facts.

### 4.4 — Internal linking

Render `internalLinks` as a related-pages block. Service cards link to their service pages.
Location pages link to services and the hub.

**Acceptance:** no orphan pages; every page reachable by at least two internal links.

### 4.5 — Commit

`v0.6: dynamic routing for services, locations, and FAQ`

---

# Phase 5 — v0.7: Niche packs

### 5.1 — Niche pack type and loader

**Files:** `src/types/niche.ts`, `niches/roofing.ts`, `src/lib/niche.ts` (all new)

Implement the `NichePack` interface from PRD §9. Data only — no JSX.

### 5.2 — Wire schema type and section presets

`schemaType` drives `LocalBusiness["@type"]`. `sectionPresets` supply default composition
per page type. `conversionModel` selects the CTA pattern.

### 5.3 — Locksmith pack + CallBar

**Files:** `niches/locksmith.ts`, `src/components/sections/CallBar.tsx` (new)

`CallBar` is the sticky emergency call bar for `conversionModel: "emergency"`. Per the
audit, this is the **only** new component the most divergent niche requires — if you find
yourself needing more, stop and report it, because it would challenge PRD decision D1.

### 5.4 — Prove D1

Create `content-plumbing-example/` — a minimal plumbing site's content plus
`niches/plumbing.ts`. Build it against the same `src/`.

**Acceptance — this is the acceptance test for the entire architecture (PRD §9).** If a
plumbing site cannot be produced without editing `src/`, the niche layer is under-built
and Phase 5 is not done.

### 5.5 — Commit

`v0.7: niche pack architecture, roofing and locksmith packs`

---

# Phase 6 — v1.0: Design system, accessibility, performance

### 6.1 — Branding to CSS variables

**Files:** `src/app/globals.css`, `src/components/**`

`branding.primaryColor: "blue"` can never work — Tailwind v4 cannot build class names from
runtime strings. shadcn already installed a full oklch token system in `globals.css` that
**no component currently uses**.

1. Extend `branding` to real values: `primary`, `primaryForeground`, `accent`, `radius`.
2. Inject them as CSS custom properties on `<html>` from `site.branding`.
3. Replace all ~100 hardcoded color utilities with semantic tokens:
   `text-slate-900` → `text-foreground`, `bg-blue-600` → `bg-primary`,
   `text-slate-600` → `text-muted-foreground`, `border-slate-200` → `border-border`.

**Acceptance:** `grep -rn "slate-\|blue-\|gray-" src/components/ src/app/` returns nothing.
Changing `branding.primary` in JSON visibly rebrands the site.

### 6.2 — Accessibility pass

Skip link; one `<h1>` per page with correct heading order; visible focus states; labelled
form controls; `alt` on every image; colour contrast ≥ 4.5:1; keyboard-operable nav.

Read `node_modules/next/dist/docs/03-architecture/accessibility.md`.

### 6.3 — Images and performance

Replace starter SVGs in `public/`. Use `next/image` with explicit dimensions. Add OG image
generation. Target Lighthouse ≥ 95 across all four categories.

### 6.4 — Final checklist audit

Run the full PRD §10 checklist against the generated roofing site. Every machine-checkable
item must be enforced by the validator, not by eye.

### 6.5 — Commit and tag

`v1.0: production framework` — tag `v1.0.0`.

---

## Defect ledger

Every defect from the 2026-08-03 audit and the phase that fixes it. Nothing here may be
silently dropped.

| # | Defect | Phase |
|---|---|---|
| 1 | Hardcoded copy in about/services/contact pages | 1.3, 1.6 |
| 2 | "Request Service" and form strings hardcoded in components | 1.3, 3.3 |
| 3 | `branding` typed but referenced by zero components | 6.1 |
| 4 | ~100 hardcoded Tailwind colours | 6.1 |
| 5 | Domain hardcoded in sitemap/robots/manifest | 2.1, 2.4 |
| 6 | Sitemap hand-maintained; new pages silently omitted | 2.4 |
| 7 | No hub-and-spoke routing | 4.1 |
| 8 | `metadata.ts` written but never imported | 0.2, 2.2 |
| 9 | **All four pages emit the homepage canonical** | 2.2 |
| 10 | Duplicate titles and OG tags across pages | 2.2 |
| 11 | Schema is a hardcoded literal; `schema.businessType` ignored | 2.3 |
| 12 | No FAQPage / Service / Breadcrumb / Review schema | 2.3 |
| 13 | `LocalBusiness` missing address, geo, hours, sameAs | 1.3, 2.3 |
| 14 | Contact form reports success without capturing the lead | 3.3 |
| 15 | No `tel:` links anywhere | 3.2 |
| 16 | Header CTA button has no `href` | 3.2 |
| 17 | No mobile navigation below 768px | 3.5 |
| 18 | Four orphan components | 0.2 |
| 19 | `Authority.tsx` built but rendered nowhere | 1.3 |
| 20 | No internal links between pages | 4.4 |
| 21 | No images; starter SVGs still in `public/` | 6.3 |
| 22 | No legal or trust pages | 3.4 |
| 23 | Content is generic; zero local knowledge | 4.3 |
| 24 | No `llms.txt` | 2.5 |
| 25 | Docs stale, escaped, and partly uncommitted | 0.3 |

---

## Definition of done for the whole plan

1. A new site in an existing niche launches with **zero** changes under `src/`
2. A plumbing site builds from the same `src/` with a different niche pack and content
3. Every PRD §10 checklist item passes on the generated roofing site
4. The validator catches all 25 defect classes above
5. Lighthouse ≥ 95 across all categories
6. A cold session can read `README.md` → `FRAMEWORK_PRD.md` and be productive
