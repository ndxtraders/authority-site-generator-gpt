# Deployment

> **Current status:** v0.5 is a working prototype, not a production-ready release. Do
> not deploy the sample roofing content as a real business site. Complete Phase H
> (v0.5.1), including the production-readiness gate and human verification of claims,
> before launch.

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
npm run validate      # content validator — must pass before build
npx next build        # must succeed with zero errors
git add .
git commit -m "..."
git push              # only to the authorized GPT repository
```

Phase H.4 will add a separate production-readiness command. The structural validator
answers whether the content is well formed; the production gate answers whether it is
safe and sufficiently verified to publish. Both must pass before a production deploy.

Vercel auto-deploys on push.

## Server-only lead delivery configuration

Lead-provider configuration is deployment state, not content. Configure these values in
the hosting environment; never add them to `content/site.json`, commit them in an `.env`
file, or prefix them with `NEXT_PUBLIC_`:

| Variable | Required | Purpose |
|---|---:|---|
| `LEAD_DELIVERY_ENDPOINT` | Before launch | Absolute HTTP(S) endpoint that receives the lead JSON payload; use HTTPS in production |
| `LEAD_DELIVERY_AUTHORIZATION` | Provider-dependent | Complete `Authorization` header value required by the provider |

Only `src/lib/server/conversion-config.ts` reads these variables. The contact Server
Action receives no endpoint, credential, or redirect argument from the browser. It reads
the validated `conversion.thankYouPath` from site content on the server and redirects
only after the provider returns a successful response.

No delivery provider is configured in this repository. Until the deployment environment
defines a real endpoint, the form returns a visitor-safe error and logs only a generated
request ID, status category, and request duration. If the selected provider requires a
signing secret or another credential shape, add it as a non-public deployment variable
inside the same server-only module when the provider adapter is implemented; never place
it in content or a Client Component.

## Post-deploy checklist

- [ ] Verify Lighthouse ≥ 95 across all four categories
- [ ] Confirm every page has a unique title and self-referencing canonical
- [ ] Validate JSON-LD with Schema.org Validator and Google Rich Results Test where applicable
- [ ] Submit `sitemap.xml` to Google Search Console
- [ ] Confirm NAP matches the Google Business Profile exactly
- [ ] Confirm every license, insurance, experience, availability, project-count, review, and testimonial claim has an accountable human source
- [ ] Test click-to-call on a real mobile device
- [ ] Submit a test lead through the form and confirm it arrives

## Rules

- **Never delete a URL.** Redirect it. Authority compounds through URL history.
- Push only to `ndxtraders/authority-site-generator-gpt`. The original
  `ndxtraders/authority-site-generator` repository is protected by the Prime Directive.
- The content validator gates the build. Do not bypass it.
- The production-readiness gate will gate deployment once Phase H.4 is implemented. Do
  not substitute structural validation for human verification of business facts.
