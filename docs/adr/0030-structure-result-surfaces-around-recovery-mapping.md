# 0030. Structure Result Surfaces Around Recovery Mapping

## Status
Accepted

## Date
2026-08-31

## Context

The result flow had already moved closer to the workspace reference, but two problems remained:
- the top result hero and the action rail still repeated the same recovery message
- the full-coverage result view showed evidence mapping and replay actions without a strong visual hierarchy

For this product, the result screen is not a celebratory summary.
It is a recovery console that should answer:
- what failed
- what evidence block it came from
- which next pass should prove the repair

## Decision

Result surfaces should be organized around recovery mapping instead of general recap.

Rules for this pass:
- remove breadcrumb-like recap copy from the result workspace hero
- keep one concise recovery message in the top surface and one concrete next-pass decision in the side rail
- style coverage summary, evidence mapping, and resume catalogs as one connected result system
- reduce decorative variety so the result screen feels flatter and more operational

Applied outcomes:
- `Interview Result` now frames the page around immediate recovery choice
- `InterviewFullCoverageResultView` is treated as the evidence-mapping surface of that choice
- result cards and side rails use a more uniform workspace treatment

## Consequences

Positive:
- the result flow now reads as a single decision system
- evidence mapping is easier to connect to the next retry pass
- the visual hierarchy better matches the reference workstation tone

Trade-offs:
- the screen is less celebratory and more severe by design
- future additions should support recovery decisions directly or live elsewhere
