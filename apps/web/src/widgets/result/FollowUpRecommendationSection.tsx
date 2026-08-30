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
          <h2 className="page-card__title">{isKorean ? "추천 다음 프롬프트" : "Recommended next prompts"}</h2>
          <p className="page-card__body">
            {isKorean
              ? "약점이 표현 문제가 아니라 깊이 부족에서 올 때만 이 추천을 사용하세요."
              : "Use these only when the weakness comes from missing depth rather than weak phrasing."}
          </p>
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
                <h3 className="list-item-card__title">{item.title}</h3>
                <p className="result-followup-card__body">
                  {isKorean
                    ? "현재 답변에서 근거가 부족했던 가지를 더 깊게 파고들 때 이 꼬리질문을 사용하세요."
                    : "Use this follow-up to go deeper into the branch that stayed under-evidenced in the current answer."}
                </p>
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
