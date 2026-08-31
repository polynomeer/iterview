# ADR 0054: Reframe Resume Analysis As An Experience Explorer

## Status
Accepted

## Context
- The resume analysis route still read like a stack of status cards, while the redesign reference in `docs/references/design/experience.png` expects a denser workspace with a career timeline, a central project graph, a right-side inspector, and bottom insight panels.
- In this product, resume analysis is not just passive review. It is the preparation surface for DFS-style interview follow-up, where one experience branch should expand into projects, evidence, risks, and likely questions without leaving the page.
- The existing analysis response already provides skills, experience blocks, and risks, but the page needed snapshot data to show company, role, period, related project, and technology context in a way that resembles the reference workspace.

## Decision
- Reframe the resume analysis route into an experience explorer workspace with:
  - a left rail for active resume context and compact career metrics
  - a central explorer canvas that organizes experiences into a timeline-to-project flow
  - a right inspector that pins one selected experience and exposes its summary, responsibilities, technologies, and generated practice prompts
  - a lower insight band for skill density, pressure distribution, and career volume summaries
- Combine active analysis data with active resume snapshot data on this route so the workspace can show both interview pressure signals and concrete source-of-truth structure.
- Prefer UI completion over backend expansion for missing sample behaviors. Non-functional controls such as tabs, filter, sort, and fit-view can exist as presentational affordances until deeper interaction scope is implemented.

## Consequences
- The route now aligns more closely with the reference image and reads like a dedicated career exploration workspace instead of a generic analysis dashboard.
- The page depends on both analysis and snapshot queries, which slightly increases route complexity but produces a materially stronger source-of-truth surface for interview preparation.
- Future work can replace the presentational controls with real filtering, graph navigation, and question-tree linking without changing the core layout model again.
