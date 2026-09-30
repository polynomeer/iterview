import { renderAnnotatedText } from "./markdownPreview";
import type { EditorControllerProps } from "../editorViewProps";

export function SelectionInspector({ ctrl }: EditorControllerProps) {
  const {
    isKorean,
    currentTab,
    selectedMarkdownRange,
    selectedBlock,
    effectiveSelectedText,
    currentSelectionAnchor,
  } = ctrl;

  return (
    <div className="resume-editor-selection">
      <span className="detail-chip">
        {selectedMarkdownRange
          ? isKorean
            ? `마크다운 선택 · ${selectedMarkdownRange.startOffset}-${selectedMarkdownRange.endOffset}`
            : `Markdown selection · ${selectedMarkdownRange.startOffset}-${selectedMarkdownRange.endOffset}`
          : isKorean
            ? "선택된 텍스트 범위 없음"
            : "No text range selected"}
      </span>
      <p className="resume-tailor-muted">
        {effectiveSelectedText
          ? isKorean
            ? `현재 발췌: ${effectiveSelectedText}`
            : `Current excerpt: ${effectiveSelectedText}`
          : currentTab === "review"
            ? isKorean
              ? "리뷰 메모를 남기기 전에 읽기 화면이나 폴백 앵커로 문장 하나에 먼저 초점을 맞추세요."
              : "Use the reading surface or fallback anchors to focus a sentence before leaving review notes."
            : isKorean
              ? "댓글, 질문 카드, AI 제안을 더 정확히 연결하려면 마크다운 텍스트를 선택하거나 아래 블록을 클릭하세요."
              : "Select markdown text or click a block below to anchor comments, question cards, and AI suggestions more precisely."}
      </p>
      {effectiveSelectedText && currentTab !== "review" ? (
        <p className="resume-tailor-muted">
          {isKorean
            ? "댓글, 질문 카드, 문장 개선 제안이 현재 선택 영역에 연결됩니다."
            : "Comments, question cards, and rewrite suggestions will attach to the current selection."}
        </p>
      ) : null}
      {currentSelectionAnchor?.nodeId ? (
        <div className="filter-chip-row">
          <span className="detail-chip">{isKorean ? "노드" : "Node"} {currentSelectionAnchor.nodeId}</span>
          {currentSelectionAnchor.fieldPath ? (
            <span className="detail-chip">{currentSelectionAnchor.fieldPath}</span>
          ) : null}
        </div>
      ) : null}
      {selectedBlock ? (
        <article className="page-card page-card--muted resume-editor-annotated-text">
          <p className="section-heading__eyebrow">{isKorean ? "주석 프리뷰" : "Annotated preview"}</p>
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
  );
}
