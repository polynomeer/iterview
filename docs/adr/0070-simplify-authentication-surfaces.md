# 0070. Simplify Authentication Surfaces

## Status
Accepted

## Date
2026-09-01

## Context

Login and signup repeated workspace guidance, status cards, and planning content around a simple
credential form. The extra visual hierarchy made the entry path feel heavier than the task.

## Decision

Use a narrow, single authentication panel for both login and signup. Keep visible labels, inline
error feedback, and the one alternate route, while hiding non-essential workspace explanation
until the user has entered the product.

## Consequences

- Authentication is faster to scan on desktop and mobile.
- Login and signup retain the same submission and redirect behavior.
- Product onboarding context moves to the authenticated workspace where it is actionable.
