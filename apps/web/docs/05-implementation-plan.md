# 05-implementation-plan

Shared implementation sequencing lives in:
- `../../../docs/02-implementation-roadmap.md`

This document narrows the focus to frontend delivery.

## Planning Principles

- preserve the current route shell and mental model
- keep new capabilities additive where possible
- put route branching in pages, not in shared primitives
- tolerate optional backend fields gracefully
- keep mobile-first usability intact

## Recommended Frontend Delivery Layers

### Layer 1. Baseline route quality

Protect:
- home
- practice
- question detail
- answer editor
- result analysis
- review queue
- archive
- profile
- resume

### Layer 2. Resume intelligence visibility

Expand:
- upload flow quality
- extraction status visibility
- structured resume subresource rendering
- active version clarity

### Layer 3. Practice-depth enrichment

Expand:
- question tree entry points
- reference answers and learning materials
- richer result-analysis presentation

### Layer 4. Skills and readiness

Expand:
- skills page polish
- radar and gap surfacing
- better summary widgets for next-action views

### Layer 5. Interview-session depth

Expand:
- clearer interview start flow
- richer snapshot-driven session rendering
- better coverage and result views

### Layer 6. Practical interview replay

Expand:
- upload and lifecycle states
- transcript and question review surfaces
- replay launch clarity

### Layer 7. Resume-tailor, heatmap, and editor refinement

Expand:
- analysis detail readability
- remap workflows
- editor revision and collaboration UX

## Frontend-Specific Rules

### Route work

- keep route ownership explicit
- do not add top-level routes for every small feature if an existing route can carry the concept cleanly

### UI work

- prefer reusable widgets over page-local duplication
- prefer entity mapping over raw DTO rendering
- keep empty and loading states explicit

### API work

- centralize endpoint and query usage
- treat additive fields as optional by default
- gate advanced UI gracefully when backend support is absent

## High-Value Near-Term Improvements

1. strengthen public-facing home and question-detail clarity
2. make resume analysis and resume version status easier to understand visually
3. continue polishing interview and practical-interview review flows
4. keep archive and result-analysis views understandable to a non-technical evaluator

## Done Criteria For A Frontend Slice

A slice is complete only when:
- the route or surface is understandable without hidden context
- loading, empty, error, and success states are handled
- route transitions remain coherent
- terminology matches backend and shared docs

