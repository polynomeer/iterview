# ADR 0045: Reframe Question Detail As A Question Inspector Workspace

## Status
Accepted

## Context
- The question detail page already had rich data, but it still read as a stacked detail page rather than the sample-aligned inspector workspace in `docs/references/design/question-inspector.png`.
- Users preparing for DFS-style interview traversal need to see three things at once:
  - where the current question sits in the branch
  - what the question is actually asking and which concepts it expects
  - whether to answer now, review later, or gather stronger source-of-truth evidence first
- The redesign work across the workspace theme is converging on a consistent `support rail + primary canvas + execution inspector` model.

## Decision
- Reframe the desktop question detail route into a question inspector workspace with:
  - a left rail for branch path context and metadata
  - a central question canvas for prompt reading, answer snapshot, and likely DFS follow-up branches
  - a right execution rail for mastery, recent attempts, supporting notes, resume evidence, and immediate actions
- Preserve the existing data flow and route structure, and improve the page through compositional changes and workspace-theme overrides rather than by introducing a separate page-local styling system.
- Reorder the main desktop stack so the likely DFS child branches appear before the full answer history, matching the decision flow implied by the sample.

## Consequences
- The page now behaves more like an interview decision console than a passive detail sheet.
- Existing API integrations remain intact, so future work can deepen the inspector with real scoring or richer note linkage without another layout rewrite.
- The desktop experience is now more consistent with the redesigned home, question map, review queue, and scheduled reviews pages.
