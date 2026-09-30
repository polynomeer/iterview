# 08-manual-visual-qa-sweep

Date: 2026-08-25 (routes updated 2026-09-30 after redesign Phase 5; see `apps/web/docs/03-routes-and-flows.md`)

This document lists the remaining manual visual QA work for the redesigned `iterview` workspace.

Automated route coverage is already broad. What remains is visual verification that layout, sticky rails, and overflow behavior feel intentional across the main workspace families.

## Goal

Confirm that the redesigned product:
- feels coherent on desktop and mobile
- keeps sticky side rails usable without clipping content
- avoids horizontal overflow and broken long-page scrolling
- preserves one clear next action per workspace

## Viewports To Check

Use at least these widths:
- mobile: `390 x 844`
- tablet: `820 x 1180`
- desktop: `1440 x 900`

If a page has a dense side rail, also check:
- narrow desktop: `1280 x 800`

## Priority Route Sweep

### A. Core Daily Loop

1. `/`
2. `/questions` and `/questions/skills`
3. `/questions/1/tree`
4. `/questions/1`
5. `/questions/1/answer` (focus mode, no shell)
6. `/attempts/1`

Check:
- hero hierarchy reads clearly at a glance
- primary CTA is obvious without scrolling
- no cards collapse awkwardly at tablet width
- no duplicate CTA intent appears in the same visible area

### B. Recovery Loop

1. `/review`
2. `/review/done`

Check:
- the week strip and the due list read together on desktop and stack on mobile
- each row keeps its 답하기 / 나중에 / 완료 actions on one line or wraps cleanly

### C. Source-Of-Truth Loop

1. `/resume` (redirects to the active version's hub)
2. `/resume/1` (개요)
3. `/resume/1/claims`
4. `/resume/1/heatmap`
5. `/resume/1/heatmap/anchors/project/1`
6. `/resume/1/tailor` and one analysis, for example `/resume/1/tailor/1`
7. `/resume/1/versions`

Check:
- the version bar and route tabs stay on one line on desktop and scroll horizontally, not wrap, on phones
- editor side panels do not overflow their container
- heatmap highlights and their inline question lists stay inside the viewport
- sticky source/detail rails remain readable on narrow desktop
- long chips, labels, and annotations do not break the grid

### D. Interview Loop

1. `/interview`
2. latest live session route created from the interview workspace, for example `/interview/sessions/1` (focus mode, no shell)
3. the matching completed result route, for example `/interview/sessions/1/result`
4. `/interview/records` and `/interview/records/upload`

Check:
- the live session shows one question and one answer box, with progress and the timer in the top bar
- result summaries keep one obvious next move
- action clusters do not wrap into noisy multi-line button groups
- mobile stacking preserves the session/result narrative

### E. Settings, Auth, And Explore

1. `/settings` (and `/settings/profile`, which jumps to the profile section)
2. `/login` and `/signup` signed out (no shell)
3. `/explore` signed in and signed out

Check:
- the settings section index is a sticky column on desktop and a scrolling row on mobile
- auth screens keep the form above the fold on phones
- explore cards fill the grid without clipped titles

The sample-data pages (`/weak-nodes`, `/scheduled-reviews`, `/target-companies`, `/notes`, `/bookmarks`) were retired in Phase 5 (ADR 0079). Their URLs redirect and need no visual pass.

## Sticky And Overflow Watch List

Pages with the highest sticky/overflow risk:
- `/resume/1/claims`
- `/resume/1/heatmap`
- latest live session route, for example `/interview/sessions/1`
- matching completed result route, for example `/interview/sessions/1/result`
- `/interview/records/1` and its transcript and simulate routes

For each page above, verify:
- no horizontal page scroll
- sticky panel top offset feels aligned with the shell
- sticky panel stops naturally before footer/content end
- long text blocks do not clip inside cards
- action rows collapse vertically before they wrap awkwardly

## Pass Criteria

Mark the sweep complete only if:
- desktop layout feels stable across the priority routes
- mobile stack order remains intentional across the priority routes
- sticky panels never hide critical controls or text
- no obvious overflow, clipped chips, or broken CTA rows remain

## Expected Outcome

After this sweep, the remaining redesign work should be limited to:
- isolated CSS cleanup found during the visual pass
- any final token cleanup caused by repeated visual defects

## Current Sweep Status

Status on August 26, 2026:
- desktop authenticated route sweep completed
- desktop sticky/overflow sweep completed
- mobile and tablet dedicated viewport sweep completed

Verified desktop routes in the August 26 pass:
- `/`
- `/questions`
- `/review`
- `/weak-nodes`
- `/resume`
- `/resume/analysis`
- `/resume/1/claims`
- `/resume/1/heatmap`
- `/resume/1/heatmap/anchors/project/1`
- `/interview`
- `/interview/sessions/1`
- `/interview/sessions/1/result`
- `/notes`
- `/target-companies`

Desktop findings from that pass:
- no horizontal overflow was detected on the verified routes at `1280px` width
- verified sticky elements kept stable top offsets where present
- protected routes were validated using the local demo-authenticated workspace
- no additional desktop CSS fix was required from the final authenticated pass

Mobile and tablet findings from the August 26 follow-up pass:
- verified routes passed at `390 x 844` and `820 x 1180` with no page-level horizontal overflow
- `/resume` required metric-card wrapping cleanup on tablet and now passes without overflow
- `/interview` required tighter mobile graph stacking and now passes without page-level overflow
- a live session was created from the interview workspace and verified at `/interview/sessions/1`
- that same session was advanced to a completed result and verified at `/interview/sessions/1/result`
- the earlier fallback-only check was superseded by the live session/result verification on August 26, 2026

Remaining gap:
- none inside the current redesign acceptance scope
