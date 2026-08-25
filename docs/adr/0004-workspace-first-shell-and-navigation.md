# ADR 0004: Adopt a Workspace-First Shell and Navigation Model

- Status: Accepted
- Date: 2026-08-25

## Context

As more flows were added, the frontend risked feeling like a collection of unrelated screens. Core features such as interview practice, review, archive, notes, and resume analysis all needed to feel like connected parts of one preparation environment.

## Decision

The product uses a workspace-first navigation model:

- persistent desktop sidebar navigation
- shared top toolbar
- consistent page containers
- flow-specific workspace surfaces inside each major page

Pages should feel like workspaces with context, guidance, and next actions, not isolated CRUD screens.

## Consequences

- Navigation state and active location need clear visual emphasis.
- Shared shell components become critical shared infrastructure.
- New pages should integrate into the workspace model rather than introducing unrelated chrome.
- UX decisions must optimize continuity between home, practice, review, archive, interview, and resume-centered surfaces.
