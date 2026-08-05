# Implementation Plan — v0.3 through v1.0

**Target repo:** `ndxtraders/authority-site-generator-gpt`
**Companion doc:** `docs/FRAMEWORK_PRD.md` — read it before starting. It is the source of truth.
**Status:** Phases 0–3 complete; v0.5.1 hardening is next
**Written:** 2026-08-03; revised 2026-08-04 after independent production-readiness review

---

## How to use this plan

Work **one task at a time, in order**. Each task lists the files it touches, what to do,
and an acceptance check. Do not start a task until the previous task's acceptance check
passes.

Phases map to versions in the PRD (§11). From v0.5.1 onward, commit every completed
numbered task because each task may be a Codex session boundary. Add a phase-level release
commit only when the phase needs final integration changes.

### Repository boundary

All work governed by this plan goes only to the local
`/Users/raulvaughn/Documents/authority-site-generator-gpt` checkout and GitHub repository
`ndxtraders/authority-site-generator-gpt`. The upstream `authority-site-generator` local
folder and GitHub repository are protected. Verify `pwd` and `git remote -v` before every
write or push; see `AGENTS.md` for the Prime Directive.

### Codex session boundaries

A numbered task with passing acceptance checks is the default unit of one Codex session.
Start a fresh task at these natural boundaries:

- After any numbered task in v0.5.1 or later passes its acceptance checks
- At every phase commit
- Before changing subsystems, for example validation → forms or routing → design system
- Before work that depends on new business facts, provider credentials, legal review, or
  another external decision
- When investigation has become long enough that the written checkpoint is clearer than
  the active conversation

Do **not** end or switch sessions during a failing build, partially applied migration, or
uncommitted multi-file change. Finish or safely roll the task back first.

Before ending a session:

1. Run the task's acceptance checks.
2. Commit a coherent checkpoint on the active development branch.
3. Update `docs/SESSION.md` with changes, validation results, risks, and the exact next
   task number.
4. Update `docs/HANDOFF.md` if architecture, sequencing, or resume instructions changed.
5. Record `git status -sb`; do not make a fresh session rediscover intentional state.

A new session starts by reading `AGENTS.md`, `README.md`, `docs/SESSION.md`,
`docs/HANDOFF.md`, the relevant plan task, and the current git status. It should not
re-audit completed phases unless the handoff identifies an unresolved failure.

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
2. **Push only to the GPT repository.** Rev has granted standing permission for reasonable
   commits and pushes there. That permission never applies to the protected upstream.
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

---

# Phase H — v0.5.1: Production hardening

Goal: make the framework honest, safe, testable, and difficult to deploy incorrectly
before multiplying pages and niches. **Do not start Phase 4 until H.1–H.7 pass.**

Each H task is intentionally scoped as one Codex session. Finish its acceptance checks,
update `docs/SESSION.md`, and commit before starting the next task in a fresh session.

### H.1 — Establish the executable content contract

**Primary files:** `src/lib/content.ts`, `src/types/`, `src/lib/section-types.ts`,
`scripts/validate-content.mts`, new runtime-schema module(s), test fixtures

1. Choose one runtime schema approach that can run in both the Next build and the plain
   Node validator. Prefer a single source for runtime schemas and inferred TypeScript
   types; if existing types remain separate, add compile-time equivalence tests.
2. Define strict schemas for `SiteConfig`, every `PageContent` field, every section's
   nested props, and shared items. Reject unknown keys where silent typos would be unsafe.
3. Remove `as unknown as` as the mechanism that makes imported content appear valid.
   Parse content at the loader boundary and return typed data only after validation.
4. Validate formats and relationships: absolute site origin, root-relative canonicals and
   redirects, E.164 tracking phone, valid conversion model and schema names, slug/route
   agreement, unique titles/canonicals, and resolvable internal links.
5. Design the loader so Phase 4 can apply the same parser to `services/`, `locations/`,
   and `faq/` without duplicating validation logic.

**Acceptance:**

- `npm run validate`, lint, typecheck, and production build pass on current content
- Fixture tests prove that a missing nested Hero/FAQ/form prop, wrong type, unknown prop,
  duplicate canonical, malformed phone/URL, and broken internal link all fail validation
- Components and pages never receive unparsed content

**Commit:** `v0.5.1 H1: enforce runtime content schemas`

**Session boundary:** start H.2 in a fresh task.

### H.2 — Make the conversion boundary server-only

**Primary files:** `src/lib/actions/contact.ts`, `src/components/forms/ContactForm.tsx`,
`src/components/sections/ContactForm.tsx`, `src/lib/sections.tsx`, `src/types/site.ts`,
deployment documentation

