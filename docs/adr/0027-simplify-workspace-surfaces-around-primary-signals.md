# 0027. Simplify Workspace Surfaces Around Primary Signals

## Status
Accepted

## Date
2026-08-31

## Context

After introducing the `workspace` theme, the remaining mismatch with the reference set was less about route structure and more about presentation density.

The current UI still showed several low-value patterns:
- repeated chips that restated the same state
- link cards with two-line meta everywhere
- helper paragraphs that repeated the title instead of moving the user forward
- home and review surfaces broken into too many small explanatory blocks

The reference screens behave differently.
They keep one primary working surface visible and let secondary context stay compact.

## Decision

Workspace-theme surfaces should prioritize primary signals over repeated explanation.

For shell and navigation:
- desktop sidebar should feel like a compact operating rail, not a document menu
- header actions should stay short and utility-shaped

For page surfaces:
- home and review screens should remove duplicated helper copy
- action cards should expose one clear next move and one fallback
- retry cards should keep reason, timing, and actionability, but avoid restating the same lane multiple times

## Consequences

Positive:
- the interface reads closer to the reference set
- important actions become easier to scan
- the workspace feels less cluttered and less fragile

Trade-offs:
- some explanatory copy is intentionally removed and must now be carried by hierarchy instead
- future additions should be challenged if they only repeat visible state
