# 0058. Align Kotlin Gradle Plugin With Gradle 9

## Status
Accepted

## Date
2026-09-01

## Context

The API uses Gradle 9.0.0, but Kotlin Gradle Plugin 1.9.25 only officially supports Gradle through 8.1.1. Gradle reported that the older plugin accessed the deprecated `StartParameter.isConfigurationCacheRequested` API, which Gradle will remove in version 10.

## Decision

Upgrade the API's Kotlin JVM, Spring, and JPA plugins together from 1.9.25 to 2.3.10. Kotlin 2.3.10 officially supports Gradle 9.0.0 and removes the observed Gradle 10 deprecation warnings from the API build.

Keep the three Kotlin plugins on the same version because they are parts of one Kotlin Gradle Plugin distribution and must remain compatible.

## Consequences

Positive:

- API builds run on Gradle 9 without the observed Kotlin plugin deprecation warnings.
- The repository has a supported Kotlin-to-Gradle compatibility baseline before a future Gradle 10 upgrade.
- Kotlin JVM, Spring, and JPA compiler plugins remain version-aligned.

Trade-offs:

- Kotlin compiler upgrades can expose future source or plugin compatibility changes, so compile and integration-test verification remains required for subsequent Kotlin upgrades.
- This does not guarantee Gradle 10 compatibility; that decision must wait for a Kotlin Gradle Plugin release that officially supports it.
