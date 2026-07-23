Read AGENTS.md, docs/03-routes-and-flows.md, docs/04-api-integration.md, docs/05-ui-structure.md, docs/07-acceptance-criteria.md, and the existing frontend code first.

Implement the ProfilePage and settings-related flows for iterview-web.

Scope:
- current user profile
- settings update
- target companies update

Requirements:
- integrate with:
  - GET /api/me
  - PATCH /api/me/profile
  - PATCH /api/me/settings
  - PUT /api/me/target-companies
- display and edit:
  - nickname if available
  - job role
  - years of experience
  - target score threshold
  - pass score threshold
  - retry enabled
  - daily question count
  - target companies
- create reusable components for:
  - ProfileSummaryCard
  - ProfileEditForm
  - SettingsForm
  - TargetCompanySelector
- handle save success and error states clearly
- keep forms mobile-friendly and simple

Out of scope:
- avatar upload
- social settings
- notification preference center beyond existing fields
- public profile

When finished:
1. summarize ProfilePage structure
2. summarize form handling strategy
3. explain target company editing flow
4. list assumptions about profile and settings payloads
