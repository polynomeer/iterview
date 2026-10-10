# 0088. Core Journeys Are Tested in a Browser with Playwright

## Status
Accepted.

## Date
2026-10-06

## Context
API integration tests cover each endpoint, and Vitest covers each screen with its queries mocked. Nothing checked that the screens and the API work together. Bugs between the two only showed up in manual checks:
- another user's private interview question appeared as a new account's 오늘 card;
- the 복습 week strip always showed zero for upcoming days;
- a first resume upload was left inactive, so the interview launcher had no resume to use.

## Decision
- Browser journeys live in `apps/web/e2e` and run with Playwright (`@playwright/test`, Chromium), separate from Vitest. `vite.config.ts` limits Vitest to `src/`.
- Each journey signs up its own `e2e-*@iterview.test` account through the UI, so journeys run in parallel and never depend on each other or on local data. Fixtures that must stay stable, such as the resume PDF, are committed files (`e2e/fixtures`).
- Selectors use roles and accessible names in Korean, the primary locale (ADR 0080). A journey that cannot find its control by role points to an accessibility gap.
- `./scripts/e2e.sh` runs the journeys against a running dev stack. With `--start` it builds and starts the API jar and a production web build against `DB_URL`, then stops them. CI runs that mode in a separate `Browser Journeys` job with a PostgreSQL service and keeps the report and logs when a journey fails.
- `e2e/a11y.spec.ts` runs axe-core (`@axe-core/playwright`) against the WCAG 2.1 A/AA rules on the sign-in screens, every core screen in the light and dark themes, the open command palette, phone-width screens, a failed login, and the write flows mid-edit and after saving (claim evidence, the document editor, an interview after an answer and its result). Any violation fails the run. Keyboard-only journeys answer 오늘's question, fill and save a claim's evidence, answer and skip an interview question, and work the document editor: one tab stop for the document, arrow keys between lines, Shift+F10 for a line's menu, and arrow keys plus Enter in the slash menu. Contrast for text tokens is still checked by the token unit test; axe covers what renders.
- The first journeys are: sign up, log out and log in; answer 오늘's question and read the score; find a weak answer in 복습; upload a resume, see it in use and fill one claim's evidence; run a full-coverage interview past a skip; save a question with a note and find both in 보관함.

## Consequences
- A change that breaks a core journey fails CI even when unit and API tests pass.
- Every local run adds a few `e2e-*@iterview.test` accounts to the dev database. `./scripts/e2e_cleanup.sh` removes them, with every row that depends on them and their uploads. It reports first and deletes only with `--apply`, and it only touches the local compose database.
- The journeys run without an LLM key, so they exercise the deterministic extraction and question paths. LLM-backed behavior stays covered by the client unit tests.
- Journey files are type-checked only by Playwright's transpiler, not by `tsc -b`, because the web app has no Node types.
