# Authority Site Generator

A framework that generates **Local Authority Websites** for local service businesses —
roofing, plumbing, locksmith, HVAC, and others — from structured content.

The framework is the product. Individual websites are outputs.

---

## Read this first

If you are an AI agent or a new contributor, read in this order:

0. **`docs/HANDOFF.md`** — if you are picking up the build, start here.
1. **`docs/FRAMEWORK_PRD.md`** — what we're building. **Source of truth.**
2. `docs/AUTHORITY_MODEL.md` — why. The strategy behind the architecture.
3. `docs/IMPLEMENTATION_PLAN.md` — the current build plan and phase.
4. `docs/AI_GUIDELINES.md` — hard rules for writing code here.
5. `AGENTS.md` — **this is Next.js 16, not the Next.js in your training data.**

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

**v0.2 shipped** — reusable section architecture, typed content model, 8 static routes.

**v0.3 in progress** — page-based content model, section registry, content validator.

Known defects are tracked in the defect ledger at the end of
`docs/IMPLEMENTATION_PLAN.md`.

---

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 ·
shadcn/ui · Lucide · Vercel
