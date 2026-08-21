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

### Practice and question detail

Primary endpoints:
- `GET /api/questions`
- `GET /api/questions/{questionId}`
- `GET /api/questions/{questionId}/tree`
- `GET /api/questions/{questionId}/reference-answers`
- `GET /api/questions/{questionId}/learning-materials`
- `GET /api/questions/{questionId}/recommended-followups`
- `GET /api/questions/resume-based`

### Answer and result analysis

Primary endpoints:
- `POST /api/questions/{questionId}/answers`
- `GET /api/questions/{questionId}/answers`
- `GET /api/answer-attempts/{answerAttemptId}`
- `GET /api/answer-attempts/{answerAttemptId}/analysis`

### Review queue and archive

Primary endpoints:
- `GET /api/review-queue`
- `POST /api/review-queue/{queueId}/skip`
- `POST /api/review-queue/{queueId}/done`
- `GET /api/archive`

### Resume

Primary endpoints:
- `GET /api/resumes`
- `GET /api/resumes/latest`
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
- `POST /api/resume-versions/{versionId}/activate`

### Resume tailor, heatmap, and editor

The frontend should treat these as dedicated feature areas, not one overloaded resume page:
- job postings
- analyses and exports
- heatmap links and overlay targets
- editor workspace and revisions

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

## Integration Risk Areas

- leaking raw DTO shapes into many page components
- assuming optional intelligence fields always exist
- scattering endpoint strings or query keys across unrelated files
- coupling one page too tightly to one exact payload revision

