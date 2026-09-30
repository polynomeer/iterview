import type { EditorViewProps } from "../editorViewProps";

export function ImportMarkdownDialog({ ctrl, workspace }: EditorViewProps) {
  const {
    isKorean,
    importMarkdownMutation,
    markdownSource,
    setImportMarkdownOpen,
    importMarkdownSource,
    setImportMarkdownSource,
    replaceDocument,
    setReplaceDocument,
  } = ctrl;

  return (
    <div
      aria-modal="true"
      className="resume-editor-import-modal"
      onClick={() => {
        if (!importMarkdownMutation.isPending) {
          setImportMarkdownOpen(false);
        }
      }}
      role="dialog"
    >
      <section
        className="page-card resume-editor-import-modal__surface"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <span className="page-card__label">{isKorean ? "마크다운 가져오기" : "Markdown import"}</span>
        <h2 className="page-card__title">
          {isKorean ? "마크다운을 초안 작업공간으로 가져오기" : "Import markdown into the draft workspace"}
        </h2>
        <p className="resume-tailor-muted">
          {isKorean
            ? "큰 문서 구조를 교체하거나 덧붙일 때만 마크다운을 붙여 넣으세요. 일상적인 수정은 작성 화면에서 처리하는 편이 좋습니다."
            : "Paste markdown only when you want to replace or append larger document structure. Day-to-day edits should stay in the writing surface."}
        </p>
        <label className="form-field">
          <span className="form-field__label">{isKorean ? "마크다운 원문" : "Markdown source"}</span>
          <textarea
            className="form-field__input form-input--textarea"
            onChange={(event) => setImportMarkdownSource(event.target.value)}
            rows={12}
            value={importMarkdownSource}
          />
        </label>
        <label className="form-field form-field--checkbox">
          <span className="form-field__label">{isKorean ? "기존 문서 교체" : "Replace existing document"}</span>
          <input
            checked={replaceDocument}
            onChange={(event) => setReplaceDocument(event.target.checked)}
            type="checkbox"
          />
        </label>
        <div className="page-card__actions">
          <button
            className="secondary-button"
            disabled={importMarkdownMutation.isPending}
            onClick={() => setImportMarkdownOpen(false)}
            type="button"
          >
            {isKorean ? "취소" : "Cancel"}
          </button>
          <button
            className="primary-button"
            disabled={importMarkdownMutation.isPending || !importMarkdownSource.trim()}
            onClick={() => {
              void importMarkdownMutation.mutateAsync({
                markdownSource: importMarkdownSource,
                replaceDocument,
                baseRevisionNo: workspace.revisionNo,
                changeSource: "markdown_import",
              });
              setImportMarkdownOpen(false);
            }}
            type="button"
          >
            {importMarkdownMutation.isPending
              ? isKorean
                ? "가져오는 중..."
                : "Importing..."
              : isKorean
                ? "마크다운 가져오기"
                : "Import markdown"}
          </button>
        </div>
      </section>
    </div>
  );
}
