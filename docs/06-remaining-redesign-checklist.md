# 06-remaining-redesign-checklist

This checklist converts the current redesign status of `iterview` into a concrete remaining-work list.

Current status baseline on August 25, 2026:
- completed: workspace shell direction and graph-oriented product framing
- completed: `Home`, `Feed`, `Practice`, `Question Tree`, `Review Queue`, `Archive`, `Profile`, `Resume`, `Interview*`, `QuestionDetail`, `AnswerEditor`, `ResultAnalysis`, `ResumeAnalysis`, `ResumeEditor`, `ResumeHeatmap*`, `ResumeTailor*`, `Skills`, `PracticalInterview*`, `Login`, and `Signup` redesign passes
- completed: major source-of-truth, review, and branch-recovery workspace alignment
- still pending: shared system cleanup, final acceptance verification, and any net-new workspace surfaces beyond the current shipped scope

This document is intentionally execution-oriented. It is not a concept note.

## Usage Rules

Mark each line only when the changed scope is:
- visually implemented
- locally verified
- consistent with the workspace-first redesign direction
- kept within a commit scope that matches one work unit

## A. Interview Flow Redesign

### A1. Interview Entry Workspace
- [x] Redesign `apps/web/src/pages/interview/InterviewPage.tsx`
- [x] Make the page read like a workspace entry surface, not a generic launcher
- [x] Clarify the relationship between interview mode, current context, and next action
- [x] Add a top-level workspace summary surface consistent with other redesigned pages
- [x] Remove duplicated summaries or decorative wrappers that do not affect decisions
- [x] Verify mobile and desktop hierarchy separately

### A2. Interview Session Workspace
- [x] Redesign `apps/web/src/pages/interview-session/InterviewSessionPage.tsx`
- [x] Strengthen DFS context visibility during an active session
- [x] Keep the current node, parent path, and immediate next branch readable without navigation loss
- [x] Separate answering focus from side-context noise
- [x] Preserve or improve sticky inspector behavior without obscuring content
- [x] Verify that the session page still works as the main focused practice surface

### A3. Interview Result Workspace
- [x] Redesign `apps/web/src/pages/interview-result/InterviewResultPage.tsx`
- [x] Make the result page feel like branch review and continuation guidance, not a detached score screen
- [x] Surface retry direction, weak claims, and next branch recommendations clearly
- [x] Keep score presentation secondary to actionable review context
- [x] Align layout and copy with the same workspace system as the session page
- [x] Verify continuity from session to result without mental model break

### A4. Interview Flow Cohesion
- [x] Align `InterviewPage`, `InterviewSessionPage`, and `InterviewResultPage` as one continuous flow
- [x] Keep shared labels, breadcrumbs, badges, and status patterns consistent
- [x] Remove route-to-route tone drift
- [x] Ensure the user can tell what to do next at every step

## B. DFS And Inspector System

### B1. DFS Context Signals
- [x] Standardize active-path breadcrumbs
- [x] Standardize current-node emphasis
- [x] Standardize sibling de-emphasis
- [x] Standardize next-branch or retry cues
- [x] Reuse one visual rule set instead of per-page variants

### B2. Inspector Behavior
- [x] Define the persistent right-rail role across interview pages
- [x] Ensure the inspector shows evidence, notes, related branches, or answer state without duplicating the main panel
- [x] Keep sticky behavior readable on desktop and non-obstructive on small screens
- [x] Validate heading hierarchy and section density inside inspector surfaces

## C. Remaining Question And Answer Workspaces

### C1. Question Detail
- [x] Redesign `apps/web/src/pages/question-detail/QuestionDetailPage.tsx`
- [x] Make question detail feel like an inspector-driven node workspace
- [x] Strengthen evidence linkage and branch context
- [x] Reduce page-fragmented reading patterns

### C2. Answer Editor
- [x] Redesign `apps/web/src/pages/answer-editor/AnswerEditorPage.tsx`
- [x] Keep answer drafting in context with the active node and supporting evidence
- [x] Make evaluation intent and next action clear before submission
- [x] Reduce unnecessary visual competition around the editor surface

### C3. Result Analysis
- [x] Redesign `apps/web/src/pages/result-analysis/ResultAnalysisPage.tsx`
- [x] Prioritize weakness interpretation, retry decision, and branch follow-up over decorative analytics
- [x] Align result-analysis surfaces with interview result and question detail patterns

## D. Remaining Resume Source-Of-Truth Workspaces

### D1. Resume Analysis
- [x] Redesign `apps/web/src/pages/resume-analysis/ResumeAnalysisPage.tsx`
- [x] Reframe the page around claim defense quality, not static analysis output
- [x] Make extracted risks and missing support actionable

### D2. Resume Editor
- [x] Redesign `apps/web/src/pages/resume-editor/ResumeEditorPage.tsx`
- [x] Make the editor feel like source-of-truth authoring, not isolated document editing
- [x] Keep claim clarity, evidence density, and interview defensibility visible

### D3. Resume Heatmap
- [x] Redesign `apps/web/src/pages/resume-heatmap/ResumeHeatmapPage.tsx`
- [x] Redesign `apps/web/src/pages/resume-heatmap/ResumeHeatmapAnchorPage.tsx`
- [x] Ensure heatmap visuals support prioritization instead of becoming decorative analytics

### D4. Resume Tailor Flow
- [x] Redesign `apps/web/src/pages/resume-tailor/ResumeTailorLandingPage.tsx`
- [x] Redesign `apps/web/src/pages/resume-tailor/ResumeTailorJobPostingsPage.tsx`
- [x] Redesign `apps/web/src/pages/resume-tailor/ResumeTailorAnalysisListPage.tsx`
- [x] Redesign `apps/web/src/pages/resume-tailor/ResumeTailorAnalysisDetailPage.tsx`
- [x] Align the entire flow with the same source-of-truth and interview-preparation mental model

