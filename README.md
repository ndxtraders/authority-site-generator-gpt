# Authority Site Generator

> **Development fork:** This repository is the authorized GPT working copy,
> `ndxtraders/authority-site-generator-gpt`. The upstream
> `ndxtraders/authority-site-generator` repository is read-only unless Rev proactively
> requests work there. See `AGENTS.md` before making changes.

A framework that generates **Local Authority Websites** for local service businesses —
roofing, plumbing, locksmith, HVAC, and others — from structured content.

The framework is the product. Individual websites are outputs.

---

## Read this first

**Do not read the whole `docs/` folder.** It is ~155 KB and reading it all costs more than
most tasks are worth. `AGENTS.md` carries a routing table — open the row that matches your
task and stop there.

If you are an AI agent picking up the build, that means:

1. `AGENTS.md` — repository boundary, the routing table, and **this is Next.js 16, not the
   Next.js in your training data.**
2. `docs/SESSION.md` — where we are and the exact next task.
3. The one phase file the next task lives in, via `docs/IMPLEMENTATION_PLAN.md`.

Then pull `docs/FRAMEWORK_PRD.md` (source of truth), `docs/HANDOFF.md` (architecture), or
`docs/DEFECTS.md` (known bugs) only when the task actually needs them.

`docs/SYSTEMS_THINKING.md` is a non-binding parking lot. Nothing in it influences
architecture until promoted into the PRD as a numbered decision.

---

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
npx next build       # must pass before anything is considered done
```

---

## How it works

```
content/     JSON — all business data and copy
niches/      Per-trade configuration (page taxonomy, schema type, conversion model)
src/         The framework — components, SEO engine, schema generation, routing
```

Pages orchestrate; components render. Every visible string comes from `content/`.

### The invariant

> **Launching a new site must require zero changes under `src/`.**

If shipping a plumbing site in Turlock would require editing a React component, the
design is wrong.

---

## Create a new site

Target workflow (v1.0 acceptance criterion):

1. Clone this repository
2. Replace `content/`
3. Replace images in `public/`
4. Set `site.url` and select the niche pack
5. Deploy to Vercel

See `docs/DEPLOYMENT.md` for the full checklist.

---

## Project layout

| Path | Contents |
|---|---|
| `content/` | Site content — business data, page files, services, locations, FAQs |
| `niches/` | Niche packs. Data only, no JSX. |
| `src/components/common/` | Layout primitives — `Container`, `Section`, `SectionHeading` |
| `src/components/sections/` | Trade-agnostic page sections |
| `src/components/layout/` | Header, Footer |
| `src/components/ui/` | shadcn components |
| `src/lib/` | Content loading, SEO, schema generation, utilities |
| `src/types/` | TypeScript models |
| `scripts/` | Content validator |
| `docs/` | Documentation |
| `Archive/` | Superseded files, kept rather than deleted |

---

## Status

**v0.5 complete** — content model, section registry, validator, SEO/schema engine,
conversion layer, legal pages, and mobile navigation.

**v0.5.1 planned next** — production hardening: runtime content schemas, conversion
security, truth/launch gates, schema safety, automated tests, and CI.

After v0.5.1: v0.6 hub-and-spoke routing, v0.7 niche packs, then v1.0 production work.

Known defects are tracked in `docs/DEFECTS.md`.

---

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 ·
shadcn/ui · Lucide · Vercel
