# 0056. Reframe Result Analysis As A Scoreboard Workspace

## Status
Accepted

## Date
2026-09-01

## Context

The result-analysis route already contained score, dimension, narrative, feedback, and follow-up data. Its desktop layout, however, treated the score as one card in a three-rail content stack instead of the primary decision signal.

The `docs/references/design/result-analysis.png` reference establishes a clearer sequence: identify the question and verdict, understand the score breakdown, inspect evidence, then select the next retry or deeper DFS route.

## Decision

Result analysis uses a scoreboard-first two-column workspace on desktop.

- The central column leads with question context, an accessible score ring, evaluation verdict, dimension breakdown, and analysis evidence.
- A sticky right rail holds the next action, model answer, and supporting feedback so execution stays available while the analysis is read.
- Mobile preserves the same information sequence as a single-column flow.
- The score ring only visualizes the existing `totalScore`; it does not introduce new assessment data.

## Consequences

Positive:

- The total score and its question context become immediately scannable.
- Dimension feedback is encountered before supporting material, which better supports focused correction.
- The retry action remains visible without competing with the primary score readout.

Trade-offs:

- Attempt history shown in the visual reference is not reproduced because the current result endpoint exposes one attempt only.
- The result route remains composed from reusable widgets, so some lower-priority cards retain their existing content shapes.
