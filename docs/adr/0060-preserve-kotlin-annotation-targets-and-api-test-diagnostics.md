# 0060. Preserve Kotlin Annotation Targets And API Test Diagnostics

## Status
Accepted

## Date
2026-09-01

## Context

Upgrading the API to Kotlin Gradle Plugin 2.3.10 surfaced warnings for primary-constructor property annotations. Kotlin's newer annotation target rules can change where annotations are emitted after recompilation, which is risky for Spring constructor injection configuration that previously used the original target behavior.

The API test suite also contains 22 Testcontainers integration tests. Its default Gradle output did not show successful test progress, making a long-running Docker-backed execution appear stalled.

## Decision

Configure Kotlin with `-Xannotation-default-target=first-only` to preserve the existing annotation target behavior until each affected annotation is deliberately migrated with an explicit use-site target.

Configure Gradle test logging to report passed, skipped, and failed tests, with full exception details for failures.

## Consequences

Positive:

- Kotlin upgrades do not silently change Spring-related constructor annotation placement.
- API test progress is visible in local and CI logs, including Testcontainers integration tests.
- Test failures include full exception information without a second diagnostic run.

Trade-offs:

- The annotation default is an explicit compatibility policy that must be revisited before adopting Kotlin's new default targeting behavior.
- Successful API test logs are more verbose, which is intentional for a container-backed suite.
