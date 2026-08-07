# Implementation Plan — index

**Target repo:** `ndxtraders/authority-site-generator-gpt`
**Companion doc:** `docs/FRAMEWORK_PRD.md` — the source of truth. If anything here
contradicts it, the PRD wins.
**Status:** Phases 0–3 and H.1–H.6 complete; **H.7 is next**
**Written:** 2026-08-03; revised 2026-08-04 after production-readiness review; split into
per-phase files 2026-08-06

> **Open one phase file, not all of them.** Each is self-contained. This index holds the
> rules that apply to every phase.

---

## Phases

| Phase | Version | File | Status |
|---|---|---|---|
| 0–3 | v0.2 – v0.5 | `docs/plan/phase-0-3.md` | Complete |
| H | v0.5.1 — production hardening | `docs/plan/phase-h.md` | H.1–H.6 complete, **H.7 next** |
| 4 | v0.6 — hub-and-spoke routing | `docs/plan/phase-4.md` | Not started |
| 5 | v0.7 — niche packs | `docs/plan/phase-5.md` | Not started |
| 6 | v1.0 — design, accessibility, performance | `docs/plan/phase-6.md` | Not started |

Known defects are in **`docs/DEFECTS.md`**, not here.

---

## How to use this plan

Work **one task at a time, in order**. Each task lists the files it touches, what to do,
and an acceptance check. Do not start a task until the previous task's acceptance check
passes.

Phases map to versions in the PRD (§11). From v0.5.1 onward, commit every completed
numbered task because each task may be a session boundary. Add a phase-level release
commit only when the phase needs final integration changes.

### Repository boundary

All work governed by this plan goes only to the local
`/Users/raulvaughn/Documents/authority-site-generator-gpt` checkout and GitHub repository
`ndxtraders/authority-site-generator-gpt`. The upstream `authority-site-generator` local
folder and GitHub repository are protected. Verify `pwd` and `git remote -v` before every
write or push; see `AGENTS.md` for the Prime Directive.

### Session boundaries

A numbered task with passing acceptance checks is the default unit of one session. Start a
fresh session at these natural boundaries:

- After any numbered task in v0.5.1 or later passes its acceptance checks
- At every phase commit
- Before changing subsystems, for example validation → forms or routing → design system
- Before work that depends on new business facts, provider credentials, legal review, or
  another external decision
- When investigation has become long enough that the written checkpoint is clearer than
  the active conversation

Do **not** end or switch sessions during a failing build, partially applied migration, or
uncommitted multi-file change. Finish or safely roll the task back first.

Before ending a session:

1. Run the task's acceptance checks.
2. Commit a coherent checkpoint on the active development branch.
3. Update `docs/SESSION.md` with changes, validation results, risks, and the exact next
   task number. Move the completed task's detail into `docs/CHANGELOG.md`.
4. Update `docs/HANDOFF.md` only if architecture, sequencing, or resume instructions
   changed.
5. Record `git status -sb`; do not make a fresh session rediscover intentional state.

### Before writing any code

This is **Next.js 16.2.12 with Turbopack**, not the Next.js in your training data. APIs
and conventions differ. Read the relevant bundled guide first:

| Topic | Read |
|---|---|
| Routing, layouts | `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md` |
| Metadata | `node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md` |
| `generateMetadata` | `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md` |
| Dynamic routes | `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/dynamic-routes.md` |
| `generateStaticParams` | `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-static-params.md` |
| sitemap.ts | `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/sitemap.md` |
| robots.ts | `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/robots.md` |
| Forms | `node_modules/next/dist/docs/01-app/02-guides/forms.md` |
| CSS | `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md` |

Heed deprecation notices in those files.

### Guardrails

1. **Never delete a file without asking.** Move to `Archive/` if unsure.
2. **Push only to the GPT repository.** Rev has granted standing permission for reasonable
   commits and pushes there. That permission never applies to the protected upstream.
3. **Run `npx next build` after every task.** A task is not done if the build breaks.
4. **No business-specific strings in `src/`.** If you type "roof," "Modesto," or a phone
   number into a file under `src/`, you have made a mistake. The only exceptions are
   `content/` and `niches/`.
5. **Smallest diff that works.** Do not refactor neighboring code or rename for style.
6. **If a task reveals the plan is wrong, stop and say so.** Do not improvise around it.
   Record the correction as a revision note in the phase file, at the task it corrects.

---

## Definition of done for the whole plan

1. A new site in an existing niche launches with **zero** changes under `src/`
2. A plumbing site builds from the same `src/` with a different niche pack and content
3. Every PRD §10 checklist item passes on the generated roofing site
4. Runtime validation and production verification catch every machine-checkable defect
   class in `docs/DEFECTS.md`; factual claims that software cannot prove require a
   recorded human review
5. Lighthouse ≥ 95 across all categories
6. A cold session can read `README.md` → `FRAMEWORK_PRD.md` and be productive
7. No server-only conversion value or submitted PII appears in browser payloads or logs
8. Required validation, tests, browser checks, and production build pass in CI
