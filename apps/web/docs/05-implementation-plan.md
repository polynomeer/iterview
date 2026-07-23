# 05-implementation-plan

Shared implementation sequencing now lives in:

- `../../../docs/02-implementation-roadmap.md`

This document should stay focused on frontend-only implementation planning.
6. show `Interview` source linkage in archive for every asked session turn
7. add interview-mode selection, including planner-driven `full_coverage`
8. render a full-coverage result experience with resume coverage progress and a resume-to-question map

## Phase 7 - Integration Stabilization
1. verify that existing pages tolerate additive response fields
2. update loading, empty, and error handling for new sectional data
3. verify auth behavior for protected routes and mixed public-private data
4. confirm route coherence across home, question, result, review, archive, profile, and resume

## Phase 8 - Tests and Cleanup
1. expand mapper and API integration tests for new optional fields
2. add page tests for radar preview, question tree fallback, and enriched result states
3. run build and regression tests for the current route set
4. refactor reusable cards and panels only where duplication becomes material

## Phase 9 - Localization and Bilingual UX
1. add global i18n bootstrap and locale persistence
2. add a user-facing language switch for Korean and English
3. localize navigation, buttons, labels, empty states, and error states
4. pass locale consistently to the backend with centralized `X-App-Locale` handling for localized reference and generated text
5. keep original resume content and answer text rendered in the source language
6. verify mixed-language screens for resume evidence, generated interview question cards, and result analysis

## Phase 10 - Practical Interview Replay
1. add real-interview upload flow with company, role, date, resume, and JD linkage
2. support optional transcript override plus backend automatic audio transcription
3. support record lifecycle states for transcript processing, failure, retry, and confirmation
4. add transcript review screens for raw, cleaned, and confirmed transcript layers
5. add structured question/answer review UI plus follow-up-edge visualization
6. add interviewer-profile summary cards and replay-start actions
7. add replay simulation start flow and reuse the interview-session screen for `replay_mock`
8. expose imported real-interview questions as question-level study assets and archive-linked records

## Phase 11 - Resume Tailoring Workspace
1. add saved job-posting manager with text and link input modes
2. add per-resume-version analysis list and creation flow
3. add persisted analysis detail workspace with match insights and suggestion review
4. render `tailoredDocument` as the primary preview artifact
5. add additive suggestion acceptance toggles without mutating the immutable source resume version
6. add export history plus server-side PDF creation and download
7. reuse parsed source-resume snapshots for original-vs-tailored context

## Phase 12 - Resume Interview Heatmap
1. add a resume-version heatmap route with backend scope filters
2. render summary cards and anchor-level heat blocks from backend-provided counts
3. open linked practical interview questions and study deep links from one anchor panel
4. support manual remap corrections without mutating the source resume version text
5. extend the route with backend-computed filter summary chips and additive query params such as `weakOnly`, company/date filters, and `targetType`
6. add flattened overlay-target reads so `block`, `sentence`, `phrase`, and `keyword` hotspots can be inspected and selected during remap

## Phase 13 - Resume Editor V2
1. extend the editor workspace contract from flat block forms into a rich tree or node-based document model
2. keep markdown import and markdown export behavior, but make one markdown-friendly rich editor the default workspace surface
3. add one operation-based editor write API for split, merge, move, indent, outdent, and inline-mark edits
4. move comments, question cards, and deterministic suggestions onto stable rich selection anchors
5. render one contextual popover menu from text or block selection instead of always-visible side rails
6. extend merge-preview and tracked-changes for node-level conflict recovery and revision compare
7. keep the immutable source resume version model intact while the editor workspace remains one additive draft layer

## Delivery Order Recommendation
1. resume-analysis contracts
2. result-analysis and review-queue enrichment
3. home radar and gap preview
4. question-tree support
5. interview-start and session timeline integration
6. broader feed and recommendation tuning
7. practical interview replay and transcript-review flows

This order follows the existing implementation: answers already depend on the active resume version, result analysis already exists, and home already acts as the user&apos;s next-step dashboard.
