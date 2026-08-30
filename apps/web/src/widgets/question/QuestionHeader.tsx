import { Link } from "react-router-dom";
import type { QuestionDetailModel } from "../../entities/question/model";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";

type QuestionHeaderProps = {
  question: QuestionDetailModel;
};

export function QuestionHeader({ question }: QuestionHeaderProps) {
  const { t } = useLocale();
  const relatedSkills = question.relatedSkills ?? [];

  return (
    <section className="question-hero question-hero--detail-workspace">
      <div className="question-hero__topline">
        <span className="page-card__label">{t("question.interviewQuestion")}</span>
        <span className="detail-chip detail-chip--accent">{t("question.readyToAnswer")}</span>
      </div>
      <h2 className="question-hero__title">{question.title}</h2>
      <div className="question-hero__meta" role="list">
        <span className="question-hero__meta-pill" role="listitem">{question.category}</span>
        <span className="question-hero__meta-pill" role="listitem">{question.difficulty}</span>
      </div>
      <p className="question-hero__body">{question.body}</p>
      <div className="question-hero__supporting">
        <article className="question-hero__supporting-item">
          <span>{t("question.companyTargets")}</span>
          <strong>{question.companies.length}</strong>
        </article>
        <article className="question-hero__supporting-item">
          <span>{t("question.roleAnchors")}</span>
          <strong>{question.roles.length}</strong>
        </article>
        <article className="question-hero__supporting-item">
          <span>{t("question.skillAnchors")}</span>
          <strong>{relatedSkills.length}</strong>
        </article>
      </div>
      <div className="question-hero__chips">
        {question.companies.slice(0, 2).map((company) => (
          <span className="detail-chip" key={company}>{`${t("question.targetPrefix")} ${company}`}</span>
        ))}
        {question.roles.slice(0, 2).map((role) => (
          <span className="detail-chip detail-chip--accent" key={role}>{`${t("question.rolePrefix")} ${role}`}</span>
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
        {t("question.treeFollowupNote")}
      </p>
    </section>
  );
}
