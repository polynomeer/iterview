# 04-api-integration

## API Conventions
- JSON only
- file upload endpoints may use `multipart/form-data`
- typed request and response models
- route constants must be centralized
- query keys must be centralized
- additive fields should be optional for backward compatibility
- existing minimal responses must remain valid while richer product intelligence is added

## Overview

Base URL:

- local: `http://localhost:8080`

Formats:

- REST JSON
- timestamps use ISO-8601 strings
- numeric score fields are in the `0-100` range unless documented otherwise
- localized display text initially supports `ko` and `en`

Authentication:

- bearer token: `Authorization: Bearer <token>`
- public endpoints:
  - `GET /api/health`
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
  - `GET /api/questions`
  - `GET /api/questions/{questionId}`
- authenticated endpoints:
  - `GET /api/auth/me`
  - `GET /api/me`
  - `PATCH /api/me/profile`
  - `PATCH /api/me/settings`
  - `PUT /api/me/target-companies`
  - `GET /api/resumes`
  - `POST /api/resumes`
  - `POST /api/resumes/{resumeId}/versions`
  - `POST /api/resumes/{resumeId}/versions/upload`
  - `GET /api/resume-versions/{versionId}`
  - `GET /api/resume-versions/{versionId}/file`
  - `POST /api/resume-versions/{versionId}/activate`
  - `GET /api/home`
  - `POST /api/daily-cards/{dailyCardId}/open`
  - `POST /api/questions/{questionId}/answers`
  - `GET /api/questions/{questionId}/answers`
  - `GET /api/answer-attempts/{answerAttemptId}`
  - `GET /api/review-queue`
  - `POST /api/review-queue/{queueId}/skip`
  - `POST /api/review-queue/{queueId}/done`
  - `GET /api/archive`
  - `GET /api/feed`
- `GET /api/interview-sessions`
- `POST /api/interview-sessions`
- `GET /api/interview-sessions/{sessionId}`
- `POST /api/interview-sessions/{sessionId}/answers`
- `POST /api/interview-sessions/{sessionId}/skip-question`
- `POST /api/interview-sessions/{sessionId}/next-question`

Implemented additive endpoints relevant to the updated product direction:

- `POST /api/resumes/{resumeId}/versions/upload`
- `GET /api/resume-versions/{versionId}`
- `GET /api/resume-versions/{versionId}/file`
- `GET /api/job-postings`
- `POST /api/job-postings`
- `GET /api/job-postings/{jobPostingId}`
- `GET /api/resume-versions/{versionId}/analyses`
- `POST /api/resume-versions/{versionId}/analyses`
- `GET /api/resume-versions/{versionId}/analyses/{analysisId}`
- `PATCH /api/resume-versions/{versionId}/analyses/{analysisId}/suggestions/{suggestionId}`
- `GET /api/resume-versions/{versionId}/analyses/{analysisId}/exports`
- `POST /api/resume-versions/{versionId}/analyses/{analysisId}/exports`
- `GET /api/resume-versions/{versionId}/analyses/{analysisId}/exports/{exportId}/file`
- `GET /api/resume-versions/{versionId}/profile`
- `GET /api/resume-versions/{versionId}/contacts`
- `GET /api/resume-versions/{versionId}/competencies`
- `GET /api/resume-versions/{versionId}/projects`
- `GET /api/questions/{questionId}/reference-answers`
- `GET /api/questions/{questionId}/learning-materials`
- `GET /api/questions/{questionId}/tree`
- `GET /api/questions/{questionId}/recommended-followups`
- `GET /api/questions/resume-based`
- `GET /api/answer-attempts/{answerAttemptId}/analysis`
- `GET /api/skills/radar`
- `GET /api/skills/gaps`
- `GET /api/skills/progress`
- archive fields now available: `sourceType`, `sourceLabel`, `sourceSessionId`, `sourceSessionQuestionId`, `isFollowUp`
- interview session question snapshots now include additive fields: `bodyText`, `tags`, `focusSkillNames`, `resumeContextSummary`, `generationRationale`, `generationStatus`, `llmModel`, `llmPromptVersion`
- additive session-question evidence field: `resumeEvidence[]`
- additive interview-session planning field: `interviewMode`
- frontend should render session snapshots from these fields first and only treat `questionId` as an optional deep-link key
- for `resume_mock`, frontend should send one explicit `resumeVersionId` during session creation instead of silently assuming the latest active resume
- the opening interview question may be AI-generated from project or experience resume context and therefore should be rendered from the same session snapshot fields used for AI follow-ups
- `GET /api/interview-sessions/{sessionId}/resume-map` should be joined with parsed resume section APIs such as `/projects` and `/experiences` for full-coverage result rendering
- use `sourceRecordType` + `sourceRecordId` as the stable join key from the result map back into structured resume sections
- prefer a structured resume viewer over raw PDF-coordinate highlighting in the first implementation
- the completed `full_coverage` result route should load session detail, coverage, resume-map, parsed experiences, and parsed projects together before rendering the split resume/question viewer
- additive session-summary facet fields such as `facetSummaries`, `weakFacetSummaries`, and `skippedFacetSummaries` should drive in-session and result-time recovery panels without recomputing facets from raw evidence
- `generationStatus = coverage_extended` should be rendered as a subtle revisit/deep-dive hint rather than a new backend-defined badge field

