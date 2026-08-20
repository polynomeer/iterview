# 01-product-foundation

This document explains `iterview` at the product level before the reader dives into backend or frontend implementation detail.

It is written for three audiences:
- a first-time GitHub visitor trying to understand what the product is
- a hiring manager or reviewer evaluating product thinking and execution depth
- a developer who needs the mental model behind the repository

## Product Summary

`iterview` is an interview training platform built around one primary job:

help a user understand and defend every meaningful claim in their resume before the real interview.

The product is not designed as a one-off mock interview toy. It is designed as a resume-defense learning system:

```text
resume version
-> source of truth for each claim, project, and experience
-> root interview question
-> follow-up question generation
-> DFS traversal of the question tree
-> answer simulation and feedback
-> coverage review and next weak branch
```

That loop is the product's center of gravity. Every major feature should reinforce it.

## Core Problem

Most interview preparation tools fail in one of two ways:
- they provide generic question lists without enough personal context
- they provide one-shot mock interviews without a durable learning loop

`iterview` is meant to close that gap by combining:
- the user's resume as the context anchor
- a detailed source of truth for each resume claim
- curated and generated interview questions
- follow-up expansion that keeps drilling until the answer reaches atomic detail
- persistent answer history
- structured scoring and review state
- interview-session and replay workflows that still feed back into practice

## Product Goals

The platform should help a user answer these questions every time they return:
- What should I practice today?
- Which questions have I not actually mastered yet?
- Which parts of my resume can I defend confidently?
- Which parts of my resume still collapse under follow-up questions?
- Have I walked every branch of the important question trees yet?
- Where am I weak relative to the role or company I care about?
- How am I improving over time?

## Product Pillars

### 1. Resume-Grounded Practice

The user's resume is not just an uploaded attachment. It is a source of evidence and context for:
- question recommendation
- interview openings and follow-ups
- coverage analysis
- resume defense preparation

### 2. Resume Source Of Truth

The system should help the user write and maintain a detailed source of truth for the resume:
- what exactly happened in each project, role, and achievement
- what evidence supports each claim
- which metrics, decisions, trade-offs, and outcomes can be defended
- which areas are still vague and likely to fail under follow-up

This is not supporting metadata. It is one of the product's two central artifacts.

### 3. DFS Question Traversal

The product should not stop at a root interview question.

It should keep expanding and traversing follow-up questions until the user has explored the full tree depth-first:
- root question
- first follow-up
- deeper tail-question
- leaf-level clarification or evidence defense

The goal is not breadth alone. The goal is to reach the atomic units that expose whether the resume claim is truly understood.

### 4. Durable Learning State

The system should preserve meaningful history:
- resume versions are immutable
- answer attempts are append-only
- retry and archive decisions are persisted
- interview sessions remain reviewable after completion

### 5. Actionable Feedback

The product should not stop at a score. It should guide the next action:
- retry this question
- revisit this skill area
- go deeper on this branch of the question tree
- fill in the missing source-of-truth detail for this resume claim
- inspect this weak answer pattern
- practice defending this resume project or experience

### 6. Layered Depth

The first experience should be easy to understand, but the product should scale into deeper workflows:
- question catalog and answer submission
- result analysis and retry
- resume source-of-truth authoring
- DFS question-tree traversal
- skill and gap visibility
- resume heatmaps and tailoring
- mock interview sessions
- practical interview replay
- resume editing and revision workflows

### 7. Bilingual Readiness

The surrounding product experience should support Korean and English while preserving original user-authored source content.

## Product Scope

`iterview` currently exists as a two-app monorepo:
- `apps/api`
  Kotlin and Spring Boot backend for identity, resume processing, persistence, scoring, review, interview, and reporting APIs
- `apps/web`
  React and Vite frontend for the user-facing product experience

## Current Feature Surface

The repository already supports a broad MVP-plus feature set:

### Identity and profile
- sign up and login
- authenticated bootstrap
- profile editing
- target-company preferences
- user settings including preferred language

### Resume workflows
- resume containers
- immutable resume versions
- PDF upload and extracted-structure workflows
- active resume selection
- resume claim understanding and evidence capture workflows
- resume analysis runs and exports
- resume heatmap and resume editor workspaces
- resume tailoring flows against job postings

### Question and answer loop
- practice list
- question detail
- question trees and DFS-oriented follow-up exploration
- answer submission
- answer history
- result analysis
- review queue
- archive
- home and feed

### Intelligence and interview workflows
- question tree and recommended follow-ups
- reference answers and learning materials
- skills radar, gaps, and progress APIs
- mock interview sessions
- resume coverage views for interview results
- practical interview upload, transcript review, structuring, and replay support

## Canonical User Journeys

### Journey 1: Daily practice

```text
home
-> today's prompt or weak area
-> question detail
-> answer editor
-> result analysis
-> retry later or archive now
```

### Journey 2: Resume-centered readiness

```text
resume upload
-> extraction and analysis
-> write or inspect source of truth for each major claim
-> identify resume risks and defendable evidence
-> targeted practice or interview flow
```

### Journey 3: Mock interview

```text
choose resume version
-> generate or select root questions
-> answer questions and follow-ups
-> traverse deeper branches DFS-style
-> inspect session result and resume coverage
-> feed useful artifacts back into source of truth, archive, and review
```

### Journey 4: Practical interview replay

```text
upload real interview audio
-> transcript and structure review
-> derive reusable question assets and interviewer profile
-> launch replay-oriented simulation
```

## Product Rules That Should Stay Stable

- questions are global shared assets
- answer attempts remain immutable after submission
- resume versions remain immutable historical records
- source-of-truth records must stay attributable to a specific resume version or claim scope
- retry scheduling is persisted state, not an ad hoc UI computation
- archive remains question-level even when the source was an interview turn
- interview history remains distinct from archive
- user-authored or uploaded source content stays in its original language
- new capabilities should extend the current loop rather than replace it

## Product Direction

The current direction of the repository is not to pivot away from the MVP. It is to deepen it in controlled layers:

- make resume context more visible in recommendations and analysis
- make resume source-of-truth authoring a first-class workflow
- strengthen skill and readiness signals
- enrich question depth with trees, follow-ups, and DFS traversal support
- make interview sessions more explainable and replayable
- support richer resume editing, tailoring, and review workflows

## Document Ownership

Shared product intent belongs in root `docs/`.

Backend-specific implementation detail belongs in:
- `apps/api/docs/`

Frontend-specific implementation detail belongs in:
- `apps/web/docs/`
