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

### Idea register — feature opportunities from the 2026-08-04 sanity check

These entries describe possible product directions found by reviewing the working code.
They are **not** requirements, tasks, promises, or a ranked backlog. The ID is only a
stable reference. “Parked” means the idea is worth remembering but has not been adopted.

| ID | Idea | Opportunity | Revisit when | State |
|---|---|---|---|---|
| IDEA-001 | Web-based site setup and preview | Let a user enter business data, choose existing sections, preview pages, and export valid content without editing JSON by hand. | Manual JSON setup becomes the main limit on launching new sites. | Parked |
| IDEA-002 | Multi-site operations dashboard | Show many site projects, domains, build state, content state, and launch blockers in one place. This would be an operations layer above separate site deployments. | Managing several active sites through folders and Git becomes slow or error-prone. | Parked |
| IDEA-003 | Content evidence and approval workflow | Give reviewers a simple way to approve business facts, testimonials, legal language, images, and local knowledge while saving the source and review date. | The evidence ledger becomes hard for non-developers to maintain safely. | Parked |
| IDEA-004 | Lead-provider adapter library | Add tested adapters for common email, CRM, webhook, and automation providers instead of requiring every site to match one generic endpoint contract. | Two or more sites need different lead-delivery providers. | Parked |
| IDEA-005 | Lead delivery operations | Add delivery receipts, safe retries, duplicate protection, failure alerts, and an optional private lead archive without exposing personal data in logs. | Lost or delayed lead delivery becomes an operating risk. | Parked |
| IDEA-006 | Analytics and call-tracking adapters | Offer a standard way to add page analytics, form conversion events, thank-you tracking, and call-tracking providers while keeping site content provider-neutral. | Real sites need shared reporting across calls and forms. | Parked |
| IDEA-007 | Scheduling and estimate booking | Allow selected niches to offer appointment or estimate time slots after the visitor qualifies their request. | A business can support a reliable calendar and booking process. | Parked |
| IDEA-008 | Deposits and payments | Support secure deposits or service payments through a payment provider for niches where payment is part of the visitor journey. | A proven niche needs payment before or during booking. | Parked |
| IDEA-009 | Deployment and domain launch assistant | Automate repository creation, Vercel setup, environment checks, domain connection, DNS checks, sitemap submission, and final launch verification. | Manual launch work becomes a repeated source of mistakes. | Parked |
| IDEA-010 | Local presence integrations | Check or connect Google Business Profile and other local listings so name, address, phone, hours, and service areas stay aligned with site content. | The framework has approved access to listing APIs and a clear source-of-truth policy. | Parked |
| IDEA-011 | Redirect and URL migration manager | Store redirects as data, validate their targets, detect loops, and preserve old URLs when a site or content structure changes. | Existing sites with search history begin moving onto the framework. | Parked |
| IDEA-012 | Brand and media asset pipeline | Manage logos, real photos, usage rights, image sizes, alt text, Open Graph images, favicons, and generated image variants as one checked asset set. | Image preparation becomes a repeated launch bottleneck. | Parked |
| IDEA-013 | Site health and delivery dashboard | Show build failures, form-delivery health, missing production evidence, broken links, dependency warnings, and live-site checks without reading CI logs. | Non-developers need to operate deployed sites or the number of sites grows. | Parked |

Ideas already represented elsewhere in this document were not repeated here. These
include the site generator CLI, AI content workflow, market scoring, knowledge centers,
and content-directory expansion.

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
