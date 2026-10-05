# 0078. Version-Scoped Resume Hub and a Single Version Choice

## Status
Accepted.

## Date
2026-09-30

## Context
Before Phase 4 of the redesign (`docs/09-ux-audit-and-redesign-proposal.md`), every resume and interview screen picked its own resume version. The resume page had a local selector. The tailor landing page and the practical-interview upload each had a `<select>`. The interview launcher had version buttons. The version shown on a screen often differed from the version the rest of the app used for question picks and grading. Resume views also lived on separate pages: management, a mostly fabricated analysis page, the evidence editor, the heatmap, and three tailor pages.

## Decision
- **One version choice.** The active resume version is chosen in one place: the sidebar switcher, which activates it app-wide. No screen has its own version picker.
- **A version-scoped hub.** Resume views live under `/resume/:versionId` as route tabs: 개요 (index), 근거 편집 (`claims`), 면접 압박 지도 (`heatmap`), 공고 맞춤 (`tailor`), 버전 관리 (`versions`). The hub layout owns the version bar and the page `h1`. A version other than the active one is labelled as such, with an action to activate it. Switching versions while in a tab keeps that tab.
- **Entry points redirect.** `/resume` opens the active version's hub, or a one-step first upload when there is nothing yet. A user's first upload that parses becomes the active version, so the one step leaves them ready to interview; later uploads stay inactive until chosen. `/resume/tailor` and `/resume/tailor/job-postings` redirect to the active version's 공고 맞춤 tab. `/resume/analysis` redirects to `/resume`. The fabricated analysis page is removed, and its real parts (extracted risks, experience, skills) move to 개요.
- **Interviews follow the same rule.**
  - The mock-interview launcher uses the active version. Without one, it offers the questions due for review (`review_mock`).
  - A session grades answers against the version it started with (`session.resumeVersionId`), not whichever version is active later.
  - A real-interview upload links to the active version by default. A checkbox lets the user opt out.

## Consequences
- The version the user sees is the version the app uses, and changing it is one action in one place.
- The resume area needs no section sub-navigation. The hub's route tabs replace it, so the resume nav area has a single section that matches all of `/resume/*`.
- Deep links carry the version (`/resume/12/heatmap`), so a shared link keeps showing the same version even after the user activates another.
- The old tailor landing page, job-postings page, and resume analysis page are gone. Job postings are managed inside the 공고 맞춤 tab.
