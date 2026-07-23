import type { SummaryStatModel } from "../../entities/home/model";
import { MetricCard } from "../../shared/ui/MetricCard";

type SummaryStatsCardProps = {
  stats: SummaryStatModel[];
};

export function SummaryStatsCard({ stats }: SummaryStatsCardProps) {
  return (
    <section className="page-card">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">Summary</p>
          <h2 className="page-card__title">Your current momentum</h2>
        </div>
      </div>
      <div className="stats-grid">
        {stats.map((stat) => (
          <MetricCard
            helperText={stat.helperText}
            key={stat.id}
            label={stat.label}
            tone="muted"
            value={stat.value}
          />
        ))}
      </div>
    </section>
  );
}
