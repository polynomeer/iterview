Read AGENTS.md, docs/05-ui-structure.md, docs/07-acceptance-criteria.md, and the existing frontend code first.

Standardize common UX states across iterview-web.

Scope:
- loading states
- empty states
- error states
- toast or inline feedback strategy
- consistent page-level and section-level UX patterns

Requirements:
- create reusable common UI patterns for:
  - page loading
  - section loading
  - empty state
  - error state
  - retry action
  - success feedback
- apply these patterns consistently across:
  - home
  - question detail
  - answer editor
  - result analysis
  - practice
  - archive
  - feed
  - profile
  - resume
- keep the UI simple and coherent
- avoid overengineering visual systems
- improve overall navigation and interaction consistency

Out of scope:
- full design system
- animation-heavy UX
- accessibility audit beyond obvious improvements

When finished:
1. summarize common UX primitives added
2. summarize pages updated
3. explain consistency decisions
4. list remaining UX rough edges
