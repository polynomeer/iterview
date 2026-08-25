# 08-manual-visual-qa-sweep

Date: 2026-08-25

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
2. `/practice`
3. `/questions/question-1/tree`
4. `/questions/question-1`
5. `/questions/question-1/answer`
6. `/answer-attempts/attempt-1/result`

Check:
- hero hierarchy reads clearly at a glance
- primary CTA is obvious without scrolling
- no cards collapse awkwardly at tablet width
- no duplicate CTA intent appears in the same visible area

### B. Recovery Loop

1. `/review-queue`
2. `/weak-nodes`
3. `/scheduled-reviews`
4. `/archive`

Check:
- queue/list items do not collide with side rails
- graph/list/detail layout still reads left-to-right on desktop
- mobile stacks keep the remediation priority clear
- sticky detail rails do not trap content below the fold

### C. Source-Of-Truth Loop

1. `/profile/resumes`
2. `/profile/resumes/analysis`
3. `/resume-versions/version-1/editor`
4. `/resume-versions/version-1/heatmap`
5. `/resume-versions/version-1/heatmap/anchors/project/1`

Check:
- editor side panels do not overflow their container
- heatmap overlays and popovers stay inside the viewport
- sticky source/detail rails remain readable on narrow desktop
- long chips, labels, and annotations do not break the grid

### D. Interview Loop

1. `/interviews`
2. `/interviews/session-1`
3. `/interviews/session-14/result`

Check:
- workspace continuity rail does not visually overpower the main surface
- active branch panels and result summaries keep one obvious next move
- action clusters do not wrap into noisy multi-line button groups
- mobile stacking preserves the session/result narrative

### E. Secondary Workspaces

1. `/notes`
2. `/bookmarks`
3. `/target-companies`
4. `/settings`

Check:
- search + filter controls wrap cleanly on mobile
- right-hand detail panels stay legible on desktop
- empty spacing does not feel accidental or underdesigned
- supporting chips do not create horizontal scroll

## Sticky And Overflow Watch List

Pages with the highest sticky/overflow risk:
- `/resume-versions/version-1/editor`
- `/resume-versions/version-1/heatmap`
- `/interviews/session-1`
- `/interviews/session-14/result`
- `/weak-nodes`
- `/target-companies`
- `/notes`

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
