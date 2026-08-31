# 0024. Structure Result Surfaces Around Recovery Decisions

## Status
Accepted

## Date
2026-08-31

## Context

The redesign had already aligned home, practice, resume, and execution surfaces to the reference-driven workstation model.

The remaining mismatch was concentrated in the result-reading flows:
- `Interview Result`
- `Result Analysis`

Both screens exposed enough information, but their visual hierarchy still made them feel like generic reporting pages instead of decision surfaces.

That was a product mismatch.

In this product, a result screen is not the end of the flow. It exists to answer:
- what failed
- what held
- what the next narrow recovery action should be

## Decision

Result surfaces should be structured around recovery decisions rather than passive score reporting.

For desktop:
- left rail should hold verdict, score, and next-step routing
- center canvas should hold the main analysis and recovery reasoning
- right rail should hold sticky follow-up actions or supporting recap content

For the current redesign pass:
- `Result Analysis` uses a left verdict/action rail, a central analysis canvas, and a right support rail
- `Interview Result` strengthens its side rail and hero summary so the next pass decision is more explicit

## Consequences

Positive:
- result screens now behave more like part of the interview-prep loop than a detached report
- the user can move from evaluation to recovery planning faster
- visual consistency improves across the end-to-end preparation workflow

Trade-offs:
- score reporting becomes intentionally secondary to actionability
- future result-page additions must preserve the recovery-first hierarchy
