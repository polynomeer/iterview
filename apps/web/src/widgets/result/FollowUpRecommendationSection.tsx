import { Link } from "react-router-dom";
import type { ResultAnalysisModel } from "../../entities/result/model";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";

type FollowUpRecommendationSectionProps = {
  items: ResultAnalysisModel["followUpRecommendations"];
};

export function FollowUpRecommendationSection({ items }: FollowUpRecommendationSectionProps) {
  const { locale } = useLocale();
  const isKorean = locale === "ko";

  return (
    <section className="page-card result-analysis-section-card result-analysis-section-card--recommendations">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">{isKorean ? "꼬리질문" : "Follow-up questions"}</p>
          <h2 className="page-card__title">{isKorean ? "추천 다음 질문 문구" : "Recommended next prompts"}</h2>
        </div>
        <span className="section-heading__count">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p className="page-card__body">{isKorean ? "아직 추천 꼬리질문이 없습니다." : "No follow-up recommendation is available yet."}</p>
      ) : (
        <div className="stack-list">
          {items.map((item) => (
            <article className="list-item-card result-followup-card" key={item.id}>
              <div className="list-item-card__content">
                <div className="list-item-card__meta">
                  <span>{isKorean ? "깊이 복구" : "Depth recovery"}</span>
                </div>
                <h3 className="list-item-card__title">{item.title}</h3>
              </div>
              <div className="list-item-card__actions">
                <Link className="secondary-button" to={routeConfig.questionDetail.buildPath({ questionId: item.id })}>
                  {isKorean ? "상세 보기" : "View detail"}
                </Link>
                <Link className="primary-button" to={routeConfig.answerEditor.buildPath({ questionId: item.id })}>
                  {isKorean ? "답변 시작" : "Start answer"}
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
