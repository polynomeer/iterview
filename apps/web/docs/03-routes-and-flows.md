# 03-routes-and-flows

This document explains how the product is expressed as routes and user flows in the web application.

The route map follows the five-area information architecture adopted in `docs/adr/0074-consolidate-ia-and-token-design-system.md` (root docs) and described in `docs/09-ux-audit-and-redesign-proposal.md` §4.2.

## Route Principles

- every screen belongs to exactly one area: 오늘, 질문, 복습, 이력서, 면접, or 설정
- a URL's first segment names its area, so the location is readable from the address bar
- old URLs are never broken: they redirect to their new home with the query string and hash preserved
- `src/shared/config/routes.ts` is the only place that builds paths; `src/shared/config/navigation.ts` is the only place that defines menus

## Areas And Routes

| Area | Section | Route | Auth |
| --- | --- | --- | --- |
| 오늘 | — | `/` | public |
| 질문 | 질문 목록 | `/questions` | public |
| 질문 | 질문 목록 | `/questions/:questionId`, `/questions/:questionId/tree` | public |
| 질문 | 질문 목록 | `/questions/:questionId/answer`, `/attempts/:answerAttemptId` | protected |
| 질문 | 스킬 맵 | `/questions/skills` | protected |
| 복습 | 지금 복습 | `/review` | protected |
| 복습 | 완료한 질문 | `/review/done` | protected |
| 이력서 | 버전 관리 | `/resume`, `/resume/:versionId/claims`, `/resume/:versionId/heatmap`, `/resume/:versionId/heatmap/anchors/:anchorType/:anchorId` | protected |
| 이력서 | 이력서 분석 | `/resume/analysis` | protected |
| 이력서 | 공고 맞춤 | `/resume/tailor`, `/resume/tailor/job-postings`, `/resume/:versionId/tailor`, `/resume/:versionId/tailor/:analysisId` | protected |
| 면접 | 모의면접 | `/interview`, `/interview/sessions/:sessionId`, `/interview/sessions/:sessionId/result` | protected |
| 면접 | 실전 면접 복기 | `/interview/records`, `/interview/records/upload`, `/interview/records/:recordId`, `.../transcript`, `.../questions/:questionId`, `.../simulate` | protected |
| 설정 | 학습 설정 | `/settings` | protected |
| 설정 | 프로필 | `/settings/profile` | protected |
| — | 둘러보기 (guest navigation only) | `/explore` | public |
| — | auth | `/login`, `/signup` | public |
| — | not found | `*` | public |

Development builds also serve `/__ui`, the primitives gallery.

Pages backed only by sample data are kept out of navigation until they have APIs. They keep their old URLs: `/weak-nodes`, `/scheduled-reviews`, `/target-companies`, `/notes`, `/bookmarks`.

## Legacy Redirects

`src/app/router/legacyRedirects.tsx` maps every pre-2026-10 URL to its new route. `src/test/router/legacyRedirects.test.tsx` asserts each mapping.

| Legacy | Current |
| --- | --- |
| `/practice` | `/questions` |
| `/skills` | `/questions/skills` |
| `/answer-attempts/:id/result` | `/attempts/:id` |
| `/review-queue`, `/archive` | `/review`, `/review/done` |
| `/feed` | `/explore` |
| `/profile` | `/settings/profile` |
| `/profile/resumes`, `/profile/resumes/analysis` | `/resume`, `/resume/analysis` |
| `/resume-versions/:versionId/editor` | `/resume/:versionId/claims` |
| `/resume-versions/:versionId/heatmap[/anchors/...]` | `/resume/:versionId/heatmap[/anchors/...]` |
| `/resume-tailor[/job-postings]` | `/resume/tailor[/job-postings]` |
| `/resume-tailor/resume-versions/:versionId/analyses[/:analysisId]` | `/resume/:versionId/tailor[/:analysisId]` |
| `/interviews[/:sessionId[/result]]` | `/interview[/sessions/:sessionId[/result]]` |
| `/practical-interviews/...` | `/interview/records/...` |

## Navigation Model

`src/shared/config/navigation.ts` defines the areas, their sections, and which routes belong to each section. Everything below reads from it:
- the desktop sidebar: the five areas with a live review count, the active resume version, and settings
- the mobile tab bar: the same five areas
- the section links under the top bar, shown for areas with more than one screen
- the top bar breadcrumb (area › page)
- the command palette's "이동" results

Active state is resolved with the router's own ranking (`matchRoutes`), so static segments win over parameters (for example `/questions/skills` over `/questions/:questionId`).

## Primary User Flows

### 1. Daily practice

```text
오늘 → 질문 (/questions/:id) → 답변 (/questions/:id/answer) → 결과 (/attempts/:id) → 복습 (/review) or 완료 (/review/done)
```

### 2. Resume evidence

```text
이력서 (/resume) → choose or upload a version → 근거 편집 (/resume/:versionId/claims) or 압박 지도 (/resume/:versionId/heatmap) → back to 질문 or 면접
```

### 3. Mock interview

```text
면접 (/interview) → session (/interview/sessions/:id) → result (/interview/sessions/:id/result) → 복습
```

### 4. Real interview review

```text
실전 면접 복기 (/interview/records) → upload (/interview/records/upload) or open a record → transcript, questions, replay
```

### 5. Job fit

```text
공고 맞춤 (/resume/tailor) → job postings → analyses for a version (/resume/:versionId/tailor) → analysis detail
```

## Route Design Constraints

- route names stay human-readable and area-first
- dynamic params identify stable domain records
- result pages stay inspectable after the originating action completes
- a route move must add a legacy redirect and a redirect test in the same change
