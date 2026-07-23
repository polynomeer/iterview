# iterview

Interview training platform monorepo root.

## Layout

```text
iterview/
  apps/
    api/    # Spring Boot backend
    web/    # React/Vite frontend
  docs/
  scripts/
  AGENTS.md
```

## Current State

This repository is the new monorepo root for:
- `iterview-api`
- `iterview-web`

The root structure is prepared first so the existing backend and frontend can be imported cleanly in follow-up commits.

## Principles

- keep backend and frontend as peer apps under `apps/`
- move shared documentation and developer scripts to the root only when they are truly cross-app
- preserve each app's own build system
- avoid mixing Gradle and Node concerns at the root unless there is a strong operational reason

## Next Steps

1. import `iterview-api` into `apps/api`
2. import `iterview-web` into `apps/web`
3. normalize root docs and developer workflows
4. consolidate CI only after both apps are imported
