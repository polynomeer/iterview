# 0029. Simplify Inspector And Execution Surfaces Around Primary Decisions

## Status
Accepted

## Date
2026-08-31

## Context

The workspace theme aligned the product to the darker reference shell, but several core pages still felt visually busy:
- `Question Detail`
- `Question Tree`
- `Answer Editor`
- `Interview Session`

The issue was not missing styling.
The issue was duplicated explanation across:
- hero copy
- note cards
- breadcrumbs
- side inspectors that repeated the same instruction as the main surface

The reference images stay cleaner.
They let one primary decision dominate each page and keep nearby context compact.

## Decision

Inspector and execution pages should remove duplicated narration and keep one dominant working surface.

Rules for this pass:
- remove breadcrumb-style copy when it only restates the current stage
- drop auxiliary note cards that repeat guidance already present in the main surface
- keep side rails focused on evidence, progress, or metadata that can change the immediate decision
- shorten page titles and hero copy so each screen communicates one main action

Applied outcomes:
- `Question Detail` now relies on the node summary, history, metadata, and materials instead of extra explanatory rails
- `Question Tree` now presents the DFS map and root brief with shorter framing copy
- `Answer Editor` now emphasizes one durable answer draft with lighter submission guidance
- `Interview Session` now keeps the active branch and answer surface primary while removing a redundant action inspector

## Consequences

Positive:
- the four core preparation surfaces read closer to the reference workstation style
- users can identify the main action faster
- layout density is reduced without removing core interview-prep capabilities

Trade-offs:
- some onboarding explanation is now implicit in the layout
- future additions should justify themselves as decision support, not descriptive chrome
