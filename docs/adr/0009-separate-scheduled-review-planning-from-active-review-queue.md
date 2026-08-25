# ADR 0009: Separate Scheduled Review Planning from the Active Review Queue

- Status: Accepted
- Date: 2026-08-25

## Context

The redesign already gave `Review Queue` a clear role: execute the next high-signal retry and return to active practice quickly.

That still left a gap for spaced repetition. Planning upcoming review blocks by day, deciding what can slip, and seeing mastery impact are different jobs from executing the next retry item.

If both concerns stayed inside one queue screen, the review system would collapse planning and execution into the same workspace again.

## Decision

The product separates review execution from review scheduling.

- `Review Queue` remains the execution workspace for immediate retry items
- `Scheduled Reviews` becomes the planning workspace for upcoming, overdue, and rescheduled review blocks
- scheduling should show calendar load, block timeline, and projected mastery impact
- users should be able to reschedule or complete a review block without losing the link back to the active review queue

## Consequences

- The review hierarchy becomes clearer: immediate recovery versus scheduled repetition.
- Future weak-node and settings work can connect to review cadence without overloading the queue screen.
- Navigation and documentation can describe spaced repetition as a first-class workspace rather than an implied queue filter.
- The product moves closer to the intended workspace-first review structure from the redesign plan.
