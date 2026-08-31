# ADR 0051: Reframe Profile As A Career Context Workspace

## Status
Accepted

## Context
- The profile route still mixed stable account editing with interview preparation context, so it did not match the focused workspace structure shown in `docs/references/design/career-context.png`.
- In this product, the more important job of the route is not simple identity editing. It is helping the user understand which projects, claims, and interview questions must be defended from the resume source of truth.
- The redesign program is standardizing core routes around a desktop-first workspace model with a strong center board, a right inspector, and a compact lower summary band.

## Decision
- Reframe the profile route into a career-context workspace with:
  - a top KPI band for role, experience, target role, target companies, and resume status
  - a central board for career DNA, experience timeline, and key projects
  - a right project inspector for featured evidence and related interview questions
  - a lower operations deck that preserves account editing, image upload, and linked workspaces without competing with the main preparation surface
- Preserve the current profile, settings, and upload contracts, and derive sample-aligned presentation from existing data plus low-risk mock workspace chrome where current APIs are thinner than the reference.
- Treat profile editing as a secondary operations area instead of the route's primary visual hierarchy.

## Consequences
- The route now behaves like a preparation workspace instead of a settings-like profile page.
- Existing profile mutations remain intact, so no backend changes are required for the redesign.
- Future work can add real project selection, richer resume evidence linking, and live company targeting inside the new board-and-inspector structure without another large rewrite.
