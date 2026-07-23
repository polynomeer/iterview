Read AGENTS.md, docs/03-routes-and-flows.md, docs/04-api-integration.md, docs/05-ui-structure.md, docs/07-acceptance-criteria.md, and the existing frontend code first.

Implement the Review Queue experience for iterview-web.

Scope:
- review queue listing
- skip action
- done action
- navigation back into retry practice flow

Requirements:
- integrate with:
  - GET /api/review-queue
  - POST /api/review-queue/{id}/skip
  - POST /api/review-queue/{id}/done
- create a dedicated screen or section accessible from home and practice flows
- create reusable components for:
  - ReviewQueueList
  - ReviewQueueItem
  - QueueActionButtons
- support optimistic or explicit refetch update strategy after actions
- clearly show:
  - question title
  - scheduled time if available
  - reason type
  - priority if relevant
- support loading, empty, and error states

Out of scope:
- calendar sync
- notification scheduling UI
- advanced queue analytics

When finished:
1. summarize Review Queue screen structure
2. explain skip/done interaction behavior
3. explain refetch or state update strategy
4. list assumptions about review queue response shape
