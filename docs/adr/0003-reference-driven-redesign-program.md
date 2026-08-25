# ADR 0003: Run the Redesign as a Reference-Driven Program

- Status: Accepted
- Date: 2026-08-25

## Context

The UI needed a large-scale redesign, but freehand implementation risked drifting away from the intended quality bar and from the sample directions collected during the project.

The project already accumulated redesign concept documents, strategy notes, and reference images under `docs/`.

## Decision

The redesign is driven by documented references first, then implemented in code.

The workflow is:

1. collect reference assets and concept notes under root `docs/`
2. write strategy and workplan documents before broad UI changes
3. implement the redesign incrementally in scoped frontend work units
4. keep documentation and shipped UI aligned as the design evolves

This makes the redesign a documented program, not a series of disconnected style tweaks.

## Consequences

- New shared design direction should be written down before or alongside implementation.
- Reference assets in `docs/references/design/` remain part of the design source material.
- Redesign work is easier to review because intent is visible in documents, not only in CSS and JSX.
- Future refinement can compare shipped screens against an explicit recorded direction.
