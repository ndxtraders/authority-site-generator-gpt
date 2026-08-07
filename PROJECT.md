# Authority Site Generator

**Version:** v0.2 shipped, v0.3 in progress
**Status:** Active development
**First market:** Modesto, CA (roofing)

> This document holds the **vision and architectural constitution**.
> For specifications, see `docs/FRAMEWORK_PRD.md` — it is the source of truth.
> For current tasks, see `docs/IMPLEMENTATION_PLAN.md`.

---

## Vision

The purpose of this framework is not simply to generate lead generation websites.

Its purpose is to generate **Local Authority Websites** for service businesses.

A Local Authority Website is designed to become the most trusted online resource for a
specific trade within a defined geographic market. Lead generation is the outcome of
becoming the local authority — not the primary objective.

The framework therefore prioritizes:

- Expertise
- Helpfulness
- Local knowledge
- Entity development
- Topical authority
- User trust
- Technical excellence
- AI readability
- Long-term search visibility

Every website generated should answer one question affirmatively:

> "If I lived in this community and needed this service, would this be the most helpful
> website available?"

The strategy behind this is in `docs/AUTHORITY_MODEL.md`.

---

## Core philosophy

Everything should be reusable, data-driven, easy to maintain, SEO-friendly, fast,
accessible, and easy to clone for a new business.

**New sites are created by replacing content, not by rewriting React components.**

---

## Architecture principles

These seven rules are the constitution. Code that violates one is a bug.

### Rule 1 — No hardcoded business information in reusable components

Business name, city, services, branding, metadata, and page copy belong in content.

### Rule 2 — Components receive props

Components never import content directly.

```
Page → Content → Props → Component
```

### Rule 3 — Pages orchestrate, components render

Pages assemble sections. Sections render content.

### Rule 4 — Every component passes the reuse test

> "Could this component be reused unchanged for a plumber?"

If not, redesign it.

### Rule 5 — Only one layer knows where content comes from

Today that layer reads `content/`. Tomorrow it might read a CMS, a database, markdown, or
an API. Components must not care.

### Rule 6 — Never repeat Tailwind class strings

If the same layout appears twice, extract a component. `Container`, `Section`,
`SectionHeading`.

### Rule 7 — Keep responsibilities separated

| Directory | Owns |
|---|---|
| `src/components/layout/` | Shared site layout |
| `src/components/sections/` | Page sections |
| `src/components/common/` | Layout primitives |
| `src/components/ui/` | shadcn components |
| `src/lib/` | Utilities, content loading, SEO, schema |
| `src/types/` | TypeScript models |
| `content/` | Site content |
| `niches/` | Per-trade configuration |

---

## Content philosophy

**Content is treated as an API.** Every visible piece of text comes from `content/`.

React components should contain no marketing copy.

---

## Framework vs. content

| Framework owns | Content owns |
|---|---|
| React components | Business information and NAP |
| Layout and navigation | Branding values |
| SEO engine | All copy |
| Schema generation | Service descriptions |
| Rendering and routing | FAQs and testimonials |
| Design system | Service areas |
| Utilities and TypeScript models | Images and metadata values |

Application code should rarely change between sites.

---

## Technology

Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind CSS v4 · shadcn/ui ·
Lucide Icons · JSON content · GitHub · Vercel

> **This is not the Next.js in your training data.** Read the relevant guide in
> `node_modules/next/dist/docs/` before writing code. See `AGENTS.md`.

---

## Geographic strategy

The framework uses a hub-and-spoke model. Large cities become hub sites with their own
domains; surrounding communities become service-area pages within the nearest hub. When a
spoke market grows large enough, it graduates to its own hub.

Expansion is driven by search demand, competition, population, distance from existing
hubs, and commercial value — not by buying every available exact-match domain.

Details in `docs/FRAMEWORK_PRD.md` §5.

---

## Long-term repository strategy

This repository currently serves as both the application and the framework. After the
content API stabilizes at v1.0, it may split:

- **`leadgen-framework`** — components, rendering engine, SEO, schema, design system
- **`leadgen-content-generator`** — AI prompts, content generation, validation
- **Business repositories** — `content/`, `public/`, branding, deployment config

Recorded as PRD decision D6.

---

## Code quality

Prefer small components, strong TypeScript types, reusable sections, meaningful commits,
clean git history, no duplicated logic, and readable code over clever code.

Avoid premature abstraction, but build intentionally toward reusable systems rather than
one-off solutions. When making an architectural decision, ask:

> "Will this make every future site easier to build?"

---

## Guiding principle

We are not building roofing websites.

We are building a machine that builds roofing websites.

**The framework is the product. Individual websites are outputs of the framework.**

---

## Where to go next

`AGENTS.md` holds the full routing table. The most-used entries:

| Document | Purpose |
|---|---|
| `docs/FRAMEWORK_PRD.md` | **Source of truth.** What we're building. |
| `docs/SESSION.md` | Where we are and the exact next task. |
| `docs/IMPLEMENTATION_PLAN.md` | Index into `docs/plan/` — one file per phase. |
| `docs/DEFECTS.md` | Known defects, permanently numbered. |
| `docs/HANDOFF.md` | Architecture map and hard-won rules. |
| `docs/AUTHORITY_MODEL.md` | Strategy. Why authority precedes lead generation. |
| `docs/SYSTEMS_THINKING.md` | Parking lot. Non-binding ideas. |
| `docs/AI_GUIDELINES.md` | Hard rules for writing code here. |
| `docs/CHANGELOG.md` | What shipped. |
