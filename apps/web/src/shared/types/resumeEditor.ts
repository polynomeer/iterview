export type ResumeEditorInlineMarkDto = {
  markType?: string | null;
  startOffset?: number | null;
  endOffset?: number | null;
  text?: string | null;
  href?: string | null;
};

export type ResumeEditorTextRunDto = {
  text?: string | null;
  marks?: string[] | null;
  href?: string | null;
};

export type ResumeEditorNodeDto = {
  nodeId?: string | null;
  parentNodeId?: string | null;
  nodeType?: string | null;
  text?: string | null;
  textRuns?: ResumeEditorTextRunDto[] | null;
  children?: string[] | null;
  collapsed?: boolean | null;
  depth?: number | null;
  sourceAnchorType?: string | null;
  sourceAnchorRecordId?: string | number | null;
  sourceAnchorKey?: string | null;
  fieldPath?: string | null;
  displayOrder?: number | null;
  metadata?: Record<string, string> | null;
};

export type ResumeEditorTableOfContentsItemDto = {
  nodeId?: string | null;
  title?: string | null;
  depth?: number | null;
  fieldPath?: string | null;
};

export type ResumeEditorSelectionCapabilitiesDto = {
  supportsRichTree?: boolean | null;
  supportsOperations?: boolean | null;
  supportsInlineSelections?: boolean | null;
  supportsContextualComments?: boolean | null;
  supportsContextualQuestionCards?: boolean | null;
  supportsContextualSuggestions?: boolean | null;
};

export type ResumeEditorSelectionAnchorDto = {
  nodeId?: string | null;
  anchorPath?: string | null;
  fieldPath?: string | null;
  selectionStartOffset?: number | null;
  selectionEndOffset?: number | null;
  selectedText?: string | null;
  anchorQuote?: string | null;
  sentenceIndex?: number | null;
};

export type ResumeEditorDocumentOperationDto = {
  operationType?: string | null;
  nodeId?: string | null;
  parentNodeId?: string | null;
  referenceNodeId?: string | null;
  text?: string | null;
  startOffset?: number | null;
  endOffset?: number | null;
  nodeType?: string | null;
  markType?: string | null;
  href?: string | null;
  collapsed?: boolean | null;
};

export type ResumeEditorBlockDto = {
  blockId?: string | null;
  blockType?: string | null;
  title?: string | null;
  text?: string | null;
  lines?: string[] | null;
  sourceAnchorType?: string | null;
  sourceAnchorRecordId?: string | number | null;
  sourceAnchorKey?: string | null;
  fieldPath?: string | null;
  displayOrder?: number | null;
  metadata?: Record<string, string> | null;
  inlineMarks?: ResumeEditorInlineMarkDto[] | null;
};

export type ResumeEditorDocumentDto = {
  astVersion?: number | null;
  markdownSource?: string | null;
  blocks?: ResumeEditorBlockDto[] | null;
  rootNodeId?: string | null;
  nodes?: ResumeEditorNodeDto[] | null;
  tableOfContents?: ResumeEditorTableOfContentsItemDto[] | null;
  layoutMetadata?: Record<string, string> | null;
};

