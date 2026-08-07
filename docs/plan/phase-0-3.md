> Part of the build plan. Conventions, guardrails, and the phase index are in
> `docs/IMPLEMENTATION_PLAN.md`. Known defects are in `docs/DEFECTS.md`.


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

> **Revised during implementation.** The literal acceptance check does not hold yet, and
> cannot until Phase 4. `getAllPages()` (Phase 1.4) is a static-import map, documented in
> `content.ts` as deferred to Phase 4's directory enumeration — adding a page file still
> requires one import and one map entry *in `content.ts`*.
>
> What 2.4 actually delivers, verified: `sitemap.ts`, `robots.ts`, and `manifest.ts` now
> derive from that same single source (`getAllPages()` / `getSite()`) instead of each
> maintaining its own separate hardcoded list. Tested directly — added a fifth page to
> `content.ts`, confirmed it appeared in `sitemap.xml`, and confirmed the three `src/app`
> files needed zero changes. That's defect #6 fixed: one list to maintain, not three that
> can drift from each other. The zero-code-change bar is Phase 4's, not this task's.

### 2.5 — llms.txt

**File:** `src/app/llms.txt/route.ts`

Generate an AI-crawler map from the content tree: site purpose, service area, page list
with one-line descriptions.

> **Revised during implementation.** Route Handlers are dynamic by default — unlike
> `sitemap.ts`/`robots.ts`, which the docs special-case as "static unless they use
> request-time APIs," a plain `route.ts` renders `ƒ (Dynamic)` even with zero
> request-time data, which the build output caught immediately. Fixed with
> `export const dynamic = "force-static"`, confirmed it flips to `○ (Static)`. Any future
> `route.ts` in this framework needs the same line — it's easy to miss since nothing
> errors, the route just quietly stops being static.

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

> **Revised during implementation.** `formEndpoint` shipped as `""`, not a placeholder
> URL — no lead-delivery provider (email/CRM) has been chosen yet, and a fake URL would
> silently 404 or, worse, look configured when it isn't. `submitContactForm` (3.3) checks
> for this and returns a real "not connected yet" error instead of pretending to submit.
> Wire a real provider in before launch.

### 3.2 — Click-to-call

**Files:** `Header.tsx`, `Footer.tsx`, `Hero.tsx`, `CTA.tsx`, `src/components/common/CallLink.tsx` (new)

`CallLink` renders `<a href="tel:...">` from `conversion.trackingPhone`. Use it in header,
hero, footer, and inline in long-form sections.

Give the header CTA button a real `href`. It currently links nowhere.

**Acceptance:** `grep -c 'href="tel:' .next/server/app/index.html` ≥ 2. Verified: 4.

> **Revised during implementation.** `CallLink` and the header CTA are styled with
> `buttonVariants()` applied directly to `Link`/`<a>`, not `Button`'s `render` prop.
> Reading base-ui's `useButton.js` showed `render` injects `role="button"` onto whatever
> it wraps — correct for a `render`ed `<div>` acting as a button, wrong for a real
> navigational `<a href>`, which should keep announcing as a link. `buttonVariants()` is
> just the `cva()` className function, already exported from `button.tsx` for exactly
> this kind of composition.

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

> **Revised during implementation.** Built as a Server Action (`src/lib/actions/contact.ts`)
> with `useActionState`, not a Route Handler + `fetch()` — `forms.md` names this the
> framework's own idiomatic pattern for exactly this case, confirmed before writing any
> code. `redirect(conversion.thankYouPath)` is called outside any try/catch, since Next
> implements it as an internal throw. `submitLead()`'s old 600ms-timer stub is gone; the
> new action validates required fields, then checks `conversion.formEndpoint` — empty
> today (see 3.1's revision note), so it returns a real error rather than the old fake
> success. `successMessage` was dropped from `ContactFormProps` and
> `content/pages/contact.json`: success now navigates away via `redirect()`, so there is
> no local success state left to display a message in. Added `content/pages/thank-you.json`
> and `"thank-you"` to `PageType` and `content.ts`'s `PAGES` map to give the redirect a
> real destination.

### 3.4 — Legal page generator

**Files:** `src/app/(legal)/[slug]/page.tsx`, `src/lib/legal.ts` (new)

Generate `privacy-policy`, `terms-conditions`, `disclaimer`, `accessibility` from
templates populated with `business` fields. Never hand-authored.

*Rationale:* the locksmith reference site carries six such pages; this framework has zero.

> **Flag, not a revision.** `src/lib/legal.ts` generates all four pages from generic,
> standard boilerplate populated only with real `SiteConfig` fields (`business.name`,
> `.email`, `.phone`, `.state`, `site.url`) — no fabricated compliance certifications, no
> invented retention periods, no legal advice. **This is a template, not a substitute for
> legal review.** Do not ship a live site on the generated text alone; see the note added
> to `docs/SESSION.md`.

### 3.5 — Mobile navigation

**File:** `src/components/layout/Header.tsx`

Nav is currently `hidden md:flex` with no fallback — **there is no navigation at all below
768px.** Add an accessible toggle: keyboard operable, `aria-expanded`, `aria-controls`,
closes on selection.

**Acceptance:** keyboard-only navigation works at 375px width.

> **Partially verified.** Built as `src/components/layout/MobileNav.tsx`, a client
> component isolated from `Header` (which stays a Server Component) — native `<button>`
> and `<Link>` elements throughout, so Tab/Enter/Space work without custom key handling;
> `aria-expanded`/`aria-controls` wired to a real `id`; closes on Escape and on link
> click. Confirmed in the built HTML: collapsed state renders `aria-expanded="false"`,
> `aria-controls="mobile-nav-menu"`. **Not confirmed in an actual browser** — no browser
> automation tool was available in this session to drive a real keyboard-only pass at
> 375px. Do this manually before shipping.

### 3.6 — Commit

`v0.5: conversion layer, working form, legal pages, mobile navigation`

