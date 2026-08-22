import type { SummaryStatModel } from "../../entities/home/model";
import { MetricCard } from "../../shared/ui/MetricCard";

type SummaryStatsCardProps = {
  stats: SummaryStatModel[];
};

export function SummaryStatsCard({ stats }: SummaryStatsCardProps) {
  return (
    <section className="page-card summary-stats-card">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">Summary</p>
          <h2 className="page-card__title">Your current momentum</h2>
          <p className="page-card__body summary-stats-card__body">
            Keep the short-term signal visible before diving into retry work or resume cleanup.
          </p>
        </div>
        <span className="section-heading__count section-heading__count--text">{stats.length} signals</span>
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
