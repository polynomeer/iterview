# 0012. Adopt Global Command Palette For Workspace Navigation

Date: 2026-08-25

## Status

Accepted

## Context

The redesign positions `iterview` as one continuous interview-preparation workspace rather than a collection of disconnected routes. The remaining navigation gap is cross-workspace retrieval: users need to jump quickly between question branches, skills, resume evidence, companies, notes, and high-value actions without depending on sidebar hierarchy alone.

The redesign concept also explicitly calls for keyboard-first navigation and a command palette pattern that feels natural for a developer-facing product.

## Decision

We will add a global command palette to the authenticated workspace shell.

The palette will:
- open from any authenticated workspace route through `Cmd/Ctrl + K`
- be reachable from the header search trigger
- search across representative question, skill, resume-evidence, company, note, and command targets
- stay route-independent so the same navigation model is available across the full workspace

## Consequences

Positive:
- keyboard-first navigation now matches the graph-and-workspace product direction
- users can recover context faster without leaving the current flow to browse multiple sections manually
- the shell gains one consistent entry point for future quick actions and deeper search integration

Trade-offs:
- the first implementation uses a curated search index rather than live backend-backed search
- palette content now needs deliberate maintenance when major workspace families change
