# Authority Site Generator — Product Requirements

**Status:** Approved through v1.0 implementation
**Version:** PRD v1.1
**Last updated:** 2026-08-04
**Owner:** Rev Vaughn

> **Read this first.** This document is the source of truth for what we are building.
> If this document conflicts with `PROJECT.md`, `ROADMAP.md`, or any `.docx` on the
> Desktop, **this document wins** and the other should be corrected.

---

## 1. Product definition

The Authority Site Generator is a **framework that produces Local Authority Websites
for service businesses**.

A Local Authority Website is designed to become the most trusted online resource for
one trade within one geographic market. Lead generation is the outcome of that
authority, not the goal we optimize for directly.

**The framework is the product. Individual websites are outputs.**

### What it is

- A Next.js application whose rendering is driven entirely by structured content
- A SEO/schema engine that derives metadata, structured data, sitemaps, and robots
  rules from that content
- A set of **niche packs** that define page taxonomy and conversion model per trade
- A quality gate that refuses to ship thin or incomplete pages

### What it is not

- Not a CMS. Content is authored as JSON, not edited in a UI.
- Not a page builder. Section composition is data, but sections are fixed components.
- Not a multi-tenant app. Each site is a separate deployment.
- Not a general website builder. It builds local service business sites, nothing else.

---

## 2. Decisions already made

These were settled in prior sessions. **Do not relitigate them without a written
reason.** Each includes the rationale so a new session can evaluate whether the
reason still holds.

### D1 — One framework, not one per niche

Roofing, plumbing, and locksmith share one codebase. Niche variation is expressed as
**configuration**, not as forked repositories.

*Rationale:* An audit of all nine section components found zero trade-specific
rendering logic — a plumber uses `Hero`, `Services`, `Process`, `FAQ`, and `CTA`
unchanged. The most divergent niche (emergency locksmith) required exactly one new
component, not a fork. Forking would triple the maintenance of the SEO engine, schema
generator, and design system — the most valuable and hardest-to-build layers.

*Decision rule going forward:* **Fork when the rendering differs. Configure when the
content differs.**

*Reversibility:* Forking later from a unified framework is cheap. Merging divergent
forks is not. Staying unified preserves the option.

### D2 — Page-based content model, not a single flat file

`content/site.json` is split into site-wide config plus per-page content files.

*Rationale:* The flat model directly caused every content violation found in the audit.
One `hero` key and one `seo` key cannot express four pages, so page copy was hardcoded
into React and all four pages emitted the same canonical URL. Hub-and-spoke makes it
strictly worse — seven service-area pages cannot exist in a schema with one hero.

### D3 — Page composition is data

Each page declares an ordered `sections` array. The framework renders it through a
section registry.

*Rationale:* This is what lets a niche pack define page *shape* without touching React.
An emergency locksmith home page leads with a call bar; a roofing home page leads with
a financing CTA. Same components, different order, zero code change.

### D4 — Branding drives CSS variables, not class names

`branding` sets CSS custom properties. Components use semantic Tailwind tokens
(`bg-primary`, `text-muted-foreground`), never literal colors (`bg-blue-600`).

*Rationale:* Tailwind v4 cannot construct class names from runtime strings, so the
current `primaryColor: "blue"` design can never work. shadcn already installed a
complete oklch token system in `globals.css` that no component currently uses. That is
the correct mechanism, already present.

### D5 — Static output

Sites are statically prerendered. No server runtime except form submission.

*Rationale:* Local service sites have no personalization needs. Static is faster,
cheaper, and more reliable. It also keeps sites portable across hosts.

### D6 — Repository strategy

Framework and first site share one repository until v1.0, then split into
`leadgen-framework`, `leadgen-content-generator`, and per-business content repos.

*Rationale:* Splitting before the content API stabilizes means versioning an interface
that is still changing.

### D7 — Runtime schemas enforce the content contract

TypeScript types alone do not validate imported JSON. Every site, page, section, and
niche pack must pass runtime schema validation before rendering or building. The runtime
schema is the executable content contract; TypeScript types must be derived from it when
practical or protected from drift by equivalence tests.

*Rationale:* The current loader casts JSON through `unknown`, while the validator checks
only a section's type and whether `props` is an object. Malformed nested props can pass
validation even though the documentation calls the validator a quality gate.

### D8 — Truth is a launch requirement, not a copy preference

