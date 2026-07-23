import type { QuestionDetailModel } from "../../entities/question/model";
import { useLocale } from "../../shared/i18n";

type QuestionPromptCardProps = {
  question: QuestionDetailModel;
};

export function QuestionPromptCard({ question }: QuestionPromptCardProps) {
  const { t } = useLocale();

  return (
    <section className="question-hero">
      <span className="page-card__label">{t("answer.promptLabel")}</span>
      <h2 className="question-hero__title">{question.title}</h2>
      <p className="question-hero__meta">
        {question.category} · {question.difficulty}
      </p>
      <p className="question-hero__body">{question.body}</p>
      {(question.relatedSkills ?? []).length > 0 ? (
        <div className="chip-list">
          {(question.relatedSkills ?? []).map((skill) => (
            <span className="detail-chip detail-chip--accent" key={skill}>
              {skill}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}
