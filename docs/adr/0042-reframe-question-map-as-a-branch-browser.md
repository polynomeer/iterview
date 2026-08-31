# 0042. Reframe Question Map As A Branch Browser

## Status
Accepted

## Date
2026-09-01

## Context

The question map route still read like a document page with a tree list attached:
- the central map area did not feel like a dedicated browsing canvas
- node inspection was visually too close to the tree list instead of behaving like a right-side detail rail
- the route did not reflect the stronger browser grammar shown in `docs/references/design/question-map.png` and `docs/references/design/question-map-detail.png`

That made branch exploration feel flatter than the sample and weakened the "choose a node, inspect it, then continue DFS" workflow.

## Decision

The question map route should behave like a branch browser:
- a top toolbar for view mode and viewport controls
- a central map canvas for scanning and selecting nodes
- a right inspector rail for the selected node, its branch meaning, and the next DFS actions

Applied outcomes:
- `QuestionTreeView` now renders a sample-like map toolbar, ancestry strip, denser node canvas, and selected-node inspector
- `QuestionTreePage` now frames the route as a DFS map workspace instead of a generic tree document
- question-map-specific CSS now pins the inspector rail and aligns the page to the sample workspace tone

## Consequences

Positive:
- the route now matches the sample interaction model more closely
- users can inspect one node and decide whether to answer, reroot, or go deeper without losing map context
- later redesign passes can reuse this browser grammar for weak-notes and bookmarks-style graph views

Trade-offs:
- some inspector metrics such as mastery score and last attempt are currently derived display values because the tree API does not expose all sample fields
- toolbar controls are present as UI structure first, with deeper map behaviors to be wired in a later pass
