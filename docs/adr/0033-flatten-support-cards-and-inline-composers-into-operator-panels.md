# 0033. Flatten Support Cards and Inline Composers Into Operator Panels

## Status
Accepted

## Date
2026-08-31

## Context

After the workspace shells, inspector surfaces, and list cards were simplified, the remaining support surfaces still broke the visual rhythm:
- reference-answer forms still looked like standalone mini-pages
- home support sections kept explanatory paragraphs that repeated the heading
- resume risk cards used a different component family than retry and material cards

These surfaces are secondary to the main answer workflow, so they should behave more like operator panels than content showcases.

## Decision

Support panels should be flatter and more task-directed than primary workspace cards.

Rules for this pass:
- inline composers use one compact header, one field grid, one obvious submit path
- submission errors stay inside the panel and are announced clearly near the action
- home support cards keep title, compact metadata, one short support line, then action
- resume risks, retry items, and learning materials share the same compact card family

Applied outcomes:
- `ReferenceAnswersSection` now frames note capture as a compact operator panel
- `ResumeRiskPreviewList` moved off `InsightCard` into the shared list-card system
- `LearningMaterialList` and `RetryQuestionList` now remove repeated explanatory copy and keep denser card bodies

## Consequences

Positive:
- secondary workflows now look like part of the same workspace system
- users can scan support information without competing copy blocks
- inline note capture feels closer to an editing tool than a separate content section

Trade-offs:
- support cards now rely more on metadata and less on explanatory prose
- future support widgets should expand only when they introduce a genuinely new decision surface
