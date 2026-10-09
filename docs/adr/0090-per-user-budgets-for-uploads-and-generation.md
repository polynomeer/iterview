# 0090. Per-User Hourly Budgets for Uploads and Generation

## Status
Accepted.

## Date
2026-10-09

## Context
Only login had a rate limit (five attempts per email in 15 minutes). The requests that cost the most had none:
- file uploads: resume PDFs, interview audio, profile images;
- requests that may call an LLM or a transcription model: answer evaluation, interview sessions and their answers, resume extraction and re-extraction, tailored analyses, editor suggestions, transcription retries.

A script or a stuck client could repeat any of them without limit. Each repeat costs storage or model calls.

## Decision
- Two request groups each get a per-user budget in a fixed one-hour window: `upload` (20) and `generation` (120). The routes in each group are listed in `RequestRateLimitInterceptor` and in `apps/api/docs/04-api-contracts.md`.
- A Spring MVC interceptor counts requests by the authenticated user's id. Anonymous requests are not counted; authentication rejects them first.
- Past the budget the API answers `429` with `Retry-After` and code `RATE_LIMITED`. The message is localized and gives the wait in minutes. The web app shows that message instead of a screen's generic error, as it already does for `400`/`409`/`422`.
- Counting is in memory (`FixedWindowRateLimiter`), and the login limit now uses the same counter. The budgets are configured through `APP_RATE_LIMIT_{UPLOAD,GENERATION}_{MAX_REQUESTS,WINDOW_SECONDS}`, and `0` turns a group off.

## Consequences
- The budgets sit above ordinary practice: 120 generation requests is one answer every 30 seconds for a full hour.
- Counts reset on restart, and each instance counts on its own. That is acceptable for one node. Running several nodes needs a shared store (the backend backlog keeps this).
- Integration tests share one Spring context and reuse user ids, so `@ApiIntegrationTest` turns both groups off. `RequestRateLimitApiIntegrationTest` turns `generation` back on with a budget of two.
- A new upload or LLM-backed endpoint must be added to a group. Without that it has no budget.
