# 05-workspace-redesign-workplan

This document translates the redesign references added on August 22, 2026 into an actionable repository-level workplan for `iterview`.

Reference inputs:
- [`iterview-redesign-concept.md`](iterview-redesign-concept.md)
- [`iterview-redesign-sample.png`](iterview-redesign-sample.png)

Those files are treated as design references, not as implementation instructions. This plan adapts their direction to the actual purpose, architecture, and delivery constraints of `iterview`.

## Why This Plan Exists

`iterview` has already established its core product purpose:
- build a reliable source of truth for resume claims
- simulate interview questioning depth-first until answers hold at atomic detail

The redesign references sharpen that idea into a stronger product metaphor:

> `iterview` should feel less like a card-based study app and more like a workspace for traversing interview knowledge, evidence, and follow-up branches.

This matters because the current redesign work can still fail in a predictable way:
- polishing isolated pages without changing the product mental model
- preserving route structure while leaving the interaction model fragmented
- making the UI cleaner without making the DFS interview workflow more obvious

This plan exists to prevent that failure mode.

## Design Read

Read `iterview` as:

> a developer-tool-like interview preparation workspace where resume evidence, question trees, follow-up branches, answer attempts, and review queues are explored in one continuous context

The reference direction is closest to:
- Linear for navigation restraint and inspector behavior
- Git graph tooling for branch and depth traversal
- knowledge graph tools for map-style exploration

The product should still remain:
- serious
- compact
- readable
- evidence-first
- calm under repeated daily use

It should explicitly avoid:
- generic AI SaaS dashboard chrome
- feed-first interaction models
- decorative card overload
- page transitions that break interview context

## What The Reference Materials Add

The newly added concept and sample contribute four strong decisions that should now be treated as default redesign assumptions.

### 1. The main product metaphor changes

The product center should move from:

```text
home -> cards -> detail page -> answer page
```

to:

```text
workspace -> graph/path explorer -> inspector -> answer/review surface
```

### 2. DFS becomes a visible interaction model

The product should not only support DFS logically. It should show DFS visibly through:
- active path breadcrumbs
- focused branch highlighting
- sibling de-emphasis
- child expansion from the current node
- next branch recommendations in the same context

### 3. Resume context becomes graph context

Resume data should not remain a separate file-management flow.

It should feed:
- question generation
- evidence linking
- weakness review
- experience-specific follow-up branches

### 4. The default desktop shell becomes a 3-pane workspace

The sample image validates the preferred desktop composition:
- left: navigation and operational context
- center: graph or map workspace
- right: persistent inspector and answer/review context

That shell is the most important structural shift in the redesign.

## Product-Level Goals

The redesign work should optimize for these outcomes.

### Goal A. Make the main loop obvious

A user should understand, without explanation:
- what node they are currently defending
- why this question exists
- which resume claim it came from
- which follow-up branch is next
- whether this branch is still weak

### Goal B. Preserve context while moving deeper

The user should be able to:
- inspect a question
- open related evidence
- answer
- review weakness
- move to child questions

without losing the current graph or path context.

### Goal C. Make review feel like evidence triage

Review should no longer feel like a detached results page.

It should show:
- weak nodes
- skipped branches
- uncovered resume evidence
- retry candidates
- branch-level progress

### Goal D. Merge resume and practice into one system

The redesign should make it visually obvious that:

```text
resume claim -> experience/project evidence -> generated question -> follow-up branch -> answer quality -> retry decision
```

is one connected workflow.

## Non-Goals

This redesign plan does not require:
- forcing a literal freeform force-directed graph in every surface
- removing all existing routes immediately
- rebuilding backend data models before frontend structure changes
- introducing a third-party component library as a redesign shortcut
- shipping a visually dramatic concept that harms learning density

The graph metaphor should improve clarity, not become a decorative burden.

## Target Experience Model

The target model should be described in terms of workspace modes rather than isolated pages.

### Workspace Mode 1. Interview Map

Purpose:
- show the overall knowledge terrain
- reveal coverage, mastery, weakness, and resume linkage

Primary interactions:
- focus node
- filter by skill/domain/company/resume source
- switch between map, DFS focus, and all-path views
- open node in inspector

### Workspace Mode 2. DFS Focus

Purpose:
- support active preparation on one branch at a time

Primary interactions:
- highlight current path
- fade unrelated siblings
- reveal immediate children
- jump to next weak child or retry branch

### Workspace Mode 3. Question Inspector

Purpose:
- keep detail, evidence, notes, attempts, and related branches in persistent context

Primary interactions:
- review concepts
- inspect linked resume evidence
- view previous answers
- branch to related DFS questions
- start or resume answer flow

### Workspace Mode 4. Answer Workspace

Purpose:
- let the user answer without leaving graph context

Primary interactions:
- draft answer
- evaluate answer
- compare with previous attempt
- promote next child branch
- flag weak concepts

