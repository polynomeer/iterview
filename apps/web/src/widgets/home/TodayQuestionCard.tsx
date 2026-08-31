import { Link } from "react-router-dom";
import type { HomeQuestionCardModel } from "../../entities/home/model";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { QuestionStatusBadge } from "../../shared/ui/QuestionStatusBadge";

type TodayQuestionCardProps = {
  question: HomeQuestionCardModel;
};

export function TodayQuestionCard({ question }: TodayQuestionCardProps) {
  const { locale } = useLocale();
  const isKorean = locale === "ko";

  return (
    <section className="today-question-card">
      <div className="today-question-card__header">
        <div className="today-question-card__intro">
          <div className="today-question-card__eyebrow-row">
            <span className="page-card__label">{isKorean ? "오늘의 메인 질문" : "Today&apos;s main question"}</span>
            <QuestionStatusBadge status={question.status} />
          </div>
        </div>
        <div className="today-question-card__summary">
          <article className="today-question-card__summary-item">
            <span>{isKorean ? "질문 유형" : "Track"}</span>
            <strong>{question.categoryLabel}</strong>
          </article>
          <article className="today-question-card__summary-item">
            <span>{isKorean ? "난이도" : "Level"}</span>
            <strong>{question.companyLabel}</strong>
          </article>
        </div>
      </div>
      <div className="today-question-card__body-grid">
        <div className="today-question-card__content">
          <h2 className="today-question-card__title">{question.title}</h2>
          <p className="today-question-card__meta">
            {question.categoryLabel} · {question.companyLabel}
          </p>
          <p className="today-question-card__prompt">{question.prompt}</p>
          <div className="today-question-card__chips">
            <span className="detail-chip">{question.categoryLabel}</span>
            <span className="detail-chip detail-chip--accent">{question.companyLabel}</span>
          </div>
          <div className="page-card__actions">
            <Link className="primary-button" to={routeConfig.answerEditor.buildPath({ questionId: question.id })}>
              {isKorean ? "답변 이어가기" : "Continue answering"}
            </Link>
            <Link className="secondary-button" to={routeConfig.questionDetail.buildPath({ questionId: question.id })}>
              {isKorean ? "질문 상세" : "Question details"}
            </Link>
          </div>
        </div>
        <div className="today-question-card__path">
          <span className="page-card__label">{isKorean ? "오늘의 경로" : "Today's path"}</span>
          <div className="today-question-card__path-list">
            <article className="today-question-card__path-item today-question-card__path-item--active">
              <strong>{isKorean ? "현재 앵커 질문" : "Current anchor prompt"}</strong>
              <span>{question.title}</span>
            </article>
            <article className="today-question-card__path-item">
              <strong>{isKorean ? "다음 행동" : "Next move"}</strong>
              <span>{isKorean ? "질문을 잠그고 꼬리질문으로 이동" : "Lock this question, then move into follow-ups"}</span>
            </article>
          </div>
        </div>
      </div>
      <p className="today-question-card__note">
        {isKorean
          ? "더 깊은 브랜치로 들어가기 전에 현재 연습 블록의 앵커 질문으로 다루세요."
          : "Treat this as the anchor question for the current practice block before branching deeper."}
      </p>
    </section>
  );
}
