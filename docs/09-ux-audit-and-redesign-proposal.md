# 09-ux-audit-and-redesign-proposal

Date: 2026-09-30
Status: Proposal (see [ADR 0074](adr/0074-consolidate-ia-and-token-design-system.md))

This document audits the current `apps/web` experience end to end, from visual design to page
structure, and proposes a consolidated redesign. The proposal comes with static design mockups for
every affected surface:
- mockups: [`references/redesign-proposal/`](references/redesign-proposal/README.md)
- current-state evidence: [`references/ux-audit-2026-09/`](references/ux-audit-2026-09/)

The product intent in [`01-product-foundation.md`](01-product-foundation.md) and the visual
direction in [`04-design-refresh-strategy.md`](04-design-refresh-strategy.md) are unchanged. That
direction is: calm, Linear/GitHub-like restraint, one accent, border-first surfaces, and every
screen answering "what should I do next?". The problem is that the shipped UI has drifted far from
it. This document explains where it drifted and how to get back.

---

## 1. Summary

### What is wrong, in one paragraph

The app has **36 routes, 14 sidebar entries, 4 overlapping navigation surfaces, and 4 themes**. The
default theme renders dark cards on a light page, so page titles, sidebar items, and form labels
are nearly invisible. Several pages crash, render unstyled, or show hard-coded sample data as if it
were real. Core screens stack 10–12 nested cards with repeated counters. They explain the UI to the
user ("the right rail shows…") instead of telling the user what to do. The implementation behind
this is a 26,488-line global stylesheet with 96 font sizes, 32 radii, and ~1,270 hard-coded colors,
plus no shared button, input, tab, or dialog primitives.

### Top 12 problems

| # | Problem | Severity | Evidence |
| --- | --- | --- | --- |
| 1 | Practical interview detail, transcript, and replay crash with "Rendered more hooks than during the previous render" | P0 | [screenshot](references/ux-audit-2026-09/desktop-practical-transcript-fold.jpg) |
| 2 | No 404 route, `errorElement`, or ErrorBoundary. Crashes show React Router's developer screen ("Hey developer 👋") to users | P0 | same |
| 3 | The default `light` theme renders dark cards on a light background. Page `h1`s, the sidebar "관리" group, and login labels are near-invisible | P0 | [home](references/ux-audit-2026-09/desktop-home.jpg), [login](references/ux-audit-2026-09/desktop-login.jpg) |
| 4 | `/weak-nodes` renders without its styles. Weak Nodes, Scheduled Reviews, Target Companies, Notes, and Bookmarks run on hard-coded arrays | P0 | [weak nodes](references/ux-audit-2026-09/desktop-weak-nodes-fold.jpg) |
| 5 | Horizontal overflow on mobile: practical interview pages are 1025px wide in a 390px viewport | P0 | [mobile](references/ux-audit-2026-09/mobile-practical-detail-fold.jpg) |
| 6 | 36 routes in overlapping clusters (4 review pages, 9 resume routes under 3 URL roots, 3 question pages). Several routes are unreachable from navigation | P1 | §3.2 |
| 7 | Home repeats the same counters 2–3 times across ~12 cards and 12+ stat tiles. The primary CTA appears 3 times, and the question title overlaps other content | P1 | [home](references/ux-audit-2026-09/desktop-home.jpg) |
| 8 | Narrow grid columns break Korean text one character per line ("카/테/고/리", "Complete/d", "2026년/8월/20일") | P1 | [question](references/ux-audit-2026-09/desktop-question-detail.jpg), [answer](references/ux-audit-2026-09/desktop-answer-editor.jpg), [resume](references/ux-audit-2026-09/desktop-resume.jpg) |
| 9 | Letter glyphs instead of icons: "WS/TD/QM/RV/RV", header buttons "알/활/종" (no action, no label), bottom tabs "01–05" | P1 | [home fold](references/ux-audit-2026-09/desktop-home-fold.jpg) |
| 10 | Jargon and self-referential copy: DFS (128 occurrences), 노드, 기준 문서, 앵커, 레일, 복구 루프, "샘플 워크스페이스처럼" | P1 | §3.5 |
| 11 | The command palette lists 15 hard-coded items pointing at IDs that don't exist | P2 | [palette](references/ux-audit-2026-09/desktop-command-palette.jpg) |
| 12 | No design primitives. There are ~78 distinct button class patterns, 3 hand-rolled modals, 11 ad-hoc tab implementations, and 2,742 inline `isKorean ? … : …` ternaries alongside `t()` | P2 | §3.4, §3.7 |

