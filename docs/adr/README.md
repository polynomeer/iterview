# Architecture Decision Records

This directory tracks durable product, architecture, design-system, and repository-level decisions for `iterview`.

Use ADRs when a change answers one or more of these questions:
- why the product is shaped a certain way
- why a shared UX pattern exists across pages
- why a repository-wide engineering rule was introduced
- why a major flow, shell, or information architecture choice was made

## ADR Rules

1. Add a new ADR when a shared decision changes product behavior, architecture, design direction, or delivery policy.
2. Write the ADR in the same work unit as the code or document change that introduced the decision.
3. Do not rewrite old ADRs to hide history. Add a new ADR that supersedes an older one when direction changes.
4. Keep app-local implementation notes in the owning app docs. Use root ADRs only for shared decisions.

## ADR Format

Each ADR should include:
- `Status`
- `Date`
- `Context`
- `Decision`
- `Consequences`

## Index

1. [`0001-product-focus-resume-dfs-source-of-truth.md`](0001-product-focus-resume-dfs-source-of-truth.md)
   Defines the core product model: resume-grounded source of truth plus DFS interview traversal.
2. [`0002-monorepo-shared-boundaries.md`](0002-monorepo-shared-boundaries.md)
   Fixes the monorepo rule that shared policy stays at the root while app detail stays with the owning app.
3. [`0003-reference-driven-redesign-program.md`](0003-reference-driven-redesign-program.md)
   Establishes the redesign process around reference documents and captured design assets.
4. [`0004-workspace-first-shell-and-navigation.md`](0004-workspace-first-shell-and-navigation.md)
   Moves the frontend toward a workspace-first shell instead of isolated page-by-page navigation.
5. [`0005-page-workspaces-over-generic-lists.md`](0005-page-workspaces-over-generic-lists.md)
   Chooses guided workspaces over plain list/detail screens for core preparation flows.
6. [`0006-unified-visual-system-for-redesign.md`](0006-unified-visual-system-for-redesign.md)
   Standardizes the redesign around a minimal dark workspace surface system with shared card and typography rules.
7. [`0007-guest-simplification-and-ongoing-adr-policy.md`](0007-guest-simplification-and-ongoing-adr-policy.md)
   Simplifies the guest experience and formalizes ongoing ADR creation as a repository rule.
