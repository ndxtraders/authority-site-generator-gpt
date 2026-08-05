# Deployment

> **Current status:** v0.5.1 hardening is in progress. The production-readiness gate is
> active and intentionally rejects the current sample roofing content. Do not deploy it
> as a real business site. Complete the remaining Phase H work and every documented
> real-world verification item before launch.

## Launching a new site

The target workflow (PRD §11, v1.0 acceptance criterion 1):

1. Clone the framework repository
2. Replace `content/`
3. Replace images in `public/`
4. Set `site.url` and the niche pack
5. Deploy

No changes under `src/` should be required.

## Deploy

```bash
npm run validate              # structural/development content gate
npm run verify:production     # truth and launch-readiness gate
npm run build                 # full production build
git add .
git commit -m "..."
git push              # only to the authorized GPT repository
```

`npm run validate` permits clearly identified sample content so development can continue.
`npm run verify:production` rejects sample status, reserved phone data, incomplete
business identity, unconfigured lead delivery, missing real images, pending human review,
unverified claims, stale evidence paths, and risky trust claims missing from the evidence
ledger. Both commands and the full build must pass before a production deploy.

Vercel auto-deploys on push.

## Content truth and verification evidence

`content/site.json` carries the public-safe lifecycle value `contentState`: `sample` or
`verified`. Detailed evidence belongs in `content/production.json`, which is validated by
the tooling but is not imported by the application content loader. Keep evidence entries
free of credentials, personal data, and confidential documents; record a non-sensitive
source reference that an accountable reviewer can resolve.

The production ledger has two parts:

- `claims` records each factual trust or service claim, its exact content paths, review
  status, evidence source, reviewer, and review date. The gate automatically inventories
  Services, WhyChooseUs, Proof, Testimonials, and Authority content, plus risky language
  elsewhere. A new detected claim without a ledger entry fails verification.
- `humanReviews` records the checks software cannot prove. Every item requires
  `status: "verified"`, a source, reviewer, and `reviewedAt` date.

| Review | Required source | Accountable reviewer |
|---|---|---|
| Business identity | Owner intake plus official registration/licence and NAP records | Business owner or designated verification reviewer |
| Local knowledge | Identified local research, permit/code sources, and owner or field-expert confirmation | Local subject-matter reviewer |
| Testimonials and ratings | Original platform URL/export or signed customer publication approval | Business owner or designated verification reviewer |
| Legal language | Written approval tied to the deployed legal text | Qualified legal reviewer selected by the business |
| GBP alignment | Current Google Business Profile export or dated screenshots | Deployment owner |
| Rate control | Provider/edge rule ID, thresholds, activation date, and test evidence | Rev Vaughn, deployment owner |
| Image rights | Original asset, licence, or model/property release register | Content owner or designated verification reviewer |

To clear a claim, either remove it from the page and its ledger record, or verify it
against a recorded source and complete its reviewer/date fields. Set `contentState` to
`verified` only after the entire gate passes. Never change the state merely to bypass a
deployment failure.

## Server-only lead delivery configuration

Lead-provider configuration is deployment state, not content. Configure these values in
the hosting environment; never add them to `content/site.json`, commit them in an `.env`
file, or prefix them with `NEXT_PUBLIC_`:

| Variable | Required | Purpose |
|---|---:|---|
| `LEAD_DELIVERY_ENDPOINT` | Before launch | Absolute HTTP(S) endpoint that receives the lead JSON payload; use HTTPS in production |
| `LEAD_DELIVERY_AUTHORIZATION` | Provider-dependent | Complete `Authorization` header value required by the provider |

`src/lib/server/conversion-config.ts` remains the application's only reader of these
variables. The operational `verify:production` command also checks that the endpoint is
present and is a real HTTPS provider URL; it never logs or serializes the value. The
contact Server Action receives no endpoint, credential, or redirect argument from the
browser. It reads the validated `conversion.thankYouPath` from site content on the server
and redirects only after the provider returns a successful response.

No delivery provider is configured in this repository. Until the deployment environment
defines a real endpoint, the form returns a visitor-safe error and logs only a generated
request ID, status category, and request duration. If the selected provider requires a
signing secret or another credential shape, add it as a non-public deployment variable
inside the same server-only module when the provider adapter is implemented; never place
it in content or a Client Component.

### Lead-provider contract

The framework sends normalized JSON with `requestId`, `submissionId`, `name`, `phone`,
`email`, and `message`. It also sends:

- `Idempotency-Key: <submissionId>` so repeated attempts can be deduplicated
- `X-Request-ID: <requestId>` for non-sensitive operational tracing
- `Authorization` only when the server-only deployment value is configured

The provider must return a 2xx JSON response containing `{ "accepted": true }`. Empty,
non-JSON, negative-acknowledgment, non-2xx, network-error, and timeout responses are
treated as delivery failures and never redirect the visitor. The complete request,
including response-body parsing, has an eight-second application timeout.

### Spam and rate-control ownership

The form applies strict field and total-size limits, rejects unexpected fields, uses a
honeypot and minimum submission time, and sends a stable idempotency key for duplicate
attempts. These controls reduce low-effort abuse but do not replace durable rate control.

**Accountable owner:** Rev Vaughn, as site deployment owner, must activate and record the
provider/edge rate-control rule before public launch. The required baseline is a
per-deployment cap of 10 delivery requests per minute with a burst no greater than 5,
plus duplicate suppression for the `Idempotency-Key` for at least 24 hours. Record the
provider name, rule identifier, configured thresholds, activation date, and test evidence
in the deployment record. If the selected provider cannot enforce both controls, add a
durable application-side limiter/idempotency store before launch. The current repository
has no provider selected, so this remains an explicit launch blocker rather than a claim
that rate limiting is already active.

## Post-deploy checklist

- [ ] Verify Lighthouse ≥ 95 across all four categories
- [ ] Confirm every page has a unique title and self-referencing canonical
- [ ] Validate JSON-LD with Schema.org Validator and Google Rich Results Test where applicable
- [ ] Submit `sitemap.xml` to Google Search Console
- [ ] Confirm NAP matches the Google Business Profile exactly
- [ ] Confirm every license, insurance, experience, availability, project-count, review, and testimonial claim has an accountable human source
- [ ] Confirm `contentState` is `verified` and every `content/production.json` evidence record names its source, reviewer, and review date
- [ ] Confirm local-knowledge, legal, GBP, and image-rights reviews are recorded
- [ ] Test click-to-call on a real mobile device
- [ ] Submit a test lead through the form and confirm it arrives
- [ ] Confirm Rev Vaughn (deployment owner) recorded an active rate-control rule: ≤10 requests/minute, burst ≤5, and `Idempotency-Key` suppression for ≥24 hours
- [ ] Test the provider's accepted, duplicate, non-2xx, malformed-response, and timeout paths

## Rules

- **Never delete a URL.** Redirect it. Authority compounds through URL history.
- Push only to `ndxtraders/authority-site-generator-gpt`. The original
  `ndxtraders/authority-site-generator` repository is protected by the Prime Directive.
- The content validator gates the build. Do not bypass it.
- The production-readiness gate is mandatory before deployment. Do not substitute
  structural validation for human verification of business facts.
