# ADR 0005: Prefer Guided Workspaces Over Generic List and Detail Screens

- Status: Accepted
- Date: 2026-08-25

## Context

Core flows such as practice, review queue, question detail, notes, result analysis, archive, and interview preparation all serve decision-making, not simple browsing.

Plain lists and raw detail screens were not sufficient to communicate:
- what the user should do next
- why a branch matters
- how a screen contributes to DFS interview preparation

## Decision

Major preparation pages should be implemented as guided workspaces with:

- a strong leading surface
- explicit guidance or decision rules
- summary stats only when they clarify action
- contextual chips, side rails, or supporting panels
- direct next actions connected to the preparation loop

The page must explain the work, not just expose the data.

## Consequences

- Each major page needs its own workspace framing rather than a shared generic layout alone.
- Content density should support action, not dashboard theater.
- Review and practice screens should bias toward focus and branch control rather than catalog browsing.
- Future redesign work should evaluate whether each page helps the user decide the next best preparation step.
