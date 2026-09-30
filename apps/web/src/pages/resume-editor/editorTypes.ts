import type { useResumeEditorWorkspaceQuery } from "../../features/resume-editor/api/useResumeEditorWorkspaceQuery";

export type EditorTab = "edit" | "review" | "heatmap" | "print-preview" | "history";
export type EditorSidePanel = "source" | "presence" | "comments" | "question-cards" | "suggestions";
export type InlineSuggestionPreview = "question" | "rewrite" | null;
export type InlineComposerMode = "comment" | "card" | null;
export type SlashCommandState = {
  query: string;
  lineStart: number;
  lineEnd: number;
} | null;

export type MarkdownSelectionState = {
  startOffset: number;
  endOffset: number;
  text: string;
} | null;

export type EditableBlock = {
  blockId: string;
  blockType: string;
  blockTypeLabel: string;
  title: string;
  text: string;
  lines: string[];
  sourceAnchorType: string | null;
  sourceAnchorTypeLabel: string | null;
  sourceAnchorRecordId: string | null;
  sourceAnchorKey: string | null;
  fieldPath: string | null;
  displayOrder: number;
  metadata: Record<string, string>;
  inlineMarks: Array<{
    markType: string;
    markTypeLabel: string;
    startOffset: number;
    endOffset: number;
    text: string;
    href: string | null;
  }>;
};

export type ReviewLineSignal = {
  commentCount: number;
  cardCount: number;
  suggestionCount: number;
};

export type ReviewSignalType = "comments" | "question-cards" | "suggestions";
export type ReviewSummaryItem = {
  panelId: ReviewSignalType;
  label: string;
  value: string;
  helper: string;
};

export type FloatingEditorPosition = {
  top: number;
  left: number;
} | null;

export type SelectionFormatAction =
  | "bold"
  | "italic"
  | "code"
  | "heading1"
  | "heading2"
  | "bullet"
  | "quote";

export type LineMenuView = "root" | "turn-into";

export type MarkdownLineDescriptor = {
  type: "h1" | "h2" | "h3" | "bullet" | "quote" | "paragraph" | "spacer";
  prefix: string;
  content: string;
};

export type ResumeEditorWorkspace = NonNullable<ReturnType<typeof useResumeEditorWorkspaceQuery>["data"]>;

export type SelectionOverride = { startOffset: number; endOffset: number; selectedText: string } | null;
