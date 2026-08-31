# 0035. Simplify Selection-Heavy Workspaces Around One Pinned Item

## Status
Accepted

## Date
2026-08-31

## Context

Question tree and interview coverage screens both rely on the same interaction model:
- choose one item from a dense left-side collection
- inspect a focused detail view on the right
- decide the next recovery or traversal action

These screens still carried too many duplicated summaries, helper paragraphs, and repeated metadata rows. That made the selection model feel heavier than the underlying task.

## Decision

Selection-heavy workspaces should center one pinned item and keep surrounding context subordinate.

Rules for this pass:
- remove introductory helper copy when the surrounding structure already explains the screen
- reduce duplicated meta rows on selectable cards
- keep selection state visible, but compress it into the same metadata lane
- reserve the right-side panel for the currently pinned item and its next action path

Applied outcomes:
- `QuestionTreeView` now renders tree nodes as flatter selectable cards with one compact metadata rhythm
- `InterviewCoveragePanel` drops repeated explanatory blocks and compresses evidence metadata
- `InterviewFullCoverageResultView` trims summary prose and keeps pinned evidence as the primary recovery context

## Consequences

Positive:
- users can move faster from scan to selection to action
- dense screens inherit the same workspace reading pattern as simpler views
- the interface better matches the DFS-style traversal and recovery workflow

Trade-offs:
- first-time users get less explanatory copy inline
- future expansions should prefer clearer selection affordances over adding new helper paragraphs
