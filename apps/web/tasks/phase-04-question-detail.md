Read AGENTS.md, docs/03-routes-and-flows.md, docs/04-api-integration.md, docs/05-ui-structure.md, docs/07-acceptance-criteria.md, and the existing frontend code first.

Implement the QuestionDetailPage for iterview-web.

Scope:
- question metadata display
- related tags and companies
- linked learning materials
- user progress summary
- call-to-action to answer the question

Requirements:
- integrate with GET /api/questions/{questionId}
- display:
  - title
  - body
  - category
  - difficulty
  - tags
  - related companies
  - learning materials
  - user progress summary when available
- create reusable components for:
  - QuestionHeader
  - QuestionMetaSection
  - LearningMaterialsSection
  - ProgressSummaryCard
- provide navigation to AnswerEditorPage
- support loading, empty, and error states
- keep the layout mobile-first and readable

Out of scope:
- question creation
- question moderation
- answer comparison
- community integration

When finished:
1. summarize QuestionDetailPage structure
2. summarize created components
3. explain API integration assumptions
4. list TODOs for future enhancements
