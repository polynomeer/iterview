import type { ResultFeedbackItemModel } from "../../entities/result/model";
import { useLocale } from "../../shared/i18n";

type FeedbackListProps = {
  items: ResultFeedbackItemModel[];
};

export function FeedbackList({ items }: FeedbackListProps) {
  const { locale } = useLocale();
  const isKorean = locale === "ko";

  return (
    <section className="page-card result-analysis-section-card">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">{isKorean ? "기존 피드백" : "Legacy feedback"}</p>
          <h2 className="page-card__title">{isKorean ? "채점 규칙 피드백" : "Scoring rule feedback"}</h2>
          <p className="page-card__body">
            {isKorean
              ? "이 규칙 기반 노트는 메인 판단 화면이 아니라 보조 근거로 유지하세요."
              : "Keep these rule-based notes as supporting evidence, not the main decision surface."}
          </p>
        </div>
        <span className="section-heading__count section-heading__count--text">{isKorean ? `${items.length}개 노트` : `${items.length} notes`}</span>
      </div>
      {items.length === 0 ? (
        <p className="page-card__body">{isKorean ? "이번 시도에는 기존 피드백 항목이 없습니다." : "No legacy feedback items are available for this attempt."}</p>
      ) : (
        <div className="stack-list">
          {items.map((item) => (
            <article className={`feedback-card feedback-card--${item.tone}`} key={item.id}>
              <h3 className="list-item-card__title">{item.title}</h3>
              <p className="list-item-card__body">{item.description}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
