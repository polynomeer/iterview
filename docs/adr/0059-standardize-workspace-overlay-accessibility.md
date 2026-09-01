# 0059. Standardize Workspace Overlay Accessibility

## Status
Accepted

## Date
2026-09-01

## Context

The workspace-wide command palette is a modal interaction that can be opened from any authenticated route. It previously focused the search input when opened, but it did not retain keyboard focus within the modal or return focus to the invoking control when closed. The global stylesheet also lacked a user preference fallback for reduced motion.

## Decision

Treat the command palette as the accessibility reference for workspace overlays:

- store and restore the previously focused element when the overlay opens and closes
- keep `Tab` and `Shift+Tab` navigation within the overlay
- expose the search input and results as a `combobox` and `listbox` with active-option state
- provide a global visible `:focus-visible` outline and honor `prefers-reduced-motion`

Future workspace overlays must provide the same focus containment, focus restoration, keyboard exit, and reduced-motion behavior.

## Consequences

Positive:

- Keyboard users do not lose their place when opening or dismissing the command palette.
- Screen readers receive the active command result through standard combobox and listbox semantics.
- Interaction feedback remains visible and motion-sensitive across every route.

Trade-offs:

- Overlay implementations need explicit focus lifecycle tests rather than relying on visual behavior alone.
- The global focus outline may layer with specialized component focus styling; component rules must preserve, not suppress, the visible focus state.
