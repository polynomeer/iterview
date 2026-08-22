import { Link } from "react-router-dom";
import type { HomeQuestionCardModel } from "../../entities/home/model";
import { routeConfig } from "../../shared/config/routes";
import { QuestionStatusBadge } from "../../shared/ui/QuestionStatusBadge";

type TodayQuestionCardProps = {
  question: HomeQuestionCardModel;
};

export function TodayQuestionCard({ question }: TodayQuestionCardProps) {
  return (
    <section className="today-question-card">
      <div className="today-question-card__header">
        <div className="today-question-card__intro">
          <div className="today-question-card__eyebrow-row">
            <span className="page-card__label">Today&apos;s main question</span>
            <QuestionStatusBadge status={question.status} />
          </div>
          <p className="today-question-card__breadcrumbs">
            Core prompt
            <span>/</span>
            Resume defense
            <span>/</span>
            Answer simulation
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
          Start answer
        </Link>
        <Link className="secondary-button" to={routeConfig.questionDetail.buildPath({ questionId: question.id })}>
          View details
        </Link>
      </div>
      <p className="today-question-card__note">
        Treat this as the anchor question for the current practice block before branching deeper.
      </p>
    </section>
  );
}