1. Stop passing the full `ConversionConfig` through the ContactForm Client Component.
   The Server Action reads the endpoint and thank-you path from trusted server config.
2. Move endpoint URLs, credentials, signing secrets, and provider tokens out of public
   content and into server-only deployment configuration. Keep only display-safe values
   in content.
3. Remove raw lead fields from logs. Operational logs may contain a generated request ID,
   provider status category, and non-sensitive timing only.
4. Validate the redirect as a known internal path; never accept it as a client-bound
   argument.
5. Inspect built HTML/RSC output and client bundles for endpoint names, secret values, and
   serialized server configuration.

**Acceptance:**

- A sentinel endpoint/secret configured for the test cannot be found in built browser
  payloads or client JavaScript
- Failed and unconfigured submissions do not log name, phone, email, or message
- Success redirects only after the server confirms provider delivery
- Server-only configuration is documented without committing real credentials

**Commit:** `v0.5.1 H2: isolate conversion configuration`

**Session boundary:** start H.3 in a fresh task.

### H.3 — Validate and protect lead submission

**Primary files:** `src/lib/actions/contact.ts`, form components, validation tests,
deployment/provider adapter

1. Enforce server-side field normalization, required values, maximum lengths, email
   format, and a practical phone-number policy. Reject unexpected fields and oversized
   payloads with generic visitor-safe errors.
2. Add accessible field-level or form-level error handling without echoing sensitive
   submitted values.
3. Add a low-friction spam control suitable for static local-business sites. At minimum,
   use a honeypot and submission timing check; document provider-side rate limiting or
   add a durable rate limiter before public launch.
4. Add an explicit provider timeout with predictable handling for network errors,
   non-2xx responses, and malformed provider responses.
5. Test duplicate submissions and ensure the provider contract is idempotent where the
   selected provider supports it.

**Acceptance:**

- Tests cover valid submission, every invalid field, oversized input, bot trap, timeout,
  provider error, and successful redirect
- No rejected input reaches the provider
- A public launch checklist identifies the active rate-control owner and configuration

**Commit:** `v0.5.1 H3: harden lead submission`

**Session boundary:** start H.4 in a fresh task.

### H.4 — Add truth and production-readiness gates

**Primary files:** `content/site.json`, content types/schemas, validator, deployment
checklist, current sample content

1. Add an explicit content lifecycle state such as `sample` versus `verified`. Current
   roofing content starts as `sample`.
2. Add `npm run verify:production` (or an equivalent predeploy command) that rejects
   sample status, reserved phone numbers, incomplete NAP, unreviewed legal text, missing
   form delivery, missing real images, and other launch blockers.
3. Inventory factual claims in current content, including licence/insurance, 25+ years,
   1,200+ projects, 24/7 response, warranties, testimonials, and ratings. Each is verified
   against a recorded source or removed. Do not invent replacements.
4. Keep the ordinary development build usable with clearly marked sample content while
   making it impossible to mistake that build for production-ready output.
5. Produce a human review checklist for facts that software cannot prove: business
   identity, local knowledge, testimonials, legal language, and GBP alignment.

**Acceptance:**

- Current sample content passes development validation but fails production verification
- A verified fixture passes; each launch blocker has a failing fixture
- No unsupported trust claim remains eligible for production output
- Human-owned verification items name the required source and reviewer

**Commit:** `v0.5.1 H4: add production truth gate`

**Session boundary:** stop here if real business facts or legal review are required;
record the exact dependency rather than fabricating content. Otherwise start H.5 fresh.

### H.5 — Correct indexation and structured-data safety

**Primary files:** `src/components/common/JsonLd.tsx`, `src/lib/schema/`,
`src/lib/metadata.ts`, `src/app/sitemap.ts`, `content/pages/thank-you.json`, manifest

1. Safely serialize JSON-LD so authored content cannot terminate the script element.
2. Give the LocalBusiness and WebSite stable `@id` values. Connect Service provider,
   Review `itemReviewed`, and AggregateRating to the same business entity.
3. Emit review/rating data only from verified source content and validate rating ranges.
4. Mark `/thank-you` `noindex` and remove it from the sitemap. Add a reusable indexation
   field if future utility pages need the same treatment.
5. Use truthful sitemap modification dates or omit them; deployment time is not a content
   update. Remove manifest references to missing assets or add the actual valid asset.
6. Validate representative graphs against schema.org tooling and preserve fixtures of the
   expected connected graph.

**Acceptance:**

- A JSON-LD fixture containing `</script>` cannot escape the script payload
- Home, service, FAQ, location, and rated-testimonial fixtures form the expected connected
  graph without unsupported nodes
