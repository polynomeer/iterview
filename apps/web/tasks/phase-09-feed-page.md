Read AGENTS.md, docs/03-routes-and-flows.md, docs/04-api-integration.md, docs/05-ui-structure.md, docs/07-acceptance-criteria.md, and the existing frontend code first.

Implement the FeedPage for iterview-web.

Scope:
- popular section
- trending section
- company-related section

Requirements:
- integrate with GET /api/feed
- display sections:
  - popular
  - trending
  - companyRelated
- create reusable components for:
  - FeedSection
  - FeedQuestionCard
  - SectionHeader
- support empty sections gracefully
- show enough metadata for question cards:
  - title
  - category
  - difficulty
  - companies
  - tags
  - optional user progress summary
- support loading and error states
- keep the layout mobile-first and browsable

Out of scope:
- feed ranking controls
- personalized ranking tuning
- community-driven feed
- advanced sorting controls

When finished:
1. summarize FeedPage structure
2. summarize feed section rendering behavior
3. explain handling of partial or empty data
4. list assumptions about feed API payload
