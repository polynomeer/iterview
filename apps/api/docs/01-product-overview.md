# 01-product-overview

Shared product direction now lives in:

- `../../../docs/01-product-foundation.md`

This directory should keep backend-specific product detail only.

Backend-specific follow-up documents:

- `02-backend-architecture.md`
- `03-db-schema.md`
- `04-api-contracts.md`
- `05-implementation-plan.md`
- `06-acceptance-criteria.md`
- keep scoring centralized in one service
- enrich analysis output so weak patterns, follow-up readiness, and skill gaps can be derived from answer history
- preserve current retry scheduling and archive semantics

### 5. Skill and Readiness Insights
- calculate skill-category performance from answer history
- compare user progress against role and career-stage benchmarks
- feed those insights back into home recommendations, review queue prioritization, and resume defense preparation

### 6. Bilingual Product Experience
- support `ko` and `en` as the initial product languages
- preserve all user-authored and user-uploaded source data in its original form without translated persistence
- localize UI labels, system messages, and static/reference data by the selected language
- generate AI-created interview questions, follow-ups, and analysis text in the selected system language
- allow mixed-language screens where original resume or answer text remains in the source language while the product UI is rendered in another language

### 7. Practical Interview Replay
- accept real interview audio uploads and keep the raw asset, transcript, cleaned transcript, and user-confirmed transcript separately
- segment one real interview into speaker-tagged timeline units, structured questions, structured answers, and follow-up edges
- derive interviewer-style metadata such as pressure level, preferred topics, depth preference, and follow-up habits from the imported interview
- let one imported interview become a reusable simulation source without collapsing it into the same table as ordinary practice answers
- support replay-oriented interview sessions that reuse the existing interactive interview flow while grounding question strategy in one imported real interview record
- preserve imported real-interview questions as archive-visible question-level assets so they can feed later practice, review, and replay flows

## Current Scope vs Extension Scope
### Implemented Today
- authentication and current-user profile APIs
- resume list, create, version upload, and activation APIs
- question list and detail APIs
- answer submission, answer history, and answer detail APIs
- review queue, archive, home, and feed APIs
- scoring, retry scheduling, and archive decisions

### Planned Additive Extensions
- LLM-backed structured extraction from parsed resume raw text
- extraction confidence, traceability, and failure visibility for resume signal mapping
- richer resume extraction snapshots for skills, experiences, and resume risks
- saved job-posting parsing and resume-to-JD analysis runs
- persisted resume rewrite suggestions and acceptance state for one analysis run
- richer structured resume sections for profile, contacts, education, awards, certifications, and project-level achievements
- richer project records extracted from resume PDFs, including title, content, tags, and category classification
- question relationship modeling for follow-up trees
- interview-session history, interview question snapshots, and archive source metadata
- interview modes, resume-evidence coverage planning, and resume-question map results
- practical interview replay records, transcript editing, interviewer-profile extraction, and replay-simulation seeds
- question-linked model answers and richer learning material metadata
- richer answer analysis beyond the current score + feedback rows
- skill radar, gap analysis, and benchmark APIs
- stronger home dashboard summaries tied to readiness and risk

### Explicitly Out of Scope Unless Requested
- live voice or streaming interview features
- public answer publishing or comparison
- GitHub sync
- community or lounge features
- admin moderation tooling

## Product Rules
- questions are global shared assets
- answer attempts remain immutable after submission
- resume versions remain immutable historical records
- extracted resume skills, experiences, and risks are always scoped to one resume version
- raw text parsing and structured field extraction are separate pipeline stages and may complete independently
- structured resume sections should preserve the user document’s original grouping so career timeline and supporting credentials stay explainable
- user progress is cached aggregate state per user-question pair
- retry scheduling is persisted, not recomputed ad hoc on every read
- archived questions must stay out of the active retry loop unless explicitly reset
- archive remains question-level, even when the question originated from an interview session
- archive items should preserve whether they came from `practice` or `interview`
- interview history remains session-level and must not replace archive
- a resume-based interview session must remain attributable to the chosen `resumeVersionId` for its full lifetime
- full resume coverage should be measured against structured resume evidence units, not raw character-by-character text
- full-coverage results should prefer a structured resume viewer over raw PDF-coordinate highlighting for the first implementation
- resume interview results should highlight asked or defended resume evidence blocks and let the user inspect the linked interview questions from those highlights
- practical interview uploads should preserve raw transcript, cleaned transcript, and user-confirmed transcript independently rather than overwriting earlier stages
- real interview records and replay simulations should remain distinct from ordinary mock sessions, while still contributing question-level assets into archive and study flows
- user-authored or uploaded original data must remain stored and retrievable in the original language
- UI language, system-generated text language, and static/reference-data language should follow the effective locale for the request or user setting
- generated interview questions, follow-ups, and analysis text should persist the locale they were generated in
- new intelligence features should reuse current progress, answer, and resume records where possible
- model answers and learning materials are global reference content, not user-generated answer attempts

## User Value
The updated product should help a user answer three questions every time they open the app:
- What should I practice today?
- Where am I weak relative to my resume and target role?
- Which follow-up questions am I still not ready to defend?

It should also answer these interview-specific questions:
- Which parts of my resume have not been covered in mock interviews yet?
- When I hover one project or sentence from my resume, which interview questions were asked about it?
- When I click one highlighted resume block after the interview, can I jump back to the exact interview turn that covered it?
