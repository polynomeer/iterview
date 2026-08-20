import { Link } from "react-router-dom";

type InsightCardProps = {
  label: string;
  title: string;
  body: string;
  tone?: "default" | "accent" | "warning";
  meta?: string[];
  action?: {
    label: string;
    to: string;
  };
};

export function InsightCard({
  label,
  title,
  body,
  tone = "default",
  meta = [],
  action,
}: InsightCardProps) {
  return (
    <section className={`page-card insight-card insight-card--${tone}`}>
      <span className="page-card__label">{label}</span>
      <h2 className="page-card__title">{title}</h2>
      <p className="page-card__body">{body}</p>
      {meta.length > 0 ? (
        <div className="insight-card__meta" role="list">
          {meta.map((item) => (
            <span key={item} className="insight-card__chip" role="listitem">
              {item}
            </span>
          ))}
        </div>
      ) : null}
      {action ? (
        <div className="page-card__actions">
          <Link className="secondary-button" to={action.to}>
            {action.label}
          </Link>
        </div>
      ) : null}
    </section>
  );
}
