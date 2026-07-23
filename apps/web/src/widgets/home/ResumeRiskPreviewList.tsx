import type { HomeModel } from "../../entities/home/model";
import { InsightCard } from "../../shared/ui/InsightCard";

type ResumeRiskPreviewListProps = {
  items: HomeModel["resumeRiskPreview"];
};

export function ResumeRiskPreviewList({ items }: ResumeRiskPreviewListProps) {
  return (
    <section className="page-card">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">Resume risks</p>
          <h2 className="page-card__title">Claims worth tightening before interview day</h2>
        </div>
        <span className="section-heading__count">{items.length}</span>
      </div>
      <div className="stack-list">
        {items.map((item) => (
          <InsightCard
            action={undefined}
            body={item.description}
            key={item.id}
            label={item.severityLabel}
            meta={item.relatedSkillLabel ? [item.relatedSkillLabel] : []}
            title={item.title}
            tone="warning"
          />
        ))}
      </div>
    </section>
  );
}