Sample content and verified production content are distinct states. A production launch
must fail when business identity is incomplete, placeholder data remains, or factual
trust claims have not been reviewed. Numerical proof, licences, insurance claims,
warranties, testimonials, ratings, hours, and service claims must be verified or omitted.

*Rationale:* Authority depends on evidence. A technically valid site carrying invented or
unverified proof is more damaging than an incomplete site that refuses to launch.

### D9 — Conversion secrets and lead data stay server-side

The browser may receive public conversion presentation values such as the display phone
and thank-you path. Lead-delivery endpoints, credentials, provider tokens, and abuse
controls are server-only deployment configuration. Submitted personal information is
validated, bounded, never written to application logs, and sent only to the configured
provider.

*Rationale:* Passing the full conversion object through a Client Component serializes the
future form endpoint into the browser payload. Logging a failed submission also creates
unnecessary retention of names, phone numbers, email addresses, and project details.

### D10 — Structured data is one safe, connected entity graph

JSON-LD uses stable `@id` values to connect the business, website, services, reviews, and
ratings. User- or AI-authored strings are safely serialized before insertion into a
script element. Schema nodes that cannot be supported by verified content are omitted.

*Rationale:* Emitting disconnected nodes satisfies a type checklist without clearly
describing one entity. Unsafe script serialization also turns future generated content
into an avoidable injection surface.

### D11 — `/contact` is the required v1 conversion destination

The v1 framework uses `/contact` for estimate and inquiry CTAs and `/thank-you` for the
post-submit confirmation. A separate `/estimate` route is optional only when a niche or
campaign has a materially different form or intent; it is not required for v1.

*Rationale:* Two identical form pages create maintenance and canonicalization risk without
improving the visitor journey. The current implementation already uses `/contact` as the
single real destination.

---

## 3. Architecture

Four layers. Each may only depend on layers above it.

```
┌──────────────────────────────────────────────────────────┐
│ FRAMEWORK          React components, SEO engine,         │
│ (rarely changes)   schema generator, routing, design     │
│                    system, TypeScript models             │
├──────────────────────────────────────────────────────────┤
│ NICHE PACK         Page taxonomy, schema type, section   │
│ (per trade)        presets, conversion model, FAQ bank,  │
│                    trust-signal set, content prompts     │
├──────────────────────────────────────────────────────────┤
│ CONTENT            Business info, branding, copy,        │
│ (per site)         services, locations, FAQs, images     │
├──────────────────────────────────────────────────────────┤
│ SITE               Domain, deployment config, analytics  │
│ (per deployment)   IDs, form endpoint                    │
└──────────────────────────────────────────────────────────┘
```

### The invariant

> **Launching a new site must require zero changes to layer 1.**

Every proposed change gets tested against this. If shipping a plumbing site in Turlock
requires editing a React component, the design is wrong.

### Ownership

| Framework owns | Content owns |
|---|---|
| React components | Business name, NAP, hours |
| Layout and navigation shell | Branding values |
| SEO engine | All copy |
| Schema generation | Service descriptions |
| Section registry | FAQs and testimonials |
| Design system and tokens | Service areas |
| Utilities and types | Images |
| Routing and page assembly | Structured data *values* |

---

## 4. Content model

### Directory layout

```
content/
  site.json                 Business, branding, navigation, footer, legal, conversion
  pages/
    home.json
    about.json
    contact.json
    services.json           Services index page
  services/
    roof-repair.json        One file per service → /services/[slug]
    roof-replacement.json
  locations/
    modesto.json            One file per area → /service-area/[slug]
    riverbank.json
  faq/
    how-much-does-a-roof-cost.json    → /faq/[slug]
```

### Page file shape

Every page file — regardless of type — conforms to one interface:

```jsonc
{
  "slug": "roof-repair",
  "pageType": "service",
  "seo": {
    "title": "Roof Repair in Modesto, CA | Roof Repair Modesto",
    "description": "...",
    "canonicalPath": "/services/roof-repair",
    "ogImage": "/images/roof-repair.webp"
  },
  "schema": ["Service", "FAQPage", "BreadcrumbList"],
  "sections": [
    { "type": "Hero",     "props": { "headline": "...", "subheadline": "..." } },
    { "type": "Answer",   "props": { "question": "...", "answer": "..." } },
    { "type": "Process",  "props": { "steps": [...] } },
    { "type": "FAQ",      "props": { "items": [...] } },
    { "type": "CTA",      "props": { "title": "..." } }
  ],
  "internalLinks": ["/services/roof-replacement", "/service-area/modesto"]
}
```