Implemented practical interview replay integration:
- add authenticated resources for:
  - real interview upload
  - transcript lifecycle handling for `pending`, `processing`, `failed`, and `confirmed`
  - retry transcription via `POST /api/interview-records/{recordId}/retry-transcription`
  - transcript review and correction
  - structured question/answer review
  - interviewer-profile read
  - replay simulation start via `sessionType = replay_mock`
  - review overview, lane dashboard, transcript review, question review, thread review, confirm, and replay readiness rendering from `GET /api/interview-records/{recordId}/review`
- practical interview upload keeps `transcriptText` optional and supports both:
  - audio + manual transcript
  - audio-only upload with backend automatic transcription
- practical interview detail polling should continue while transcript status is `pending` or `processing`, and stop once the record becomes `confirmed` or `failed`
- practical interview transcript, question, and review reads may now include additive replay metadata such as:
  - root `playback`
  - `questionRange`
  - `answerRange`
  - `questionAnswerRange`
  - `threadRange`
  - `seekRange`
  - transcript `timestampLabel`
- frontend should reuse one shared audio player per practical interview detail workspace and seek with the backend-provided timestamp ranges instead of reconstructing clip windows from transcript segment ids when those additive fields are present
- keep imported real-interview records distinct from interactive mock-session resources in the API client and query keys
- reuse the existing interview-session queries for `replay_mock` runs once the backend exposes that additive session type
- imported real-interview questions should be treated as question-level study assets and may later surface in archive with distinct source metadata

Implemented resume-tailoring integration:
- save job postings from either pasted text or source links
- let the backend own link-fetch metadata such as `fetchStatus`, `fetchedTitle`, and `fetchErrorMessage`
- create persisted analyses per immutable resume version
- render additive analysis-layer suggestions without implying the source version changed
- render `tailoredDocument` as the primary preview source instead of reconstructing the preview from raw suggestions
- create and list server-side PDF exports from the persisted tailored document
- download saved export files through the dedicated export-file endpoint
- reuse parsed resume-version snapshot endpoints for source-context comparison next to the tailored preview

Implemented resume interview heatmap integration:
- read one additive heatmap with `GET /api/resume-versions/{versionId}/question-heatmap`
- read flattened hover/remap overlay targets with `GET /api/resume-versions/{versionId}/question-heatmap/overlay-targets`
- create or replace one manual remap with `POST /api/resume-versions/{versionId}/question-heatmap/links`
- update one known manual remap with `PATCH /api/resume-versions/{versionId}/question-heatmap/links/{linkId}`
- pass additive server filters directly through the shared query layer:
  - `scope`
  - `weakOnly`
  - `companyName`
  - `interviewDateFrom`
  - `interviewDateTo`
  - `targetType`
- render backend-provided `heatScore`, `normalizedHeatLevel`, filter-summary counts, and linked-question counts directly instead of recomputing heat or filter chips on the client
- support nested or flattened overlay target rendering for `block`, `sentence`, `phrase`, and `keyword` targets without assuming PDF coordinates
- reuse parsed resume snapshots as the valid remap anchor source for `project`, `experience`, `skill`, `competency`, and `summary`
- when saving one manual remap, allow the frontend to pin both:
  - the destination anchor
  - the optional specific overlay target fields returned by the flattened overlay-target read
- preserve enough query-state in heatmap links so other frontend flows can open one focused anchor or follow-up-heavy slice without recomputing filters client-side

Implemented resume editor integration:
- bootstrap and read one workspace with `GET /api/resume-versions/{versionId}/editor`
- save the current draft document with `PUT /api/resume-versions/{versionId}/editor/document`
- import markdown with `POST /api/resume-versions/{versionId}/editor/import-markdown`
- create/update additive comment threads and replies through the editor comment endpoints
- create/update additive question cards through the editor question-card endpoints
- request deterministic question suggestions and rewrite suggestions through the editor suggestion endpoints without persisting them automatically
- send lightweight presence heartbeats through `POST /api/resume-versions/{versionId}/editor/presence`
- read server-side print preview, revision history, tracked changes, and merge preview through the dedicated editor endpoints
- keep `baseRevisionNo` on document writes so stale-write recovery can fall back to `POST /api/resume-versions/{versionId}/editor/merge-preview`

