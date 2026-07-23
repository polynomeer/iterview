Read AGENTS.md, docs/03-routes-and-flows.md, docs/04-api-integration.md, docs/05-ui-structure.md, docs/07-acceptance-criteria.md, and the existing frontend code first.

Implement the ArchivePage for iterview-web.

Scope:
- archived question list
- filtering
- navigation to question detail or answer history summary

Requirements:
- integrate with GET /api/archive
- display archived questions only
- support filtering by:
  - category
  - company
  - tag if available
- create reusable components for:
  - ArchiveList
  - ArchiveListItem
  - ArchiveFilterBar
- surface archived status and score summary clearly
- support loading, empty, and error states
- keep the layout mobile-first

Out of scope:
- full answer history timeline
- historical diff view
- export features

When finished:
1. summarize ArchivePage structure
2. summarize filter behavior
3. explain how archived data is presented
4. list assumptions about archive response fields
