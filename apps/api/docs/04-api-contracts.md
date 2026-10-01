# 04-api-contracts

This document summarizes the backend API surface in product-oriented groups.

The live source of truth is the runtime OpenAPI document:
- `GET /v3/api-docs`

This file exists to explain structure and intent, not to replace generated API reference.

## API Design Principles

- JSON over HTTP with resource-oriented endpoints
- authenticated routes are separated by behavior, not by a second API namespace
- additive response evolution is preferred over breaking replacements
- product semantics should be visible in endpoint grouping

## Public And Auth Endpoints

### Authentication

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Health

- `GET /api/health`

## User Profile And Settings

Base path:
- `/api/me`

Endpoints:
- `GET /api/me`
- `PATCH /api/me/profile`
- `POST /api/me/profile-image`
- `PATCH /api/me/settings`
- `PUT /api/me/target-companies`
- `GET /api/job-roles` (authenticated): `[{ id, name, parentRoleId }]` sorted by name; `PATCH /api/me/profile` accepts one of these ids as `jobRoleId`

## Home, Daily Card, And Feed

Endpoints:
- `GET /api/home`
- `POST /api/daily-cards/{dailyCardId}/open`
- `GET /api/feed`

## Questions And Learning Content

Base path:
- `/api/questions`

Endpoints:
- `GET /api/questions`
- `GET /api/questions/{questionId}`
- `GET /api/questions/{questionId}/reference-answers`
- `POST /api/questions/{questionId}/reference-answers`
- `GET /api/questions/{questionId}/learning-materials`
- `POST /api/questions/{questionId}/learning-materials`
- `GET /api/questions/{questionId}/tree`
- `GET /api/questions/{questionId}/recommended-followups`
- `GET /api/questions/resume-based`

## Answers And Analysis

Endpoints:
- `POST /api/questions/{questionId}/answers`
- `GET /api/questions/{questionId}/answers`
- `GET /api/answer-attempts/{answerAttemptId}`
- `GET /api/answer-attempts/{answerAttemptId}/analysis`

## Review Queue And Archive

Endpoints:
- `GET /api/review-queue`
- `POST /api/review-queue/{queueId}/skip`
- `POST /api/review-queue/{queueId}/done`
- `GET /api/archive`

## Resume Lifecycle

Base paths:
- `/api/resumes`
- `/api/resume-versions`

Resume endpoints:
- `GET /api/resumes`
- `GET /api/resumes/latest`
- `POST /api/resumes`
- `POST /api/resumes/{resumeId}/versions`
- `POST /api/resumes/{resumeId}/versions/upload`

Resume version endpoints:
- `GET /api/resume-versions/{versionId}`
- `GET /api/resume-versions/{versionId}/extraction`
- `GET /api/resume-versions/{versionId}/profile`
- `GET /api/resume-versions/{versionId}/contacts`
- `GET /api/resume-versions/{versionId}/competencies`
- `GET /api/resume-versions/{versionId}/skills`
- `GET /api/resume-versions/{versionId}/experiences`
- `GET /api/resume-versions/{versionId}/projects`
- `GET /api/resume-versions/{versionId}/achievements` (each item carries `evidence`: `situationText`, `roleText`, `measurementText`, `resultText`, `updatedAt`; null fields are unanswered)
- `PUT /api/resume-versions/{versionId}/achievements/{achievementId}/evidence` (body: the four evidence fields, each at most 2,000 characters; replaces all four, stores blank as null, returns the updated achievement; 404 when the claim is not in that version; ADR 0081)
- `GET /api/resume-versions/{versionId}/education`
- `GET /api/resume-versions/{versionId}/certifications`
- `GET /api/resume-versions/{versionId}/awards`
- `GET /api/resume-versions/{versionId}/risks`
- `GET /api/resume-versions/{versionId}/file`
- `POST /api/resume-versions/{versionId}/re-extract`
- `POST /api/resume-versions/{versionId}/activate`

## Resume Analysis And Tailoring

Base path:
- `/api/resume-versions/{versionId}/analyses`

Endpoints:
- `GET /api/resume-versions/{versionId}/analyses`
- `POST /api/resume-versions/{versionId}/analyses`
- `GET /api/resume-versions/{versionId}/analyses/{analysisId}`
- `PATCH /api/resume-versions/{versionId}/analyses/{analysisId}/suggestions/{suggestionId}`
- `GET /api/resume-versions/{versionId}/analyses/{analysisId}/exports`
- `POST /api/resume-versions/{versionId}/analyses/{analysisId}/exports`
- `GET /api/resume-versions/{versionId}/analyses/{analysisId}/exports/{exportId}/file`

Job posting endpoints:
- `GET /api/job-postings`
- `POST /api/job-postings`
- `GET /api/job-postings/{jobPostingId}`

## Resume Heatmap

Base path:
- `/api/resume-versions/{versionId}/question-heatmap`

Endpoints:
- `GET /api/resume-versions/{versionId}/question-heatmap`
- `GET /api/resume-versions/{versionId}/question-heatmap/overlay-targets`
- `POST /api/resume-versions/{versionId}/question-heatmap/links`
- `PATCH /api/resume-versions/{versionId}/question-heatmap/links/{linkId}`
- `PUT /api/resume-versions/{versionId}/question-heatmap/questions/{interviewRecordQuestionId}/claim`
  - Body: `{ achievementId }`. It narrows the question to that resume claim, or to none when `achievementId` is null.
  - Returns the link, including `achievementId` and `achievementAssigned`.
  - Picking a claim moves the question to the claim's project or experience.
  - 404 when the claim is not in the version. 400 when the claim has no project or experience, or when the question has no resume anchor to keep. (ADR 0084)

