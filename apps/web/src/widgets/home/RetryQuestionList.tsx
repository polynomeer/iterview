import { Link } from "react-router-dom";
import type { HomeQuestionCardModel } from "../../entities/home/model";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { QuestionStatusBadge } from "../../shared/ui/QuestionStatusBadge";

type RetryQuestionListProps = {
  questions: HomeQuestionCardModel[];
};

export function RetryQuestionList({ questions }: RetryQuestionListProps) {
  const { locale } = useLocale();
  const isKorean = locale === "ko";

  return (
    <section className="page-card home-collection-card home-collection-card--retry">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">{isKorean ? "재도전 큐" : "Retry queue"}</p>
          <h2 className="page-card__title">{isKorean ? "한 번 더 점검이 필요한 질문" : "Questions that need another pass"}</h2>
          <p className="page-card__body home-collection-card__body">
            {isKorean
              ? "이전 답변이 아직 얕거나 불안정했던 질문을 이 레인에서 다시 다루세요."
              : "Use this lane for questions where your previous answer was still shallow or unstable."}
          </p>
        </div>
        <span className="section-heading__count">{questions.length}</span>
      </div>
      <div className="stack-list">
        {questions.map((question) => (
          <article className="list-item-card" key={question.id}>
            <div className="list-item-card__content">
              <div className="list-item-card__meta">
                <QuestionStatusBadge status={question.status} />
                <span>{question.categoryLabel}</span>
              </div>
              <h3 className="list-item-card__title">{question.title}</h3>
              <p className="list-item-card__body">{question.prompt}</p>
            </div>
            <div className="list-item-card__actions">
              <Link
                className="secondary-button"
                to={routeConfig.questionDetail.buildPath({ questionId: question.id })}
              >
                {isKorean ? "상세" : "Detail"}
              </Link>
              <Link className="primary-button" to={routeConfig.answerEditor.buildPath({ questionId: question.id })}>
                {isKorean ? "다시 답변" : "Retry"}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
