You are implementing the Resume Editor V2 frontend for the Iterview web app.

Treat the frontend docs, backend docs, and runtime OpenAPI as the source of truth. The backend now exposes a migration-safe Resume Editor V2 contract with:
- one rich-tree workspace model
- legacy block and markdown compatibility
- granular operation patch writes
- stable selection anchors
- node-aware tracked changes
- node-aware merge preview
- revision history
- print preview
- lightweight presence

Read these first.

Frontend docs:
- /Users/hammac/Projects/iterview-web/docs/01-product-overview.md
- /Users/hammac/Projects/iterview-web/docs/02-frontend-architecture.md
- /Users/hammac/Projects/iterview-web/docs/03-routes-and-flows.md
- /Users/hammac/Projects/iterview-web/docs/04-api-integration.md
- /Users/hammac/Projects/iterview-web/docs/05-implementation-plan.md
- /Users/hammac/Projects/iterview-web/docs/06-acceptance-criteria.md
- /Users/hammac/Projects/iterview-web/docs/07-frontend-gap-analysis.md

Backend docs:
- /Users/hammac/Projects/iterview-api/docs/04-api-contracts.md
- /Users/hammac/Projects/iterview-api/docs/08-frontend-api.md
- /Users/hammac/Projects/iterview-api/docs/feature-resume-editor.md
- /Users/hammac/Projects/iterview-api/docs/openapi/frontend-integration.yaml

Runtime API source:
- http://localhost:8080/v3/api-docs
- http://localhost:8080/swagger-ui.html

Source-of-truth priority:
1. runtime OpenAPI at /v3/api-docs
2. checked-in backend snapshot at /Users/hammac/Projects/iterview-api/docs/openapi/frontend-integration.yaml
3. backend docs
4. frontend docs

Implementation rules:
- Do not invent endpoint paths, fields, statuses, DTO names, or enum values.
- Reuse the existing frontend architecture, route structure, typed API layer, React Query hooks, and shared UI primitives.
- Keep endpoint constants and query keys centralized.
- Keep server state in React Query.
- Do not scatter fetch logic across presentational components.
- Preserve existing working pages and extend them incrementally.
- Treat additive backend fields as optional unless runtime OpenAPI proves otherwise.
- Add loading, empty, error, retry, and auth-required states for every major async screen.
- Preserve current v1 block-based editor behavior as fallback while wiring v2.

Relevant endpoints:
- GET /api/resume-versions/{versionId}/editor
- PUT /api/resume-versions/{versionId}/editor/document
- PATCH /api/resume-versions/{versionId}/editor/document/operations
- POST /api/resume-versions/{versionId}/editor/import-markdown
- POST /api/resume-versions/{versionId}/editor/comments
- PATCH /api/resume-versions/{versionId}/editor/comments/{commentId}
- POST /api/resume-versions/{versionId}/editor/comments/{commentId}/replies
- POST /api/resume-versions/{versionId}/editor/question-cards
- PATCH /api/resume-versions/{versionId}/editor/question-cards/{cardId}
- POST /api/resume-versions/{versionId}/editor/auto-question-suggestions
- POST /api/resume-versions/{versionId}/editor/rewrite-suggestions
- POST /api/resume-versions/{versionId}/editor/presence
- GET /api/resume-versions/{versionId}/editor/revisions
- GET /api/resume-versions/{versionId}/editor/revisions/{revisionId}
- GET /api/resume-versions/{versionId}/editor/tracked-changes
- POST /api/resume-versions/{versionId}/editor/merge-preview
- GET /api/resume-versions/{versionId}/editor/print-preview

Related endpoints:
- GET /api/resume-versions/{versionId}
- GET /api/resume-versions/{versionId}/profile
- GET /api/resume-versions/{versionId}/skills
- GET /api/resume-versions/{versionId}/experiences
- GET /api/resume-versions/{versionId}/projects
- GET /api/resume-versions/{versionId}/question-heatmap
- GET /api/resume-versions/{versionId}/question-heatmap/overlay-targets

Important workspace fields:
ResumeEditorWorkspaceDto:
- workspaceId
- resumeVersionId
- sourceVersionNo
- sourceFileName
- workspaceStatus
- revisionNo
- documentModel
- selectionCapabilities
- contextMenuActions
- supportedViewModes
- document
- comments
- questionCards
- commentSummary
- questionCardSummary
- heatmapAvailable
- heatmapSummary
- activePresence
- latestRevision
- createdAt
- updatedAt

Important document fields:
ResumeEditorDocumentDto:
- astVersion
- markdownSource
- blocks[]
- rootNodeId
- nodes[]
- tableOfContents[]
- layoutMetadata

ResumeEditorNodeDto:
- nodeId
- parentNodeId
- nodeType
- text
- textRuns[]
- children[]
- collapsed
- depth
- sourceAnchorType
- sourceAnchorRecordId
- sourceAnchorKey
- fieldPath
- displayOrder
- metadata

ResumeEditorTextRunDto:
- text
- marks[]
- href

