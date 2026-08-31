# ADR 0046: Reframe Practice As A Question Browser Workspace

## Status
Accepted

## Context
- The practice page already exposed filters, question rows, and a selected-question inspector, but the visual hierarchy was still weaker than the sample in `docs/references/design/practice.png`.
- Users need the practice route to act as a question browser where they can:
  - narrow the pool quickly
  - compare branches in a dense list
  - inspect the selected question and start answering without leaving the screen
- The ongoing workspace redesign is standardizing around a three-column desktop model with explicit support, canvas, and execution rails.

## Decision
- Reframe the desktop practice route into a browser workspace with:
  - a sticky left filter rail that exposes category, company, difficulty, and status sections as selectable stacks
  - a central question browser that uses a denser table-like header and row structure for faster scanning
  - a right inspector rail that emphasizes prompt reading, key concepts, recent attempts, readiness signals, and launch actions
- Keep existing route structure and query behavior intact, and use workspace-theme overrides rather than a separate page-scoped styling system.
- Add low-risk mock-only interface affordances such as table headers, pin action, and branch summary cards where the sample implies richer product behavior than the current backend provides.

## Consequences
- The practice route now reads closer to a real productivity browser and matches the sample's left-center-right rhythm more closely.
- Existing data contracts remain stable, so future iteration can swap mock affordances for real sorting, pinning, or attempt metadata without reworking the page hierarchy.
- The desktop practice experience is now more visually consistent with the redesigned home, question map, review queue, scheduled reviews, and question inspector pages.
