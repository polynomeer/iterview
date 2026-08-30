import { Link } from "react-router-dom";
import type { FeedQuestionCardModel } from "../../entities/feed/model";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";

type FeedQuestionCardProps = {
  item: FeedQuestionCardModel;
};

export function FeedQuestionCard({ item }: FeedQuestionCardProps) {
  const { t } = useLocale();

  return (
    <article className="list-item-card feed-question-card">
      <div className="list-item-card__content">
        <div className="list-item-card__meta" role="list">
          <span className="list-item-card__meta-pill" role="listitem">{item.categoryLabel}</span>
          <span className="list-item-card__meta-pill" role="listitem">{item.difficultyLabel}</span>
          {item.companyLabels.map((company) => (
            <span className="list-item-card__meta-pill" key={company} role="listitem">{company}</span>
          ))}
        </div>
        <h3 className="list-item-card__title">{item.title}</h3>
        {item.tagLabels.length > 0 ? (
          <div className="chip-list">
            {item.tagLabels.map((tag) => (
              <span className="detail-chip" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        ) : null}
        {item.progressSummaryLabel ? (
          <p className="practice-list-item__progress">{item.progressSummaryLabel}</p>
        ) : null}
        <p className="feed-question-card__note">
          {t("feed.comparePromptNote")}
        </p>
      </div>
      <div className="list-item-card__actions">
        <Link
          className="secondary-button"
          to={routeConfig.questionDetail.buildPath({ questionId: item.id })}
        >
          {t("questionTree.viewDetail")}
        </Link>
        <Link
          className="primary-button"
          to={routeConfig.answerEditor.buildPath({ questionId: item.id })}
        >
          {t("question.startAnswer")}
        </Link>
      </div>
    </article>
  );
}
