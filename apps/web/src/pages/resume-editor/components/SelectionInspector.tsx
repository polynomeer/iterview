import type { EditorControllerProps } from "../editorViewProps";

/** The text the next comment, question card, or rewrite will attach to. */
export function SelectionInspector({ ctrl }: EditorControllerProps) {
  const { t, currentTab, effectiveSelectedText } = ctrl;

  if (!effectiveSelectedText) {
    return null;
  }

  return (
    <div className="editor-inset resume-editor-selection">
      <p className="editor-text">{t("resumeEditor.currentExcerpt", { text: effectiveSelectedText })}</p>
      {currentTab !== "review" ? <p className="editor-muted">{t("resumeEditor.selectionAttachHint")}</p> : null}
    </div>
  );
}
