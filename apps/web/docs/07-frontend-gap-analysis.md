# 07-frontend-gap-analysis

## Purpose
This document maps the rewritten product documents to the current frontend so implementation can proceed incrementally without breaking the existing application.

## Current Frontend Coverage
The current frontend already includes:

- authenticated and public routing
- home, practice, question detail, answer editor, result analysis, review queue, archive, feed, profile, and resume screens
- typed API clients and centralized endpoints
- React Query hooks for the current server state flows
- mobile and desktop layout patterns
- shared loading, empty, error, and auth-required state components
- answer draft persistence
- resume version activation as part of answer submission

## Missing or Partial Areas

### Routing and Information Architecture
- no dedicated skills dashboard route
- no interview session history route or session flow
- no route or embedded panel for question-tree exploration beyond question detail
- no dedicated resume analysis view beyond resume container and version management

### Shared UI
- no reusable metric or score-badge system for intelligence-heavy screens
- no reusable skill summary, radar summary, or risk summary blocks
- no tree-view presentation primitives
- no compact insight cards for resume analysis, gaps, or weak patterns
- no centralized bilingual UI layer or locale persistence policy documented here

### Home
- no skill radar preview
- no weak-skill or gap preview
- no resume risk preview
- summary stats and retry sections exist but are not yet organized around the updated next-action model

### Resume
- PDF upload flow now has backend support but needs frontend integration
- no parsing-status polling UI for `pending`, `completed`, `failed`
- no parsed result display
- no extracted skills list
- no extracted experiences list
- no extracted project cards with category and tag metadata
- no extracted risk summary
- no latest active resume overview beyond basic activation state

### Question Discovery and Detail
- practice list does not surface resume relevance or recommended sections
- question detail does not show related skills
- question detail does not show question-tree summary or follow-up structure
- answer history exists but does not yet emphasize comparison or improvement cues

### Answer and Analysis
- answer editor has no confidence input
- no comparative answer analysis panel between attempts

### Skill Intelligence
- no skill radar or gap analysis page
- no textual readiness or benchmark summary UI

### Review Queue
- review queue exists but does not clearly explain queue reasons, source attempts, or related skills
- no optimized retry re-entry shortcuts beyond the current basic item actions

### Interview Session
- Interview tab, session history, session detail flow, and archive source badges are now implemented
- `resume_mock` start flow now requires one explicit resume-version selection and supports interview-mode selection including `full_coverage`
- session detail now renders AI-generated opening questions and follow-ups from snapshot fields without depending on catalog `questionId`
- session detail now consumes additive snapshot fields such as `bodyText`, `focusSkillNames`, `resumeContextSummary`, `generationStatus`, and `resumeEvidence`
- session progression now follows explicit backend semantics: `next-question` is advance-only, `skip-question` bypasses the current prompt, and summary UI includes skipped counts
- current resume-grounded interview scope is intentionally narrower than the full resume viewer:
  - question generation and `full_coverage` currently focus on project and experience evidence
  - profile, contacts, competencies, awards, certifications, and education remain viewable in resume management but are not current interview-question sources
- `full_coverage` panel now shows project/experience coverage progress and supports click-to-question navigation from resume-map evidence
- completed `full_coverage` results now use a structured project/experience viewer that highlights interviewed blocks, previews linked questions on hover, and pins related questions on click
- in-session and result-time facet summary panels now surface weak/skipped project or experience facets without deriving them in the UI
- `coverage_extended` deep-dive prompts now have subtle revisit treatment so later questions feel intentionally different from first-pass overview questions
- practical-interview upload, review overview, transcript correction, question review, thread review, confirmation, and replay launch are now implemented
- practical-interview review now also exposes one shared imported-audio player that reuses backend replay timestamp metadata across transcript, question, issue, and thread interactions
- practical-interview upload now supports backend automatic transcription lifecycle states, retry metadata, and manual retry without requiring a transcript paste upfront
- practical-interview routes are now present for list, upload, detail, transcript, question deep link, and replay launch entry
- archive now safely preserves imported `real_interview` source metadata and can deep-link from practical interview review
- resume-tailor workspace is now implemented for saved job postings, version-scoped analyses, tailored document preview, suggestion acceptance, and server-side PDF export history
- resume interview heatmap is now implemented for parsed anchor summaries, linked practical interview question drilldown, server-side filter summary chips, additive filter params, overlay-target hotspot reads, and manual remap corrections
- resume editor workspace is now implemented for block-based draft editing, markdown import, additive comments and question cards, deterministic suggestion previews, presence heartbeat, revision history, tracked changes, merge preview, and print preview on top of immutable resume versions
- the current editor has already moved toward one markdown-first workspace with contextual tools, but it is still constrained by the backend's flat block document model

