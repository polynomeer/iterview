# 0022. Prioritize Daily Focus Context On Home Dashboard

## Status
Accepted

## Date
2026-08-31

## Context

The reference screenshots for the workspace and today flows do not behave like a generic analytics dashboard.

Their structure is centered on:
- one large daily focus surface at the top
- a persistent side rail that explains why that focus matters now
- supporting cards below that reinforce the current path instead of competing with it

The previous home composition contained the right data, but the visual hierarchy still spread attention too evenly across summary, retry, radar, and resume cards.

That weakened the intended product behavior:
- choose one branch
- understand why it is today's branch
- continue the DFS interview loop without context drift

## Decision

The home dashboard should prioritize daily focus and context over symmetric card distribution.

For desktop:
- the primary question card remains the dominant hero surface
- a sticky right rail holds today's context and next-action guidance
- lower supporting sections reinforce momentum, skill signal, and resume risk without competing with the hero

For mobile:
- daily context should appear immediately after the focus card, before broader support collections

This is a product-specific dashboard rule for the core preparation flow and should guide future changes to the home and today entry experiences.

## Consequences

Positive:
- the home screen better matches the reference images
- users get a clearer answer to what to do next and why
- the DFS interview-preparation loop becomes easier to follow from the first screen

Trade-offs:
- the dashboard is less neutral and more opinionated
- some supporting data becomes secondary by design and must earn its place below the fold
