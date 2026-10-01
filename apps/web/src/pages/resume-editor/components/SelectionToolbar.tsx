import { Button } from "../../../shared/ui/primitives";
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
      <div className="editor-chips">
        <div className="resume-editor-selection-format">
          <Button
            aria-expanded={isSelectionFormatOpen}
            onClick={() => setIsSelectionFormatOpen((current) => !current)}
            size="sm"
            variant={isSelectionFormatOpen ? "primary" : "ghost"}
          >
            {t("resumeEditor.format")}
          </Button>
          {isSelectionFormatOpen ? (
            <div className="resume-editor-selection-format__menu">
              <Button
                onClick={() => applySelectionFormat("bold")}
                size="sm"
                variant="ghost"
              >
                {t("resumeEditor.bold")}
              </Button>
              <Button
                onClick={() => applySelectionFormat("italic")}
                size="sm"
                variant="ghost"
              >
                {t("resumeEditor.italic")}
              </Button>
              <Button
                onClick={() => applySelectionFormat("code")}
                size="sm"
                variant="ghost"
              >
                Code
              </Button>
              <Button
                onClick={() => applySelectionFormat("heading1")}
                size="sm"
                variant="ghost"
              >
                {t("resumeEditor.turnIntoH1")}
              </Button>
              <Button
                onClick={() => applySelectionFormat("heading2")}
                size="sm"
                variant="ghost"
              >
                {t("resumeEditor.turnIntoH2")}
              </Button>
              <Button
                onClick={() => applySelectionFormat("bullet")}
                size="sm"
                variant="ghost"
              >
                {t("resumeEditor.bulletList")}
              </Button>
              <Button
                onClick={() => applySelectionFormat("quote")}
                size="sm"
                variant="ghost"
              >
                {t("resumeEditor.quote")}
              </Button>
            </div>
          ) : null}
        </div>
        <Button
          onClick={() => openInlineComposer("comment")}
          size="sm"
          variant="ghost"
        >
          {t("resumeEditor.comment")}
        </Button>
        <Button
          onClick={() => {
            void runInlineQuestionSuggestions();
          }}
          size="sm"
          variant="ghost"
        >
          {t("resumeEditor.question")}
        </Button>
        <Button
          onClick={() => {
            void runInlineRewriteSuggestions();
          }}
          size="sm"
          variant="ghost"
        >
          {t("resumeEditor.rewrite")}
        </Button>
        <Button
          onClick={() => {
            setSelectedMarkdownRange(null);
            setInlineSuggestionPreview(null);
            setInlineComposerMode(null);
          }}
          size="sm"
          variant="ghost"
        >
          {t("resumeEditor.clear")}
        </Button>
      </div>
    </div>
  );
}
