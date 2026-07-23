import { Link } from "react-router-dom";
import type { FeedQuestionCardModel } from "../../entities/feed/model";
import { routeConfig } from "../../shared/config/routes";

type FeedQuestionCardProps = {
  item: FeedQuestionCardModel;
};

export function FeedQuestionCard({ item }: FeedQuestionCardProps) {
  return (
    <article className="list-item-card">
      <div className="list-item-card__content">
        <div className="list-item-card__meta">
          <span>{item.categoryLabel}</span>
          <span>{item.difficultyLabel}</span>
          {item.companyLabels.map((company) => (
            <span key={company}>{company}</span>
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
      </div>
      <div className="list-item-card__actions">
        <Link
          className="secondary-button"
          to={routeConfig.questionDetail.buildPath({ questionId: item.id })}
        >
          View detail
        </Link>
        <Link
          className="primary-button"
          to={routeConfig.answerEditor.buildPath({ questionId: item.id })}
        >
          Start answer
        </Link>
      </div>
    </article>
  );
}
