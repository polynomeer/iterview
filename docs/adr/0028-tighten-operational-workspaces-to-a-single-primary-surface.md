# 0028. Tighten Operational Workspaces To A Single Primary Surface

## Status
Accepted

## Date
2026-08-31

## Context

After the workspace shell was simplified, several operational pages still felt more verbose than the reference set:
- `Practice`
- `Archive`
- `Scheduled Reviews`
- `Weak Nodes`

The mismatch was not missing functionality.
It was that the pages still repeated the same idea across:
- workspace hero copy
- chip rows
- support cards
- section headings

The reference screens instead keep one primary surface in front and let the surrounding rails stay compact.

## Decision

Operational workspace pages should prefer one primary surface plus compact support rails.

Rules for this pass:
- remove breadcrumbs or chip rows when they only restate the current page
- shorten hero and support copy so it frames action instead of explaining the same concept twice
- keep stats only when they change the decision being made
- let selected-item or right-rail detail carry the deeper context

Applied outcomes:
- `Practice` now emphasizes one branch choice, one focused question, and one retry handoff
- `Archive` now reads as a compact answer shelf instead of a descriptive library page
- `Scheduled Reviews` now emphasizes current load and clearable blocks
- `Weak Nodes` now frames the graph as relationship repair instead of a general backlog view

## Consequences

Positive:
- the remaining operational pages now read closer to the reference workstation model
- primary actions are easier to scan
- visual clutter drops without reducing core functionality

Trade-offs:
- descriptive onboarding copy is reduced
- future additions should justify themselves as decision support, not page narration
