# 02-implementation-roadmap

This document explains how the product should evolve without losing operational coherence.

It is not a backlog dump. It is a sequencing document that keeps backend, frontend, and shared product intent aligned.

## Planning Principles

- keep backend and frontend changes additive whenever possible
- preserve working routes and contracts unless a change is explicitly coordinated
- keep app-specific logic and docs inside the owning app
- move shared guidance to root `docs/` only when both apps depend on it
- verify each slice in the scope that changed before expanding the next slice

## Delivery Strategy

The repository already contains more than a minimal MVP. The right strategy is therefore expansion by reinforcement:

1. protect the existing practice loop
2. enrich the resume-aware parts of the system
3. deepen review and intelligence surfaces
4. strengthen interview and replay workflows
5. improve authoring and operational tooling

## Shared Delivery Phases

### Phase 1. Baseline reliability

Goals:
- keep authentication, home, practice, answer, review, archive, resume, and feed stable
- ensure both apps remain buildable and testable independently
- keep docs and CI readable for new contributors

Representative work:
- monorepo verification
- route and endpoint stability
- shared docs cleanup

### Phase 2. Resume as a first-class context system

Goals:
- treat resume versions as meaningful product context
- expose parse status, structure, and analysis results clearly
- keep immutable source resume versions intact

Representative work:
- PDF upload and extraction lifecycle
- structured resume records
- resume analysis runs
- resume heatmap linkage

### Phase 3. Intelligence-rich practice

Goals:
- surface richer feedback without bloating the core practice flow
- connect question depth, skill readiness, and review prioritization

Representative work:
- question trees
- reference answers and learning materials
- richer answer analysis
- skill radar and gap APIs plus UI

### Phase 4. Interview depth

Goals:
- make mock interview sessions grounded, explainable, and reviewable
- preserve a clean boundary between session history and archive

Representative work:
- interview start flow with explicit resume selection
- follow-up generation and snapshot persistence
- coverage-driven modes such as `full_coverage`
- result-time resume mapping

### Phase 5. Practical interview replay

Goals:
- turn real interview recordings into reusable learning assets
- keep transcript processing auditable
- reuse the existing interview engine where possible

Representative work:
- audio upload and transcription lifecycle
- transcript correction and review
- structured question-answer extraction
- interviewer profile derivation
- replay-mode session bootstrapping

### Phase 6. Editing and tailoring workflows

Goals:
- help users actively improve resume content, not only analyze it
- keep immutable source versions while supporting iterative draft work

Representative work:
- resume editor workspace
- comments, revisions, merge preview, and tracked changes
- job-posting management
- tailored resume analysis and export generation

## Cross-App Coordination Rules

Every meaningful feature slice should answer four questions:
- which backend domain owns the truth?
- which frontend route owns the user experience?
- what data contract is additive versus breaking?
- what verification proves the slice is complete?

## Recommended Scope Boundaries

### Shared documents should cover
- product intent
- monorepo policy
- acceptance baseline
- cross-app sequencing

### Backend documents should cover
- domain modeling
- schema and migration planning
- API contract detail
- operational behavior

### Frontend documents should cover
- route ownership
- state and composition patterns
- UI behavior and integration constraints
- user-facing acceptance detail

## Delivery Risks To Watch

- adding intelligence features that bypass the current answer and review pipeline
- duplicating the same concept differently across backend and frontend docs
- overloading interview history so that archive and review semantics become unclear
- pushing editor-like features without stable backend document primitives
- allowing documentation to lag behind additive API behavior

## Completion Signal

A roadmap phase should be considered healthy only when:
- the changed scope is documented
- the changed scope is verified
- new terminology is reflected consistently across backend, frontend, and shared docs