Planned resume editor V2 integration, which requires backend API changes beyond the current runtime OpenAPI:
- keep `GET /api/resume-versions/{versionId}/editor` as the main workspace read, but extend it with additive fields such as:
  - `documentModel = rich_tree`
  - `document.rootNodeId`
  - `document.nodes[]`
  - `document.tableOfContents[]`
  - `selectionCapabilities`
  - `contextMenuActions`
- add `PATCH /api/resume-versions/{versionId}/editor/document/operations` for granular Notion-like edits such as:
  - text insert, replace, delete
  - block split, merge, move, duplicate, remove
  - nested block indent and outdent
  - slash-command block-type conversion
  - inline mark add, update, remove
- keep `PUT /editor/document` as a coarse full-document save fallback for import, merge acceptance, or bulk replacement
- broaden additive comment, question-card, and suggestion payloads so they can target one rich selection anchor instead of only one flat block:
  - `nodeId`
  - `parentNodeId`
  - `fieldPath`
  - `selectionStartOffset`
  - `selectionEndOffset`
  - `anchorQuote`
  - `anchorPath`
  - `sentenceIndex`
  - `selectedText`
- extend presence payloads to optionally carry one selection anchor or focused node id
- extend revision and tracked-change reads so revision compare can render before/after rich nodes instead of only flattened block text
- extend merge-preview reads so conflicts can identify node-level edits, moved blocks, and overlapping text selections

Planned V2 rich document DTOs:
- `ResumeEditorNodeDto`
  - `nodeId`
  - `parentNodeId`
  - `nodeType`
  - `text`
  - `textRuns[]`
  - `children[]`
  - `collapsed`
  - `depth`
  - `sourceAnchorType`
  - `sourceAnchorRecordId`
  - `sourceAnchorKey`
  - `fieldPath`
  - `displayOrder`
  - `metadata`
- `ResumeEditorTextRunDto`
  - `text`
  - `marks[]`
- `ResumeEditorSelectionAnchorDto`
  - `nodeId`
  - `anchorPath`
  - `selectionStartOffset`
  - `selectionEndOffset`
  - `selectedText`
  - `anchorQuote`
  - `sentenceIndex`
  - `fieldPath`
- `ResumeEditorDocumentOperationDto`
  - `opId`
  - `type`
  - `nodeId`
  - `parentNodeId`
  - `index`
  - `textRange`
  - `payload`
- `PatchResumeEditorDocumentOperationsRequest`
  - `operations[]`
  - `baseRevisionNo`
  - `changeSource`
  - `clientSessionKey`
  - `clientChangeId`

Frontend integration rule for the editor should therefore become:
1. if the workspace exposes `documentModel = rich_tree` and operation capabilities, prefer one document-centered editor surface with contextual popovers
2. otherwise fall back to the current markdown or block-oriented editor implementation

Source of truth priority for frontend implementation:
1. runtime OpenAPI: `GET /v3/api-docs`
2. checked-in backend snapshot: `../iterview-api/docs/openapi/frontend-integration.yaml`
3. backend integration guide: `../iterview-api/docs/08-frontend-api.md`

Localization rules for API consumption:
- send `X-App-Locale` from the active app locale when the frontend needs an explicit localized response
- allow backend fallback behavior through saved preference or `Accept-Language`, but keep the explicit app locale header centralized in the shared client
- treat machine-readable fields such as `status`, `sourceType`, and error `code` as locale-neutral
- treat localized labels and system-generated text as request-locale dependent
- preserve user-authored content in the original language when rendering resume sections, evidence snippets, and answer text
- support mixed-language UI safely, for example English interface chrome around Korean resume evidence text
- in a full-coverage result view, highlight structured project and experience blocks by `coverageStatus` and show related questions on hover or click without mutating the underlying resume text

## Standard Error Response

All error responses use this shape:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "status": 400,
    "message": "Request validation failed",
    "path": "/api/auth/signup",
    "timestamp": "2026-03-09T04:00:00Z",
    "details": [
      {
        "field": "email",
        "message": "must be a well-formed email address"
      }
    ]
  }
}
```

Common error codes:

- `VALIDATION_ERROR` for bean validation failures
- `BAD_REQUEST` for domain validation failures
- `UNAUTHORIZED` for missing or invalid authentication
- `FORBIDDEN` for access denial
- `NOT_FOUND` for missing resources
- `CONFLICT` for state transition conflicts
- `INTERNAL_SERVER_ERROR` for unexpected server errors

## Domain Data Model
The frontend currently depends on a smaller subset of fields, but the updated product direction requires additive support for the following domain concepts.

### User and Profile

```text
User
- id
- email
- status
- nickname
- jobRole
- yearsOfExperience

UserSettings
- targetScoreThreshold
- passScoreThreshold
- retryEnabled
- dailyQuestionCount

