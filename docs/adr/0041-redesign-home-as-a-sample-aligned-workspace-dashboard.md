# 0041. Redesign Home As A Sample-Aligned Workspace Dashboard

## Status
Accepted

## Date
2026-08-31

## Context

The home screen still behaved like a stack of generic cards even after the broader workspace theme pass:
- the main focus question was separated from the surrounding decision context
- the right-side "today context" rail from `docs/references/design/workspace-main.png` and `docs/references/design/today.png` was not reflected strongly enough
- summary, retry, materials, and risk sections existed, but they did not read as one coordinated dashboard surface

That left the landing experience cleaner than before, but still noticeably less structured than the reference workspace.

## Decision

The home screen should behave like a sample-aligned workspace dashboard:
- a top stage with the main focus canvas, a compact action card, and a persistent context rail
- a lower summary band for short-term readiness signals
- a lower card grid for retries, learning materials, and resume-risk cleanup

Applied outcomes:
- `HomeDesktopLayout` now composes a stage area that places the main focus card beside a compact action card and a dedicated context rail
- `TodayQuestionCard` now renders as a larger focus surface with a path preview and DFS-oriented status blocks
- `HomeNextActionCard` and the home CSS now use denser sample-like panels instead of loose stacked cards

## Consequences

Positive:
- the home route now matches the reference dashboard grammar more closely
- users can read the main path, next action, and supporting context without scanning multiple unrelated sections first
- later redesign passes can reuse this stage-plus-rail composition for overview and review-oriented screens

Trade-offs:
- several visual path and progress blocks currently use derived UI placeholders because the backend does not expose all sample data yet
- the mobile layout preserves the same information order, but does not mirror the desktop sample as literally as the larger viewport