### Target state

- **5 navigation areas** replace 14 sidebar entries: 오늘 / 질문 / 복습 / 이력서 / 면접, plus 보관함 and 설정.
- **One design system** of about 40 semantic tokens and 12 primitives. It supports **light, dark, and system** themes only.
- **One primary action per viewport.** No card nested inside another card. No copy that describes the UI.
- **Each screen has four shared states** (loading, empty, error, not found) and never shows a developer error screen.

---

## 2. Method

- Ran the full local stack (`docker compose up -d postgres`, `./gradlew bootRun`, Vite).
- Signed in as the seeded local demo user, which has 1 resume, 3 questions, 1 mock session, and 2 practical records.
- Captured all 34 routes with Playwright at **1440×900** and **390×844**. Captures were full-page plus first fold, in the default theme, the `workspace` theme, and the `dark` theme.
- Audited source code in `apps/web/src`: the route table, shell, styles, i18n, states, and accessibility. Numbers below come from grep/awk over the tree at commit `1e572a0`.

Page heights at 1440px give a quick density signal:

| Route | Desktop height | Mobile height |
| --- | ---: | ---: |
| `/resume-versions/1/heatmap` | 9,710px | 12,516px |
| `/profile/resumes` | 5,258px | 7,565px |
| `/archive` | 4,965px | 6,390px |
| `/` (home) | 2,841px | 6,890px |
| `/profile` | 2,876px | 7,994px |
| `/questions/1/answer` | 2,581px | 5,479px |

---

## 3. Findings

### 3.1 Broken or misleading (P0)

1. **Crash on practical interview review.** `/practical-interviews/:id`, `/transcript`, and `/simulate` all throw "Rendered more hooks than during the previous render". The stack points to a `useEffect` in `PracticalInterviewReviewPage`, so the number of hooks changes between renders (a hook is reached conditionally). One 2,287-line component serves 4 routes by sniffing `pathname`.
2. **No error boundary or 404.** `app/router.tsx` defines no `errorElement` and no `*` route. Any render error shows React Router's developer page. Unknown URLs render nothing useful.
3. **Default theme contrast failure.**
   - `defaultTheme = "light"` (`shared/theme/theme.ts`). Most workspace surfaces were styled for the dark `workspace` theme, so in light mode dark cards sit on a cream page.
   - `.page-container__title` is defined 6 times in `global.css` with conflicting colors.
   - The result is that every page `h1` renders near-white on near-white. The sidebar's lower group (설정/목표 회사/노트/북마크) and the login field labels also become unreadable.
   - The `workspace` theme ([screenshot](references/ux-audit-2026-09/theme-workspace-home-fold.jpg)) is coherent, which suggests QA only happened there.
4. **Mock pages presented as real.**
   - `WeakNodesPage` (`WEAK_NODES`), `ScheduledReviewsPage` (`INITIAL_REVIEW_BLOCKS`), `TargetCompaniesPage` (`TARGET_COMPANIES`), `NotesPage`, and `BookmarksPage` render constants and call no queries.
   - Weak Nodes additionally ships without its CSS and has ~12 dead controls (Export, ×, View all, a domain `<select>` with only "All domains").
5. **Mobile horizontal overflow.** Practical interview pages overflow to 1,025px at 390px width.
6. **Raw HTML entity in English copy.** 9 strings contain `&apos;` inside JS string literals. English users see "Today&apos;s focus" (`HomePage.tsx:123,133,194,216`, `TodayQuestionCard.tsx`, `HomeNextActionCard.tsx`).
7. **Wrong data in labels.**
   - `TodayQuestionCard` hard-codes "3개" and "~25분".
   - The "난이도" slot renders `companyLabel`.
   - The header page title falls back to "오늘" on most routes. For example, `/questions/1` and `/answer-attempts/1/result` both show "오늘".
8. **Backend error text shown to users.** The result page renders `error.message` verbatim ("Answer attempt not found: 1"), in English, inside the Korean UI.

### 3.2 Information architecture and navigation (P1)

**Route sprawl.** 36 `routeConfig` entries plus 3 legacy `/interview*` aliases that render duplicates instead of redirecting. They cluster by intent:

