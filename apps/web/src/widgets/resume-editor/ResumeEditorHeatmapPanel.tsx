import { Link } from "react-router-dom";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
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
  const { locale } = useLocale();
  const isKorean = locale === "ko";

  return (
    <section className="page-card">
      <span className="page-card__label">{isKorean ? "히트맵 인접 정보" : "Heatmap adjacency"}</span>
      <h2 className="page-card__title">{isKorean ? "이력서 히트맵 연결" : "Resume heatmap connection"}</h2>
      {heatmapAvailable ? (
        <>
          <div className="stats-grid">
            <MetricCard label={isKorean ? "앵커" : "Anchors"} value={String(heatmapSummary?.totalAnchors ?? 0)} />
            <MetricCard
              label={isKorean ? "연결된 질문" : "Linked questions"}
              tone="accent"
              value={String(heatmapSummary?.totalLinkedQuestions ?? 0)}
            />
          </div>
          <div className="page-card__actions">
            <Link className="primary-button" to={routeConfig.resumeHeatmap.buildPath({ versionId })}>
              {isKorean ? "인터뷰 히트맵 열기" : "Open interview heatmap"}
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
