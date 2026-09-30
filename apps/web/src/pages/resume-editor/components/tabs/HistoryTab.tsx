import { getErrorDetails, userFacingErrorMessage } from "../../../../shared/api/errors";
import { EmptyStateCard } from "../../../../shared/ui/EmptyStateCard";
import { ErrorStateCard } from "../../../../shared/ui/ErrorStateCard";
import { LoadingStateCard } from "../../../../shared/ui/LoadingStateCard";
import type { EditorControllerProps } from "../../editorViewProps";

export function HistoryTab({ ctrl }: EditorControllerProps) {
  const {
    t,
    revisionsQuery,
    setSelectedRevisionId,
    compareFromRevisionId,
    setCompareFromRevisionId,
    compareToRevisionId,
    setCompareToRevisionId,
    revisionDetailQuery,
    trackedChangesQuery,
  } = ctrl;

  return (
    <div className="resume-editor-workspace">
      <div className="resume-editor-workspace__document">
        <section className="page-card">
          <span className="page-card__label">{t("resumeEditor.revisions")}</span>
          <h2 className="page-card__title">{t("resumeEditor.revisionHistory")}</h2>
          {revisionsQuery.isLoading ? (
            <LoadingStateCard
              body={t("resumeEditor.loadingPersistedWorkspaceRevisions")}
              title={t("resumeEditor.preparingHistory")}
            />
          ) : revisionsQuery.isError ? (
            <ErrorStateCard
              body={userFacingErrorMessage(revisionsQuery.error, t("resumeEditor.unableToLoadRevisions"))}
              details={getErrorDetails(revisionsQuery.error)}
              onAction={() => {
                void revisionsQuery.refetch();
              }}
              title={t("resumeEditor.unableToLoadRevisionsTitle")}
            />
          ) : revisionsQuery.data && revisionsQuery.data.length > 0 ? (
            <div className="stack-list">
              {revisionsQuery.data.map((revision) => (
                <article className="page-card page-card--muted" key={revision.id}>
                  <div className="section-heading">
                    <div>
                      <p className="section-heading__eyebrow">{revision.changeSourceLabel}</p>
                      <h3 className="page-card__title">{t("resumeEditor.revisionLabel", { revisionNo: revision.revisionNo })}</h3>
                    </div>
                    <button
                      className="secondary-button"
                      onClick={() => setSelectedRevisionId(revision.id)}
                      type="button"
                    >
                      {t("resumeEditor.viewDetail")}
                    </button>
                  </div>
                  <p className="resume-tailor-muted">{revision.createdAtLabel}</p>
              <div className="filter-chip-row">
                <span className="detail-chip">{t("resumeEditor.added")} {revision.changeSummary.addedBlockCount}</span>
                <span className="detail-chip">{t("resumeEditor.updated")} {revision.changeSummary.updatedBlockCount}</span>
                <span className="detail-chip">{t("resumeEditor.removed")} {revision.changeSummary.removedBlockCount}</span>
                {revision.changeSummary.changedBlockIds.length > 0 ? (
                  <span className="detail-chip">
                    {t("resumeEditor.changedIds")} {revision.changeSummary.changedBlockIds.length}
                  </span>
                ) : null}
              </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyStateCard
              body={t("resumeEditor.noRevisionHistoryBeyondCurrentDraft")}
              title={t("resumeEditor.noRevisions")}
            />
          )}
        </section>
      </div>
      <div className="resume-editor-workspace__side">
        <section className="page-card">
          <span className="page-card__label">{t("resumeEditor.revisionDetail")}</span>
          <h2 className="page-card__title">
            {revisionDetailQuery.data
              ? t("resumeEditor.revisionLabel", { revisionNo: revisionDetailQuery.data.revisionNo })
              : t("resumeEditor.selectRevision")}
          </h2>
          {revisionDetailQuery.data ? (
            <div className="page-stack">
              <p className="resume-tailor-muted">{revisionDetailQuery.data.createdAtLabel}</p>
              <div className="filter-chip-row">
                <span className="detail-chip">{t("resumeEditor.added")} {revisionDetailQuery.data.changeSummary.addedBlockCount}</span>
                <span className="detail-chip">{t("resumeEditor.updated")} {revisionDetailQuery.data.changeSummary.updatedBlockCount}</span>
              </div>
              <div className="stack-list">
                {(revisionDetailQuery.data.document.nodes.length > 0
                  ? revisionDetailQuery.data.document.nodes
                  : revisionDetailQuery.data.document.blocks
                ).map((block) => (
                  <article
                    className="page-card page-card--muted"
                    key={"nodeId" in block ? block.nodeId : block.blockId}
                  >
                    <p className="section-heading__eyebrow">
                      {"nodeId" in block ? block.nodeTypeLabel : block.blockTypeLabel}
                    </p>
                    <h3 className="page-card__title">
                      {"nodeId" in block
                        ? block.metadata.heading ?? block.fieldPath ?? block.nodeId
                        : block.title || block.blockId}
                    </h3>
                    <p className="page-card__body resume-section__body--preserve">
                      {"nodeId" in block ? block.text : block.textValue}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <section className="page-card">
          <span className="page-card__label">{t("resumeEditor.trackedChanges")}</span>
          <h2 className="page-card__title">{t("resumeEditor.compareRevisions")}</h2>
          <label className="form-field">
            <span className="form-field__label">{t("resumeEditor.fromRevision")}</span>
            <select
              className="form-field__input"
              onChange={(event) => setCompareFromRevisionId(event.target.value)}
              value={compareFromRevisionId ?? ""}
            >
              <option value="">{t("resumeEditor.selectRevisionOption")}</option>
              {revisionsQuery.data?.map((revision) => (
                <option key={`from-${revision.id}`} value={revision.id}>
                  {t("resumeEditor.revisionLabel", { revisionNo: revision.revisionNo })}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span className="form-field__label">{t("resumeEditor.toRevision")}</span>
            <select
              className="form-field__input"
              onChange={(event) => setCompareToRevisionId(event.target.value)}
              value={compareToRevisionId ?? ""}
            >
              <option value="">{t("resumeEditor.selectRevisionOption")}</option>
              {revisionsQuery.data?.map((revision) => (
                <option key={`to-${revision.id}`} value={revision.id}>
                  {t("resumeEditor.revisionLabel", { revisionNo: revision.revisionNo })}
                </option>
              ))}
            </select>
          </label>
          {trackedChangesQuery.data ? (
            <div className="stack-list">
              {trackedChangesQuery.data.changes.map((change) => (
                <article className="page-card page-card--muted resume-editor-diff-card" key={change.id}>
                  <p className="section-heading__eyebrow">{change.changeTypeLabel}</p>
                  <h3 className="page-card__title">{change.nodeId ?? change.blockId}</h3>
                  <div className="filter-chip-row">
                    {change.textChanged ? <span className="detail-chip">{t("resumeEditor.textChanged")}</span> : null}
                    {change.structureChanged ? <span className="detail-chip">{t("resumeEditor.structureChanged")}</span> : null}
                    {change.moveRelated ? <span className="detail-chip">{t("resumeEditor.moveRelated")}</span> : null}
                  </div>
                  <div className="resume-editor-diff-card__grid">
                    <div className="resume-editor-diff-card__column">
                      <p className="resume-tailor-muted">{t("resumeEditor.before")}</p>
                      <div className="page-card__body resume-section__body--preserve resume-editor-diff-card__surface resume-editor-diff-card__surface--before">
                        {(change.beforeTextLines.length > 0
                          ? change.beforeTextLines
                          : [change.beforeText ?? (t("resumeEditor.noPreviousText"))]
                        ).map((line, index) => (
                          <p key={`${change.id}-before-${index}`}>{line || "\u00A0"}</p>
                        ))}
                      </div>
                    </div>
                    <div className="resume-editor-diff-card__column">
                      <p className="resume-tailor-muted">{t("resumeEditor.after")}</p>
                      <div className="page-card__body resume-section__body--preserve resume-editor-diff-card__surface resume-editor-diff-card__surface--after">
                        {(change.afterTextLines.length > 0
                          ? change.afterTextLines
                          : [change.afterText ?? (t("resumeEditor.noUpdatedText"))]
                        ).map((line, index) => (
                          <p key={`${change.id}-after-${index}`}>{line || "\u00A0"}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
