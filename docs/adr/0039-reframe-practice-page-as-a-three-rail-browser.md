# 0039. Reframe Practice Page As A Three-Rail Browser

## Status
Accepted

## Date
2026-08-31

## Context

The practice page still looked like a stack of workspace cards rather than the reference browser layout:
- filters, results, and detail inspection were visually blended together
- selecting a question did not feel like working inside a dedicated catalog
- the page lacked the stronger left-center-right hierarchy shown in `docs/references/design/practice.png`

That made the practice flow feel heavier and less directed than the reference.

## Decision

The practice page should behave like a three-rail browser:
- left rail for narrowing the pool
- center rail for scanning and selecting questions
- right rail for the selected question inspector and entry actions

Applied outcomes:
- `PracticePage` now tracks a selected question locally and keeps the right rail pinned to that selection
- `QuestionFilterBar` now renders filter sections as browser-style option lists instead of stacked select inputs
- `QuestionList` and `QuestionListItem` now read as a dense question browser with a top toolbar, selected row state, and lightweight pagination placeholders

## Consequences

Positive:
- the desktop practice screen now matches the sample interaction model more closely
- users can compare candidates and inspect one question without leaving the page
- later redesign passes can reuse the same browser grammar for archive, bookmarks, and review lists

Trade-offs:
- the desktop practice screen now favors a denser scanning workflow over explanatory copy
- some toolbar controls are currently present as UI placeholders until the matching backend or interaction behavior is wired
