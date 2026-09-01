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
21. [`0021-strengthen-reference-matching-with-sticky-inspector-rails.md`](0021-strengthen-reference-matching-with-sticky-inspector-rails.md)
   Strengthens reference alignment through persistent inspector rails.
22. [`0022-prioritize-daily-focus-context-on-home-dashboard.md`](0022-prioritize-daily-focus-context-on-home-dashboard.md)
   Prioritizes the daily focus context on the home dashboard.
23. [`0023-standardize-execution-workspaces-around-central-canvas.md`](0023-standardize-execution-workspaces-around-central-canvas.md)
   Standardizes execution workspaces around a central canvas.
24. [`0024-structure-result-surfaces-around-recovery-decisions.md`](0024-structure-result-surfaces-around-recovery-decisions.md)
   Structures result surfaces around actionable recovery decisions.
25. [`0025-standardize-operational-recovery-screens-around-a-shared-workstation.md`](0025-standardize-operational-recovery-screens-around-a-shared-workstation.md)
   Standardizes operational recovery screens around a shared workstation.
26. [`0026-separate-reference-palette-into-a-workspace-theme.md`](0026-separate-reference-palette-into-a-workspace-theme.md)
   Separates the reference palette into a dedicated workspace theme.
27. [`0027-simplify-workspace-surfaces-around-primary-signals.md`](0027-simplify-workspace-surfaces-around-primary-signals.md)
   Simplifies workspace surfaces around primary signals.
28. [`0028-tighten-operational-workspaces-to-a-single-primary-surface.md`](0028-tighten-operational-workspaces-to-a-single-primary-surface.md)
   Tightens operational workspaces to one primary surface.
29. [`0029-simplify-inspector-and-execution-surfaces-around-primary-decisions.md`](0029-simplify-inspector-and-execution-surfaces-around-primary-decisions.md)
   Simplifies inspector and execution surfaces around primary decisions.
30. [`0030-structure-result-surfaces-around-recovery-mapping.md`](0030-structure-result-surfaces-around-recovery-mapping.md)
   Structures result surfaces around recovery mapping.
31. [`0031-flatten-core-inspector-widgets-into-signal-first-components.md`](0031-flatten-core-inspector-widgets-into-signal-first-components.md)
   Flattens core inspector widgets into signal-first components.
32. [`0032-standardize-list-cards-around-single-reading-path.md`](0032-standardize-list-cards-around-single-reading-path.md)
   Standardizes list cards around a single reading path.
33. [`0033-flatten-support-cards-and-inline-composers-into-operator-panels.md`](0033-flatten-support-cards-and-inline-composers-into-operator-panels.md)
   Flattens support cards and inline composers into operator panels.
34. [`0034-standardize-insight-cards-and-study-material-panels.md`](0034-standardize-insight-cards-and-study-material-panels.md)
   Standardizes insight cards and study material panels.
35. [`0035-simplify-selection-heavy-workspaces-around-one-pinned-item.md`](0035-simplify-selection-heavy-workspaces-around-one-pinned-item.md)
   Simplifies selection-heavy workspaces around one pinned item.
36. [`0036-streamline-result-guidance-and-resume-evidence-cards.md`](0036-streamline-result-guidance-and-resume-evidence-cards.md)
   Streamlines result guidance and resume evidence cards.
37. [`0037-convert-resume-detail-cards-into-workspace-evidence-panels.md`](0037-convert-resume-detail-cards-into-workspace-evidence-panels.md)
   Converts resume detail cards into workspace evidence panels.
38. [`0038-align-resume-support-panels-with-workspace-actions.md`](0038-align-resume-support-panels-with-workspace-actions.md)
   Aligns resume support panels with workspace actions.
39. [`0039-reframe-practice-page-as-a-three-rail-browser.md`](0039-reframe-practice-page-as-a-three-rail-browser.md)
   Reframes practice as a three-rail browser.
40. [`0040-restructure-question-detail-as-an-inspector-surface.md`](0040-restructure-question-detail-as-an-inspector-surface.md)
   Restructures question detail as an inspector surface.
