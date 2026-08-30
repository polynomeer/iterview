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
      </div>
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
          {isKorean ? "답변 시작" : "Start answer"}
        </Link>
        <Link className="secondary-button" to={routeConfig.questionDetail.buildPath({ questionId: question.id })}>
          {isKorean ? "상세 보기" : "View details"}
        </Link>
      </div>
      <p className="today-question-card__note">
        {isKorean
          ? "더 깊은 브랜치로 들어가기 전에 현재 연습 블록의 앵커 질문으로 다루세요."
          : "Treat this as the anchor question for the current practice block before branching deeper."}
      </p>
    </section>
  );
}
