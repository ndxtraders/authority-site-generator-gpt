# Content Schema

> **Superseded.** The content model is specified in `FRAMEWORK_PRD.md` §4, and the
> TypeScript source of truth lives in `src/types/`.

## Current shape (v0.5 — page-based)

The repository currently separates site-wide configuration from page content:

```
content/
  site.json                 business, branding, navigation, footer, legal, conversion
  pages/                    home, about, services, contact, thank-you
```

The privacy policy, terms, disclaimer, and accessibility statement are generated from
site configuration rather than stored as page JSON.

Each page declares `slug`, `pageType`, `seo`, `schema`, `sections`, and
`internalLinks`. The section registry maps each section `type` to a reusable React
component.

## v0.5.1 hardening

The TypeScript interfaces document the intended shape, but the runtime loader still
trusts JSON after shallow checks. Phase H.1 (`docs/plan/phase-h.md`, now complete)
replaced that trust boundary with shared runtime schemas that validate nested props, supported
section types, formats, unknown fields, and cross-file relationships.

## Phase 4 expansion

```
content/
  site.json                 business, branding, navigation, footer, legal, conversion
  pages/                    home, about, contact, services
  services/                 one file per service → /services/[slug]
  locations/                one file per area   → /service-area/[slug]
  faq/                      one file per question → /faq/[slug]
```

Phase 4 adds the service, location, and FAQ collections and their dynamic routes. See
`FRAMEWORK_PRD.md` §4 for the complete contract and validation rules.