- `/thank-you` has `noindex` and is absent from the sitemap
- Sitemap and manifest reference only truthful dates and existing assets

**Commit:** `v0.5.1 H5: harden schema and indexation`

> **Implementation note.** Schema.org's validator found that `serviceType` is valid on
> the `Service` node but not on `HomeAndConstructionBusiness`. H.5 removed it from
> `LocalBusiness` while retaining it on `Service`. The representative connected graph
> then passed the official validator with 0 errors and 0 warnings across BreadcrumbList,
> WebSite, Service, Review, AggregateRating, and FAQPage.

**Session boundary:** start H.6 in a fresh task.

### H.6 — Add automated tests and CI

**Primary files:** test configuration, test fixtures, `.github/workflows/`, `package.json`

1. Use the smallest test stack that supports TypeScript modules reliably. Add unit tests
   for runtime schemas, content loading, URL assembly, metadata, schema builders, legal
   page generation, and contact-action behavior.
2. Add fixture-driven negative tests for every validator defect class introduced through
   H.5. Tests must assert the failure reason, not just a nonzero exit code.
3. Add a production-build integration check for routes, unique titles/canonicals,
   indexation, JSON-LD graphs, `tel:` links, and absence of server-only configuration.
4. Add browser coverage for mobile navigation and the contact form's validation/error
   states. Keep full Lighthouse testing for Phase 6, but make browser correctness part of
   CI now.
5. Add GitHub Actions for validation, lint, typecheck, tests, and production build on pull
   requests and pushes to the development repository.

**Acceptance:** a clean checkout runs one documented verification command and CI enforces
the same required checks. Deliberately breaking a schema fixture, canonical, form
boundary, or client-secret assertion causes CI to fail.

**Commit:** `v0.5.1 H6: add regression suite and CI`

**Session boundary:** start H.7 in a fresh task.

### H.7 — Reconcile documentation and release v0.5.1

**Primary files:** `README.md`, `package.json`, `docs/CHANGELOG.md`, `docs/SESSION.md`,
`docs/HANDOFF.md`, `docs/CONTENT_SCHEMA.md`, `docs/DEPLOYMENT.md`

1. Update package and documentation versions to v0.5.1.
2. Document runtime schemas, sample versus verified content, server-only conversion
   configuration, production verification, tests, CI, and the decision that `/contact`
   is the required v1 conversion destination.
3. Audit every README path and workflow claim against the actual tree. Do not describe
   `niches/` or dynamic content directories as present until they exist.
4. Run the complete v0.5.1 verification command and inspect the production output.
5. Update the handoff so a cold session starts at Phase 4.1 without re-auditing H.1–H.7.

**Acceptance:** docs agree on version, current phase, repository, commands, and next task;
all automated checks pass; the production gate still rejects the sample roofing site for
the documented real-world dependencies.

**Commit:** `v0.5.1: production hardening`

**Phase boundary:** begin Phase 4 in a new Codex task.

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
| 26 | JSON is cast to TypeScript types without complete runtime validation | H.1 |
| 27 | Nested section props and invalid formats can pass the validator | H.1 |
| 28 | Broken internal links warn instead of failing the documented quality gate | H.1 |
| 29 | Full conversion config, including future endpoint, crosses the client boundary | H.2 |
| 30 | Failed submissions log raw lead PII | H.2 |
| 31 | Form lacks bounded validation, timeout, spam controls, and rate-control plan | H.3 |
| 32 | Unverified trust claims, statistics, and testimonials can pass a build | H.4 |
| 33 | Development sample content is not mechanically separated from production content | H.4 |
| 34 | JSON-LD serialization does not escape script-closing content | H.5 |
| 35 | Review and AggregateRating nodes are disconnected from the business entity | H.5 |
| 36 | Thank-you page is indexable and included in the sitemap | H.5 |
| 37 | Sitemap dates and manifest assets can make unsupported freshness/asset claims | H.5 |
| 38 | No project tests or CI protect the documented acceptance criteria | H.6 |
| 39 | README and package versions lag the implemented version | H.7 |

---

## Definition of done for the whole plan

1. A new site in an existing niche launches with **zero** changes under `src/`
2. A plumbing site builds from the same `src/` with a different niche pack and content
3. Every PRD §10 checklist item passes on the generated roofing site
4. Runtime validation and production verification catch every machine-checkable defect
   class above; factual claims that software cannot prove require a recorded human review
5. Lighthouse ≥ 95 across all categories
6. A cold session can read `README.md` → `FRAMEWORK_PRD.md` and be productive
7. No server-only conversion value or submitted PII appears in browser payloads or logs
8. Required validation, tests, browser checks, and production build pass in CI
