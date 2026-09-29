# 0073. Add Claude Code Agent Environment

## Status
Accepted

## Date
2026-09-29

## Context
Repository rules for coding agents already live in `AGENTS.md` at the root and inside each app. Claude Code reads `CLAUDE.md` and `.claude/settings.json` instead, so without an adapter it would miss those rules, prompt for every routine verification command, and could not start the frontend preview. The user also asked that every completed work unit be committed immediately rather than batched.

## Decision
- Keep `AGENTS.md` as the single source of truth. Root, `apps/api`, and `apps/web` each get a `CLAUDE.md` that imports the sibling `AGENTS.md` with `@AGENTS.md`.
- The root `CLAUDE.md` only adds Claude-specific notes: commit-per-work-unit policy, verification commands, and where shared artifacts live.
- Commit policy for agents: commit each completed, verified work unit automatically using Conventional Commits; include the ADR in the same commit when a shared decision is introduced.
- Share a project `.claude/settings.json` that allows read-only git inspection and the existing build/test commands, and denies reading `.env` files. Personal overrides go in the git-ignored `.claude/settings.local.json`.
- Share `.claude/launch.json` so the desktop preview can start the Vite dev server.

## Consequences
- Agent rules stay in one place; changing `AGENTS.md` updates Claude Code behavior automatically.
- History becomes more granular because agents commit per work unit.
- Settings in `.claude/settings.json` apply to every collaborator using Claude Code, so additions should stay limited to safe, repository-local commands.
