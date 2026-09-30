import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import type { EditableBlock, ReviewLineSignal, ReviewSignalType } from "../editorTypes";
import { decodeSoftBreaks, describeMarkdownLine } from "../editorUtils";

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
    isKorean?: boolean;
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
        ? options?.isKorean
          ? "목록 항목"
          : "List item"
        : descriptor.type === "quote"
          ? options?.isKorean
            ? "인용문"
            : "Quote"
          : descriptor.type === "h1"
            ? options?.isKorean
              ? "제목"
              : "Title"
            : descriptor.type === "h2" || descriptor.type === "h3"
              ? options?.isKorean
                ? "헤딩"
                : "Heading"
              : options?.isKorean
                ? "여기에 작성"
                : "Write here";

    return (
      <div
        aria-label={options?.isKorean ? `편집 가능한 줄 ${lineIndex + 1}` : `Editable line ${lineIndex + 1}`}
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
            aria-label={options?.isKorean ? `${lineIndex + 1}번 줄 다음에 줄 추가` : `Add line after ${lineIndex + 1}`}
            className="resume-editor-document-preview__handle"
            onClick={() => options?.onAddLine?.(lineIndex)}
            type="button"
          >
            +
          </button>
          <button
            aria-label={options?.isKorean ? `${lineIndex + 1}번 줄 메뉴` : `Preview line menu ${lineIndex + 1}`}
            className="resume-editor-document-preview__grip"
            onClick={(event) => options?.onToggleLineMenu?.(lineIndex, event.currentTarget)}
            type="button"
          >
            ⋮⋮
          </button>
        </div>
        <div className="resume-editor-document-preview__content">{content}</div>
        {hasReviewSignals ? (
          <div className="resume-editor-document-preview__signals" aria-label={options?.isKorean ? `검토 신호 ${lineIndex + 1}` : `Review signals ${lineIndex + 1}`}>
            {lineSignal.commentCount > 0 ? (
              <button
                aria-label={options?.isKorean ? `이 줄의 댓글 스레드 ${lineSignal.commentCount}개` : `${lineSignal.commentCount} comment threads on this line`}
                className="detail-chip detail-chip--interactive detail-chip--accent resume-editor-document-preview__signal"
                data-tooltip={options?.isKorean ? `댓글 스레드 ${lineSignal.commentCount}개` : `${lineSignal.commentCount} comment thread${lineSignal.commentCount > 1 ? "s" : ""}`}
                onClick={() => options?.onReviewSignalClick?.("comments", lineIndex)}
                title={options?.isKorean ? `댓글 스레드 ${lineSignal.commentCount}개` : `${lineSignal.commentCount} comment thread${lineSignal.commentCount > 1 ? "s" : ""}`}
                type="button"
              >
                C {lineSignal.commentCount}
              </button>
            ) : null}
            {lineSignal.cardCount > 0 ? (
              <button
                aria-label={options?.isKorean ? `이 줄의 질문 카드 ${lineSignal.cardCount}개` : `${lineSignal.cardCount} question cards on this line`}
                className="detail-chip detail-chip--interactive detail-chip--neutral resume-editor-document-preview__signal"
                data-tooltip={options?.isKorean ? `질문 카드 ${lineSignal.cardCount}개` : `${lineSignal.cardCount} question card${lineSignal.cardCount > 1 ? "s" : ""}`}
                onClick={() => options?.onReviewSignalClick?.("question-cards", lineIndex)}
                title={options?.isKorean ? `질문 카드 ${lineSignal.cardCount}개` : `${lineSignal.cardCount} question card${lineSignal.cardCount > 1 ? "s" : ""}`}
                type="button"
              >
                Q {lineSignal.cardCount}
              </button>
            ) : null}
            {lineSignal.suggestionCount > 0 ? (
              <button
                aria-label={options?.isKorean ? `이 줄에 연결된 제안 ${lineSignal.suggestionCount}개` : `${lineSignal.suggestionCount} suggestions linked to this line`}
                className="detail-chip detail-chip--interactive resume-editor-document-preview__signal"
                data-tooltip={options?.isKorean ? `제안 ${lineSignal.suggestionCount}개` : `${lineSignal.suggestionCount} suggestion${lineSignal.suggestionCount > 1 ? "s" : ""}`}
                onClick={() => options?.onReviewSignalClick?.("suggestions", lineIndex)}
                title={options?.isKorean ? `제안 ${lineSignal.suggestionCount}개` : `${lineSignal.suggestionCount} suggestion${lineSignal.suggestionCount > 1 ? "s" : ""}`}
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