### Workspace Mode 5. Career Context

Purpose:
- keep the user's resume version, experience map, skill map, targets, and weak areas visible as preparation context

Primary interactions:
- inspect relevant resume evidence
- pivot from skill or experience into graph nodes
- identify missing source-of-truth material

## Required Information Architecture Shift

The redesign should gradually move the app from route-first IA to workspace-first IA.

### Current direction to reduce

```text
home
practice
question detail
answer editor
interview
interview result
resume
profile
archive
```

### Target direction to build toward

```text
workspace
  -> interview map
  -> dfs focus
  -> inspector
  -> answer workspace

review
  -> weak nodes
  -> skipped branches
  -> scheduled retry

career context
  -> resume source of truth
  -> experience map
  -> skill map
  -> target companies
```

This does not mean every route disappears. It means the user-facing product hierarchy should stop feeling page-fragmented.

## Workstreams

The redesign should be delivered through parallel but coordinated workstreams.

### Workstream A. Shared Shell And Navigation

Scope:
- global app shell
- left navigation model
- top command/search bar
- persistent right-side inspector behavior
- desktop and mobile shell rules

Deliverables:
- authoritative workspace shell layout
- route-to-workspace mapping
- navigation priority rules
- sticky/stable side panels where appropriate

### Workstream B. Graph And DFS Interaction Model

Scope:
- graph canvas or graph-like explorer surface
- node states
- edge emphasis
- path breadcrumbs
- mode switching between map and DFS focus

Deliverables:
- node state vocabulary
- path-highlighting behavior
- filter model
- expansion/collapse rules
- empty/loading/error states for graph data

### Workstream C. Inspector And Detail System

Scope:
- question detail in persistent panel
- related concepts
- answer history
- notes
- resume evidence
- related DFS nodes

Deliverables:
- inspector tabs or sections
- peek/open behavior rules
- resizing behavior if needed
- compact and expanded states

### Workstream D. Answer And Review Surfaces

Scope:
- answer drafting
- evaluation summary
- branch-level review
- retry recommendations
- weak-area prioritization

Deliverables:
- answer workspace layout
- branch review model
- comparison and retry UI
- clear next-step CTA hierarchy

### Workstream E. Career Context And Source Of Truth

Scope:
- resume version grounding
- evidence linkage
- experience/project visibility
- skills and target-company context

Deliverables:
- career context inspector model
- resume-to-question linkage display
- source-of-truth completeness indicators
- related experience pivot behavior

### Workstream F. Design System Consolidation

Scope:
- tokens
- typography
- spacing
- borders
- node colors
- status semantics
- interaction states

Deliverables:
- route-independent token layer
- panel and inspector primitives
- graph/status semantic rules
- consistency guardrails for future features

## Delivery Phases

The redesign should be shipped in explicit phases rather than one large visual rewrite.

### Phase 0. Planning And Data Audit

Objective:
- confirm that the target workspace model can be supported by current API and frontend state

Tasks:
- inventory current routes against target workspace modes
- inventory current question, interview, resume, and review data dependencies
- identify missing API support for graph relationships or evidence mapping
- define the minimal graph data model needed by the frontend

Exit criteria:
- page-to-workspace mapping approved
- API/data gaps documented
- component reuse candidates identified

### Phase 1. Shell First

Objective:
- make the app feel like a workspace before deep feature refactors

Tasks:
- implement authoritative 3-pane desktop shell
- normalize left navigation hierarchy
- add shared top workspace header and search entry point
- define right inspector container and open/close behavior
- align mobile fallback patterns

Exit criteria:
- one stable shell supports major routes
- context switching is visibly reduced
- shell no longer feels like separate page templates

### Phase 2. Core Workspace Surfaces

Objective:
- transform the primary preparation surfaces into graph-aware workflows

Tasks:
- redesign interview workspace around graph center + inspector
- redesign question detail as inspector-first rather than standalone detail page
- redesign interview session around active branch and answer surface
- redesign practical interview review using the same inspector/workspace logic

Exit criteria:
- core preparation flows share one interaction language
- the user can move between node, answer, and evidence without context loss

### Phase 3. Review And Retry System

Objective:
- make review branch-based instead of report-based

Tasks:
- redesign weak-area and retry flows around nodes and branches
- connect review items directly to DFS paths
- show branch status, skipped evidence, and retry readiness
- reduce detached analytics that do not drive action

Exit criteria:
- review surfaces answer "what should I retry next?"
- retry flow is one click from review to active branch

### Phase 4. Career Context Integration

Objective:
- connect resume source-of-truth workflows directly into practice

Tasks:
- merge or tightly connect resume/profile context into career context model
- expose experience and project evidence in inspector surfaces
- show source-of-truth completeness and missing evidence
- support pivots from career context into relevant graph nodes