UserTargetCompany
- userId
- companyId
- priorityOrder
```

Recommended additive fields:

```text
UserSkillProfile
- userId
- skillCode
- currentScore
- confidence
- gapScore
- evidenceCount
- updatedAt
```

### Resume and Resume Intelligence

```text
Resume
- id
- userId
- title

ResumeVersion
- id
- resumeId
- versionNumber
- fileName
- fileUrl
- fileType
- fileSizeBytes
- summaryText
- parsingStatus
- parseStartedAt
- parseCompletedAt
- parseErrorMessage
- isActive
- uploadedAt
```

Recommended additive entities:

```text
ResumeSkill
- id
- resumeVersionId
- skillCode
- skillName
- categoryCode
- confidence
- sourceExcerpt
- isConfirmed

ResumeExperience
- id
- resumeVersionId
- title
- summary
- impactText
- sourceExcerpt
- isConfirmed

ResumeRisk
- id
- resumeVersionId
- riskType
- title
- description
- severity
- relatedSkillCode
```

Resume upload integration rules:
- create container first with `POST /api/resumes` if the user has no resume container yet
- use `POST /api/resumes/{resumeId}/versions/upload` for real PDF upload flows
- use `POST /api/resumes/{resumeId}/versions` only for imported metadata, tests, or fallback admin-style flows
- after upload, poll `GET /api/resume-versions/{versionId}` using `parsingStatus`
- only fetch skills, experiences, and risks once parsing is `completed`
- if parsing is `failed`, keep the version visible and render retry guidance rather than hiding it
- project payloads now include additive metadata such as `contentText`, `projectCategoryCode`, `projectCategoryName`, and `tags`
- project tags should be rendered as stable chips; missing category or tags should degrade gracefully

### Interview Session and Archive Source Metadata

```text
InterviewSession
- sessionId
- sessionType
- resumeVersionId
- status
- startedAt
- completedAt
- questionCount
- answeredCount
- averageScore

InterviewSessionQuestion
- sessionQuestionId
- sessionId
- questionId
- parentSessionQuestionId
- promptText
- contentLocale
- isFollowUp
- displayOrder
- depth
- resumeEvidence

Recommended additive nested entity:
- `ResumeEvidenceItem`
  - `type`
  - `section`
  - `label`
  - `snippet`
  - `sourceRecordType`
  - `sourceRecordId`
  - `confidence`

ArchiveItem
- questionId
- title
- archivedAt
- bestScore
- totalAttemptCount
- sourceType
- sourceLabel
- sourceSessionId
- sourceSessionQuestionId

Recommended interview-start integration:
- fetch available resume containers and versions before opening the Interview start UI
- require one resume-version choice for `resume_mock`
- when interview mode support is available, let the user choose `quick_screen`, `mock_30`, `mock_60`, `free_interview`, or `full_coverage`
- create the session with `POST /api/interview-sessions`
- navigate to the returned session detail and render the opening question from snapshot data immediately
- when `resumeEvidence` is available, render a compact `Based on your resume` block with one or two short snippets
- treat current interview grounding as project- and experience-focused rather than implying all parsed resume sections are questioned equally
- treat archive as a question-level mirror of the asked session turns, not as the session list itself
- isFollowUp
```

Integration rules:
- interview history is session-level and separate from archive
- `resumeEvidence` is supporting context only and should not replace the main prompt title
- `resumeEvidence.section` should cleanly support `project` and `experience`, while degrading safely for unexpected future values
- `contentLocale` should be treated as metadata for generated interview text and should not trigger client translation of `title`, `bodyText`, `generationRationale`, or `resumeContextSummary`
- `next-question` is advance-only and should be called only after the current question has been answered or skipped
- `skip-question` is the supported bypass action for the current prompt and should use the backend endpoint instead of local fake state
- session summary should surface `answeredQuestions`, `skippedQuestions`, and `remainingQuestions` distinctly when available
- submitting an interview answer should keep the user on the session route while the session status remains `in_progress`
- the frontend should only transition to the final interview result route once the session status becomes `completed`
- archive remains question-level even when a question originated inside an interview session
- `full_coverage` should treat resume coverage as coverage of structured project and experience evidence items, not raw full-text character highlighting
- planned additive result APIs such as `/api/interview-sessions/{sessionId}/coverage` and `/api/interview-sessions/{sessionId}/resume-map` should drive hover and click interactions in the result-time resume viewer
- AI-generated follow-up questions may still have a `questionId`, but frontend should treat session snapshot fields as authoritative for rendering
- frontend should render `Practice` and `Interview` badges from source metadata instead of inferring from route context
- recommended timeline rendering order is `orderIndex`, with `parentSessionQuestionId` and `depth` used for indentation or connector UI

### Question and Knowledge Structure

```text
Question
- id
- title
- body
- category
- difficulty
- status
```

Recommended additive entities:

```text
QuestionRelation
- parentQuestionId
- childQuestionId
- relationType
- depth
- displayOrder

