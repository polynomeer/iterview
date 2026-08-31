# 0017. Align Core Workspaces To Reference Desktop Shell

## Status
Accepted

## Date
2026-08-31

## Context

The redesign program already established a workspace-first shell and a shared dark visual system, but the implemented frontend still diverged materially from the captured reference images in `docs/references/design/`.

The gap was not limited to colors or card styling. The reference set consistently uses:
- a dense left navigation rail
- a compact top toolbar
- a central canvas with low-elevation bordered surfaces
- page-specific right-side support rails
- desktop-first list, workspace, and inspector compositions for the main preparation flows

Without matching those structural patterns, the product still reads like a generic responsive web app instead of the focused desktop preparation workspace that the redesign documents intend.

## Decision

The core authenticated workspaces must align to the reference desktop shell, not just approximate its palette.

This means:
- the shared app shell uses a persistent dark desktop frame with a sticky left navigation rail and compact top toolbar
- `Today`, `Workspace`, `Practice`, and `Resume` prioritize desktop multi-column compositions over centered single-column web layouts
- side rails are treated as first-class contextual surfaces rather than optional stacked cards
- card styling favors thin borders, restrained contrast, compact typography, and low-elevation surfaces instead of bright gradients and soft marketing-style panels
- future redesign work for adjacent authenticated pages should inherit this shell language unless a new ADR explicitly introduces an exception

## Consequences

Positive:
- the main product now moves closer to the captured reference direction
- shared layout work can be reused across authenticated pages
- future page refinement can focus on content fidelity instead of re-arguing shell structure

Trade-offs:
- the desktop shell becomes more opinionated and less visually generic
- some legacy page sections may still need follow-up refactoring to fully harmonize with the new shell
- mobile layouts remain simplified and will continue to lag behind desktop fidelity until handled in separate work units
