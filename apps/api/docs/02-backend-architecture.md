# 02-backend-architecture

This document explains how the backend is organized today and how new capabilities should fit into it.

## Architectural Summary

The backend is a Kotlin and Spring Boot application organized by domain.

Key characteristics:
- package-by-domain structure
- Spring MVC controllers at the edge
- service layer owns business rules
- JPA repositories and entities own persistence mapping
- Flyway owns schema evolution
- OpenAPI and Swagger expose the runtime contract

The design is intentionally pragmatic. The goal is clarity, not framework cleverness.

## High-Level Responsibilities

The backend is responsible for:
- authentication and current-user context
- user profile and settings
- question catalog and learning content
- answer submission, scoring, and analysis persistence
- review queue and archive decisions
- resume upload, extraction, analysis, and editing workflows
- mock interview session orchestration
- practical interview import and replay-oriented processing
- skill, readiness, and progress APIs

## Package Structure

The codebase is centered under:
- `com.example.interviewplatform`

Implemented top-level domains currently include:
- `auth`
- `common`
- `user`
- `resume`
- `question`
- `answer`
- `review`
- `dailycard`
- `feed`
- `interview`
- `jobposting`
- `skill`

Within each domain, the standard package layout is:
- `controller`
- `service`
- `repository`
- `entity`
- `dto`
- `mapper`
- `enums`

That consistency is an architectural constraint. If a feature cannot fit this shape cleanly, the design should be questioned before a new pattern is introduced.

## Request Lifecycle

A typical request follows this path:

```text
HTTP request
-> controller
-> service
-> repository and persistence
-> DTO mapping
-> HTTP response
```

Cross-cutting concerns such as auth, error translation, locale, and configuration live in `common`.

## Domain Responsibilities

### `auth`

Owns:
- signup
- login
- authenticated bootstrap
- token issuance and validation

### `user`

Owns:
- profile data
- settings
- target-company preferences
- preferred language persistence

### `resume`

Owns:
- resume containers
- immutable resume versions
- file upload metadata
- raw parsed text
- extracted resume structures
- resume analysis runs
- resume-tailoring support
- resume heatmap linkage
- resume editor workspace state

### `question`

Owns:
- question catalog
- question detail
- question trees
- reference answers
- learning materials
- resume-based recommendations

### `answer`

Owns:
- answer submission
- answer history
- answer detail
- answer analysis
- score and feedback persistence

### `review`

Owns:
- retry scheduling
- review queue
- archive state
- queue actions such as skip or done

### `dailycard`

Owns:
- home aggregation
- daily recommendation behavior
- daily-card actions

### `feed`

Owns:
- popular and trending slices
- company-related discovery
- recommendation-oriented content slices

### `interview`

Owns:
- mock interview sessions
- follow-up generation behavior
- session progression
- coverage tracking
- resume-map outputs
- practical interview records
- transcript lifecycle
- replay-oriented behavior

### `jobposting`

Owns:
- saved job-posting records
- context for resume-tailoring workflows

### `skill`

Owns:
- radar
- gaps
- progress summaries

## Cross-Cutting Packages

### `common.config`

Owns:
- Spring configuration
- security configuration
- OpenAPI configuration
- CORS setup
- locale resolution and message source configuration

### `common.exception`

Owns:
- global exception translation
- standardized API error behavior

### `common.service`

Owns:
- shared infrastructure helpers
- current-user resolution helpers
- clock and locale utilities

Important rule:
- product rules should not drift into `common` just because multiple domains use them

## Architectural Decisions

### 1. Package by domain

The backend is organized so that one developer can reason about one product capability in one place.

### 2. Immutable source records

Certain records are treated as historical truth:
- resume versions
- answer attempts
- interview session snapshots
- transcript stages

This keeps the system explainable and makes later analytics defensible.

### 3. Additive expansion

New features should mostly:
- add tables
- add nullable columns
- add optional response fields
- add new endpoints

They should not casually rewrite working flows.

### 4. Simple command paths, richer read paths

Write flows should stay transactional and easy to follow.

Read flows may assemble richer multi-table payloads for:
- home
- result analysis
- resume analysis
- review queue
- interview session detail

## Service Boundary Rules

### Locale resolution

The effective locale should resolve in this order:
1. explicit request locale
2. stored user preference
3. `Accept-Language`
4. default `ko`

### Resume source preservation

- uploaded or authored resume source content stays in its original language
- extracted structures may be localized in presentation, but source text should not be overwritten by translated text

### Answer scoring centralization

- answer scoring belongs to the answer pipeline
- interview answers should reuse the same scoring pipeline

### Archive semantics

- archive remains question-level
- archive may carry source metadata such as practice or interview
- interview history must not collapse into archive itself

## Important Flows

### Resume ingestion

```text
upload PDF
-> persist version metadata
-> parse and store raw text
-> extract structured signals
-> expose analysis and subresources
```

### Answer evaluation

```text
submit answer
-> calculate attempt number
-> score answer
-> persist feedback
-> update progress
-> schedule review or archive impact
```

### Mock interview

```text
create session
-> determine resume context and mode
-> persist question snapshots
-> collect answers
-> generate follow-ups when needed
-> expose result and resume coverage outputs
```

### Practical interview replay

```text
upload audio
-> transcription pipeline
-> transcript correction
-> structured extraction
-> interviewer profile derivation
-> replay seed creation
```

## Extension Guidance

New capabilities should prefer existing anchors:
- `resume_versions` for resume intelligence
- answer history for readiness signals
- session question snapshots for interview explainability
- question assets for reusable study content

Avoid these anti-patterns:
- creating a second competing resume aggregate
- storing derived analytics only in frontend state
- putting domain rules into shared utility code without ownership
- creating one-off endpoint shapes that bypass domain boundaries

