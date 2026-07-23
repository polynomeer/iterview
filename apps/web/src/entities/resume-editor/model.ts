import { toArray } from "../../shared/lib/collection";
import { formatApiDateTime } from "../../shared/lib/date";
import type {
  ResumeEditorBlockDto,
  ResumeEditorChangeSummaryDto,
  ResumeEditorCommentThreadDto,
  ResumeEditorDocumentDto,
  ResumeEditorMergePreviewDto,
  ResumeEditorNodeDto,
  ResumeEditorPrintPreviewDto,
  ResumeEditorQuestionCardDto,
  ResumeEditorQuestionSuggestionResponseDto,
  ResumeEditorRevisionDto,
  ResumeEditorRevisionListItemDto,
  ResumeEditorRewriteSuggestionResponseDto,
  ResumeEditorTrackedChangesDto,
  ResumeEditorWorkspaceDto,
} from "../../shared/types/resumeEditor";

function toId(value: string | number | null | undefined, fallback: string) {
  return value === null || value === undefined ? fallback : String(value);
}

function formatLabel(value?: string | null) {
  if (!value) {
    return "Unknown";
  }

  return value
    .split(/[_-\s]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function mapChangeSummary(summary?: ResumeEditorChangeSummaryDto | null) {
  return {
    addedBlockCount: summary?.addedBlockCount ?? 0,
    removedBlockCount: summary?.removedBlockCount ?? 0,
    updatedBlockCount: summary?.updatedBlockCount ?? 0,
    inlineMarkDelta: summary?.inlineMarkDelta ?? 0,
    changedBlockIds: toArray(summary?.changedBlockIds),
  };
}

function mapSelectionAnchor(
  anchor?:
    | {
        nodeId?: string | null;
        anchorPath?: string | null;
        fieldPath?: string | null;
        selectionStartOffset?: number | null;
        selectionEndOffset?: number | null;
        selectedText?: string | null;
        anchorQuote?: string | null;
        sentenceIndex?: number | null;
      }
    | null,
) {
  if (!anchor) {
    return null;
  }

  return {
    nodeId: anchor.nodeId ?? null,
    anchorPath: anchor.anchorPath ?? null,
    fieldPath: anchor.fieldPath ?? null,
    selectionStartOffset: anchor.selectionStartOffset ?? null,
    selectionEndOffset: anchor.selectionEndOffset ?? null,
    selectedText: anchor.selectedText ?? null,
    anchorQuote: anchor.anchorQuote ?? null,
    sentenceIndex: anchor.sentenceIndex ?? null,
  };
}

function mapNode(node: ResumeEditorNodeDto, index: number) {
  return {
    nodeId: toId(node.nodeId, `node-${index}`),
    parentNodeId: node.parentNodeId ?? null,
    nodeType: node.nodeType ?? "paragraph",
    nodeTypeLabel: formatLabel(node.nodeType),
    text: node.text ?? "",
    textRuns: toArray(node.textRuns).map((run, runIndex) => ({
      id: `${node.nodeId ?? `node-${index}`}-run-${runIndex}`,
      text: run.text ?? "",
      marks: toArray(run.marks),
      href: run.href ?? null,
    })),
    children: toArray(node.children),
    collapsed: node.collapsed ?? false,
    depth: node.depth ?? 0,
    sourceAnchorType: node.sourceAnchorType ?? null,
    sourceAnchorTypeLabel: node.sourceAnchorType ? formatLabel(node.sourceAnchorType) : null,
    sourceAnchorRecordId:
      node.sourceAnchorRecordId === null || node.sourceAnchorRecordId === undefined
        ? null
        : String(node.sourceAnchorRecordId),
    sourceAnchorKey: node.sourceAnchorKey ?? null,
    fieldPath: node.fieldPath ?? null,
    displayOrder: node.displayOrder ?? index,
    metadata: node.metadata ?? {},
  };
}

function mapDocument(document?: ResumeEditorDocumentDto | null) {
  return {
    astVersion: document?.astVersion ?? 1,
    markdownSource: document?.markdownSource ?? "",
    rootNodeId: document?.rootNodeId ?? null,
    layoutMetadata: document?.layoutMetadata ?? {},
    blocks: toArray(document?.blocks)
      .map((block, index) => mapBlock(block, index))
      .sort((left, right) => left.displayOrder - right.displayOrder),
    nodes: toArray(document?.nodes)
      .map((node, index) => mapNode(node, index))
      .sort((left, right) => left.displayOrder - right.displayOrder),
    tableOfContents: toArray(document?.tableOfContents).map((item, index) => ({
      id: `${item.nodeId ?? `toc-${index}`}`,
      nodeId: item.nodeId ?? null,
      title: item.title ?? "Untitled section",
      depth: item.depth ?? 0,
      fieldPath: item.fieldPath ?? null,
    })),
  };
}

export function mapBlock(block: ResumeEditorBlockDto, index: number) {
  return {
    blockId: toId(block.blockId, `block-${index}`),
    blockType: block.blockType ?? "paragraph",
    blockTypeLabel: formatLabel(block.blockType),
    title: block.title ?? "",
    text: block.text ?? "",
    lines: toArray(block.lines),
    textValue: block.text ?? toArray(block.lines).join("\n"),
    sourceAnchorType: block.sourceAnchorType ?? null,
    sourceAnchorTypeLabel: block.sourceAnchorType ? formatLabel(block.sourceAnchorType) : null,
    sourceAnchorRecordId:
      block.sourceAnchorRecordId === null || block.sourceAnchorRecordId === undefined
        ? null
        : String(block.sourceAnchorRecordId),
    sourceAnchorKey: block.sourceAnchorKey ?? null,
    fieldPath: block.fieldPath ?? null,
    displayOrder: block.displayOrder ?? index,
    metadata: block.metadata ?? {},
    inlineMarks: toArray(block.inlineMarks).map((mark) => ({
      markType: mark.markType ?? "highlight",
      markTypeLabel: formatLabel(mark.markType),
      startOffset: mark.startOffset ?? 0,
      endOffset: mark.endOffset ?? 0,
      text: mark.text ?? "",
      href: mark.href ?? null,
    })),
  };
}

function mapComment(comment: ResumeEditorCommentThreadDto, index: number) {
  return {
    id: toId(comment.id, `comment-${index}`),
    blockId: comment.blockId ?? "",
    selectionAnchor: mapSelectionAnchor(comment.selectionAnchor),
    fieldPath: comment.fieldPath ?? null,
    selectionStartOffset: comment.selectionStartOffset ?? null,
    selectionEndOffset: comment.selectionEndOffset ?? null,
    selectedText: comment.selectedText ?? null,
    body: comment.body ?? "",
    status: comment.status ?? "open",
    statusLabel: formatLabel(comment.status),
    resolvedAtLabel: formatApiDateTime(comment.resolvedAt),
    replyCount: comment.replyCount ?? toArray(comment.replies).length,
    replies: toArray(comment.replies).map((reply, replyIndex) => ({
      id: toId(reply.id, `${index}-reply-${replyIndex}`),
      commentThreadId: toId(reply.commentThreadId, `comment-${index}`),
      body: reply.body ?? "",
      createdAtLabel: formatApiDateTime(reply.createdAt),
      updatedAtLabel: formatApiDateTime(reply.updatedAt),
    })),
    createdAtLabel: formatApiDateTime(comment.createdAt),
    updatedAtLabel: formatApiDateTime(comment.updatedAt),
  };
}

export function mapResumeEditorQuestionCardDtoToModel(card: ResumeEditorQuestionCardDto, index: number) {
  return {
    id: toId(card.id, `question-card-${index}`),
    blockId: card.blockId ?? "",
    selectionAnchor: mapSelectionAnchor(card.selectionAnchor),
    fieldPath: card.fieldPath ?? null,
    selectionStartOffset: card.selectionStartOffset ?? null,
    selectionEndOffset: card.selectionEndOffset ?? null,
    selectedText: card.selectedText ?? null,
    title: card.title ?? "Question card",
    questionText: card.questionText ?? "",
    questionType: card.questionType ?? "general",
    questionTypeLabel: formatLabel(card.questionType),
    sourceType: card.sourceType ?? "manual",
    sourceTypeLabel: formatLabel(card.sourceType),
    linkedQuestionId:
      card.linkedQuestionId === null || card.linkedQuestionId === undefined
        ? null
        : String(card.linkedQuestionId),
    status: card.status ?? "active",
    statusLabel: formatLabel(card.status),
    followUpSuggestions: toArray(card.followUpSuggestions),
    createdAtLabel: formatApiDateTime(card.createdAt),
    updatedAtLabel: formatApiDateTime(card.updatedAt),
  };
}

function mapRevisionListItem(item: ResumeEditorRevisionListItemDto, index: number) {
  return {
    id: toId(item.id, `revision-${index}`),
    revisionNo: item.revisionNo ?? index + 1,
    changeSource: item.changeSource ?? "manual_edit",
    changeSourceLabel: formatLabel(item.changeSource),
    changeSummary: mapChangeSummary(item.changeSummary),
    createdAtLabel: formatApiDateTime(item.createdAt),
  };
}

export function mapResumeEditorWorkspaceDtoToModel(workspace: ResumeEditorWorkspaceDto) {
  return {
    workspaceId: toId(workspace.workspaceId, "workspace"),
    resumeVersionId: toId(workspace.resumeVersionId, "version"),
    sourceVersionNo: workspace.sourceVersionNo ?? 1,
    sourceFileName: workspace.sourceFileName ?? "Resume version",
    workspaceStatus: workspace.workspaceStatus ?? "draft",
    workspaceStatusLabel: formatLabel(workspace.workspaceStatus),
    revisionNo: workspace.revisionNo ?? 0,
    documentModel: workspace.documentModel ?? "blocks",
    selectionCapabilities: {
      supportsRichTree: workspace.selectionCapabilities?.supportsRichTree ?? false,
      supportsOperations: workspace.selectionCapabilities?.supportsOperations ?? false,
      supportsInlineSelections: workspace.selectionCapabilities?.supportsInlineSelections ?? false,
      supportsContextualComments:
        workspace.selectionCapabilities?.supportsContextualComments ?? false,
      supportsContextualQuestionCards:
        workspace.selectionCapabilities?.supportsContextualQuestionCards ?? false,
      supportsContextualSuggestions:
        workspace.selectionCapabilities?.supportsContextualSuggestions ?? false,
    },
    contextMenuActions: toArray(workspace.contextMenuActions),
    supportedViewModes: toArray(workspace.supportedViewModes),
    document: mapDocument(workspace.document),
    comments: toArray(workspace.comments).map(mapComment),
    questionCards: toArray(workspace.questionCards).map(mapResumeEditorQuestionCardDtoToModel),
    commentSummary: {
      totalCount: workspace.commentSummary?.totalCount ?? 0,
      openCount: workspace.commentSummary?.openCount ?? 0,
      resolvedCount: workspace.commentSummary?.resolvedCount ?? 0,
      totalReplyCount: workspace.commentSummary?.totalReplyCount ?? 0,
    },
    questionCardSummary: {
      totalCount: workspace.questionCardSummary?.totalCount ?? 0,
      activeCount: workspace.questionCardSummary?.activeCount ?? 0,
      archivedCount: workspace.questionCardSummary?.archivedCount ?? 0,
    },
    heatmapAvailable: workspace.heatmapAvailable ?? false,
    heatmapSummary: workspace.heatmapSummary
      ? {
          totalAnchors: workspace.heatmapSummary.totalAnchors ?? 0,
          totalLinkedQuestions: workspace.heatmapSummary.totalLinkedQuestions ?? 0,
          hottestAnchorLabel: workspace.heatmapSummary.hottestAnchorLabel ?? null,
          mostFollowedUpAnchorLabel: workspace.heatmapSummary.mostFollowedUpAnchorLabel ?? null,
          weakestAnchorLabel: workspace.heatmapSummary.weakestAnchorLabel ?? null,
        }
      : null,
    activePresence: toArray(workspace.activePresence).map((presence, index) => ({
      sessionKey: presence.sessionKey ?? `presence-${index}`,
      userId: toId(presence.userId, `user-${index}`),
      userLabel: presence.userLabel ?? "Workspace visitor",
      viewMode: presence.viewMode ?? null,
      selectedBlockId: presence.selectedBlockId ?? null,
      isCurrentUser: presence.isCurrentUser ?? false,
      updatedAtLabel: formatApiDateTime(presence.updatedAt),
    })),
    latestRevision: workspace.latestRevision
      ? mapRevisionListItem(workspace.latestRevision, 0)
      : null,
    createdAtLabel: formatApiDateTime(workspace.createdAt),
    updatedAtLabel: formatApiDateTime(workspace.updatedAt),
  };
}

export function mapResumeEditorPrintPreviewDtoToModel(preview: ResumeEditorPrintPreviewDto) {
  return {
    resumeVersionId: toId(preview.resumeVersionId, "version"),
    workspaceId: toId(preview.workspaceId, "workspace"),
    title: preview.title ?? "Resume print preview",
    pageEstimate: preview.pageEstimate ?? 0,
    plainText: preview.plainText ?? "",
    sections: toArray(preview.sections).map((section, index) => ({
      sectionKey: section.sectionKey ?? `section-${index}`,
      title: section.title ?? "Section",
      lines: toArray(section.lines),
    })),
    pages: toArray(preview.pages).map((page, index) => ({
      pageNumber: page.pageNumber ?? index + 1,
      sectionKeys: toArray(page.sectionKeys),
      lineCount: page.lineCount ?? 0,
    })),
    layoutItems: toArray(preview.layoutItems).map((item, index) => ({
      id: `${item.blockId ?? "block"}-${index}`,
      pageNumber: item.pageNumber ?? 1,
      sectionKey: item.sectionKey ?? "section",
      blockId: item.blockId ?? `block-${index}`,
      blockType: item.blockType ?? "paragraph",
      blockTypeLabel: formatLabel(item.blockType),
      yOffsetLines: item.yOffsetLines ?? 0,
      estimatedLineSpan: item.estimatedLineSpan ?? 0,
    })),
  };
}

export function mapResumeEditorRevisionListDtoToModel(revisions: ResumeEditorRevisionListItemDto[]) {
  return toArray(revisions).map(mapRevisionListItem);
}

export function mapResumeEditorRevisionDtoToModel(revision: ResumeEditorRevisionDto) {
  return {
    id: toId(revision.id, "revision"),
    workspaceId: toId(revision.workspaceId, "workspace"),
    resumeVersionId: toId(revision.resumeVersionId, "version"),
    revisionNo: revision.revisionNo ?? 0,
    changeSource: revision.changeSource ?? "manual_edit",
    changeSourceLabel: formatLabel(revision.changeSource),
    changeSummary: mapChangeSummary(revision.changeSummary),
    document: mapDocument(revision.document),
    createdAtLabel: formatApiDateTime(revision.createdAt),
  };
}

export function mapResumeEditorTrackedChangesDtoToModel(changes: ResumeEditorTrackedChangesDto) {
  return {
    resumeVersionId: toId(changes.resumeVersionId, "version"),
    fromRevisionId: toId(changes.fromRevisionId, "from"),
    toRevisionId: toId(changes.toRevisionId, "to"),
    changeSummary: mapChangeSummary(changes.changeSummary),
    changes: toArray(changes.changes).map((change, index) => ({
      id: `${change.blockId ?? "block"}-${index}`,
      blockId: change.blockId ?? `block-${index}`,
      nodeId: change.nodeId ?? null,
      changeType: change.changeType ?? "updated",
      changeTypeLabel: formatLabel(change.changeType),
      beforeBlockType: change.beforeBlockType ?? null,
      afterBlockType: change.afterBlockType ?? null,
      beforeText: change.beforeText ?? null,
      afterText: change.afterText ?? null,
      beforeTextLines: toArray(change.beforeTextLines),
      afterTextLines: toArray(change.afterTextLines),
      fieldPath: change.fieldPath ?? null,
      beforeParentNodeId: change.beforeParentNodeId ?? null,
      afterParentNodeId: change.afterParentNodeId ?? null,
      beforeDepth: change.beforeDepth ?? null,
      afterDepth: change.afterDepth ?? null,
      textChanged: change.textChanged ?? false,
      structureChanged: change.structureChanged ?? false,
      moveRelated: change.moveRelated ?? false,
    })),
  };
}

export function mapResumeEditorMergePreviewDtoToModel(preview: ResumeEditorMergePreviewDto) {
  return {
    resumeVersionId: toId(preview.resumeVersionId, "version"),
    baseRevisionId: toId(preview.baseRevisionId, "base"),
    currentRevisionId: toId(preview.currentRevisionId, "current"),
    mergeStatus: preview.mergeStatus ?? "unknown",
    mergeStatusLabel: formatLabel(preview.mergeStatus),
    mergedDocument: mapDocument(preview.mergedDocument),
    conflicts: toArray(preview.conflicts).map((conflict, index) => ({
      id: `${conflict.blockId ?? "conflict"}-${index}`,
      blockId: conflict.blockId ?? `block-${index}`,
      nodeId: conflict.nodeId ?? null,
      conflictType: conflict.conflictType ?? "content",
      conflictTypeLabel: formatLabel(conflict.conflictType),
      baseText: conflict.baseText ?? null,
      currentText: conflict.currentText ?? null,
      proposedText: conflict.proposedText ?? null,
      baseTextLines: toArray(conflict.baseTextLines),
      currentTextLines: toArray(conflict.currentTextLines),
      proposedTextLines: toArray(conflict.proposedTextLines),
      conflictScopes: toArray(conflict.conflictScopes),
      baseParentNodeId: conflict.baseParentNodeId ?? null,
      currentParentNodeId: conflict.currentParentNodeId ?? null,
      proposedParentNodeId: conflict.proposedParentNodeId ?? null,
    })),
    changeSummary: mapChangeSummary(preview.changeSummary),
  };
}

export function mapResumeEditorQuestionSuggestionResponseDtoToModel(
  response: ResumeEditorQuestionSuggestionResponseDto,
) {
  return {
    resumeVersionId: toId(response.resumeVersionId, "version"),
    blockId: response.blockId ?? "",
    selectionAnchor: mapSelectionAnchor(response.selectionAnchor),
    selectedText: response.selectedText ?? "",
    sourceType: response.sourceType ?? "deterministic",
    sourceTypeLabel: formatLabel(response.sourceType),
    suggestions: toArray(response.suggestions).map((suggestion, index) => ({
      id: `question-suggestion-${index}`,
      title: suggestion.title ?? `Suggestion ${index + 1}`,
      questionText: suggestion.questionText ?? "",
      questionType: suggestion.questionType ?? "general",
      questionTypeLabel: formatLabel(suggestion.questionType),
      rationale: suggestion.rationale ?? "",
      followUpSuggestions: toArray(suggestion.followUpSuggestions),
    })),
  };
}

export function mapResumeEditorRewriteSuggestionResponseDtoToModel(
  response: ResumeEditorRewriteSuggestionResponseDto,
) {
  return {
    resumeVersionId: toId(response.resumeVersionId, "version"),
    blockId: response.blockId ?? "",
    selectionAnchor: mapSelectionAnchor(response.selectionAnchor),
    selectedText: response.selectedText ?? "",
    sourceType: response.sourceType ?? "deterministic",
    sourceTypeLabel: formatLabel(response.sourceType),
    suggestions: toArray(response.suggestions).map((suggestion, index) => ({
      id: `rewrite-suggestion-${index}`,
      suggestedText: suggestion.suggestedText ?? "",
      rationale: suggestion.rationale ?? "",
      focusArea: suggestion.focusArea ?? null,
      partialApplyAllowed: suggestion.partialApplyAllowed ?? false,
    })),
  };
}
