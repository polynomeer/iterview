import { getErrorDetails, userFacingErrorMessage } from "../../shared/api/errors";
import { Button, ErrorState, PageSkeleton } from "../../shared/ui/primitives";
import "./legacy-editor.css";
import "./editor.css";
import { EditorHeader } from "./components/EditorHeader";
import { ImportMarkdownDialog } from "./components/ImportMarkdownDialog";
import { MergePreviewPanel } from "./components/MergePreviewPanel";
import { DocumentWorkspace } from "./components/tabs/DocumentWorkspace";
import { HeatmapTab } from "./components/tabs/HeatmapTab";
import { HistoryTab } from "./components/tabs/HistoryTab";
import { PrintPreviewTab } from "./components/tabs/PrintPreviewTab";
import { useResumeEditorController } from "./hooks/useResumeEditorController";

export function ResumeEditorPage() {
  const ctrl = useResumeEditorController();
  const {
    t,
    currentTab,
    workspaceQuery,
    updateDocumentMutation,
    importMarkdownMutation,
    mergePreviewMessage,
    saveCurrentDraft,
    importMarkdownOpen,
  } = ctrl;

  if (workspaceQuery.isLoading) {
    return <PageSkeleton label={t("resumeEditor.preparingEvidenceEditor")} />;
  }

  if (workspaceQuery.isError || !workspaceQuery.data) {
    return (
      <ErrorState
        actions={
          <Button onClick={() => void workspaceQuery.refetch()} variant="primary">
            {t("resumeEditor.tryAgain")}
          </Button>
        }
        body={userFacingErrorMessage(workspaceQuery.error, t("resumeEditor.resumeEditorCouldNotBeLoaded"))}
        details={getErrorDetails(workspaceQuery.error)}
        title={t("resumeEditor.unableToOpenEditor")}
      />
    );
  }

  const workspace = workspaceQuery.data;
  const saving = updateDocumentMutation.isPending || importMarkdownMutation.isPending;

  // Rendered inside the resume hub, which owns the page h1, the version bar, and the tab to the pressure map.
  return (
    <section aria-label={t("resumeEditor.evidenceEditor")} className="page-container page-container--hidden">
      <div className="resume-editor-toolbar">
        <span className="resume-editor-toolbar__file">{workspace.sourceFileName}</span>
        <Button loading={saving} onClick={() => void saveCurrentDraft("manual_edit")} variant="primary">
          {t("resumeEditor.saveDraft")}
        </Button>
      </div>
      <div className="page-stack">
        <EditorHeader ctrl={ctrl} workspace={workspace} />

        {importMarkdownOpen ? <ImportMarkdownDialog ctrl={ctrl} workspace={workspace} /> : null}

        {mergePreviewMessage ? <MergePreviewPanel ctrl={ctrl} workspace={workspace} /> : null}

        {currentTab === "edit" || currentTab === "review" ? (
          <DocumentWorkspace ctrl={ctrl} workspace={workspace} />
        ) : null}

        {currentTab === "heatmap" ? <HeatmapTab ctrl={ctrl} workspace={workspace} /> : null}

        {currentTab === "print-preview" ? <PrintPreviewTab ctrl={ctrl} /> : null}

        {currentTab === "history" ? <HistoryTab ctrl={ctrl} /> : null}
      </div>
    </section>
  );
}
