# ADR 0053: Reframe Settings As A Preferences Browser

## Status
Accepted

## Context
- The settings route already exposed the required configuration controls, but it still behaved like a simple stacked form page instead of the denser preferences workspace shown in `docs/references/design/settings.png`.
- In this product, settings are not isolated account details. They shape how DFS interview practice, review reminders, language defaults, and target-company preparation operate together.
- The redesign program is aligning operational pages around a browser model with a top category bar, a central card grid, and a right inspector rail for derived state and next actions.

## Decision
- Reframe the settings route into a preferences browser with:
  - a top shell for breadcrumbs, category tabs, reset/save actions, and product-wide settings framing
  - a central grid that keeps server-backed defaults, review behavior, theme controls, and display state visible together
  - a right configuration rail for profile context, configuration health, recommended tweaks, and quick cross-workspace actions
- Preserve the current settings mutations, locale updates, theme switching, and local storage behavior, and express them through the new workspace layout instead of introducing new backend scope.
- Keep the page focused on operational defaults rather than expanding it into a general account management route.

## Consequences
- The route now reads like a true settings workspace and aligns more closely with the reference sample.
- Existing settings logic and related links remain unchanged, so the redesign is low-risk from a behavior standpoint.
- Future work can add more granular categories, integration toggles, and configuration diagnostics inside the new browser-and-rail structure without another large visual rewrite.
