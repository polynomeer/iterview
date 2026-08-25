# 0015. Simplify Workspace Visual Hierarchy

Date: 2026-08-25

## Status

Accepted

## Context

The redesign established a stronger workspace-first structure, but the active visual system still leaned too heavily on dark cards, low-contrast headers, and repeated hero treatments.

In practice this created three problems:
- the main content area looked heavier than the sidebar, so page hierarchy felt inverted
- route intros and chips often lost contrast against the light workspace background
- closely related surfaces such as practice, review, resume analysis, and home guest landing did not feel like one calm product system

The next redesign phase needs cleaner hierarchy and easier scanning, not more decorative variation.

## Decision

We will simplify the product-wide visual hierarchy with these rules:
- keep the sidebar as the primary dark anchor
- move the main workspace back toward bright, paper-like surfaces
- use darker body and heading text in the main content region
- reduce card heaviness by lowering shadow depth and border intensity
- keep warm accent states restrained and only for status emphasis or current-surface highlighting
- reuse one calmer surface language across workspace rails, page workspaces, and supporting cards

We will apply this through late-stage CSS overrides first so the redesign can be validated quickly across many routes before deeper component refactors.

## Consequences

Positive:
- the shell reads more clearly as navigation rail plus content workspace
- page intros and supporting rails become easier to scan
- the guest landing and authenticated workspaces move closer to one shared visual language

Trade-offs:
- some older dark-surface components still need targeted follow-up to fully match the new hierarchy
- late-stage overrides increase CSS layering until a later cleanup pass consolidates the tokens
- visual QA remains necessary because broad surface overrides can expose page-specific exceptions
