# 05-implementation-plan

Shared implementation sequencing lives in:
- `../../../docs/02-implementation-roadmap.md`

This document narrows the focus to backend delivery.

## Planning Principles

- preserve the existing answer and review loop
- evolve schema through additive Flyway migrations
- keep new domain logic inside existing domain boundaries
- reuse current aggregates before inventing new ones
- preserve deterministic local-development behavior even when AI features are available

## Recommended Backend Delivery Layers

### Layer 1. Core loop stability

Keep healthy:
- auth
- profile and settings
- resume selection
- question discovery
- answer submission
- review queue and archive
- home and feed

### Layer 2. Resume intelligence depth

Expand:
- PDF ingestion lifecycle
- raw text and structured extraction
- structured resume subresources
- extraction status and re-extraction controls

### Layer 3. Question and analysis enrichment

Expand:
- question trees
- reference answers
- learning materials
- richer answer analyses

### Layer 4. Skill and readiness APIs

Expand:
- radar
- gaps
- progress
- additive review-priority signals

### Layer 5. Interview-session depth

Expand:
- resume-grounded session creation
- follow-up generation metadata
- coverage tracking
- result-time resume map

### Layer 6. Practical interview replay

Expand:
- imported audio lifecycle
- transcription retryability
- structured question extraction
- interviewer profile derivation
- replay-seed creation

### Layer 7. Resume tailoring and editor depth

Expand:
- job-posting persistence
- analysis runs and export generation
- heatmap overrides
- editor workspaces and revisions

## Implementation Rules By Concern

### Schema changes

- one migration per coherent concept
- prefer forward-only additive evolution
- preserve core record provenance

### Service changes

- place business rules in domain services
- keep controller code thin
- avoid making `common` a dumping ground for domain logic

### AI-backed features

- keep provider configuration explicit
- persist enough metadata for traceability
- maintain fallback behavior when possible
- do not make local development unusable without AI credentials

### Read models

- richer multi-table payloads are acceptable in service code
- denormalized tables should be introduced only when they buy clarity or performance

## Suggested Future Order

1. richer resume extraction surfaces
2. richer answer analysis persistence
3. question tree and study material expansion
4. stronger skill and gap signals
5. deeper interview coverage and result mapping
6. replay and interviewer-profile refinement
7. richer editor document primitives if backend model maturity justifies it

## Done Criteria For A Backend Slice

A slice is complete only when:
- its data model is coherent
- its endpoints are documented
- its behavior is testable or operationally verifiable
- its terminology matches the rest of the repository

