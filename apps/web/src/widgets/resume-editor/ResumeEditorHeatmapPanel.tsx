import { Link } from "react-router-dom";
import { routeConfig } from "../../shared/config/routes";
import { EmptyStateCard } from "../../shared/ui/EmptyStateCard";
import { MetricCard } from "../../shared/ui/MetricCard";

type Props = {
  versionId: string;
  heatmapAvailable: boolean;
  heatmapSummary: {
    totalAnchors?: number | null;
    totalLinkedQuestions?: number | null;
  } | null;
};

export default function ResumeEditorHeatmapPanel({ versionId, heatmapAvailable, heatmapSummary }: Props) {
  return (
    <section className="page-card">
      <span className="page-card__label">Heatmap adjacency</span>
      <h2 className="page-card__title">Resume heatmap connection</h2>
      {heatmapAvailable ? (
        <>
          <div className="stats-grid">
            <MetricCard label="Anchors" value={String(heatmapSummary?.totalAnchors ?? 0)} />
            <MetricCard
              label="Linked questions"
              tone="accent"
              value={String(heatmapSummary?.totalLinkedQuestions ?? 0)}
            />
          </div>
          <div className="page-card__actions">
            <Link className="primary-button" to={routeConfig.resumeHeatmap.buildPath({ versionId })}>
              Open interview heatmap
            </Link>
          </div>
        </>
      ) : (
        <EmptyStateCard
          body="The resume heatmap is not available for this workspace yet."
          title="No heatmap connection"
        />
      )}
    </section>
  );
}
