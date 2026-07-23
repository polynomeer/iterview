import { Link } from "react-router-dom";
import type { QuestionDetailModel } from "../../entities/question/model";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";

type RecommendedQuestionSectionProps = {
  items: QuestionDetailModel["recommendedQuestions"];
};

export function RecommendedQuestionSection({ items }: RecommendedQuestionSectionProps) {
  const { t } = useLocale();

  return (
    <section className="page-card">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">{t("question.recommendedEyebrow")}</p>
          <h2 className="page-card__title">{t("question.recommendedTitle")}</h2>
        </div>
        <span className="section-heading__count">{items.length}</span>
      </div>
      <div className="stack-list">
        {items.map((item) => (
          <article className="list-item-card" key={item.id}>
            <div className="list-item-card__content">
              <h3 className="list-item-card__title">{item.title}</h3>
              {item.reason ? <p className="list-item-card__body">{item.reason}</p> : null}
              {item.metadataLabel ? <p className="list-item-card__body">{item.metadataLabel}</p> : null}
            </div>
            <div className="list-item-card__actions">
              <Link className="secondary-button" to={routeConfig.questionDetail.buildPath({ questionId: item.id })}>
                {t("common.openDetail")}
              </Link>
              <Link className="primary-button" to={routeConfig.answerEditor.buildPath({ questionId: item.id })}>
                {t("question.startAnswer")}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