| User intent | Current routes | Problem |
| --- | --- | --- |
| Practice a question | `/practice`, `/questions/:id`, `/questions/:id/tree`, `/skills` | Map, detail, tree, and skill landscape are 4 pages for one mental object. Users ping-pong via "맵으로 돌아가기 / 이전 / 다음". |
| Revisit weak answers | `/review-queue`, `/scheduled-reviews`, `/weak-nodes`, `/archive` | 4 sidebar entries for filters of the same list. Two of them are mock-only. |
| Maintain resume evidence | `/profile/resumes`, `/profile/resumes/analysis`, `/resume-versions/:id/{editor,heatmap}`, `…/anchors/:type/:id`, `/resume-tailor/*` (4) | 9 routes under 3 URL roots. Version selection is re-implemented per page. `/resume-tailor` has no entry point. |
| Simulate interviews | `/interviews`, `/interviews/:id`, `/interviews/:id/result`, `/practical-interviews/*` (6) | Practical records are absent from the sidebar and command palette. They are reachable only from a heatmap link. |
| Account | `/profile`, `/settings`, `/target-companies` | Profile is reachable only via the header avatar. |
| Discovery | `/feed` | Unreachable from the authenticated sidebar. |

**Navigation surfaces** (sidebar, bottom tabs, command palette, header search, per-page continuity rails) disagree with each other:
- **Labels:** "리뷰 큐" in the header but "복습 큐" in the sidebar. "예정된 복습" vs "예약 복습".
- **Mobile tabs:** 홈 / 연습 / 아카이브 / 피드 / 프로필. Skills, Review Queue, Resume, and Interview are therefore unreachable from mobile navigation.
- **Sidebar subtitles** reuse unrelated message keys. For example, Scheduled Reviews shows "이력서 → DFS 질문 → 답변 복기".
- **Icons:** sidebar icons are two-letter codes chosen by substring-matching the translated label. Two entries both read "RV".
- **Header:** the header's "알" and "활" buttons have no handler and no `aria-label`. Logout is a button labeled "종".

### 3.3 Page-level UX (P1)

**Home (`/`)** — [evidence](references/ux-audit-2026-09/desktop-home.jpg)
- **Two stacked titles:** "이력서 기반 DFS 면접 연습" then "이력서를 한 분기씩 끝까지 방어하는 작업공간", each followed by a paragraph.
- **Counters repeated:** retry count shows 3 times and risk count 2 times. Six 0% skill tiles appear across two bands.
- **Too many primary actions:** 답변 이어가기, 답변 시작, and a second 답변 시작.
- **Overlap bug:** the question title overlaps the step list in `TodayQuestionCard`.
- **Unlabeled tiles:** the right "오늘 컨텍스트" rail shows `daily / MEDIUM / 0 / 0` with no labels, plus an empty input-shaped pill.
- **Mixed copy:** mixed-language strings such as "Scheduled for 2026년 9월…", and uppercase English labels (DAILY QUESTIONS, PENDING REVIEWS) in the Korean UI.
- **Loading state:** the hero renders with zero counts while data loads.

**Question detail and tree** — [detail](references/ux-audit-2026-09/desktop-question-detail.jpg), [tree](references/ux-audit-2026-09/desktop-question-tree.jpg)
- **Unreadable title:** the question title (the most important text on the page) renders dark-on-dark and is unreadable.
- **Vertical text:** the metadata rail squeezes "카테고리 / 난이도 / 회사 수 / 자료 수" into ~40px columns that wrap one character per line.
- **Unlabeled inspector:** the right inspector shows `0/100 · 0 · 0` with no visible labels.
- **Four equal-weight CTAs:** 답변 시작, 빠른 복습, 리뷰에 추가, 노트로 이동.
- **Tree page:** the tree page repeats the same node three times (hero, "질문 깊이와 부모-자식 구조" card, and list item). An empty minimap is left in the corner.

**Answer editor** — [evidence](references/ux-audit-2026-09/desktop-answer-editor.jpg)
- **Textarea placement:** the textarea, which is the entire point of the page, is the third card in the middle column.
- **Textarea styling:** it uses a white-to-gray gradient background.
- **Duplicated guidance:** guidance appears three times (주장/근거/꼬리질문 cards, "1. 주장 2. 근거 3. 다음 가지", "주장을 먼저 쓰기 / 실제 근거 붙이기 / 다음 가지 준비").
- **Vertical text:** the right rail wraps "이력서 상태 / 드래프트 길이 / 관련 스킬 / 트리 노드" vertically.
- **Clipped title:** the question title is clipped on the right.

