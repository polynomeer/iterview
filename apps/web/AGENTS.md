# AGENTS.md

## Repository Purpose
This repository contains the frontend implementation for an interview training platform.

The MVP frontend is responsible for:
- home screen with daily question card
- question browsing and filtering
- question detail screen
- answer editor
- result analysis screen
- archive screen
- basic feed
- profile and resume management screens

## Tech Stack
- React
- TypeScript
- Vite
- React Router
- React Query

## UI Principles
- mobile-first
- task-oriented screens
- clear primary action on every screen
- minimal nesting
- reusable cards and lists
- strong emphasis on today's question on home
- score/result screens must clearly explain next action

## Recommended Structure
src/
- app
- pages
- features
- entities
- widgets
- shared

## Hard Rules
- keep route-level logic in pages
- keep server state in React Query
- keep API client typed
- keep domain UI models explicit
- do not scatter endpoint strings across the app
- do not put major business rules in the UI
- handle loading, empty, and error states on main screens
- preserve mobile usability first

## Domain Rules
- a question card may be new, retry, improving, or archived
- result screen must show total score and dimension scores
- answer history belongs to the current user only
- archive screen shows mastered questions only
- home should distinguish today's main card and retry cards
- feed should distinguish popular and trending sections

## Out of Scope
Do not implement unless explicitly requested:
- lounge community
- mock interview
- GitHub sync
- public answer comparison
- admin screens

## Definition of Done
A task is complete only if:
- app builds
- route structure is coherent
- API integration matches docs
- loading, empty, and error states are handled
- acceptance criteria are satisfied

## Git Commit Rules

Commit changes automatically at logical checkpoints.

A checkpoint means:

- one migration set is complete
- one API slice is complete
- one screen flow is complete
- one testable unit of work is complete

Before every commit:

1. run the relevant tests for the changed scope
2. ensure the project still builds
3. check git diff for unrelated changes
4. include only files related to the current task

Commit style:

- use Conventional Commits
- format: <type>(<scope>): <summary>

Allowed types:

- feat
- fix
- refactor
- test
- docs
- chore

Examples:

- feat(profile): add user profile update API
- feat(resume): add resume version activation flow
- feat(answer): persist answer attempts and score records
- fix(review): prevent archived questions from entering retry queue
- docs(api): update answer submission contract

Commit frequency:

- commit after each completed milestone
- do not bundle unrelated changes into one commit
- if a task is large, create intermediate checkpoint commits

After completing a task:

- create a commit automatically if git commit is permitted in the environment
- if commit is blocked by sandbox or approval policy, explicitly report that the code is ready and provide the exact commit message that should be used
