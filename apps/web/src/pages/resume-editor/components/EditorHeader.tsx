import { routeConfig } from "../../../shared/config/routes";
import { Badge, Button, ButtonLink, Segmented } from "../../../shared/ui/primitives";
import type { EditorTab } from "../editorTypes";
import type { EditorViewProps } from "../editorViewProps";

/** One toolbar: back to the claim form, the draft's revision, the view switch, and save. */
export function EditorHeader({ ctrl, workspace, saving }: EditorViewProps & { saving: boolean }) {
  const {
    t,
    safeVersionId,
    currentTab,
    updateTab,
    saveMessage,
    saveCurrentDraft,
    setImportMarkdownOpen,
    isWorkspaceMenuOpen,
    setIsWorkspaceMenuOpen,
  } = ctrl;
  const views: Array<{ id: EditorTab; label: string }> = [
    { id: "edit", label: t("resumeEditor.edit") },
    { id: "review", label: t("resumeEditor.review") },
    { id: "heatmap", label: t("resumeEditor.heatmap") },
    { id: "print-preview", label: t("resumeEditor.printPreview") },
    { id: "history", label: t("resumeEditor.history") },
  ];

  return (
    <header className="editor-toolbar">
      <div className="editor-toolbar__row">
        <ButtonLink size="sm" to={routeConfig.resumeEditor.buildPath({ versionId: safeVersionId })} variant="ghost">
          {t("resumeClaims.backToClaims")}
        </ButtonLink>
        <span className="editor-toolbar__file">{workspace.sourceFileName}</span>
        <Badge tone="accent">{t("resumeEditor.revisionLabel", { revisionNo: workspace.revisionNo })}</Badge>
        <span className="editor-toolbar__spacer" />
        <div className="editor-menu-anchor">
          <Button aria-expanded={isWorkspaceMenuOpen} aria-haspopup="menu" onClick={() => setIsWorkspaceMenuOpen((current) => !current)} size="sm" variant="ghost">
            {t("resumeEditor.moreActions")}
          </Button>
          {isWorkspaceMenuOpen ? (
            <div className="editor-menu editor-menu--end" role="menu">
              <button
                className="editor-menu__item"
                onClick={() => {
                  setImportMarkdownOpen(true);
                  setIsWorkspaceMenuOpen(false);
                }}
                role="menuitem"
                type="button"
              >
                {t("resumeEditor.importMarkdown")}
              </button>
            </div>
          ) : null}
        </div>
        <Button loading={saving} onClick={() => void saveCurrentDraft("manual_edit")} size="sm" variant="primary">
          {t("resumeEditor.saveDraft")}
        </Button>
      </div>
      <div className="editor-toolbar__views">
        <Segmented items={views} label={t("resumeEditor.views")} onChange={updateTab} value={currentTab} />
        {saveMessage ? (
          <p aria-live="polite" className="editor-muted">
            {saveMessage}
          </p>
        ) : null}
      </div>
    </header>
  );
}
