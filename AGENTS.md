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

## Working authority

Within the authorized GPT copy, make reasonable implementation choices and run normal
checks without requesting routine approval. Preserve unrelated user work. Never delete
files without explicit confirmation; archive uncertain files instead.

## Session discipline

Use `docs/IMPLEMENTATION_PLAN.md` as the task sequence and work one numbered task at a
time. A numbered task with passing acceptance checks is the default session boundary.

Before ending a development session:

1. Run the task's checks and record the results.
2. Commit a coherent checkpoint; do not leave a half-applied migration as a handoff.
3. Update `docs/SESSION.md` with what changed, what passed, known risks, and the exact
   next numbered task.
4. Update `docs/HANDOFF.md` whenever architecture, sequencing, or resume instructions
   changed.
5. Confirm `git status -sb` and record any intentional uncommitted state.

Start a fresh Codex task when a numbered task or phase is complete, before changing to a
different subsystem, or when the current task has accumulated enough investigation that
a new agent would benefit from the written checkpoint. Do not switch sessions in the
middle of a failing build, destructive migration, or uncommitted cross-file change.
