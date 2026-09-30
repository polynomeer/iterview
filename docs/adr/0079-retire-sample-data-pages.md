# 0079. Retire the Sample-Data Pages

## Status
Accepted.

## Date
2026-09-30

## Context
Five pages rendered hard-coded sample data instead of API data: `/weak-nodes`, `/scheduled-reviews`, `/target-companies`, `/notes`, and `/bookmarks`. The 2026-09 audit (`docs/09-ux-audit-and-redesign-proposal.md`, problem 4) rated them P0 because they show invented questions, scores, and companies as if they were the user's own. Phase 2 removed them from navigation but left the pages reachable at their old URLs until APIs existed. No notes or bookmarks API exists yet. The real features they imitated have since shipped elsewhere:
- 복습 (`/review`) lists due and weak questions.
- 설정 (`/settings`) edits the real target-company list (`/api/me/target-companies`).

## Decision
- Delete the five pages, their tests, and their routes.
- Keep the old URLs working as redirects:
  - `/weak-nodes` and `/scheduled-reviews` → `/review`
  - `/target-companies` → `/settings`
  - `/notes` and `/bookmarks` → `/questions`
- The 보관함 area (ADR 0074) stays unshipped until notes and bookmarks have APIs. It will be built from API data, not from these pages.

## Consequences
- No screen shows invented data as the user's own.
- The legacy CSS and strings that only these pages used can be deleted.
- Notes and bookmarks need a backend design before 보관함 can ship. That work needs its own ADR.
