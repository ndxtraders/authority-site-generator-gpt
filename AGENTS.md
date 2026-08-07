<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Authority Site Generator GPT — Project Instructions

These rules apply to this repository and override broader defaults when they conflict.

## Prime Directive — repository boundary

This is the authorized development copy:

- Local: `/Users/raulvaughn/Documents/authority-site-generator-gpt`
- GitHub: `ndxtraders/authority-site-generator-gpt`

The following upstream project is protected:

- Local: `/Users/raulvaughn/Documents/authority-site-generator`
- GitHub: `ndxtraders/authority-site-generator`

Never modify, commit to, push to, open a pull request against, or otherwise mutate the
protected upstream project unless Rev proactively initiates that exact request in the
current conversation. Permission for this GPT repository never transfers upstream.

Before any write or push, verify both `pwd` and `git remote -v`. If either target is not
the authorized GPT copy, stop.

## Read on demand — do not preload

**This file is the only document loaded automatically. Everything else is pulled when the
task needs it.** Do not open the full documentation set to "get context" — it is ~155 KB
and reading it all costs more than most tasks are worth. Open what the row says, and stop.

| You need to | Open |
|---|---|
| Resume work / current state / launch blockers | `docs/SESSION.md` |
| Next task, acceptance checks, guardrails | `docs/IMPLEMENTATION_PLAN.md` (index → one phase file) |
| Known bugs and their status | `docs/DEFECTS.md` |
| What we're building and why — **source of truth** | `docs/FRAMEWORK_PRD.md` |
| Architecture, subsystem map, hard-won rules | `docs/HANDOFF.md` |
| Strategy behind authority-before-leads | `docs/AUTHORITY_MODEL.md` |
| Authoring or changing `content/*.json` | `docs/CONTENT_SCHEMA.md` |
| Deploying, env vars, launch checklist | `docs/DEPLOYMENT.md` |
| Running or adding tests | `docs/TESTING.md` |
| What shipped in each version | `docs/CHANGELOG.md` |
| Parked ideas, not commitments | `docs/SYSTEMS_THINKING.md` |
| Vision and architectural constitution | `PROJECT.md` |

If two documents disagree, `docs/FRAMEWORK_PRD.md` wins.

## Working authority

Within the authorized GPT copy, make reasonable implementation choices and run normal
checks without requesting routine approval. Preserve unrelated user work. Never delete
files without explicit confirmation; archive uncertain files instead.

## Session discipline

Work one numbered task at a time from `docs/IMPLEMENTATION_PLAN.md`. A numbered task with
passing acceptance checks is the default session boundary.

Before ending a development session:

1. Run the task's checks and record the results.
2. Commit a coherent checkpoint; do not leave a half-applied migration as a handoff.
3. Update `docs/SESSION.md` — current state only, and the exact next task. Move completed
   detail to `docs/CHANGELOG.md`; do not let the same narrative accumulate in both.
4. Update `docs/HANDOFF.md` only when architecture, sequencing, or resume instructions
   changed.
5. Confirm `git status -sb` and record any intentional uncommitted state.

Start a fresh session when a numbered task or phase is complete, before changing to a
different subsystem, or when the current task has accumulated enough investigation that a
new agent would benefit from the written checkpoint. Do not switch sessions in the middle
of a failing build, destructive migration, or uncommitted cross-file change.

## Documentation rules

Docs are load-bearing here and are read by agents with a token budget. Keep them cheap:

1. **One fact, one home.** If it belongs in `CHANGELOG.md`, it does not also belong in
   `SESSION.md` and `HANDOFF.md`. Link instead of restating.
2. **`SESSION.md` is current state, not history.** It should stay under ~120 lines.
3. **Defects go in `docs/DEFECTS.md`** with a permanent number. Code comments cite those
   numbers — never renumber a row.
4. **New long documents need a routing-table row**, or no agent will find them.
