# ADR 0049: Reframe Bookmarks As A Saved Context Browser

## Status
Accepted

## Context
- The bookmarks route already held the right domain entities, but it still read like a simple saved-card list instead of the sample-aligned browser in `docs/references/design/bookmarks.png`.
- Users need bookmarks to function as a compact shelf of saved interview context that can be scanned, sorted, reopened, and compared without rebuilding the reasoning chain from memory.
- The ongoing desktop redesign is standardizing around a clear browser-plus-inspector interaction model across knowledge and practice surfaces.

## Decision
- Reframe the bookmarks route into a saved-context browser with:
  - a stronger top browser header for category tabs, search, sorting, and section counts
  - a denser row-like saved-items list with visible readiness signal and status
  - a right detail inspector for the selected bookmark, including why it was saved, performance signal, related bookmarks, and primary reopen actions
- Preserve the current mock data structure and route topology, and implement the redesign through composition changes plus workspace-theme overrides.
- Use low-risk derived chrome such as section counts, score rings, and browser pagination affordances where the sample implies richer product behavior than the current data model provides.

## Consequences
- The bookmarks route now behaves more like a real saved-items browser and aligns better with the sample's interaction model.
- Existing bookmark data contracts remain unchanged, so future work can add persistent bookmark metadata or richer source facets without another layout rewrite.
- The page is now visually consistent with the redesigned archive, notes, practice, question inspector, scheduled reviews, review queue, and home workspace surfaces.