ResumeEditorSelectionCapabilitiesDto:
- supportsRichTree
- supportsOperations
- supportsInlineSelections
- supportsContextualComments
- supportsContextualQuestionCards
- supportsContextualSuggestions

ResumeEditorTableOfContentsItemDto:
- nodeId
- title
- depth
- fieldPath

Important selection anchor fields:
ResumeEditorSelectionAnchorDto:
- nodeId
- anchorPath
- fieldPath
- selectionStartOffset
- selectionEndOffset
- selectedText
- anchorQuote
- sentenceIndex

Important operation patch fields:
PatchResumeEditorDocumentOperationsRequest:
- operations[]
- baseRevisionNo
- changeSource
- clientSessionKey
- clientChangeId

ResumeEditorDocumentOperationDto:
- operationType
- nodeId
- parentNodeId
- referenceNodeId
- text
- startOffset
- endOffset
- nodeType
- markType
- href
- collapsed

Currently supported operation types:
- text_insert
- text_replace
- text_delete
- block_split
- block_merge
- block_move
- block_duplicate
- block_remove
- block_type_change
- indent
- outdent
- inline_mark_add
- inline_mark_remove
- collapse_toggle

Important comment and question-card fields:
ResumeEditorCommentThreadDto:
- id
- blockId
- selectionAnchor
- fieldPath
- selectionStartOffset
- selectionEndOffset
- selectedText
- body
- status
- resolvedAt
- replyCount
- replies[]
- createdAt
- updatedAt

ResumeEditorQuestionCardDto:
- id
- blockId
- selectionAnchor
- fieldPath
- selectionStartOffset
- selectionEndOffset
- selectedText
- title
- questionText
- questionType
- sourceType
- linkedQuestionId
- status
- followUpSuggestions[]
- createdAt
- updatedAt

Important suggestion response fields:
ResumeEditorQuestionSuggestionResponseDto:
- resumeVersionId
- blockId
- selectionAnchor
- selectedText
- sourceType
- suggestions[]

ResumeEditorRewriteSuggestionResponseDto:
- resumeVersionId
- blockId
- selectionAnchor
- selectedText
- sourceType
- suggestions[]

Important revision and diff fields:
ResumeEditorRevisionListItemDto:
- id
- revisionNo
- changeSource
- changeSummary
- createdAt

ResumeEditorRevisionDto:
- id
- workspaceId
- resumeVersionId
- revisionNo
- changeSource
- changeSummary
- document
- createdAt

ResumeEditorTrackedChangesDto:
- resumeVersionId
- fromRevisionId
- toRevisionId
- changeSummary
- changes[]

ResumeEditorTrackedChangeDto:
- blockId
- nodeId
- changeType
- beforeBlockType
- afterBlockType
- beforeText
- afterText
- fieldPath
- beforeParentNodeId
- afterParentNodeId
- beforeDepth
- afterDepth
- textChanged
- structureChanged
- moveRelated

ResumeEditorMergePreviewDto:
- resumeVersionId
- baseRevisionId
- currentRevisionId
- mergeStatus
- mergedDocument
- conflicts[]
- changeSummary

ResumeEditorMergeConflictDto:
- blockId
- nodeId
- conflictType
- baseText
- currentText
- proposedText
- conflictScopes[]
- baseParentNodeId
- currentParentNodeId
- proposedParentNodeId

Important print preview fields:
ResumeEditorPrintPreviewDto:
- resumeVersionId
- workspaceId
- title
- pageEstimate
- plainText
- sections[]
- pages[]
- layoutItems[]

Current backend behavior:
- Resume versions remain immutable.
- The editor is one additive workspace layer on top of one immutable resume version.
- V1 compatibility is still live:
  - document.blocks[]
  - markdownSource
  - PUT /editor/document
  - import-markdown
  - legacy blockId-based requests
- V2 additive behavior is now live:
  - documentModel = rich_tree
  - document.rootNodeId
  - document.nodes[]
  - document.tableOfContents[]
  - selectionAnchor
  - PATCH /document/operations
  - node-aware tracked changes
  - node-aware merge conflicts
- The backend still materializes blocks and markdown so the frontend can stage migration.
- `baseRevisionNo` remains the optimistic concurrency guard.
- Presence is lightweight heartbeat only, not realtime collaborative editing.
- Merge preview is server-assisted optimistic conflict recovery, not CRDT.
- Print preview exposes section/page/layout hints only, not true PDF coordinates.

Critical frontend behavior:
- Prefer one primary rich document surface when `documentModel = rich_tree`.
- Keep the current block editor as a safe fallback if the richer model is unavailable.
- Prefer `selectionAnchor` over raw `blockId` for comment/question-card/suggestion flows.
- Prefer `PATCH /document/operations` for local granular edits.
- Keep `PUT /document` for coarse full replace, import apply, or simplified fallback save flows.
- Do not imply that editing mutates the source resume version.
- Do not market presence as live multiplayer.

