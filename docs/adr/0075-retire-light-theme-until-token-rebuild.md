# 0075. Retire the Light Theme Until the Token Rebuild

## Status
Superseded by ADR 0082.

## Date
2026-09-30

## Context
The 2026-09 UX audit (`docs/09-ux-audit-and-redesign-proposal.md`) found that the default `light` theme paired the dark workspace surfaces used across the redesigned pages with light-theme text colors. Page titles, sidebar groups, and form labels were near-invisible for every user who had not switched themes. Because `ThemeProvider` persisted the default on first load, almost every existing browser had `light` stored. The `workspace` and `dark` themes render coherently.

## Decision
- Remove `light` from the selectable themes and make `workspace` the default.
- Treat a stored `light` value as unknown so it falls back to the default without a separate migration step.
- Set `color-scheme: dark` for every remaining theme.
- Reintroduce a light theme only as part of the token-based design system proposed in ADR 0074 (Phase 1). It must not be layered onto the existing workspace overrides.

## Consequences
- All users get readable titles and labels immediately.
- Users who preferred a bright UI lose that option temporarily.
- `[data-theme="light"]` rules in `global.css` become dead code and are removed with the Phase 1 stylesheet cleanup.
