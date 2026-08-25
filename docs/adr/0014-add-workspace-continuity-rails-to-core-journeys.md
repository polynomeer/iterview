# 0014. Add Workspace Continuity Rails To Core Journeys

Date: 2026-08-25

## Status

Accepted

## Context

The redesign already moved most major surfaces away from generic lists and toward explicit workspaces. Even so, the main journey pages still depended too much on local hero copy and page-level CTAs to explain how one surface leads into the next.

That made the product read correctly in isolation but still feel fragmented across the core flow:
- practice branch selection
- review queue and weak-node remediation
- resume source-of-truth analysis
- interview launch and active DFS session
- result-driven recovery

The remaining acceptance risk was not missing functionality, but missing continuity language and route-level handoff between these workspaces.

## Decision

We will add a shared `WorkspaceContinuityRail` to the core journey pages.

The rail will use one repeated structure:
- upstream context
- current surface
- next surfaces

Each page will provide route-specific links and descriptions, but the visual structure, wording pattern, and hierarchy will stay shared.

We will apply this first to the highest-value connected journey pages:
- `Practice`
- `Review Queue`
- `Weak Nodes`
- `Resume Analysis`
- `Interview`
- `Interview Session`
- `Interview Result`

## Consequences

Positive:
- the product reads more like one continuous interview-preparation workspace
- transitions between source-of-truth repair, retry work, and DFS interview execution become explicit
- future acceptance checks can verify cross-surface continuity through one shared pattern instead of page-by-page copy

Trade-offs:
- page headers now carry one more shared section, so copy discipline matters more
- continuity links need maintenance if route priorities change
- some secondary workspaces still rely on older local handoff cards and may need a second pass later
