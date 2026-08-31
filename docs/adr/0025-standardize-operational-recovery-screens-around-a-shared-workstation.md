# 0025. Standardize Operational Recovery Screens Around A Shared Workstation

## Status
Accepted

## Date
2026-08-31

## Context

The redesign had already aligned the core preparation flows and the result-reading flows to the reference-driven workstation model.

The remaining inconsistency was concentrated in operational recovery screens:
- `Review Queue`
- `Archive`
- `Scheduled Reviews`
- `Weak Nodes`

These screens all belong to the same product loop:
- identify weak or reusable branches
- decide whether to retry, reopen, reschedule, or trace evidence
- move back into practice with better context

Before this pass, they exposed the right data but still behaved too much like separate utility pages.

## Decision

Operational recovery screens should share one workstation grammar.

For desktop:
- a left rail should hold planning, filter, or queue guidance
- a central canvas should hold the primary working set
- a right rail should hold the current selection, evidence, or action framing

For content:
- Korean should remain the default product language
- generic interface copy should be localized unless the term is a technical proper noun
- date-driven review surfaces should use dates consistent with the current operating week

For the current redesign pass:
- `Review Queue` is treated as a short execution surface, not a browsing page
- `Archive` is treated as a proven-answer shelf with session backtrace support
- `Scheduled Reviews` is treated as a visible planning board for recovery load
- `Weak Nodes` is treated as a graph-based remediation workspace tied to evidence

## Consequences

Positive:
- the user can read all operational recovery pages with the same spatial model
- switching between retry, archive, schedule, and remediation work requires less relearning
- the reference-driven redesign becomes more coherent across the full preparation loop

Trade-offs:
- these pages become more opinionated and less neutral as generic data viewers
- future operational surfaces must preserve the same rail and canvas hierarchy
