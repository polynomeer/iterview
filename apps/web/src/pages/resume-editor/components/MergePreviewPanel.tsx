import { MetricCard } from "../../../shared/ui/MetricCard";
import { mapEditableBlocks } from "../editorUtils";
import type { EditorViewProps } from "../editorViewProps";

export function MergePreviewPanel({ ctrl, workspace }: EditorViewProps) {
  const {
    t,
    resolveConflictBlock,
    mergePreviewMutation,
    setBlocks,
    setMarkdownSource,
    mergePreviewMessage,
    saveCurrentDraft,
  } = ctrl;

  return (
    <section className="page-card">
      <span className="page-card__label">{t("resumeEditor.staleWriteRecovery")}</span>
      <h2 className="page-card__title">{t("resumeEditor.mergePreview")}</h2>
      <p className="page-card__body">{mergePreviewMessage}</p>
      {mergePreviewMutation.data ? (
        <>
          <div className="stats-grid">
            <MetricCard label={t("resumeEditor.status")} value={mergePreviewMutation.data.mergeStatusLabel} />
            <MetricCard label={t("resumeEditor.added")} tone="accent" value={String(mergePreviewMutation.data.changeSummary.addedBlockCount)} />
            <MetricCard label={t("resumeEditor.updated")} tone="muted" value={String(mergePreviewMutation.data.changeSummary.updatedBlockCount)} />
            <MetricCard label={t("resumeEditor.conflicts")} tone="muted" value={String(mergePreviewMutation.data.conflicts.length)} />
          </div>
          {mergePreviewMutation.data.conflicts.length > 0 ? (
            <div className="stack-list">
              {mergePreviewMutation.data.conflicts.map((conflict) => (
                <article className="page-card page-card--muted" key={conflict.id}>
                  <p className="section-heading__eyebrow">{conflict.conflictTypeLabel}</p>
                  <h3 className="page-card__title">{conflict.nodeId ?? conflict.blockId}</h3>
                  {conflict.conflictScopes.length > 0 ? (
                    <div className="filter-chip-row">
                      {conflict.conflictScopes.map((scope) => (
                        <span className="detail-chip" key={`${conflict.id}-${scope}`}>
                          {scope}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <p className="resume-tailor-muted">{t("resumeEditor.serverCurrent")}</p>
                  <div className="page-card__body resume-section__body--preserve">
                    {(conflict.currentTextLines.length > 0
                      ? conflict.currentTextLines
                      : [conflict.currentText ?? (t("resumeEditor.noText"))]
                    ).map((line, index) => (
                      <p key={`${conflict.id}-current-${index}`}>{line || "\u00A0"}</p>
                    ))}
                  </div>
                  <p className="resume-tailor-muted">{t("resumeEditor.yourProposedEdit")}</p>
                  <div className="page-card__body resume-section__body--preserve">
                    {(conflict.proposedTextLines.length > 0
                      ? conflict.proposedTextLines
                      : [conflict.proposedText ?? (t("resumeEditor.noText"))]
                    ).map((line, index) => (
                      <p key={`${conflict.id}-proposed-${index}`}>{line || "\u00A0"}</p>
                    ))}
                  </div>
                  <div className="page-card__actions">
                    <button
                      className="secondary-button"
                      onClick={() => resolveConflictBlock(conflict.blockId, "current")}
                      type="button"
                    >
                      {t("resumeEditor.keepServerVersion")}
                    </button>
                    <button
                      className="secondary-button"
                      onClick={() => resolveConflictBlock(conflict.blockId, "proposed")}
                      type="button"
                    >
                      {t("resumeEditor.keepMyEdit")}
                    </button>
                    <button
                      className="secondary-button"
                      onClick={() => resolveConflictBlock(conflict.blockId, "merged")}
                      type="button"
                    >
                      {t("resumeEditor.useMergedText")}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
          <div className="page-card__actions">
            <button
              className="primary-button"
              onClick={() => {
                if (!mergePreviewMutation.data) {
                  return;
                }

                setBlocks(mapEditableBlocks(mergePreviewMutation.data.mergedDocument.blocks));
                setMarkdownSource(mergePreviewMutation.data.mergedDocument.markdownSource);
              }}
              type="button"
            >
              {t("resumeEditor.applyMergedDraftToWorkspace")}
            </button>
            <button
              className="secondary-button"
              onClick={() => {
                void saveCurrentDraft("merge_resolution");
              }}
              type="button"
            >
              {t("resumeEditor.saveResolvedDraft")}
            </button>
          </div>
        </>
      ) : null}
    </section>
  );
}