### Type safety

`sections` is a **discriminated union**, not `any`. Each section type maps to its own
props interface, so an invalid prop for a given section type is a compile error.

```ts
type Section =
  | { type: "Hero";     props: HeroProps }
  | { type: "Services"; props: ServicesProps }
  | { type: "FAQ";      props: FAQProps }
  // ...
```

### Content validation

A build-time validator runs before `next build` and **fails the build** on:

- Any site, page, section, or niche object that fails its runtime schema
- Missing required nested props, invalid field types or formats, and unknown section props
- Any page missing `seo.title`, `seo.description`, or `canonicalPath`
- Duplicate `title` or `canonicalPath` across pages
- A `sections` entry whose `type` is not in the registry
- Placeholder content — `555-5555`, `Content coming soon`, `Lorem`, `TODO`
- A location page with no locally specific content (see §7)
- An `internalLinks` target that does not resolve to a real page
- A slug, page type, canonical path, or schema declaration inconsistent with its route

A separate production-readiness check fails when sample content is still active,
required NAP fields are incomplete, or factual trust claims have not been reviewed. A
development build may use clearly marked sample content; a production deployment may not.

*Rationale:* Every one of these is a real defect found in the two reference sites or
the current build. Detection must be automatic, because manual review demonstrably
does not catch them.

---

## 5. Page types and routing

| Route | Source | Purpose |
|---|---|---|
| `/` | `pages/home.json` | Hub |
| `/services` | `pages/services.json` | Service index |
| `/services/[slug]` | `services/*.json` | Money page — commercial intent |
| `/service-area` | generated | Service area index |
| `/service-area/[slug]` | `locations/*.json` | Local page — hub-and-spoke spoke |
| `/faq` | generated | AEO hub |
| `/faq/[slug]` | `faq/*.json` | One question per page |
| `/about` | `pages/*.json` | Trust |
| `/contact` `/thank-you` | `pages/*.json` | Conversion flow |
| Legal set | generated from `site.json` | Trust and compliance |

### Legal set

Generated from business fields, not hand-written: `privacy-policy`, `terms-conditions`,
`disclaimer`, `accessibility`. Present on every site, no exceptions.

*Rationale:* The locksmith reference site carries six such pages. The current framework
has zero. These are table stakes for local service sites and are fully derivable from
`business`, so they should never be authored by hand.

### Hub-and-spoke

One hub site per major market. Surrounding towns are `/service-area/[slug]` pages
within that hub. When a spoke market grows large enough, it graduates to its own hub
site — a new deployment of the same framework with its own content.

Market selection is driven by search demand, competition, population, distance from
existing hubs, and commercial value — **not** by exact-match domain availability.

---

## 6. SEO and schema engine

### Metadata — required behavior

- Every page emits a **unique** `title` and `description`
- Every page emits a **self-referencing** canonical derived from `canonicalPath`
- Open Graph and Twitter tags derive from the same source
- `sitemap.xml` is **generated by enumerating content files**, never hand-maintained
- Non-indexable utility pages, including `/thank-you`, are excluded from the sitemap and
  emit `noindex`
- Sitemap modification dates are accurate content dates or omitted; a deployment time is
  not presented as a content update
- `robots.txt` and `manifest.webmanifest` derive from `site.json`
- Site URL comes from one field; the domain string appears exactly once in the codebase

*Current defect this replaces:* all four built pages emit
`canonical="https://roofrepairmodesto.com"`, telling Google not to index three of them.

### Structured data — required per page type

| Page type | Schema |
|---|---|
| All pages | `LocalBusiness` (typed by niche), `BreadcrumbList` |
| Home | + `WebSite` |
| Service | + `Service` |
| Location | + `LocalBusiness` with `areaServed` |
| FAQ | + `FAQPage` |
| Any page with FAQ section | + `FAQPage` |
| Any page with testimonials | + `Review`, `AggregateRating` |

`LocalBusiness` must include `name`, `telephone`, `email`, `url`, full `address`,
`geo`, `openingHours`, `areaServed`, `priceRange`, and `sameAs`. The `@type` comes from
the niche pack (`RoofingContractor`, `Plumber`, `Locksmith`).

