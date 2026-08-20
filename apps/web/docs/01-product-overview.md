# 01-product-overview

This document explains the product from the frontend's point of view.

The shared cross-app product direction lives in root [`../../../docs/01-product-foundation.md`](../../../docs/01-product-foundation.md). This file narrows the focus to one question:

How should the web application present the `iterview` learning loop so that users always understand their next action, their weak points, and their progress?

## Frontend View Of The Product

From the frontend perspective, `iterview` is a guided resume-defense workspace.

The UI should make the user journey feel coherent:

```text
home
-> resume source-of-truth review
-> question tree exploration
-> DFS answer simulation
-> feedback review
-> next weak branch or resume follow-up
```

Every major screen should reinforce that loop rather than compete with it.

## Current Frontend Scope

The current application already includes route areas for:
- home and daily guidance
- practice list and question detail
- answer editor and result analysis
- review queue and archive
- feed and profile settings
- resume management
- resume analysis, resume heatmap, and resume tailoring flows
- skills dashboard
- mock interview, interview session, and interview result screens
- practical interview list and review flows
- login and signup

## Product Principles The Frontend Must Preserve

### 1. Home Must Answer "What Should I Do Next?"

- the first screen should surface today's most valuable action
- review work, weak areas, and interview preparation should feel prioritized rather than scattered
- analytics should support action, not become the product's main burden

### 2. Question Detail Must Be The Main Learning Surface

- question detail should remain the core place to understand what the user is practicing
- depth features such as follow-up trees, DFS traversal state, or study materials should extend that screen, not replace it
- users should always be able to move clearly from a question to writing or reviewing an answer

### 3. Result Analysis Must Explain Improvement

- result screens should show what was strong, what was weak, and what to do next
- retry recommendations should feel justified
- when skill or resume context is added, it should clarify the feedback rather than overload the page

### 4. Resume Context Should Stay Visible

- resume versions are not just files; they are learning context for practice and interview flows
- the user should be able to inspect the source of truth behind a resume claim before or after answering
- resume analysis and interview surfaces should help users understand which resume evidence they can or cannot defend yet
- resume-linked insights should stay explainable in the UI

### 5. Interview Flows Must Stay Connected To The Core Loop

- interview sessions are an extension of the same practice system
- interview history should remain separate from archive
- question-level learning assets from interview sessions should still feed later practice and review

### 6. New Features Should Be Additive

- preserve working route structures
- tolerate additive backend fields and endpoints
- avoid forcing a redesign of stable flows when a new capability can fit into existing pages

## Frontend Product Extensions In Scope

### Knowledge Depth

- follow-up question trees rooted in one primary question
- DFS-style traversal that lets the user keep drilling until a branch reaches leaf-level detail
- model answers and learning materials presented as study support
- visibility into what was answered, skipped, or still shallow

### Resume Source Of Truth

- detailed claim, metric, decision, and evidence capture for resume content
- fast navigation from a resume claim to the interview questions it should trigger
- explicit visibility into which parts of the resume are still under-specified

### Review And Improvement

- review queue prioritization based on score, weakness, and staleness
- retry comparisons that show whether an answer actually improved
- archive views that distinguish `Practice` and `Interview` sources where available

### Interview History

- interview start flow grounded in an explicit resume version
- interview modes such as quick screen, 30-minute mock, 60-minute mock, free interview, and `full_coverage`
- session detail review with question and follow-up traceability
- post-session resume coverage views that connect resume evidence back to interview turns

### Practical Interview Replay

- upload and inspect one real interview recording
- review raw, cleaned, and confirmed transcript layers separately
- browse structured questions, answers, and follow-up relations extracted from that interview
- seed replay-oriented simulation from the imported interview style

### Bilingual Experience

- Korean and English UI support
- mixed-language screens where the interface is localized but user-authored content remains original
- AI-generated guidance and analysis that follow the selected system language

## MVP Frontend Responsibilities

- render the learning loop clearly on mobile-first screens
- keep route-level logic in `pages`
- keep server state in React Query
- keep contracts typed through `shared/api` and `shared/types`
- preserve loading, empty, error, and auth-required states on major routes
- remain backward-compatible with additive API responses

## Integration Principles

- do not remove working features that already map to the current codebase
- extend existing endpoints before introducing unrelated new top-level concepts
- prefer optional additive response fields so older clients can continue working
- keep current terminology stable:
  - `review queue` for retry work
  - `result analysis` for answer evaluation
  - `archive` for mastered questions
  - `resume version` for the active interview context

## Out Of Scope Unless Requested

- lounge or social discussion flows
- public answer comparison
- GitHub sync UI
- admin tooling

## Where To Read Next

- architecture: [`02-frontend-architecture.md`](02-frontend-architecture.md)
- routes and flows: [`03-routes-and-flows.md`](03-routes-and-flows.md)
- API integration: [`04-api-integration.md`](04-api-integration.md)
- docs index: [`README.md`](README.md)
