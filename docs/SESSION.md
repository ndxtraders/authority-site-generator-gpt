# Current Session

**Version:** v0.3 complete
**Phase:** Implementation Plan Phases 0 and 1 done; Phase 2 (SEO engine) next
**First market:** Modesto, CA (roofing)

## Where we are

The framework has a working reusable section layer: nine trade-agnostic components built
on `Container` / `Section` / `SectionHeading`, driven by a typed content model. The
homepage is pure orchestration. The build passes and prerenders 8 static routes.

An audit on 2026-08-03 found 25 defects, all logged in `IMPLEMENTATION_PLAN.md`. The
most serious: every page emits the homepage canonical, so three of four pages are telling
Google not to index them.

## Completed this session

- Full architecture audit against the quality checklist
- Reviewed two reference sites (`emergency-plumber`, `emergency-locksmith-modesto`)
- Decided: one framework with niche packs, not per-niche forks (PRD D1)
- Decided: page-based content model (PRD D2)
- Wrote `FRAMEWORK_PRD.md` and `IMPLEMENTATION_PLAN.md`
- Migrated the working tree into `authority-site-generator`
- Archived dead code; rebuilt the documentation layer

- Phase 1 (v0.3) complete: content model, section registry, loader, validator

## Next

Phase 2 (v0.4) — the SEO engine. Highest-value item is 2.2: every page still emits the
home page's canonical, so three of four pages tell Google not to index them. Page content
already carries the correct per-page `seo` block; it just needs wiring through
`generateMetadata`.

Then 2.3 (schema generator), 2.4 (generated sitemap/robots/manifest), 2.5 (`llms.txt`).

See `IMPLEMENTATION_PLAN.md`. Phases 2–6 are suitable for Sonnet; the plan carries
acceptance checks and revision notes for each.

## Known stubs — do not ship a live site yet

- `submitLead()` in `ContactForm` is simulated. The form reports success for a lead that
  was never captured.
- `business.address`, `geo`, `hours`, `sameAs`, and `licenseNumber` are empty, and the
  phone is a 555 placeholder. The validator warns on all six; they must become errors
  before launch.

## Repo note

`authority-site-generator` is the active repo. `roof-repair-modesto` is a deliberately
frozen fallback and should not be modified.
