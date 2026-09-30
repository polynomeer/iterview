# 02-frontend-architecture

This document explains how the web application is structured and why new features should fit the current frontend architecture instead of bypassing it.

## Architectural Summary

The frontend is a React and Vite application organized into layered folders:

```text
src/
  app/
  pages/
  features/
  entities/
  widgets/
  shared/
```

This is intentionally close to a feature-sliced mental model without overcomplicating the repository.

## Layer Responsibilities

### `app`

Owns:
- router setup
- global providers
- auth bootstrap
- query client wiring
- locale bootstrap
- app shell

Current runtime entrypoints include:
- `src/app/router.tsx`
- `src/app/providers/*`

### `pages`

Owns:
- route-level screens
- high-level branching for loading, empty, error, and auth-required states
- page-specific orchestration across features and widgets

Current page areas include:
- home
- practice
- question detail
- question tree
- answer editor
- result analysis
- archive
- review queue
- feed
- profile
- resume hub (`pages/resume`: `ResumeHubLayout` with 개요 and 버전 관리 tabs, `ResumeIndexPage` for the entry redirect and first upload)
- resume heatmap (the 면접 압박 지도 tab and its claim detail)
- resume editor (the 근거 편집 tab; `ResumeEditorPage` composes tab components and hooks under `pages/resume-editor/components` and `pages/resume-editor/hooks`, each under ~600 lines)
- resume tailor (the 공고 맞춤 tab and analysis detail)
- skills
- interview (the mock-interview launcher)
- interview session (focus mode)
- interview result
- practical interviews (list, upload, and record review)
- login
- signup

### `features`

Owns:
- action-oriented logic
- API hooks
- query orchestration
- state transitions close to one product behavior

Examples:
- `features/auth`
- `features/answer`
- `features/interview`
- `features/practical-interview`
- `features/resume-editor`

### `entities`

Owns:
- UI-safe domain models
- API-to-UI mapping logic
- display-friendly derived fields

Examples:
- `entities/question`
- `entities/result`
- `entities/resume`
- `entities/skill-intelligence`

### `widgets`

Owns:
- reusable screen composition blocks
- larger display units that combine multiple entities or features
- layout-adjacent sections that should not live in `shared/ui`

Examples:
- layout navigation blocks, including the resume version switcher (`widgets/layout/ResumeVersionSwitcher`)
- home cards

Rebuilt screens keep their composition in the page folder. The old interview, answer, resume, and resume-editor widget folders were removed when their screens were rebuilt.

### `shared`

Owns:
- API client infrastructure
- config and route constants
- auth helpers
- locale helpers
- theme and UI primitives
- generic utility functions
- shared types

## Architectural Rules

### 1. Route logic belongs in `pages`

Pages should own:
- route params
- top-level branching
- page composition

They should not become a dumping ground for low-level API access or repeated mapping logic.

### 2. API access belongs in `features` and `shared/api`

- endpoint definitions should stay centralized
- query keys should stay centralized
- feature hooks should wrap endpoint usage
- raw fetch logic should not spread across pages

### 3. UI-safe mapping belongs in `entities`

API payloads are not always ideal view models.

Entities should absorb:
- optional-field defaults
- derived labels
- stable UI-facing shapes for additive backend evolution

### 4. Reusable display composition belongs in `widgets`

If a block is bigger than a primitive but smaller than a route, it probably belongs in `widgets`.

### 5. Truly generic code belongs in `shared`

Avoid placing product-specific concepts in `shared` just because they are reused twice.


### 6. New UI uses tokens and primitives

- design tokens live in `src/shared/theme/tokens.css` (`--iv-*`); raw colors and font sizes are not allowed anywhere else (enforced by `src/test/shared/designTokens.test.ts`)
- reusable controls come from `src/shared/ui/primitives` (`ui-*` classes); do not add new page-specific button, input, tab, or dialog styles
- `src/app/styles/global.css` is legacy and capped under 3,000 lines. Rules used by only one legacy screen live next to it as `legacy-*.css` (the evidence editor and the interview record review), inside a cascade layer so the shared rules keep precedence.
- user-facing text lives in `src/shared/i18n/catalog/<namespace>.ts` (`{ en, ko }`), read with `t("ns.key", params)` or `translate()`. Inline `isKorean` ternaries are not allowed (ADR 0080).
- run the dev server and open `/__ui` for a live reference of every primitive, icon, and state (development builds only)
- use `EmptyState`, `ErrorState`, and `PageSkeleton` for new loading, empty, and error states instead of page-specific cards
- see `docs/adr/0076-namespaced-tokens-and-primitives-alongside-legacy-styles.md` and `docs/09-ux-audit-and-redesign-proposal.md`

## Current Route Inventory

Routes follow the five-area information architecture: 오늘 `/`, 질문 `/questions/*` and `/attempts/:id`, 복습 `/review/*`, 이력서 `/resume/*`, 면접 `/interview/*`, and 설정 `/settings/*`. There are also `/explore`, `/login`, `/signup`, and a not-found route.

The full table, the legacy redirects, and the navigation model are in `03-routes-and-flows.md`.

## State Management Strategy

The current frontend implicitly uses a layered state model:

### Server state

Handled primarily through React Query and feature-level API hooks.

Examples:
- question detail
- answer history
- review queue
- resume extraction subresources
- interview session detail

### URL state

Handled through route params, query params, and route-specific navigation.

Examples:
- selected question
- selected interview record
- the resume version being viewed (`/resume/:versionId/*`); the app-wide active version is server state, changed only through the sidebar switcher (ADR 0078)
- analysis detail routes

### Local UI state

Handled inside page, widget, or feature components when not worth promoting.

Examples:
- active tab
- filter drawer visibility
- temporary draft text

## Integration Rules

### Backend contract evolution

The frontend should tolerate additive backend fields.

That means:
- optional data should have safe defaults
- components should render partial data gracefully
- pages should not assume every intelligence field is always present

### Locale behavior

The app already contains centralized locale and i18n support under `shared/i18n`.

Important behavior:
- UI chrome may be localized
- user-authored source content remains in the original language
- generated interview or analysis text may follow the selected app locale

### Protected routes

Authenticated routes are wrapped through `ProtectedRoute`.

This makes auth handling explicit at the route layer rather than hidden in arbitrary page logic.

## Frontend Strengths

The current architecture is already well suited for the product because:
- the route surface is broad but logically grouped
- features can grow additively
- resume, interview, and replay workflows already have dedicated slices
- app-wide concerns such as auth and locale are centralized

## Frontend Risks To Watch

- bypassing entity mapping and leaking raw API shapes into many pages
- moving too much product-specific logic into `shared`
- duplicating route-level branching inside widgets
- overfitting UI state to one backend payload shape when additive evolution is expected