QuestionSkillLink
- questionId
- skillCode
- weight

QuestionResumeLink
- questionId
- resumeVersionId
- relevanceReason
- relevanceScore

QuestionReferenceAnswer
- id
- questionId
- title
- answerText
- answerFormat
- sourceType
- isOfficial
- displayOrder

QuestionLearningMaterial
- id
- questionId
- title
- materialType
- description
- contentUrl
- sourceName
- difficultyLevel
- estimatedMinutes
- isOfficial
- displayOrder
```

Question reference-content integration rules:
- keep model answers separate from the current user's answer attempts and result history
- render backend baseline answers, imported real-interview summaries, and user-added notes as distinct source-aware reference content, never as if the user submitted them
- prefer dedicated question reference-content endpoints when building study sections
- treat question detail `learningMaterials` and `referenceAnswers` as additive convenience fields, not the only source
- allow authenticated users to append private reference answers and private learning materials through the dedicated POST endpoints

### Answer Analysis and Review

```text
AnswerAttempt
- id
- userId
- questionId
- resumeVersionId
- answerMode
- contentText
- submittedAt

AnswerScore
- answerAttemptId
- totalScore
- structure
- specificity
- technicalAccuracy
- roleFit
- companyFit
- communication
- evaluationResult

ReviewQueueItem
- id
- userId
- questionId
- reasonType
- priority
- scheduledAt
- status
```

Recommended additive entities:

```text
AnswerSkillImpact
- answerAttemptId
- skillCode
- previousScore
- newScore
- delta

