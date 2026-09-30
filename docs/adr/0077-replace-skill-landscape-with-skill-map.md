# 0077. Replace the Interactive Skill Landscape with a Skill Map

## Status
Accepted. Supersedes 0072.

## Date
2026-09-30

## Context
ADR 0072 made `/skills` an interactive planning surface with graph view modes (맵/DFS/전체), zoom controls, connector lines, and a tabbed inspector. The 2026-09 audit (`docs/09-ux-audit-and-redesign-proposal.md`) found that surface hard to read and partly synthetic. Skill data exists only per category (CS, BACKEND, …), so the graph mostly re-drew six numbers. ADR 0074 moved skills under the 질문 area and scheduled a rebuild for Phase 3.

## Decision
- `/questions/skills` ("스킬 맵") becomes a readiness list built from the progress and radar APIs, merged by category code.
- Each area shows its score against its benchmark (a target marker plus a "목표까지 N" / "목표 달성" badge) and its answered and weak-answer counts. Areas sort weakest-first, with name order as an alternative.
- An area links to `/questions?category=…` when a question category of the same name exists. Otherwise it shows no link rather than a guessed one.
- The graph view modes, zoom controls, and inspector tabs from 0072 are removed.

## Consequences
- The skill map reads in one glance and uses the same primitives as the rest of the 질문 area.
- The skill-to-question link relies on matching category names. A dedicated mapping in the skills API would make it exact. Until then, some areas have no link.
- If per-skill graph data (topics within a category) becomes available, a graph view can return as a 질문 workspace view. It would need a new ADR.
