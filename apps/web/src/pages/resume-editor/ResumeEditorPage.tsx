import {
  Suspense,
  lazy,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ApiClientError, getErrorDetails } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { EmptyStateCard } from "../../shared/ui/EmptyStateCard";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { FeedbackNotice } from "../../shared/ui/FeedbackNotice";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { MetricCard } from "../../shared/ui/MetricCard";
import { PageContainer } from "../../shared/ui/PageContainer";
import { useResumeVersionSnapshotsQuery } from "../../features/resume/api/useResumeVersionSnapshotsQuery";
import { useResumeEditorWorkspaceQuery } from "../../features/resume-editor/api/useResumeEditorWorkspaceQuery";
import {
  useImportResumeEditorMarkdownMutation,
  usePatchResumeEditorDocumentOperationsMutation,
  useResumeEditorMergePreviewMutation,
  useUpdateResumeEditorDocumentMutation,
} from "../../features/resume-editor/api/useResumeEditorDocumentMutations";
import {
  useCreateResumeEditorCommentMutation,
  useCreateResumeEditorCommentReplyMutation,
  useCreateResumeEditorQuestionCardMutation,
  useResumeEditorQuestionSuggestionsMutation,
  useResumeEditorRewriteSuggestionsMutation,
  useUpdateResumeEditorCommentMutation,
  useUpdateResumeEditorQuestionCardMutation,
} from "../../features/resume-editor/api/useResumeEditorAnnotationMutations";
import { useResumeEditorPresenceMutation } from "../../features/resume-editor/api/useResumeEditorPresenceMutation";
import {
  useResumeEditorPrintPreviewQuery,
  useResumeEditorRevisionDetailQuery,
  useResumeEditorRevisionsQuery,
  useResumeEditorTrackedChangesQuery,
} from "../../features/resume-editor/api/useResumeEditorSecondaryQueries";

const ResumeEditorHeatmapPanel = lazy(() => import("../../widgets/resume-editor/ResumeEditorHeatmapPanel"));
const ResumeEditorPrintPreviewPanel = lazy(() => import("../../widgets/resume-editor/ResumeEditorPrintPreviewPanel"));
const ResumeEditorHistoryPanel = lazy(() => import("../../widgets/resume-editor/ResumeEditorHistoryPanel"));

type EditorTab = "edit" | "review" | "heatmap" | "print-preview" | "history";
type EditorSidePanel = "source" | "presence" | "comments" | "question-cards" | "suggestions";
type InlineSuggestionPreview = "question" | "rewrite" | null;
type InlineComposerMode = "comment" | "card" | null;
type SlashCommandState = {
  query: string;
  lineStart: number;
  lineEnd: number;
} | null;

type MarkdownSelectionState = {
  startOffset: number;
  endOffset: number;
  text: string;
} | null;

