import { Button, Dialog, Field, Textarea } from "../../../shared/ui/primitives";
import type { EditorViewProps } from "../editorViewProps";

export function ImportMarkdownDialog({ ctrl, workspace }: EditorViewProps) {
  const {
    t,
    importMarkdownMutation,
    setImportMarkdownOpen,
    importMarkdownSource,
    setImportMarkdownSource,
    replaceDocument,
    setReplaceDocument,
  } = ctrl;

  const close = () => {
    if (!importMarkdownMutation.isPending) {
      setImportMarkdownOpen(false);
    }
  };

  return (
    <Dialog
      closeLabel={t("resumeEditor.close")}
      footer={
        <>
          <Button disabled={importMarkdownMutation.isPending} onClick={() => setImportMarkdownOpen(false)} size="sm">
            {t("resumeEditor.cancel")}
          </Button>
          <Button
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
            size="sm"
            variant="primary"
          >
            {importMarkdownMutation.isPending
              ? t("resumeEditor.importing")
              : t("resumeEditor.importMarkdown")}
          </Button>
        </>
      }
      onClose={close}
      open
      size="lg"
      title={t("resumeEditor.importMarkdown")}
    >
      <Field label={t("resumeEditor.markdownSource")}>
        {(control) => (
          <Textarea
            {...control}
            onChange={(event) => setImportMarkdownSource(event.target.value)}
            rows={12}
            value={importMarkdownSource}
          />
        )}
      </Field>
      <label className="editor-actions">
        <input
          checked={replaceDocument}
          onChange={(event) => setReplaceDocument(event.target.checked)}
          type="checkbox"
        />
        <span>{t("resumeEditor.replaceExistingDocument")}</span>
      </label>
    </Dialog>
  );
}