41. [`0041-redesign-home-as-a-sample-aligned-workspace-dashboard.md`](0041-redesign-home-as-a-sample-aligned-workspace-dashboard.md)
   Redesigns home as a sample-aligned workspace dashboard.
42. [`0042-reframe-question-map-as-a-branch-browser.md`](0042-reframe-question-map-as-a-branch-browser.md)
   Reframes the question map as a branch browser.
43. [`0043-reframe-review-queue-as-a-recovery-browser.md`](0043-reframe-review-queue-as-a-recovery-browser.md)
   Reframes the review queue as a recovery browser.
44. [`0044-reframe-scheduled-reviews-as-a-calendar-browser.md`](0044-reframe-scheduled-reviews-as-a-calendar-browser.md)
   Reframes scheduled reviews as a calendar browser.
45. [`0045-reframe-question-detail-as-a-question-inspector-workspace.md`](0045-reframe-question-detail-as-a-question-inspector-workspace.md)
   Reframes question detail as a question inspector workspace.
46. [`0046-reframe-practice-as-a-question-browser-workspace.md`](0046-reframe-practice-as-a-question-browser-workspace.md)
   Reframes practice as a question browser workspace.
47. [`0047-reframe-notes-as-a-knowledge-browser-workspace.md`](0047-reframe-notes-as-a-knowledge-browser-workspace.md)
   Reframes notes as a knowledge browser workspace.
48. [`0048-reframe-archive-as-a-record-browser-workspace.md`](0048-reframe-archive-as-a-record-browser-workspace.md)
   Reframes archive as a record browser workspace.
49. [`0049-reframe-bookmarks-as-a-saved-context-browser.md`](0049-reframe-bookmarks-as-a-saved-context-browser.md)
   Reframes bookmarks as a saved-context browser.
50. [`0050-reframe-skills-as-a-skill-landscape-workspace.md`](0050-reframe-skills-as-a-skill-landscape-workspace.md)
   Reframes skills as a skill landscape workspace.
51. [`0051-reframe-profile-as-a-career-context-workspace.md`](0051-reframe-profile-as-a-career-context-workspace.md)
   Reframes profile as a career context workspace.
52. [`0052-reframe-target-companies-as-a-company-browser.md`](0052-reframe-target-companies-as-a-company-browser.md)
   Reframes target companies as a company browser.
53. [`0053-reframe-settings-as-a-preferences-browser.md`](0053-reframe-settings-as-a-preferences-browser.md)
   Reframes settings as a preferences browser.
54. [`0054-reframe-resume-analysis-as-an-experience-explorer.md`](0054-reframe-resume-analysis-as-an-experience-explorer.md)
   Reframes resume analysis as an experience explorer.
55. [`0055-reframe-weak-nodes-as-a-diagnostic-graph-workspace.md`](0055-reframe-weak-nodes-as-a-diagnostic-graph-workspace.md)
   Reframes weak nodes as a diagnostic graph workspace.
56. [`0056-reframe-result-analysis-as-a-scoreboard-workspace.md`](0056-reframe-result-analysis-as-a-scoreboard-workspace.md)
   Reframes result analysis as a scoreboard workspace.
57. [`0057-enforce-frontend-dependency-audits-in-shared-verification.md`](0057-enforce-frontend-dependency-audits-in-shared-verification.md)
   Adds a frontend dependency audit to the shared local and CI verification path.
58. [`0058-align-kotlin-gradle-plugin-with-gradle-9.md`](0058-align-kotlin-gradle-plugin-with-gradle-9.md)
   Aligns the API Kotlin Gradle Plugin baseline with Gradle 9.
59. [`0059-standardize-workspace-overlay-accessibility.md`](0059-standardize-workspace-overlay-accessibility.md)
   Defines keyboard focus and reduced-motion requirements for workspace overlays.
60. [`0060-preserve-kotlin-annotation-targets-and-api-test-diagnostics.md`](0060-preserve-kotlin-annotation-targets-and-api-test-diagnostics.md)
   Preserves API annotation placement and exposes Testcontainers test progress.
