# Changelog

## v0.4 — SEO and schema engine

- Added `src/lib/url.ts` — `site.url` is now the only place the domain appears
- Added per-page `generateMetadata` (`src/lib/metadata.ts`) — every page emits a unique
  title, description, and self-referencing canonical
- Added the schema generator (`src/lib/schema/`) — `LocalBusiness` (`@type` driven by
  `site.schema.businessType`, not hardcoded), `BreadcrumbList` on every page;
  `WebSite` on home; `FAQPage` auto-added for any page with an FAQ section;
  `Review`/`AggregateRating` auto-added for testimonials that carry a real rating
- Added `JsonLd` component; removed the hardcoded `LocalBusiness` literal from
  `layout.tsx` — schema now varies per page, which a single shared script couldn't do
- `sitemap.ts` now enumerates `getAllPages()`; `manifest.ts` and `robots.ts` derive from
  content instead of hardcoded values
- Added `/llms.txt` — an AI-crawler page map generated from content

**Fixed:** defects 5, 6 (partially — see plan note), 8, 9, 10, 11, 12, 13 (partially),
24.

**Content-model finding, not yet actionable:** `TestimonialItem` has no rating field, so
`Review`/`AggregateRating` schema (required by PRD §6 for any page with testimonials)
cannot be honestly emitted yet — fabricating a star rating would be a false claim about
a real business. `rating` is now an optional field; schema emits only for testimonials
that actually carry one. Currently: none do, so home's testimonials don't produce
Review/AggregateRating nodes. Real ratings need to come from the business.

**Still open from the audit:** `tel:` links, mobile nav, branding tokens, hub-and-spoke
routing, niche packs, legal pages, local knowledge content. Phases 3–6.

## v0.3 — Page-based content model

- Split `content/site.json` into site-wide config plus `content/pages/*.json`
- Added `Section` discriminated union derived from a single `SectionPropsMap`
- Added type-safe section dispatch (`src/lib/sections.tsx`) — a switch, not a lookup
  table, so no cast is needed and a missing case is a compile error
- Added `src/lib/content.ts` as the only module that knows where content lives
- Added `Answer` (AEO answer-first block), `ContactInfo` (NAP), and `ContactForm` sections
- All four pages reduced to 7-line orchestrators — **zero business copy left in `src/`**
- Added `scripts/validate-content.mts`, gating `next build` via `prebuild`
- Expanded `business` with `address`, `geo`, `hours`, `sameAs`, `licenseNumber`,
  `priceRange` for the Phase 2 schema engine
- `Services` gained `itemCta`, retiring the hardcoded "Request Service" string
- Archived `src/lib/site.ts`, superseded by `content.ts`
- Renamed the package to `authority-site-generator`

**Fixed:** defects 1, 2, 18, 19 (partially 14 — form strings, not submission).

**Still open from the v0.2 audit:** canonicals, schema, sitemap/robots/manifest
hardcoding, `tel:` links, mobile nav, branding tokens. Phases 2–6.

## v0.2 — Reusable section architecture

- Added layout primitives: `Container`, `Section`, `SectionHeading`
- Added eight trade-agnostic section components: `Services`, `WhyChooseUs`, `Proof`,
  `Process`, `Testimonials`, `FAQ`, `CTA`, `Authority`
- Added `/about`, `/services`, `/contact` routes
- Added `ContactForm` (UI only — does not submit)
- Expanded `content/site.json` from 3 to 14 top-level keys
- Expanded `src/types/site.ts` to a complete typed content model
- Added `sitemap.ts`, `robots.ts`, `manifest.ts` (hardcoded values)
- Added `LocalBusiness` JSON-LD in the root layout (single hardcoded literal)

**Known incomplete in v0.2** — corrected by the 2026-08-03 audit:

- Metadata is root-level only. All four pages emit the homepage canonical.
- Schema is one hardcoded literal; `schema.businessType` is never read.
- `branding` is typed but referenced by zero components; ~100 hardcoded colors remain.
- Contact form reports success without submitting anywhere.
- No `tel:` links; header CTA has no `href`; no mobile navigation.
- `metadata.ts` was written but never imported.

Full list: `IMPLEMENTATION_PLAN.md`, defect ledger.

## v0.1 — Foundation

- Next.js, TypeScript, Tailwind, shadcn/ui
- JSON content architecture and content loader
- Shared layout with Header and Footer
- Hero component
- Initial documentation