### API and DTO Support Needed
- additive DTO support for:
  - home radar, gaps, and resume risks
  - resume upload and version status payloads
  - resume analysis payloads
  - question reference answers
  - curated question learning materials
  - question tree payloads
  - related skills and resume relevance
  - enriched result analysis and review queue metadata
  - skill radar and gap dashboard payloads
  - interview session payloads
  - interview history payloads
  - archive source metadata for practice vs interview badges
  - localized static/reference display fields and locale-aware settings fields
  - resume editor V2 rich document nodes, selection anchors, operation writes, and node-aware merge-preview payloads

### Resume Editor V2 Gaps
- current runtime API is sufficient for:
  - markdown import
  - one markdown-first draft surface
  - block-level fallback editing
  - additive comments, question cards, presence, revision history, merge preview, and print preview
- current runtime API is not sufficient for full Notion-level editing because it lacks:
  - one rich tree or nested node document model
  - stable inline selection anchors beyond one flat block id plus text range
  - granular document operations for split, merge, move, indent, outdent, and inline-mark edits
  - node-aware tracked changes and merge conflicts
  - capability metadata for one contextual selection menu
- frontend should therefore treat the planned resume editor V2 as a backend-dependent next slice, not as a pure client-side refactor

### Localization
- app now has a centralized locale provider with `ko` and `en` modes plus local persistence
- profile settings now expose `preferredLanguage` and persist it through `PATCH /api/me/settings`
- the shared API client now sends `X-App-Locale` centrally instead of scattering locale headers through feature code
- mixed-language rendering rules are now explicit: generated interview text may follow app locale, while resume evidence, raw resume text, file names, and user answers remain unchanged

## Frontend Source of Truth
When frontend product intent and live API behavior diverge, use this order:

1. backend runtime OpenAPI at `http://localhost:8080/v3/api-docs`
2. backend snapshot at `../iterview-api/docs/openapi/frontend-integration.yaml`
3. backend product and API docs under `../iterview-api/docs/`
4. this frontend gap-analysis document for prioritization

## Immediate Resume Integration Work
The current highest-value documentation-aligned resume tasks are:

1. add PDF upload UI on the existing resume page
2. render version status badges for `pending`, `completed`, and `failed`
3. poll `GET /api/resume-versions/{versionId}` after upload until parsing completes or fails
4. expose parsed profile, contacts, competencies, skills, experiences, projects, and risks for the selected version
5. render resume-derived project cards with content, category, and tags
6. keep failed versions visible with retry-friendly messaging

## Implementation Sequence

### Phase 1
- align routes and page structure for skills, resume analysis, question tree, and interview session
- keep all existing paths working

### Phase 2
- add shared UI primitives for metrics, score badges, insight cards, skill summaries, and tree nodes

### Phase 3
- update home to include radar preview, weak-skill preview, risk preview, and stronger next actions

### Phase 4
- extend resume management into resume analysis and overview

### Phase 5
- extend practice and question detail with richer metadata, related skills, model answers, curated learning materials, and recommended question blocks

### Phase 6
- add hierarchical question-tree visualization

### Phase 7
- expand answer and result analysis with confidence, weak patterns, and skill impact

### Phase 8
- implement a dedicated skill radar and gap analysis page

### Phase 9
- upgrade review queue reasoning and retry workflows

### Phase 10
- implement the MVP interview session flow
- add Interview-tab resume selection and session start flow
- add interview history and archive-source badge support

### Phase 11
- finish additive API integration, cache behavior, and consistency updates

### Phase 12
- polish responsive behavior, terminology, and regression gaps

## Integration Constraints
- preserve the current route shell, page composition, and styling approach
- prefer additive API fields over contract replacement
- hide or gracefully empty-state features when backend support is missing
- keep mobile-first usability intact
- reuse existing shared state components and layout panels before creating new patterns
