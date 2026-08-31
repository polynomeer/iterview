# ADR 0044: Reframe Scheduled Reviews As A Calendar Browser

## Status
Accepted

## Context
- The scheduled reviews page still read like a stack of cards rather than the sample-aligned workspace browser shown in `docs/references/design/scheduled-reviews.png`.
- Users need to understand upcoming review pressure at a glance: what is due today, which branch is slipping, and which session should be executed next.
- The product's core loop is DFS-style interview preparation over resume-derived question trees, so scheduled reviews should feel like an execution board for branch recovery rather than a passive reminder list.

## Decision
- Reframe the scheduled reviews page into a three-column calendar browser:
  - a left support rail for tabs, up-next sessions, retry reminders, and clustered queue load
  - a center weekly calendar canvas that visualizes review sessions as executable blocks
  - a right detail inspector for topics, readiness impact, context signals, and immediate actions
- Keep the page within the existing route and frontend architecture, using mock scheduling data that maps directly to the current interview-preparation domain.
- Implement the redesign as workspace-theme overrides so the new visual system stays aligned with the broader redesign without introducing a separate page-local styling model.

## Consequences
- The page now matches the sample's interaction model more closely and improves scanability for weekly review planning.
- Some displayed calendar semantics are still mock-driven until backend scheduling data is expanded, but the UI contract for a richer review planner is now established.
- Future work can connect actual scheduling metadata and calendar editing behavior without rethinking the page hierarchy.
