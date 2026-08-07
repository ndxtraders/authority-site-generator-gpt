# Defect register

Single source of truth for known defects. Nothing here may be silently dropped.

**Defect numbers are permanent.** Several are cited by number in code comments
(`src/app/sitemap.ts` cites #6, `src/app/layout.tsx` cites #9,
`src/lib/schema/localBusiness.ts` cites #11). Never renumber a row. Retire a defect by
changing its status, not by deleting it.

| Column | Meaning |
|---|---|
| **Confirmed** | `executed` — reproduced by running code. `read` — established by reading code. `audit` — from the 2026-08-03 audit. |
| **Status** | `Fixed` / `Open` / `Accepted` (known, deliberately not fixed) |
| **Phase** | Where it is scheduled. `—` means unscheduled. |

---

## 1–39 — 2026-08-03 architecture audit

Closed out through Phases 0–3 and H.1–H.6, except #39 (H.7, in progress).

| # | Defect | Confirmed | Status | Phase |
|---|---|---|---|---|
| 1 | Hardcoded copy in about/services/contact pages | audit | Fixed | 1.3, 1.6 |
| 2 | "Request Service" and form strings hardcoded in components | audit | Fixed | 1.3, 3.3 |
| 3 | `branding` typed but referenced by zero components | audit | Open | 6.1 |
| 4 | ~100 hardcoded Tailwind colours | audit | Open | 6.1 |
| 5 | Domain hardcoded in sitemap/robots/manifest | audit | Fixed | 2.1, 2.4 |
| 6 | Sitemap hand-maintained; new pages silently omitted | audit | Fixed | 2.4 |
| 7 | No hub-and-spoke routing | audit | Open | 4.1 |
| 8 | `metadata.ts` written but never imported | audit | Fixed | 0.2, 2.2 |
| 9 | **All four pages emit the homepage canonical** | audit | Fixed | 2.2 |
| 10 | Duplicate titles and OG tags across pages | audit | Fixed | 2.2 |
| 11 | Schema is a hardcoded literal; `schema.businessType` ignored | audit | Fixed | 2.3 |
| 12 | No FAQPage / Service / Breadcrumb / Review schema | audit | Fixed | 2.3 |
| 13 | `LocalBusiness` missing address, geo, hours, sameAs | audit | Open | 1.3, 2.3 |
| 14 | Contact form reports success without capturing the lead | audit | Fixed | 3.3 |
| 15 | No `tel:` links anywhere | audit | Fixed | 3.2 |
| 16 | Header CTA button has no `href` | audit | Fixed | 3.2 |
| 17 | No mobile navigation below 768px | audit | Fixed | 3.5 |
| 18 | Four orphan components | audit | Fixed | 0.2 |
| 19 | `Authority.tsx` built but rendered nowhere | audit | Fixed | 1.3 |
| 20 | No internal links between pages | audit | Open | 4.4 |
| 21 | No images; starter SVGs still in `public/` | audit | Open | 6.3 |
| 22 | No legal or trust pages | audit | Fixed | 3.4 |
| 23 | Content is generic; zero local knowledge | audit | Open | 4.3 |
| 24 | No `llms.txt` | audit | Fixed | 2.5 |
| 25 | Docs stale, escaped, and partly uncommitted | audit | Fixed | 0.3 |
| 26 | JSON is cast to TypeScript types without complete runtime validation | audit | Fixed | H.1 |
| 27 | Nested section props and invalid formats can pass the validator | audit | Fixed | H.1 |
| 28 | Broken internal links warn instead of failing the documented quality gate | audit | Fixed | H.1 |
| 29 | Full conversion config, including future endpoint, crosses the client boundary | audit | Fixed | H.2 |
| 30 | Failed submissions log raw lead PII | audit | Fixed | H.2 |
| 31 | Form lacks bounded validation, timeout, spam controls, and rate-control plan | audit | Fixed | H.3 |
| 32 | Unverified trust claims, statistics, and testimonials can pass a build | audit | Fixed | H.4 |
| 33 | Development sample content is not mechanically separated from production content | audit | Fixed | H.4 |
| 34 | JSON-LD serialization does not escape script-closing content | audit | Fixed | H.5 |
| 35 | Review and AggregateRating nodes are disconnected from the business entity | audit | Fixed | H.5 |
| 36 | Thank-you page is indexable and included in the sitemap | audit | Fixed | H.5 |
| 37 | Sitemap dates and manifest assets can make unsupported freshness/asset claims | audit | Fixed | H.5 |
| 38 | No project tests or CI protect the documented acceptance criteria | audit | Fixed | H.6 |
| 39 | README and package versions lag the implemented version | audit | Open | H.7 |

---

## 40–52 — 2026-08-06 code review

Found by reading and executing the code at commit `436654d` (branch `agent/v0-5-1-h6`).
All checks passed at the time — these are defects the current gates do not catch. None is
scheduled yet; assigning phases is a decision for Rev, not a session.

| # | Defect | Severity | Confirmed | Status | Phase |
|---|---|---|---|---|---|
| 40 | Spam timing check trusts the visitor's system clock; skew silently drops leads | High | read | Open | — |
| 41 | Generated legal pages fail `PageContentSchema` and are never runtime-parsed | High | executed | Open | — |
| 42 | `additionalKnownPaths` is a dead parameter; legal routes fail internal-link validation | Medium | executed | Open | — |
| 43 | `conversion.model`, `branding.accentColor`, `business.industry` are required by the schema and read by zero code | Medium | executed | Open | — |
| 44 | `/contact` is hardcoded in four components, breaking the zero-code-change invariant | Medium | read | Open | — |
| 45 | No `not-found.tsx`, `error.tsx`, or `global-error.tsx` | Medium | executed | Open | — |
| 46 | Contact form silently fails without JavaScript | Medium | read | Open | — |
| 47 | `business.hours` is unvalidated free text emitted as schema.org `openingHours` | Medium | read | Open | — |
| 48 | LocalBusiness publishes `business.phone` while every CTA dials `conversion.trackingPhone` | Low | read | Open | — |
| 49 | No security headers or CSP in `next.config.ts` | Medium | executed | Open | — |
| 50 | No skip link; mobile nav has no focus trap, focus return, or scroll lock | Medium | read | Open | — |
| 51 | Zod 4 deprecated APIs throughout (`.email()`, `.url()`, `.uuid()`, `.passthrough()`) | Low | executed | Open | — |
| 52 | 8 KB aggregate form cap counts React `$ACTION_` metadata before skipping it | Low | read | Open | — |

### 40 — Spam timing check trusts the visitor's system clock

`src/lib/contact-submission.ts:200-204`. `submission.startedAt` is `Date.now()` in the
browser; `now` is server time. A client clock running ahead makes `elapsed` negative and
fails the `>= 1500ms` check. A clock more than two hours behind fails the maximum. The
visitor sees "We couldn't submit this request" and the log records `spam_rejected`.

Highest-consequence defect in the register: it discards real leads, produces no
distinguishing signal, and grows with traffic volume. A fix must not reintroduce a
client-supplied trust boundary — server-issued token or dropping the minimum-time check
in favour of the honeypot plus provider rate control are both viable.

### 41 — Generated legal pages fail the content contract

`src/lib/legal.ts:39`. `buildPage()` hand-constructs `PageContent` objects that are
TypeScript-typed but never passed through `PageContentSchema`. Running the parser against
them fails on `sections: Too small: expected array to have >=1 items` for all four slugs.
They would also trip the "no call to action" rule in `src/lib/content-quality.ts`.

Four indexable, sitemapped, publicly served pages are exempt from every gate the
architecture claims is universal. A `LegalBody` section type would return them to the
contract and close #42 at the same time.

### 42 — `additionalKnownPaths` is a dead parameter

`src/lib/content-schema.ts:628` accepts it; no caller passes it. Legal routes are
therefore absent from `knownPaths`, so any page listing `/privacy-policy` in
`internalLinks` fails validation with "does not resolve to known content". Phase 4.4
requires exactly that kind of cross-linking, so this blocks work already scheduled.

### 43 — Three content fields drive nothing

`conversion.model` (`emergency | considered | mixed`), `branding.accentColor`, and
`business.industry` are required by `SiteConfigSchema`, authored in `content/site.json`,
and read by zero code outside the schema and type definitions. This is defect #3
repeating three more times.

`conversion.model` is the significant one: it encodes the funnel strategy — an emergency
locksmith and a considered roof replacement convert differently — and currently changes
nothing about the generated site.

### 44 — `/contact` hardcoded in four components

`src/components/sections/Hero.tsx:34`, `src/components/sections/CTA.tsx:27`,
`src/components/layout/MobileNav.tsx:68`, `src/components/layout/Header.tsx:34`.

PRD D11 makes `/contact` the required v1 destination, so this is defensible today. It is
still a routing decision living in `src/` while `thankYouPath` lives in content, and it
breaks the zero-code-change invariant the first time a niche needs a different primary
destination. A content-driven `conversion.primaryCtaPath` resolves it alongside #43.

### 45 — No error or not-found routes

No `not-found.tsx`, `error.tsx`, or `global-error.tsx` anywhere under `src/app`. Any 404
or render error serves Next's unstyled default: no header, no footer, no phone number, no
route back. On a page you are paying to rank, that is a dead end for a real visitor.

### 46 — Contact form requires JavaScript

`src/components/forms/ContactForm.tsx:25-33` populates `startedAt` and `submissionId` in a
`useEffect`. Without JavaScript both submit empty, fail the `^\d{13}$` and UUID checks,
produce no field errors, and fall through to `spam_rejected` with a generic message.

Defensible as a design choice, but undocumented — and `useActionState` is specifically the
progressive-enhancement API. Decide and record it either way.

### 47 — `business.hours` is unvalidated free text

`src/lib/schema/localBusiness.ts:58` emits `business.hours` directly as schema.org
`openingHours`, which expects a defined format such as `Mo-Fr 09:00-17:00`. The content
schema is `z.array(nonEmptyString)`, so `"Mon-Fri 8 to 5"` validates and produces invalid
structured data. H.5's clean schema.org validator run only passed because the array is
currently empty — the check will not stay clean once real hours are entered.

### 48 — Schema phone and CTA phone differ

`buildLocalBusiness` publishes `business.phone`; every CTA dials
`conversion.trackingPhone`. This is probably intentional — real NAP in structured data,
tracking number in the UI — but nothing states it, nothing enforces the relationship, and
inverting it silently breaks either NAP consistency or call attribution.

### 49 — No security headers

`next.config.ts` is empty. No CSP, `X-Frame-Options`, `Referrer-Policy`, or
`Permissions-Policy` on a site that collects PII through a form. Lighthouse Best Practices
penalizes a missing CSP, and the definition of done requires ≥95 across all categories.

### 50 — Accessibility gaps outside the H.6 browser suite

No skip-to-content link anywhere. `MobileNav` opens without moving focus, has no focus
trap, no focus return on close, and no scroll lock. `role="alert"` combined with
`aria-live="polite"` at `src/components/forms/ContactForm.tsx:154` is contradictory —
`alert` already implies assertive. The framework ships an Accessibility Statement page.

### 51 — Zod 4 deprecated APIs

`.email()`, `.url()`, `.uuid()`, and `.passthrough()` are deprecated in Zod 4 in favour of
`z.email()`, `z.url()`, `z.uuid()`, and `z.looseObject()`. They work in the pinned 4.4.3
and are slated for removal in Zod 5 — the same class of silent upgrade wall as the pinned
Next 16.2.12 advisory already recorded in `docs/SESSION.md`.

### 52 — Form byte cap counts framework metadata

`src/lib/contact-submission.ts:143` adds each entry to `totalBytes` before line 147 skips
React's `$ACTION_` fields. The real visitor budget is therefore smaller than the
documented 8 KB and shrinks as Next's action identifiers grow.

---

## Related

Launch blockers that are not code defects — incomplete NAP, unconfigured lead delivery,
pending human reviews, unverified trust claims — live in `docs/SESSION.md`. Non-binding
product ideas live in `docs/SYSTEMS_THINKING.md`.