## E. Secondary Product Surfaces

### E1. Skills And Practical Interviews
- [x] Redesign `apps/web/src/pages/skills/SkillsPage.tsx`
- [x] Redesign `apps/web/src/pages/practical-interviews/PracticalInterviewListPage.tsx`
- [x] Redesign `apps/web/src/pages/practical-interviews/PracticalInterviewReviewPage.tsx`
- [x] Keep these screens visually subordinate to the core interview DFS loop

### E2. Auth Surfaces
- [x] Redesign `apps/web/src/pages/login/LoginPage.tsx`
- [x] Redesign `apps/web/src/pages/signup/SignupPage.tsx`
- [x] Align with the product tone without turning auth into a marketing page

## F. Newly Required Workspace Surfaces

### F1. Notes Workspace
- [x] Add a dedicated `NotesPage` route and page implementation
- [x] Keep pinned notes, recent notes, and active note editing in one workspace
- [x] Preserve links to questions, resume context, and related skills inside the right rail

### F2. Bookmarks Workspace
- [x] Add a dedicated `BookmarksPage` route and page implementation
- [x] Support saved questions, paths, materials, and companies as filterable bookmark types
- [x] Make the inspector actionable for replay, review, and path continuation

### F3. Scheduled Reviews Workspace
- [x] Add a dedicated `ScheduledReviewsPage` route and page implementation
- [x] Provide calendar, timeline, and queue views for spaced repetition work
- [x] Show projected mastery impact and rescheduling actions in-context

### F4. Target Companies Workspace
- [x] Add a dedicated `TargetCompaniesPage` route and page implementation
- [x] Separate company-target tracking from resume-tailor job-posting ingestion
- [x] Show readiness, focus topics, and recommended next preparation paths by company

### F5. Settings Workspace
- [x] Add a dedicated `SettingsPage` route and page implementation
- [x] Move study preferences, personalization, and notification controls out of generic profile surfaces
- [x] Keep configuration health and recommended tweaks visible in a persistent side rail

### F6. Weak Nodes Review Mode
- [x] Add a weak-node review mode or subpage under review surfaces
- [x] Make remediation graph-first instead of list-only
- [x] Link weak nodes directly to connected questions, dimensions, and resume evidence

### F7. Global Command Palette
- [x] Add a workspace-wide command/search overlay
- [x] Search across questions, skills, experiences, companies, notes, and commands
- [x] Keep it route-independent and available from the primary workspace shell

## G. Shared Design System Cleanup

### G1. Shared Surface Patterns
- [x] Audit top workspace surfaces for repeated CSS that should be shared
- [x] Consolidate repeated hero, stat, chip, and muted-note patterns
- [x] Reduce per-page one-off styling where the pattern is already stable

### G2. Token Discipline
- [x] Audit spacing drift
- [x] Audit radius drift
- [x] Audit border and shadow drift
- [x] Audit accent-color drift
- [x] Keep one consistent dark workspace language across all redesigned pages

### G3. Navigation And Structure
- [x] Re-check global navigation labels against the workspace-first hierarchy
- [x] Make sure practice, review, and resume context read as one connected system
- [x] Reduce leftover route-first cues where they weaken the product mental model

## H. Verification Checklist

### H1. Per Work Unit
- [x] Run page-specific tests after each redesign unit
  Current status: the redesigned workspace families now have focused page tests and a broad route-level regression sweep.
- [x] Run `npm run build` for the web app after each redesign unit
- [x] Check desktop layout behavior
  Current status: on August 26, 2026, authenticated desktop route checks passed across the main workspace families with no detected horizontal overflow.
- [x] Check mobile layout behavior
  Current status: on August 26, 2026, dedicated `390 x 844` mobile and `820 x 1180` tablet sweeps passed across the authenticated priority routes after tightening the interview entry layout and resume metric wrapping. A live interview session was created and verified at `/interviews/1`, and the matching completed result was verified at `/interviews/1/result`, both without horizontal overflow.
- [x] Check sticky rails and overflow behavior
  Current status: on August 26, 2026, the desktop sticky/overflow sweep passed on the accessible high-risk routes and no broken top offsets or horizontal overflow were detected.
- [x] Check text duplication against test expectations
  Current status: stale page expectations were aligned to the redesigned copy across the verified workspace families.
- [x] Re-run the complete web regression suite after final test alignment
  Current status: on September 1, 2026, `npm run test:run` passed 38 test files and 73 tests, and `npm run build` completed successfully.

### H2. Final Acceptance Pass
- [x] Verify daily practice journey
- [x] Verify question exploration journey
- [x] Verify review and retry journey
- [x] Verify resume source-of-truth authoring journey
- [x] Verify interview session to result continuity
- [x] Verify the product reads as one interview workspace rather than a set of disconnected pages
- [x] Verify notes, bookmarks, scheduling, and company-target surfaces behave as real workspaces
- [x] Verify the command palette can navigate across every major workspace family

## Current Remaining Scope

The practical remaining scope is now:
- no open redesign verification items remain in the current shipped scope
- any follow-up work is now net-new polish or product expansion rather than redesign acceptance cleanup

Manual sweep reference:
- `docs/08-manual-visual-qa-sweep.md`

Everything else in this checklist has either been implemented directly or adapted into adjacent shipped flows.

## Suggested Execution Order

1. Net-new polish only when a real product issue is discovered in later QA
2. New feature work can proceed without a pending redesign acceptance blocker
