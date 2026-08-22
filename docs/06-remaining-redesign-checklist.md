# 06-remaining-redesign-checklist

This checklist converts the current redesign status of `iterview` into a concrete remaining-work list.

Current status baseline on August 22, 2026:
- completed: workspace shell direction and graph-oriented product framing
- completed: `Home`, `Feed`, `Practice`, `Question Tree`, `Review Queue`, `Archive`, `Profile`, and `Resume` redesign passes
- partially aligned: interview and question workspaces
- still pending: end-to-end interview flow unification, source-of-truth authoring flow unification, and shared system cleanup

This document is intentionally execution-oriented. It is not a concept note.

## Usage Rules

Mark each line only when the changed scope is:
- visually implemented
- locally verified
- consistent with the workspace-first redesign direction
- kept within a commit scope that matches one work unit

## A. Interview Flow Redesign

### A1. Interview Entry Workspace
- [ ] Redesign `apps/web/src/pages/interview/InterviewPage.tsx`
- [ ] Make the page read like a workspace entry surface, not a generic launcher
- [ ] Clarify the relationship between interview mode, current context, and next action
- [ ] Add a top-level workspace summary surface consistent with other redesigned pages
- [ ] Remove duplicated summaries or decorative wrappers that do not affect decisions
- [ ] Verify mobile and desktop hierarchy separately

### A2. Interview Session Workspace
- [ ] Redesign `apps/web/src/pages/interview-session/InterviewSessionPage.tsx`
- [ ] Strengthen DFS context visibility during an active session
- [ ] Keep the current node, parent path, and immediate next branch readable without navigation loss
- [ ] Separate answering focus from side-context noise
- [ ] Preserve or improve sticky inspector behavior without obscuring content
- [ ] Verify that the session page still works as the main focused practice surface

### A3. Interview Result Workspace
- [ ] Redesign `apps/web/src/pages/interview-result/InterviewResultPage.tsx`
- [ ] Make the result page feel like branch review and continuation guidance, not a detached score screen
- [ ] Surface retry direction, weak claims, and next branch recommendations clearly
- [ ] Keep score presentation secondary to actionable review context
- [ ] Align layout and copy with the same workspace system as the session page
- [ ] Verify continuity from session to result without mental model break

### A4. Interview Flow Cohesion
- [ ] Align `InterviewPage`, `InterviewSessionPage`, and `InterviewResultPage` as one continuous flow
- [ ] Keep shared labels, breadcrumbs, badges, and status patterns consistent
- [ ] Remove route-to-route tone drift
- [ ] Ensure the user can tell what to do next at every step

## B. DFS And Inspector System

### B1. DFS Context Signals
- [ ] Standardize active-path breadcrumbs
- [ ] Standardize current-node emphasis
- [ ] Standardize sibling de-emphasis
- [ ] Standardize next-branch or retry cues
- [ ] Reuse one visual rule set instead of per-page variants

### B2. Inspector Behavior
- [ ] Define the persistent right-rail role across interview pages
- [ ] Ensure the inspector shows evidence, notes, related branches, or answer state without duplicating the main panel
- [ ] Keep sticky behavior readable on desktop and non-obstructive on small screens
- [ ] Validate heading hierarchy and section density inside inspector surfaces

## C. Remaining Question And Answer Workspaces

### C1. Question Detail
- [ ] Redesign `apps/web/src/pages/question-detail/QuestionDetailPage.tsx`
- [ ] Make question detail feel like an inspector-driven node workspace
- [ ] Strengthen evidence linkage and branch context
- [ ] Reduce page-fragmented reading patterns

### C2. Answer Editor
- [ ] Redesign `apps/web/src/pages/answer-editor/AnswerEditorPage.tsx`
- [ ] Keep answer drafting in context with the active node and supporting evidence
- [ ] Make evaluation intent and next action clear before submission
- [ ] Reduce unnecessary visual competition around the editor surface

### C3. Result Analysis
- [ ] Redesign `apps/web/src/pages/result-analysis/ResultAnalysisPage.tsx`
- [ ] Prioritize weakness interpretation, retry decision, and branch follow-up over decorative analytics
- [ ] Align result-analysis surfaces with interview result and question detail patterns

## D. Remaining Resume Source-Of-Truth Workspaces

