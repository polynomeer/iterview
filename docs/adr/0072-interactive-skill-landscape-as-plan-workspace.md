# 0072. Make Skills Landscape an Interactive Planning Surface

## Status
Superseded by [0077](0077-replace-skill-landscape-with-skill-map.md)

## Date
2026-09-02

## Context
The skills page had already been reframed as a landscape + inspector workspace, but interaction density was still low compared with the reference workspace-style mocks. The route needed explicit controls to narrow focus, scan candidate weak branches, and move between concise detail views without leaving the workspace shell.

## Decision
Make the skills route a single interactive planning surface by adding:

- graph view mode controls (맵/DFS/전체)
- node filtering controls for weak-only focus
- zoom controls (in, out, fit) tied to the central landscape rendering
- a single inspector rail with tabbed detail content (Overview, Resume links, Related questions)
- visual connector lines between visible nodes and stronger focus highlighting on selection

All new behaviors are implemented with existing API contracts (radar/gap/progress/resume data) and localized copy behavior (Korean default, English toggle preserved).

## Consequences
- Users can keep the right inspector context stable while iterating between skill selection, graph focus, and follow-up recommendations.
- The page more closely matches the workspace references' interaction density without widening the data model.
- New state interactions now increase future extension risk (e.g., if graph data shape changes), but they remain isolated to the skills workspace component and CSS and can be iterated independently.
