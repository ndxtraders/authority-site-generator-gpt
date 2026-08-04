# Content Schema

> **Superseded.** The content model is specified in `FRAMEWORK_PRD.md` §4, and the
> TypeScript source of truth lives in `src/types/`.

## Current shape (v0.2 — flat)

A single `content/site.json` with these top-level keys:

```
business, branding, navigation, hero, services, whyChooseUs,
proof, process, testimonials, faq, cta, footer, seo, schema
```

## Target shape (v0.3 — page-based)

```
content/
  site.json                 business, branding, navigation, footer, legal, conversion
  pages/                    home, about, contact, services
  services/                 one file per service → /services/[slug]
  locations/                one file per area   → /service-area/[slug]
  faq/                      one file per question → /faq/[slug]
```

Each page file declares `slug`, `pageType`, `seo`, `schema`, `sections`, and
`internalLinks`. See `FRAMEWORK_PRD.md` §4 for the full specification and validation
rules.

**Why the change:** the flat model has one `hero` and one `seo` key, which cannot express
multiple pages. That directly caused page copy to be hardcoded into React and every page
to emit the same canonical URL.
