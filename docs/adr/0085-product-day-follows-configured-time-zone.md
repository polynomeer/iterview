# 0085. The Product Day Follows a Configured Time Zone

## Status
Accepted.

## Date
2026-10-02

## Context
Daily cards are dated by "today". `DailyCardGenerationService` took the UTC date. For a user in Korea, from midnight to 09:00 that is still yesterday, so 오늘 kept serving yesterday's card for the first nine hours of the day. Tests compared that date with PostgreSQL's `current_date`, which follows the session time zone. So they failed only in that window locally, and in a different window in CI.

Users have no stored time zone, and the product is Korean-first (ADR 0080 keeps Korean as the primary locale).

## Decision
- `ClockService.today()` returns the calendar date in a configured zone: `app.time-zone`, set from `APP_TIME_ZONE` and defaulting to `Asia/Seoul`. All "what day is it" logic uses it. Instants stay in UTC.
- Tests compare dates with `ClockService.today()`, never with the database's `current_date`.

## Consequences
- 오늘 rolls over at midnight in Korea.
- Every user shares one day boundary. A per-user time zone would mean storing it on the profile and passing it to `today()`. This decision keeps that path open.
- A deployment serving another region sets `APP_TIME_ZONE`.