Exit criteria:
- resume workflows feel like preparation infrastructure, not file storage
- users can trace questions back to concrete resume evidence

### Phase 5. Polish, Motion, And Hardening

Objective:
- raise finish quality without altering the interaction model

Tasks:
- refine keyboard navigation and command palette behavior
- tighten motion and hover feedback
- improve contrast and density edge cases
- verify empty/loading/error states across workspace modes
- audit performance of graph-heavy surfaces

Exit criteria:
- subtle, stable, production-ready interaction polish
- accessibility and performance baselines hold across the redesign

## Suggested Sequencing By Existing App Surfaces

The current repository already has partially redesigned surfaces. The next plan should reuse that momentum.

### Highest-priority sequence

1. `App shell` and navigation unification
2. `InterviewPage` as workspace entry
3. `InterviewSessionPage` as active DFS branch surface
4. `QuestionDetailPage` as inspector-grade question surface
5. `InterviewResultPage` and review queue as branch review surfaces
6. `Resume` and `resume-analysis` surfaces as career-context and source-of-truth surfaces
7. `Practical interview` flows aligned into the same workspace grammar

### Lower-priority sequence

1. feed-like or archive surfaces that do not define the main product loop
2. purely cosmetic page-level adjustments not tied to the workspace model

## Backend And Data Dependencies

This redesign is not only a frontend styling task.

The following backend/data capabilities should be validated early:
- question parent/child relationships
- branch depth and traversal metadata
- resume evidence linkage per question
- weak/skipped/covered facet summaries
- retry scheduling metadata
- source-of-truth completeness markers
- target company or role context where already modeled

If the current APIs cannot express these cleanly, the UI should not fake the model with brittle local-only logic.

## UX And Visual Rules For This Redesign

These rules should remain in force across the workplan.

### Layout

- desktop default is 3-pane where the journey benefits from persistent context
- mobile should collapse cleanly into stacked panels without losing path clarity
- graph center should remain visually dominant
- inspector should feel persistent, not modal by default

### Visual language

- minimal chrome
- dark-neutral workspace preferred for graph-heavy surfaces if readability stays strong
- restrained blue/green emphasis for state and progress
- thin borders over heavy fills
- low shadow
- compact but readable density

### Interaction

- preserve context when opening details
- avoid full-page transitions for node inspection when possible
- use subtle motion only
- support keyboard-first navigation where feasible
- surface next recommended action in every major workspace state

## Risks

### Risk 1. Graph novelty without clarity

The graph can become visually impressive but operationally worse than the current UI.

Mitigation:
- prioritize DFS focus view over decorative freeform graph behavior
- keep active-path highlighting explicit
- test branch readability under realistic node counts

### Risk 2. Frontend redesign outruns backend truth

The workspace may imply relationships the API cannot reliably provide.

Mitigation:
- validate data contracts in Phase 0
- block UI promises that cannot be backed by stable data

### Risk 3. Too many metaphors at once

Mixing IDE, graph, dashboard, and study-app patterns can create inconsistency.

Mitigation:
- keep one dominant mental model: workspace for graph-based interview defense
- use other references only for interaction patterns, not visual mimicry

### Risk 4. Context persistence hurts mobile usability

Desktop persistence patterns can become cluttered on small screens.

Mitigation:
- define mobile collapse rules as first-class design work, not as a late fallback

### Risk 5. Phase work collapses back into page-by-page polish

The team may keep shipping attractive local changes without completing the interaction reset.

Mitigation:
- evaluate every change against the workspace model
- reject work that improves visuals but not product clarity

## Acceptance Criteria For The Plan

This workplan is being followed correctly only if the shipped redesign makes these statements true.

- A user can identify their current question path immediately.
- A user can inspect question detail without losing graph context.
- A user can trace a question back to resume evidence.
- A user can see weak branches and retry them directly.
- The product feels like one connected preparation workspace rather than a set of unrelated pages.
- The redesign vocabulary is consistent across interview, question, review, and resume-adjacent surfaces.

## Immediate Next Actions

The next concrete steps should be:

1. Create a route-to-workspace mapping table for all major frontend pages.
2. Define the authoritative 3-pane shell behavior for desktop and mobile.
3. Specify the graph node model, node states, and DFS highlighting rules.
4. Convert question detail and interview session surfaces to inspector-first interaction.
5. Define the career-context model that connects resume source-of-truth data into the workspace.

## Document Relationship

This document extends, not replaces:
- [`01-product-foundation.md`](01-product-foundation.md)
- [`02-implementation-roadmap.md`](02-implementation-roadmap.md)
- [`03-acceptance-baseline.md`](03-acceptance-baseline.md)
- [`04-design-refresh-strategy.md`](04-design-refresh-strategy.md)

Use this file when the question is:

> "What exactly are we rebuilding the redesign toward, and in what order?"