### D1. Resume Analysis
- [ ] Redesign `apps/web/src/pages/resume-analysis/ResumeAnalysisPage.tsx`
- [ ] Reframe the page around claim defense quality, not static analysis output
- [ ] Make extracted risks and missing support actionable

### D2. Resume Editor
- [ ] Redesign `apps/web/src/pages/resume-editor/ResumeEditorPage.tsx`
- [ ] Make the editor feel like source-of-truth authoring, not isolated document editing
- [ ] Keep claim clarity, evidence density, and interview defensibility visible

### D3. Resume Heatmap
- [ ] Redesign `apps/web/src/pages/resume-heatmap/ResumeHeatmapPage.tsx`
- [ ] Redesign `apps/web/src/pages/resume-heatmap/ResumeHeatmapAnchorPage.tsx`
- [ ] Ensure heatmap visuals support prioritization instead of becoming decorative analytics

### D4. Resume Tailor Flow
- [ ] Redesign `apps/web/src/pages/resume-tailor/ResumeTailorLandingPage.tsx`
- [ ] Redesign `apps/web/src/pages/resume-tailor/ResumeTailorJobPostingsPage.tsx`
- [ ] Redesign `apps/web/src/pages/resume-tailor/ResumeTailorAnalysisListPage.tsx`
- [ ] Redesign `apps/web/src/pages/resume-tailor/ResumeTailorAnalysisDetailPage.tsx`
- [ ] Align the entire flow with the same source-of-truth and interview-preparation mental model

## E. Secondary Product Surfaces

### E1. Skills And Practical Interviews
- [ ] Redesign `apps/web/src/pages/skills/SkillsPage.tsx`
- [ ] Redesign `apps/web/src/pages/practical-interviews/PracticalInterviewListPage.tsx`
- [ ] Redesign `apps/web/src/pages/practical-interviews/PracticalInterviewReviewPage.tsx`
- [ ] Keep these screens visually subordinate to the core interview DFS loop

### E2. Auth Surfaces
- [ ] Redesign `apps/web/src/pages/login/LoginPage.tsx`
- [ ] Redesign `apps/web/src/pages/signup/SignupPage.tsx`
- [ ] Align with the product tone without turning auth into a marketing page

## F. Shared Design System Cleanup

### F1. Shared Surface Patterns
- [ ] Audit top workspace surfaces for repeated CSS that should be shared
- [ ] Consolidate repeated hero, stat, chip, and muted-note patterns
- [ ] Reduce per-page one-off styling where the pattern is already stable

### F2. Token Discipline
- [ ] Audit spacing drift
- [ ] Audit radius drift
- [ ] Audit border and shadow drift
- [ ] Audit accent-color drift
- [ ] Keep one consistent dark workspace language across all redesigned pages

### F3. Navigation And Structure
- [ ] Re-check global navigation labels against the workspace-first hierarchy
- [ ] Make sure practice, review, and resume context read as one connected system
- [ ] Reduce leftover route-first cues where they weaken the product mental model

## G. Verification Checklist

### G1. Per Work Unit
- [ ] Run page-specific tests after each redesign unit
- [ ] Run `npm run build` for the web app after each redesign unit
- [ ] Check desktop layout behavior
- [ ] Check mobile layout behavior
- [ ] Check sticky rails and overflow behavior
- [ ] Check text duplication against test expectations

### G2. Final Acceptance Pass
- [ ] Verify daily practice journey
- [ ] Verify question exploration journey
- [ ] Verify review and retry journey
- [ ] Verify resume source-of-truth authoring journey
- [ ] Verify interview session to result continuity
- [ ] Verify the product reads as one interview workspace rather than a set of disconnected pages

## Suggested Execution Order

1. Interview flow: `InterviewPage` -> `InterviewSessionPage` -> `InterviewResultPage`
2. Question/answer flow: `QuestionDetailPage` -> `AnswerEditorPage` -> `ResultAnalysisPage`
3. Resume source-of-truth flow: `ResumeAnalysisPage` -> `ResumeEditorPage` -> `ResumeHeatmap*` -> `ResumeTailor*`
4. Secondary surfaces: `SkillsPage` -> `PracticalInterview*` -> `LoginPage` -> `SignupPage`
5. Shared system cleanup and final acceptance pass
