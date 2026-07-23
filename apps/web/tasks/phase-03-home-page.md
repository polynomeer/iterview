Read AGENTS.md, docs/03-routes-and-flows.md, docs/04-api-integration.md, docs/05-ui-structure.md, docs/07-acceptance-criteria.md, and the existing frontend code first.

Implement the HomePage for iterview-web.

Scope:
- main home screen
- today question card
- retry question cards
- learning materials block
- summary stats block

Requirements:
- integrate with GET /api/home
- display:
  - todayQuestion
  - retryQuestions
  - learningMaterials
  - summaryStats
- visually separate the main today question from retry questions
- create reusable components for:
  - TodayQuestionCard
  - RetryQuestionList
  - LearningMaterialList
  - SummaryStatsCard
- support loading, empty, and error states
- make the page mobile-first
- include CTA navigation to question detail or answer editor
- keep component boundaries clean

Out of scope:
- advanced animations
- personalization tuning
- push notifications
- feed ranking logic

When finished:
1. summarize HomePage structure
2. summarize created reusable components
3. explain loading, empty, and error handling
4. list assumptions about home API fields
