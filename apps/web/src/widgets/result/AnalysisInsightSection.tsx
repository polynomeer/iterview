import type { ResultAnalysisModel } from "../../entities/result/model";
import { useLocale } from "../../shared/i18n";
import { SkillSummaryBlock } from "../../shared/ui/SkillSummaryBlock";
import { InsightCard } from "../../shared/ui/InsightCard";

type AnalysisInsightSectionProps = {
  result: ResultAnalysisModel;
};

export function AnalysisInsightSection({ result }: AnalysisInsightSectionProps) {
  const { locale } = useLocale();
  const isKorean = locale === "ko";
  const hasWeakPatterns = (result.weakPatterns ?? []).length > 0;

  return (
    <div className="page-stack">
      <SkillSummaryBlock
        emptyMessage={isKorean ? "이번 시도에는 스킬 영향 요약이 없습니다." : "No skill-impact summary is available for this attempt."}
        eyebrow={isKorean ? "스킬 영향" : "Skill impact"}
        items={(result.skillImpact ?? []).map((impact) => ({
          id: impact.id,
          label: impact.label,
          value: impact.deltaLabel,
          helperText: impact.scoreLabel,
          tone: impact.deltaLabel.startsWith("-") ? "warning" : "accent",
        }))}
        title={isKorean ? "이 답변이 스킬 프로필에 준 영향" : "How this answer moved your skill profile"}
      />
      <section className="page-card result-analysis-section-card">
        <div className="section-heading">
          <div>
            <p className="section-heading__eyebrow">{isKorean ? "약한 패턴" : "Weak patterns"}</p>
            <h2 className="page-card__title">{isKorean ? "다음 재시도에서 보완할 점" : "What to improve in the next retry"}</h2>
            <p className="page-card__body">
              {isKorean
                ? "반복되는 약한 패턴은 더 깊게 브랜치를 타거나 기준 문서를 수정해야 한다는 가장 강한 신호로 보세요."
                : "Treat repeated weak patterns as the highest-signal reason to branch deeper or revise the source-of-truth."}
            </p>
          </div>
        </div>
        {!hasWeakPatterns ? (
          <p className="page-card__body">
            {result.detailedFeedback
              ? isKorean
                ? "상단의 상세 분석이 이미 핵심 개선 영역을 다루고 있습니다."
                : "The richer analysis already covers the main improvement areas above."
              : isKorean
                ? "이번 시도에는 약한 패턴 요약이 없습니다."
                : "No weak-pattern summary is available for this attempt."}
          </p>
        ) : (
          <div className="stack-list">
            {(result.weakPatterns ?? []).map((pattern) => (
              <InsightCard
                body={pattern.description}
                key={pattern.id}
                label={pattern.severityLabel}
                title={pattern.title}
                tone="warning"
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