export type ResumeEditorCommentReplyDto = {
  id?: string | number | null;
  commentThreadId?: string | number | null;
  body?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type ResumeEditorCommentThreadDto = {
  id?: string | number | null;
  blockId?: string | null;
  selectionAnchor?: ResumeEditorSelectionAnchorDto | null;
  fieldPath?: string | null;
  selectionStartOffset?: number | null;
  selectionEndOffset?: number | null;
  selectedText?: string | null;
  body?: string | null;
  status?: string | null;
  resolvedAt?: string | null;
  replyCount?: number | null;
  replies?: ResumeEditorCommentReplyDto[] | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type ResumeEditorQuestionCardDto = {
  id?: string | number | null;
  blockId?: string | null;
  selectionAnchor?: ResumeEditorSelectionAnchorDto | null;
  fieldPath?: string | null;
  selectionStartOffset?: number | null;
  selectionEndOffset?: number | null;
  selectedText?: string | null;
  title?: string | null;
  questionText?: string | null;
  questionType?: string | null;
  sourceType?: string | null;
  linkedQuestionId?: string | number | null;
  status?: string | null;
  followUpSuggestions?: string[] | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type ResumeEditorCommentSummaryDto = {
  totalCount?: number | null;
  openCount?: number | null;
  resolvedCount?: number | null;
  totalReplyCount?: number | null;
};

export type ResumeEditorQuestionCardSummaryDto = {
  totalCount?: number | null;
  activeCount?: number | null;
  archivedCount?: number | null;
};

export type ResumeEditorPresenceDto = {
  sessionKey?: string | null;
  userId?: string | number | null;
  userLabel?: string | null;
  viewMode?: string | null;
  selectedBlockId?: string | null;
  isCurrentUser?: boolean | null;
  updatedAt?: string | null;
};

export type ResumeEditorChangeSummaryDto = {
  addedBlockCount?: number | null;
  removedBlockCount?: number | null;
  updatedBlockCount?: number | null;
  inlineMarkDelta?: number | null;
  changedBlockIds?: string[] | null;
};

export type ResumeEditorRevisionListItemDto = {
  id?: string | number | null;
  revisionNo?: number | null;
  changeSource?: string | null;
  changeSummary?: ResumeEditorChangeSummaryDto | null;
  createdAt?: string | null;
};

export type ResumeEditorRevisionDto = {
  id?: string | number | null;
  workspaceId?: string | number | null;
  resumeVersionId?: string | number | null;
  revisionNo?: number | null;
  changeSource?: string | null;
  changeSummary?: ResumeEditorChangeSummaryDto | null;
  document?: ResumeEditorDocumentDto | null;
  createdAt?: string | null;
};

export type ResumeEditorPrintPreviewSectionDto = {
  sectionKey?: string | null;
  title?: string | null;
  lines?: string[] | null;
};

export type ResumeEditorPrintPreviewPageDto = {
  pageNumber?: number | null;
  sectionKeys?: string[] | null;
  lineCount?: number | null;
};

export type ResumeEditorPrintLayoutItemDto = {
  pageNumber?: number | null;
  sectionKey?: string | null;
  blockId?: string | null;
  blockType?: string | null;
  yOffsetLines?: number | null;
  estimatedLineSpan?: number | null;
};

export type ResumeEditorPrintPreviewDto = {
  resumeVersionId?: string | number | null;
  workspaceId?: string | number | null;
  title?: string | null;
  pageEstimate?: number | null;
  plainText?: string | null;
  sections?: ResumeEditorPrintPreviewSectionDto[] | null;
  pages?: ResumeEditorPrintPreviewPageDto[] | null;
  layoutItems?: ResumeEditorPrintLayoutItemDto[] | null;
};

export type ResumeEditorTrackedChangeDto = {
  blockId?: string | null;
  nodeId?: string | null;
  changeType?: string | null;
  beforeBlockType?: string | null;
  afterBlockType?: string | null;
  beforeText?: string | null;
  afterText?: string | null;
  beforeTextLines?: string[] | null;
  afterTextLines?: string[] | null;
  fieldPath?: string | null;
  beforeParentNodeId?: string | null;
  afterParentNodeId?: string | null;
  beforeDepth?: number | null;
  afterDepth?: number | null;
  textChanged?: boolean | null;
  structureChanged?: boolean | null;
  moveRelated?: boolean | null;
};

export type ResumeEditorTrackedChangesDto = {
  resumeVersionId?: string | number | null;
  fromRevisionId?: string | number | null;
  toRevisionId?: string | number | null;
  changeSummary?: ResumeEditorChangeSummaryDto | null;
  changes?: ResumeEditorTrackedChangeDto[] | null;
};

export type ResumeEditorMergeConflictDto = {
  blockId?: string | null;
  nodeId?: string | null;
  conflictType?: string | null;
  baseText?: string | null;
  currentText?: string | null;
  proposedText?: string | null;
  baseTextLines?: string[] | null;
  currentTextLines?: string[] | null;
  proposedTextLines?: string[] | null;
  conflictScopes?: string[] | null;
  baseParentNodeId?: string | null;
  currentParentNodeId?: string | null;
  proposedParentNodeId?: string | null;
};

export type ResumeEditorMergePreviewDto = {
  resumeVersionId?: string | number | null;
  baseRevisionId?: string | number | null;
  currentRevisionId?: string | number | null;
  mergeStatus?: string | null;
  mergedDocument?: ResumeEditorDocumentDto | null;
  conflicts?: ResumeEditorMergeConflictDto[] | null;
  changeSummary?: ResumeEditorChangeSummaryDto | null;
};

export type ResumeEditorWorkspaceDto = {
  workspaceId?: string | number | null;
  resumeVersionId?: string | number | null;
  sourceVersionNo?: number | null;
  sourceFileName?: string | null;
  workspaceStatus?: string | null;
  revisionNo?: number | null;
  documentModel?: string | null;
  selectionCapabilities?: ResumeEditorSelectionCapabilitiesDto | null;
  contextMenuActions?: string[] | null;
  supportedViewModes?: string[] | null;
  document?: ResumeEditorDocumentDto | null;
  comments?: ResumeEditorCommentThreadDto[] | null;
  questionCards?: ResumeEditorQuestionCardDto[] | null;
  commentSummary?: ResumeEditorCommentSummaryDto | null;
  questionCardSummary?: ResumeEditorQuestionCardSummaryDto | null;
  heatmapAvailable?: boolean | null;
  heatmapSummary?: {
    totalAnchors?: number | null;
    totalLinkedQuestions?: number | null;
    hottestAnchorLabel?: string | null;
    mostFollowedUpAnchorLabel?: string | null;
    weakestAnchorLabel?: string | null;
  } | null;
  activePresence?: ResumeEditorPresenceDto[] | null;
  latestRevision?: ResumeEditorRevisionListItemDto | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type CreateResumeEditorCommentRequestDto = {
  blockId?: string | null;
  selectionAnchor?: ResumeEditorSelectionAnchorDto | null;
  fieldPath?: string | null;
  selectionStartOffset?: number | null;
  selectionEndOffset?: number | null;
  selectedText?: string | null;
  body: string;
};

export type UpdateResumeEditorCommentRequestDto = {
  body?: string | null;
  status?: string | null;
};

export type CreateResumeEditorCommentReplyRequestDto = {
  body: string;
};

export type CreateResumeEditorQuestionCardRequestDto = {
  blockId?: string | null;
  selectionAnchor?: ResumeEditorSelectionAnchorDto | null;
  fieldPath?: string | null;
  selectionStartOffset?: number | null;
  selectionEndOffset?: number | null;
  selectedText?: string | null;
  title?: string | null;
  questionText: string;
  questionType: string;
  linkedQuestionId?: string | number | null;
  followUpSuggestions?: string[] | null;
};

export type UpdateResumeEditorQuestionCardRequestDto = {
  title?: string | null;
  questionText?: string | null;
  questionType?: string | null;
  linkedQuestionId?: string | number | null;
  status?: string | null;
  followUpSuggestions?: string[] | null;
};

export type ResumeEditorSuggestedQuestionDto = {
  title?: string | null;
  questionText?: string | null;
  questionType?: string | null;
  rationale?: string | null;
  followUpSuggestions?: string[] | null;
};

export type ResumeEditorQuestionSuggestionResponseDto = {
  resumeVersionId?: string | number | null;
  blockId?: string | null;
  selectionAnchor?: ResumeEditorSelectionAnchorDto | null;
  selectedText?: string | null;
  sourceType?: string | null;
  suggestions?: ResumeEditorSuggestedQuestionDto[] | null;
};

export type CreateResumeEditorQuestionSuggestionRequestDto = {
  blockId?: string | null;
  selectionAnchor?: ResumeEditorSelectionAnchorDto | null;
  fieldPath?: string | null;
  selectedText?: string | null;
  maxSuggestions?: number | null;
};

export type ResumeEditorRewriteSuggestionDto = {
  suggestedText?: string | null;
  rationale?: string | null;
  focusArea?: string | null;
  partialApplyAllowed?: boolean | null;
};

export type ResumeEditorRewriteSuggestionResponseDto = {
  resumeVersionId?: string | number | null;
  blockId?: string | null;
  selectionAnchor?: ResumeEditorSelectionAnchorDto | null;
  selectedText?: string | null;
  sourceType?: string | null;
  suggestions?: ResumeEditorRewriteSuggestionDto[] | null;
};

export type CreateResumeEditorRewriteSuggestionRequestDto = {
  blockId?: string | null;
  selectionAnchor?: ResumeEditorSelectionAnchorDto | null;
  fieldPath?: string | null;
  selectedText?: string | null;
};

export type UpdateResumeEditorDocumentRequestDto = {
  blocks?: ResumeEditorBlockDto[] | null;
  rootNodeId?: string | null;
  nodes?: ResumeEditorNodeDto[] | null;
  tableOfContents?: ResumeEditorTableOfContentsItemDto[] | null;
  markdownSource?: string | null;
  layoutMetadata?: Record<string, string> | null;
  baseRevisionNo?: number | null;
  changeSource?: string | null;
};

export type PatchResumeEditorDocumentOperationsRequestDto = {
  operations?: ResumeEditorDocumentOperationDto[] | null;
  baseRevisionNo?: number | null;
  changeSource?: string | null;
  clientSessionKey?: string | null;
  clientChangeId?: string | null;
};

export type ImportResumeEditorMarkdownRequestDto = {
  markdownSource: string;
  replaceDocument?: boolean | null;
  baseRevisionNo?: number | null;
  changeSource?: string | null;
};

export type CreateResumeEditorPresenceRequestDto = {
  sessionKey: string;
  viewMode?: string | null;
  selectedBlockId?: string | null;
};

export type ResumeEditorMergePreviewRequestDto = {
  blocks?: ResumeEditorBlockDto[] | null;
  rootNodeId?: string | null;
  nodes?: ResumeEditorNodeDto[] | null;
  tableOfContents?: ResumeEditorTableOfContentsItemDto[] | null;
  markdownSource?: string | null;
  layoutMetadata?: Record<string, string> | null;
  baseRevisionNo: number;
};
