import { Link } from "react-router-dom";
import type { ResultAnalysisModel } from "../../entities/result/model";
import { routeConfig } from "../../shared/config/routes";

type FollowUpRecommendationSectionProps = {
  items: ResultAnalysisModel["followUpRecommendations"];
};

export function FollowUpRecommendationSection({ items }: FollowUpRecommendationSectionProps) {
  return (
    <section className="page-card">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">Follow-up questions</p>
          <h2 className="page-card__title">Recommended next prompts</h2>
        </div>
        <span className="section-heading__count">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p className="page-card__body">No follow-up recommendation is available yet.</p>
      ) : (
        <div className="stack-list">
          {items.map((item) => (
            <article className="list-item-card" key={item.id}>
              <div className="list-item-card__content">
                <h3 className="list-item-card__title">{item.title}</h3>
              </div>
              <div className="list-item-card__actions">
                <Link className="secondary-button" to={routeConfig.questionDetail.buildPath({ questionId: item.id })}>
                  View detail
                </Link>
                <Link className="primary-button" to={routeConfig.answerEditor.buildPath({ questionId: item.id })}>
                  Start answer
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
