# 0071. Tighten Workspace Shell To Reference Density

## Status
Accepted

## Date
2026-09-01

## Context

The shared desktop shell used multi-line navigation and weak panel boundaries, making workspace
pages read as generic card collections rather than a focused analysis application.

## Decision

Use a compact single-line sidebar, a fixed top boundary, and explicit workspace panel dividers for
the workspace theme. Keep descriptive navigation metadata out of the desktop scan path while
retaining it for responsive layouts where it provides needed context.

## Consequences

- Desktop graph and inspector pages gain more usable canvas width.
- Shared navigation visually matches the reference application's high-density frame.
- Mobile navigation remains unchanged.
