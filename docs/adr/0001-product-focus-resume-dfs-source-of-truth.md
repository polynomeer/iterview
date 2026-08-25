# ADR 0001: Product Focus on Resume Defense, DFS Traversal, and Source of Truth

- Status: Accepted
- Date: 2026-08-25

## Context

`iterview` needed a clear product definition that could align backend contracts, frontend flows, and redesign scope.

Without a stable core model, the product risked becoming a generic interview question catalog, a generic resume tool, or a disconnected set of prep utilities.

## Decision

The product is defined around one primary preparation loop:

1. start from one resume version
2. extract and author a detailed source of truth for each claim
3. expand claims into interview question trees
4. traverse those trees in DFS order until questions reach atomic detail
5. simulate answers, score them, and revisit weak branches

This means the core product is not "practice questions" in the abstract. It is a resume-defense system built around depth, consistency, and branch coverage.

## Consequences

- Backend and frontend documents must describe resume-grounded interview prep as the primary product purpose.
- Feature prioritization should favor source-of-truth authoring, question-tree traversal, answer simulation, and branch recovery.
- UI language should reinforce branch depth, follow-up structure, retry loops, and resume defense.
- Generic features that do not strengthen this loop should be treated as secondary.
