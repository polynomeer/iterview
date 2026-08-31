# 0018. Standardize Desktop Three-Rail Workspaces For Inspector Flows

## Status
Accepted

## Date
2026-08-31

## Context

After aligning the shared authenticated shell to the captured desktop references, several core pages still behaved like conventional web layouts instead of product workspaces.

The biggest gap appeared on:
- question detail inspection
- retry queue execution
- archive browsing

These flows all require the user to keep three kinds of information visible at the same time:
- source signals or filters
- the main working canvas
- execution or inspection context

When these concerns stack into one or two columns, the pages drift away from the reference design language and force more scanning and context switching.

## Decision

Desktop inspector-style flows should use a standard three-rail workspace pattern:
- left rail for source signals, filters, and supporting study material
- center canvas for the primary reading or execution task
- right rail for execution decisions, metadata, and contextual inspection

This pattern applies by default to:
- question detail pages
- review queue pages
- archive pages

Other authenticated pages with similar interaction pressure should reuse the same composition unless they have a clearer task-specific reason to diverge.

## Consequences

Positive:
- core inspector pages now align more closely with the reference screenshots
- the same mental model carries across practice, archive, and retry work
- future refinements can focus on content fidelity within stable rails

Trade-offs:
- desktop layouts become denser and more opinionated
- mobile continues to use simpler stacked layouts and will not mirror desktop exactly
- some legacy components still need visual cleanup inside the new rail structure
