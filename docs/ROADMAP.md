# Roadmap

> **Superseded.** The authoritative version plan is `FRAMEWORK_PRD.md` §11, with the
> task-level breakdown in `IMPLEMENTATION_PLAN.md`. This file is kept as a short
> orientation summary only.

## Shipped

**v0.1** — Next.js foundation, JSON content loading, TypeScript models, shared layout,
Header, Footer, Hero, shadcn/ui.

**v0.2** — Reusable section architecture: `Container`, `Section`, `SectionHeading`, plus
nine trade-agnostic section components and three additional routes.

## Planned

| Version | Theme |
|---|---|
| v0.3 | Page-based content model, section registry, content validator |
| v0.4 | SEO engine — metadata, schema generation, generated sitemap and robots |
| v0.5 | Conversion layer — working form, click-to-call, legal pages, mobile nav |
| v0.6 | Hub-and-spoke routing — services, locations, FAQ |
| v0.7 | Niche packs — roofing and locksmith; plumbing site as proof |
| v1.0 | Production — design tokens, accessibility, performance |

See `FRAMEWORK_PRD.md` §11 for the "done when" criteria on each.

## Beyond v1.0

Split into `leadgen-framework`, `leadgen-content-generator`, and per-business content
repositories. Business repos contain only `content/`, `public/`, branding assets, and
deployment configuration. Framework updates become consumable by every site.

Recorded as PRD decision D6.
