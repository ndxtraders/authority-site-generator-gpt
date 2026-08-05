# Testing and CI

H.6 uses the native Node test runner for unit and fixture tests, production Next output
for build integration assertions, and Playwright Chromium for browser behavior.

## Clean-checkout verification

Install dependencies and the browser once:

```bash
npm ci
npx playwright install chromium
```

Then run the complete required check with one command:

```bash
npm run verify
```

That command runs content validation, ESLint, TypeScript, unit and negative-fixture
tests, a sentinel production build with built-output assertions, and browser tests for
mobile navigation and contact-form validation/error states. The sentinel provider URL
and authorization value must remain absent from all browser-delivered output.

GitHub Actions runs the same `npm run verify` command on every pull request and push.
The current roofing content is intentionally `sample`, so `npm run verify:production`
still fails on documented real-world launch blockers and is tested separately through
the production-readiness fixture suite.
