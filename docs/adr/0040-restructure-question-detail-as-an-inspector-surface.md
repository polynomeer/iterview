# 0040. Restructure Question Detail As An Inspector Surface

## Status
Accepted

## Date
2026-08-31

## Context

The question detail screen still behaved like a document page with stacked support sections:
- the route context, full prompt, answer snapshot, and quick actions were visually separated too weakly
- the desktop layout did not resemble the three-column inspector structure in `docs/references/design/question-inspector.png`
- important decisions such as "answer now", "study first", or "open the tree" were not concentrated in one inspection flow

That made the page feel like an information dump instead of a pre-answer decision surface.

## Decision

The desktop question detail page should work as an inspector surface:
- left rail for question path context and branch position
- center rail for the prompt, current node read, and best-answer snapshot
- right rail for mastery summary, related notes/evidence, and quick actions

Applied outcomes:
- `QuestionDetailLayouts` now places metadata on the left rail and keeps the main reading sequence in the center
- `QuestionDetailPage` now derives sample-like context cards, prompt blocks, answer snapshot cards, and quick-action rails directly from existing question data
- related notes and resume evidence now appear as compact inspector groups before the deeper study sections below

## Consequences

Positive:
- the question detail screen now matches the sample interaction model more closely
- users can decide whether to answer, review, or branch deeper without scanning every support section first
- later redesign passes can reuse this inspector grammar for interview result and session detail pages

Trade-offs:
- some sample-like blocks currently use derived placeholders from existing data rather than dedicated backend fields
- the mobile layout still prioritizes vertical readability over fully mirroring the desktop inspector composition
