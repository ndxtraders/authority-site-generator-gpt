> Part of the build plan. Conventions, guardrails, and the phase index are in
> `docs/IMPLEMENTATION_PLAN.md`. Known defects are in `docs/DEFECTS.md`.


# Phase 5 — v0.7: Niche packs

### 5.1 — Niche pack type and loader

**Files:** `src/types/niche.ts`, `niches/roofing.ts`, `src/lib/niche.ts` (all new)

Implement the `NichePack` interface from PRD §9. Data only — no JSX.

### 5.2 — Wire schema type and section presets

`schemaType` drives `LocalBusiness["@type"]`. `sectionPresets` supply default composition
per page type. `conversionModel` selects the CTA pattern.

### 5.3 — Locksmith pack + CallBar

**Files:** `niches/locksmith.ts`, `src/components/sections/CallBar.tsx` (new)

`CallBar` is the sticky emergency call bar for `conversionModel: "emergency"`. Per the
audit, this is the **only** new component the most divergent niche requires — if you find
yourself needing more, stop and report it, because it would challenge PRD decision D1.

### 5.4 — Prove D1

Create `content-plumbing-example/` — a minimal plumbing site's content plus
`niches/plumbing.ts`. Build it against the same `src/`.

**Acceptance — this is the acceptance test for the entire architecture (PRD §9).** If a
plumbing site cannot be produced without editing `src/`, the niche layer is under-built
and Phase 5 is not done.

### 5.5 — Commit

`v0.7: niche pack architecture, roofing and locksmith packs`

