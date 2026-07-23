import type { InterviewSessionQuestionModel } from "../../entities/interview/model";
import { useLocale } from "../../shared/i18n";

type InterviewResumeEvidenceBlockProps = {
  items: InterviewSessionQuestionModel["resumeEvidence"];
  localeLabel?: string | null;
};

export function InterviewResumeEvidenceBlock({
  items,
  localeLabel,
}: InterviewResumeEvidenceBlockProps) {
  const { t } = useLocale();

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="interview-evidence-block">
      <div className="interview-evidence-block__header chip-list">
        <span className="page-card__label">{t("interview.basedOnYourResume")}</span>
        {localeLabel ? <span className="detail-chip">{localeLabel}</span> : null}
      </div>
      <div className="stack-list">
        {items.slice(0, 2).map((item) => (
          <article className="interview-evidence-card" key={item.id}>
            <div className="list-item-card__meta">
              {item.sectionLabel ? <span>{item.sectionLabel}</span> : null}
              {item.label ? <span>{item.label}</span> : null}
              {item.confidenceLabel ? <span>{item.confidenceLabel}</span> : null}
            </div>
            <p className="interview-evidence-card__snippet">"{item.snippet}"</p>
          </article>
        ))}
      </div>
    </section>
  );
}
