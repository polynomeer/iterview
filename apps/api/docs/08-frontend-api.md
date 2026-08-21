# 08-frontend-api

This document explains the backend contract from the frontend's point of view.

## Contract Principles For Frontend Consumers

- route and resource grouping should map to actual user journeys
- additive fields are preferred over breaking replacements
- machine-readable identifiers and enums should remain stable across locales
- optional intelligence fields should not break baseline screens when absent

## Frontend-Critical Endpoint Groups

### Auth bootstrap

Needed for:
- route guards
- session restoration
- login and signup flows

Critical endpoints:
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Home and feed

Critical endpoints:
- `GET /api/home`
- `GET /api/feed`

### Practice and question detail

Critical endpoints:
- `GET /api/questions`
- `GET /api/questions/{questionId}`
- `GET /api/questions/{questionId}/tree`
- `GET /api/questions/{questionId}/reference-answers`
- `GET /api/questions/{questionId}/learning-materials`
- `GET /api/questions/{questionId}/recommended-followups`
- `GET /api/questions/resume-based`

### Answer and result analysis

Critical endpoints:
- `POST /api/questions/{questionId}/answers`
- `GET /api/questions/{questionId}/answers`
- `GET /api/answer-attempts/{answerAttemptId}`
- `GET /api/answer-attempts/{answerAttemptId}/analysis`

### Review queue and archive

Critical endpoints:
- `GET /api/review-queue`
- `POST /api/review-queue/{queueId}/skip`
- `POST /api/review-queue/{queueId}/done`
- `GET /api/archive`

### Resume surfaces

Critical endpoints:
- `GET /api/resumes`
- `GET /api/resumes/latest`
- `POST /api/resumes/{resumeId}/versions/upload`
- `GET /api/resume-versions/{versionId}`
- extraction subresources such as `/skills`, `/projects`, `/risks`
- `POST /api/resume-versions/{versionId}/activate`

### Resume tailoring, heatmap, and editor

Needed for:
- job-posting management
- version-scoped analysis lists and details
- export flows
- heatmap rendering and remap actions
- editor workspace and revisions

### Interview and replay

Critical endpoints:
- `POST /api/interview-sessions`
- `GET /api/interview-sessions/{sessionId}`
- `POST /api/interview-sessions/{sessionId}/answers`
- `GET /api/interview-records/{recordId}`
- `GET /api/interview-records/{recordId}/review`
- `PATCH /api/interview-records/{recordId}/review`

## Frontend Integration Expectations

The backend should continue to support these expectations:
- question-detail views can grow richer without changing the route model
- result-analysis views can consume optional deeper analysis fields
- home can receive new recommendation or risk sections additively
- resume screens can read granular extraction resources independently
- interview pages can render snapshot-driven content without needing extra catalog fetches
- practical interview review screens can trust backend-derived ordering and playback ranges

## Failure And Loading Semantics

The backend should make these states distinguishable:
- not authenticated
- empty but valid result set
- pending processing
- failed processing with retry possibility
- partially available additive data

This is especially important for:
- resume parsing
- resume analyses and exports
- practical interview transcription
- interview generation and coverage data

## Contract Hygiene Rules

- when a new field is optional, document it as optional
- when a new subresource is introduced, prefer a clearly named endpoint
- when one screen depends on locale-aware generated text, preserve machine-readable source fields independently
