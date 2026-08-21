# 03-routes-and-flows

This document explains how the product is expressed as routes and user flows in the web application.

## Route Principles

- routes should map to meaningful user journeys
- public and protected routes should be obvious
- new capabilities should prefer additive route growth over route replacement
- route names should stay understandable to someone reading the repository for the first time

## Public Routes

- `/`
  Home page
- `/practice`
  Practice list
- `/questions/:questionId`
  Question detail
- `/questions/:questionId/tree`
  Question tree
- `/feed`
  Feed
- `/login`
  Login
- `/signup`
  Sign up

These routes are valuable even to a reviewer because they describe the public-facing reading order of the product.

## Protected Routes

- `/skills`
- `/review-queue`
- `/questions/:questionId/answer`
- `/answer-attempts/:answerAttemptId/result`
- `/archive`
- `/profile`
- `/profile/resumes`
- `/profile/resumes/analysis`
- `/resume-versions/:versionId/heatmap`
- `/resume-versions/:versionId/heatmap/anchors/:anchorType/:anchorId`
- `/resume-versions/:versionId/editor`
- `/resume-tailor`
- `/resume-tailor/job-postings`
- `/resume-tailor/resume-versions/:versionId/analyses`
- `/resume-tailor/resume-versions/:versionId/analyses/:analysisId`
- `/interviews`
- `/interviews/:sessionId`
- `/interviews/:sessionId/result`
- `/practical-interviews`
- `/practical-interviews/upload`
- `/practical-interviews/:recordId`
- `/practical-interviews/:recordId/transcript`
- `/practical-interviews/:recordId/questions/:questionId`
- `/practical-interviews/:recordId/simulate`

## Primary User Flows

### 1. Daily practice flow

```text
Home
-> Practice list or daily prompt
-> Question detail
-> Answer editor
-> Result analysis
-> Review queue or archive
```

Relevant routes:
- `/`
- `/practice`
- `/questions/:questionId`
- `/questions/:questionId/answer`
- `/answer-attempts/:answerAttemptId/result`
- `/review-queue`
- `/archive`

### 2. Resume-centered learning flow

```text
Profile / resumes
-> choose or upload version
-> inspect extraction and analysis
-> open heatmap or editor
-> return to practice or interview
```

Relevant routes:
- `/profile`
- `/profile/resumes`
- `/profile/resumes/analysis`
- `/resume-versions/:versionId/heatmap`
- `/resume-versions/:versionId/editor`

### 3. Mock interview flow

```text
Interview landing
-> choose resume version and mode
-> interview session
-> interview result
-> archive and resume-map follow-up
```

Relevant routes:
- `/interviews`
- `/interviews/:sessionId`
- `/interviews/:sessionId/result`

### 4. Practical interview replay flow

```text
Practical interview list
-> upload or open record
-> inspect transcript and structured review
-> launch replay-oriented simulation
```

Relevant routes:
- `/practical-interviews`
- `/practical-interviews/upload`
- `/practical-interviews/:recordId`
- `/practical-interviews/:recordId/transcript`
- `/practical-interviews/:recordId/questions/:questionId`
- `/practical-interviews/:recordId/simulate`

### 5. Resume tailoring flow

```text
Resume tailor landing
-> manage job postings
-> choose resume version
-> inspect analyses
-> inspect detail and export artifacts
```

Relevant routes:
- `/resume-tailor`
- `/resume-tailor/job-postings`
- `/resume-tailor/resume-versions/:versionId/analyses`
- `/resume-tailor/resume-versions/:versionId/analyses/:analysisId`

## Navigation Model

The app currently has:
- a primary home-centric experience
- tab-like and secondary navigation surfaces
- protected route handling at the router level

The `routeConfig` source of truth is:
- `src/shared/config/routes.ts`

This file should remain the canonical location for path construction and labels.

## Route Ownership Guidance

### Routes that should remain stable

- home
- practice
- question detail
- answer editor
- result analysis
- review queue
- archive
- profile
- resume

These routes define the baseline learning loop and should not be casually redesigned.

### Routes that can expand additively

- question tree
- skills
- resume analysis
- heatmap
- resume editor
- resume tailor
- interviews
- practical interviews

These routes already represent deeper product layers and can evolve without undermining the baseline route map.

## Route Design Constraints

- route names should stay human-readable
- dynamic params should identify stable domain records
- result pages should remain inspectable after the originating action completes
- additive interview or replay routes should reuse existing mental models where possible

