import type { EditorControllerProps } from "../editorViewProps";

export function SelectionToolbar({ ctrl }: EditorControllerProps) {
  const {
    isKorean,
    setSelectedMarkdownRange,
    setInlineSuggestionPreview,
    setInlineComposerMode,
    runInlineQuestionSuggestions,
    runInlineRewriteSuggestions,
    openInlineComposer,
    editorToolbarPosition,
    isSelectionFormatOpen,
    setIsSelectionFormatOpen,
    applySelectionFormat,
  } = ctrl;

  // The edit tab only mounts this toolbar once a position has been measured.
  if (!editorToolbarPosition) {
    return null;
  }

  return (
    <div
      className="resume-editor-context-toolbar"
      style={{
        left: `${editorToolbarPosition.left}px`,
        top: `${editorToolbarPosition.top}px`,
      }}
    >
      <span className="resume-editor-context-toolbar__label">{isKorean ? "선택 도구" : "Selection tools"}</span>
      <div className="filter-chip-row">
        <div className="resume-editor-selection-format">
          <button
            className="detail-chip detail-chip--interactive"
            onClick={() => setIsSelectionFormatOpen((current) => !current)}
            type="button"
          >
            {isKorean ? "서식" : "Format"}
          </button>
          {isSelectionFormatOpen ? (
            <div className="resume-editor-selection-format__menu">
              <button
                className="secondary-button"
                onClick={() => applySelectionFormat("bold")}
                type="button"
              >
                {isKorean ? "굵게" : "Bold"}
              </button>
              <button
                className="secondary-button"
                onClick={() => applySelectionFormat("italic")}
                type="button"
              >
                {isKorean ? "기울임" : "Italic"}
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
                {isKorean ? "H1로 변경" : "Turn into H1"}
              </button>
              <button
                className="secondary-button"
                onClick={() => applySelectionFormat("heading2")}
                type="button"
              >
                {isKorean ? "H2로 변경" : "Turn into H2"}
              </button>
              <button
                className="secondary-button"
                onClick={() => applySelectionFormat("bullet")}
                type="button"
              >
                {isKorean ? "불릿 목록" : "Bullet list"}
              </button>
              <button
                className="secondary-button"
                onClick={() => applySelectionFormat("quote")}
                type="button"
              >
                {isKorean ? "인용문" : "Quote"}
              </button>
            </div>
          ) : null}
        </div>
        <button
          className="detail-chip detail-chip--interactive"
          onClick={() => openInlineComposer("comment")}
          type="button"
        >
          {isKorean ? "댓글" : "Comment"}
        </button>
        <button
          className="detail-chip detail-chip--interactive"
          onClick={() => {
            void runInlineQuestionSuggestions();
          }}
          type="button"
        >
          {isKorean ? "질문" : "Question"}
        </button>
        <button
          className="detail-chip detail-chip--interactive"
          onClick={() => {
            void runInlineRewriteSuggestions();
          }}
          type="button"
        >
          {isKorean ? "개선" : "Rewrite"}
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
          {isKorean ? "지우기" : "Clear"}
        </button>
      </div>
    </div>
  );
}
