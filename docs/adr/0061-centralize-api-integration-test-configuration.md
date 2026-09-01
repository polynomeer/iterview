# 0061. Centralize API Integration Test Configuration

## Status
Accepted

## Date
2026-09-01

## Context

The API's controller and repository integration tests repeated the same Spring Boot, MockMvc, test profile, PostgreSQL Testcontainers, and real-database configuration. Repetition made it easy for a new integration test to omit a required setting or diverge from the Docker-backed production-like database contract.

## Decision

Define `@ApiIntegrationTest` in the test support package. It composes:

- `@SpringBootTest`
- `@AutoConfigureMockMvc`
- the `test` profile
- `@AutoConfigureTestDatabase(replace = NONE)`
- Docker-aware Testcontainers support
- a deterministic disabled-by-default practical-interview transcription configuration that
  cannot inherit a developer machine's Whisper model or API provider settings

Apply the annotation to the 22 standard API integration tests. Tests with intentional deviations,
such as local-profile bootstrap verification or automatic-transcription behavior, continue to
declare their configuration explicitly. Automatic-transcription integration tests import an
explicit fake extraction client.

## Consequences

Positive:

- New API integration tests inherit one production-like database contract.
- Test configuration changes are maintained in one location.
- Controller and repository integration tests share the same Spring context prerequisites.
- Default integration-test outcomes do not change with host-local transcription credentials or model paths.

Trade-offs:

- Repository tests also receive MockMvc auto-configuration, a small cost accepted in exchange for one consistent context contract.
- Nonstandard integration tests must remain explicit and document why the shared contract does not apply.
- Tests that cover enabled transcription must provide their own deterministic extraction client.
