# 06-acceptance-criteria

Shared acceptance baseline lives in:
- `../../../docs/03-acceptance-baseline.md`

This document adds frontend-specific detail.

## Route Acceptance

- the route structure remains coherent
- protected routes gate authenticated flows correctly
- public routes remain explorable to first-time visitors
- deep-link routes such as result pages, analysis pages, and review pages remain navigable

## Core Learning Loop Acceptance

- users can move from question discovery to answer writing
- answer submission moves into result analysis predictably
- review queue remains understandable as retry work
- archive remains understandable as mastered-question history
- home continues to orient the user toward a next action

## Resume Surface Acceptance

- resume versions can be listed and activated
- upload and parsing states are understandable
- extraction and analysis data can render progressively
- editor, heatmap, and tailoring routes remain connected to resume-version context

## Interview Acceptance

- interview start flow clearly communicates selected resume context
- session detail can render snapshot-based content without assuming live catalog lookups
- result views can render coverage and resume-map data when present
- interview history remains distinct from archive in the UI

## Practical Interview Replay Acceptance

- upload and processing states are explicit
- transcript review does not collapse all transcript layers into one ambiguous blob
- question review and replay launch flows remain understandable
- replay-oriented assets can coexist with the rest of the learning loop without breaking navigation

## Quality Acceptance

- shared UI primitives are reused where appropriate
- loading, empty, error, and auth-required states are handled on major routes
- mixed-language screens remain understandable
- additive backend fields do not break established pages

