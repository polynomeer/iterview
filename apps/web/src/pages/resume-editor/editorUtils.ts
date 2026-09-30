import type { MessageKey, MessageParams } from "../../shared/i18n";
import type {
  EditableBlock,
  EditorTab,
  MarkdownLineDescriptor,
  ReviewLineSignal,
  ReviewSignalType,
} from "./editorTypes";

export function createFallbackSessionKey() {
  return `resume-editor-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

export function createEditorSessionKey() {
  const randomUuid = globalThis.crypto?.randomUUID?.();

  return randomUuid ? `resume-editor-${randomUuid}` : createFallbackSessionKey();
}

export function normalizeEditorTab(value: string | null): EditorTab {
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

const viewModeLabelKeys: Record<string, MessageKey> = {
  edit: "resumeEditor.edit",
  review: "resumeEditor.review",
  heatmap: "resumeEditor.heatmap",
  "print-preview": "resumeEditor.printPreview",
  history: "resumeEditor.history",
};

export type EditorTranslate = (key: MessageKey, params?: MessageParams) => string;

export function formatSupportedViewModeLabel(mode: string, t: EditorTranslate) {
  const key = viewModeLabelKeys[mode];

  if (key) {
    return t(key);
  }

  return t("resumeEditor.unknownViewMode", {
    mode,
    capitalizedMode: mode.charAt(0).toUpperCase() + mode.slice(1),
  });
}

export function mapEditableBlocks(
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

export function splitLines(text: string) {
  return text.split("\n");
}

export function decodeSoftBreaks(text: string) {
  return text.replace(/<br\s*\/?>/gi, "\n");
}

export function encodeSoftBreaks(text: string) {
  return text.replace(/\n/g, "<br />");
}

export function describeMarkdownLine(line: string): MarkdownLineDescriptor {
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

export function rebuildMarkdownLine(descriptor: MarkdownLineDescriptor, nextContent: string) {
  return `${descriptor.prefix}${encodeSoftBreaks(nextContent)}`;
}

export function getMarkdownLineStartOffset(value: string, lineIndex: number) {
  return value
    .split("\n")
    .slice(0, Math.max(0, lineIndex))
    .reduce((total, currentLine) => total + currentLine.length + 1, 0);
}

export function mapRichNodeRequest(
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

export function scrollToEditorHeading(nodeId: string) {
  const headingElement = document.getElementById(`resume-editor-heading-${nodeId}`);

  if (!headingElement) {
    return;
  }

  headingElement.scrollIntoView({ behavior: "smooth", block: "center" });
}

export function getDefaultSelectedText(block: EditableBlock | null) {
  if (!block) {
    return null;
  }

  const trimmed = block.text.trim();

  return trimmed ? trimmed.slice(0, 180) : null;
}

export function replaceFirstOccurrence(source: string, searchText: string, replacementText: string) {
  if (!searchText) {
    return source;
  }

  const targetIndex = source.indexOf(searchText);

  if (targetIndex < 0) {
    return source;
  }

  return `${source.slice(0, targetIndex)}${replacementText}${source.slice(targetIndex + searchText.length)}`;
}

export function buildPreviewReviewSignals(
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

export function findFirstReviewSignalLine(
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

export function getSelectableLineRange(value: string, lineIndex: number) {
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

export function getLineIndexForOffset(value: string, offset: number) {
  const safeOffset = Math.max(0, Math.min(value.length, offset));

  return value.slice(0, safeOffset).split("\n").length - 1;
}

export function normalizePreviewLineText(lineText: string) {
  return lineText.replace(/^#{1,3}\s+/, "").replace(/^[-*]\s+/, "").replace(/^>\s+/, "").trim();
}
