import { Link } from "react-router-dom";
import type { PracticeQuestionItemModel } from "../../entities/practice/model";
import { routeConfig } from "../../shared/config/routes";
import { QuestionStatusBadge } from "../../shared/ui/QuestionStatusBadge";

type QuestionListItemProps = {
  item: PracticeQuestionItemModel;
};

export function QuestionListItem({ item }: QuestionListItemProps) {
  return (
    <article className="list-item-card practice-list-item-card">
      <div className="list-item-card__content">
        <div className="list-item-card__meta" role="list">
          <span className="list-item-card__meta-pill" role="listitem">{item.categoryLabel}</span>
          <span className="list-item-card__meta-pill" role="listitem">{item.companyLabel}</span>
          <span className="list-item-card__meta-pill" role="listitem">{item.difficultyLabel}</span>
          {item.statusLabel ? <QuestionStatusBadge status={item.statusLabel.toLowerCase()} /> : null}
        </div>
        <h3 className="list-item-card__title">{item.title}</h3>
        <p className="list-item-card__body">{item.prompt}</p>
        {item.progressSummaryLabel || item.resumeRelevanceLabel ? (
          <div className="practice-list-item-card__notes">
            {item.progressSummaryLabel ? (
              <p className="practice-list-item__progress">{item.progressSummaryLabel}</p>
            ) : null}
            {item.resumeRelevanceLabel ? (
              <p className="practice-list-item__progress">
                Resume: {item.resumeRelevanceLabel}
                {item.resumeRelevanceReason ? ` / ${item.resumeRelevanceReason}` : ""}
              </p>
            ) : null}
          </div>
        ) : null}
        {(item.relatedSkillLabels ?? []).length > 0 ? (
          <div className="chip-list">
            {(item.relatedSkillLabels ?? []).map((skill) => (
              <span className="detail-chip detail-chip--accent" key={skill}>
                {skill}
              </span>
            ))}
          </div>
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
