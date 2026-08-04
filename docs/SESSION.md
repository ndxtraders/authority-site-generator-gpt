# Current Session

**Version:** v0.5 complete
**Phase:** Implementation Plan Phases 0–3 done; Phase 4 (hub-and-spoke routing) next
**First market:** Modesto, CA (roofing)

## Where we are

The framework has a working reusable section layer, a page-based content model with a
build-time validator, a real SEO/schema engine, and now a real conversion layer:
click-to-call throughout, a contact form that genuinely submits (and honestly errors
when no delivery provider is configured) and redirects to a thank-you page, generated
legal pages, and accessible mobile navigation. Build passes, 16 routes, tsc and lint
clean, zero business strings in `src/`.

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
- Phase 3 (v0.5) complete: `conversion` config, `CallLink` + real `tel:` links, a Server
  Action-backed contact form with a real thank-you page, generated legal pages, and
  accessible mobile navigation — see the revision notes on 3.1–3.5 in the plan and the
  v0.5 changelog entry

## Next

Phase 4 (v0.6) — hub-and-spoke routing: dynamic `service`/`location` routes. See
`IMPLEMENTATION_PLAN.md`.

## Known stubs — do not ship a live site yet

- `conversion.formEndpoint` is empty — no lead-delivery provider (email/CRM) is wired
  up. The contact form's Server Action (`src/lib/actions/contact.ts`) is honest about
  this: it returns a clear error instead of the old fake-success stub, but no lead
  submitted through the live form is actually delivered anywhere yet. Choose a provider
  and set `formEndpoint` before launch.
- The four generated legal pages (`src/lib/legal.ts`) are generic templates populated
  only with real `business`/`site` fields — no fabricated claims, but **not a
  substitute for legal review**. Have counsel review before shipping.
- Mobile navigation (`src/components/layout/MobileNav.tsx`) was verified via the built
  HTML's ARIA markup, not in an actual browser — no browser automation tool was
  available this session. Do a manual keyboard-only pass at 375px before shipping.
- `business.address`, `geo`, `hours`, `sameAs`, and `licenseNumber` are empty, and the
  phone is a 555 placeholder. The validator warns on all six; they must become errors
  before launch.
- `TestimonialItem.rating` is optional and currently unset on every testimonial, so
  `Review`/`AggregateRating` schema is not emitted. Needs real ratings from the business,
  not a placeholder value.

## Repo note

`authority-site-generator` is the active repo. `roof-repair-modesto` is a deliberately
frozen fallback and should not be modified.
