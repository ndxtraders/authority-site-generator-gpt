# AI Guidelines

Hard rules. Violating one of these is a bug, not a style preference.

## Never

- Never hardcode content. No copy, headlines, labels, or button text in `src/`.
- Never hardcode colors. Use semantic tokens (`bg-primary`, `text-foreground`),
  never literals (`bg-blue-600`, `text-slate-900`).
- Never hardcode city names, business names, phone numbers, or domains in `src/`.
- Never import JSON inside a reusable component. Pages load content; components take props.
- Never duplicate Tailwind class strings. If a layout repeats, extract a component.
- Never create business-specific or trade-specific React components.
- Never repeat layouts. Use `Container`, `Section`, `SectionHeading`.

## Always

- Components receive props.
- Pages orchestrate; components render.
- Content is the API.
- Strong TypeScript types. No `any` in the content model.
- Small components over large ones.
- Readable code over clever code.
- Run `npx next build` before declaring anything done.

## The reuse test

Every component must pass:

> "Could this component be reused unchanged for a plumber?"

If not, redesign it.

## Guardrails

- Never delete a file without asking. Move to `Archive/` if unsure.
- Never push to `main` without explicit permission.
- Smallest diff that accomplishes the goal. Don't refactor neighboring code.
- If a task reveals the plan is wrong, stop and say so. Don't improvise around it.
