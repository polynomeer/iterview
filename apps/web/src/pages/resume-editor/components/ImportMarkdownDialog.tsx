import type { EditorViewProps } from "../editorViewProps";

export function ImportMarkdownDialog({ ctrl, workspace }: EditorViewProps) {
  const {
    t,
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
        <span className="page-card__label">{t("resumeEditor.markdownImport")}</span>
        <h2 className="page-card__title">
          {t("resumeEditor.importMarkdownIntoDraftWorkspace")}
        </h2>
        <p className="resume-tailor-muted">
          {t("resumeEditor.importMarkdownHint")}
        </p>
        <label className="form-field">
          <span className="form-field__label">{t("resumeEditor.markdownSource")}</span>
          <textarea
            className="form-field__input form-input--textarea"
            onChange={(event) => setImportMarkdownSource(event.target.value)}
            rows={12}
            value={importMarkdownSource}
          />
        </label>
        <label className="form-field form-field--checkbox">
          <span className="form-field__label">{t("resumeEditor.replaceExistingDocument")}</span>
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
            {t("resumeEditor.cancel")}
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
              ? t("resumeEditor.importing")
              : t("resumeEditor.importMarkdown")}
          </button>
        </div>
      </section>
    </div>
  );
}