AnswerWeakPattern
- answerAttemptId
- dimensionCode
- severity
- explanation
```

## Health

### GET /api/health

Auth:

- public

Response:

```json
{
  "status": "ok"
}
```

## Authentication

### POST /api/auth/signup

Auth:

- public

Request:

```json
{
  "email": "candidate@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "accessToken": "<jwt>",
  "tokenType": "Bearer",
  "user": {
    "id": 1,
    "email": "candidate@example.com",
    "status": "ACTIVE"
  }
}
```

### POST /api/auth/login

Auth:

- public

Request:

```json
{
  "email": "candidate@example.com",
  "password": "password123"
}
```

Response:

- same shape as `POST /api/auth/signup`

### GET /api/auth/me

Auth:

- required

Response:

```json
{
  "id": 1,
  "email": "candidate@example.com"
}
```

## Profile

### GET /api/me

Auth:

- required

Response:

```json
{
  "profile": {
    "nickname": "hammac",
    "jobRoleId": 1,
    "yearsOfExperience": 5
  },
  "settings": {
    "targetScoreThreshold": 80,
    "passScoreThreshold": 60,
    "retryEnabled": true,
    "dailyQuestionCount": 1
  },
  "activeResumeVersionSummary": {
    "resumeId": 10,
    "resumeTitle": "Platform Resume",
    "versionId": 22,
    "versionNo": 2,
    "uploadedAt": "2026-03-09T04:00:00Z"
  },
  "targetCompanies": [
    {
      "companyId": 1,
      "companyName": "Amazon",
      "priorityOrder": 1
    }
  ],
  "skillRadarSummary": {
    "readinessScore": 71,
    "updatedAt": "2026-03-09T04:00:00Z"
  },
  "gapSummary": {
    "topGapSkillCodes": ["system-design", "distributed-systems"]
  }
}
```

Notes:

- `skillRadarSummary` and `gapSummary` are optional additive fields
- the current frontend can continue using the existing subset without these fields

### PATCH /api/me/profile

Auth:

- required

Request:

```json
{
  "nickname": "hammac",
  "jobRoleId": 1,
  "yearsOfExperience": 5
}
```

Response:

```json
{
  "nickname": "hammac",
  "jobRoleId": 1,
  "yearsOfExperience": 5
}
```

### PATCH /api/me/settings

Auth:

- required

Request:

```json
{
  "targetScoreThreshold": 85,
  "passScoreThreshold": 65,
  "retryEnabled": true,
  "dailyQuestionCount": 2
}
```

Response:

```json
{
  "targetScoreThreshold": 85,
  "passScoreThreshold": 65,
  "retryEnabled": true,
  "dailyQuestionCount": 2
}
```

Notes:

- `passScoreThreshold` must not exceed `targetScoreThreshold`

### PUT /api/me/target-companies

Auth:

- required

Request:

```json
{
  "companies": [
    {
      "companyId": 2,
      "priorityOrder": 1
    },
    {
      "companyId": 1,
      "priorityOrder": 2
    }
  ]
}
```

Response:

```json
{
  "companies": [
    {
      "companyId": 2,
      "companyName": "Google",
      "priorityOrder": 1
    },
    {
      "companyId": 1,
      "companyName": "Amazon",
      "priorityOrder": 2
    }
  ]
}
```

Notes:

- duplicate `companyId` values are rejected
- invalid `companyId` values are rejected

## Resume

### GET /api/resumes

Auth:

- required

Response:

```json
[
  {
    "id": 10,
    "title": "Platform Resume",
    "isPrimary": true,
    "versions": [
      {
        "id": 21,
        "versionNo": 1,
        "fileName": "resume-v1.pdf",
        "fileUrl": "https://files.example.com/resume-v1.pdf",
        "rawText": "Resume text",
        "parsedJson": "{\"skills\":[\"kotlin\"]}",
        "summaryText": "First version",
        "isActive": false,
        "uploadedAt": "2026-03-09T04:00:00Z",
        "parsingStatus": "completed"
      }
    ]
  }
]
```

Notes:

- current frontend only requires `id`, `title`, and basic version metadata
- `parsingStatus` is an additive field for resume intelligence flows

### POST /api/resumes

Auth:

- required

Request:

```json
{
  "title": "Platform Resume",
  "isPrimary": true
}
```

Response:

- `ResumeDto` object, same shape as one list item from `GET /api/resumes`

### POST /api/resumes/{resumeId}/versions

Auth:

- required

Request:

```json
{
  "fileName": "resume-v2.pdf",
  "fileUrl": "https://files.example.com/resume-v2.pdf",
  "rawText": "Version two text",
  "parsedJson": "{\"skills\":[\"kotlin\",\"spring\"]}",
  "summaryText": "Second version"
}
```

Response:

```json
{
  "id": 22,
  "versionNo": 2,
  "fileName": "resume-v2.pdf",
  "fileUrl": "https://files.example.com/resume-v2.pdf",
  "rawText": "Version two text",
  "parsedJson": "{\"skills\":[\"kotlin\",\"spring\"]}",
  "summaryText": "Second version",
  "isActive": false,
  "uploadedAt": "2026-03-09T04:00:00Z",
  "parsingStatus": "queued"
}
```

### POST /api/resume-versions/{versionId}/activate

Auth:

- required

Response:

```json
{
  "resumeId": 10,
  "versionId": 22,
  "versionNo": 2,
  "activatedAt": "2026-03-09T04:00:00Z"
}
```

### GET /api/resume-versions/{versionId}

Auth:

- required

Purpose:

- retrieve one resume version with parse status and summary metadata

### GET /api/resume-versions/{versionId}/analysis

Auth:

- required

Response:

```json
{
  "resumeVersionId": 22,
  "skills": [
    {
      "skillCode": "spring",
      "skillName": "Spring",
      "categoryCode": "backend",
      "confidence": 0.93,
      "sourceExcerpt": "Built Spring Boot APIs"
    }
  ],
  "experiences": [
    {
      "id": 1,
      "title": "Payments migration",
      "summary": "Migrated payment core services",
      "impactText": "Reduced timeout incidents by 30%"
    }
  ],
  "risks": [
    {
      "id": 1,
      "riskType": "claim_depth",
      "title": "Architecture ownership claim may need defense",
      "severity": "medium"
    }
  ]
}
```

Notes:

- use this endpoint for parsed resume insight screens
- keep `GET /api/resumes` lightweight enough for current list and activation flows

## Questions

### GET /api/questions

Auth:

- public

Query parameters:

- `categoryId`
- `tag`
- `companyId`
- `roleId`
- `difficulty`
- `status`
- `search`
- `resumeVersionId` optional additive filter
- `skillCode` optional additive filter

Notes:

- inactive questions are excluded by default
- `tag`, `difficulty`, and `status` are matched case-insensitively
- `resumeVersionId` and `skillCode` should narrow or rank results, not break default browsing

Response:

```json
[
  {
    "id": 100,
    "title": "Design a resilient queue",
    "category": "System Design",
    "difficulty": "HARD",
    "status": "improving",
    "tags": [
      {
        "id": 1,
        "name": "scalability"
      }
    ],
    "companies": [
      {
        "id": 1,
        "name": "Amazon",
        "relevanceScore": 0.9,
        "pastFrequent": true,
        "trendingRecent": true
      }
    ],
    "learningMaterials": [
      {
        "id": 5,
        "title": "Queue Design Guide",
        "materialType": "article",
        "contentUrl": "https://example.com/queue-guide",
        "sourceName": "Eng Blog"
      }
    ],
    "resumeRelevance": {
      "score": 0.82,
      "reason": "Matches active resume project keywords"
    },
    "relatedSkillCodes": ["system-design", "messaging"]
  }
]
```

### GET /api/questions/{questionId}

Auth:

- public

Response:

```json
{
  "question": {
    "id": 100,
    "title": "Design a resilient queue",
    "body": "Explain throughput, durability, and backpressure",
    "categoryId": 1,
    "categoryName": "System Design",
    "questionType": "technical",
    "difficultyLevel": "HARD",
    "qualityStatus": "approved",
    "expectedAnswerSeconds": 300
  },
  "tags": [],
  "companies": [],
  "roles": [],
  "learningMaterials": [],
  "userProgressSummary": {
    "currentStatus": "in_progress",
    "latestScore": 72.5,
    "bestScore": 81.0,
    "totalAttemptCount": 3,
    "lastAnsweredAt": "2026-03-09T04:00:00Z",
    "nextReviewAt": "2026-03-11T04:00:00Z",
    "masteryLevel": "intermediate"
  },
  "relatedSkills": [
    {
      "skillCode": "system-design",
      "label": "System Design"
    }
  ],
  "treeSummary": {
    "rootQuestionId": 100,
    "totalNodes": 5,
    "answeredNodes": 2,
    "maxDepth": 2
  }
}
```

Notes:

- `userProgressSummary` is only included when the request is authenticated
- `relatedSkills` and `treeSummary` are additive fields that support question-tree and gap-aware UI

### GET /api/questions/{questionId}/tree

Auth:

- public or authenticated

Response:

```json
{
  "rootQuestionId": 100,
  "nodes": [
    {
      "questionId": 100,
      "title": "Design a resilient queue",
      "depth": 0,
      "parentQuestionId": null,
      "status": "answered"
    },
    {
      "questionId": 101,
      "title": "How would you handle poison messages?",
      "depth": 1,
      "parentQuestionId": 100,
      "status": "unanswered"
    }
  ]
}
```

## Home

### GET /api/home

Auth:

- required

Response:

```json
{
  "todayQuestion": {
    "dailyCardId": 15,
    "questionId": 100,
    "title": "Design a resilient queue",
    "difficulty": "HARD",
    "cardDate": "2026-03-09",
    "cardType": "retry",
    "status": "new"
  },
  "retryQuestions": [
    {
      "reviewQueueId": 31,
      "questionId": 101,
      "title": "Explain cache invalidation",
      "difficulty": "MEDIUM",
      "priority": 80,
      "scheduledFor": "2026-03-09T04:00:00Z"
    }
  ],
  "learningMaterials": [],
  "summaryStats": {
    "dailyQuestionCount": 1,
    "retryQuestionCount": 1,
    "pendingReviewCount": 1,
    "archivedQuestionCount": 2
  },
  "skillRadarPreview": [
    {
      "skillCode": "database",
      "label": "Database",
      "score": 78
    }
  ],
  "skillGapPreview": [
    {
      "skillCode": "distributed-systems",
      "label": "Distributed Systems",
      "gapScore": 22
    }
  ]
}
```

Notes:

- current frontend uses `todayQuestion`, `retryQuestions`, `learningMaterials`, and `summaryStats`
- `skillRadarPreview` and `skillGapPreview` are additive and should not change the base response contract

### POST /api/daily-cards/{dailyCardId}/open

Auth:

- required

Response:

```json
{
  "id": 15,
  "status": "opened",
  "openedAt": "2026-03-09T04:00:00Z"
}
```

Notes:

- repeated open calls are idempotent

## Answer Attempts

### POST /api/questions/{questionId}/answers

Auth:

- required

Request:

```json
{
  "resumeVersionId": 22,
  "answerMode": "text",
  "contentText": "First, I would clarify the traffic pattern and durability constraints..."
}
```

Response:

```json
{
  "answerAttemptId": 200,
  "scoreSummary": {
    "totalScore": 74,
    "structureScore": 70,
    "specificityScore": 72,
    "technicalAccuracyScore": 76,
    "roleFitScore": 68,
    "companyFitScore": 66,
    "communicationScore": 73,
    "evaluationResult": "PASS"
  },
  "feedback": [
    {
      "id": 1,
      "feedbackType": "strength",
      "severity": "info",
      "title": "Good baseline answer",
      "body": "Your answer covers the question and keeps a coherent flow.",
      "displayOrder": 1
    }
  ],
  "progressStatus": "in_progress",
  "nextReviewAt": null,
  "archiveDecision": false,
  "reviewQueueItemId": 31,
  "recommendedNextQuestionIds": [101],
  "skillImpactSummary": [
    {
      "skillCode": "system-design",
      "delta": 4
    }
  ]
}
```

Notes:

- low-quality answers can create or update a retry queue item
- `answerMode` values like `skip` and `unanswered` may trigger retry behavior when the backend supports them
- additive analysis fields should not block the current submit-result flow
- when `analysis` is present, use it as the richer result layer while keeping score summary and feedback list visible as fallback/supporting data

### GET /api/questions/{questionId}/answers

Auth:

- required

Response:

```json
[
  {
    "id": 200,
    "attemptNo": 2,
    "answerMode": "text",
    "submittedAt": "2026-03-09T04:00:00Z",
    "scoreSummary": {
      "totalScore": 74,
      "structureScore": 70,
      "specificityScore": 72,
      "technicalAccuracyScore": 76,
      "roleFitScore": 68,
      "companyFitScore": 66,
      "communicationScore": 73,
      "evaluationResult": "PASS"
    },
    "reviewReasonSummary": "Low depth on follow-up questions"
  }
]
```

### GET /api/answer-attempts/{answerAttemptId}

Auth:

- required

Response:

```json
{
  "answerAttempt": {
    "id": 200,
    "questionId": 100,
    "resumeVersionId": 22,
    "attemptNo": 2,
    "answerMode": "text",
    "contentText": "First, I would clarify the traffic pattern...",
    "submittedAt": "2026-03-09T04:00:00Z"
  },
  "score": {
    "totalScore": 74,
    "structureScore": 70,
    "specificityScore": 72,
    "technicalAccuracyScore": 76,
    "roleFitScore": 68,
    "companyFitScore": 66,
    "communicationScore": 73,
    "evaluationResult": "PASS"
  },
  "feedback": [],
  "progressSummary": {
    "currentStatus": "in_progress",
    "latestScore": 74,
    "bestScore": 81,
    "totalAttemptCount": 3,
    "lastAnsweredAt": "2026-03-09T04:00:00Z",
    "nextReviewAt": null,
    "masteryLevel": "intermediate"
  },
  "skillImpact": [
    {
      "skillCode": "system-design",
      "previousScore": 70,
      "newScore": 74,
      "delta": 4
    }
  ],
  "weakPatterns": [
    {
      "dimensionCode": "specificity",
      "severity": "medium",
      "explanation": "The answer stays high-level on trade-off details."
    }
  ],
  "followUpRecommendations": [
    {
      "questionId": 101,
      "title": "How would you handle poison messages?"
    }
  ]
}
```

## Review Queue

### GET /api/review-queue

Auth:

- required

Response:

```json
[
  {
    "id": 31,
    "questionId": 101,
    "questionTitle": "Explain cache invalidation",
    "questionDifficulty": "MEDIUM",
    "reasonType": "low_total",
    "priority": 100,
    "scheduledFor": "2026-03-09T04:00:00Z",
    "status": "pending",
    "sourceAnswerAttemptId": 200,
    "relatedSkillCodes": ["caching", "system-design"]
  }
]
```

### POST /api/review-queue/{queueId}/skip

Auth:

- required

Response:

```json
{
  "id": 31,
  "status": "skipped",
  "updatedAt": "2026-03-09T04:00:00Z"
}
```

### POST /api/review-queue/{queueId}/done

Auth:

- required

Response:

```json
{
  "id": 31,
  "status": "done",
  "updatedAt": "2026-03-09T04:00:00Z"
}
```

Notes:

- missing queue ids return `404`
- non-pending queue items return `409`

## Archive

### GET /api/archive

Auth:

- required

Response:

```json
[
  {
    "questionId": 100,
    "title": "Design a resilient queue",
    "difficulty": "HARD",
    "archivedAt": "2026-03-09T04:00:00Z",
    "bestScore": 92,
    "totalAttemptCount": 3,
    "masterySource": "sustained_high_score"
  }
]
```

Notes:

- archive remains question-level
- archive may include additive source metadata for `Practice` and `Interview` badges
- archived questions can still expose answer history and skill evidence
- interview-originated archived items may also link back to interview history via `sourceSessionId`

## Feed

### GET /api/feed

Auth:

- required

Response:

```json
{
  "popular": [
    {
      "questionId": 100,
      "title": "Design a resilient queue",
      "category": "System Design",
      "difficulty": "HARD",
      "companies": [],
      "tags": [],
      "userProgressSummary": null
    }
  ],
  "trending": [],
  "companyRelated": [],
  "gapFocused": [
    {
      "questionId": 120,
      "title": "Explain quorum reads and writes",
      "category": "Distributed Systems"
    }
  ]
}
```

Notes:

- `GET /api/feed` currently requires authentication
- `GET /api/home` currently requires authentication
- `GET /api/questions` and `GET /api/questions/{questionId}` remain public
- `gapFocused` is an additive section that should be ignored safely by older clients

## Compatibility Rules
- existing DTOs used by the current frontend remain the minimum supported contract
- richer response bodies must be additive
- new endpoints should complement, not replace, current home, question detail, result analysis, and resume flows
- frontend mappers should normalize both list-style and object-style responses where current backend behavior is already flexible
