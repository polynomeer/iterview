import type { HomeModel } from "../../entities/home/model";
import { useLocale } from "../../shared/i18n";

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
          <h2 className="page-card__title">{isKorean ? "면접 전에 다시 조일 주장" : "Claims to tighten before interview day"}</h2>
        </div>
        <span className="section-heading__count">{items.length}</span>
      </div>
      <div className="stack-list">
        {items.map((item) => (
          <article className="list-item-card list-item-card--warning" key={item.id}>
            <div className="list-item-card__content">
              <div className="list-item-card__meta">
                <span>{item.severityLabel}</span>
                {item.relatedSkillLabel ? <span>{item.relatedSkillLabel}</span> : null}
              </div>
              <h3 className="list-item-card__title">{item.title}</h3>
              <p className="list-item-card__body home-collection-card__item-body">{item.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
