# 0021. Strengthen Reference Matching With Sticky Inspector Rails

## Status
Accepted

## Date
2026-08-31

## Context

The redesign had already adopted a dark desktop shell and denser card rhythm, but key workspace screens still diverged from the design references in one important way:
- `Practice` did not provide a persistent right-side inspection surface for the currently highlighted question
- `Resume` still emphasized stacked overview blocks before the main version library, which weakened the reference-like document-plus-inspector balance
- side rails existed in several places, but they did not yet behave as a shared desktop product pattern

The remaining mismatch was no longer only visual styling. It was also about desktop information architecture and where decision-making context lives while the user works.

## Decision

Desktop preparation workspaces should strengthen a shared three-zone structure when the flow benefits from ongoing inspection:
- left rail for filtering or control
- center column for the primary working list or document
- right rail for sticky detail, guidance, and launch actions

For the current redesign pass:
- `Practice` should expose a persistent highlighted-question inspector in the right rail
- `Resume` should prioritize the resume library and selected document content in the main column, with overview and workflow context in a sticky right rail
- these rails should remain compact and visually aligned with the reference screenshots rather than behaving like generic sidebars

## Consequences

Positive:
- the desktop UI moves closer to the reference images in both structure and feel
- users keep critical context visible while choosing a question or validating a resume version
- future inspector-style flows have a clearer shared pattern to follow

Trade-offs:
- desktop layouts become more opinionated and less symmetric
- sticky rails require tighter content discipline to avoid overcrowding
