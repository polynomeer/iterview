import type { KeyboardEvent } from "react";
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
    currentCursorLineIndex,
    focusLineInEditor,
  } = ctrl;

  // Keyboard users reach the toolbar with Alt+F10 (or Shift+Tab) from the line. Escape returns to
  // the line, and so does any action that leaves focus nowhere, such as applying bold.
  function returnToLine() {
    if (currentCursorLineIndex !== null) {
      focusLineInEditor(currentCursorLineIndex);
    }
  }

  function thenReturnIfFocusDropped(action: () => void) {
    return () => {
      action();
      window.requestAnimationFrame(() => {
        if (!document.activeElement || document.activeElement === document.body) {
          returnToLine();
        }
      });
    };
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      setIsSelectionFormatOpen(false);
      returnToLine();
    }
  }

  // The edit tab only mounts this toolbar once a position has been measured.
  if (!editorToolbarPosition) {
    return null;
  }

  return (
    <div
      aria-labelledby="resume-editor-selection-tools-label"
      className="resume-editor-context-toolbar"
      onKeyDown={onKeyDown}
      role="toolbar"
      style={{
        left: `${editorToolbarPosition.left}px`,
        top: `${editorToolbarPosition.top}px`,
      }}
    >
      <span className="resume-editor-context-toolbar__label" id="resume-editor-selection-tools-label">{t("resumeEditor.selectionTools")}</span>
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
                onClick={thenReturnIfFocusDropped(() => applySelectionFormat("bold"))}
                size="sm"
                variant="ghost"
              >
                {t("resumeEditor.bold")}
              </Button>
              <Button
                onClick={thenReturnIfFocusDropped(() => applySelectionFormat("italic"))}
                size="sm"
                variant="ghost"
              >
                {t("resumeEditor.italic")}
              </Button>
              <Button
                onClick={thenReturnIfFocusDropped(() => applySelectionFormat("code"))}
                size="sm"
                variant="ghost"
              >
                {t("resumeEditor.code")}
              </Button>
              <Button
                onClick={thenReturnIfFocusDropped(() => applySelectionFormat("heading1"))}
                size="sm"
                variant="ghost"
              >
                {t("resumeEditor.turnIntoH1")}
              </Button>
              <Button
                onClick={thenReturnIfFocusDropped(() => applySelectionFormat("heading2"))}
                size="sm"
                variant="ghost"
              >
                {t("resumeEditor.turnIntoH2")}
              </Button>
              <Button
                onClick={thenReturnIfFocusDropped(() => applySelectionFormat("bullet"))}
                size="sm"
                variant="ghost"
              >
                {t("resumeEditor.bulletList")}
              </Button>
              <Button
                onClick={thenReturnIfFocusDropped(() => applySelectionFormat("quote"))}
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
          onClick={thenReturnIfFocusDropped(() => {
            setSelectedMarkdownRange(null);
            setInlineSuggestionPreview(null);
            setInlineComposerMode(null);
          })}
          size="sm"
          variant="ghost"
        >
          {t("resumeEditor.clear")}
        </Button>
      </div>
    </div>
  );
}
