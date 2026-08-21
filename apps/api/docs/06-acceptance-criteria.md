# 06-acceptance-criteria

Shared acceptance baseline lives in:
- `../../../docs/03-acceptance-baseline.md`

This document adds backend-specific detail.

## Runtime Acceptance

- the application starts with the expected local profile defaults
- Swagger and OpenAPI are reachable in local development when enabled
- the service remains buildable and testable through Gradle
- Flyway migrations apply successfully on a clean database

## Domain Acceptance

### Auth and user

- signup, login, and authenticated bootstrap work
- profile and settings updates persist correctly
- target-company replacement remains deterministic
- preferred language persists and is available for downstream behavior

### Resume

- resume containers and immutable versions remain coherent
- file upload metadata and parse status are stable
- extraction subresources can evolve additively without breaking base version reads
- re-extraction and activation flows preserve version history semantics

### Question and answer

- question list and detail remain available
- answer submission persists immutable attempts
- answer analysis remains traceable to one attempt
- additive learning content does not corrupt the core question model

### Review and archive

- retry scheduling remains durable
- queue mutations such as skip and done are explicit
- archive remains question-level
- archive can safely carry source metadata such as practice or interview

### Interview

- session creation works with explicit resume context where required
- session question snapshots remain reviewable after generation
- session answers reuse the core answer pipeline
- coverage and resume-map outputs remain tied to session evidence
- session history remains distinct from archive

### Practical interview replay

- uploaded records preserve raw processing context
- transcript lifecycle states are explicit
- transcript corrections do not overwrite raw source irreversibly
- replay-supporting outputs remain additive rather than replacing base interview concepts

### Resume analysis, heatmap, and editor

- analyses remain scoped to one resume version
- export generation remains attributable to one analysis
- heatmap overrides do not mutate source interview records
- editor workspace artifacts do not overwrite immutable source resume versions

## Contract Acceptance

- new fields are additive by default
- endpoint grouping remains coherent
- OpenAPI reflects meaningful contract changes
- frontend-facing payloads remain explainable without hidden state assumptions

## Operational Acceptance

- local setup remains documented
- environment-variable requirements remain clear
- root verification scripts continue to work after backend changes

