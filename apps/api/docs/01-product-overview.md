# 01-product-overview

This document explains the product from the backend's point of view.

The shared cross-app product direction lives in root [`../../../docs/01-product-foundation.md`](../../../docs/01-product-foundation.md). This file should answer a narrower question:

How should backend services and data models support the `iterview` learning loop without breaking the current platform shape?

## Backend View Of The Product

From the backend perspective, `iterview` is a persistence and orchestration layer for a repeatable resume-defense system.

The core loop is:

```text
user profile + active resume version
-> source-of-truth records for resume claims
-> root question selection
-> follow-up expansion and DFS traversal
-> answer submission
-> score + feedback persistence
-> branch coverage, retry scheduling, or archive decision
-> home and review surfaces reflect the updated state
```

That loop must remain the stable center of the system even as the product adds richer resume intelligence, interview simulations, skill insights, and replay-based analysis.

## Current Backend Scope

The implemented and actively owned backend scope includes:
- authentication and current-user bootstrap
- user profile, preferences, and target-company settings
- resume container and immutable resume-version lifecycle
- resume file intake and parsed resume workflows
- question catalog and question detail APIs
- answer submission, answer history, score persistence, and feedback persistence
- review queue, archive, daily card, and feed APIs
- interview-session APIs and practical interview processing support
- skill-related APIs and resume-tailoring related backend surfaces

## Product Principles The Backend Must Preserve

### 1. Resume Context Is Foundational

- a user's active resume version is part of the learning context, not just an uploaded file
- resume intelligence should remain attributable to one specific resume version
- richer analysis features should extend current resume records instead of inventing a disconnected parallel model

### 2. Resume Source Of Truth Must Be Persisted

- the backend should support detailed records for claims, evidence, metrics, and clarifications tied to resume content
- source-of-truth artifacts should be traceable to a resume version and, where appropriate, a finer-grained resume entity
- later interview questions and evaluations should be able to point back to the source-of-truth context they rely on

### 3. DFS Question Traversal Must Be Representable

- follow-up questions should be modelable as a graph or tree rooted in one primary prompt
- traversal state should make it possible to know which nodes were visited, answered, skipped, or still unresolved
- the system should support drilling to leaf-level clarifications rather than flattening every question into one list

### 4. Answer History Is Evidence, Not A Cache

- answer attempts are immutable historical records
- scores and feedback should remain traceable to a specific attempt
- later analytics should derive from answer history rather than overwrite it

### 5. Review State Must Be Durable

- retry scheduling should be persisted
- archive decisions should be explicit
- review status should not be reconstructed ad hoc from raw answer data on every read

### 6. Home Should Stay Action-Oriented

- daily-card and home endpoints should keep answering "what should I do next?"
- new intelligence features should feed that experience instead of replacing it with generic analytics

### 7. New Features Should Be Additive

- prefer new tables, nullable columns, or additive response fields over breaking changes
- reuse current aggregates where possible
- keep existing frontend flows working while new surfaces are introduced

## Backend Product Extensions In Scope

The current repository direction already points toward these additive extensions.

### Resume Intelligence

- structured extraction from parsed resume content
- richer project, experience, and credential records
- confidence and traceability for extracted resume signals
- resume-risk and resume-strength summaries
- source-of-truth records for claims, metrics, trade-offs, and evidence

### Skill And Readiness Signals

- skill-category aggregation from answer history
- readiness and benchmark-style summaries
- home and review prioritization that can incorporate skill gaps

### Question Depth

- follow-up question trees
- traversal state for DFS-oriented interview practice
- learning materials and model-answer style reference content
- stronger relationships between a root question and related practice depth

### Interview Workflows

- resume-grounded mock interview sessions
- session history and result review
- coverage-oriented interview modes
- question-level linkage from interview turns back into archive and study flows

### Practical Interview Replay

- uploaded real interview recordings
- transcript, cleaned transcript, and user-confirmed transcript kept as separate assets
- structured extraction of questions, answers, and follow-up relationships from real interviews
- interviewer-style metadata that can seed later replay simulations

### Bilingual Product Support

- Korean and English as system languages
- user-authored content preserved in its original language
- generated text and localized labels aligned with the effective locale

## Current Scope Vs Planned Extension Scope

### Implemented Today

- authentication and current-user profile APIs
- resume list, create, version upload, and activation APIs
- question list and detail APIs
- answer submission, answer history, and answer detail APIs
- review queue, archive, home, and feed APIs
- scoring, retry scheduling, and archive decisions

### Planned Additive Extensions

- richer resume extraction snapshots for skills, experiences, and risks
- saved job-posting parsing and resume-to-job analysis runs
- persisted resume rewrite suggestions and acceptance state
- question relationship modeling for follow-up trees
- question-linked model answers and learning material metadata
- richer answer analysis beyond score plus feedback rows
- stronger skill radar, gap analysis, and benchmark APIs
- practical interview replay records and replay-simulation seeds

### Explicitly Out Of Scope Unless Requested

- live voice or streaming interview systems
- public answer publishing or social comparison
- GitHub sync
- community or lounge features
- admin moderation tooling

## Product Rules The Backend Should Treat As Stable

- questions are global shared assets
- answer attempts remain immutable after submission
- resume versions remain immutable historical records
- extracted resume intelligence is scoped to one resume version
- source-of-truth artifacts are scoped to one resume version or one resume claim lineage
- retry scheduling is persisted state
- archive remains question-level, even when the source was an interview turn
- interview history remains session-level and should not replace archive
- user-authored source data stays available in the original language
- generated or localized text should carry locale-aware behavior

## Where To Read Next

- architecture: [`02-backend-architecture.md`](02-backend-architecture.md)
- database model: [`03-db-schema.md`](03-db-schema.md)
- API contracts: [`04-api-contracts.md`](04-api-contracts.md)
- docs index: [`README.md`](README.md)
