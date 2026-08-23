import type { QuestionDetailModel } from "../../entities/question/model";
import { useLocale } from "../../shared/i18n";

type QuestionPromptCardProps = {
  question: QuestionDetailModel;
};

export function QuestionPromptCard({ question }: QuestionPromptCardProps) {
  const { t } = useLocale();
  const relatedSkills = question.relatedSkills ?? [];

  return (
    <section className="question-hero question-hero--answer-workspace">
      <div className="question-hero__topline">
        <span className="page-card__label">{t("answer.promptLabel")}</span>
        <span className="question-status-badge">Prompt node</span>
      </div>
      <h2 className="question-hero__title">{question.title}</h2>
      <div className="question-hero__meta">
        <span className="question-hero__meta-pill">{question.category}</span>
        <span className="question-hero__meta-pill">{question.difficulty}</span>
        <span className="question-hero__meta-pill">
          {relatedSkills.length > 0 ? `${relatedSkills.length} skill anchors` : "No skill anchors"}
        </span>
      </div>
      <p className="question-hero__body">{question.body}</p>
      <p className="question-hero__note">
        Start with a direct claim, attach one concrete fact from the resume, and leave no vague line that can expand unchecked in the next follow-up.
      </p>
      {relatedSkills.length > 0 ? (
        <div className="question-hero__chips">
          {relatedSkills.map((skill) => (
            <span className="detail-chip detail-chip--accent" key={skill}>
              {skill}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}
