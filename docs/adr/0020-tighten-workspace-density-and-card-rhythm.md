# 0020. Tighten Workspace Density And Card Rhythm

## Status
Accepted

## Date
2026-08-31

## Context

After the desktop shell and multi-rail workspace structure were aligned to the design references, the product still felt visually looser than the reference images.

The remaining mismatch came from:
- card padding that was too generous
- title and body copy that spread too widely
- chips and buttons that read more like generic web controls than compact product controls
- inconsistent internal rhythm across inspector cards, list items, and side rails

The structure was close, but the density and micro-hierarchy still weakened the reference match.

## Decision

The shared workspace visual language should use a tighter rhythm:
- smaller but still readable card padding
- stricter text line lengths inside cards
- more compact chip and button sizing
- stronger consistency for inner card radii and stacked surface spacing
- denser list, inspector, and side-rail components by default

This is a shared visual-system decision, not a one-page exception, and should guide future refinements unless a later ADR introduces a different density model.

## Consequences

Positive:
- the UI moves closer to the captured desktop references without changing product behavior
- cards feel more like one coherent workstation system
- dense preparation flows become easier to scan because hierarchy is more explicit

Trade-offs:
- there is less visual air than in earlier redesign passes
- future additions need to respect the tighter rhythm or they will stand out immediately
