> Part of the build plan. Conventions, guardrails, and the phase index are in
> `docs/IMPLEMENTATION_PLAN.md`. Known defects are in `docs/DEFECTS.md`.


# Phase 4 — v0.6: Hub-and-spoke routing

### 4.1 — Dynamic routes

**Files:** `src/app/services/[slug]/page.tsx`, `service-area/[slug]/page.tsx`,
`faq/[slug]/page.tsx`

Each uses `generateStaticParams` over its content directory and `generateMetadata` per
PRD §5. Read the bundled `generate-static-params.md` first.

### 4.2 — Index pages

`/service-area` and `/faq` hubs, generated from their content directories.

### 4.3 — Seed content

Create real content for: 3 services, 3 locations (Modesto + 2 spokes), 5 FAQ pages.

**This content must carry genuine local knowledge** — climate, permits, neighborhoods,
common local failure modes (PRD §7). Generic filler will fail the validator and defeats
the purpose. Flag for Rev's review rather than inventing local facts.

### 4.4 — Internal linking

Render `internalLinks` as a related-pages block. Service cards link to their service pages.
Location pages link to services and the hub.

**Acceptance:** no orphan pages; every page reachable by at least two internal links.

### 4.5 — Commit

`v0.6: dynamic routing for services, locations, and FAQ`