Recommended routes:
- /resume-versions/:versionId/editor
- optional subviews or tabs:
  - edit
  - review
  - comments
  - question-cards
  - print-preview
  - history
  - heatmap

Recommended implementation plan:

1. Workspace shell
- Load GET /editor as the main source of truth.
- Show source resume context, revision info, and workspace status.
- If `documentModel = rich_tree`, initialize the v2 editor surface.
- If absent, fall back to current v1 rendering.

2. Rich document rendering
- Render `document.nodes[]` as the semantic tree model.
- Use `rootNodeId` and `children[]` relationships to build the visible structure.
- Use `textRuns[]` for inline formatting and links.
- Use `tableOfContents[]` for jump navigation.
- Preserve `sourceAnchorType/sourceAnchorRecordId/sourceAnchorKey/fieldPath` so future heatmap and source context linking stays intact.

3. Editing model
- Maintain one editor state derived from rich nodes.
- For contextual changes, call PATCH /document/operations with:
  - latest `baseRevisionNo`
  - `clientSessionKey`
  - `clientChangeId`
  - a minimal operation list
- Supported UX examples:
  - inline typing => text_insert/text_replace/text_delete
  - enter => block_split
  - backspace at boundary => block_merge
  - drag or move actions => block_move
  - duplicate/delete block => block_duplicate/block_remove
  - indent/outdent => indent/outdent
  - bold/highlight/link => inline_mark_add / inline_mark_remove
  - collapse section => collapse_toggle
- For bigger replace flows or fallback mode, use PUT /editor/document.

4. Selection model
- Build a reusable frontend selection-to-anchor mapper.
- Every contextual action should produce `ResumeEditorSelectionAnchorDto`.
- Use:
  - nodeId
  - fieldPath if available
  - selectionStartOffset
  - selectionEndOffset
  - selectedText
  - anchorQuote
  - sentenceIndex when practical
- Keep raw `blockId` fallback only for degraded flows.

5. Comments and replies
- Create comments from inline selection using `selectionAnchor`.
- Render threads inline, in a side panel, or both.
- Support resolve/reopen.
- Support reply create via POST /comments/{commentId}/replies.
- Keep reply count and reply list in sync via workspace invalidation or direct optimistic update.

6. Question cards
- Create question cards from inline selection using `selectionAnchor`.
- Render question-card side panel separate from comments.
- Support archive/restore via PATCH.
- Keep cards visually distinct from comments.

7. Suggestions
- Wire contextual “Generate questions” and “Rewrite this” actions from selection.
- Send `selectionAnchor` to:
  - POST /auto-question-suggestions
  - POST /rewrite-suggestions
- Treat them as preview APIs only.
- Let users explicitly:
  - create question cards from suggestions
  - apply rewrite suggestions back into the document via operation patch or full save

8. Revision history and tracked changes
- Add a history panel using:
  - GET /revisions
  - GET /revisions/{revisionId}
- Add compare flow using GET /tracked-changes.
- Render node-aware deltas:
  - text changed
  - structure changed
  - move related
- Do not fake Word-style redlines unless you intentionally layer that on top.

9. Conflict recovery
- Every write should carry `baseRevisionNo`.
- If write returns conflict, fetch latest workspace and show recovery options.
- Use POST /merge-preview with the user’s pending document when needed.
- Render:
  - clean merge
  - conflicted merge
  - conflictScopes
  - base/current/proposed text
  - node-level conflict ids
- Do not auto-accept merge preview without explicit user confirmation.

10. Print preview
- Use GET /print-preview for preview mode.
- Render:
  - sections
  - pages
  - layoutItems
- Use layout items as page hints, not precise coordinates.

11. Presence
- Send lightweight heartbeat with POST /presence.
- Include sessionKey, viewMode, selectedBlockId when useful.
- Render subtle presence pills or avatars only.

12. Heatmap adjacency
- If `heatmapAvailable = true`, expose an easy path from editor to resume heatmap.
- Reuse existing heatmap views/components rather than rebuilding the model.

13. Mobile behavior
- Avoid desktop-only side panels.
- Use drawers or bottom sheets for:
  - comments
  - question cards
  - history
  - print preview
  - merge conflicts

Implementation tasks:
1. Review the existing resume editor, resume detail, resume heatmap, and resume analysis frontend slices.
2. Add typed API support for the new v2 editor DTOs and request shapes.
3. Add query hooks and mutation hooks for the operation patch endpoint and richer selection-based actions.
4. Build the rich-tree editor shell with v1 fallback.
5. Add inline/contextual selection UX and selection-anchor generation.
6. Wire comments, replies, question cards, and suggestions to selection anchors.
7. Add revision history, tracked changes, and merge preview UI.
8. Add print preview mode and heatmap adjacency.
9. Keep the rest of the app stable.

Output expectations for each completed slice:
1. what was implemented
2. which files changed
3. which backend endpoints were used
4. what remains next

If runtime OpenAPI and checked-in docs differ, follow runtime OpenAPI and note the mismatch briefly.
