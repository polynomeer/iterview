import { Link } from "react-router-dom";

type StateCardAction =
  | {
      label: string;
      to: string;
      onAction?: never;
      variant?: "primary" | "secondary";
    }
  | {
      label: string;
      onAction: () => void;
      to?: never;
      variant?: "primary" | "secondary";
    };

type StateCardProps = {
  label: string;
  title: string;
  body: string;
  details?: string[];
  tone: "loading" | "empty" | "error";
  size?: "page" | "section";
  action?: StateCardAction;
};

export function StateCard({
  label,
  title,
  body,
  details = [],
  tone,
  size = "page",
  action,
}: StateCardProps) {
  const actionClassName = action?.variant === "secondary" ? "secondary-button" : "primary-button";

  return (
    <section className={`page-card state-card state-card--${tone} state-card--${size}`}>
      <span className="page-card__label">{label}</span>
      <h2 className="page-card__title">{title}</h2>
      <p className="page-card__body">{body}</p>
      {details.length > 0 ? (
        <ul className="state-card__details">
          {details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      ) : null}
      {action ? (
        <div className="page-card__actions">
          {"to" in action && action.to !== undefined ? (
            <Link className={actionClassName} to={action.to}>
              {action.label}
            </Link>
          ) : (
            <button className={actionClassName} onClick={action.onAction} type="button">
              {action.label}
            </button>
          )}
        </div>
      ) : null}
    </section>
  );
}
