> Part of the build plan. Conventions, guardrails, and the phase index are in
> `docs/IMPLEMENTATION_PLAN.md`. Known defects are in `docs/DEFECTS.md`.


# Phase 6 — v1.0: Design system, accessibility, performance

### 6.1 — Branding to CSS variables

**Files:** `src/app/globals.css`, `src/components/**`

`branding.primaryColor: "blue"` can never work — Tailwind v4 cannot build class names from
runtime strings. shadcn already installed a full oklch token system in `globals.css` that
**no component currently uses**.

1. Extend `branding` to real values: `primary`, `primaryForeground`, `accent`, `radius`.
2. Inject them as CSS custom properties on `<html>` from `site.branding`.
3. Replace all ~100 hardcoded color utilities with semantic tokens:
   `text-slate-900` → `text-foreground`, `bg-blue-600` → `bg-primary`,
   `text-slate-600` → `text-muted-foreground`, `border-slate-200` → `border-border`.

**Acceptance:** `grep -rn "slate-\|blue-\|gray-" src/components/ src/app/` returns nothing.
Changing `branding.primary` in JSON visibly rebrands the site.

### 6.2 — Accessibility pass

Skip link; one `<h1>` per page with correct heading order; visible focus states; labelled
form controls; `alt` on every image; colour contrast ≥ 4.5:1; keyboard-operable nav.

Read `node_modules/next/dist/docs/03-architecture/accessibility.md`.

### 6.3 — Images and performance

Replace starter SVGs in `public/`. Use `next/image` with explicit dimensions. Add OG image
generation. Target Lighthouse ≥ 95 across all four categories.

### 6.4 — Final checklist audit

Run the full PRD §10 checklist against the generated roofing site. Every machine-checkable
item must be enforced by the validator, not by eye.

### 6.5 — Commit and tag

`v1.0: production framework` — tag `v1.0.0`.

