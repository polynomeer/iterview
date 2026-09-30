import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import type { EditableBlock, ReviewLineSignal, ReviewSignalType } from "../editorTypes";
import { translate } from "../../../shared/i18n";
import { decodeSoftBreaks, describeMarkdownLine, type EditorTranslate } from "../editorUtils";

export function renderAnnotatedText(
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

export function renderPreviewTextWithSelection(text: string, selectedText: string | null) {
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

export function renderMarkdownDocumentPreview(
  markdownSource: string,
  options?: {
    t?: EditorTranslate;
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
  const t = options?.t ?? translate;

  function renderEditableLine(
    lineIndex: number,
    lineText: string,
    className: string,
  ) {
    const descriptor = describeMarkdownLine(lineText);
    const content = descriptor.content;
    const placeholder =
      descriptor.type === "bullet"
        ? t("resumeEditor.listItemPlaceholder")
        : descriptor.type === "quote"
          ? t("resumeEditor.quote")
          : descriptor.type === "h1"
            ? t("resumeEditor.title")
            : descriptor.type === "h2" || descriptor.type === "h3"
              ? t("resumeEditor.headingPlaceholder")
              : t("resumeEditor.writeHerePlaceholder");

    return (
      <div
        aria-label={t("resumeEditor.editableLine", { line: lineIndex + 1 })}
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
            aria-label={t("resumeEditor.addLineAfter", { line: lineIndex + 1 })}
            className="resume-editor-document-preview__handle"
            onClick={() => options?.onAddLine?.(lineIndex)}
            type="button"
          >
            +
          </button>
          <button
            aria-label={t("resumeEditor.previewLineMenu", { line: lineIndex + 1 })}
            className="resume-editor-document-preview__grip"
            onClick={(event) => options?.onToggleLineMenu?.(lineIndex, event.currentTarget)}
            type="button"
          >
            ⋮⋮
          </button>
        </div>
        <div className="resume-editor-document-preview__content">{content}</div>
        {hasReviewSignals ? (
          <div className="resume-editor-document-preview__signals" aria-label={t("resumeEditor.reviewSignalsForLine", { line: lineIndex + 1 })}>
            {lineSignal.commentCount > 0 ? (
              <button
                aria-label={t("resumeEditor.commentThreadsOnLine", { count: lineSignal.commentCount })}
                className="detail-chip detail-chip--interactive detail-chip--accent resume-editor-document-preview__signal"
                data-tooltip={t(lineSignal.commentCount > 1 ? "resumeEditor.commentThreadCountOther" : "resumeEditor.commentThreadCountOne", { count: lineSignal.commentCount })}
                onClick={() => options?.onReviewSignalClick?.("comments", lineIndex)}
                title={t(lineSignal.commentCount > 1 ? "resumeEditor.commentThreadCountOther" : "resumeEditor.commentThreadCountOne", { count: lineSignal.commentCount })}
                type="button"
              >
                C {lineSignal.commentCount}
              </button>
            ) : null}
            {lineSignal.cardCount > 0 ? (
              <button
                aria-label={t("resumeEditor.questionCardsOnLine", { count: lineSignal.cardCount })}
                className="detail-chip detail-chip--interactive detail-chip--neutral resume-editor-document-preview__signal"
                data-tooltip={t(lineSignal.cardCount > 1 ? "resumeEditor.questionCardCountOther" : "resumeEditor.questionCardCountOne", { count: lineSignal.cardCount })}
                onClick={() => options?.onReviewSignalClick?.("question-cards", lineIndex)}
                title={t(lineSignal.cardCount > 1 ? "resumeEditor.questionCardCountOther" : "resumeEditor.questionCardCountOne", { count: lineSignal.cardCount })}
                type="button"
              >
                Q {lineSignal.cardCount}
              </button>
            ) : null}
            {lineSignal.suggestionCount > 0 ? (
              <button
                aria-label={t("resumeEditor.suggestionsOnLine", { count: lineSignal.suggestionCount })}
                className="detail-chip detail-chip--interactive resume-editor-document-preview__signal"
                data-tooltip={t(lineSignal.suggestionCount > 1 ? "resumeEditor.suggestionCountOther" : "resumeEditor.suggestionCountOne", { count: lineSignal.suggestionCount })}
                onClick={() => options?.onReviewSignalClick?.("suggestions", lineIndex)}
                title={t(lineSignal.suggestionCount > 1 ? "resumeEditor.suggestionCountOther" : "resumeEditor.suggestionCountOne", { count: lineSignal.suggestionCount })}
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
