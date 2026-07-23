import type { ResultAnalysisModel } from "../../entities/result/model";
import { SkillSummaryBlock } from "../../shared/ui/SkillSummaryBlock";
import { InsightCard } from "../../shared/ui/InsightCard";

type AnalysisInsightSectionProps = {
  result: ResultAnalysisModel;
};

export function AnalysisInsightSection({ result }: AnalysisInsightSectionProps) {
  const hasWeakPatterns = (result.weakPatterns ?? []).length > 0;

  return (
    <div className="page-stack">
      <SkillSummaryBlock
        emptyMessage="No skill-impact summary is available for this attempt."
        eyebrow="Skill impact"
        items={(result.skillImpact ?? []).map((impact) => ({
          id: impact.id,
          label: impact.label,
          value: impact.deltaLabel,
          helperText: impact.scoreLabel,
          tone: impact.deltaLabel.startsWith("-") ? "warning" : "accent",
        }))}
        title="How this answer moved your skill profile"
      />
      <section className="page-card">
        <div className="section-heading">
          <div>
            <p className="section-heading__eyebrow">Weak patterns</p>
            <h2 className="page-card__title">What to improve in the next retry</h2>
          </div>
        </div>
        {!hasWeakPatterns ? (
          <p className="page-card__body">
            {result.detailedFeedback
              ? "The richer analysis already covers the main improvement areas above."
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
