# 0038. Align Resume Support Panels With Workspace Actions

## Status
Accepted

## Date
2026-08-31

## Context

The resume page still had several support surfaces that behaved like standalone mini-tools:
- resume library cards mixed selection, counts, and upload actions without a stable hierarchy
- the create-resume form read like a modal form detached from the workspace tone
- competency, achievement, and contact sections used inconsistent card grammars

That left the lower-priority resume panels visually noisier than the primary workspace sections.

## Decision

Resume support panels should share the same action rhythm as the rest of the workspace:
- lead with one title and one short context sentence
- expose summary metadata in compact rows before long content
- isolate the active action in one clear toolbar or action slot
- reuse `list-item-card` semantics for support evidence instead of nested muted cards

Applied outcomes:
- `ResumeCard` now separates title, summary metrics, and upload action into distinct layers
- `ResumeCreateForm` now behaves like a compact workspace composer with inline guidance and feedback
- `ResumeCompetenciesCard`, `ResumeAchievementsCard`, and `ResumeContactsCard` now use the same evidence-card structure and action alignment

## Consequences

Positive:
- the resume workspace now has fewer competing visual patterns
- support actions are easier to find because they live in predictable positions
- later polish work can tune one shared card language instead of several special cases

Trade-offs:
- support panels carry less explanatory copy inside each item
- some first-time users may rely more on section titles and action labels than before
