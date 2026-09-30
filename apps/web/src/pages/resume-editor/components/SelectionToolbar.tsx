import type { EditorControllerProps } from "../editorViewProps";

export function SelectionToolbar({ ctrl }: EditorControllerProps) {
  const {
    t,
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
      <span className="resume-editor-context-toolbar__label">{t("resumeEditor.selectionTools")}</span>
      <div className="filter-chip-row">
        <div className="resume-editor-selection-format">
          <button
            className="detail-chip detail-chip--interactive"
            onClick={() => setIsSelectionFormatOpen((current) => !current)}
            type="button"
          >
            {t("resumeEditor.format")}
          </button>
          {isSelectionFormatOpen ? (
            <div className="resume-editor-selection-format__menu">
              <button
                className="secondary-button"
                onClick={() => applySelectionFormat("bold")}
                type="button"
              >
                {t("resumeEditor.bold")}
              </button>
              <button
                className="secondary-button"
                onClick={() => applySelectionFormat("italic")}
                type="button"
              >
                {t("resumeEditor.italic")}
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
                {t("resumeEditor.turnIntoH1")}
              </button>
              <button
                className="secondary-button"
                onClick={() => applySelectionFormat("heading2")}
                type="button"
              >
                {t("resumeEditor.turnIntoH2")}
              </button>
              <button
                className="secondary-button"
                onClick={() => applySelectionFormat("bullet")}
                type="button"
              >
                {t("resumeEditor.bulletList")}
              </button>
              <button
                className="secondary-button"
                onClick={() => applySelectionFormat("quote")}
                type="button"
              >
                {t("resumeEditor.quote")}
              </button>
            </div>
          ) : null}
        </div>
        <button
          className="detail-chip detail-chip--interactive"
          onClick={() => openInlineComposer("comment")}
          type="button"
        >
          {t("resumeEditor.comment")}
        </button>
        <button
          className="detail-chip detail-chip--interactive"
          onClick={() => {
            void runInlineQuestionSuggestions();
          }}
          type="button"
        >
          {t("resumeEditor.question")}
        </button>
        <button
          className="detail-chip detail-chip--interactive"
          onClick={() => {
            void runInlineRewriteSuggestions();
          }}
          type="button"
        >
          {t("resumeEditor.rewrite")}
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
          {t("resumeEditor.clear")}
        </button>
      </div>
    </div>
  );
}
