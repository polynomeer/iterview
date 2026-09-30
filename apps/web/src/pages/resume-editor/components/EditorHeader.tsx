import { MetricCard } from "../../../shared/ui/MetricCard";
import { formatSupportedViewModeLabel } from "../editorUtils";
import type { EditorViewProps } from "../editorViewProps";

export function EditorHeader({ ctrl, workspace }: EditorViewProps) {
  const {
    t,
    currentTab,
    primaryTabs,
    secondaryTabs,
    isSecondaryTabActive,
    updateTab,
    saveMessage,
    setImportMarkdownOpen,
    isWorkspaceInfoOpen,
    setIsWorkspaceInfoOpen,
    isWorkspaceMenuOpen,
    setIsWorkspaceMenuOpen,
    isViewMenuOpen,
    setIsViewMenuOpen,
  } = ctrl;

  return (
    <section className="page-card resume-editor-topbar">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">{t("resumeEditor.authoringControls")}</p>
          <h2 className="page-card__title">
            {t("resumeEditor.authoringControlsTitle")}
          </h2>
        </div>
        <div className="page-card__actions">
          <span className="question-status-badge question-status-badge--accent">
            {t("resumeEditor.revisionLabel", { revisionNo: workspace.revisionNo })}
          </span>
          <span className="question-status-badge question-status-badge--neutral">
            {workspace.workspaceStatusLabel}
          </span>
          <div className="resume-editor-topbar__menu">
            <button
              aria-expanded={isWorkspaceMenuOpen}
              className="secondary-button"
              onClick={() => setIsWorkspaceMenuOpen((current) => !current)}
              type="button"
            >
              {t("resumeEditor.moreActions")}
            </button>
            {isWorkspaceMenuOpen ? (
              <div className="resume-editor-topbar__menu-popover" role="menu">
                <button
                  className="resume-editor-topbar__menu-item"
                  onClick={() => {
                    setIsWorkspaceInfoOpen((current) => !current);
                    setIsWorkspaceMenuOpen(false);
                  }}
                  type="button"
                >
                  {isWorkspaceInfoOpen
                    ? t("resumeEditor.hideWorkspaceInfo")
                    : t("resumeEditor.workspaceInfo")}
                </button>
                <button
                  className="resume-editor-topbar__menu-item"
                  onClick={() => {
                    setImportMarkdownOpen(true);
                    setIsWorkspaceMenuOpen(false);
                  }}
                  type="button"
                >
                  {t("resumeEditor.importMarkdown")}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <p className="resume-tailor-muted">
        {t("resumeEditor.authoringControlsHint")}
      </p>
      {saveMessage ? <p className="resume-tailor-muted">{saveMessage}</p> : null}
      <div className="filter-chip-row resume-editor-tabbar">
        {primaryTabs.map((tab) => (
          <button
            className={`detail-chip detail-chip--interactive ${currentTab === tab ? "detail-chip--active" : ""}`}
            key={tab}
            onClick={() => {
              updateTab(tab);
              setIsViewMenuOpen(false);
            }}
            type="button"
          >
            {tab === "edit" ? (t("resumeEditor.edit")) : t("resumeEditor.review")}
          </button>
        ))}
        <div className="resume-editor-topbar__menu">
          <button
            aria-expanded={isViewMenuOpen}
            className={`detail-chip detail-chip--interactive ${isSecondaryTabActive || isViewMenuOpen ? "detail-chip--active" : ""}`}
            onClick={() => setIsViewMenuOpen((current) => !current)}
            type="button"
          >
            {t("resumeEditor.views")}
          </button>
          {isViewMenuOpen ? (
            <div className="resume-editor-topbar__menu-popover" role="menu">
              {secondaryTabs.map((tab) => (
                <button
                  className="resume-editor-topbar__menu-item"
                  key={tab}
                  onClick={() => {
                    updateTab(tab);
                    setIsViewMenuOpen(false);
                  }}
                  type="button"
                >
                  {tab === "heatmap"
                    ? t("resumeEditor.heatmap")
                    : tab === "print-preview"
                      ? t("resumeEditor.printPreview")
                      : t("resumeEditor.history")}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        {isSecondaryTabActive ? (
          <span className="detail-chip">
            {currentTab === "heatmap"
              ? t("resumeEditor.heatmap")
              : currentTab === "print-preview"
                ? t("resumeEditor.printPreview")
                : t("resumeEditor.history")}
          </span>
        ) : null}
      </div>
      {currentTab === "edit" || currentTab === "review" ? (
        <p className="resume-tailor-muted">
          {t("resumeEditor.selectSmallestClaimHint")}
        </p>
      ) : null}
      {isWorkspaceInfoOpen ? (
        <div className="page-card page-card--muted resume-editor-workspace-info">
          <div className="stats-grid">
            <MetricCard label={t("resumeEditor.blocks")} value={String(workspace.document.blocks.length)} />
            <MetricCard label={t("resumeEditor.nodes")} tone="accent" value={String(workspace.document.nodes.length)} />
            <MetricCard label={t("resumeEditor.comments")} tone="accent" value={String(workspace.commentSummary.totalCount)} />
            <MetricCard label={t("resumeEditor.questionCards")} tone="muted" value={String(workspace.questionCardSummary.totalCount)} />
            <MetricCard label={t("resumeEditor.presence")} tone="muted" value={String(workspace.activePresence.length)} />
          </div>
          <div className="filter-chip-row">
            <span className="detail-chip">
              {t("resumeEditor.model")}{" "}
              {workspace.documentModel === "rich_tree"
                ? t("resumeEditor.richTree")
                : t("resumeEditor.blocks")}
            </span>
            {workspace.selectionCapabilities.supportsOperations ? (
              <span className="detail-chip">{t("resumeEditor.operationsEnabled")}</span>
            ) : null}
            {workspace.selectionCapabilities.supportsInlineSelections ? (
              <span className="detail-chip">{t("resumeEditor.inlineSelectionsEnabled")}</span>
            ) : null}
            {workspace.supportedViewModes.length > 0 ? (
              <span className="detail-chip">
                {t("resumeEditor.modes")}{" "}
                {workspace.supportedViewModes
                  .map((mode) => formatSupportedViewModeLabel(mode, t))
                  .join(", ")}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
