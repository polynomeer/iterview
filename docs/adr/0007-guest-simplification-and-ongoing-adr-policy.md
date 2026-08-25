# ADR 0007: Simplify the Guest Experience and Require Ongoing ADRs

- Status: Accepted
- Date: 2026-08-25

## Context

The guest-facing shell had become crowded with repeated headings, placeholder metrics, and too much operational language before sign-in. At the same time, shared product and design decisions were accumulating quickly and needed durable documentation.

## Decision

Two repository-wide rules are adopted:

1. Guest-facing shared UI should emphasize product purpose and a small number of entry actions, not simulated workspace density.
2. Future shared decisions must be recorded as ADRs proactively, not only when someone asks for them later.

The ADR rule applies to:
- product-definition changes
- cross-app design-system changes
- repository-level workflow or documentation policy changes
- major shared shell, navigation, or information-architecture decisions

## Consequences

- Guest screens should stay simpler than authenticated workspace screens.
- Shared decisions should be committed with ADR updates in the same work unit.
- Repository guidance must point contributors to `docs/adr/`.
- Future changes can be reviewed against an explicit decision trail instead of relying on commit history alone.
