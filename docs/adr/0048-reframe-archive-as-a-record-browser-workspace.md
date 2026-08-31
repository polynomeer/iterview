# ADR 0048: Reframe Archive As A Record Browser Workspace

## Status
Accepted

## Context
- The archive route exposed the right information, but it still read as a card list with supporting notes rather than the sample-aligned record browser in `docs/references/design/archive.png`.
- Users need archive items to behave like proven answer records that can be scanned, compared, selected, and reopened with the original session context.
- The workspace redesign across desktop pages is standardizing around a left filter rail, a central browser canvas, and a right detail inspector.

## Decision
- Reframe the desktop archive route into a record browser workspace with:
  - a sticky left rail for archive filters and curation guidance
  - a central browser list that uses a denser table-like row layout with explicit selection state
  - a right detail rail for the selected archived question, including summary, score history, DFS-adjacent context, and reopen actions
- Preserve the current route structure and archive data flow, and build the new behavior with page-level selection state plus workspace-theme overrides.
- Add lightweight derived UI signals where the sample implies richer product behavior than the current backend exposes, while keeping those additions local to the presentation layer.

## Consequences
- The archive route now reads more like a real review browser and matches the sample interaction model more closely.
- Existing archive contracts remain intact, so future work can connect real score history, richer metadata, or archive actions without another layout reset.
- The archive page is now visually aligned with the redesigned home, question map, review queue, scheduled reviews, question inspector, practice, and notes pages.
