# Frontend Backlog

This backlog contains work that is not already delivered in the current workspace.
The interview flow, practical-interview upload and replay, resume-tailoring flow,
Korean-default/English-switchable i18n, workspace themes, and the initial accessibility
pass are already shipped and are intentionally excluded.

## Product Expansion

### P1. Public Learning And Community
- lounge pages for community content once the lounge API exists
- public answer publishing and discovery pages
- answer comparison pages backed by comparison snapshots

### P2. Input And Integrations
- GitHub sync settings and import-status UI after the integration contract exists
- advanced analytics that explain preparation decisions without displacing the DFS practice loop

## Experience Hardening

### P1. Accessibility And Interaction
- keyboard journey through the resume document editor (its slash menu and selection toolbar); axe already scans it
- manual screen-reader pass (VoiceOver, NVDA) over the same flows; axe cannot judge reading order or announcement wording
- apply optimistic updates only where conflict recovery is explicit and safe

### P2. Architecture And System Quality
- continue design-system consolidation only when repeated patterns are proven across new work
- reduce remaining one-off form state as feature work touches it; do not introduce a global form abstraction prematurely
- add visual regression coverage for the highest-risk workspace routes when a stable browser-test harness is selected

## Delivery Rule

Every new page must preserve the workspace-first hierarchy, be localized in Korean and
English from the start, and include route-level behavior verification.
