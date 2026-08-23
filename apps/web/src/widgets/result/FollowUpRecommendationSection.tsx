import { Link } from "react-router-dom";
import type { ResultAnalysisModel } from "../../entities/result/model";
import { routeConfig } from "../../shared/config/routes";

type FollowUpRecommendationSectionProps = {
  items: ResultAnalysisModel["followUpRecommendations"];
};

export function FollowUpRecommendationSection({ items }: FollowUpRecommendationSectionProps) {
  return (
    <section className="page-card result-analysis-section-card result-analysis-section-card--recommendations">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">Follow-up questions</p>
          <h2 className="page-card__title">Recommended next prompts</h2>
          <p className="page-card__body">
            Use these only when the weakness comes from missing depth rather than weak phrasing.
          </p>
        </div>
        <span className="section-heading__count">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p className="page-card__body">No follow-up recommendation is available yet.</p>
      ) : (
        <div className="stack-list">
          {items.map((item) => (
            <article className="list-item-card result-followup-card" key={item.id}>
              <div className="list-item-card__content">
                <h3 className="list-item-card__title">{item.title}</h3>
                <p className="result-followup-card__body">
                  Use this follow-up to go deeper into the branch that stayed under-evidenced in the
                  current answer.
                </p>
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
