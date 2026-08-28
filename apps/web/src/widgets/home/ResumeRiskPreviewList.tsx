import type { HomeModel } from "../../entities/home/model";
import { useLocale } from "../../shared/i18n";
import { InsightCard } from "../../shared/ui/InsightCard";

type ResumeRiskPreviewListProps = {
  items: HomeModel["resumeRiskPreview"];
};

export function ResumeRiskPreviewList({ items }: ResumeRiskPreviewListProps) {
  const { locale } = useLocale();
  const isKorean = locale === "ko";

  return (
    <section className="page-card home-collection-card home-collection-card--resume">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">{isKorean ? "이력서 리스크" : "Resume risks"}</p>
          <h2 className="page-card__title">{isKorean ? "면접 전에 더 조여야 할 주장" : "Claims worth tightening before interview day"}</h2>
          <p className="page-card__body home-collection-card__body">
            {isKorean
              ? "이 문장들은 면접에서 깊은 꼬리질문 압박을 가장 쉽게 유발할 가능성이 큽니다."
              : "These are the statements most likely to trigger deep follow-up pressure in interview."}
          </p>
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
