import { Link } from "react-router-dom";
import type { QuestionDetailModel } from "../../entities/question/model";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";

type QuestionHeaderProps = {
  question: QuestionDetailModel;
};

export function QuestionHeader({ question }: QuestionHeaderProps) {
  const { t } = useLocale();

  return (
    <section className="question-hero">
      <div className="question-hero__topline">
        <span className="page-card__label">{t("question.interviewQuestion")}</span>
        <span className="detail-chip detail-chip--accent">Ready to answer</span>
      </div>
      <h2 className="question-hero__title">{question.title}</h2>
      <div className="question-hero__meta" role="list">
        <span className="question-hero__meta-pill" role="listitem">{question.category}</span>
        <span className="question-hero__meta-pill" role="listitem">{question.difficulty}</span>
      </div>
      <p className="question-hero__body">{question.body}</p>
      <div className="question-hero__chips">
        {question.companies.slice(0, 2).map((company) => (
          <span className="detail-chip" key={company}>{`Target ${company}`}</span>
        ))}
        {question.roles.slice(0, 2).map((role) => (
          <span className="detail-chip detail-chip--accent" key={role}>{`Role ${role}`}</span>
        ))}
      </div>
      <div className="page-card__actions">
        <Link
          className="primary-button"
          to={routeConfig.answerEditor.buildPath({ questionId: question.id })}
        >
          {t("question.startAnswer")}
        </Link>
        <Link
          className="secondary-button"
          to={routeConfig.questionTree.buildPath({ questionId: question.id })}
        >
          {t("question.openTree")}
        </Link>
      </div>
      <p className="question-hero__note">
        Use the tree only after the core answer path is clear enough to defend under follow-up pressure.
      </p>
    </section>
  );
}
