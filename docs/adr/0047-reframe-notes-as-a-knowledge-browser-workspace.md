# ADR 0047: Reframe Notes As A Knowledge Browser Workspace

## Status
Accepted

## Context
- The notes route already contained the right domain objects, but it still felt like a stacked editor page instead of the sample-aligned workspace in `docs/references/design/notes.png`.
- Users need notes to behave as reusable interview-defense fragments that stay connected to linked questions, resume evidence, and adjacent concept notes.
- The redesign direction across workspace pages is converging on a desktop pattern with a left browser rail, a central working canvas, and a right context inspector.

## Decision
- Reframe the desktop notes route into a knowledge browser workspace with:
  - a sticky left rail for note creation, search, pinned notes, and the broader note list
  - a central markdown canvas that looks like an active editor surface with tabs, toolbar controls, mini stats, and save status
  - a right inspector rail for note metadata, linked questions, resume context, related skills, and backlinks
- Preserve the current mock data model and route structure, and implement the redesign through composition changes plus workspace-theme overrides.
- Add lightweight interface affordances implied by the sample, such as browser counts, editor window actions, and note-level chrome, without changing data contracts.

## Consequences
- The notes route now reads more like a real knowledge workspace and stays visually aligned with the other redesigned product surfaces.
- The editor remains mock-driven, but the UI contract for richer note operations is now clearer.
- Future work can attach real persistence, editor commands, and graph navigation behavior without another major layout rewrite.
