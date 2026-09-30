import { Link } from "react-router-dom";
import { routeConfig } from "../../../../shared/config/routes";
import { EmptyStateCard } from "../../../../shared/ui/EmptyStateCard";
import { MetricCard } from "../../../../shared/ui/MetricCard";
import type { EditorViewProps } from "../../editorViewProps";

export function HeatmapTab({ ctrl, workspace }: EditorViewProps) {
  const {
    isKorean,
    versionId,
    safeVersionId,
  } = ctrl;

  return (
    <section className="page-card">
      <span className="page-card__label">{isKorean ? "히트맵 연결" : "Heatmap adjacency"}</span>
      <h2 className="page-card__title">{isKorean ? "이력서 히트맵 연결" : "Resume heatmap connection"}</h2>
      {workspace.heatmapAvailable ? (
        <>
          <div className="stats-grid">
            <MetricCard label={isKorean ? "앵커" : "Anchors"} value={String(workspace.heatmapSummary?.totalAnchors ?? 0)} />
            <MetricCard label={isKorean ? "연결된 질문" : "Linked questions"} tone="accent" value={String(workspace.heatmapSummary?.totalLinkedQuestions ?? 0)} />
          </div>
          <div className="page-card__actions">
            <Link className="primary-button" to={routeConfig.resumeHeatmap.buildPath({ versionId: safeVersionId })}>
              {isKorean ? "면접 히트맵 열기" : "Open interview heatmap"}
            </Link>
          </div>
        </>
      ) : (
        <EmptyStateCard
          body={isKorean ? "이 작업공간에서는 아직 이력서 히트맵을 사용할 수 없습니다." : "The resume heatmap is not available for this workspace yet."}
          title={isKorean ? "히트맵 연결 없음" : "No heatmap connection"}
        />
      )}
    </section>
  );
}