**Resume** — [evidence](references/ux-audit-2026-09/desktop-resume.jpg)
- **Length:** 5,258px tall.
- **Vertical text:** version metadata wraps vertically ("Complete/d", "2026/년/8월/20/일").
- **Overlap:** a floating section-anchor list overlaps content.
- **Empty sections:** 10 collapsible sections render even when empty ("아직 이 버전에서 … 없습니다").

**Heatmap** — [evidence](references/ux-audit-2026-09/desktop-resume-heatmap-fold.jpg)
- **Length:** 9,710px tall.
- **Different palette:** it introduces a brown/amber hero that no other page uses.
- **Faint header controls:** the page title (file name) and both header buttons are near-invisible.

**Interview workspace** — [evidence](references/ux-audit-2026-09/desktop-interviews.jpg)
- **Description before action:** a "하나로 이어지는 준비 루프" continuity block and a 5×5 skill grid come before the only real action ("세션 설정 열기").
- **Empty space:** a large empty hero area sits above.

**Login** — [evidence](references/ux-audit-2026-09/desktop-login.jpg)
- **App shell on auth:** it is rendered inside the full app shell, with a sidebar offering 홈/질문 맵/피드/로그인/회원가입.
- **Internal badge:** it shows an internal "MVP 인증 흐름" badge.
- **Unreadable labels:** field labels are invisible.
- **Gradient inputs:** inputs use gradients.

**Result** — [evidence](references/ux-audit-2026-09/desktop-result-analysis-fold.jpg)
- **Raw error:** the error state renders the raw backend message.
- **Wrong header title:** the header title says "오늘".

### 3.4 Visual system (P2)

Measured in `apps/web/src/app/styles/global.css`:

| Metric | Current | Proposed |
| --- | ---: | ---: |
| Lines | 26,488 | ~1,500 (tokens + primitives) + co-located module CSS |
| Custom properties | 95 names / 478 definitions | ~40 semantic tokens |
| Hard-coded hex / rgb(a) | 528 / 2,234 (≈1,268 distinct) | 0 outside the token file |
| Distinct `font-size` | 96 | 7 |
| Distinct `border-radius` | 32 | 3 (+ full) |
| `@media` queries | 101 blocks, 22 distinct breakpoints (JS uses 1024) | 3: 640 / 1024 / 1280 |
| Themes | 4 (`light`, `dark`, `workspace`, `dracula`); 1,290 `[data-theme="workspace"]` overrides | 3 choices: system / light / dark |
| `prefers-color-scheme` | 0 | yes |
| Class selectors | 2,402; ≈437 unused candidates | per-component |

**Visual patterns that fight the design strategy:**
- **Depth:** cards nest 3–4 levels deep (card → stat tile → chip).
- **Gradients:** hero surfaces and input fields use gradients.
- **Headings:** uppercase letter-spaced English eyebrows sit above Korean headings.
- **Color:** multiple accents appear (cobalt, amber-brown heatmap, violet dracula).
- **Pills:** pill-shaped chips are used for everything (999px radius ×112).

### 3.5 Content and language (P1–P2)

- **Jargon exposed to users.** Occurrences in ts/tsx:

  | Term | Count |
  | --- | ---: |
  | DFS | 128 |
  | 노드 | 75 |
  | 기준 문서 | 63 |
  | 앵커 | 48 |
  | 분기 | 31 |
  | source of truth | 27 |
  | 레일 | 14 |
  | traversal | 12 |
  | 복구 루프 | 6 |

  These are internal model words, not user words.
- **Copy that describes the interface** ("우측 레일은 오늘 이 질문을 먼저 방어해야 하는 이유…", "샘플 워크스페이스처럼 메인 흐름을 끊지 않고…") instead of stating the user's next step.
- **Two parallel i18n systems.**
  - **`t()` over `messages.ts`:** 779 calls.
  - **Inline ternaries:** 2,742 `isKorean ? … : …` ternaries in 91 files.
  - **Untranslated strings:** some strings are English-only (route fallback, bookmarks filters, theme labels) and some are Korean-only (`ArchiveListItem`).

### 3.6 Accessibility (P2)

- **Color-only status.** Severity dots and sparklines have no text alternative.
- **Unlabeled icon buttons** (알/활/종, many `×`).
- **Clickable articles.** `<article onClick>` without a role or key handler (`InterviewCoveragePanel.tsx:87`). Four more use `role="button"` on `<article>` instead of a real button.
- **Dialogs.** Resume dialogs have `role="dialog"` but no accessible name, no focus trap, and no Esc handling. The command palette is the one component that does this correctly and should be the model.
- **Misused table roles.** `role="table"` contains `<button role="row">` (`WeakNodesPage`).
- **Contrast.** In the default theme, page titles and several labels are near-invisible, and muted text on the dark cards is visibly low-contrast. This needs a measured contrast pass once tokens land.

