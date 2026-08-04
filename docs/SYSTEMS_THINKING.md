# Systems Thinking

> **Non-binding.** This document captures architectural ideas, future directions, and
> framework concepts worth preserving. These are **not** planned features.
>
> An idea moves from this document into `FRAMEWORK_PRD.md` — as a numbered decision —
> only after it has been intentionally adopted. Nothing here should influence
> architecture until promoted.

---

## Idea lifecycle

```
Thought → SYSTEMS_THINKING → Discussion → Decision → PRD → Implementation → CHANGELOG
```

This is how the framework stays coherent instead of accumulating half-adopted ideas.

---

## Version map

Superseded by `FRAMEWORK_PRD.md` §11, kept here for the original reasoning.

| Version | Theme |
|---|---|
| v0.1.0 | Foundation — Next.js, TypeScript, Tailwind, shadcn/ui, JSON content, shared layout, Hero |
| v0.2.0 | Reusable homepage — Container, Section, SectionHeading, service cards, CTA, FAQ, Why Choose Us |
| v0.3.0 | Complete content model — full JSON schema, dynamic page generation, page content separation, validation |
| v0.4.0 | SEO engine — metadata, JSON-LD, sitemap, robots.txt, Open Graph, breadcrumbs |
| v0.5.0 | Lead generation — contact forms, thank-you pages, analytics, call tracking, conversion tracking |
| v1.0.0 | Production framework — stable API, stable component library, accessibility, performance |

---

## Adopted ideas

These have been promoted into the PRD. Listed here so their origin is traceable.

| Idea | Now lives in |
|---|---|
| Geographic hub-and-spoke | PRD §5 |
| Repository separation | PRD §2 D6 |
| Content evolution to page files | PRD §2 D2, §4 |
| Plugin architecture → niche packs | PRD §2 D1, §9 |
| Local Authority Model | `AUTHORITY_MODEL.md` |

---

## Parking lot

Intentionally postponed. Nothing below is a commitment.

### Site generator CLI

A command-line tool that scaffolds a new site:

```
generate JSON → validate content → generate metadata
             → generate schema → generate image prompts → deploy
```

Would reduce new site creation to configuration rather than development.

### Content generator repository

A separate repo (`leadgen-content-generator`) holding AI prompts, content generation,
JSON generation, validation, and image prompt generation. Keeps content tooling out of
the rendering framework.

### Market intelligence scoring

A model for choosing which markets to enter:

- Population
- Search demand
- Competition
- CPC
- Median income
- Housing density
- Domain availability
- Distance from existing hubs

Output: an expansion priority ranking. Replaces buying every available exact-match
domain with a defensible selection process.

### Full AI workflow

Long-term vision where AI generates content, metadata, schema, images, FAQs, location
pages, and a deployment package — and the framework renders all of it.

Desired end-state workflow:

1. Generate content
2. Generate images
3. Validate JSON
4. Deploy to GitHub
5. Auto-deploy to Vercel
6. Connect domain
7. Submit sitemap
8. Launch

### Knowledge centers

Deeper expansion of the Local Knowledge Layer into standalone hub content:

- Local climate
- Local geology
- Water conditions
- Building codes
- Seasonal maintenance
- County-specific issues
- Entity relationships
- Service clusters
- Problem/solution clusters

### Content structure evolution

Beyond the page-based model adopted in PRD §4, content could evolve further:

```
content/
  pages/
  services/
  locations/
  faq/
  testimonials/
```

---

## Engineering philosophy

This project should be treated as a professional software product.

Every improvement should increase at least one of: reusability, maintainability,
scalability, simplicity, SEO quality, performance, developer experience.

Avoid premature abstraction, but intentionally build toward reusable systems rather than
one-off solutions.

When making an architectural decision, ask:

> "Will this make every future site easier to build?"

If yes, it is likely the correct direction.

---

## Guiding principle

We are not building roofing websites.

We are building a machine that builds roofing websites.

**The framework is the product. Individual websites are outputs of the framework.**
