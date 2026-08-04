# Deployment

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
git push              # ask before pushing to main
```

Vercel auto-deploys on push.

## Post-deploy checklist

- [ ] Verify Lighthouse ≥ 95 across all four categories
- [ ] Confirm every page has a unique title and self-referencing canonical
- [ ] Validate JSON-LD against schema.org's validator
- [ ] Submit `sitemap.xml` to Google Search Console
- [ ] Confirm NAP matches the Google Business Profile exactly
- [ ] Test click-to-call on a real mobile device
- [ ] Submit a test lead through the form and confirm it arrives

## Rules

- **Never delete a URL.** Redirect it. Authority compounds through URL history.
- Never push to `main` without permission.
- The content validator gates the build. Do not bypass it.
