import type { SkillGapModel } from "../../entities/skill-intelligence/model";
import { useLocale } from "../../shared/i18n";
import { InsightCard } from "../../shared/ui/InsightCard";

type GapAnalysisSectionProps = {
  gapModel: SkillGapModel;
};

export function GapAnalysisSection({ gapModel }: GapAnalysisSectionProps) {
  const { locale } = useLocale();
  const isKorean = locale === "ko";

  return (
    <section className="page-card">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">{isKorean ? "갭 분석" : "Gap analysis"}</p>
          <h2 className="page-card__title">
            {isKorean ? "약한 스킬과 벤치마크 격차" : "Weak skills and benchmark gaps"}
          </h2>
        </div>
        <span className="section-heading__count">{gapModel.items.length}</span>
      </div>
      {gapModel.items.length === 0 ? (
        <p className="page-card__body">
          {isKorean ? "아직 확인할 갭 목록이 없습니다." : "No gap list is available yet."}
        </p>
      ) : (
        <div className="stack-list">
          {gapModel.items.map((item) => (
            <InsightCard
              body={item.recommendedAction ?? (isKorean ? "아직 추천 행동이 없습니다." : "No recommended action is available yet.")}
              key={item.id}
              label={isKorean ? `격차 ${item.gapScoreLabel}` : `Gap ${item.gapScoreLabel}`}
              meta={[item.priorityLabel, item.benchmarkLabel].filter(Boolean) as string[]}
              title={item.label}
              tone="warning"
            />
          ))}
        </div>
      )}
    </section>
  );
}