### 3.7 Engineering structure behind the UX (P2)

- **Oversized pages.** Pages are huge while widgets are thin: `ResumeEditorPage` 4,419 lines, `PracticalInterviewReviewPage` 2,287, `ResumePage` 1,113, `InterviewPage` 1,052. In total, pages hold 24,432 lines and widgets/features/entities hold 7,072.
- **Missing primitives.** `shared/ui` has state cards and badges but no `Button`, `Input`, `Select`, `Tabs`, `Dialog`, or `Toast`. `SectionLoadingState`, `SectionErrorState`, and `StateCard` are unused.
- **No skeletons.** Every loading state is a full card that replaces content.

---

## 4. Proposal

### 4.1 Principles

1. **One next action.** Each viewport has at most one `btn-primary`. If two actions compete, one of them is on the wrong screen.
2. **Show facts, not UI narration.** Recommendation reasons are data (score, resume claim, target company), never a description of the layout.
3. **One level of containment.** Cards contain lists, text, and dividers — never cards.
4. **Location is always one line.** Breadcrumb plus depth badge. The tree shows the rest.
5. **Status = color + text.** Every colored signal also carries a number or word.
6. **User words.** Use 꼬리질문, not DFS. Use 질문, not 노드. Use 이력서 항목 / 근거, not 기준 문서 / 앵커 (see §4.6).
7. **Real data or hidden.** A route whose data is hard-coded does not ship in navigation.

### 4.2 Information architecture

Mockup: [`14-ia-map`](references/redesign-proposal/renders/14-ia-map.png)

| Area | Route(s) | Absorbs |
| --- | --- | --- |
| 오늘 | `/` | home |
| 질문 | `/questions`, `/questions/:id`, `/questions/:id/answer`, `/attempts/:id` | practice, question detail, question tree, skills landscape (as the "맵" view), answer result |
| 복습 | `/review?tab=today\|upcoming\|weak\|done` | review queue, scheduled reviews, weak nodes, archive |
| 이력서 | `/resume/:versionId/{claims\|heatmap\|tailor\|versions}` | resumes, resume analysis, editor, heatmap, heatmap anchors, resume tailor (4) |
| 면접 | `/interview`, `/interview/sessions/:id`, `/interview/records/:id` | interviews, interview session/result, practical interviews (6), legacy `/interview*` |
| 보관함 | `/library` | bookmarks, notes, learning materials (ship only once backed by APIs) |
| 설정 | `/settings/:section` | profile, settings, target companies |
| Public | `/login`, `/signup`, `/explore`, `*` | feed (guest discovery only), new 404 |

Every current URL redirects (`<Navigate replace>`) to its new home, so bookmarks and existing links keep working.

**Shell.**
- **Sidebar:** a 232px sidebar with 5 primary items, each with a line icon and a live count (for example, 복습 4). Below them is a secondary group (보관함), then a **resume version switcher** and 설정 pinned at the bottom.
- **Top bar:** breadcrumb, search trigger (⌘K), notifications, and avatar.
- **Mobile:** a 5-tab bar with the same five areas, hidden in focus mode (answer, live interview).
- **Auth:** login and signup render without the shell.

### 4.3 Design system

Mockup: [`00-design-system`](references/redesign-proposal/renders/00-design-system.png) · [dark](references/redesign-proposal/renders/00-design-system-dark.png). The source tokens are in [`proposal.css`](references/redesign-proposal/proposal.css) and are ready to lift into `apps/web/src/shared/theme/tokens.css`.

- **Color:**
  - Neutral gray scale.
  - One blue accent (`--accent`, `--accent-soft`, `--accent-text`).
  - Semantic `success` / `warning` / `danger`, each with a `-soft` background.
  - Components use roles (`--surface`, `--border`, `--text-muted`), never raw values.
