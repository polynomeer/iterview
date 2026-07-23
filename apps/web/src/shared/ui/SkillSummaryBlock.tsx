export type SkillSummaryItem = {
  id: string;
  label: string;
  value: string;
  helperText?: string;
  tone?: "default" | "accent" | "warning";
};

type SkillSummaryBlockProps = {
  title: string;
  eyebrow?: string;
  items: SkillSummaryItem[];
  emptyMessage?: string;
};

export function SkillSummaryBlock({
  title,
  eyebrow = "Skill summary",
  items,
  emptyMessage = "No skill summary is available yet.",
}: SkillSummaryBlockProps) {
  return (
    <section className="page-card skill-summary-block">
      <span className="page-card__label">{eyebrow}</span>
      <h2 className="page-card__title">{title}</h2>
      {items.length === 0 ? (
        <p className="page-card__body">{emptyMessage}</p>
      ) : (
        <div className="skill-summary-block__grid">
          {items.map((item) => (
            <article
              key={item.id}
              className={`skill-summary-block__item skill-summary-block__item--${item.tone ?? "default"}`}
            >
              <p className="skill-summary-block__label">{item.label}</p>
              <strong className="skill-summary-block__value">{item.value}</strong>
              {item.helperText ? <p className="skill-summary-block__helper">{item.helperText}</p> : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
