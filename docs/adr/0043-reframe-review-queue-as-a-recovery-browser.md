# 0043. Reframe Review Queue As A Recovery Browser

## Status
Accepted

## Date
2026-09-01

## Context

The review queue route still behaved like a stack of retry cards:
- the desktop screen did not match the denser list-plus-inspector workflow in `docs/references/design/review.png`
- queue items were readable one by one, but comparing them and choosing the next retry was slower than necessary
- the page explained the queue well, but it did not feel like a dedicated recovery browser

That made recovery work feel heavier and more sequential than the sample reference.

## Decision

The review queue route should behave like a recovery browser:
- a left support rail for queue strategy and weak-branch context
- a central browser table for comparing retry items quickly
- a right detail rail for the selected retry, weak dimensions, and next actions

Applied outcomes:
- `ReviewQueuePage` now keeps the mobile card flow, but renders a desktop browser with tabs, selectable rows, and a selected-item inspector
- `ReviewQueueLayouts` now accepts explicit support, main, and inspector rails instead of hard-coded side cards
- review-queue-specific CSS now aligns the route with the sample review workspace grammar

## Consequences

Positive:
- the desktop review queue now matches the sample interaction model more closely
- users can compare retries, inspect one item, and act without scanning multiple large cards first
- the same browser grammar can be reused for scheduled reviews and bookmark-like recovery surfaces

Trade-offs:
- some mastery and weak-dimension values are derived display metrics because the queue API does not expose all sample data
- the browser tabs are currently UI structure first, with deeper segmented history behavior to be wired later
