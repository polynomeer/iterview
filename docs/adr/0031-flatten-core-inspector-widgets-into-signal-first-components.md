# 0031. Flatten Core Inspector Widgets Into Signal-First Components

## Status
Accepted

## Date
2026-08-31

## Context

After the larger workspace shells were simplified, several inner widgets still carried the older visual noise:
- `QuestionHeader`
- `ProgressSummaryCard`
- `InterviewQuestionTimeline`
- `InterviewCoveragePanel`

These widgets repeated the same data across:
- summary counts
- support blocks
- explanatory paragraphs
- chips that restated nearby metrics

That made the pages feel busy even when the outer layout had already been cleaned up.

## Decision

Core inspector widgets should become signal-first components with one dominant reading path.

Rules for this pass:
- remove duplicated metric blocks inside hero widgets
- keep explanatory copy to one short decision sentence where needed
- let chips and summary rows act as compact status bars, not secondary content sections
- keep timeline and coverage widgets focused on what to reopen, not on retelling the entire session

Applied outcomes:
- `QuestionHeader` now relies on one summary bar plus contextual chips
- `ProgressSummaryCard` now reads as a compact readiness check
- `InterviewQuestionTimeline` now uses shorter framing and preserves the branch list as the primary content
- `InterviewCoveragePanel` now frames resume mapping as a reopen workflow

## Consequences

Positive:
- page interiors now match the flatter workspace shell more closely
- the most important signals are faster to scan
- visual repetition drops without removing preparation data

Trade-offs:
- widgets provide less onboarding narration on their own
- future widget additions should justify new sections with a concrete decision need
