import { Badge, Button, Callout, Card, CardHeader, Stat } from "../../../shared/ui/primitives";
import { mapEditableBlocks } from "../editorUtils";
import type { EditorViewProps } from "../editorViewProps";

export function MergePreviewPanel({ ctrl }: EditorViewProps) {
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
    <Card padded>
      <CardHeader title={t("resumeEditor.mergePreview")} titleAs="h2" />
      {mergePreviewMessage ? <Callout tone="warning">{mergePreviewMessage}</Callout> : null}
      {mergePreviewMutation.data ? (
        <>
          <div className="editor-stats">
            <Stat label={t("resumeEditor.status")} value={mergePreviewMutation.data.mergeStatusLabel} />
            <Stat label={t("resumeEditor.added")} tone="accent" value={String(mergePreviewMutation.data.changeSummary.addedBlockCount)} />
            <Stat label={t("resumeEditor.updated")} value={String(mergePreviewMutation.data.changeSummary.updatedBlockCount)} />
            <Stat
              label={t("resumeEditor.conflicts")}
              tone={mergePreviewMutation.data.conflicts.length > 0 ? "warning" : "neutral"}
              value={String(mergePreviewMutation.data.conflicts.length)}
            />
          </div>
          {mergePreviewMutation.data.conflicts.length > 0 ? (
            <div className="editor-stack">
              {mergePreviewMutation.data.conflicts.map((conflict) => (
                <article className="editor-panel" key={conflict.id}>
                  <div className="editor-head">
                    <h3 className="editor-heading">{conflict.conflictTypeLabel}</h3>
                    {conflict.conflictScopes.length > 0 ? (
                      <div className="editor-chips">
                        {conflict.conflictScopes.map((scope) => (
                          <Badge key={`${conflict.id}-${scope}`}>{scope}</Badge>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <p className="editor-label">{t("resumeEditor.serverCurrent")}</p>
                  <div className="editor-inset editor-preserve">
                    {(conflict.currentTextLines.length > 0
                      ? conflict.currentTextLines
                      : [conflict.currentText ?? t("resumeEditor.noText")]
                    ).map((line, index) => (
                      <p key={`${conflict.id}-current-${index}`}>{line || " "}</p>
                    ))}
                  </div>
                  <p className="editor-label">{t("resumeEditor.yourProposedEdit")}</p>
                  <div className="editor-inset editor-preserve">
                    {(conflict.proposedTextLines.length > 0
                      ? conflict.proposedTextLines
                      : [conflict.proposedText ?? t("resumeEditor.noText")]
                    ).map((line, index) => (
                      <p key={`${conflict.id}-proposed-${index}`}>{line || " "}</p>
                    ))}
                  </div>
                  <div className="editor-actions">
                    <Button onClick={() => resolveConflictBlock(conflict.blockId, "current")} size="sm">
                      {t("resumeEditor.keepServerVersion")}
                    </Button>
                    <Button onClick={() => resolveConflictBlock(conflict.blockId, "proposed")} size="sm">
                      {t("resumeEditor.keepMyEdit")}
                    </Button>
                    <Button onClick={() => resolveConflictBlock(conflict.blockId, "merged")} size="sm">
                      {t("resumeEditor.useMergedText")}
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
          <div className="editor-actions">
            <Button
              onClick={() => {
                if (!mergePreviewMutation.data) {
                  return;
                }

                setBlocks(mapEditableBlocks(mergePreviewMutation.data.mergedDocument.blocks));
                setMarkdownSource(mergePreviewMutation.data.mergedDocument.markdownSource);
              }}
              size="sm"
              variant="primary"
            >
              {t("resumeEditor.applyMergedDraftToWorkspace")}
            </Button>
            <Button
              onClick={() => {
                void saveCurrentDraft("merge_resolution");
              }}
              size="sm"
            >
              {t("resumeEditor.saveResolvedDraft")}
            </Button>
          </div>
        </>
      ) : null}
    </Card>
  );
}