The business, website, services, reviews, and ratings reference stable `@id` values so
they form one graph. Review and rating nodes identify what was reviewed. JSON-LD is
serialized so content cannot terminate the script element.

*Current defect this replaces:* one hardcoded `LocalBusiness` literal, emitted
identically on every page, with no address or hours, ignoring the `schema.businessType`
field that already exists in content.

### AEO requirements

- **Answer-first blocks** — money and FAQ pages lead with a direct 2–3 sentence answer
  before elaboration
- **One page, one intent.** No page targets two primary keywords.
- `llms.txt` generated from the content map
- Consistent NAP across site, schema, and GBP so crawlers resolve one entity
- Concise, factual, citable phrasing over marketing language

---

## 7. Content quality gate

Adapted from the anti-thin gate. Enforced by the validator in §4, not by review.

**No page ships that:**

1. Has a section with empty or placeholder content
2. Is a location page without genuine local specificity — at minimum: neighborhoods
   served, a local climate or condition note, and an area-specific FAQ
3. Duplicates another page's title or canonical
4. Has no internal link to a related page
5. Has no call-to-action
6. Makes an unreviewed factual trust claim about the business
7. Uses a testimonial, rating, licence, insurance, warranty, service-hours, or numerical
   proof claim that has not been verified or explicitly removed

### The local knowledge requirement

Every site must contain information a generic language model cannot produce: local
climate, soil, water conditions, building codes, permit process, common local failure
modes, neighborhood construction eras, seasonal issues.

*Rationale:* This is the entire competitive moat. Per `AUTHORITY_MODEL`, AI knows how
roofs work; it does not know which Modesto neighborhoods have 1970s shake conversions.
A site without this layer is indistinguishable from an SEO factory and will be treated
as one.

**URLs are never deleted, only redirected.** Authority compounds through URL history.

---

## 8. Conversion requirements

Every site must ship with:

- **Click-to-call** — `tel:` links in header, hero, and inline mid-content. Mobile-first.
- **Call tracking number** — configurable per site, distinct from the business's
  primary line, so leads are attributable
- **Quote form** — posts to a real endpoint, routes to the business and to us
- **Thank-you page** — a real URL, so conversions are trackable
- **Trust stack on money pages** — reviews, license number, warranty, insurance
- **GBP alignment** — NAP identical to the Google Business Profile

The quote form must also:

- Read its endpoint and credentials only from server-side deployment configuration
- Validate required values, formats, and maximum lengths on the server
- Apply a documented spam and rate-control strategy before public launch
- Use a bounded provider request with explicit timeout and failure handling
- Never log raw lead fields or expose provider configuration in browser payloads
- Redirect only to a validated internal path after confirmed delivery

*Current defects this replaces:* the contact form resolves a 600ms timer and reports
success for a lead that was never captured; no `tel:` link exists anywhere; the header
CTA button has no `href`.

### Niche conversion models

The niche pack selects the model:

| Model | Used by | Primary mechanism |
|---|---|---|
| `emergency` | locksmith, emergency plumbing | Sticky call bar, call above fold, no financing |
| `considered` | roofing, HVAC replacement | Quote form, financing, insurance angle |
| `mixed` | plumbing, electrical | Both, urgency-gated |

---

## 9. Niche pack specification

A niche pack is **data**. It contains no JSX.

```ts
interface NichePack {
  id: string;                    // "roofing"
  schemaType: string;            // "RoofingContractor"
  conversionModel: "emergency" | "considered" | "mixed";
  pageTypes: PageType[];         // which routes this niche generates
  sectionPresets: Record<PageType, SectionType[]>;   // default composition
  trustSignals: string[];        // "license", "warranty", "insurance-claims"
  faqBank: string[];             // seed questions for content generation
  localKnowledgePrompts: string[];  // what to research per market
}
```

### Acceptance test for D1

The framework is correct if **a plumbing site can be generated from the same code as
the roofing site by supplying a different niche pack and content directory.** This is
the primary acceptance criterion for v1.0. If it fails, the niche layer is under-built.

---

## 10. Quality checklist

Every generated site is reviewed against this. It is also the validator's spec.