- **Type:** 12 / 13 / 14 / 16 / 20 / 24 / 30. Line-height is 1.6 for body text and 1.75 for long-form answers.
- **Spacing:** 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40.
- **Radius:** 6 (controls) / 10 (chips, callouts) / 14 (cards) / full (badges).
- **Primitives to add in `shared/ui`:** `Button` (primary / secondary / ghost / danger × sm / md / lg, plus `IconButton` with a required `aria-label`), `Field` + `Input` / `Textarea` / `Select`, `Tabs`, `Segmented`, `Badge`, `Card` (+ `CardHeader`), `ListRow`, `Stat`, `Progress`, `Callout`, `Dialog` (built on the command palette's focus handling), `Skeleton`, `EmptyState` / `ErrorState`, `Icon` (one line-icon set, 24px grid).
- **Breakpoints:** 640 (phone → tablet), 1024 (sidebar appears; matches `useLayoutMode`), 1280 (inspector rails appear).

### 4.4 Screen-by-screen redesign

| Screen | Mockup | Key changes |
| --- | --- | --- |
| 오늘 | [light](references/redesign-proposal/renders/01-today.png) · [dark](references/redesign-proposal/renders/01-today-dark.png) · [mobile](references/redesign-proposal/renders/11-mobile-today.png) | Greeting and today's workload replace the two titles. There is one hero with one primary action and a "왜 이 질문인가요?" panel backed by facts. Due reviews are actionable rows. Weak resume claims come next. A single weekly progress card shows deltas. The stat count drops from ~24 to 5. |
| 질문 | [light](references/redesign-proposal/renders/02-question-map.png) · [dark](references/redesign-proposal/renders/02-question-map-dark.png) | A three-pane workspace: tree navigator (트리/맵/목록 toggle, mastery legend), the question with its breadcrumb and depth, "면접관이 확인하려는 것", and next follow-ups ranked by likelihood. The inspector holds attempt history, the linked resume claim, materials, and notes. It replaces 4 pages. |
| 답변 | [desktop](references/redesign-proposal/renders/03-answer.png) · [mobile](references/redesign-proposal/renders/12-mobile-answer.png) | Focus mode with no sidebar: breadcrumb, autosave, and timer only. Last feedback appears right above the editor. A plain 16px textarea. A live 3-item checklist (주장 / 근거 / 꼬리질문 대비) replaces three guidance blocks. On mobile, a sticky submit bar replaces the tab bar. |
| 결과 | [light](references/redesign-proposal/renders/04-result.png) | Total score with the Δ from the previous attempt and a status word. Four dimension bars. A "다음 할 일" column naming the weakest dimension. Inline highlights on the answer text. Automatic review scheduling. |
| 복습 | [light](references/redesign-proposal/renders/05-review.png) · [dark](references/redesign-proposal/renders/05-review-dark.png) · [mobile](references/redesign-proposal/renders/13-mobile-review.png) | One page with tabs 오늘 / 예정 / 약한 영역 / 완료. A week strip for scheduling. Each row states why it is here (score, attempts, source). A weak-area side card links into the question map. |
| 이력서 | [light](references/redesign-proposal/renders/06-resume.png) | A version bar with coverage stats and the version switcher. Tabs: 항목과 근거 / 면접 압박 지도 / 공고 맞춤 분석 / 버전 기록. Each claim is a small form (상황 / 역할 / 측정 방법 / 결과) with the empty field tied to a concrete interview risk. Linked questions show inline, with "이 항목으로 모의면접". |
| 면접 | [light](references/redesign-proposal/renders/07-interview.png) | Tabs 모의면접 / 실전 면접 복기. Setup is three questions (기준 / 분량 / 답변 방식). The live session shows one question with progress, a timer, and recording controls. |
| 설정 | [light](references/redesign-proposal/renders/08-settings.png) | Sections for profile, target companies (real API), language and theme (system / light / dark), notifications, and logout. |
| 로그인 | [light](references/redesign-proposal/renders/09-auth.png) | No app shell. A value proposition in 3 steps. Standard labelled inputs with `autocomplete`. A guest browse option. |
| 검색·상태 | [light](references/redesign-proposal/renders/10-search-and-states.png) | ⌘K searches real questions, resume claims, and commands, with shortcuts. Shared skeleton, empty, error, and 404 patterns. |

### 4.5 States and errors

- Add `errorElement` at the root route and a `*` route. Both render the shared `ErrorState` / 404 with a "오늘로 이동" recovery action.
- Map API errors to user sentences in one place (`shared/api/httpClient.ts`). Never render `error.message` directly.
- Replace full-card loading states with skeletons that keep layout stable. Hero components must not render zero counts before data arrives.

### 4.6 Copy glossary

| Internal term | User-facing Korean | User-facing English |
| --- | --- | --- |
| DFS traversal | 꼬리질문 파고들기 / 다음 꼬리질문 | Follow-up drill |
| node | 질문 | Question |
| branch / 분기 / 가지 | 꼬리질문 흐름 | Follow-up path |
| source of truth / 기준 문서 | 이력서 근거 | Resume evidence |
| anchor / 앵커 | 이력서 항목 | Resume claim |
| recovery loop / 복구 루프 / 복구 레인 | 복습 | Review |
| weak node | 약한 질문 / 약한 영역 | Weak question / area |
| mastered / archive | 완료 (숙달) | Done |
| rail / inspector / workspace | never shown to users | never shown to users |

All strings move to `messages.ts`. The inline `isKorean ? … : …` pattern is removed file by file as each screen is rebuilt.

---

## 5. Roadmap

Each phase is a set of independently committable work units. Phases 0–1 are safe to start
immediately. Phase 2 onward depends on the ADR being accepted.

### Phase 0 — Stop the bleeding (P0 fixes, no redesign)

1. Fix the conditional hook in `PracticalInterviewReviewPage`, and split it into one component per route.
2. Add a root `errorElement` and a `*` 404 route.
3. Make `.page-container__title` and sidebar and auth label colors theme-correct in `light` (a short-term patch). Alternatively, set `defaultTheme` to `workspace` until Phase 1 lands.
4. Fix mobile overflow on practical interview pages.
5. Replace `&apos;` in JS strings. Fix the `TodayQuestionCard` hard-coded values and difficulty label. Fix the header titles.
6. Remove the mock-only routes (weak nodes, scheduled reviews, target companies, notes, bookmarks) from navigation until they are backed by APIs.
7. Give the header icon buttons real icons, handlers, and `aria-label`s, or remove them.

**Acceptance:** every route in §2 renders without a crash in both viewports. There is no horizontal scroll at 390px. Every page `h1` passes 4.5:1 in the default theme.

**Status (2026-09-30): done.** An automated sweep of 33 routes × 2 viewports found no crash, no page error, and no horizontal scroll. Page `h1` contrast is 15.9:1 (desktop) and 16.9:1 (mobile).

| Item | Outcome |
| --- | --- |
| 1. Conditional hook | Fixed by hoisting the hooks above the early returns, with a regression test (`15acb06`). Splitting the 2,287-line page per route moves to Phase 4. |
| 2. Error boundary and 404 | Done (`6833290`). |
| 3. Default theme contrast | `workspace` is now the default and `light` is retired until Phase 1 ([ADR 0075](adr/0075-retire-light-theme-until-token-rebuild.md), `36c23be`). |
| 4. Mobile overflow | No code change was needed. The 1,025px width came from the crash screen's stack trace and went away with item 1. |
| 5. Copy and data bugs | `&apos;`, fabricated card values, the misnamed difficulty field, and header titles are fixed (`71fbe6b`, `1e8d3ea`, `800f22c`). The home title overlap is also fixed (`fb17e84`). |
| 6. Sample-data pages | Removed from the sidebar, the command palette, and in-page links. The URLs still resolve (`9a4c6d1`). |
| 7. Header buttons | The dead "알/활" buttons are removed. Logout is now a labeled icon button (`219fef1`). |

Still open and deferred by design:
- The sidebar and bottom-tab letter glyphs (Phase 1 icon set).
- The vertical text in narrow metadata rails (Phase 3 screen rebuilds).

### Phase 1 — Foundations

1. Add `tokens.css` (from `proposal.css`) and the `shared/ui` primitives listed in §4.3, with unit tests.
2. Reduce themes to system / light / dark. Remove the `workspace` and `dracula` overrides as screens migrate.
3. Add a single icon set and replace the letter glyphs in the sidebar and bottom tabs.
4. Add the shared `Skeleton`, `EmptyState`, and `ErrorState`, plus central API error mapping.

**Acceptance:** new primitives are used in at least one screen. Lint rule or review check: no new hex colors or `font-size` literals outside `tokens.css`.

### Phase 2 — Shell and IA

1. Implement the new sidebar, top bar, mobile tab bar, and resume version switcher.
2. Add the new route table with redirects from every legacy URL. Update `routes.ts`, `commandPaletteData.ts`, and router tests.
3. Back the command palette with real search.

**Acceptance:** 5 primary nav items. Every legacy URL redirects. Route tests cover the redirects.

### Phase 3 — Core loop screens

These are built in order and ship one per work unit: 오늘 → 질문 (merged workspace) → 답변 (focus mode) → 결과 → 복습 (merged tabs).

**Acceptance per screen:** matches the mockup's structure. One primary CTA per viewport. Loading, empty, and error states covered. Mobile layout verified. Copy uses the glossary.

### Phase 4 — Resume and interview

These are built in order: 이력서 hub (claims → heatmap → tailor → versions, as tabs) → 면접 (mock + practical tabs, live session).

**Acceptance:** the resume version is chosen once, globally. There are no per-page version pickers. `ResumeEditorPage` is split into tab components under ~600 lines each.

### Phase 5 — Secondary and cleanup

1. 설정 merge. 보관함, only after bookmarks and notes APIs exist.
2. Delete unused CSS (target: `global.css` < 3,000 lines, remainder co-located). Remove the remaining `isKorean` ternaries.
3. Update `docs/07-final-acceptance-verification.md` and `docs/08-manual-visual-qa-sweep.md` to the new route list.

---

## 6. Risks and open questions

- **Skills landscape.** ADR 0072 made `/skills` an interactive planning surface. This proposal folds it into the question map as a "맵" view. If the skills view must stay standalone, it can remain a tab under 질문 without changing the rest of the IA.
- **Feed.** This proposal keeps the feed only for guests (`/explore`). If community or feed is a growth bet, it needs its own product decision rather than a sidebar slot.
- **Backend contracts.** The merged review tabs need scheduled and weak-area data that `/api/review-queue` and `/api/skills/gaps` may not fully expose. The "why this question" panel on 오늘 needs a reason payload from `/api/home`. Both need contract updates in `apps/api/docs/04-api-contracts.md`.
- **Scale of change.** Phases 3–4 touch most pages. Shipping behind the new shell, one screen at a time with redirects, keeps the app usable throughout.

---

## Appendix — Evidence index

All captures: seeded local demo user, 2026-09-30, commit `1e572a0`.

| File | Shows |
| --- | --- |
| [`desktop-home.jpg`](references/ux-audit-2026-09/desktop-home.jpg) | Full home. Invisible titles, repeated counters, overlapping title, sidebar cut-off with invisible lower group |
| [`desktop-home-fold.jpg`](references/ux-audit-2026-09/desktop-home-fold.jpg) | First viewport. Letter-glyph nav, "알/활/종" buttons, hero contrast |
| [`theme-workspace-home-fold.jpg`](references/ux-audit-2026-09/theme-workspace-home-fold.jpg) | The same screen in the `workspace` theme (coherent) |
| [`desktop-question-detail.jpg`](references/ux-audit-2026-09/desktop-question-detail.jpg) | Unreadable question title, vertical metadata text, unlabeled stats |
| [`desktop-question-tree.jpg`](references/ux-audit-2026-09/desktop-question-tree.jpg) | Same node repeated 3×, empty minimap |
| [`desktop-answer-editor.jpg`](references/ux-audit-2026-09/desktop-answer-editor.jpg) | Buried gradient textarea, triple guidance, vertical text |
| [`desktop-resume.jpg`](references/ux-audit-2026-09/desktop-resume.jpg) | 5,258px page, vertical metadata, overlapping anchor list |
| [`desktop-resume-heatmap-fold.jpg`](references/ux-audit-2026-09/desktop-resume-heatmap-fold.jpg) | Off-palette hero, invisible title and buttons |
| [`desktop-interviews.jpg`](references/ux-audit-2026-09/desktop-interviews.jpg) | Explanation blocks ahead of the only action |
| [`desktop-weak-nodes-fold.jpg`](references/ux-audit-2026-09/desktop-weak-nodes-fold.jpg) | Unstyled mock page |
| [`desktop-practical-transcript-fold.jpg`](references/ux-audit-2026-09/desktop-practical-transcript-fold.jpg) | Hook crash, developer error screen |
| [`mobile-practical-detail-fold.jpg`](references/ux-audit-2026-09/mobile-practical-detail-fold.jpg) | The same crash on mobile, overflowing viewport |
| [`desktop-result-analysis-fold.jpg`](references/ux-audit-2026-09/desktop-result-analysis-fold.jpg) | Raw backend error, wrong header title |
| [`desktop-login.jpg`](references/ux-audit-2026-09/desktop-login.jpg) | App shell on the auth page, invisible labels, gradient inputs |
| [`desktop-command-palette.jpg`](references/ux-audit-2026-09/desktop-command-palette.jpg) | Hard-coded palette entries |
| [`mobile-home-fold.jpg`](references/ux-audit-2026-09/mobile-home-fold.jpg) | Two-row mobile toolbar, "01–05" tab glyphs |
