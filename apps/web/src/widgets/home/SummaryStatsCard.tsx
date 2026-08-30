import type { SummaryStatModel } from "../../entities/home/model";
import { useLocale } from "../../shared/i18n";
import { MetricCard } from "../../shared/ui/MetricCard";

type SummaryStatsCardProps = {
  stats: SummaryStatModel[];
};

export function SummaryStatsCard({ stats }: SummaryStatsCardProps) {
  const { locale } = useLocale();
  const isKorean = locale === "ko";

  return (
    <section className="page-card summary-stats-card">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">{isKorean ? "요약" : "Summary"}</p>
          <h2 className="page-card__title">{isKorean ? "현재 준비 흐름" : "Your current momentum"}</h2>
          <p className="page-card__body summary-stats-card__body">
            {isKorean
              ? "재도전 작업이나 이력서 정리에 들어가기 전에 단기 신호를 먼저 보이게 유지하세요."
              : "Keep the short-term signal visible before diving into retry work or resume cleanup."}
          </p>
        </div>
        <span className="section-heading__count section-heading__count--text">
          {isKorean ? `${stats.length}개 신호` : `${stats.length} signals`}
        </span>
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
