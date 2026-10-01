import { getErrorDetails, userFacingErrorMessage } from "../../../../shared/api/errors";
import { Badge, Button, Card, CardHeader, EmptyState, ErrorState, Field, Select } from "../../../../shared/ui/primitives";
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
        <Card padded>
          <CardHeader title={t("resumeEditor.revisionHistory")} titleAs="h2" />
          {revisionsQuery.isLoading ? (
            <p className="editor-muted" role="status">{t("resumeEditor.preparingHistory")}</p>
          ) : revisionsQuery.isError ? (
            <ErrorState
            actions={
              <Button onClick={() => void revisionsQuery.refetch()} size="sm" variant="primary">
                {t("common.tryAgain")}
              </Button>
            }
            body={userFacingErrorMessage(revisionsQuery.error, t("resumeEditor.unableToLoadRevisions"))}
            details={getErrorDetails(revisionsQuery.error)}
            title={t("resumeEditor.unableToLoadRevisionsTitle")}
          />
          ) : revisionsQuery.data && revisionsQuery.data.length > 0 ? (
            <div className="editor-stack">
              {revisionsQuery.data.map((revision) => (
                <article className="editor-item" key={revision.id}>
                  <div className="editor-head">
                    <div>
                      <p className="editor-label">{revision.changeSourceLabel}</p>
                      <h3 className="editor-heading">{t("resumeEditor.revisionLabel", { revisionNo: revision.revisionNo })}</h3>
                    </div>
                    <Button onClick={() => setSelectedRevisionId(revision.id)} size="sm">
                      {t("resumeEditor.viewDetail")}
                    </Button>
                  </div>
                  <p className="editor-muted">{revision.createdAtLabel}</p>
                  <div className="editor-chips">
                    <Badge tone="success">{t("resumeEditor.added")} {revision.changeSummary.addedBlockCount}</Badge>
                    <Badge tone="accent">{t("resumeEditor.updated")} {revision.changeSummary.updatedBlockCount}</Badge>
                    <Badge tone="danger">{t("resumeEditor.removed")} {revision.changeSummary.removedBlockCount}</Badge>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState body={t("resumeEditor.noRevisionHistoryBeyondCurrentDraft")} title={t("resumeEditor.noRevisions")} />
          )}
        </Card>
      </div>
      <div className="resume-editor-workspace__side">
        <Card padded>
          <CardHeader
            title={
              revisionDetailQuery.data
                ? t("resumeEditor.revisionLabel", { revisionNo: revisionDetailQuery.data.revisionNo })
                : t("resumeEditor.selectRevision")
            }
            titleAs="h2"
          />
          {revisionDetailQuery.data ? (
            <div className="editor-stack">
              <p className="editor-muted">{revisionDetailQuery.data.createdAtLabel}</p>
              <div className="editor-chips">
                <Badge tone="success">{t("resumeEditor.added")} {revisionDetailQuery.data.changeSummary.addedBlockCount}</Badge>
                <Badge tone="accent">{t("resumeEditor.updated")} {revisionDetailQuery.data.changeSummary.updatedBlockCount}</Badge>
              </div>
              <div className="editor-stack">
                {(revisionDetailQuery.data.document.nodes.length > 0
                  ? revisionDetailQuery.data.document.nodes
                  : revisionDetailQuery.data.document.blocks
                ).map((block) => {
                  const heading = "nodeId" in block ? block.metadata.heading : block.title;
                  return (
                    <article className="editor-item" key={"nodeId" in block ? block.nodeId : block.blockId}>
                      <p className="editor-label">{"nodeId" in block ? block.nodeTypeLabel : block.blockTypeLabel}</p>
                      {heading ? <h3 className="editor-heading">{heading}</h3> : null}
                      <p className="editor-text editor-preserve">{"nodeId" in block ? block.text : block.textValue}</p>
                    </article>
                  );
                })}
              </div>
            </div>
          ) : null}
        </Card>

        <Card padded>
          <CardHeader title={t("resumeEditor.compareRevisions")} titleAs="h2" />
          <Field label={t("resumeEditor.fromRevision")}>
            {(control) => (
              <Select
                {...control}
                onChange={(event) => setCompareFromRevisionId(event.target.value)}
                value={compareFromRevisionId ?? ""}
              >
                <option value="">{t("resumeEditor.selectRevisionOption")}</option>
                {revisionsQuery.data?.map((revision) => (
                  <option key={`from-${revision.id}`} value={revision.id}>
                    {t("resumeEditor.revisionLabel", { revisionNo: revision.revisionNo })}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label={t("resumeEditor.toRevision")}>
            {(control) => (
              <Select
                {...control}
                onChange={(event) => setCompareToRevisionId(event.target.value)}
                value={compareToRevisionId ?? ""}
              >
                <option value="">{t("resumeEditor.selectRevisionOption")}</option>
                {revisionsQuery.data?.map((revision) => (
                  <option key={`to-${revision.id}`} value={revision.id}>
                    {t("resumeEditor.revisionLabel", { revisionNo: revision.revisionNo })}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          {trackedChangesQuery.data ? (
            <div className="editor-stack">
              {trackedChangesQuery.data.changes.map((change) => (
                <article className="editor-item resume-editor-diff-card" key={change.id}>
                  <div className="editor-head">
                    <h3 className="editor-heading">{change.changeTypeLabel}</h3>
                    <div className="editor-chips">
                      {change.textChanged ? <Badge>{t("resumeEditor.textChanged")}</Badge> : null}
                      {change.structureChanged ? <Badge>{t("resumeEditor.structureChanged")}</Badge> : null}
                      {change.moveRelated ? <Badge>{t("resumeEditor.moveRelated")}</Badge> : null}
                    </div>
                  </div>
                  <div className="resume-editor-diff-card__grid">
                    <div className="resume-editor-diff-card__column">
                      <p className="editor-label">{t("resumeEditor.before")}</p>
                      <div className="editor-preserve resume-editor-diff-card__surface resume-editor-diff-card__surface--before">
                        {(change.beforeTextLines.length > 0
                          ? change.beforeTextLines
                          : [change.beforeText ?? t("resumeEditor.noPreviousText")]
                        ).map((line, index) => (
                          <p key={`${change.id}-before-${index}`}>{line || " "}</p>
                        ))}
                      </div>
                    </div>
                    <div className="resume-editor-diff-card__column">
                      <p className="editor-label">{t("resumeEditor.after")}</p>
                      <div className="editor-preserve resume-editor-diff-card__surface resume-editor-diff-card__surface--after">
                        {(change.afterTextLines.length > 0
                          ? change.afterTextLines
                          : [change.afterText ?? t("resumeEditor.noUpdatedText")]
                        ).map((line, index) => (
                          <p key={`${change.id}-after-${index}`}>{line || " "}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
