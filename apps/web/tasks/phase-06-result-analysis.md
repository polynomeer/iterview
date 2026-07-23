Read AGENTS.md, docs/03-routes-and-flows.md, docs/04-api-integration.md, docs/05-ui-structure.md, docs/07-acceptance-criteria.md, and the existing frontend code first.

Implement the ResultAnalysisPage for iterview-web.

Scope:
- score summary
- dimension scores
- feedback items
- retry/archive decision display
- next-step actions

Requirements:
- integrate with GET /api/answer-attempts/{id}
- display:
  - total score
  - structure score
  - specificity score
  - technical accuracy score
  - role fit score
  - company fit score
  - communication score
  - evaluation result
  - feedback items
  - progress status or archive/retry decision
  - next review information when available
- create reusable components for:
  - ScoreSummaryCard
  - DimensionScoreList
  - FeedbackList
  - NextActionCard
- provide CTAs such as:
  - retry later
  - revise answer
  - go to archive
  - go back to question
- support loading and error states
- keep the layout clear and easy to scan on mobile

Out of scope:
- advanced charts
- historical score trend graphs
- voice playback
- comparison with other users

When finished:
1. summarize ResultAnalysisPage structure
2. summarize created score and feedback components
3. explain next-action rendering logic
4. list assumptions about answer-attempt detail response
