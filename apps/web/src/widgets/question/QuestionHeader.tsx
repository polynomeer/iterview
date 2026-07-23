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
      <span className="page-card__label">{t("question.interviewQuestion")}</span>
      <h2 className="question-hero__title">{question.title}</h2>
      <p className="question-hero__meta">
        {question.category} · {question.difficulty}
      </p>
      <p className="question-hero__body">{question.body}</p>
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
    </section>
  );
}
