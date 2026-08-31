# 0023. Standardize Execution Workspaces Around Central Canvas

## Status
Accepted

## Date
2026-08-31

## Context

After aligning the home, practice, and resume surfaces to the reference screenshots, the next mismatch was concentrated in the execution flows:
- `Question Detail`
- `Answer Editor`
- `Interview Session`

These screens already exposed the required data, but they still distributed attention too evenly across summary, prompt, context, and actions.

That weakened the intended interaction model:
- inspect one node
- decide one action
- write or defend one answer in a narrow branch

The reference direction is not a neutral dashboard. It is a workstation where the central canvas must remain dominant while side rails support the next decision.

## Decision

Execution-oriented workspaces should share a stronger central-canvas pattern:
- left rail for reading, support, or branch-prep context
- center column for the active prompt, draft, history, or branch-defense canvas
- right rail for sticky decision support, metadata, and immediate actions

For this redesign pass:
- `Question Detail` uses left prep context, central node/history canvas, and right execution rail
- `Answer Editor` uses left prompt context, central drafting canvas, and right submission rail
- `Interview Session` keeps the current branch and answer draft central while using a sticky right inspector for execution decisions

## Consequences

Positive:
- the core interview-prep flows feel more coherent as one product system
- the user can keep the current branch and its next action visible without scanning the whole page
- the UI moves closer to the reference screenshots in both density and workflow clarity

Trade-offs:
- these screens become less flexible for symmetric content placement
- future additions must respect the central-canvas hierarchy or they will dilute the flow again
