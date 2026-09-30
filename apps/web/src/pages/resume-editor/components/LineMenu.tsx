import type { ResumeEditorController } from "../hooks/useResumeEditorController";

/** Row menu renderers shared by the edit and review surfaces. */
export function createLineMenuRenderers(ctrl: ResumeEditorController) {
  const {
    t,
    markdownSource,
    activePreviewLineIndex,
    activePreviewLineMenuView,
    setActivePreviewLineMenuView,
    previewLineMenuPosition,
    handlePreviewLineAction,
  } = ctrl;

  function renderLineMenu(lineIndex: number, lineText: string) {
    if (activePreviewLineMenuView === "turn-into") {
      return (
        <div className="resume-editor-document-preview__menu-list">
          <button
            className="resume-editor-document-preview__menu-item"
            onClick={() => setActivePreviewLineMenuView("root")}
            type="button"
          >
            {t("resumeEditor.back")}
          </button>
          <button
            className="resume-editor-document-preview__menu-item"
            onClick={() => handlePreviewLineAction("heading1", lineIndex, lineText)}
            type="button"
          >
            {t("resumeEditor.heading1")}
          </button>
          <button
            className="resume-editor-document-preview__menu-item"
            onClick={() => handlePreviewLineAction("heading2", lineIndex, lineText)}
            type="button"
          >
            {t("resumeEditor.heading2")}
          </button>
          <button
            className="resume-editor-document-preview__menu-item"
            onClick={() => handlePreviewLineAction("bullet", lineIndex, lineText)}
            type="button"
          >
            {t("resumeEditor.bulletedList")}
          </button>
          <button
            className="resume-editor-document-preview__menu-item"
            onClick={() => handlePreviewLineAction("quote", lineIndex, lineText)}
            type="button"
          >
            {t("resumeEditor.quote")}
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
          {t("resumeEditor.turnInto")}
        </button>
        <button
          className="resume-editor-document-preview__menu-item"
          onClick={() => handlePreviewLineAction("duplicate", lineIndex, lineText)}
          type="button"
        >
          {t("resumeEditor.duplicate")}
        </button>
        <button
          className="resume-editor-document-preview__menu-item"
          onClick={() => handlePreviewLineAction("comment", lineIndex, lineText)}
          type="button"
        >
          {t("resumeEditor.comment")}
        </button>
        <button
          className="resume-editor-document-preview__menu-item"
          onClick={() => handlePreviewLineAction("card", lineIndex, lineText)}
          type="button"
        >
          {t("resumeEditor.createCard")}
        </button>
        <button
          className="resume-editor-document-preview__menu-item"
          onClick={() => handlePreviewLineAction("rewrite", lineIndex, lineText)}
          type="button"
        >
          {t("resumeEditor.suggestRewrite")}
        </button>
        <button
          className="resume-editor-document-preview__menu-item"
          onClick={() => handlePreviewLineAction("tools", lineIndex, lineText)}
          type="button"
        >
          {t("resumeEditor.openTools")}
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

  return { renderLineMenu, renderFloatingLineMenu };
}
