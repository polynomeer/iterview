# 04-api-integration

This document explains how the frontend should consume the backend API without leaking backend details throughout the UI.

## Integration Principles

- JSON is the default transport
- multipart upload is used only where necessary
- typed request and response models should stay explicit
- route constants and endpoint configuration should stay centralized
- additive backend fields should be treated as optional unless guaranteed

## Current Backend Base URL

Local default:
- `http://localhost:8080`

Configured through:
- `VITE_API_BASE_URL`

## Authentication Model

- bearer token authentication
- public routes can consume public endpoints
- protected routes depend on authenticated bootstrap and route guarding

Frontend-critical auth endpoints:
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`

## Integration Layers

### `shared/api`

Owns:
- base API client behavior
- shared request helpers
- endpoint centralization

### `features/*/api`

Owns:
- feature-local request functions
- feature-local React Query hooks
- query invalidation rules

### `entities/*`

Owns:
- mapping backend DTOs into UI-safe models
- absorbing optional-field and additive-evolution complexity

## Screen-To-API Mapping

### Home

Primary endpoint:
- `GET /api/home`

Expectations:
- daily recommendation or summary
- retry-focused sections when present
- additive summary sections without breaking the baseline page

The 오늘 screen shows only values the payload provides: `todayQuestion`, `retryQuestions`, `summaryStats`, `skillRadarPreview`, `resumeRiskPreview`, and `learningMaterials`. Codes such as `difficulty`, `severity`, and `categoryCode` are localized in the UI (`src/shared/lib/labels.ts`). A reason for "why this question today" would need a new field. The screen does not invent one.

### Practice and question detail

Primary endpoints:
- `GET /api/questions`
- `GET /api/questions/{questionId}`
- `GET /api/questions/{questionId}/tree`
- `GET /api/questions/{questionId}/reference-answers`
- `GET /api/questions/{questionId}/learning-materials`
- `GET /api/questions/{questionId}/recommended-followups`
- `GET /api/questions/resume-based`

Field notes (aligned with `apps/api` DTOs on 2026-09-30):
- `GET /api/questions` returns a bare list of `QuestionListItemDto`: `id`, `title`, `difficulty`, `categoryId`, `categoryName`, `companies[]`, `questionType`, …. It has no filter metadata and no per-user progress. The web derives category and difficulty filter options from the items, and filters with `categoryId`, `difficulty`, and `search`.
- `GET /api/questions/{questionId}` returns the difficulty as `question.difficulty`. `difficultyLevel` is only a legacy alias.
- Tree and follow-up `nodeStatus` values are `unanswered`, `weak`, `answered`, and `strong`. They drive the mastery badges.

### Answer and result analysis

Primary endpoints:
- `POST /api/questions/{questionId}/answers`
- `GET /api/questions/{questionId}/answers`
- `GET /api/answer-attempts/{answerAttemptId}`
- `GET /api/answer-attempts/{answerAttemptId}/analysis`

The result screen reads the submitted text from `answerAttempt.contentText` and the raw dimension scores from `score.*Score`. It computes the change since the previous attempt from `GET /api/questions/{questionId}/answers`.

### Review queue and archive

Primary endpoints:
- `GET /api/review-queue`
- `POST /api/review-queue/{queueId}/skip`
- `POST /api/review-queue/{queueId}/done`
- `GET /api/archive`

The review screen sorts and badges items by `scheduledFor` and `priority`, and shows `questionDifficulty`. The archive has no filter metadata, so source and title filtering happen in the browser.

### Current user and settings

- `GET /api/me` returns `profile` (`nickname`, `jobRoleId`, `yearsOfExperience`, image fields), `settings`, `activeResumeVersionSummary`, and `targetCompanies`. It does not return the email or user id, so the settings page hides the email row.
- `PATCH /api/me/profile` takes `nickname`, `jobRoleId`, and `yearsOfExperience`. The settings page offers the roles from `GET /api/job-roles` and shows Korean names for the seeded roles.
- `PATCH /api/me/settings` saves practice goals and `preferredLanguage`. Switching the language on the settings page applies it at once and saves it.
- `PUT /api/me/target-companies` replaces the whole list. The settings page sends the full list on every add or remove.

### Resume

Primary endpoints:
- `GET /api/resumes`
- `GET /api/resumes/latest`
- `POST /api/resumes` (returns the created `ResumeDto`; the first-run upload uses its `id` to upload the first version)
- `POST /api/resumes/{resumeId}/versions/upload`
- `GET /api/resume-versions/{versionId}`
- extraction subresources such as:
  - `/profile`
  - `/contacts`
  - `/competencies`
  - `/skills`
  - `/experiences`
  - `/projects`
  - `/achievements`
  - `/education`
  - `/certifications`
  - `/awards`
  - `/risks`
- `PUT /api/resume-versions/{versionId}/achievements/{achievementId}/evidence`
- `POST /api/resume-versions/{versionId}/activate`
- `POST /api/resume-versions/{versionId}/re-extract`
- `GET /api/resume-versions/{versionId}/file`

The 근거 편집 tab (`ResumeClaimsPage`) lists `/achievements` grouped by project or experience. Each claim's `evidence` fills four fields: 상황, 내 역할, 측정 방법, and 결과 수치. Completeness is derived from the fields on the client. Saving sends all four through `PUT …/evidence` and writes the response back into the snapshot cache. A field also saves when it loses focus. Linked questions come from the heatmap item of the claim's project, or its experience (ADR 0081).

The resume hub reads the version from the URL and polls `GET /api/resume-versions/{versionId}` and `/extraction` while parsing or extraction runs (`useResumeVersionStatus`). When either settles, it refreshes the resume list, the latest resume, the current user, and the version's snapshots. The 개요 tab reads the snapshot subresources. Risks sort by the raw `severity` code, and the tab shows no scores the API does not send.

### Resume tailor, heatmap, and editor

The frontend should treat these as dedicated feature areas, not one overloaded resume page:
- job postings
- analyses and exports
- heatmap links and overlay targets
- editor workspace and revisions

The 공고 맞춤 tab creates a posting with `POST /api/job-postings` (`inputType` `text` or `link`) and then an analysis for the hub's version with `POST /api/resume-versions/{versionId}/analyses` (`{ jobPostingId }`). The analysis detail toggles suggestions and creates PDF exports. The 면접 압박 지도 tab ranks heatmap items by weak answers, follow-ups, pressure questions, and question count. It shows only overlay targets that have at least one linked question.

### Interview and replay

Primary endpoints:
- `GET /api/interview-sessions`
- `POST /api/interview-sessions`
- `GET /api/interview-sessions/{sessionId}`
- `GET /api/interview-sessions/{sessionId}/coverage`
- `GET /api/interview-sessions/{sessionId}/resume-map`
- `POST /api/interview-sessions/{sessionId}/answers`
- `POST /api/interview-sessions/{sessionId}/skip-question`
- `POST /api/interview-sessions/{sessionId}/next-question`
- `GET /api/interview-records`
- `POST /api/interview-records`
- `GET /api/interview-records/{recordId}`
- `GET /api/interview-records/{recordId}/review`
- `PATCH /api/interview-records/{recordId}/review`

Notes:
- The launcher creates `resume_mock` sessions with the active version's `resumeVersionId`, or `review_mock` sessions (pending review questions, no resume) when there is no active version.
- Answer submission sends the session's own `resumeVersionId`, not the currently active version.
- The session and result pages no longer call `/resume-map`; full-coverage sessions read `/coverage` only.
- `POST /api/interview-records` sends `linkedResumeVersionId` (the active version) unless the user opts out.
- A replay (`replay_mock`) started from a record sends that record's `linkedResumeVersionId` as `resumeVersionId`.

## Locale And Content Rules

The frontend should assume:
- machine-readable fields remain locale-neutral
- generated analysis or interview text may vary by locale
- user-authored answers and uploaded resume content remain in the original language

The frontend should therefore avoid:
- assuming all display text is localized in the same way
- rewriting original source text just because surrounding UI language changed

## Loading And Failure Handling

The API should make these frontend states distinguishable:
- unauthenticated
- loading
- empty but valid
- processing
- failed but retryable
- partially available additive data

This is especially important for:
- resume parsing
- resume analysis exports
- interview transcription
- replay review flows

### User-facing error messages

Screens never render `error.message` directly. They call `userFacingErrorMessage(error, fallback)` or `optionalErrorMessage(error, fallback)` from `src/shared/api/errors.ts`:
- `400`, `409`, and `422` responses keep the server message, because it tells the user how to fix their input. The backend should localize these through `X-App-Locale`.
- Every other status, plus network and timeout failures, shows the screen's own localized fallback. Raw text such as "Answer attempt not found: 1" never reaches the UI.
- Screens may branch on specific statuses when the next step differs. For example, the result page shows "not found" with a way back to practice for `404`, and a retry for server errors.
- Login additionally keeps `401` (invalid credentials) and `429` (rate limit) messages.
- Unexpected render errors are caught by the route error boundary. Unknown paths render the not-found page.

## Integration Risk Areas

- leaking raw DTO shapes into many page components
- assuming optional intelligence fields always exist
- scattering endpoint strings or query keys across unrelated files
- coupling one page too tightly to one exact payload revision

## Library (보관함, ADR 0083)

- `GET /api/library` (`useLibraryQuery`) feeds `/library`: saved questions, notes, and linked reading, as three tabs.
- `GET /api/questions/{questionId}/library-state` (`useQuestionLibraryStateQuery`) drives the 저장 toggle and the 노트 tab on a question. The query runs only for signed-in users.
- `PUT`/`DELETE /api/questions/{questionId}/bookmark` and `PUT /api/questions/{questionId}/note` write the response into the state cache and invalidate `queryKeys.library.root`.
- The note saves on blur and on 노트 저장. An in-flight guard stops the blur and the click from sending two saves.
