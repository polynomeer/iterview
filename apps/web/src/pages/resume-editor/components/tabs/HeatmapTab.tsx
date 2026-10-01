import { routeConfig } from "../../../../shared/config/routes";
import { ButtonLink, Card, CardHeader, EmptyState, Stat } from "../../../../shared/ui/primitives";
import type { EditorViewProps } from "../../editorViewProps";

export function HeatmapTab({ ctrl, workspace }: EditorViewProps) {
  const {
    t,
    safeVersionId,
  } = ctrl;

  return (
    <Card padded>
      <CardHeader title={t("resumeEditor.heatmap")} titleAs="h2" />
      {workspace.heatmapAvailable ? (
        <>
          <div className="editor-stats">
            <Stat label={t("resumeEditor.anchors")} value={String(workspace.heatmapSummary?.totalAnchors ?? 0)} />
            <Stat label={t("resumeEditor.linkedQuestions")} tone="accent" value={String(workspace.heatmapSummary?.totalLinkedQuestions ?? 0)} />
          </div>
          <div className="editor-actions">
            <ButtonLink size="sm" to={routeConfig.resumeHeatmap.buildPath({ versionId: safeVersionId })} variant="primary">
              {t("resumeEditor.openInterviewHeatmap")}
            </ButtonLink>
          </div>
        </>
      ) : (
        <EmptyState body={t("resumeEditor.resumeHeatmapUnavailable")} title={t("resumeEditor.noHeatmapConnection")} />
      )}
    </Card>
  );
}
