# 02-frontend-architecture

## Recommended Structure
```text
src/
- app
- pages
- features
- entities
- widgets
- shared
```

The current project structure already matches the intended frontend architecture and should be preserved. New product concepts should be integrated as additive modules inside this structure.

## Package Responsibilities
### app
- router setup
- global providers
- auth bootstrap
- query client
- app shell and protected routes
- global i18n provider and locale bootstrap

### pages
Route-level screens and route-specific composition:
- `HomePage`
- `PracticePage`
- `QuestionDetailPage`
- `AnswerEditorPage`
- `ResultAnalysisPage`
- `ReviewQueuePage`
- `ArchivePage`
- `FeedPage`
- `ProfilePage`
- `ResumePage`

New product concepts should continue to enter through existing pages first:
- home for radar preview, weak-skill preview, and next-step guidance
- question detail for follow-up tree and related skill context
- result analysis for answer analysis, skill impact, and review recommendation
- resume for parsed resume insights tied to the active version

### features
Feature-specific hooks, query adapters, and action logic.

Current slices already cover:
- auth
- home
- practice
- question
- answer
- result
- review-queue
- archive
- interview history
- interview start flow with resume-version selection
- feed
- profile
- resume

Recommended additive slices:
- `skill-radar`
- `gap-analysis`
- `question-tree`
- `resume-analysis`
- `practical-interview`
- `replay-simulation`

These should remain thin orchestration layers around typed API calls and entity mappers.

### entities
Shared domain display models and mapping logic.

Current entities already model:
- home cards
- questions
- results
- answer history
- review queue
- archive
- feed
- profile
- resume

Recommended additive entities:
- `skill-radar`
- `skill-gap`
- `question-tree`
- `resume-insight`
- `interview-start`
- `interview-record`
- `interviewer-profile`
- `replay-session`

Entity models should explicitly map API DTOs into UI-safe shapes and provide defaults for optional additive fields.

### widgets
Screen composition units and reusable display blocks.

Current widgets already support the main learning loop. New widgets should fit the same pattern:
- `SkillRadarPreviewCard`
- `SkillGapList`
- `QuestionTreePanel`
- `ResumeInsightCard`
- `ImprovementSummaryCard`

### shared
- typed HTTP client
- endpoint constants
- query keys
- auth storage and provider
- route constants
- UI primitives and responsive layout utilities
- formatting helpers and collection guards
- i18n message dictionaries and locale helpers

## Architectural Priorities
### Route Ownership
- keep route-level data loading and state branching in `pages`
- keep reusable view composition in `widgets`
- keep DTO-to-model mapping in `entities`

### Typed API Integration
- endpoint strings remain centralized in `src/shared/api/endpoints.ts`
- request and response DTOs remain centralized in `src/shared/types`
- new radar, gap, and tree fields should be optional until all backend contracts are finalized
- locale-aware requests should be centralized so `X-App-Locale` or equivalent locale headers are not scattered through feature code

### Backward Compatibility
- existing pages should continue to render when newer fields are absent
- mappers should normalize both minimal current responses and richer future responses
- additive sections should degrade to empty-state or hidden-state behavior without breaking the main workflow
- original user-authored content should never be replaced in the UI model by translated fallback text

### Mobile-First UX
- primary action should stay visible on every major screen
- side panels on desktop should collapse into stacked sections on mobile
- graph or radar views must have accessible fallback summaries for small screens

## State Management
- React Query for server state
- local component state for transient form or filter state
- persistent local state only for small UX helpers such as answer drafts
- avoid introducing cross-app client state for skill radar or question tree unless caching needs become demonstrably global
- persistent locale state may be stored for user preference and bootstrap fallback
- authenticated bootstrap should hydrate the active locale from `settings.preferredLanguage` when available

## Error Handling
Every major page should handle:
- loading
- empty
- error
- success
- auth-required when the route or data needs authentication

For additive features such as skill radar or question tree, prefer sectional fallback instead of failing the full page when only one secondary resource is unavailable.

## Localization Rules
- initial supported locales are `ko` and `en`
- UI chrome, navigation, badges, and empty/error states should use the active locale
- original user content such as resume evidence snippets, resume source sections, and answer text should remain in the original language
- mixed-language rendering is valid and expected
- generated interview question fields such as `title`, `bodyText`, and `generationRationale` may carry `contentLocale`, but that field is metadata only and should not trigger client translation
- frontend should treat machine-readable API fields as locale-neutral and translate display-only UI strings separately

## Data Flow Summary
1. `pages` trigger feature queries and mutations.
2. `shared/api` sends typed REST requests.
3. `entities` map DTOs into UI models.
4. `widgets` render screen sections.
5. mutations invalidate query keys so the learning loop stays current across home, result analysis, review queue, archive, and resume-driven contexts.
