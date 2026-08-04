# Current Session

**Version:** v0.4 complete
**Phase:** Implementation Plan Phases 0–2 done; Phase 3 (conversion layer) next
**First market:** Modesto, CA (roofing)

## Where we are

The framework has a working reusable section layer, a page-based content model with a
build-time validator, and now a real SEO/schema engine: every page carries a unique
title, description, and self-referencing canonical; JSON-LD is generated per page from
content rather than one hardcoded literal; sitemap/robots/manifest/llms.txt all derive
from content. Build passes, 8 static routes, tsc and lint clean, zero business strings
in `src/`.

## Completed this session

- Full architecture audit against the quality checklist
- Reviewed two reference sites (`emergency-plumber`, `emergency-locksmith-modesto`)
- Decided: one framework with niche packs, not per-niche forks (PRD D1)
- Decided: page-based content model (PRD D2)
- Wrote `FRAMEWORK_PRD.md` and `IMPLEMENTATION_PLAN.md`
- Migrated the working tree into `authority-site-generator`
- Archived dead code; rebuilt the documentation layer
- Phase 1 (v0.3) complete: content model, section registry, loader, validator
- Phase 2 (v0.4) complete: metadata, schema generator, generated sitemap/robots/manifest,
  llms.txt — see three revision notes in the plan (2.4's zero-code-change bar deferred to
  Phase 4; 2.5's `force-static` requirement for Route Handlers; the testimonial-rating
  content-model gap in the changelog)

## Next

Phase 3 (v0.5) — the conversion layer: click-to-call, the real `submitLead()`, legal
pages, mobile navigation. See `IMPLEMENTATION_PLAN.md`.

## Known stubs — do not ship a live site yet

- `submitLead()` in `ContactForm` is simulated. The form reports success for a lead that
  was never captured. Phase 3.3.
- `business.address`, `geo`, `hours`, `sameAs`, and `licenseNumber` are empty, and the
  phone is a 555 placeholder. The validator warns on all six; they must become errors
  before launch.
- `TestimonialItem.rating` is optional and currently unset on every testimonial, so
  `Review`/`AggregateRating` schema is not emitted. Needs real ratings from the business,
  not a placeholder value.

## Repo note

`authority-site-generator` is the active repo. `roof-repair-modesto` is a deliberately
frozen fallback and should not be modified.
