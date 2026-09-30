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
  secondaryAction?: StateCardAction;
};

export function StateCard({
  label,
  title,
  body,
  details = [],
  tone,
  size = "page",
  action,
  secondaryAction,
}: StateCardProps) {
  const semanticRole = tone === "error" ? "alert" : "status";
  const liveMode = tone === "error" ? "assertive" : "polite";

  return (
    <section
      aria-live={liveMode}
      className={`page-card state-card state-card--${tone} state-card--${size}`}
      role={semanticRole}
    >
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
      {action || secondaryAction ? (
        <div className="page-card__actions">
          {action ? <StateCardActionControl action={action} /> : null}
          {secondaryAction ? (
            <StateCardActionControl action={{ variant: "secondary", ...secondaryAction }} />
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function StateCardActionControl({ action }: { action: StateCardAction }) {
  const className = action.variant === "secondary" ? "secondary-button" : "primary-button";

  if ("to" in action && action.to !== undefined) {
    return (
      <Link className={className} to={action.to}>
        {action.label}
      </Link>
    );
  }

  return (
    <button className={className} onClick={action.onAction} type="button">
      {action.label}
    </button>
  );
}
