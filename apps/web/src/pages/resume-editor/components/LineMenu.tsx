import type { ResumeEditorController } from "../hooks/useResumeEditorController";

/** Row menu renderers shared by the edit and review surfaces. */
export function createLineMenuRenderers(ctrl: ResumeEditorController) {
  const {
    isKorean,
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
            {isKorean ? "← 뒤로" : "← Back"}
          </button>
          <button
            className="resume-editor-document-preview__menu-item"
            onClick={() => handlePreviewLineAction("heading1", lineIndex, lineText)}
            type="button"
          >
            {isKorean ? "제목 1" : "Heading 1"}
          </button>
          <button
            className="resume-editor-document-preview__menu-item"
            onClick={() => handlePreviewLineAction("heading2", lineIndex, lineText)}
            type="button"
          >
            {isKorean ? "제목 2" : "Heading 2"}
          </button>
          <button
            className="resume-editor-document-preview__menu-item"
            onClick={() => handlePreviewLineAction("bullet", lineIndex, lineText)}
            type="button"
          >
            {isKorean ? "불릿 목록" : "Bulleted list"}
          </button>
          <button
            className="resume-editor-document-preview__menu-item"
            onClick={() => handlePreviewLineAction("quote", lineIndex, lineText)}
            type="button"
          >
            {isKorean ? "인용문" : "Quote"}
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
          {isKorean ? "형식 바꾸기 →" : "Turn into →"}
        </button>
        <button
          className="resume-editor-document-preview__menu-item"
          onClick={() => handlePreviewLineAction("duplicate", lineIndex, lineText)}
          type="button"
        >
          {isKorean ? "복제" : "Duplicate"}
        </button>
        <button
          className="resume-editor-document-preview__menu-item"
          onClick={() => handlePreviewLineAction("comment", lineIndex, lineText)}
          type="button"
        >
          {isKorean ? "댓글" : "Comment"}
        </button>
        <button
          className="resume-editor-document-preview__menu-item"
          onClick={() => handlePreviewLineAction("card", lineIndex, lineText)}
          type="button"
        >
          {isKorean ? "카드 만들기" : "Create card"}
        </button>
        <button
          className="resume-editor-document-preview__menu-item"
          onClick={() => handlePreviewLineAction("rewrite", lineIndex, lineText)}
          type="button"
        >
          {isKorean ? "문장 개선 제안" : "Suggest rewrite"}
        </button>
        <button
          className="resume-editor-document-preview__menu-item"
          onClick={() => handlePreviewLineAction("tools", lineIndex, lineText)}
          type="button"
        >
          {isKorean ? "도구 열기" : "Open tools"}
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
