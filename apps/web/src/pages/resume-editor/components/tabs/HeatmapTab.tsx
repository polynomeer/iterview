import { Link } from "react-router-dom";
import { routeConfig } from "../../../../shared/config/routes";
import { EmptyStateCard } from "../../../../shared/ui/EmptyStateCard";
import { MetricCard } from "../../../../shared/ui/MetricCard";
import type { EditorViewProps } from "../../editorViewProps";

export function HeatmapTab({ ctrl, workspace }: EditorViewProps) {
  const {
    t,
    versionId,
    safeVersionId,
  } = ctrl;

  return (
    <section className="page-card">
      <span className="page-card__label">{t("resumeEditor.heatmapAdjacency")}</span>
      <h2 className="page-card__title">{t("resumeEditor.resumeHeatmapConnection")}</h2>
      {workspace.heatmapAvailable ? (
        <>
          <div className="stats-grid">
            <MetricCard label={t("resumeEditor.anchors")} value={String(workspace.heatmapSummary?.totalAnchors ?? 0)} />
            <MetricCard label={t("resumeEditor.linkedQuestions")} tone="accent" value={String(workspace.heatmapSummary?.totalLinkedQuestions ?? 0)} />
          </div>
          <div className="page-card__actions">
            <Link className="primary-button" to={routeConfig.resumeHeatmap.buildPath({ versionId: safeVersionId })}>
              {t("resumeEditor.openInterviewHeatmap")}
            </Link>
          </div>
        </>
      ) : (
        <EmptyStateCard
          body={t("resumeEditor.resumeHeatmapUnavailable")}
          title={t("resumeEditor.noHeatmapConnection")}
        />
      )}
    </section>
  );
}
