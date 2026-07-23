Read AGENTS.md, docs/03-routes-and-flows.md, docs/04-api-integration.md, docs/05-ui-structure.md, docs/07-acceptance-criteria.md, and the existing frontend code first.

Implement the PracticePage for iterview-web.

Scope:
- question list browsing
- filtering
- search
- navigation to question detail

Requirements:
- integrate with GET /api/questions
- support filters for:
  - category
  - company
  - difficulty
  - status when available
  - search query
- create reusable components for:
  - QuestionList
  - QuestionListItem or QuestionCard
  - QuestionFilterBar
  - SearchInput
- support pagination or incremental loading if the backend supports it
- show user progress summary on question list items when available
- support loading, empty, and error states
- keep the screen mobile-first and task-oriented

Out of scope:
- infinite-scroll optimization beyond simple implementation
- question creation
- moderation tools
- public comparison

When finished:
1. summarize PracticePage structure
2. summarize filtering and search behavior
3. explain list data fetching strategy
4. list assumptions and backend dependencies
