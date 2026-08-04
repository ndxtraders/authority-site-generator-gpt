# AI Context

Read before making recommendations or writing code.

## Reading order

1. `docs/FRAMEWORK_PRD.md` — what we're building. Source of truth.
2. `docs/AUTHORITY_MODEL.md` — why. The strategy behind the architecture.
3. `docs/IMPLEMENTATION_PLAN.md` — the current build plan and what phase we're in.
4. `AGENTS.md` — this is Next.js 16, not the Next.js in your training data.

`docs/SYSTEMS_THINKING.md` is a parking lot. It is **non-binding** — nothing in it
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
