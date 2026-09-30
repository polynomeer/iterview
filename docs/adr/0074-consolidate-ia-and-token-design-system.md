# 0074. Consolidate Information Architecture and Adopt a Token Design System

## Status
Accepted (2026-09-30). Phases 0–1 are implemented, and Phase 2 introduces the five-area route table.

## Date
2026-09-30

## Context
A full audit of `apps/web` (see `docs/09-ux-audit-and-redesign-proposal.md`) found that the shipped UI has drifted from the direction in `04-design-refresh-strategy.md`:

- 36 routes and 14 sidebar entries split single user intents across several pages (4 review pages, 9 resume routes under 3 URL roots, 3 question pages), while some routes are unreachable from navigation.
- The default `light` theme renders dark workspace cards on a light page, making titles and labels unreadable. The four themes (`light`, `dark`, `workspace`, `dracula`) are maintained through a 26,488-line global stylesheet with 96 font sizes, 32 radii, and ~1,270 hard-coded colors.
- There are no shared button, input, tab, or dialog primitives. Several pages crash, render unstyled, or display hard-coded sample data.
- Internal model vocabulary (DFS, 노드, 기준 문서, 앵커, 레일) and copy that narrates the UI are shown to users.

Earlier ADRs (0004 workspace-first shell, 0005 page workspaces, 0006 unified visual system, 0071 shell density, 0072 skill landscape) set the direction, but not a bounded navigation model or an enforceable token set.

## Decision
Proposed for acceptance before redesign implementation starts:

- Organize the product into five primary areas: 오늘, 질문, 복습, 이력서, 면접. Add 보관함 and 설정 as secondary areas. Every current URL redirects to its new location.
- Merge overlapping pages into tabbed or multi-pane workspaces:
  - question map, detail, tree, and skills become one question workspace
  - review queue, scheduled reviews, weak nodes, and archive become one review hub
  - resume, analysis, editor, heatmap, and tailor become one resume hub scoped to a globally selected version
  - mock and practical interviews become one interview area
  - profile, settings, and target companies become settings
- Adopt the token set and primitives in `docs/references/redesign-proposal/proposal.css` as the only source of color, type, spacing, and radius. Support system, light, and dark themes only.
- Enforce screen rules:
  - one primary action per viewport
  - no nested cards
  - status always carries text
  - shared loading, empty, error, and 404 states
  - user-facing copy follows the glossary in the proposal
- Hide routes that are backed only by hard-coded data until they have real APIs.

## Consequences
- The navigation model becomes small and stable; new features must fit an existing area or justify a new one through an ADR.
- The redesign proceeds in phases (P0 fixes → foundations → shell/IA → core loop → resume/interview → cleanup), each as independently committable work units.
- `workspace` and `dracula` themes and most of `global.css` will be removed as screens migrate.
- This proposal changes ADR 0072's standalone skills surface into a view of the question workspace. It also changes the feed to guest-only discovery. Resolution at acceptance:
  - Skills stay a separate screen for now, reachable as the "스킬 맵" section of 질문 (`/questions/skills`). The merge into the question workspace happens with the Phase 3 rebuild.
  - The feed moves to `/explore`. Only guests see it in navigation, but the URL stays reachable after sign-in.
- Backend contracts for review scheduling, weak areas, and home recommendation reasons may need extension, and `apps/api/docs/04-api-contracts.md` must be updated alongside.
