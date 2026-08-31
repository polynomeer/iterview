# ADR 0050: Reframe Skills As A Skill Landscape Workspace

## Status
Accepted

## Context
- The skills route had the right backend signals, but it still rendered as a stacked analytics page instead of the workspace pattern shown in `docs/references/design/skills.png`.
- This product uses skill signals only as a means to choose the next resume-backed DFS interview branch, so the route must stay tightly connected to follow-up questions, evidence review, and next practice actions.
- The redesign program is standardizing core routes around a single-screen browser model with a strong central canvas, a compact inspector, and a bottom summary band.

## Decision
- Reframe the skills route into a skill-landscape workspace with:
  - a dense top header for view tabs and filter context
  - a central node-style landscape board that turns current category scores into a scannable capability map
  - a right inspector rail for mastery state, resume linkage, and next follow-up questions
  - a bottom four-card summary row for strengths, weak areas, recent practice, and recommended next actions
- Preserve the current radar, gap, and progress contracts, and derive sample-aligned UI chrome from those existing signals rather than expanding the API first.
- Treat the page as a planning surface for the next DFS practice run, not as a standalone reporting dashboard.

## Consequences
- The skills route now reads like an interview preparation workspace rather than a passive chart page.
- The design is much closer to the reference sample while staying compatible with the current domain model and routing structure.
- If future work adds interactive skill selection, richer experience linking, or real question recommendation endpoints, those behaviors can be added into the new canvas-and-inspector structure without another large layout rewrite.
