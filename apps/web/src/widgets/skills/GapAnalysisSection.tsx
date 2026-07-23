import type { SkillGapModel } from "../../entities/skill-intelligence/model";
import { InsightCard } from "../../shared/ui/InsightCard";

type GapAnalysisSectionProps = {
  gapModel: SkillGapModel;
};

export function GapAnalysisSection({ gapModel }: GapAnalysisSectionProps) {
  return (
    <section className="page-card">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">Gap analysis</p>
          <h2 className="page-card__title">Weak skills and benchmark gaps</h2>
        </div>
        <span className="section-heading__count">{gapModel.items.length}</span>
      </div>
      {gapModel.items.length === 0 ? (
        <p className="page-card__body">No gap list is available yet.</p>
      ) : (
        <div className="stack-list">
          {gapModel.items.map((item) => (
            <InsightCard
              body={item.recommendedAction ?? "No recommended action is available yet."}
              key={item.id}
              label={`Gap ${item.gapScoreLabel}`}
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
