# Changelog

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
