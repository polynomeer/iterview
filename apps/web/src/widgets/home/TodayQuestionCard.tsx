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
          <p className="today-question-card__breadcrumbs">
            {isKorean ? "핵심 질문 문구" : "Core prompt"}
            <span>/</span>
            {isKorean ? "이력서 방어" : "Resume defense"}
            <span>/</span>
            {isKorean ? "답변 시뮬레이션" : "Answer simulation"}
          </p>
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
            <span className="detail-chip">{isKorean ? "추천 경로" : "Recommended path"}</span>
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
              <strong>{question.title}</strong>
              <span>{isKorean ? "현재 앵커 질문" : "Current anchor prompt"}</span>
            </article>
            <article className="today-question-card__path-item">
              <strong>{isKorean ? "핵심 꼬리질문 정리" : "Follow-up consolidation"}</strong>
              <span>{isKorean ? "세부 논리와 반례 정리" : "Tighten details and counterexamples"}</span>
            </article>
            <article className="today-question-card__path-item">
              <strong>{isKorean ? "최종 답변 시뮬레이션" : "Final answer simulation"}</strong>
              <span>{isKorean ? "면접 답변 흐름까지 연결" : "Connect back into answer delivery"}</span>
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