Each heatmap question carries `achievementId` and `achievementSource` (`manual`, `heuristic`, or null), which give the claim inside its anchor. The claim comes from a manual pick, then from text matching, then from the parent question (ADR 0084).

## Resume Editor

Base path:
- `/api/resume-versions/{versionId}/editor`

Endpoints:
- `GET /api/resume-versions/{versionId}/editor`
- `PUT /api/resume-versions/{versionId}/editor/document`
- `PATCH /api/resume-versions/{versionId}/editor/document/operations`
- `POST /api/resume-versions/{versionId}/editor/import-markdown`
- `POST /api/resume-versions/{versionId}/editor/comments`
- `PATCH /api/resume-versions/{versionId}/editor/comments/{commentId}`
- `POST /api/resume-versions/{versionId}/editor/comments/{commentId}/replies`
- `POST /api/resume-versions/{versionId}/editor/presence`
- `POST /api/resume-versions/{versionId}/editor/question-cards`
- `PATCH /api/resume-versions/{versionId}/editor/question-cards/{cardId}`
- `POST /api/resume-versions/{versionId}/editor/auto-question-suggestions`
- `POST /api/resume-versions/{versionId}/editor/rewrite-suggestions`
- `GET /api/resume-versions/{versionId}/editor/print-preview`
- `GET /api/resume-versions/{versionId}/editor/revisions`
- `GET /api/resume-versions/{versionId}/editor/revisions/{revisionId}`
- `GET /api/resume-versions/{versionId}/editor/tracked-changes`
- `POST /api/resume-versions/{versionId}/editor/merge-preview`

## Skill Intelligence

Base path:
- `/api/skills`

Endpoints:
- `GET /api/skills/radar`
- `GET /api/skills/gaps`
- `GET /api/skills/progress`

## Mock Interview Sessions

Base path:
- `/api/interview-sessions`

Endpoints:
- `GET /api/interview-sessions`
- `POST /api/interview-sessions`
- `GET /api/interview-sessions/{sessionId}`
- `GET /api/interview-sessions/{sessionId}/coverage`
- `GET /api/interview-sessions/{sessionId}/resume-map`
- `POST /api/interview-sessions/{sessionId}/answers`
- `POST /api/interview-sessions/{sessionId}/skip-question`
- `POST /api/interview-sessions/{sessionId}/next-question`

Replay sessions (`sessionType: replay_mock`):
- require `sourceInterviewRecordId`; `replayMode` is optional and defaults to `original_replay`
- seed session questions from the imported practical-interview questions with `sourceType: replay_seed` and `generationStatus: replay_imported`
- each seeded question carries a non-null `questionId`: imported questions are promoted to private catalog questions (`sourceType: real_interview_import`) and linked before seeding, the same assets `GET /api/interview-records/{recordId}/questions` exposes

## Practical Interview Records

Base path:
- `/api/interview-records`

Endpoints:
- `GET /api/interview-records`
- `POST /api/interview-records`
- `GET /api/interview-records/{recordId}`
- `GET /api/interview-records/{recordId}/transcript`
- `GET /api/interview-records/{recordId}/transcription-status`
- `PATCH /api/interview-records/{recordId}/transcript/segments/{segmentId}`
- `GET /api/interview-records/{recordId}/questions`
- `GET /api/interview-records/{recordId}/review`
- `PATCH /api/interview-records/{recordId}/review`
- `GET /api/interview-records/{recordId}/analysis`
- `GET /api/interview-records/{recordId}/interviewer-profile`
- `POST /api/interview-records/{recordId}/confirm`
- `POST /api/interview-records/{recordId}/retry-transcription`

## Contract Evolution Guidance

- prefer optional additive fields
- prefer new endpoints when the shape meaningfully changes
- preserve existing learning-loop flows
- keep OpenAPI updated and align frontend docs with new fields

## Library (보관함, ADR 0083)

All require sign-in.

- `GET /api/library` returns `{ bookmarks, notes, materials }`:
  - `bookmarks[]`: `{ question, bookmarkedAt, hasNote }`, newest first.
  - `notes[]`: `{ question, body, updatedAt, bookmarked }`, recently edited first.
  - `materials[]`: `{ materialId, title, materialType, sourceName, contentUrl, estimatedMinutes, question }`. These are the learning materials linked to bookmarked or noted questions. Each appears once, under its most relevant saved question.
  - `question` is `{ questionId, title, categoryName, difficultyLevel }`.
- `GET /api/questions/{questionId}/library-state` returns `{ questionId, bookmarked, bookmarkedAt, note: { body, updatedAt } | null }`.
- `PUT /api/questions/{questionId}/bookmark` and `DELETE /api/questions/{questionId}/bookmark` return the library state. Repeating either is a no-op.
- `PUT /api/questions/{questionId}/note` takes `{ body }` (at most 5,000 characters) and returns the library state. A blank body deletes the note.
- An unknown or inactive question returns 404.
