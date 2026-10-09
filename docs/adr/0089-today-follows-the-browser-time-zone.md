# 0089. "Today" Follows the Browser's Time Zone

## Status
Accepted. Amends ADR 0085.

## Date
2026-10-09

## Context
ADR 0085 fixed the product day to one configured zone (`app.time-zone`, default `Asia/Seoul`) and left a per-user zone open. That disagreed with the web app itself. 복습 dates, the week strip and "오늘" badges are computed in the browser's local time. A user outside Korea could therefore see a review item marked 오늘 while 오늘's daily card still belonged to the Korean day.

Only one server path depends on the calendar day: dating daily cards. Storing a zone on the profile would add a migration, a settings control and a value that goes stale whenever the user travels.

## Decision
- The web client sends the browser's IANA time zone in an `X-Time-Zone` header on every request, next to `X-App-Locale`.
- `ClockService.today()` uses that zone for the current request. It falls back to `app.time-zone` when the header is missing, unknown, or a bare offset such as `+09:00` or `UTC`. Region names track daylight saving and past offset changes; offsets do not.
- Nothing is stored. Instants stay in UTC.

## Consequences
- The server's day and the browser's day agree, wherever the user is.
- A user who changes time zones may get a new 오늘 card on the new date. Cards are dated by their calendar day, so the earlier card stays with its own date.
- Requests without a browser (scripts, API tests) keep the configured day. Tests that compare dates still use `ClockService.today()`.
- A future background job that needs a user's day would have no request to read. It would need a stored zone, and this header is the natural value to save.
