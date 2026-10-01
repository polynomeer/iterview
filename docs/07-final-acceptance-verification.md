# 07-final-acceptance-verification

Date: 2026-09-30 (rewritten after redesign Phase 5; the 2026-08-25 version referred to pages that no longer exist)

This document records the automated evidence for the redesigned `iterview` web app: which user journeys the tests cover, and how the build is checked. Manual visual QA is in `docs/08-manual-visual-qa-sweep.md`. Routes are listed in `apps/web/docs/03-routes-and-flows.md`.

## How To Verify

From `apps/web`:
- `npm run build` runs the TypeScript check and the production bundle.
- `npm run test:run` runs 48 test files with 276 tests as of 2026-10-01.

From `apps/api`:
- `./gradlew test` runs the Testcontainers integration tests, so Docker must be running. As of 2026-10-01 the full suite passes (160 tests), and the two job-role tests added afterwards pass in `ProfileApiIntegrationTest`.

## Journey Matrix

### 1. Daily Practice

Covered path: 오늘 → question → answer (focus mode) → evaluation → 복습.

Evidence:
- `apps/web/src/test/pages/HomePage.test.tsx`
- `apps/web/src/test/pages/QuestionWorkspacePage.test.tsx`
- `apps/web/src/test/pages/AnswerEditorPage.test.tsx`
- `apps/web/src/test/pages/ResultAnalysisPage.test.tsx`
- `apps/web/src/test/pages/SkillMapPage.test.tsx`
- `apps/web/src/test/entities/practiceModel.test.ts`

### 2. Review

Covered path: questions due now, sorting, the week strip, later/done actions, and finished questions.

Evidence:
- `apps/web/src/test/pages/ReviewPages.test.tsx`

### 3. Resume Hub

Covered path: `/resume` redirect or first upload, overview, version management, the per-claim evidence form and the document editor, pressure map and claim detail, and job-fit analyses.

Evidence:
- `apps/web/src/test/pages/ResumeHub.test.tsx`
- `apps/web/src/test/pages/ResumeClaimsPage.test.tsx`
- `apps/web/src/test/entities/claimModel.test.ts`
- `apps/web/src/test/pages/ResumeEditorPage.test.tsx`
- `apps/web/src/test/pages/ResumeHeatmapPage.test.tsx`
- `apps/web/src/test/pages/ResumeHeatmapAnchorPage.test.tsx`
- `apps/web/src/test/pages/ResumeTailorAnalysisListPage.test.tsx`
- `apps/web/src/test/pages/ResumeTailorAnalysisDetailPage.test.tsx`

### 4. Interview

Covered path: launcher → live session (focus mode, graded against the session's resume version) → result. Real interviews: list, upload with an opt-out resume link, and record review: questions first, follow-up chains, transcript correction, and a replay dialog graded against the linked resume.

Evidence:
- `apps/web/src/test/pages/InterviewPage.test.tsx`
- `apps/web/src/test/pages/InterviewSessionPage.test.tsx`
- `apps/web/src/test/pages/InterviewResultPage.test.tsx`
- `apps/web/src/test/pages/PracticalInterviewListPage.test.tsx`
- `apps/web/src/test/pages/PracticalInterviewReviewPage.test.tsx`

### 5. Settings, Auth, And Explore

Covered path:
- Settings: profile, target companies, practice goals, language, and account on one page.
- Auth: login and signup without the app shell.
- Explore: the public feed, with a sign-in state for guests.

Evidence:
- `apps/web/src/test/pages/SettingsPage.test.tsx`
- `apps/web/src/test/pages/LoginPage.test.tsx`
- `apps/web/src/test/pages/SignupPage.test.tsx`
- `apps/web/src/test/pages/FeedPage.test.tsx`
- `apps/web/src/test/providers/AuthBootstrap.test.tsx`

### 6. Shell, Routing, And Navigation

Covered path:
- Area resolution and route ranking.
- Every legacy URL redirect.
- Focus-mode routes.
- Protected routes and error boundaries.
- Sidebar, including the resume version switcher.
- Header titles and the command palette.

Evidence:
- `apps/web/src/test/router/appRoutes.test.tsx`
- `apps/web/src/test/router/legacyRedirects.test.tsx`
- `apps/web/src/test/router/ProtectedRoute.test.tsx`
- `apps/web/src/test/router/RouteErrorBoundary.test.tsx`
- `apps/web/src/test/widgets/SidebarNavigation.test.tsx`
- `apps/web/src/test/widgets/AreaNavigation.test.tsx`
- `apps/web/src/test/widgets/Header.test.tsx`
- `apps/web/src/test/widgets/headerTitles.test.ts`
- `apps/web/src/test/pages/CommandPalette.test.tsx`

### 7. Design System And Content Guards

Covered rules:
- Primitives behave accessibly.
- No raw colors or font sizes appear outside `tokens.css`.
- Text roles meet AA contrast.
- New class names never collide with legacy styles.
- `global.css` stays under 3,000 lines.
- Korean and English message keys match.
- No inline Korean/English copy (`isKorean`, `copy(ko, en)`) exists outside the message catalog.
- Error messages are mapped for users.
- Labels are localized.

Evidence:
- `apps/web/src/test/shared/primitives/*.test.tsx`
- `apps/web/src/test/shared/designTokens.test.ts`
- `apps/web/src/test/shared/i18nCatalog.test.ts`
- `apps/web/src/test/shared/i18nGuard.test.ts`
- `apps/web/src/test/shared/api/errors.test.ts`
- `apps/web/src/test/shared/labels.test.ts`
- `apps/web/src/test/shared/LocaleProvider.test.tsx`
- `apps/web/src/test/shared/theme.test.ts`

## Visual Evidence

- Phase 5 CSS pruning and co-location were checked with full-page screenshots against the local API and demo data. Fifteen routes at 1440px and 390px were compared: the editor tabs, record review, and the rebuilt screens. They were pixel-identical before and after.
- The real-data route sweeps at the end of Phases 3–5 found no crash and no horizontal scroll at 1440px or 390px.

## Known Gaps

- The demo data has no interview audio, so the record review's recording panel is covered by tests but has not been checked visually against real data.
- Under heavy machine load, `ResumeEditorPage.test.tsx` can exceed its 15-second budget in the full run. It passes when run alone.
