# Architecture Decision Records

This directory tracks durable product, architecture, design-system, and repository-level decisions for `iterview`.

Use ADRs when a change answers one or more of these questions:
- why the product is shaped a certain way
- why a shared UX pattern exists across pages
- why a repository-wide engineering rule was introduced
- why a major flow, shell, or information architecture choice was made

## ADR Rules

1. Add a new ADR when a shared decision changes product behavior, architecture, design direction, or delivery policy.
2. Write the ADR in the same work unit as the code or document change that introduced the decision.
3. Do not rewrite old ADRs to hide history. Add a new ADR that supersedes an older one when direction changes.
4. Keep app-local implementation notes in the owning app docs. Use root ADRs only for shared decisions.

## ADR Format

Each ADR should include:
- `Status`
- `Date`
- `Context`
- `Decision`
- `Consequences`

## Index

1. [`0001-product-focus-resume-dfs-source-of-truth.md`](0001-product-focus-resume-dfs-source-of-truth.md)
   Defines the core product model: resume-grounded source of truth plus DFS interview traversal.
2. [`0002-monorepo-shared-boundaries.md`](0002-monorepo-shared-boundaries.md)
   Fixes the monorepo rule that shared policy stays at the root while app detail stays with the owning app.
3. [`0003-reference-driven-redesign-program.md`](0003-reference-driven-redesign-program.md)
   Establishes the redesign process around reference documents and captured design assets.
4. [`0004-workspace-first-shell-and-navigation.md`](0004-workspace-first-shell-and-navigation.md)
   Moves the frontend toward a workspace-first shell instead of isolated page-by-page navigation.
5. [`0005-page-workspaces-over-generic-lists.md`](0005-page-workspaces-over-generic-lists.md)
   Chooses guided workspaces over plain list/detail screens for core preparation flows.
6. [`0006-unified-visual-system-for-redesign.md`](0006-unified-visual-system-for-redesign.md)
   Standardizes the redesign around a minimal dark workspace surface system with shared card and typography rules.
7. [`0007-guest-simplification-and-ongoing-adr-policy.md`](0007-guest-simplification-and-ongoing-adr-policy.md)
   Simplifies the guest experience and formalizes ongoing ADR creation as a repository rule.
8. [`0008-separate-target-company-tracking-from-job-posting-intake.md`](0008-separate-target-company-tracking-from-job-posting-intake.md)
   Separates company preparation tracking from resume-tailor job posting ingestion.
9. [`0009-separate-scheduled-review-planning-from-active-review-queue.md`](0009-separate-scheduled-review-planning-from-active-review-queue.md)
   Separates spaced-repetition planning from the active retry execution queue.
10. [`0010-separate-account-identity-from-practice-settings.md`](0010-separate-account-identity-from-practice-settings.md)
   Separates account identity management from operational practice settings.
11. [`0011-separate-weak-node-remediation-from-queue-execution.md`](0011-separate-weak-node-remediation-from-queue-execution.md)
   Separates graph-first weak-node remediation from queue-based retry execution.
12. [`0012-adopt-global-command-palette-for-workspace-navigation.md`](0012-adopt-global-command-palette-for-workspace-navigation.md)
   Adds one keyboard-first, route-independent search and command overlay across the workspace shell.
13. [`0013-consolidate-workspace-surface-tokens-for-secondary-workspaces.md`](0013-consolidate-workspace-surface-tokens-for-secondary-workspaces.md)
   Consolidates repeated workspace-surface structure through shared spacing, radius, and card tokens.
14. [`0014-add-workspace-continuity-rails-to-core-journeys.md`](0014-add-workspace-continuity-rails-to-core-journeys.md)
   Adds continuity rails that connect upstream source-of-truth work, the current step, and the next recovery path.
15. [`0015-simplify-workspace-visual-hierarchy.md`](0015-simplify-workspace-visual-hierarchy.md)
   Simplifies the redesign language so primary work surfaces read more cleanly and consistently.
16. [`0016-default-ui-language-korean-with-manual-english-toggle.md`](0016-default-ui-language-korean-with-manual-english-toggle.md)
   Makes Korean the default interface language while preserving an explicit English switch.
17. [`0017-align-core-workspaces-to-reference-desktop-shell.md`](0017-align-core-workspaces-to-reference-desktop-shell.md)
   Requires core authenticated screens to follow the captured desktop reference shell structurally, not only stylistically.
18. [`0018-standardize-desktop-three-rail-workspaces-for-inspector-flows.md`](0018-standardize-desktop-three-rail-workspaces-for-inspector-flows.md)
   Standardizes left-rail, center-canvas, right-rail desktop composition for inspector and queue flows.
19. [`0019-align-secondary-workspaces-to-shared-analysis-shell.md`](0019-align-secondary-workspaces-to-shared-analysis-shell.md)
   Extends the shared desktop analysis shell to remediation, planning, session, and result workspaces.
20. [`0020-tighten-workspace-density-and-card-rhythm.md`](0020-tighten-workspace-density-and-card-rhythm.md)
   Tightens shared card padding, text widths, chip sizing, and internal spacing to better match the desktop references.
