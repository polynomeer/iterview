# 0055. Reframe Weak Nodes As A Diagnostic Graph Workspace

## Status
Accepted

## Date
2026-09-01

## Context

`Weak Nodes` already separated structural remediation from the execution-oriented review queue, but the route still distributed its key information across a generic card stack. That obscured the relationship between the weak answer, its surrounding concepts, and the action that should follow.

The reference at `docs/references/design/weak-notes.png` makes the intended reading order explicit: scan a connected weakness graph, select a node, inspect its diagnosis in a persistent right rail, then start a focused recovery session.

## Decision

The weak-node route is a diagnostic graph workspace.

- A compact left rail provides the current weakness inventory and priority context.
- The central surface combines a graph-first scan area with a selectable tabular node list.
- The right inspector owns the selected node's score, related dimensions, root causes, connected questions, and recommended next action.
- Score-like values that are not supplied by the API remain clearly derived display values from the existing local remediation model; they do not claim persisted assessment data.

## Consequences

Positive:

- The page matches the reference's graph-to-inspector interaction model more closely.
- Users keep their relationship context while choosing a remediation path.
- Filtering and node selection update both the map and diagnosis without changing the queue's execution role.

Trade-offs:

- Several toolbar controls remain presentational until the remediation API exposes domain, trend, and graph data.
- The dense desktop graph collapses to a sequential reading order on mobile to preserve touch targets and avoid horizontal overflow.
