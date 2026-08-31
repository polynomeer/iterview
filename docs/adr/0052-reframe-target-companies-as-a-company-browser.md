# ADR 0052: Reframe Target Companies As A Company Browser

## Status
Accepted

## Context
- The target companies route already had useful company-preparation data, but it still read like a generic card board instead of the dense browser-plus-inspector workspace shown in `docs/references/design/target-companies.png`.
- In this product, company tracking is not a passive bookmark list. It is the surface where the user decides which company-specific interview pressure to prepare for next and which DFS branches need evidence repair first.
- The redesign program is standardizing productivity routes around a compact top toolbar, a dense primary list, a right detail inspector, and a bottom summary band.

## Decision
- Reframe the target companies route into a company browser with:
  - a stronger top browser shell for breadcrumb context, view mode switching, and search/status filters
  - a dense list-row presentation for company lanes, focus topics, frequent question themes, and readiness rings
  - a right inspector for fit, readiness by topic, recommended next actions, and recent activity
  - a compact summary strip that aggregates target count, priority concentration, readiness, and improvement topics
- Preserve the existing mock company-preparation data shape and routing links, and derive sample-aligned browser chrome from the current model.
- Keep job-posting intake as a separate mode and route so external signal collection does not visually compete with active company preparation.

## Consequences
- The route now behaves more like a real company-preparation workspace and aligns closely with the target sample.
- Existing links into resume analysis, notes, interview, practice, and job posting intake remain intact, so the redesign does not require API work.
- Future work can add real saved company metadata, tab interactions, and source-linked notes inside the new browser structure without another large rewrite.
