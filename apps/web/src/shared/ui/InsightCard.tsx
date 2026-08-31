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
      <div className="list-item-card__content">
        <div className="list-item-card__meta insight-card__meta-row">
          <span className="page-card__label insight-card__label">{label}</span>
          {meta.map((item) => (
            <span key={item} className="insight-card__chip" role="listitem">
              {item}
            </span>
          ))}
        </div>
        <h2 className="page-card__title insight-card__title">{title}</h2>
        <p className="page-card__body insight-card__body">{body}</p>
      </div>
      {action ? (
        <div className="page-card__actions insight-card__actions">
          <Link className="secondary-button" to={action.to}>
            {action.label}
          </Link>
        </div>
      ) : null}
    </section>
  );
}
