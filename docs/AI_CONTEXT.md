# AI Context

Read before making recommendations or writing code.

## What to read

**See the routing table in `AGENTS.md`** — it is the single maintained index. Open the row
that matches your task rather than reading the documentation set through.

`docs/FRAMEWORK_PRD.md` is the source of truth; if anything disagrees with it, it wins.
`docs/SYSTEMS_THINKING.md` is a parking lot and is **non-binding** — nothing in it
influences architecture until promoted into the PRD as a numbered decision.

## Working principles

- Content is an API. Every visible string comes from `content/`.
- Pages orchestrate. Components render.
- Components receive props. Components never import content directly.
- Prefer reusable architecture over quick solutions.
- Never introduce business-specific code into `src/`.
- Favor maintainability over shortcuts.
- Question assumptions. Think long-term.
- Recommend architectural improvements when they increase maintainability or
  scalability without adding unnecessary complexity.

## The invariant

Launching a new site must require zero changes under `src/`.

Test every proposed change against it. If shipping a plumbing site in Turlock would
require editing a React component, the design is wrong.
