Read AGENTS.md, docs/07-acceptance-criteria.md, and the existing frontend code first.

Add and improve frontend tests for iterview-web.

Scope:
- core page tests
- feature interaction tests
- API-driven screen behavior tests with mocks

Requirements:
- add tests for:
  - HomePage rendering with home payload
  - QuestionDetailPage rendering
  - AnswerEditorPage submit flow
  - ResultAnalysisPage score rendering
  - PracticePage filter/search behavior where practical
  - ArchivePage empty and populated states
  - FeedPage section rendering
  - protected route behavior
- keep tests focused on user-visible behavior
- use appropriate API mocking strategy
- avoid fragile over-snapshotting
- keep tests maintainable

Out of scope:
- exhaustive visual regression
- e2e infrastructure unless already present
- coverage maximization for its own sake

When finished:
1. summarize added tests
2. summarize test strategy
3. identify gaps that still remain
4. list recommendations before release
