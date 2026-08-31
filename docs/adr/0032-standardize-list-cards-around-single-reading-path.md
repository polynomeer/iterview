# 0032. Standardize List Cards Around Single Reading Path

## Status
Accepted

## Date
2026-08-31

## Context

After the workspace shells and core inspector widgets were flattened, many list-based cards still felt inconsistent:
- question history
- recommended questions
- learning materials
- practice list items
- home action cards
- the today card

Most of the inconsistency came from the same pattern:
- breadcrumb-like labels that did not add hierarchy
- status repeated as both chips and supporting cards
- long helper text competing with the primary title
- mixed card depths between home, practice, and question detail

## Decision

List-oriented cards should keep one dominant reading path: label, title, one useful support line, then action.

Rules for this pass:
- remove breadcrumb-like strips from compact cards
- convert secondary descriptive lines into metadata when they do not deserve full paragraph weight
- keep only one compact support rail per card
- make home, practice, and question-detail list cards share the same flatter workspace tone

Applied outcomes:
- `AnswerHistorySection` now frames recent attempts more tersely
- `RecommendedQuestionSection` moves supporting metadata into a compact meta row
- `LearningMaterialsSection` reads as a study shortlist instead of a stacked document shelf
- `QuestionListItem`, `TodayQuestionCard`, and `HomeNextActionCard` now use fewer parallel support blocks

## Consequences

Positive:
- cards scan faster across the product
- visual rhythm is more consistent between home, practice, and detail flows
- the sample-driven workspace aesthetic is preserved deeper into list content

Trade-offs:
- individual cards carry less explanatory copy
- future card expansions should prefer better ordering before adding new sections
