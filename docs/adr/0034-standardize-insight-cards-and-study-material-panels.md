# 0034. Standardize Insight Cards and Study Material Panels

## Status
Accepted

## Date
2026-08-31

## Context

Even after the previous cleanup pass, two patterns still felt visually detached from the workspace system:
- `InsightCard` remained a more decorative card family than the surrounding operator panels
- `LearningMaterialsSection` still behaved like a long form embedded inside a compact question workspace

Because these components appear across result, skill, resume, and question flows, inconsistency here spreads quickly through the product.

## Decision

Shared support components should inherit the same compact workspace reading path as list cards and operator panels.

Rules for this pass:
- `InsightCard` keeps its API but renders as a flatter meta-title-body-action stack
- status labels stay visually distinct from value chips
- study-material forms use the same compact header, grouped fields, and local error feedback as reference-answer forms
- study-material cards reduce prose weight and keep actions visually anchored

Applied outcomes:
- `InsightCard` now aligns with the shared workspace card family without forcing call-site rewrites
- `LearningMaterialsSection` now matches the reference-answer operator panel pattern
- result, skill, resume, and question support surfaces move closer to one visual system

## Consequences

Positive:
- shared support UI now scans more consistently across product areas
- future redesign passes can tune one card family instead of multiple divergent variants
- secondary forms no longer compete with the main answer workspace

Trade-offs:
- `InsightCard` is now less visually distinct as a standalone showcase component
- any future premium/highlight treatment should be introduced intentionally rather than by default card depth