type EditableBlock = {
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

type ReviewLineSignal = {
  commentCount: number;
  cardCount: number;
  suggestionCount: number;
};

type ReviewSignalType = "comments" | "question-cards" | "suggestions";
type ReviewSummaryItem = {
  panelId: ReviewSignalType;
  label: string;
  value: string;
  helper: string;
};

type FloatingEditorPosition = {
  top: number;
  left: number;
} | null;

type SelectionFormatAction =
  | "bold"
  | "italic"
  | "code"
  | "heading1"
  | "heading2"
  | "bullet"
  | "quote";

type LineMenuView = "root" | "turn-into";

type MarkdownLineDescriptor = {
  type: "h1" | "h2" | "h3" | "bullet" | "quote" | "paragraph" | "spacer";
  prefix: string;
  content: string;
};

function createFallbackSessionKey() {
  return `resume-editor-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

function createEditorSessionKey() {
  const randomUuid = globalThis.crypto?.randomUUID?.();

  return randomUuid ? `resume-editor-${randomUuid}` : createFallbackSessionKey();
}

function normalizeEditorTab(value: string | null): EditorTab {
  if (
    value === "edit" ||
    value === "review" ||
    value === "heatmap" ||
    value === "print-preview" ||
    value === "history"
  ) {
    return value;
  }

  return "edit";
}

function mapEditableBlocks(
  blocks: Array<{
    blockId: string;
    blockType: string;
    blockTypeLabel: string;
    title: string;
    textValue: string;
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
  }>,
): EditableBlock[] {
  return blocks.map((block) => ({
    blockId: block.blockId,
    blockType: block.blockType,
    blockTypeLabel: block.blockTypeLabel,
    title: block.title,
    text: block.textValue,
    lines: block.lines,
    sourceAnchorType: block.sourceAnchorType,
    sourceAnchorTypeLabel: block.sourceAnchorTypeLabel,
    sourceAnchorRecordId: block.sourceAnchorRecordId,
    sourceAnchorKey: block.sourceAnchorKey,
    fieldPath: block.fieldPath,
    displayOrder: block.displayOrder,
    metadata: block.metadata,
    inlineMarks: block.inlineMarks,
  }));
}

function splitLines(text: string) {
  return text.split("\n");
}

function decodeSoftBreaks(text: string) {
  return text.replace(/<br\s*\/?>/gi, "\n");
}

function encodeSoftBreaks(text: string) {
  return text.replace(/\n/g, "<br />");
}

function describeMarkdownLine(line: string): MarkdownLineDescriptor {
  const trimmed = line.trim();

  if (!trimmed) {
    return {
      type: "spacer",
      prefix: "",
      content: "",
    };
  }

  if (line.startsWith("### ")) {
    return {
      type: "h3",
      prefix: "### ",
      content: decodeSoftBreaks(line.slice(4)),
    };
  }

  if (line.startsWith("## ")) {
    return {
      type: "h2",
      prefix: "## ",
      content: decodeSoftBreaks(line.slice(3)),
    };
  }

  if (line.startsWith("# ")) {
    return {
      type: "h1",
      prefix: "# ",
      content: decodeSoftBreaks(line.slice(2)),
    };
  }

  if (line.startsWith("- ") || line.startsWith("* ")) {
    return {
      type: "bullet",
      prefix: "- ",
      content: decodeSoftBreaks(line.slice(2)),
    };
  }

  if (line.startsWith("> ")) {
    return {
      type: "quote",
      prefix: "> ",
      content: decodeSoftBreaks(line.slice(2)),
    };
  }

  return {
    type: "paragraph",
    prefix: "",
    content: decodeSoftBreaks(line),
  };
}

function rebuildMarkdownLine(descriptor: MarkdownLineDescriptor, nextContent: string) {
  return `${descriptor.prefix}${encodeSoftBreaks(nextContent)}`;
}

function getMarkdownLineStartOffset(value: string, lineIndex: number) {
  return value
    .split("\n")
    .slice(0, Math.max(0, lineIndex))
    .reduce((total, currentLine) => total + currentLine.length + 1, 0);
}

function mapRichNodeRequest(
  nodes: Array<{
    nodeId: string;
    parentNodeId: string | null;
    nodeType: string;
    text: string;
    textRuns: Array<{ text: string; marks: string[]; href: string | null }>;
    children: string[];
    collapsed: boolean;
    depth: number;
    sourceAnchorType: string | null;
    sourceAnchorRecordId: string | null;
    sourceAnchorKey: string | null;
    fieldPath: string | null;
    displayOrder: number;
    metadata: Record<string, string>;
  }>,
) {
  return nodes.map((node) => ({
    nodeId: node.nodeId,
    parentNodeId: node.parentNodeId,
    nodeType: node.nodeType,
    text: node.text || null,
    textRuns: node.textRuns.map((run) => ({
      text: run.text || null,
      marks: run.marks,
      href: run.href,
    })),
    children: node.children,
    collapsed: node.collapsed,
    depth: node.depth,
    sourceAnchorType: node.sourceAnchorType,
    sourceAnchorRecordId: node.sourceAnchorRecordId,
    sourceAnchorKey: node.sourceAnchorKey,
    fieldPath: node.fieldPath,
    displayOrder: node.displayOrder,
    metadata: node.metadata,
  }));
}

function renderAnnotatedText(
  text: string,
  inlineMarks: EditableBlock["inlineMarks"],
  selection: { startOffset: number; endOffset: number } | null,
) {
  if (!text) {
    return null;
  }

  const boundaries = new Set<number>([0, text.length]);

  inlineMarks.forEach((mark) => {
    boundaries.add(Math.max(0, Math.min(text.length, mark.startOffset)));
    boundaries.add(Math.max(0, Math.min(text.length, mark.endOffset)));
  });

  if (selection) {
    boundaries.add(Math.max(0, Math.min(text.length, selection.startOffset)));
    boundaries.add(Math.max(0, Math.min(text.length, selection.endOffset)));
  }

  const sortedBoundaries = [...boundaries].sort((left, right) => left - right);

  return sortedBoundaries.slice(0, -1).map((start, index) => {
    const end = sortedBoundaries[index + 1];
    const segmentText = text.slice(start, end);

    if (!segmentText) {
      return null;
    }

    const coveringMark = inlineMarks.find(
      (mark) => start >= mark.startOffset && end <= mark.endOffset,
    );
    const isSelected =
      selection !== null && start >= selection.startOffset && end <= selection.endOffset;

    const classNames = [
      "resume-editor-annotated-text__segment",
      coveringMark ? "resume-editor-annotated-text__segment--marked" : "",
      isSelected ? "resume-editor-annotated-text__segment--selected" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <span className={classNames} key={`${start}-${end}`}>
        {segmentText}
      </span>
    );
  });
}

function renderPreviewTextWithSelection(text: string, selectedText: string | null) {
  const normalizedText = decodeSoftBreaks(text);

  if (!selectedText) {
    return normalizedText;
  }

  const parts = normalizedText.split(selectedText);

  if (parts.length === 1) {
    return normalizedText;
  }

  return parts.flatMap((part, index) => {
    if (index === parts.length - 1) {
      return [<span key={`preview-part-${index}`}>{part}</span>];
    }

    return [
      <span key={`preview-part-${index}`}>{part}</span>,
      <mark className="resume-editor-document-preview__selection" key={`preview-selection-${index}`}>
        {selectedText}
      </mark>,
    ];
  });
}

function renderMarkdownDocumentPreview(
  markdownSource: string,
  options?: {
    selectedText?: string | null;
    tableOfContents?: Array<{ id: string; nodeId: string; title: string }>;
    editable?: boolean;
    onEditableLineInput?: (lineIndex: number, nextContent: string) => void;
    onEditableLineSelection?: (lineIndex: number, element: HTMLDivElement) => void;
    onEditableLineFocus?: (lineIndex: number, lineText: string) => void;
    onEditableLineKeyDown?: (lineIndex: number, event: ReactKeyboardEvent<HTMLDivElement>) => void;
    lineRef?: (lineIndex: number, element: HTMLDivElement | null) => void;
    onHeadingClick?: (nodeId: string) => void;
    activeLineMenuIndex?: number | null;
    onAddLine?: (lineIndex: number) => void;
    onToggleLineMenu?: (lineIndex: number, target: HTMLButtonElement) => void;
    onLineAction?: (action: string, lineIndex: number, lineText: string) => void;
    renderLineMenu?: (lineIndex: number, lineText: string) => ReactNode;
    reviewSignals?: ReviewLineSignal[];
    onReviewSignalClick?: (signalType: ReviewSignalType, lineIndex: number) => void;
    focusedLineIndex?: number | null;
  },
) {
  const lines = markdownSource.split("\n");
  const selectedText = options?.selectedText?.trim() ? options.selectedText : null;
  const tableOfContents = options?.tableOfContents ?? [];
  let tocIndex = 0;

  function renderEditableLine(
    lineIndex: number,
    lineText: string,
    className: string,
  ) {
    const descriptor = describeMarkdownLine(lineText);
    const content = descriptor.content;
    const placeholder =
      descriptor.type === "bullet"
        ? "List item"
        : descriptor.type === "quote"
          ? "Quote"
          : descriptor.type === "h1"
            ? "Title"
            : descriptor.type === "h2" || descriptor.type === "h3"
              ? "Heading"
              : "Write here";

    return (
      <div
        aria-label={`Editable line ${lineIndex + 1}`}
        className={`${className} resume-editor-document-preview__editable`}
        contentEditable
        data-placeholder={placeholder}
        onFocus={() => options?.onEditableLineFocus?.(lineIndex, lineText)}
        onInput={(event) => {
          options?.onEditableLineInput?.(lineIndex, event.currentTarget.innerText ?? "");
        }}
        onKeyDown={(event) => options?.onEditableLineKeyDown?.(lineIndex, event)}
        onKeyUp={(event) => options?.onEditableLineSelection?.(lineIndex, event.currentTarget)}
        onMouseUp={(event) => options?.onEditableLineSelection?.(lineIndex, event.currentTarget)}
        ref={(element) => options?.lineRef?.(lineIndex, element)}
        role="textbox"
        suppressContentEditableWarning
      >
        {content}
      </div>
    );
  }

  function wrapPreviewLine(content: ReactNode, lineIndex: number, lineText: string) {
    const lineSignal = options?.reviewSignals?.[lineIndex] ?? null;
    const hasReviewSignals =
      lineSignal !== null &&
      (lineSignal.commentCount > 0 || lineSignal.cardCount > 0 || lineSignal.suggestionCount > 0);
    const isFocusedLine = options?.focusedLineIndex === lineIndex;

    return (
      <div
        className={`resume-editor-document-preview__row ${hasReviewSignals ? "resume-editor-document-preview__row--signaled" : ""} ${isFocusedLine ? "resume-editor-document-preview__row--focused" : ""} ${options?.activeLineMenuIndex === lineIndex ? "resume-editor-document-preview__row--menu-open" : ""}`}
        data-line-index={lineIndex}
        key={`preview-${lineIndex}`}
      >
        <div className="resume-editor-document-preview__controls">
          <button
            aria-label={`Add line after ${lineIndex + 1}`}
            className="resume-editor-document-preview__handle"
            onClick={() => options?.onAddLine?.(lineIndex)}
            type="button"
          >
            +
          </button>
          <button
            aria-label={`Preview line menu ${lineIndex + 1}`}
            className="resume-editor-document-preview__grip"
            onClick={(event) => options?.onToggleLineMenu?.(lineIndex, event.currentTarget)}
            type="button"
          >
            ⋮⋮
          </button>
        </div>
        <div className="resume-editor-document-preview__content">{content}</div>
        {hasReviewSignals ? (
          <div className="resume-editor-document-preview__signals" aria-label={`Review signals ${lineIndex + 1}`}>
            {lineSignal.commentCount > 0 ? (
              <button
                aria-label={`${lineSignal.commentCount} comment threads on this line`}
                className="detail-chip detail-chip--interactive detail-chip--accent resume-editor-document-preview__signal"
                data-tooltip={`${lineSignal.commentCount} comment thread${lineSignal.commentCount > 1 ? "s" : ""}`}
                onClick={() => options?.onReviewSignalClick?.("comments", lineIndex)}
                title={`${lineSignal.commentCount} comment thread${lineSignal.commentCount > 1 ? "s" : ""}`}
                type="button"
              >
                C {lineSignal.commentCount}
              </button>
            ) : null}
            {lineSignal.cardCount > 0 ? (
              <button
                aria-label={`${lineSignal.cardCount} question cards on this line`}
                className="detail-chip detail-chip--interactive detail-chip--neutral resume-editor-document-preview__signal"
                data-tooltip={`${lineSignal.cardCount} question card${lineSignal.cardCount > 1 ? "s" : ""}`}
                onClick={() => options?.onReviewSignalClick?.("question-cards", lineIndex)}
                title={`${lineSignal.cardCount} question card${lineSignal.cardCount > 1 ? "s" : ""}`}
                type="button"
              >
                Q {lineSignal.cardCount}
              </button>
            ) : null}
            {lineSignal.suggestionCount > 0 ? (
              <button
                aria-label={`${lineSignal.suggestionCount} suggestions linked to this line`}
                className="detail-chip detail-chip--interactive resume-editor-document-preview__signal"
                data-tooltip={`${lineSignal.suggestionCount} suggestion${lineSignal.suggestionCount > 1 ? "s" : ""}`}
                onClick={() => options?.onReviewSignalClick?.("suggestions", lineIndex)}
                title={`${lineSignal.suggestionCount} suggestion${lineSignal.suggestionCount > 1 ? "s" : ""}`}
                type="button"
              >
                S {lineSignal.suggestionCount}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }

  return lines.map((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      return options?.editable
        ? wrapPreviewLine(
            renderEditableLine(index, line, "resume-editor-document-preview__paragraph"),
            index,
            line,
          )
        : <div className="resume-editor-document-preview__spacer" key={`preview-${index}`} />;
    }

    if (trimmed.startsWith("### ")) {
      const headingText = trimmed.slice(4);
      const matchedTocItem = tableOfContents[tocIndex] ?? null;
      tocIndex += 1;
      return wrapPreviewLine(
        options?.editable ? (
          renderEditableLine(
            index,
            line,
            "resume-editor-document-preview__heading resume-editor-document-preview__heading--small",
          )
        ) : (
          <button
            className="resume-editor-document-preview__heading resume-editor-document-preview__heading--small resume-editor-document-preview__heading-button"
            id={matchedTocItem ? `resume-editor-heading-${matchedTocItem.nodeId}` : undefined}
            onClick={() => {
              if (matchedTocItem) {
                options?.onHeadingClick?.(matchedTocItem.nodeId);
              }
            }}
            type="button"
          >
            {renderPreviewTextWithSelection(headingText, selectedText)}
          </button>
        ),
        index,
        line,
      );
    }

    if (trimmed.startsWith("## ")) {
      const headingText = trimmed.slice(3);
      const matchedTocItem = tableOfContents[tocIndex] ?? null;
      tocIndex += 1;
      return wrapPreviewLine(
        options?.editable ? (
          renderEditableLine(index, line, "resume-editor-document-preview__heading")
        ) : (
          <button
            className="resume-editor-document-preview__heading resume-editor-document-preview__heading-button"
            id={matchedTocItem ? `resume-editor-heading-${matchedTocItem.nodeId}` : undefined}
            onClick={() => {
              if (matchedTocItem) {
                options?.onHeadingClick?.(matchedTocItem.nodeId);
              }
            }}
            type="button"
          >
            {renderPreviewTextWithSelection(headingText, selectedText)}
          </button>
        ),
        index,
        line,
      );
    }

    if (trimmed.startsWith("# ")) {
      const headingText = trimmed.slice(2);
      const matchedTocItem = tableOfContents[tocIndex] ?? null;
      tocIndex += 1;
      return wrapPreviewLine(
        options?.editable ? (
          renderEditableLine(index, line, "resume-editor-document-preview__title")
        ) : (
          <button
            className="resume-editor-document-preview__title resume-editor-document-preview__heading-button"
            id={matchedTocItem ? `resume-editor-heading-${matchedTocItem.nodeId}` : undefined}
            onClick={() => {
              if (matchedTocItem) {
                options?.onHeadingClick?.(matchedTocItem.nodeId);
              }
            }}
            type="button"
          >
            {renderPreviewTextWithSelection(headingText, selectedText)}
          </button>
        ),
        index,
        line,
      );
    }

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      return wrapPreviewLine(
        options?.editable ? (
          <div className="resume-editor-document-preview__bullet" key={`preview-${index}`}>
            <span className="resume-editor-document-preview__bullet-mark">•</span>
            {renderEditableLine(index, line, "resume-editor-document-preview__paragraph")}
          </div>
        ) : (
          <div className="resume-editor-document-preview__bullet" key={`preview-${index}`}>
            <span className="resume-editor-document-preview__bullet-mark">•</span>
            <span>{renderPreviewTextWithSelection(trimmed.slice(2), selectedText)}</span>
          </div>
        ),
        index,
        line,
      );
    }

    if (trimmed.startsWith("> ")) {
      return wrapPreviewLine(
        options?.editable ? (
          renderEditableLine(index, line, "resume-editor-document-preview__quote")
        ) : (
          <blockquote className="resume-editor-document-preview__quote" key={`preview-${index}`}>
            {renderPreviewTextWithSelection(trimmed.slice(2), selectedText)}
          </blockquote>
        ),
        index,
        line,
      );
    }

    return wrapPreviewLine(
      options?.editable ? (
        renderEditableLine(index, line, "resume-editor-document-preview__paragraph")
      ) : (
        <p className="resume-editor-document-preview__paragraph" key={`preview-${index}`}>
          {renderPreviewTextWithSelection(line, selectedText)}
        </p>
      ),
      index,
      line,
    );
  });
}

function scrollToEditorHeading(nodeId: string) {
  const headingElement = document.getElementById(`resume-editor-heading-${nodeId}`);

  if (!headingElement) {
    return;
  }

  headingElement.scrollIntoView({ behavior: "smooth", block: "center" });
}

function getDefaultSelectedText(block: EditableBlock | null) {
  if (!block) {
    return null;
  }

  const trimmed = block.text.trim();

  return trimmed ? trimmed.slice(0, 180) : null;
}

function replaceFirstOccurrence(source: string, searchText: string, replacementText: string) {
  if (!searchText) {
    return source;
  }

  const targetIndex = source.indexOf(searchText);

  if (targetIndex < 0) {
    return source;
  }

  return `${source.slice(0, targetIndex)}${replacementText}${source.slice(targetIndex + searchText.length)}`;
}

function buildPreviewReviewSignals(
  markdownSource: string,
  comments: Array<{ selectedText: string | null; body: string }>,
  questionCards: Array<{ selectedText: string | null; questionText: string }>,
  suggestionCount: number,
) {
  const lines = markdownSource.split("\n");

  return lines.map<ReviewLineSignal>((line) => {
    const normalizedLine = line.trim().toLowerCase();

    if (!normalizedLine) {
      return { commentCount: 0, cardCount: 0, suggestionCount: 0 };
    }

    const commentCount = comments.filter((comment) => {
      const target = comment.selectedText?.trim().toLowerCase();

      if (!target) {
        return false;
      }

      return normalizedLine.includes(target) || target.includes(normalizedLine);
    }).length;

    const cardCount = questionCards.filter((card) => {
      const target = card.selectedText?.trim().toLowerCase();

      if (!target) {
        return false;
      }

      return normalizedLine.includes(target) || target.includes(normalizedLine);
    }).length;

    return {
      commentCount,
      cardCount,
      suggestionCount: commentCount === 0 && cardCount === 0 ? 0 : suggestionCount,
    };
  });
}

function findFirstReviewSignalLine(
  reviewSignals: ReviewLineSignal[],
  signalType: ReviewSignalType,
) {
  return reviewSignals.findIndex((signal) => {
    if (signalType === "comments") {
      return signal.commentCount > 0;
    }

    if (signalType === "question-cards") {
      return signal.cardCount > 0;
    }

    return signal.suggestionCount > 0;
  });
}

function getSelectableLineRange(value: string, lineIndex: number) {
  const lines = value.split("\n");
  const safeLineIndex = Math.max(0, Math.min(lines.length - 1, lineIndex));
  const line = lines[safeLineIndex] ?? "";
  let prefixLength = 0;

  if (line.startsWith("### ")) {
    prefixLength = 4;
  } else if (line.startsWith("## ")) {
    prefixLength = 3;
  } else if (line.startsWith("# ")) {
    prefixLength = 2;
  } else if (line.startsWith("- ") || line.startsWith("* ") || line.startsWith("> ")) {
    prefixLength = 2;
  }

  const leadingWhitespaceLength = line.slice(prefixLength).match(/^\s*/)?.[0].length ?? 0;
  const selectedText = line.slice(prefixLength + leadingWhitespaceLength).trim();
  const lineStartOffset =
    lines.slice(0, safeLineIndex).reduce((total, currentLine) => total + currentLine.length + 1, 0) +
    prefixLength +
    leadingWhitespaceLength;
  const lineEndOffset = lineStartOffset + selectedText.length;

  return {
    startOffset: lineStartOffset,
    endOffset: lineEndOffset,
    text: selectedText,
    selectedText,
  };
}

function getLineIndexForOffset(value: string, offset: number) {
  const safeOffset = Math.max(0, Math.min(value.length, offset));

  return value.slice(0, safeOffset).split("\n").length - 1;
}

export function ResumeEditorPage() {
  const { versionId } = useParams<{ versionId: string }>();
  const safeVersionId = versionId ?? "";
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = normalizeEditorTab(searchParams.get("tab"));
  const workspaceQuery = useResumeEditorWorkspaceQuery(versionId ?? null);
  const snapshotsQuery = useResumeVersionSnapshotsQuery(versionId ?? null);
  const printPreviewQuery = useResumeEditorPrintPreviewQuery(
    versionId ?? null,
    currentTab === "print-preview",
  );
  const revisionsQuery = useResumeEditorRevisionsQuery(versionId ?? null, currentTab === "history");
  const [selectedRevisionId, setSelectedRevisionId] = useState<string | null>(null);
  const [compareFromRevisionId, setCompareFromRevisionId] = useState<string | null>(null);
  const [compareToRevisionId, setCompareToRevisionId] = useState<string | null>(null);
  const revisionDetailQuery = useResumeEditorRevisionDetailQuery(
    versionId ?? null,
    selectedRevisionId,
    currentTab === "history" && Boolean(selectedRevisionId),
  );
  const trackedChangesQuery = useResumeEditorTrackedChangesQuery(
    versionId ?? null,
    compareFromRevisionId,
    compareToRevisionId,
    currentTab === "history" && Boolean(compareFromRevisionId && compareToRevisionId),
  );
  const updateDocumentMutation = useUpdateResumeEditorDocumentMutation(versionId ?? null);
  const patchDocumentOperationsMutation = usePatchResumeEditorDocumentOperationsMutation(
    versionId ?? null,
  );
  const importMarkdownMutation = useImportResumeEditorMarkdownMutation(versionId ?? null);
  const createCommentMutation = useCreateResumeEditorCommentMutation(versionId ?? null);
  const updateCommentMutation = useUpdateResumeEditorCommentMutation(versionId ?? null);
  const createReplyMutation = useCreateResumeEditorCommentReplyMutation(versionId ?? null);
  const createQuestionCardMutation = useCreateResumeEditorQuestionCardMutation(versionId ?? null);
  const updateQuestionCardMutation = useUpdateResumeEditorQuestionCardMutation(versionId ?? null);
  const questionSuggestionsMutation = useResumeEditorQuestionSuggestionsMutation(versionId ?? null);
  const rewriteSuggestionsMutation = useResumeEditorRewriteSuggestionsMutation(versionId ?? null);
  const presenceMutation = useResumeEditorPresenceMutation(versionId ?? null);
  const sendPresence = presenceMutation.mutateAsync;
  const mergePreviewMutation = useResumeEditorMergePreviewMutation(versionId ?? null);

  const [blocks, setBlocks] = useState<EditableBlock[]>([]);
  const [markdownSource, setMarkdownSource] = useState("");
  const [layoutMetadata, setLayoutMetadata] = useState<Record<string, string>>({});
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [sessionKey] = useState(() => createEditorSessionKey());
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [importMarkdownOpen, setImportMarkdownOpen] = useState(false);
  const [importMarkdownSource, setImportMarkdownSource] = useState("");
  const [replaceDocument, setReplaceDocument] = useState(true);
  const [newCommentBody, setNewCommentBody] = useState("");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [newQuestionCardTitle, setNewQuestionCardTitle] = useState("");
  const [newQuestionCardText, setNewQuestionCardText] = useState("");
  const [newQuestionCardType, setNewQuestionCardType] = useState("behavioral");
  const [questionSuggestionMax, setQuestionSuggestionMax] = useState("3");
  const [mergePreviewMessage, setMergePreviewMessage] = useState<string | null>(null);
  const [selectedMarkdownRange, setSelectedMarkdownRange] = useState<MarkdownSelectionState>(null);
  const [activeSidePanel, setActiveSidePanel] = useState<EditorSidePanel>("comments");
  const [isContextPanelOpen, setIsContextPanelOpen] = useState(false);
  const [isSecondaryToolsOpen, setIsSecondaryToolsOpen] = useState(false);
  const [isWorkspaceInfoOpen, setIsWorkspaceInfoOpen] = useState(false);
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const [isFallbackBlocksOpen, setIsFallbackBlocksOpen] = useState(false);
  const [inlineSuggestionPreview, setInlineSuggestionPreview] =
    useState<InlineSuggestionPreview>(null);
  const [inlineComposerMode, setInlineComposerMode] = useState<InlineComposerMode>(null);
  const [inlineCommentBody, setInlineCommentBody] = useState("");
  const [inlineCardTitle, setInlineCardTitle] = useState("");
  const [inlineCardText, setInlineCardText] = useState("");
  const [slashCommand, setSlashCommand] = useState<SlashCommandState>(null);
  const [activePreviewLineIndex, setActivePreviewLineIndex] = useState<number | null>(null);
  const [activePreviewLineMenuView, setActivePreviewLineMenuView] = useState<LineMenuView>("root");
  const [previewLineMenuPosition, setPreviewLineMenuPosition] = useState<FloatingEditorPosition>(null);
  const [focusedReviewLineIndex, setFocusedReviewLineIndex] = useState<number | null>(null);
  const [currentCursorLineIndex, setCurrentCursorLineIndex] = useState<number | null>(null);
  const documentEditorLineRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const editorSurfaceBodyRef = useRef<HTMLDivElement | null>(null);
  const [editorToolbarPosition, setEditorToolbarPosition] = useState<FloatingEditorPosition>(null);
  const [editorPopoverPosition, setEditorPopoverPosition] = useState<FloatingEditorPosition>(null);
  const [isSelectionFormatOpen, setIsSelectionFormatOpen] = useState(false);

  const selectedBlock =
    blocks.find((block) => block.blockId === selectedBlockId) ?? blocks[0] ?? null;
  const richNodes = workspaceQuery.data?.document.nodes ?? [];
  const selectedNode = richNodes.find((node) => node.nodeId === selectedNodeId) ?? richNodes[0] ?? null;
  const richTreeEnabled =
    workspaceQuery.data?.documentModel === "rich_tree" &&
    workspaceQuery.data.selectionCapabilities.supportsRichTree &&
    richNodes.length > 0;
  const documentTableOfContents =
    workspaceQuery.data?.document.tableOfContents.filter(
      (item): item is (typeof workspaceQuery.data.document.tableOfContents)[number] & { nodeId: string } =>
        Boolean(item.nodeId),
    ) ?? [];
  const effectiveSelectedText =
    selectedMarkdownRange?.text ??
    (richTreeEnabled ? selectedNode?.text?.trim().slice(0, 180) ?? null : getDefaultSelectedText(selectedBlock));
  const currentSelectionAnchor =
    richTreeEnabled && selectedNode
      ? {
          nodeId: selectedNode.nodeId,
          anchorPath: selectedNode.nodeId,
          fieldPath: selectedNode.fieldPath,
          selectionStartOffset: selectedMarkdownRange?.startOffset ?? null,
          selectionEndOffset: selectedMarkdownRange?.endOffset ?? null,
          selectedText: selectedMarkdownRange?.text ?? effectiveSelectedText,
          anchorQuote: selectedMarkdownRange?.text ?? effectiveSelectedText,
          sentenceIndex: null,
        }
      : null;

  useEffect(() => {
    if (!workspaceQuery.data) {
      return;
    }

    setBlocks(mapEditableBlocks(workspaceQuery.data.document.blocks));
    setMarkdownSource(workspaceQuery.data.document.markdownSource);
    setLayoutMetadata(workspaceQuery.data.document.layoutMetadata);
    setSelectedBlockId((current) => current ?? workspaceQuery.data.document.blocks[0]?.blockId ?? null);
    setSelectedNodeId((current) => current ?? workspaceQuery.data.document.nodes[0]?.nodeId ?? null);
    setSelectedMarkdownRange(null);
    setSlashCommand(null);
    setFocusedReviewLineIndex(null);
  }, [workspaceQuery.data?.revisionNo]);

  useEffect(() => {
    if (!workspaceQuery.data) {
      return;
    }

    setIsFallbackBlocksOpen(workspaceQuery.data.documentModel !== "rich_tree");
  }, [workspaceQuery.data?.workspaceId, workspaceQuery.data?.documentModel]);

  useEffect(() => {
    if (revisionsQuery.data && revisionsQuery.data.length > 0) {
      setSelectedRevisionId((current) => current ?? revisionsQuery.data[0].id);
      setCompareToRevisionId((current) => current ?? revisionsQuery.data[0].id);
      setCompareFromRevisionId((current) => current ?? revisionsQuery.data[1]?.id ?? revisionsQuery.data[0].id);
    }
  }, [revisionsQuery.data]);

  useEffect(() => {
    if (currentTab !== "review" || focusedReviewLineIndex === null) {
      return;
    }

    const targetRow = document.querySelector<HTMLElement>(
      `.resume-editor-document-preview__row[data-line-index="${focusedReviewLineIndex}"]`,
    );

    if (!targetRow) {
      return;
    }

    targetRow.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [currentTab, focusedReviewLineIndex]);

  useEffect(() => {
    if (!versionId || !workspaceQuery.data) {
      return;
    }

    void sendPresence({
      sessionKey,
      viewMode: currentTab,
      selectedBlockId,
    });

    const intervalId = window.setInterval(() => {
      void sendPresence({
        sessionKey,
        viewMode: currentTab,
        selectedBlockId,
      });
    }, 20000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [currentTab, selectedBlockId, sendPresence, sessionKey, versionId, workspaceQuery.data?.workspaceId]);

  const sourceContextCards = useMemo(() => {
    if (!snapshotsQuery.data) {
      return [];
    }

    return [
      snapshotsQuery.data.profile?.summaryText
        ? {
            title: "Profile summary",
            body: snapshotsQuery.data.profile.summaryText,
          }
        : null,
      snapshotsQuery.data.skills.length > 0
        ? {
            title: "Skills",
            body: snapshotsQuery.data.skills.map((skill) => skill.label).join(", "),
          }
        : null,
      snapshotsQuery.data.experiences[0]
        ? {
            title: "Source experience",
            body: snapshotsQuery.data.experiences[0].impactText ?? snapshotsQuery.data.experiences[0].summary,
          }
        : null,
      snapshotsQuery.data.projects[0]
        ? {
            title: "Source project",
            body: snapshotsQuery.data.projects[0].contentText ?? snapshotsQuery.data.projects[0].summary,
          }
        : null,
    ].filter(Boolean) as Array<{ title: string; body: string }>;
  }, [snapshotsQuery.data]);

  const primarySidePanels: Array<[EditorSidePanel, string]> = [
    ["comments", "Comments"],
    ["question-cards", "Question cards"],
    ["suggestions", "Suggestions"],
  ];

  const secondarySidePanels: Array<[EditorSidePanel, string]> = [
    ["source", "Source"],
    ["presence", "Presence"],
  ];

  const isSecondaryPanelActive = activeSidePanel === "source" || activeSidePanel === "presence";
  const contextualSummaryItems: ReviewSummaryItem[] = workspaceQuery.data
    ? [
        {
          panelId: "comments" as ReviewSignalType,
          label: "Comments",
          value: String(workspaceQuery.data.commentSummary.totalCount),
          helper:
            workspaceQuery.data.commentSummary.openCount > 0
              ? `${workspaceQuery.data.commentSummary.openCount} open`
              : "No open threads",
        },
        {
          panelId: "question-cards" as ReviewSignalType,
          label: "Cards",
          value: String(workspaceQuery.data.questionCardSummary.totalCount),
          helper:
            workspaceQuery.data.questionCardSummary.activeCount > 0
              ? `${workspaceQuery.data.questionCardSummary.activeCount} active`
              : "No active cards",
        },
        {
          panelId: "suggestions" as ReviewSignalType,
          label: "Suggestions",
          value: String(
            (questionSuggestionsMutation.data?.suggestions.length ?? 0) +
              (rewriteSuggestionsMutation.data?.suggestions.length ?? 0),
          ),
          helper:
            questionSuggestionsMutation.data || rewriteSuggestionsMutation.data
              ? "Recent results"
              : "Generate on demand",
        },
      ]
    : [];
  const previewReviewSignals = useMemo(
    () =>
      workspaceQuery.data
        ? buildPreviewReviewSignals(
            markdownSource,
            workspaceQuery.data.comments,
            workspaceQuery.data.questionCards,
            (questionSuggestionsMutation.data?.suggestions.length ?? 0) +
              (rewriteSuggestionsMutation.data?.suggestions.length ?? 0),
          )
        : [],
    [
      markdownSource,
      questionSuggestionsMutation.data,
      rewriteSuggestionsMutation.data,
      workspaceQuery.data,
    ],
  );
  const reviewHotspotLineIndexes = useMemo(
    () =>
      previewReviewSignals
        .map((signal, index) =>
          signal.commentCount > 0 || signal.cardCount > 0 || signal.suggestionCount > 0 ? index : null,
        )
        .filter((index): index is number => index !== null),
    [previewReviewSignals],
  );
  const primaryTabs: EditorTab[] = ["edit", "review"];
  const secondaryTabs: EditorTab[] = ["heatmap", "print-preview", "history"];
  const isSecondaryTabActive = secondaryTabs.includes(currentTab);
  const editableLines = markdownSource.split("\n");
  const slashMenuItems = [
    {
      id: "h1",
      label: "Heading 1",
      matches: ["", "h1", "heading", "title"],
      onSelect: () => replaceSlashLine("# __TEXT__", "Section title"),
    },
    {
      id: "h2",
      label: "Heading 2",
      matches: ["h2", "subheading", "subtitle"],
      onSelect: () => replaceSlashLine("## __TEXT__", "Subsection"),
    },
    {
      id: "bullet",
      label: "Bullet list",
      matches: ["bullet", "list", "ul"],
      onSelect: () => replaceSlashLine("- __TEXT__", "Bullet point"),
    },
    {
      id: "quote",
      label: "Quote / callout",
      matches: ["quote", "callout"],
      onSelect: () => replaceSlashLine("> __TEXT__", "Callout"),
    },
    {
      id: "comment",
      label: "Comment on selection",
      matches: ["comment", "note"],
      onSelect: () => {
        openInlineComposer("comment");
        setSlashCommand(null);
      },
    },
    {
      id: "question",
      label: "Question suggestion",
      matches: ["question", "prompt"],
      onSelect: () => {
        void runInlineQuestionSuggestions();
        setSlashCommand(null);
      },
    },
    {
      id: "rewrite",
      label: "Rewrite suggestion",
      matches: ["rewrite", "improve"],
      onSelect: () => {
        void runInlineRewriteSuggestions();
        setSlashCommand(null);
      },
    },
  ].filter((item) =>
    slashCommand
      ? item.matches.some((token) => token.includes(slashCommand.query) || slashCommand.query.includes(token))
      : false,
  );

  function updateTab(nextTab: EditorTab) {
    const next = new URLSearchParams(searchParams);
    next.set("tab", nextTab);
    setSearchParams(next);
  }

  function focusReviewHotspot(direction: "next" | "previous") {
    if (reviewHotspotLineIndexes.length === 0) {
      return;
    }

    if (focusedReviewLineIndex === null) {
      setFocusedReviewLineIndex(
        direction === "next"
          ? reviewHotspotLineIndexes[0]
          : reviewHotspotLineIndexes[reviewHotspotLineIndexes.length - 1],
      );
      return;
    }

    const currentIndex = reviewHotspotLineIndexes.findIndex((lineIndex) => lineIndex === focusedReviewLineIndex);

    if (currentIndex < 0) {
      setFocusedReviewLineIndex(reviewHotspotLineIndexes[0]);
      return;
    }

    const nextIndex =
      direction === "next"
        ? Math.min(reviewHotspotLineIndexes.length - 1, currentIndex + 1)
        : Math.max(0, currentIndex - 1);

    setFocusedReviewLineIndex(reviewHotspotLineIndexes[nextIndex]);
  }

  useEffect(() => {
    if (currentTab !== "edit") {
      setEditorToolbarPosition(null);
      setEditorPopoverPosition(null);
      return;
    }

    const container = editorSurfaceBodyRef.current;

    if (!container) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const maxLeft = Math.max(16, containerRect.width - 280);

    const getRangeRect = () => {
      const selection = window.getSelection();

      if (!selection || selection.rangeCount === 0 || !selectedMarkdownRange?.text) {
        return null;
      }

      const range = selection.getRangeAt(0);

      if (!container.contains(range.commonAncestorContainer)) {
        return null;
      }

      return range.getBoundingClientRect();
    };
    const getLineRect = () => {
      if (currentCursorLineIndex === null) {
        return null;
      }

      return documentEditorLineRefs.current[currentCursorLineIndex]?.getBoundingClientRect() ?? null;
    };
    const selectionRect = getRangeRect();
    const anchorRect = selectionRect ?? (inlineComposerMode ? getLineRect() : null);

    if (!anchorRect) {
      setEditorToolbarPosition(null);
      setEditorPopoverPosition(null);
      return;
    }

    const baseLeft = Math.min(
      maxLeft,
      Math.max(16, anchorRect.left - containerRect.left + anchorRect.width / 2 - 110),
    );
    const toolbarTop = Math.max(8, anchorRect.top - containerRect.top - 52);
    const popoverTop = anchorRect.bottom - containerRect.top + 12;

    setEditorToolbarPosition({
      top: toolbarTop,
      left: baseLeft,
    });

    if (inlineComposerMode) {
      setEditorPopoverPosition({
        top: popoverTop,
        left: Math.min(maxLeft, Math.max(16, anchorRect.left - containerRect.left)),
      });
      return;
    }

    setEditorPopoverPosition(null);
  }, [
    currentCursorLineIndex,
    currentTab,
    inlineComposerMode,
    markdownSource,
    selectedMarkdownRange,
  ]);

  useEffect(() => {
    if (!selectedMarkdownRange?.text) {
      setIsSelectionFormatOpen(false);
    }
  }, [selectedMarkdownRange]);

  function openPreviewLineMenu(lineIndex: number, target: HTMLButtonElement) {
    const container = editorSurfaceBodyRef.current;

    if (activePreviewLineIndex === lineIndex) {
      setActivePreviewLineIndex(null);
      setPreviewLineMenuPosition(null);
      return;
    }

    if (!container) {
      setActivePreviewLineIndex(lineIndex);
      setPreviewLineMenuPosition(null);
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const triggerRect = target.getBoundingClientRect();
    const menuWidth = 232;
    const nextLeft = Math.min(
      Math.max(16, containerRect.width - menuWidth - 16),
      Math.max(16, triggerRect.left - containerRect.left + triggerRect.width + 10),
    );
    const nextTop = Math.max(12, triggerRect.top - containerRect.top - 6);

    setActivePreviewLineMenuView("root");
    setCurrentCursorLineIndex(lineIndex);
    setPreviewLineMenuPosition({
      left: nextLeft,
      top: nextTop,
    });
    setActivePreviewLineIndex(lineIndex);
  }

  function syncAnchorsForLineText(lineText: string) {
    const normalizedLineText = normalizePreviewLineText(lineText).toLowerCase();

    if (!normalizedLineText) {
      return;
    }

    const matchedBlock = blocks.find((block) => block.text.toLowerCase().includes(normalizedLineText));
    const matchedNode = richNodes.find((node) => (node.text ?? "").toLowerCase().includes(normalizedLineText));

    if (matchedBlock) {
      setSelectedBlockId(matchedBlock.blockId);
    }

    if (matchedNode?.nodeId) {
      setSelectedNodeId(matchedNode.nodeId);
    }
  }

  function handleEditableLineInput(lineIndex: number, nextContent: string) {
    const currentLines = markdownSource.split("\n");
    const currentLine = currentLines[lineIndex] ?? "";
    const descriptor = describeMarkdownLine(currentLine);
    const nextLine = rebuildMarkdownLine(descriptor, nextContent);
    const nextLines = [...currentLines];
    nextLines[lineIndex] = nextLine;
    const nextMarkdownSource = nextLines.join("\n");
    const lineStart = getMarkdownLineStartOffset(nextMarkdownSource, lineIndex);

    setMarkdownSource(nextMarkdownSource);
    setCurrentCursorLineIndex(lineIndex);
    syncAnchorsForLineText(nextLine);

    if (nextContent.trim().startsWith("/")) {
      setSlashCommand({
        query: nextContent.trim().slice(1).trim().toLowerCase(),
        lineStart,
        lineEnd: lineStart + nextLine.length,
      });
      return;
    }

    setSlashCommand(null);
  }

  function handleEditableLineSelection(lineIndex: number, lineText: string, element: HTMLDivElement) {
    const lineDescriptor = describeMarkdownLine(lineText);
    const lineStart = getMarkdownLineStartOffset(markdownSource, lineIndex) + lineDescriptor.prefix.length;
    const selection = window.getSelection();

    setCurrentCursorLineIndex(lineIndex);
    syncAnchorsForLineText(lineText);

    if (!selection || selection.rangeCount === 0) {
      setSelectedMarkdownRange(null);
      return;
    }

    const range = selection.getRangeAt(0);

    if (!element.contains(range.startContainer) || !element.contains(range.endContainer)) {
      setSelectedMarkdownRange(null);
      return;
    }

    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(element);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const localStartOffset = preSelectionRange.toString().length;
    const selectedText = range.toString().trim();

    if (!selectedText) {
      setSelectedMarkdownRange(null);
      return;
    }

    const startOffset = lineStart + localStartOffset;
    const endOffset = startOffset + selectedText.length;

    setSelectedMarkdownRange({
      startOffset,
      endOffset,
      text: selectedText,
    });
    setActiveSidePanel("comments");
    setIsContextPanelOpen(true);
  }

  function replaceSlashLine(snippet: string, fallbackLabel: string) {
    const currentValue = markdownSource;

    if (!slashCommand) {
      insertMarkdownSnippet(snippet, fallbackLabel);
      return;
    }

    const rawSelectedText = currentValue.slice(slashCommand.lineStart, slashCommand.lineEnd).trim();
    const selectedText =
      !rawSelectedText || rawSelectedText === "/" ? fallbackLabel : rawSelectedText.replace(/^\//, "").trim();
    const resolvedSnippet = snippet.replace("__TEXT__", selectedText);
    const nextValue =
      currentValue.slice(0, slashCommand.lineStart) +
      resolvedSnippet +
      currentValue.slice(slashCommand.lineEnd);

    setMarkdownSource(nextValue);
    setSlashCommand(null);
  }

  function insertMarkdownSnippet(snippet: string, fallbackLabel: string) {
    const currentValue = markdownSource;
    const selectionStart = selectedMarkdownRange?.startOffset ?? currentValue.length;
    const selectionEnd = selectedMarkdownRange?.endOffset ?? currentValue.length;
    const rawSelectedText = currentValue.slice(selectionStart, selectionEnd).trim();
    const selectedText = !rawSelectedText || rawSelectedText === "/" ? fallbackLabel : rawSelectedText;
    const resolvedSnippet = snippet.replace("__TEXT__", selectedText);
    const nextValue =
      currentValue.slice(0, selectionStart) + resolvedSnippet + currentValue.slice(selectionEnd);

    setMarkdownSource(nextValue);
  }

  function updateMarkdownSelection(replacement: string) {
    if (!selectedMarkdownRange) {
      return;
    }

    const nextMarkdownSource =
      markdownSource.slice(0, selectedMarkdownRange.startOffset) +
      replacement +
      markdownSource.slice(selectedMarkdownRange.endOffset);

    setMarkdownSource(nextMarkdownSource);
    setSelectedMarkdownRange({
      startOffset: selectedMarkdownRange.startOffset,
      endOffset: selectedMarkdownRange.startOffset + replacement.length,
      text: replacement,
    });
  }

  function applySelectionFormat(action: SelectionFormatAction) {
    if (!selectedMarkdownRange?.text) {
      return;
    }

    const selectedText = selectedMarkdownRange.text;

    if (action === "bold") {
      updateMarkdownSelection(`**${selectedText}**`);
      setIsSelectionFormatOpen(false);
      return;
    }

    if (action === "italic") {
      updateMarkdownSelection(`*${selectedText}*`);
      setIsSelectionFormatOpen(false);
      return;
    }

    if (action === "code") {
      updateMarkdownSelection(`\`${selectedText}\``);
      setIsSelectionFormatOpen(false);
      return;
    }

    const lines = markdownSource.split("\n");
    const startLineIndex = getLineIndexForOffset(markdownSource, selectedMarkdownRange.startOffset);
    const endLineIndex = getLineIndexForOffset(
      markdownSource,
      Math.max(selectedMarkdownRange.startOffset, selectedMarkdownRange.endOffset - 1),
    );

    for (let lineIndex = startLineIndex; lineIndex <= endLineIndex; lineIndex += 1) {
      const line = lines[lineIndex] ?? "";
      const normalizedLineText = normalizePreviewLineText(line) || "New line";

      if (action === "heading1") {
        lines[lineIndex] = `# ${normalizedLineText}`;
      } else if (action === "heading2") {
        lines[lineIndex] = `## ${normalizedLineText}`;
      } else if (action === "bullet") {
        lines[lineIndex] = `- ${normalizedLineText}`;
      } else if (action === "quote") {
        lines[lineIndex] = `> ${normalizedLineText}`;
      }
    }

    setMarkdownSource(lines.join("\n"));
    setIsSelectionFormatOpen(false);
  }

  function focusLineInEditor(lineIndex: number) {
    const targetLine = documentEditorLineRefs.current[lineIndex];

    if (!targetLine) {
      return;
    }

    window.requestAnimationFrame(() => {
      targetLine.focus();
      targetLine.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  async function runInlineQuestionSuggestions(
    selectionOverride?: { startOffset: number; endOffset: number; selectedText: string } | null,
  ) {
    const effectiveSelection = selectionOverride?.selectedText
      ? {
          ...currentSelectionAnchor,
          selectionStartOffset: selectionOverride.startOffset,
          selectionEndOffset: selectionOverride.endOffset,
          selectedText: selectionOverride.selectedText,
          anchorQuote: selectionOverride.selectedText,
        }
      : currentSelectionAnchor;
    const effectiveFieldPath = effectiveSelection?.fieldPath ?? selectedBlock?.fieldPath ?? null;
    const effectiveText = selectionOverride?.selectedText ?? effectiveSelectedText;

    if (!selectedBlock && !effectiveSelection) {
      return;
    }

    setInlineSuggestionPreview("question");
    await questionSuggestionsMutation.mutateAsync({
      blockId: selectedBlock?.blockId ?? null,
      selectionAnchor: effectiveSelection,
      fieldPath: effectiveFieldPath,
      selectedText: effectiveText,
      maxSuggestions: Number(questionSuggestionMax) || 3,
    });
  }

  async function runInlineRewriteSuggestions(
    selectionOverride?: { startOffset: number; endOffset: number; selectedText: string } | null,
  ) {
    const effectiveSelection = selectionOverride?.selectedText
      ? {
          ...currentSelectionAnchor,
          selectionStartOffset: selectionOverride.startOffset,
          selectionEndOffset: selectionOverride.endOffset,
          selectedText: selectionOverride.selectedText,
          anchorQuote: selectionOverride.selectedText,
        }
      : currentSelectionAnchor;
    const effectiveFieldPath = effectiveSelection?.fieldPath ?? selectedBlock?.fieldPath ?? null;
    const effectiveText = selectionOverride?.selectedText ?? effectiveSelectedText;

    if (!selectedBlock && !effectiveSelection) {
      return;
    }

    setInlineSuggestionPreview("rewrite");
    await rewriteSuggestionsMutation.mutateAsync({
      blockId: selectedBlock?.blockId ?? null,
      selectionAnchor: effectiveSelection,
      fieldPath: effectiveFieldPath,
      selectedText: effectiveText,
    });
  }

  function openInlineComposer(
    mode: InlineComposerMode,
    selectionOverride?: { startOffset: number; endOffset: number; selectedText: string } | null,
  ) {
    if (selectionOverride?.selectedText) {
      setSelectedMarkdownRange({
        startOffset: selectionOverride.startOffset,
        endOffset: selectionOverride.endOffset,
        text: selectionOverride.selectedText,
      });
    }

    setInlineSuggestionPreview(null);
    setInlineComposerMode(mode);

    if (mode === "comment") {
      setInlineCommentBody("");
      return;
    }

    setInlineCardTitle("");
    setInlineCardText(selectionOverride?.selectedText ?? effectiveSelectedText ?? "");
  }

  async function submitInlineComment() {
    if ((!selectedBlock && !currentSelectionAnchor) || !inlineCommentBody.trim()) {
      return;
    }

    await createCommentMutation.mutateAsync({
      blockId: selectedBlock?.blockId ?? null,
      selectionAnchor: currentSelectionAnchor,
      fieldPath: currentSelectionAnchor?.fieldPath ?? selectedBlock?.fieldPath ?? null,
      selectionStartOffset: null,
      selectionEndOffset: null,
      selectedText: effectiveSelectedText,
      body: inlineCommentBody,
    });
    setInlineCommentBody("");
    setInlineComposerMode(null);
  }

  async function submitInlineQuestionCard() {
    if ((!selectedBlock && !currentSelectionAnchor) || !inlineCardText.trim()) {
      return;
    }

    await createQuestionCardMutation.mutateAsync({
      blockId: selectedBlock?.blockId ?? null,
      selectionAnchor: currentSelectionAnchor,
      fieldPath: currentSelectionAnchor?.fieldPath ?? selectedBlock?.fieldPath ?? null,
      selectionStartOffset: null,
      selectionEndOffset: null,
      selectedText: effectiveSelectedText,
      title: inlineCardTitle || null,
      questionText: inlineCardText,
      questionType: newQuestionCardType,
      linkedQuestionId: null,
      followUpSuggestions: [],
    });
    setInlineCardTitle("");
    setInlineCardText("");
    setInlineComposerMode(null);
  }

  function normalizePreviewLineText(lineText: string) {
    return lineText.replace(/^#{1,3}\s+/, "").replace(/^[-*]\s+/, "").replace(/^>\s+/, "").trim();
  }

  function updateMarkdownLine(lineIndex: number, nextLine: string) {
    const nextLines = markdownSource.split("\n");
    nextLines[lineIndex] = nextLine;
    setMarkdownSource(nextLines.join("\n"));
  }

  function duplicateMarkdownLine(lineIndex: number) {
    const nextLines = markdownSource.split("\n");
    const duplicatedLine = nextLines[lineIndex] ?? "";
    nextLines.splice(lineIndex + 1, 0, duplicatedLine);
    setMarkdownSource(nextLines.join("\n"));
  }

  function insertMarkdownLineAfter(lineIndex: number, nextLine = "") {
    const nextLines = markdownSource.split("\n");
    nextLines.splice(lineIndex + 1, 0, nextLine);
    setMarkdownSource(nextLines.join("\n"));
    setCurrentCursorLineIndex(lineIndex + 1);

    window.requestAnimationFrame(() => {
      focusLineInEditor(lineIndex + 1);
    });
  }

  function removeMarkdownLine(lineIndex: number, direction: "previous" | "next") {
    const nextLines = markdownSource.split("\n");

    if (nextLines.length <= 1) {
      return;
    }

    nextLines.splice(lineIndex, 1);
    const nextFocusIndex =
      direction === "previous"
        ? Math.max(0, lineIndex - 1)
        : Math.min(nextLines.length - 1, lineIndex);

    setMarkdownSource(nextLines.join("\n"));
    setCurrentCursorLineIndex(nextFocusIndex);
    setSelectedMarkdownRange(null);
    setInlineComposerMode(null);
    setInlineSuggestionPreview(null);
    setActivePreviewLineIndex(null);
    setPreviewLineMenuPosition(null);

    window.requestAnimationFrame(() => {
      focusLineInEditor(nextFocusIndex);
    });
  }

  function handleEditableLineKeyDown(lineIndex: number, event: ReactKeyboardEvent<HTMLDivElement>) {
    if (
      (event.key === "Backspace" || event.key === "Delete") &&
      !(event.currentTarget.innerText ?? "").trim()
    ) {
      event.preventDefault();
      removeMarkdownLine(lineIndex, event.key === "Backspace" ? "previous" : "next");
      return;
    }

    if (event.key !== "Enter") {
      return;
    }

    if (event.shiftKey) {
      event.preventDefault();

      const selection = window.getSelection();

      if (!selection || selection.rangeCount === 0) {
        return;
      }

      const range = selection.getRangeAt(0);
      range.deleteContents();
      const lineBreak = document.createElement("br");
      range.insertNode(lineBreak);
      range.setStartAfter(lineBreak);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      handleEditableLineInput(lineIndex, event.currentTarget.innerText ?? "");
      return;
    }

    event.preventDefault();
    insertMarkdownLineAfter(lineIndex);
  }

  function handleEditorSurfaceMouseDown(event: ReactMouseEvent<HTMLDivElement>) {
    if (event.button !== 0) {
      return;
    }

    const target = event.target as HTMLElement | null;

    if (!target) {
      return;
    }

    if (
      target.closest(".resume-editor-context-toolbar") ||
      target.closest(".resume-editor-inline-composer") ||
      target.closest(".resume-editor-document-preview__menu-popover") ||
      target.closest(".resume-editor-slash-menu") ||
      target.closest(".resume-editor-document-preview__grip")
    ) {
      return;
    }

    setCurrentCursorLineIndex(null);
    setSelectedMarkdownRange(null);
    setInlineSuggestionPreview(null);
    setInlineComposerMode(null);
    setActivePreviewLineIndex(null);
    setPreviewLineMenuPosition(null);
    setSlashCommand(null);
  }

  function handlePreviewLineAction(action: string, lineIndex: number, lineText: string) {
    const normalizedLineText = normalizePreviewLineText(lineText) || "New line";
    const nextSelectionRange = getSelectableLineRange(markdownSource, lineIndex);

    switch (action) {
      case "heading1":
        updateMarkdownLine(lineIndex, `# ${normalizedLineText}`);
        break;
      case "heading2":
        updateMarkdownLine(lineIndex, `## ${normalizedLineText}`);
        break;
      case "bullet":
        updateMarkdownLine(lineIndex, `- ${normalizedLineText}`);
        break;
      case "quote":
        updateMarkdownLine(lineIndex, `> ${normalizedLineText}`);
        break;
      case "duplicate":
        duplicateMarkdownLine(lineIndex);
        break;
      case "comment":
        openInlineComposer("comment", nextSelectionRange.selectedText ? nextSelectionRange : null);
        break;
      case "card":
        openInlineComposer("card", nextSelectionRange.selectedText ? nextSelectionRange : null);
        break;
      case "rewrite":
        if (nextSelectionRange.selectedText) {
          setSelectedMarkdownRange(nextSelectionRange);
          void runInlineRewriteSuggestions(nextSelectionRange);
        }
        break;
      case "tools":
        if (nextSelectionRange.selectedText) {
          setSelectedMarkdownRange(nextSelectionRange);
        }
        setActiveSidePanel("comments");
        setIsContextPanelOpen(true);
        break;
      default:
        break;
    }

    setActivePreviewLineMenuView("root");
    setActivePreviewLineIndex(null);
    setPreviewLineMenuPosition(null);
  }

  function renderLineMenu(lineIndex: number, lineText: string) {
    if (activePreviewLineMenuView === "turn-into") {
      return (
        <div className="resume-editor-document-preview__menu-list">
          <button
            className="resume-editor-document-preview__menu-item"
            onClick={() => setActivePreviewLineMenuView("root")}
            type="button"
          >
            ← Back
          </button>
          <button
            className="resume-editor-document-preview__menu-item"
            onClick={() => handlePreviewLineAction("heading1", lineIndex, lineText)}
            type="button"
          >
            Heading 1
          </button>
          <button
            className="resume-editor-document-preview__menu-item"
            onClick={() => handlePreviewLineAction("heading2", lineIndex, lineText)}
            type="button"
          >
            Heading 2
          </button>
          <button
            className="resume-editor-document-preview__menu-item"
            onClick={() => handlePreviewLineAction("bullet", lineIndex, lineText)}
            type="button"
          >
            Bulleted list
          </button>
          <button
            className="resume-editor-document-preview__menu-item"
            onClick={() => handlePreviewLineAction("quote", lineIndex, lineText)}
            type="button"
          >
            Quote
          </button>
        </div>
      );
    }

    return (
      <div className="resume-editor-document-preview__menu-list">
        <button
          className="resume-editor-document-preview__menu-item"
          onClick={() => setActivePreviewLineMenuView("turn-into")}
          type="button"
        >
          Turn into →
        </button>
        <button
          className="resume-editor-document-preview__menu-item"
          onClick={() => handlePreviewLineAction("duplicate", lineIndex, lineText)}
          type="button"
        >
          Duplicate
        </button>
        <button
          className="resume-editor-document-preview__menu-item"
          onClick={() => handlePreviewLineAction("comment", lineIndex, lineText)}
          type="button"
        >
          Comment
        </button>
        <button
          className="resume-editor-document-preview__menu-item"
          onClick={() => handlePreviewLineAction("card", lineIndex, lineText)}
          type="button"
        >
          Create card
        </button>
        <button
          className="resume-editor-document-preview__menu-item"
          onClick={() => handlePreviewLineAction("rewrite", lineIndex, lineText)}
          type="button"
        >
          Suggest rewrite
        </button>
        <button
          className="resume-editor-document-preview__menu-item"
          onClick={() => handlePreviewLineAction("tools", lineIndex, lineText)}
          type="button"
        >
          Open tools
        </button>
      </div>
    );
  }

  function renderFloatingLineMenu() {
    if (activePreviewLineIndex === null || !previewLineMenuPosition) {
      return null;
    }

    const lineText = markdownSource.split("\n")[activePreviewLineIndex] ?? "";

    return (
      <div
        className="resume-editor-document-preview__menu-popover"
        style={{
          left: `${previewLineMenuPosition.left}px`,
          top: `${previewLineMenuPosition.top}px`,
        }}
      >
        {renderLineMenu(activePreviewLineIndex, lineText)}
      </div>
    );
  }

  function resolveConflictBlock(blockId: string, source: "current" | "proposed" | "merged") {
    const mergePreview = mergePreviewMutation.data;

    if (!mergePreview) {
      return;
    }

    const conflict = mergePreview.conflicts.find((item) => item.blockId === blockId);

    if (!conflict) {
      return;
    }

    const nextText =
      source === "current"
        ? conflict.currentText ?? ""
        : source === "proposed"
          ? conflict.proposedText ?? ""
          : mergePreview.mergedDocument.blocks.find((block) => block.blockId === blockId)?.textValue ?? "";

    setBlocks((current) =>
      current.map((block) =>
        block.blockId === blockId
          ? {
              ...block,
              text: nextText,
              lines: splitLines(nextText),
            }
          : block,
      ),
    );
    setSelectedBlockId(blockId);
  }

  async function saveBlocks(nextBlocks: EditableBlock[], changeSource: string) {
    if (!workspaceQuery.data) {
      return;
    }

    try {
      await updateDocumentMutation.mutateAsync({
        blocks: nextBlocks.map((block) => ({
          blockId: block.blockId,
          blockType: block.blockType,
          title: block.title || null,
          text: block.text || null,
          lines: splitLines(block.text),
          sourceAnchorType: block.sourceAnchorType,
          sourceAnchorRecordId: block.sourceAnchorRecordId,
          sourceAnchorKey: block.sourceAnchorKey,
          fieldPath: block.fieldPath,
          displayOrder: block.displayOrder,
          metadata: block.metadata,
          inlineMarks: block.inlineMarks.map((mark) => ({
            markType: mark.markType,
            startOffset: mark.startOffset,
            endOffset: mark.endOffset,
            text: mark.text,
            href: mark.href,
          })),
        })),
        rootNodeId: workspaceQuery.data.document.rootNodeId,
        nodes: mapRichNodeRequest(workspaceQuery.data.document.nodes),
        tableOfContents: workspaceQuery.data.document.tableOfContents.map((item) => ({
          nodeId: item.nodeId,
          title: item.title,
          depth: item.depth,
          fieldPath: item.fieldPath,
        })),
        markdownSource,
        layoutMetadata,
        baseRevisionNo: workspaceQuery.data.revisionNo,
        changeSource,
      });
      setSaveMessage("Draft workspace saved.");
      setMergePreviewMessage(null);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 409) {
        await workspaceQuery.refetch();
        const mergePreview = await mergePreviewMutation.mutateAsync({
          blocks: nextBlocks.map((block) => ({
            blockId: block.blockId,
            blockType: block.blockType,
            title: block.title || null,
            text: block.text || null,
            lines: splitLines(block.text),
            sourceAnchorType: block.sourceAnchorType,
            sourceAnchorRecordId: block.sourceAnchorRecordId,
            sourceAnchorKey: block.sourceAnchorKey,
            fieldPath: block.fieldPath,
            displayOrder: block.displayOrder,
            metadata: block.metadata,
            inlineMarks: block.inlineMarks.map((mark) => ({
              markType: mark.markType,
              startOffset: mark.startOffset,
              endOffset: mark.endOffset,
              text: mark.text,
              href: mark.href,
            })),
          })),
          rootNodeId: workspaceQuery.data.document.rootNodeId,
          nodes: mapRichNodeRequest(workspaceQuery.data.document.nodes),
          tableOfContents: workspaceQuery.data.document.tableOfContents.map((item) => ({
            nodeId: item.nodeId,
            title: item.title,
            depth: item.depth,
            fieldPath: item.fieldPath,
          })),
          markdownSource,
          layoutMetadata,
          baseRevisionNo: workspaceQuery.data.revisionNo,
        });

        setMergePreviewMessage(
          mergePreview.mergeStatus === "clean"
            ? "The server prepared a clean merged draft. Review it below and save again."
            : "The server detected merge conflicts. Review the conflicting blocks before saving again.",
        );
      } else {
        throw error;
      }
    }
  }

  async function saveMarkdownDraft(nextMarkdownSource: string, changeSource: string) {
    if (!workspaceQuery.data) {
      return;
    }

    try {
      await importMarkdownMutation.mutateAsync({
        markdownSource: nextMarkdownSource,
        replaceDocument: true,
        baseRevisionNo: workspaceQuery.data.revisionNo,
        changeSource,
      });
      setSaveMessage("Draft workspace saved.");
      setMergePreviewMessage(null);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 409) {
        await workspaceQuery.refetch();
        const mergePreview = await mergePreviewMutation.mutateAsync({
          blocks: blocks.map((block) => ({
            blockId: block.blockId,
            blockType: block.blockType,
            title: block.title || null,
            text: block.text || null,
            lines: splitLines(block.text),
            sourceAnchorType: block.sourceAnchorType,
            sourceAnchorRecordId: block.sourceAnchorRecordId,
            sourceAnchorKey: block.sourceAnchorKey,
            fieldPath: block.fieldPath,
            displayOrder: block.displayOrder,
            metadata: block.metadata,
            inlineMarks: block.inlineMarks.map((mark) => ({
              markType: mark.markType,
              startOffset: mark.startOffset,
              endOffset: mark.endOffset,
              text: mark.text,
              href: mark.href,
            })),
          })),
          rootNodeId: workspaceQuery.data.document.rootNodeId,
          nodes: mapRichNodeRequest(workspaceQuery.data.document.nodes),
          tableOfContents: workspaceQuery.data.document.tableOfContents.map((item) => ({
            nodeId: item.nodeId,
            title: item.title,
            depth: item.depth,
            fieldPath: item.fieldPath,
          })),
          markdownSource: nextMarkdownSource,
          layoutMetadata,
          baseRevisionNo: workspaceQuery.data.revisionNo,
        });

        setMergePreviewMessage(
          mergePreview.mergeStatus === "clean"
            ? "The server prepared a clean merged draft. Review it below and save again."
            : "The server detected merge conflicts. Review the conflicting blocks before saving again.",
        );
      } else {
        throw error;
      }
    }
  }

  async function patchDocumentOperations(
    operations: Array<{
      operationType: string;
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
    }>,
    changeSource: string,
  ) {
    if (!workspaceQuery.data) {
      return;
    }

    await patchDocumentOperationsMutation.mutateAsync({
      operations,
      baseRevisionNo: workspaceQuery.data.revisionNo,
      changeSource,
      clientSessionKey: sessionKey,
      clientChangeId: `${changeSource}-${Date.now().toString(36)}`,
    });
    setSaveMessage("Draft workspace saved.");
    setMergePreviewMessage(null);
  }

  async function saveCurrentDraft(changeSource: string) {
    if (workspaceQuery.data?.document.markdownSource !== markdownSource) {
      await saveMarkdownDraft(markdownSource, changeSource);
      return;
    }

    await saveBlocks(blocks, changeSource);
  }

  async function handleApplyRewrite(suggestedText: string) {
    if (
      currentSelectionAnchor?.nodeId &&
      workspaceQuery.data?.selectionCapabilities.supportsOperations &&
      currentSelectionAnchor.selectionStartOffset !== null &&
      currentSelectionAnchor.selectionEndOffset !== null &&
      currentSelectionAnchor.selectionEndOffset > currentSelectionAnchor.selectionStartOffset
    ) {
      await patchDocumentOperations(
        [
          {
            operationType: "text_replace",
            nodeId: currentSelectionAnchor.nodeId,
            startOffset: currentSelectionAnchor.selectionStartOffset,
            endOffset: currentSelectionAnchor.selectionEndOffset,
            text: suggestedText,
          },
        ],
        "rewrite_apply",
      );

      if (effectiveSelectedText && markdownSource.includes(effectiveSelectedText)) {
        setMarkdownSource(replaceFirstOccurrence(markdownSource, effectiveSelectedText, suggestedText));
      }
      return;
    }

    if (effectiveSelectedText && markdownSource.includes(effectiveSelectedText)) {
      const nextMarkdownSource = replaceFirstOccurrence(markdownSource, effectiveSelectedText, suggestedText);

      setMarkdownSource(nextMarkdownSource);
      await saveMarkdownDraft(nextMarkdownSource, "rewrite_apply");
      return;
    }

    if (!selectedBlock) {
      return;
    }

    const nextBlocks = blocks.map((block) =>
      block.blockId === selectedBlock.blockId
        ? {
            ...block,
            text: suggestedText,
            lines: splitLines(suggestedText),
          }
        : block,
    );

    setBlocks(nextBlocks);
    await saveBlocks(nextBlocks, "rewrite_apply");
  }

  function renderContextPanelContent() {
    const workspace = workspaceQuery.data;

    if (!workspace) {
      return null;
    }

    switch (activeSidePanel) {
      case "source":
        return (
          <section className="page-card">
            <span className="page-card__label">Source context</span>
            <h2 className="page-card__title">Immutable source resume context</h2>
            <div className="stack-list">
              {sourceContextCards.map((card) => (
                <article className="page-card page-card--muted" key={card.title}>
                  <p className="section-heading__eyebrow">{card.title}</p>
                  <p className="page-card__body resume-section__body--preserve">{card.body}</p>
                </article>
              ))}
            </div>
          </section>
        );
      case "presence":
        return (
          <section className="page-card">
            <span className="page-card__label">Presence</span>
            <h2 className="page-card__title">Workspace presence</h2>
            <div className="filter-chip-row">
              {workspace.activePresence.length > 0 ? (
                workspace.activePresence.map((presence) => (
                  <span className="detail-chip" key={presence.sessionKey}>
                    {presence.userLabel}
                    {presence.viewMode ? ` · ${presence.viewMode}` : ""}
                    {presence.selectedBlockId ? ` · ${presence.selectedBlockId}` : ""}
                  </span>
                ))
              ) : (
                <span className="detail-chip">No active presence yet</span>
              )}
            </div>
          </section>
        );
      case "question-cards":
        return (
          <section className="page-card">
            <span className="page-card__label">Question cards</span>
            <h2 className="page-card__title">Interview and study prompts</h2>
            <label className="form-field">
              <span className="form-field__label">Title</span>
              <input
                className="form-field__input"
                onChange={(event) => setNewQuestionCardTitle(event.target.value)}
                value={newQuestionCardTitle}
              />
            </label>
            <label className="form-field">
              <span className="form-field__label">Question text</span>
              <textarea
                className="form-field__input form-input--textarea"
                onChange={(event) => setNewQuestionCardText(event.target.value)}
                rows={4}
                value={newQuestionCardText}
              />
            </label>
            <label className="form-field">
              <span className="form-field__label">Question type</span>
              <input
                className="form-field__input"
                onChange={(event) => setNewQuestionCardType(event.target.value)}
                value={newQuestionCardType}
              />
            </label>
            <div className="page-card__actions">
              <button
                className="primary-button"
                disabled={(!selectedBlock && !currentSelectionAnchor) || !newQuestionCardText.trim()}
                onClick={() => {
                  if (!selectedBlock && !currentSelectionAnchor) {
                    return;
                  }

                  void createQuestionCardMutation.mutateAsync({
                    blockId: selectedBlock?.blockId ?? null,
                    selectionAnchor: currentSelectionAnchor,
                    fieldPath: currentSelectionAnchor?.fieldPath ?? selectedBlock?.fieldPath ?? null,
                    selectionStartOffset: null,
                    selectionEndOffset: null,
                    selectedText: effectiveSelectedText,
                    title: newQuestionCardTitle || null,
                    questionText: newQuestionCardText,
                    questionType: newQuestionCardType,
                    linkedQuestionId: null,
                    followUpSuggestions: [],
                  });
                  setNewQuestionCardTitle("");
                  setNewQuestionCardText("");
                }}
                type="button"
              >
                Create question card
              </button>
            </div>
            <div className="stack-list">
              {workspace.questionCards.length === 0 ? (
                <EmptyStateCard body="No question cards yet." title="No question cards" />
              ) : (
                workspace.questionCards.map((card) => (
                  <article className="page-card page-card--muted" key={card.id}>
                    <div className="section-heading">
                      <div>
                        <p className="section-heading__eyebrow">{card.questionTypeLabel}</p>
                        <h3 className="page-card__title">{card.title}</h3>
                      </div>
                      <span className="question-status-badge question-status-badge--neutral">
                        {card.statusLabel}
                      </span>
                    </div>
                    <p className="page-card__body resume-section__body--preserve">{card.questionText}</p>
                    {card.followUpSuggestions.length > 0 ? (
                      <div className="filter-chip-row">
                        {card.followUpSuggestions.map((item) => (
                          <span className="detail-chip" key={`${card.id}-${item}`}>
                            {item}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <div className="page-card__actions">
                      <button
                        className="secondary-button"
                        onClick={() => {
                          void updateQuestionCardMutation.mutateAsync({
                            cardId: card.id,
                            payload: {
                              status: card.status === "archived" ? "active" : "archived",
                            },
                          });
                        }}
                        type="button"
                      >
                        {card.status === "archived" ? "Restore" : "Archive"}
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        );
      case "suggestions":
        return selectedBlock || currentSelectionAnchor ? (
          <section className="page-card">
            <span className="page-card__label">Suggestions</span>
            <h2 className="page-card__title">Question and rewrite suggestions</h2>
            <label className="form-field">
              <span className="form-field__label">Max question suggestions</span>
              <input
                className="form-field__input"
                onChange={(event) => setQuestionSuggestionMax(event.target.value)}
                type="number"
                value={questionSuggestionMax}
              />
            </label>
            <div className="page-card__actions">
              <button
                className="secondary-button"
                onClick={() => {
                  void questionSuggestionsMutation.mutateAsync({
                    blockId: selectedBlock?.blockId ?? null,
                    selectionAnchor: currentSelectionAnchor,
                    fieldPath: currentSelectionAnchor?.fieldPath ?? selectedBlock?.fieldPath ?? null,
                    selectedText: effectiveSelectedText,
                    maxSuggestions: Number(questionSuggestionMax) || 3,
                  });
                }}
                type="button"
              >
                Generate question suggestions
              </button>
              <button
                className="secondary-button"
                onClick={() => {
                  void rewriteSuggestionsMutation.mutateAsync({
                    blockId: selectedBlock?.blockId ?? null,
                    selectionAnchor: currentSelectionAnchor,
                    fieldPath: currentSelectionAnchor?.fieldPath ?? selectedBlock?.fieldPath ?? null,
                    selectedText: effectiveSelectedText,
                  });
                }}
                type="button"
              >
                Generate rewrite suggestions
              </button>
            </div>
            {questionSuggestionsMutation.data ? (
              <div className="stack-list">
                {questionSuggestionsMutation.data.suggestions.map((suggestion) => (
                  <article className="page-card page-card--muted" key={suggestion.id}>
                    <p className="section-heading__eyebrow">{suggestion.questionTypeLabel}</p>
                    <h3 className="page-card__title">{suggestion.title}</h3>
                    <p className="page-card__body resume-section__body--preserve">{suggestion.questionText}</p>
                    <p className="resume-tailor-muted">{suggestion.rationale}</p>
                    <div className="page-card__actions">
                      <button
                        className="secondary-button"
                        onClick={() => {
                          void createQuestionCardMutation.mutateAsync({
                            blockId: selectedBlock?.blockId ?? null,
                            selectionAnchor:
                              questionSuggestionsMutation.data?.selectionAnchor ?? currentSelectionAnchor,
                            fieldPath:
                              questionSuggestionsMutation.data?.selectionAnchor?.fieldPath ??
                              currentSelectionAnchor?.fieldPath ??
                              selectedBlock?.fieldPath ??
                              null,
                            selectedText: questionSuggestionsMutation.data?.selectedText || null,
                            title: suggestion.title,
                            questionText: suggestion.questionText,
                            questionType: suggestion.questionType,
                            linkedQuestionId: null,
                            followUpSuggestions: suggestion.followUpSuggestions,
                          });
                        }}
                        type="button"
                      >
                        Create question card from suggestion
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
            {rewriteSuggestionsMutation.data ? (
              <div className="stack-list">
                {rewriteSuggestionsMutation.data.suggestions.map((suggestion) => (
                  <article className="page-card page-card--muted" key={suggestion.id}>
                    <p className="section-heading__eyebrow">{suggestion.focusArea ?? "Rewrite suggestion"}</p>
                    <p className="page-card__body resume-section__body--preserve">{suggestion.suggestedText}</p>
                    <p className="resume-tailor-muted">{suggestion.rationale}</p>
                    <div className="page-card__actions">
                      <button
                        className="secondary-button"
                        onClick={() => {
                          void handleApplyRewrite(suggestion.suggestedText);
                        }}
                        type="button"
                      >
                        Apply rewrite to draft
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </section>
        ) : (
          <EmptyStateCard
            body="Select a block or sentence first to generate question and rewrite suggestions."
            title="No active selection"
          />
        );
      case "comments":
      default:
        return (
          <section className="page-card">
            <span className="page-card__label">Comments</span>
            <h2 className="page-card__title">Comment threads</h2>
            <label className="form-field">
              <span className="form-field__label">New comment</span>
              <textarea
                className="form-field__input form-input--textarea"
                onChange={(event) => setNewCommentBody(event.target.value)}
                rows={4}
                value={newCommentBody}
              />
            </label>
            <div className="page-card__actions">
              <button
                className="primary-button"
                disabled={
                  (!selectedBlock && !currentSelectionAnchor) ||
                  createCommentMutation.isPending ||
                  !newCommentBody.trim()
                }
                onClick={() => {
                  if (!selectedBlock && !currentSelectionAnchor) {
                    return;
                  }

                  void createCommentMutation.mutateAsync({
                    blockId: selectedBlock?.blockId ?? null,
                    selectionAnchor: currentSelectionAnchor,
                    fieldPath: currentSelectionAnchor?.fieldPath ?? selectedBlock?.fieldPath ?? null,
                    selectionStartOffset: null,
                    selectionEndOffset: null,
                    selectedText: effectiveSelectedText,
                    body: newCommentBody,
                  });
                  setNewCommentBody("");
                }}
                type="button"
              >
                Add comment
              </button>
            </div>
            <div className="stack-list">
              {workspace.comments.length === 0 ? (
                <EmptyStateCard body="No comment threads yet." title="No comments" />
              ) : (
                workspace.comments.map((comment) => (
                  <article className="page-card page-card--muted" key={comment.id}>
                    <div className="section-heading">
                      <div>
                        <p className="section-heading__eyebrow">{comment.statusLabel}</p>
                        <h3 className="page-card__title">{comment.selectedText ?? comment.blockId}</h3>
                      </div>
                      <button
                        className="secondary-button"
                        onClick={() => {
                          void updateCommentMutation.mutateAsync({
                            commentId: comment.id,
                            payload: {
                              status: comment.status === "resolved" ? "open" : "resolved",
                            },
                          });
                        }}
                        type="button"
                      >
                        {comment.status === "resolved" ? "Reopen" : "Resolve"}
                      </button>
                    </div>
                    <p className="page-card__body resume-section__body--preserve">{comment.body}</p>
                    {comment.replies.map((reply) => (
                      <div className="resume-tailor-compare-block" key={reply.id}>
                        <p className="resume-tailor-muted">{reply.createdAtLabel}</p>
                        <p className="page-card__body resume-section__body--preserve">{reply.body}</p>
                      </div>
                    ))}
                    <label className="form-field">
                      <span className="form-field__label">Reply</span>
                      <input
                        className="form-field__input"
                        onChange={(event) =>
                          setReplyDrafts((current) => ({
                            ...current,
                            [comment.id]: event.target.value,
                          }))
                        }
                        value={replyDrafts[comment.id] ?? ""}
                      />
                    </label>
                    <div className="page-card__actions">
                      <button
                        className="secondary-button"
                        disabled={!replyDrafts[comment.id]?.trim()}
                        onClick={() => {
                          void createReplyMutation.mutateAsync({
                            commentId: comment.id,
                            payload: {
                              body: replyDrafts[comment.id],
                            },
                          });
                          setReplyDrafts((current) => ({ ...current, [comment.id]: "" }));
                        }}
                        type="button"
                      >
                        Add reply
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        );
    }
  }

  if (!versionId) {
    return (
      <PageContainer description="Choose a resume version first." eyebrow="Resume Editor" title="Editor unavailable">
        <EmptyStateCard
          action={{ label: "Open resumes", to: routeConfig.resume.buildPath() }}
          body="The editor route requires a resume version id."
          title="Missing resume version"
        />
      </PageContainer>
    );
  }

  if (workspaceQuery.isLoading) {
    return (
      <PageContainer
        description="Bootstrapping the resume editor workspace from the immutable resume version."
        eyebrow="Resume Editor"
        title="Preparing workspace"
      >
        <LoadingStateCard
          body="Loading the draft workspace, annotations, and revision context."
          title="Preparing resume editor"
        />
      </PageContainer>
    );
  }

  if (workspaceQuery.isError || !workspaceQuery.data) {
    return (
      <PageContainer description="The resume editor workspace could not be loaded." eyebrow="Resume Editor" title="Workspace unavailable">
        <ErrorStateCard
          body={
            workspaceQuery.error instanceof Error
              ? workspaceQuery.error.message
              : "The resume editor workspace could not be loaded."
          }
          details={getErrorDetails(workspaceQuery.error)}
          onAction={() => {
            void workspaceQuery.refetch();
          }}
          title="Unable to load resume editor workspace"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      actions={
        <>
          <Link className="secondary-button" to={routeConfig.resume.buildPath()}>
            Back to resumes
          </Link>
          {workspaceQuery.data.heatmapAvailable ? (
            <Link className="secondary-button" to={routeConfig.resumeHeatmap.buildPath({ versionId: safeVersionId })}>
              Open heatmap
            </Link>
          ) : null}
          <button
            className="primary-button"
            disabled={updateDocumentMutation.isPending || importMarkdownMutation.isPending}
            onClick={() => {
              void saveCurrentDraft("manual_edit");
            }}
            type="button"
          >
            {updateDocumentMutation.isPending || importMarkdownMutation.isPending ? "Saving..." : "Save draft"}
          </button>
        </>
      }
      description="Author the resume source of truth, then pressure-test each claim with comments, question cards, and linked interview context."
      eyebrow="Source of truth editor"
      title={workspaceQuery.data.sourceFileName}
    >
      <div className="page-stack">
        <section className="page-card resume-editor-workspace-surface">
          <div className="resume-editor-workspace-surface__header">
            <div className="resume-editor-workspace-surface__intro">
              <div className="resume-editor-workspace-surface__eyebrow-row">
                <span className="page-card__label">Source-of-truth authoring</span>
                <span className="question-status-badge question-status-badge--accent">Draft lane</span>
              </div>
              <p className="resume-editor-workspace-surface__breadcrumbs">
                Resume claim
                <span>/</span>
                Evidence detail
                <span>/</span>
                Follow-up survivability
              </p>
              <h2 className="resume-editor-workspace-surface__title">
                Write the resume until every line can survive DFS follow-up pressure
              </h2>
              <p className="resume-editor-workspace-surface__body">
                Treat this as source-of-truth authoring, not document polishing. Each revision should make one claim
                clearer, better evidenced, or less fragile under deeper questioning.
              </p>
            </div>
            <div className="resume-editor-workspace-surface__stats">
              <article className="resume-editor-workspace-surface__stat">
                <span>Revision</span>
                <strong>{workspaceQuery.data.revisionNo}</strong>
              </article>
              <article className="resume-editor-workspace-surface__stat">
                <span>Evidence anchors</span>
                <strong>{sourceContextCards.length}</strong>
              </article>
              <article className="resume-editor-workspace-surface__stat">
                <span>Review signals</span>
                <strong>
                  {workspaceQuery.data.commentSummary.totalCount + workspaceQuery.data.questionCardSummary.totalCount}
                </strong>
              </article>
              <article className="resume-editor-workspace-surface__stat">
                <span>View modes</span>
                <strong>{workspaceQuery.data.supportedViewModes.length}</strong>
              </article>
            </div>
          </div>
          <div className="resume-editor-workspace-surface__guidance" aria-label="Resume authoring guidance">
            <article className="resume-editor-workspace-surface__guidance-card">
              <span>Claim rule</span>
              <strong>Rewrite the exact line that would fail under follow-up, not the whole document.</strong>
            </article>
            <article className="resume-editor-workspace-surface__guidance-card">
              <span>Evidence rule</span>
              <strong>Attach one concrete fact, metric, or constraint before broadening wording.</strong>
            </article>
            <article className="resume-editor-workspace-surface__guidance-card">
              <span>Exit rule</span>
              <strong>Leave this pass only when the selected claim has a defendable answer path.</strong>
            </article>
          </div>
          <div className="resume-editor-workspace-surface__chips">
            <span className="detail-chip">{workspaceQuery.data.workspaceStatusLabel}</span>
            <span className="detail-chip detail-chip--accent">
              {workspaceQuery.data.documentModel === "rich_tree" ? "Rich tree" : "Blocks"}
            </span>
            {workspaceQuery.data.selectionCapabilities.supportsOperations ? (
              <span className="detail-chip">Operations enabled</span>
            ) : null}
            {workspaceQuery.data.selectionCapabilities.supportsInlineSelections ? (
              <span className="detail-chip">Inline selections enabled</span>
            ) : null}
          </div>
        </section>

        <section className="page-card resume-editor-topbar">
          <div className="section-heading">
            <div>
              <p className="section-heading__eyebrow">Authoring controls</p>
              <h2 className="page-card__title">Control the draft layer without losing the writing surface</h2>
            </div>
            <div className="page-card__actions">
              <span className="question-status-badge question-status-badge--accent">
                Revision {workspaceQuery.data.revisionNo}
              </span>
              <span className="question-status-badge question-status-badge--neutral">
                {workspaceQuery.data.workspaceStatusLabel}
              </span>
              <div className="resume-editor-topbar__menu">
                <button
                  aria-expanded={isWorkspaceMenuOpen}
                  className="secondary-button"
                  onClick={() => setIsWorkspaceMenuOpen((current) => !current)}
                  type="button"
                >
                  More actions
                </button>
                {isWorkspaceMenuOpen ? (
                  <div className="resume-editor-topbar__menu-popover" role="menu">
                    <button
                      className="resume-editor-topbar__menu-item"
                      onClick={() => {
                        setIsWorkspaceInfoOpen((current) => !current);
                        setIsWorkspaceMenuOpen(false);
                      }}
                      type="button"
                    >
                      {isWorkspaceInfoOpen ? "Hide workspace info" : "Workspace info"}
                    </button>
                    <button
                      className="resume-editor-topbar__menu-item"
                      onClick={() => {
                        setImportMarkdownOpen(true);
                        setIsWorkspaceMenuOpen(false);
                      }}
                      type="button"
                    >
                      Import markdown
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <p className="resume-tailor-muted">
            The source resume stays immutable. Use this strip to manage saves, view mode, and draft behavior while the main surface stays focused on claim quality.
          </p>
          {saveMessage ? <p className="resume-tailor-muted">{saveMessage}</p> : null}
          <div className="filter-chip-row resume-editor-tabbar">
            {primaryTabs.map((tab) => (
              <button
                className={`detail-chip detail-chip--interactive ${currentTab === tab ? "detail-chip--active" : ""}`}
                key={tab}
                onClick={() => {
                  updateTab(tab);
                  setIsViewMenuOpen(false);
                }}
                type="button"
              >
                {tab === "edit" ? "Edit" : "Review"}
              </button>
            ))}
            <div className="resume-editor-topbar__menu">
              <button
                aria-expanded={isViewMenuOpen}
                className={`detail-chip detail-chip--interactive ${isSecondaryTabActive || isViewMenuOpen ? "detail-chip--active" : ""}`}
                onClick={() => setIsViewMenuOpen((current) => !current)}
                type="button"
              >
                Views
              </button>
              {isViewMenuOpen ? (
                <div className="resume-editor-topbar__menu-popover" role="menu">
                  {secondaryTabs.map((tab) => (
                    <button
                      className="resume-editor-topbar__menu-item"
                      key={tab}
                      onClick={() => {
                        updateTab(tab);
                        setIsViewMenuOpen(false);
                      }}
                      type="button"
                    >
                      {tab === "heatmap" ? "Heatmap" : tab === "print-preview" ? "Print preview" : "History"}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            {isSecondaryTabActive ? (
              <span className="detail-chip">
                {currentTab === "heatmap"
                  ? "Heatmap"
                  : currentTab === "print-preview"
                    ? "Print preview"
                    : "History"}
              </span>
            ) : null}
          </div>
          {currentTab === "edit" || currentTab === "review" ? (
            <p className="resume-tailor-muted">
              Select the smallest claim that needs work first. Rich-tree anchors and contextual actions will bind the edit to that source line automatically when available.
            </p>
          ) : null}
          {isWorkspaceInfoOpen ? (
            <div className="page-card page-card--muted resume-editor-workspace-info">
              <div className="stats-grid">
                <MetricCard label="Blocks" value={String(workspaceQuery.data.document.blocks.length)} />
                <MetricCard label="Nodes" tone="accent" value={String(workspaceQuery.data.document.nodes.length)} />
                <MetricCard label="Comments" tone="accent" value={String(workspaceQuery.data.commentSummary.totalCount)} />
                <MetricCard label="Question cards" tone="muted" value={String(workspaceQuery.data.questionCardSummary.totalCount)} />
                <MetricCard label="Presence" tone="muted" value={String(workspaceQuery.data.activePresence.length)} />
              </div>
              <div className="filter-chip-row">
                <span className="detail-chip">
                  Model {workspaceQuery.data.documentModel === "rich_tree" ? "Rich tree" : "Blocks"}
                </span>
                {workspaceQuery.data.selectionCapabilities.supportsOperations ? (
                  <span className="detail-chip">Operations enabled</span>
                ) : null}
                {workspaceQuery.data.selectionCapabilities.supportsInlineSelections ? (
                  <span className="detail-chip">Inline selections enabled</span>
                ) : null}
                {workspaceQuery.data.supportedViewModes.length > 0 ? (
                  <span className="detail-chip">
                    Modes {workspaceQuery.data.supportedViewModes.join(", ")}
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}
        </section>

        {importMarkdownOpen ? (
          <div
            aria-modal="true"
            className="resume-editor-import-modal"
            onClick={() => {
              if (!importMarkdownMutation.isPending) {
                setImportMarkdownOpen(false);
              }
            }}
            role="dialog"
          >
            <section
              className="page-card resume-editor-import-modal__surface"
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              <span className="page-card__label">Markdown import</span>
              <h2 className="page-card__title">Import markdown into the draft workspace</h2>
              <p className="resume-tailor-muted">
                Paste markdown only when you want to replace or append larger document structure. Day-to-day edits
                should stay in the writing surface.
              </p>
              <label className="form-field">
                <span className="form-field__label">Markdown source</span>
                <textarea
                  className="form-field__input form-input--textarea"
                  onChange={(event) => setImportMarkdownSource(event.target.value)}
                  rows={12}
                  value={importMarkdownSource}
                />
              </label>
              <label className="form-field form-field--checkbox">
                <span className="form-field__label">Replace existing document</span>
                <input
                  checked={replaceDocument}
                  onChange={(event) => setReplaceDocument(event.target.checked)}
                  type="checkbox"
                />
              </label>
              <div className="page-card__actions">
                <button
                  className="secondary-button"
                  disabled={importMarkdownMutation.isPending}
                  onClick={() => setImportMarkdownOpen(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="primary-button"
                  disabled={importMarkdownMutation.isPending || !importMarkdownSource.trim()}
                  onClick={() => {
                    void importMarkdownMutation.mutateAsync({
                      markdownSource: importMarkdownSource,
                      replaceDocument,
                      baseRevisionNo: workspaceQuery.data.revisionNo,
                      changeSource: "markdown_import",
                    });
                    setImportMarkdownOpen(false);
                  }}
                  type="button"
                >
                  {importMarkdownMutation.isPending ? "Importing..." : "Import markdown"}
                </button>
              </div>
            </section>
          </div>
        ) : null}

        {mergePreviewMessage ? (
          <section className="page-card">
            <span className="page-card__label">Stale write recovery</span>
            <h2 className="page-card__title">Merge preview</h2>
            <p className="page-card__body">{mergePreviewMessage}</p>
            {mergePreviewMutation.data ? (
              <>
                <div className="stats-grid">
                  <MetricCard label="Status" value={mergePreviewMutation.data.mergeStatusLabel} />
                  <MetricCard label="Added" tone="accent" value={String(mergePreviewMutation.data.changeSummary.addedBlockCount)} />
                  <MetricCard label="Updated" tone="muted" value={String(mergePreviewMutation.data.changeSummary.updatedBlockCount)} />
                  <MetricCard label="Conflicts" tone="muted" value={String(mergePreviewMutation.data.conflicts.length)} />
                </div>
                {mergePreviewMutation.data.conflicts.length > 0 ? (
                  <div className="stack-list">
                    {mergePreviewMutation.data.conflicts.map((conflict) => (
                      <article className="page-card page-card--muted" key={conflict.id}>
                        <p className="section-heading__eyebrow">{conflict.conflictTypeLabel}</p>
                        <h3 className="page-card__title">{conflict.nodeId ?? conflict.blockId}</h3>
                        {conflict.conflictScopes.length > 0 ? (
                          <div className="filter-chip-row">
                            {conflict.conflictScopes.map((scope) => (
                              <span className="detail-chip" key={`${conflict.id}-${scope}`}>
                                {scope}
                              </span>
                            ))}
                          </div>
                        ) : null}
                        <p className="resume-tailor-muted">Server current</p>
                        <div className="page-card__body resume-section__body--preserve">
                          {(conflict.currentTextLines.length > 0
                            ? conflict.currentTextLines
                            : [conflict.currentText ?? "No text"]
                          ).map((line, index) => (
                            <p key={`${conflict.id}-current-${index}`}>{line || "\u00A0"}</p>
                          ))}
                        </div>
                        <p className="resume-tailor-muted">Your proposed edit</p>
                        <div className="page-card__body resume-section__body--preserve">
                          {(conflict.proposedTextLines.length > 0
                            ? conflict.proposedTextLines
                            : [conflict.proposedText ?? "No text"]
                          ).map((line, index) => (
                            <p key={`${conflict.id}-proposed-${index}`}>{line || "\u00A0"}</p>
                          ))}
                        </div>
                        <div className="page-card__actions">
                          <button
                            className="secondary-button"
                            onClick={() => resolveConflictBlock(conflict.blockId, "current")}
                            type="button"
                          >
                            Keep server version
                          </button>
                          <button
                            className="secondary-button"
                            onClick={() => resolveConflictBlock(conflict.blockId, "proposed")}
                            type="button"
                          >
                            Keep my edit
                          </button>
                          <button
                            className="secondary-button"
                            onClick={() => resolveConflictBlock(conflict.blockId, "merged")}
                            type="button"
                          >
                            Use merged text
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : null}
                <div className="page-card__actions">
                  <button
                    className="primary-button"
                    onClick={() => {
                      if (!mergePreviewMutation.data) {
                        return;
                      }

                      setBlocks(mapEditableBlocks(mergePreviewMutation.data.mergedDocument.blocks));
                      setMarkdownSource(mergePreviewMutation.data.mergedDocument.markdownSource);
                    }}
                    type="button"
                  >
                    Apply merged draft to workspace
                  </button>
                  <button
                    className="secondary-button"
                    onClick={() => {
                      void saveCurrentDraft("merge_resolution");
                    }}
                    type="button"
                  >
                    Save resolved draft
                  </button>
                </div>
              </>
            ) : null}
          </section>
        ) : null}

        {currentTab === "edit" || currentTab === "review" ? (
          <>
            <div className="resume-editor-workspace">
              <div className="resume-editor-workspace__document">
                {currentTab === "review" ? (
                  <section className="page-card page-card--muted">
                    <div className="section-heading">
                      <div>
                        <p className="section-heading__eyebrow">Review focus</p>
                        <h2 className="page-card__title">Read the draft like interview pressure, then annotate the weakest claims</h2>
                      </div>
                      <span className="detail-chip">Review mode</span>
                    </div>
                    <div className="stats-grid">
                      <MetricCard
                        label="Comments"
                        tone="accent"
                        value={String(workspaceQuery.data.commentSummary.totalCount)}
                      />
                      <MetricCard
                        label="Question cards"
                        tone="muted"
                        value={String(workspaceQuery.data.questionCardSummary.totalCount)}
                      />
                      <MetricCard
                        label="Suggestions"
                        tone="muted"
                        value={String(
                          (questionSuggestionsMutation.data?.suggestions.length ?? 0) +
                            (rewriteSuggestionsMutation.data?.suggestions.length ?? 0),
                        )}
                      />
                    </div>
                    <p className="resume-tailor-muted">
                      Start with the reading surface and hotspot navigation, then open full tools only when the weak line is clear enough to fix.
                    </p>
                    <div className="page-card__actions">
                      <span className="detail-chip">
                        {reviewHotspotLineIndexes.length} hotspot{reviewHotspotLineIndexes.length === 1 ? "" : "s"}
                      </span>
                      <button
                        className="secondary-button"
                        disabled={reviewHotspotLineIndexes.length === 0}
                        onClick={() => focusReviewHotspot("previous")}
                        type="button"
                      >
                        Previous hotspot
                      </button>
                      <button
                        className="secondary-button"
                        disabled={reviewHotspotLineIndexes.length === 0}
                        onClick={() => focusReviewHotspot("next")}
                        type="button"
                      >
                        Next hotspot
                      </button>
                    </div>
                    {selectedBlock || selectedNode ? (
                      <div className="resume-editor-contextual__summary resume-editor-review-summary">
                        {contextualSummaryItems.map((item) => (
                          <button
                            className="resume-editor-contextual__summary-card"
                            key={`review-${item.panelId}`}
                            onClick={() => {
                              const matchedLineIndex = findFirstReviewSignalLine(
                                previewReviewSignals,
                                item.panelId,
                              );
                              if (matchedLineIndex >= 0) {
                                setFocusedReviewLineIndex(matchedLineIndex);
                              }
                              setActiveSidePanel(item.panelId);
                              setIsContextPanelOpen(true);
                              setIsSecondaryToolsOpen(false);
                            }}
                            type="button"
                          >
                            <span className="resume-editor-contextual__summary-label">{item.label}</span>
                            <strong className="resume-editor-contextual__summary-value">{item.value}</strong>
                            <span className="resume-editor-contextual__summary-helper">{item.helper}</span>
                          </button>
                        ))}
                        <button
                          className="secondary-button"
                          onClick={() => setIsContextPanelOpen(true)}
                          type="button"
                        >
                          Open tools
                        </button>
                      </div>
                    ) : null}
                  </section>
                ) : null}
                <section className="page-card">
                  <div className="section-heading">
                    <div>
                      <p className="section-heading__eyebrow">Draft document</p>
                      <h2 className="page-card__title">
                        {currentTab === "review"
                          ? "Review reading surface"
                          : richTreeEnabled
                            ? "Single-surface editor with rich-tree anchors"
                            : "Single-surface editor"}
                      </h2>
                    </div>
                    <div className="resume-status-badges">
                      <span className="detail-chip">
                        {currentTab === "review" ? "Review mode" : "Row editor"}
                      </span>
                      {selectedBlock || selectedNode ? (
                        <>
                          <span className="question-status-badge question-status-badge--neutral">
                            Selected {richTreeEnabled ? selectedNode?.nodeTypeLabel : selectedBlock?.blockType}
                          </span>
                          <button
                            className="secondary-button"
                            onClick={() => setIsContextPanelOpen((current) => !current)}
                            type="button"
                          >
                            {isContextPanelOpen ? "Hide tools" : "Open tools"}
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                  <div className="resume-editor-surface">
                    {currentTab !== "review" ? (
                      <div className="resume-editor-write-surface">
                        {inlineSuggestionPreview === "question" ? (
                          <article className="resume-editor-inline-preview">
                            <div className="section-heading">
                              <div>
                                <p className="section-heading__eyebrow">Inline question suggestions</p>
                                <h3 className="page-card__title">Selection-based prompts</h3>
                              </div>
                              <button
                                className="secondary-button"
                                onClick={() => {
                                  setActiveSidePanel("suggestions");
                                  setIsContextPanelOpen(true);
                                }}
                                type="button"
                              >
                                Open full panel
                              </button>
                            </div>
                            {questionSuggestionsMutation.isPending ? (
                              <p className="resume-tailor-muted">Generating question suggestions...</p>
                            ) : questionSuggestionsMutation.data ? (
                              <div className="stack-list">
                                {questionSuggestionsMutation.data.suggestions.slice(0, 2).map((suggestion) => (
                                  <article className="page-card page-card--muted" key={suggestion.id}>
                                    <p className="section-heading__eyebrow">{suggestion.questionTypeLabel}</p>
                                    <h4 className="page-card__title">{suggestion.title}</h4>
                                    <p className="page-card__body resume-section__body--preserve">
                                      {suggestion.questionText}
                                    </p>
                                    <div className="page-card__actions">
                                      <button
                                        className="secondary-button"
                                        onClick={() => {
                                          void createQuestionCardMutation.mutateAsync({
                                            blockId: selectedBlock?.blockId ?? null,
                                            selectionAnchor:
                                              questionSuggestionsMutation.data?.selectionAnchor ??
                                              currentSelectionAnchor,
                                            fieldPath:
                                              questionSuggestionsMutation.data?.selectionAnchor?.fieldPath ??
                                              currentSelectionAnchor?.fieldPath ??
                                              selectedBlock?.fieldPath ??
                                              null,
                                            selectedText: questionSuggestionsMutation.data?.selectedText || null,
                                            title: suggestion.title,
                                            questionText: suggestion.questionText,
                                            questionType: suggestion.questionType,
                                            linkedQuestionId: null,
                                            followUpSuggestions: suggestion.followUpSuggestions,
                                          });
                                        }}
                                        type="button"
                                      >
                                        Create card
                                      </button>
                                    </div>
                                  </article>
                                ))}
                              </div>
                            ) : null}
                          </article>
                        ) : null}
                        {inlineSuggestionPreview === "rewrite" ? (
                          <article className="resume-editor-inline-preview">
                            <div className="section-heading">
                              <div>
                                <p className="section-heading__eyebrow">Inline rewrite suggestions</p>
                                <h3 className="page-card__title">Selection-based wording options</h3>
                              </div>
                              <button
                                className="secondary-button"
                                onClick={() => {
                                  setActiveSidePanel("suggestions");
                                  setIsContextPanelOpen(true);
                                }}
                                type="button"
                              >
                                Open full panel
                              </button>
                            </div>
                            {rewriteSuggestionsMutation.isPending ? (
                              <p className="resume-tailor-muted">Generating rewrite suggestions...</p>
                            ) : rewriteSuggestionsMutation.data ? (
                              <div className="stack-list">
                                {rewriteSuggestionsMutation.data.suggestions.slice(0, 2).map((suggestion) => (
                                  <article className="page-card page-card--muted" key={suggestion.id}>
                                    <p className="section-heading__eyebrow">
                                      {suggestion.focusArea ?? "Rewrite suggestion"}
                                    </p>
                                    <p className="page-card__body resume-section__body--preserve">
                                      {suggestion.suggestedText}
                                    </p>
                                    <div className="page-card__actions">
                                      <button
                                        className="secondary-button"
                                        onClick={() => {
                                          void handleApplyRewrite(suggestion.suggestedText);
                                        }}
                                        type="button"
                                      >
                                        Apply rewrite
                                      </button>
                                    </div>
                                  </article>
                                ))}
                              </div>
                            ) : null}
                          </article>
                        ) : null}
                        {slashCommand ? (
                          <article className="resume-editor-slash-menu">
                            <div className="section-heading">
                              <div>
                                <p className="section-heading__eyebrow">Slash menu</p>
                                <h3 className="page-card__title">Quick block and action commands</h3>
                              </div>
                              <span className="detail-chip">/{slashCommand.query || "..."}</span>
                            </div>
                            <div className="resume-editor-slash-menu__list">
                              {slashMenuItems.map((item) => (
                                <button
                                  className="secondary-button resume-editor-slash-menu__item"
                                  key={item.id}
                                  onClick={item.onSelect}
                                  type="button"
                                >
                                  {item.label}
                                </button>
                              ))}
                            </div>
                          </article>
                        ) : null}
                        <article className="page-card page-card--muted resume-editor-document-preview resume-editor-document-preview--editable">
                          <div className="section-heading">
                            <div>
                              <p className="section-heading__eyebrow">Editor surface</p>
                              <h3 className="page-card__title">Edit each row directly</h3>
                            </div>
                            <span className="detail-chip">
                              {selectedMarkdownRange?.text
                                ? "Selection tools"
                                : "Select text or use row handles"}
                            </span>
                          </div>
                          <div
                            className="resume-editor-document-preview__body"
                            onMouseDown={handleEditorSurfaceMouseDown}
                            ref={editorSurfaceBodyRef}
                          >
                            {selectedMarkdownRange?.text && editorToolbarPosition && !inlineComposerMode ? (
                              <div
                                className="resume-editor-context-toolbar"
                                style={{
                                  left: `${editorToolbarPosition.left}px`,
                                  top: `${editorToolbarPosition.top}px`,
                                }}
                              >
                                <span className="resume-editor-context-toolbar__label">Selection tools</span>
                                <div className="filter-chip-row">
                                  <div className="resume-editor-selection-format">
                                    <button
                                      className="detail-chip detail-chip--interactive"
                                      onClick={() => setIsSelectionFormatOpen((current) => !current)}
                                      type="button"
                                    >
                                      Format
                                    </button>
                                    {isSelectionFormatOpen ? (
                                      <div className="resume-editor-selection-format__menu">
                                        <button
                                          className="secondary-button"
                                          onClick={() => applySelectionFormat("bold")}
                                          type="button"
                                        >
                                          Bold
                                        </button>
                                        <button
                                          className="secondary-button"
                                          onClick={() => applySelectionFormat("italic")}
                                          type="button"
                                        >
                                          Italic
                                        </button>
                                        <button
                                          className="secondary-button"
                                          onClick={() => applySelectionFormat("code")}
                                          type="button"
                                        >
                                          Code
                                        </button>
                                        <button
                                          className="secondary-button"
                                          onClick={() => applySelectionFormat("heading1")}
                                          type="button"
                                        >
                                          Turn into H1
                                        </button>
                                        <button
                                          className="secondary-button"
                                          onClick={() => applySelectionFormat("heading2")}
                                          type="button"
                                        >
                                          Turn into H2
                                        </button>
                                        <button
                                          className="secondary-button"
                                          onClick={() => applySelectionFormat("bullet")}
                                          type="button"
                                        >
                                          Bullet list
                                        </button>
                                        <button
                                          className="secondary-button"
                                          onClick={() => applySelectionFormat("quote")}
                                          type="button"
                                        >
                                          Quote
                                        </button>
                                      </div>
                                    ) : null}
                                  </div>
                                  <button
                                    className="detail-chip detail-chip--interactive"
                                    onClick={() => openInlineComposer("comment")}
                                    type="button"
                                  >
                                    Comment
                                  </button>
                                  <button
                                    className="detail-chip detail-chip--interactive"
                                    onClick={() => {
                                      void runInlineQuestionSuggestions();
                                    }}
                                    type="button"
                                  >
                                    Question
                                  </button>
                                  <button
                                    className="detail-chip detail-chip--interactive"
                                    onClick={() => {
                                      void runInlineRewriteSuggestions();
                                    }}
                                    type="button"
                                  >
                                    Rewrite
                                  </button>
                                  <button
                                    className="detail-chip detail-chip--interactive"
                                    onClick={() => {
                                      setSelectedMarkdownRange(null);
                                      setInlineSuggestionPreview(null);
                                      setInlineComposerMode(null);
                                    }}
                                    type="button"
                                  >
                                    Clear
                                  </button>
                                </div>
                              </div>
                            ) : null}
                            {renderMarkdownDocumentPreview(markdownSource, {
                              editable: true,
                              selectedText: effectiveSelectedText,
                              tableOfContents: documentTableOfContents,
                              activeLineMenuIndex: activePreviewLineIndex,
                              lineRef: (lineIndex, element) => {
                                documentEditorLineRefs.current[lineIndex] = element;
                              },
                              onEditableLineInput: handleEditableLineInput,
                              onEditableLineSelection: (lineIndex, element) => {
                                const lineText = markdownSource.split("\n")[lineIndex] ?? "";
                                handleEditableLineSelection(lineIndex, lineText, element);
                              },
                              onEditableLineFocus: (lineIndex, lineText) => {
                                setCurrentCursorLineIndex(lineIndex);
                                syncAnchorsForLineText(lineText);
                              },
                              onEditableLineKeyDown: handleEditableLineKeyDown,
                              onAddLine: (lineIndex) => {
                                insertMarkdownLineAfter(lineIndex);
                              },
                              onToggleLineMenu: (lineIndex, target) => openPreviewLineMenu(lineIndex, target),
                              onLineAction: handlePreviewLineAction,
                              renderLineMenu,
                              onHeadingClick: (nodeId) => {
                                setSelectedNodeId(nodeId);
                                setActiveSidePanel("comments");
                                setIsContextPanelOpen(true);
                              },
                            })}
                            {renderFloatingLineMenu()}
                            {inlineComposerMode === "comment" && editorPopoverPosition ? (
                              <article
                                aria-label="Inline comment popover"
                                className="resume-editor-inline-preview resume-editor-inline-composer resume-editor-inline-composer--floating"
                                role="dialog"
                                style={{
                                  left: `${editorPopoverPosition.left}px`,
                                  top: `${editorPopoverPosition.top}px`,
                                }}
                              >
                                <div className="resume-editor-inline-composer__header">
                                  <div>
                                    <p className="section-heading__eyebrow">Inline comment</p>
                                    <h3 className="page-card__title">Comment on the current selection</h3>
                                  </div>
                                  <button
                                    aria-label="Close inline comment"
                                    className="secondary-button"
                                    onClick={() => setInlineComposerMode(null)}
                                    type="button"
                                  >
                                    Close
                                  </button>
                                </div>
                                {effectiveSelectedText ? (
                                  <p className="resume-editor-inline-composer__meta">
                                    Selection: {effectiveSelectedText}
                                  </p>
                                ) : null}
                                <label className="form-field">
                                  <span className="form-field__label">Comment</span>
                                  <textarea
                                    aria-label="Inline comment"
                                    className="form-field__input form-input--textarea"
                                    onChange={(event) => setInlineCommentBody(event.target.value)}
                                    rows={3}
                                    value={inlineCommentBody}
                                  />
                                </label>
                                <div className="page-card__actions resume-editor-inline-composer__actions">
                                  <button
                                    className="primary-button"
                                    disabled={
                                      createCommentMutation.isPending ||
                                      (!selectedBlock && !currentSelectionAnchor) ||
                                      !inlineCommentBody.trim()
                                    }
                                    onClick={() => {
                                      void submitInlineComment();
                                    }}
                                    type="button"
                                  >
                                    Save inline comment
                                  </button>
                                  <button
                                    className="secondary-button"
                                    onClick={() => {
                                      setActiveSidePanel("comments");
                                      setIsContextPanelOpen(true);
                                    }}
                                    type="button"
                                  >
                                    Open full panel
                                  </button>
                                </div>
                              </article>
                            ) : null}
                            {inlineComposerMode === "card" && editorPopoverPosition ? (
                              <article
                                aria-label="Inline question card popover"
                                className="resume-editor-inline-preview resume-editor-inline-composer resume-editor-inline-composer--floating"
                                role="dialog"
                                style={{
                                  left: `${editorPopoverPosition.left}px`,
                                  top: `${editorPopoverPosition.top}px`,
                                }}
                              >
                                <div className="resume-editor-inline-composer__header">
                                  <div>
                                    <p className="section-heading__eyebrow">Inline question card</p>
                                    <h3 className="page-card__title">Create a prompt from the current selection</h3>
                                  </div>
                                  <button
                                    aria-label="Close inline question card"
                                    className="secondary-button"
                                    onClick={() => setInlineComposerMode(null)}
                                    type="button"
                                  >
                                    Close
                                  </button>
                                </div>
                                {effectiveSelectedText ? (
                                  <p className="resume-editor-inline-composer__meta">
                                    Selection: {effectiveSelectedText}
                                  </p>
                                ) : null}
                                <label className="form-field">
                                  <span className="form-field__label">Title</span>
                                  <input
                                    aria-label="Inline question card title"
                                    className="form-field__input"
                                    onChange={(event) => setInlineCardTitle(event.target.value)}
                                    value={inlineCardTitle}
                                  />
                                </label>
                                <label className="form-field">
                                  <span className="form-field__label">Question text</span>
                                  <textarea
                                    aria-label="Inline question card text"
                                    className="form-field__input form-input--textarea"
                                    onChange={(event) => setInlineCardText(event.target.value)}
                                    rows={3}
                                    value={inlineCardText}
                                  />
                                </label>
                                <div className="page-card__actions resume-editor-inline-composer__actions">
                                  <button
                                    className="primary-button"
                                    disabled={
                                      createQuestionCardMutation.isPending ||
                                      (!selectedBlock && !currentSelectionAnchor) ||
                                      !inlineCardText.trim()
                                    }
                                    onClick={() => {
                                      void submitInlineQuestionCard();
                                    }}
                                    type="button"
                                  >
                                    Save inline card
                                  </button>
                                  <button
                                    className="secondary-button"
                                    onClick={() => {
                                      setActiveSidePanel("question-cards");
                                      setIsContextPanelOpen(true);
                                    }}
                                    type="button"
                                  >
                                    Open full panel
                                  </button>
                                </div>
                              </article>
                            ) : null}
                          </div>
                        </article>
                      </div>
                    ) : null}
                    {currentTab === "review" ? (
                      <article className="page-card page-card--muted resume-editor-document-preview">
                        <div className="section-heading">
                          <div>
                            <p className="section-heading__eyebrow">Document preview</p>
                            <h3 className="page-card__title">Reading surface</h3>
                          </div>
                          <span className="detail-chip">
                            {richTreeEnabled ? "Rich-tree aware" : "Markdown preview"}
                          </span>
                        </div>
                        {richTreeEnabled && documentTableOfContents.length > 0 ? (
                          <div className="resume-editor-document-preview__toc">
                            {documentTableOfContents.map((item) => (
                              <button
                                className={`detail-chip detail-chip--interactive ${
                                  item.nodeId === selectedNodeId ? "detail-chip--active" : ""
                                }`}
                                key={item.id}
                                onClick={() => {
                                  setSelectedNodeId(item.nodeId);
                                  setActiveSidePanel("comments");
                                  setIsContextPanelOpen(true);
                                  scrollToEditorHeading(item.nodeId);
                                }}
                                type="button"
                              >
                                {item.title}
                              </button>
                            ))}
                          </div>
                        ) : null}
                        <div className="resume-editor-document-preview__body">
                          {renderMarkdownDocumentPreview(markdownSource, {
                            selectedText: effectiveSelectedText,
                            tableOfContents: documentTableOfContents,
                            activeLineMenuIndex: activePreviewLineIndex,
                            focusedLineIndex: currentTab === "review" ? focusedReviewLineIndex : null,
                            reviewSignals: currentTab === "review" ? previewReviewSignals : undefined,
                            onReviewSignalClick:
                              currentTab === "review"
                                ? (signalType, lineIndex) => {
                                    const selectableRange = getSelectableLineRange(markdownSource, lineIndex);
                                    const lineText = selectableRange.selectedText || selectableRange.text || null;
                                    setSelectedMarkdownRange(
                                      lineText
                                        ? {
                                            startOffset: selectableRange.startOffset,
                                            endOffset: selectableRange.endOffset,
                                            text: lineText,
                                          }
                                        : null,
                                    );
                                    setCurrentCursorLineIndex(lineIndex);
                                    setFocusedReviewLineIndex(lineIndex);
                                    setActiveSidePanel(signalType);
                                    setIsContextPanelOpen(true);
                                    setIsSecondaryToolsOpen(false);
                                  }
                                : undefined,
                            onAddLine: undefined,
                            onToggleLineMenu: (lineIndex, target) => {
                              openPreviewLineMenu(lineIndex, target);
                              if (currentTab === "review") {
                                setFocusedReviewLineIndex(lineIndex);
                              }
                            },
                            onLineAction: handlePreviewLineAction,
                            renderLineMenu,
                            onHeadingClick: (nodeId) => {
                              setSelectedNodeId(nodeId);
                              setActiveSidePanel("comments");
                              setIsContextPanelOpen(true);
                            },
                          })}
                          {renderFloatingLineMenu()}
                        </div>
                      </article>
                    ) : null}
                  </div>
                  {selectedBlock || selectedNode ? (
                    <div className="resume-editor-selection">
                      <span className="detail-chip">
                        {selectedMarkdownRange
                          ? `Markdown selection · ${selectedMarkdownRange.startOffset}-${selectedMarkdownRange.endOffset}`
                          : "No text range selected"}
                      </span>
                      <p className="resume-tailor-muted">
                        {effectiveSelectedText
                          ? `Current excerpt: ${effectiveSelectedText}`
                          : currentTab === "review"
                            ? "Use the reading surface or fallback anchors to focus a sentence before leaving review notes."
                            : "Select markdown text or click a block below to anchor comments, question cards, and AI suggestions more precisely."}
                      </p>
                      {effectiveSelectedText && currentTab !== "review" ? (
                        <p className="resume-tailor-muted">
                          Comments, question cards, and rewrite suggestions will attach to the current selection.
                        </p>
                      ) : null}
                      {currentSelectionAnchor?.nodeId ? (
                        <div className="filter-chip-row">
                          <span className="detail-chip">Node {currentSelectionAnchor.nodeId}</span>
                          {currentSelectionAnchor.fieldPath ? (
                            <span className="detail-chip">{currentSelectionAnchor.fieldPath}</span>
                          ) : null}
                        </div>
                      ) : null}
                      {selectedBlock ? (
                        <article className="page-card page-card--muted resume-editor-annotated-text">
                          <p className="section-heading__eyebrow">Annotated preview</p>
                          <div className="page-card__body resume-section__body--preserve">
                            {renderAnnotatedText(
                              selectedBlock.text,
                              selectedBlock.inlineMarks,
                              null,
                            )}
                          </div>
                        </article>
                      ) : null}
                    </div>
                  ) : null}
                  <div className="section-heading">
                    <div>
                      <p className="section-heading__eyebrow">
                        {richTreeEnabled ? "Fallback blocks and node anchors" : "Parsed blocks"}
                      </p>
                      <h3 className="page-card__title">
                        {richTreeEnabled
                          ? "Keep fallback anchors tucked away unless you need a precise block handle"
                          : "Click a section to open contextual tools"}
                      </h3>
                    </div>
                    <div className="page-card__actions">
                      <span className="detail-chip">{blocks.length} blocks</span>
                      <button
                        className="secondary-button"
                        onClick={() => setIsFallbackBlocksOpen((current) => !current)}
                        type="button"
                      >
                        {isFallbackBlocksOpen ? "Hide fallback anchors" : "Show fallback anchors"}
                      </button>
                    </div>
                  </div>
                  {!isFallbackBlocksOpen && selectedBlock ? (
                    <article className="page-card page-card--muted resume-editor-block resume-editor-block--selected">
                      <div className="section-heading">
                        <div>
                          <p className="section-heading__eyebrow">Current fallback anchor</p>
                          <h3 className="page-card__title">{selectedBlock.title || "Untitled block"}</h3>
                        </div>
                        <button
                          className="secondary-button"
                          onClick={() => {
                            setActiveSidePanel("comments");
                            setIsContextPanelOpen(true);
                          }}
                          type="button"
                        >
                          Open tools
                        </button>
                      </div>
                      <p className="page-card__body resume-section__body--preserve">
                        {selectedBlock.text || "No body text yet."}
                      </p>
                    </article>
                  ) : null}
                  {isFallbackBlocksOpen ? (
                    <div className="resume-editor-block-grid resume-editor-outline-list">
                      {blocks.map((block) => (
                        <article
                          className={`page-card page-card--muted resume-editor-block resume-editor-block--compact ${selectedBlockId === block.blockId ? "resume-editor-block--selected" : ""}`}
                          key={block.blockId}
                        >
                          <div className="section-heading">
                            <div>
                              <p className="section-heading__eyebrow">{block.blockTypeLabel}</p>
                              <h3 className="page-card__title">{block.title || "Untitled block"}</h3>
                            </div>
                            <button
                              className="secondary-button"
                              onClick={() => {
                                setSelectedBlockId(block.blockId);
                                if (richTreeEnabled) {
                                  const matchedNode = richNodes.find((node) => node.fieldPath === block.fieldPath);
                                  setSelectedNodeId(matchedNode?.nodeId ?? null);
                                }
                                setActiveSidePanel("comments");
                                setIsContextPanelOpen(true);
                              }}
                              type="button"
                            >
                              {selectedBlockId === block.blockId ? "Open tools" : "Select block"}
                            </button>
                          </div>
                          <p className="page-card__body resume-section__body--preserve">
                            {block.text || "No body text yet."}
                          </p>
                          <div className="filter-chip-row">
                            {block.sourceAnchorTypeLabel ? (
                              <span className="detail-chip">{block.sourceAnchorTypeLabel}</span>
                            ) : null}
                            {block.fieldPath ? <span className="detail-chip">{block.fieldPath}</span> : null}
                            <span className="detail-chip">Order {block.displayOrder}</span>
                          </div>
                          {block.inlineMarks.length > 0 ? (
                            <div className="filter-chip-row">
                              {block.inlineMarks.map((mark, index) => (
                                <span className="detail-chip" key={`${block.blockId}-mark-${index}`}>
                                  {mark.markTypeLabel}: {mark.text}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </article>
                      ))}
                    </div>
                  ) : null}
                </section>
              </div>
            </div>

            {selectedBlock || selectedNode ? (
              <div
                aria-label="Contextual editor tools"
                className={`resume-editor-contextual ${isContextPanelOpen ? "resume-editor-contextual--open" : ""}`}
              >
                {isContextPanelOpen ? (
                  <div className="resume-editor-contextual__dock">
                    {primarySidePanels.map(([panelId, label]) => (
                      <button
                        className={`detail-chip detail-chip--interactive ${activeSidePanel === panelId ? "detail-chip--active" : ""}`}
                        key={panelId}
                        onClick={() => {
                          setActiveSidePanel(panelId);
                          setIsContextPanelOpen(true);
                          setIsSecondaryToolsOpen(false);
                        }}
                        type="button"
                      >
                        {label}
                      </button>
                    ))}
                    <button
                      className={`detail-chip detail-chip--interactive ${isSecondaryToolsOpen || isSecondaryPanelActive ? "detail-chip--active" : ""}`}
                      onClick={() => setIsSecondaryToolsOpen((current) => !current)}
                      type="button"
                    >
                      More
                    </button>
                    {isSecondaryToolsOpen || isSecondaryPanelActive ? (
                      <div className="resume-editor-contextual__secondary">
                        {secondarySidePanels.map(([panelId, label]) => (
                          <button
                            className={`detail-chip detail-chip--interactive ${activeSidePanel === panelId ? "detail-chip--active" : ""}`}
                            key={panelId}
                            onClick={() => {
                              setActiveSidePanel(panelId);
                              setIsContextPanelOpen(true);
                              setIsSecondaryToolsOpen(true);
                            }}
                            type="button"
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    ) : null}
                    <button
                      className="secondary-button"
                      onClick={() => setIsContextPanelOpen(false)}
                      type="button"
                    >
                      Close
                    </button>
                  </div>
                ) : currentTab !== "review" ? (
                  <div className="resume-editor-contextual__summary">
                    {contextualSummaryItems.map((item) => (
                      <button
                        className="resume-editor-contextual__summary-card"
                        key={item.panelId}
                        onClick={() => {
                          const matchedLineIndex = findFirstReviewSignalLine(
                            previewReviewSignals,
                            item.panelId,
                          );
                          if (matchedLineIndex >= 0) {
                            setFocusedReviewLineIndex(matchedLineIndex);
                          }
                          setActiveSidePanel(item.panelId);
                          setIsContextPanelOpen(true);
                          setIsSecondaryToolsOpen(false);
                        }}
                        type="button"
                      >
                        <span className="resume-editor-contextual__summary-label">{item.label}</span>
                        <strong className="resume-editor-contextual__summary-value">{item.value}</strong>
                        <span className="resume-editor-contextual__summary-helper">{item.helper}</span>
                      </button>
                    ))}
                    <button
                      className="secondary-button"
                      onClick={() => setIsContextPanelOpen(true)}
                      type="button"
                    >
                      Open tools
                    </button>
                  </div>
                ) : null}
                {isContextPanelOpen ? (
                  <div className="resume-editor-contextual__panel">
                    <div className="section-heading">
                      <div>
                        <p className="section-heading__eyebrow">
                          {richTreeEnabled ? "Selected node" : "Selected block"}
                        </p>
                        <h3 className="page-card__title">
                          {richTreeEnabled
                            ? selectedNode?.metadata.heading ?? selectedNode?.fieldPath ?? selectedNode?.nodeId ?? "Untitled node"
                            : selectedBlock?.title || "Untitled block"}
                        </h3>
                      </div>
                      <span className="detail-chip">
                        {richTreeEnabled ? selectedNode?.nodeTypeLabel : selectedBlock?.blockTypeLabel}
                      </span>
                    </div>
                    {renderContextPanelContent()}
                  </div>
                ) : null}
              </div>
            ) : null}
          </>
        ) : null}

        {currentTab === "heatmap" ? (
          <section className="page-card">
            <span className="page-card__label">Heatmap adjacency</span>
            <h2 className="page-card__title">Resume heatmap connection</h2>
            {workspaceQuery.data.heatmapAvailable ? (
              <>
                <div className="stats-grid">
                  <MetricCard label="Anchors" value={String(workspaceQuery.data.heatmapSummary?.totalAnchors ?? 0)} />
                  <MetricCard label="Linked questions" tone="accent" value={String(workspaceQuery.data.heatmapSummary?.totalLinkedQuestions ?? 0)} />
                </div>
                <div className="page-card__actions">
                  <Link className="primary-button" to={routeConfig.resumeHeatmap.buildPath({ versionId: safeVersionId })}>
                    Open interview heatmap
                  </Link>
                </div>
              </>
            ) : (
              <EmptyStateCard
                body="The resume heatmap is not available for this workspace yet."
                title="No heatmap connection"
              />
            )}
          </section>
        ) : null}

        {currentTab === "print-preview" ? (
          <section className="page-card">
            <span className="page-card__label">Print preview</span>
            <h2 className="page-card__title">Server print preview</h2>
            {printPreviewQuery.isLoading ? (
              <LoadingStateCard body="Loading print preview pages and layout hints." title="Preparing print preview" />
            ) : printPreviewQuery.isError ? (
              <ErrorStateCard
                body={printPreviewQuery.error instanceof Error ? printPreviewQuery.error.message : "Unable to load print preview."}
                details={getErrorDetails(printPreviewQuery.error)}
                onAction={() => {
                  void printPreviewQuery.refetch();
                }}
                title="Unable to load print preview"
              />
            ) : printPreviewQuery.data ? (
              <div className="page-stack">
                <div className="stats-grid">
                  <MetricCard label="Page estimate" value={String(printPreviewQuery.data.pageEstimate)} />
                  <MetricCard label="Sections" tone="accent" value={String(printPreviewQuery.data.sections.length)} />
                </div>
                <div className="stack-list">
                  {printPreviewQuery.data.pages.map((page) => (
                    <article className="page-card page-card--muted" key={page.pageNumber}>
                      <div className="section-heading">
                        <div>
                          <p className="section-heading__eyebrow">Page</p>
                          <h3 className="page-card__title">{page.pageNumber}</h3>
                        </div>
                        <span className="question-status-badge question-status-badge--neutral">
                          {page.lineCount} lines
                        </span>
                      </div>
                      <div className="filter-chip-row">
                        {page.sectionKeys.map((sectionKey) => (
                          <span className="detail-chip" key={`${page.pageNumber}-${sectionKey}`}>
                            {sectionKey}
                          </span>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        ) : null}

        {currentTab === "history" ? (
          <div className="resume-editor-workspace">
            <div className="resume-editor-workspace__document">
              <section className="page-card">
                <span className="page-card__label">Revisions</span>
                <h2 className="page-card__title">Revision history</h2>
                {revisionsQuery.isLoading ? (
                  <LoadingStateCard body="Loading persisted workspace revisions." title="Preparing history" />
                ) : revisionsQuery.isError ? (
                  <ErrorStateCard
                    body={revisionsQuery.error instanceof Error ? revisionsQuery.error.message : "Unable to load revisions."}
                    details={getErrorDetails(revisionsQuery.error)}
                    onAction={() => {
                      void revisionsQuery.refetch();
                    }}
                    title="Unable to load revisions"
                  />
                ) : revisionsQuery.data && revisionsQuery.data.length > 0 ? (
                  <div className="stack-list">
                    {revisionsQuery.data.map((revision) => (
                      <article className="page-card page-card--muted" key={revision.id}>
                        <div className="section-heading">
                          <div>
                            <p className="section-heading__eyebrow">{revision.changeSourceLabel}</p>
                            <h3 className="page-card__title">Revision {revision.revisionNo}</h3>
                          </div>
                          <button
                            className="secondary-button"
                            onClick={() => setSelectedRevisionId(revision.id)}
                            type="button"
                          >
                            View detail
                          </button>
                        </div>
                        <p className="resume-tailor-muted">{revision.createdAtLabel}</p>
                    <div className="filter-chip-row">
                      <span className="detail-chip">Added {revision.changeSummary.addedBlockCount}</span>
                      <span className="detail-chip">Updated {revision.changeSummary.updatedBlockCount}</span>
                      <span className="detail-chip">Removed {revision.changeSummary.removedBlockCount}</span>
                      {revision.changeSummary.changedBlockIds.length > 0 ? (
                        <span className="detail-chip">
                          Changed ids {revision.changeSummary.changedBlockIds.length}
                        </span>
                      ) : null}
                    </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <EmptyStateCard body="No revision history beyond the current draft yet." title="No revisions" />
                )}
              </section>
            </div>
            <div className="resume-editor-workspace__side">
              <section className="page-card">
                <span className="page-card__label">Revision detail</span>
                <h2 className="page-card__title">
                  {revisionDetailQuery.data ? `Revision ${revisionDetailQuery.data.revisionNo}` : "Select a revision"}
                </h2>
                {revisionDetailQuery.data ? (
                  <div className="page-stack">
                    <p className="resume-tailor-muted">{revisionDetailQuery.data.createdAtLabel}</p>
                    <div className="filter-chip-row">
                      <span className="detail-chip">Added {revisionDetailQuery.data.changeSummary.addedBlockCount}</span>
                      <span className="detail-chip">Updated {revisionDetailQuery.data.changeSummary.updatedBlockCount}</span>
                    </div>
                    <div className="stack-list">
                      {(revisionDetailQuery.data.document.nodes.length > 0
                        ? revisionDetailQuery.data.document.nodes
                        : revisionDetailQuery.data.document.blocks
                      ).map((block) => (
                        <article
                          className="page-card page-card--muted"
                          key={"nodeId" in block ? block.nodeId : block.blockId}
                        >
                          <p className="section-heading__eyebrow">
                            {"nodeId" in block ? block.nodeTypeLabel : block.blockTypeLabel}
                          </p>
                          <h3 className="page-card__title">
                            {"nodeId" in block
                              ? block.metadata.heading ?? block.fieldPath ?? block.nodeId
                              : block.title || block.blockId}
                          </h3>
                          <p className="page-card__body resume-section__body--preserve">
                            {"nodeId" in block ? block.text : block.textValue}
                          </p>
                        </article>
                      ))}
                    </div>
                  </div>
                ) : null}
              </section>

              <section className="page-card">
                <span className="page-card__label">Tracked changes</span>
                <h2 className="page-card__title">Compare revisions</h2>
                <label className="form-field">
                  <span className="form-field__label">From revision</span>
                  <select
                    className="form-field__input"
                    onChange={(event) => setCompareFromRevisionId(event.target.value)}
                    value={compareFromRevisionId ?? ""}
                  >
                    <option value="">Select revision</option>
                    {revisionsQuery.data?.map((revision) => (
                      <option key={`from-${revision.id}`} value={revision.id}>
                        Revision {revision.revisionNo}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="form-field">
                  <span className="form-field__label">To revision</span>
                  <select
                    className="form-field__input"
                    onChange={(event) => setCompareToRevisionId(event.target.value)}
                    value={compareToRevisionId ?? ""}
                  >
                    <option value="">Select revision</option>
                    {revisionsQuery.data?.map((revision) => (
                      <option key={`to-${revision.id}`} value={revision.id}>
                        Revision {revision.revisionNo}
                      </option>
                    ))}
                  </select>
                </label>
                {trackedChangesQuery.data ? (
                  <div className="stack-list">
                    {trackedChangesQuery.data.changes.map((change) => (
                      <article className="page-card page-card--muted resume-editor-diff-card" key={change.id}>
                        <p className="section-heading__eyebrow">{change.changeTypeLabel}</p>
                        <h3 className="page-card__title">{change.nodeId ?? change.blockId}</h3>
                        <div className="filter-chip-row">
                          {change.textChanged ? <span className="detail-chip">Text changed</span> : null}
                          {change.structureChanged ? <span className="detail-chip">Structure changed</span> : null}
                          {change.moveRelated ? <span className="detail-chip">Move related</span> : null}
                        </div>
                        <div className="resume-editor-diff-card__grid">
                          <div className="resume-editor-diff-card__column">
                            <p className="resume-tailor-muted">Before</p>
                            <div className="page-card__body resume-section__body--preserve resume-editor-diff-card__surface resume-editor-diff-card__surface--before">
                              {(change.beforeTextLines.length > 0
                                ? change.beforeTextLines
                                : [change.beforeText ?? "No previous text"]
                              ).map((line, index) => (
                                <p key={`${change.id}-before-${index}`}>{line || "\u00A0"}</p>
                              ))}
                            </div>
                          </div>
                          <div className="resume-editor-diff-card__column">
                            <p className="resume-tailor-muted">After</p>
                            <div className="page-card__body resume-section__body--preserve resume-editor-diff-card__surface resume-editor-diff-card__surface--after">
                              {(change.afterTextLines.length > 0
                                ? change.afterTextLines
                                : [change.afterText ?? "No updated text"]
                              ).map((line, index) => (
                                <p key={`${change.id}-after-${index}`}>{line || "\u00A0"}</p>
                              ))}
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : null}
              </section>
            </div>
          </div>
        ) : null}
      </div>
    </PageContainer>
  );
}