**Architecture** — Reusable · JSON-driven · Typed · Mobile · Accessible
**Validation** — Runtime schemas · Strict nested props · Resolved links · Production gate
**SEO** — Metadata · Sitemap · Schema · Canonicals · Internal links
**Local SEO** — Service areas · GBP alignment · FAQs · Reviews · Entity signals
**AEO** — Question coverage · AI-friendly structure · Helpful content · Semantic organization
**Trust** — Verified claims · Authentic testimonials · Complete NAP · Legal review
**Security** — Server-only secrets · No PII logs · Bounded inputs · Abuse controls
**Quality engineering** — Unit tests · Build integration tests · CI · Browser checks

Items that can be machine-checked must be machine-checked. Human review is reserved for
content quality and local knowledge depth, which cannot be automated.

---

## 11. Versions

| Version | Scope | Done when |
|---|---|---|
| **v0.3** | Content model + section registry + validator | Pages carry unique metadata; no hardcoded copy in React; validator fails on thin content |
| **v0.4** | SEO and schema engine | All schema types generate from content; sitemap enumerates automatically; domain appears once |
| **v0.5** | Conversion layer | Working form, click-to-call, call tracking, thank-you page, legal set |
| **v0.5.1** | Production hardening | Runtime schemas, safe conversion boundary, truth gate, connected schema, tests and CI |
| **v0.6** | Hub-and-spoke routing | Service, location, and FAQ dynamic routes with real content |
| **v0.7** | Niche packs | Roofing and locksmith packs; plumbing site generated from same code |
| **v1.0** | Production | Design system on tokens; accessibility pass; Lighthouse ≥ 95; docs complete |

### v1.0 acceptance criteria

1. A new site launches by: clone → replace `content/` → replace images → set domain → deploy
2. Zero React changes required for a new site in an existing niche
3. A new niche requires a niche pack and, at most, one new section component
4. All quality checklist items pass on the generated roofing site
5. Validator catches every defect class listed in §4
6. Production verification rejects sample, incomplete, or unreviewed business content
7. No lead endpoint, credential, or submitted personal information appears in browser
   payloads or application logs
8. Required unit, integration, browser, and build checks pass in CI

---

## 12. Non-goals

Explicitly out of scope for v1.0. Recorded so they don't get rebuilt by accident.

- Visual page builder or admin UI
- Multi-tenant serving
- Blog/CMS authoring workflow
- A/B testing infrastructure
- E-commerce or booking
- Non-English localization
- Automated market research or domain purchasing
- Automated determination that a real-world business claim is true; the framework can
  require evidence and review, but a human remains accountable for verification
- Anything from `SYSTEMS_THINKING.md` not explicitly promoted here

---

## 13. Glossary

| Term | Meaning |
|---|---|
| **Framework** | The reusable application layer. Rarely changes. |
| **Niche pack** | Per-trade configuration. Data, not code. |
| **Content** | Per-site JSON. All copy and business data. |
| **Site** | One deployment: framework + niche pack + content + domain. |
| **Hub** | A market with its own domain. |
| **Spoke** | A surrounding town, served by a location page within a hub. |
| **Money page** | Commercial-intent page. Service, cost, emergency. |
| **Answer-first block** | Direct 2–3 sentence answer before elaboration. Cited by AI. |
| **Local knowledge layer** | Market-specific facts a generic model cannot produce. The moat. |
| **Anti-thin gate** | Validator rules preventing empty or generic pages from shipping. |
| **Production gate** | Checks that prevent sample, incomplete, or unreviewed content from deployment. |
| **Verified claim** | A factual business claim reviewed against an identified source and approved for publication. |
| **Section registry** | Map of section type string to React component. |

---

## 14. Related documents

| Document | Role |
|---|---|
| `FRAMEWORK_PRD.md` | **This file.** What we're building. Source of truth. |
| `AUTHORITY_MODEL.md` | Strategy. Why authority precedes lead generation. |
| `SYSTEMS_THINKING.md` | Parking lot. Ideas not yet adopted. Non-binding. |
| `IMPLEMENTATION_PLAN.md` | Index into `docs/plan/` — how to build v0.3–v1.0. Disposable. |
| `DEFECTS.md` | Known defects, permanently numbered. Cited from code comments. |
| `CHANGELOG.md` | What shipped. |
| Per-site brief | One page per site: business, market, domain, niche, local knowledge notes. |

### Idea lifecycle

```
Thought → SYSTEMS_THINKING → Discussion → Decision → PRD → Implementation → CHANGELOG
```

Nothing in `SYSTEMS_THINKING.md` influences architecture until it is promoted into this
PRD as a numbered decision.
