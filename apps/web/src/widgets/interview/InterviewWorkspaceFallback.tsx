import { Link } from "react-router-dom";

type InterviewWorkspaceFallbackAction =
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

type InterviewWorkspaceFallbackSignal = {
  label: string;
  value: string;
  tone?: "default" | "accent" | "warning";
};

type InterviewWorkspaceFallbackProps = {
  eyebrow: string;
  badge: string;
  title: string;
  body: string;
  summaryTitle: string;
  summaryBody: string;
  signals: InterviewWorkspaceFallbackSignal[];
  actions: InterviewWorkspaceFallbackAction[];
  details?: string[];
};

export function InterviewWorkspaceFallback({
  eyebrow,
  badge,
  title,
  body,
  summaryTitle,
  summaryBody,
  signals,
  actions,
  details = [],
}: InterviewWorkspaceFallbackProps) {
  return (
    <section className="page-card interview-workspace-fallback" role="status">
      <div className="interview-workspace-fallback__topline">
        <span className="page-card__label">{eyebrow}</span>
        <span className="question-status-badge question-status-badge--accent">{badge}</span>
      </div>
      <div className="interview-workspace-fallback__hero">
        <div className="interview-workspace-fallback__copy">
          <h2 className="interview-workspace-fallback__title">{title}</h2>
          <p className="interview-workspace-fallback__body">{body}</p>
        </div>
        <aside className="interview-workspace-fallback__summary">
          <span className="interview-workspace-fallback__summary-label">Recovery summary</span>
          <strong>{summaryTitle}</strong>
          <p>{summaryBody}</p>
        </aside>
      </div>
      <div className="interview-workspace-fallback__signals">
        {signals.map((signal) => (
          <article
            className={`interview-workspace-fallback__signal${
              signal.tone ? ` interview-workspace-fallback__signal--${signal.tone}` : ""
            }`}
            key={`${signal.label}-${signal.value}`}
          >
            <span>{signal.label}</span>
            <strong>{signal.value}</strong>
          </article>
        ))}
      </div>
      {details.length > 0 ? (
        <ul className="interview-workspace-fallback__details">
          {details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      ) : null}
      <div className="page-card__actions">
        {actions.map((action) =>
          "to" in action && action.to ? (
            <Link
              className={action.variant === "secondary" ? "secondary-button" : "primary-button"}
              key={`${action.label}-${action.to}`}
              to={action.to}
            >
              {action.label}
            </Link>
          ) : (
            <button
              className={action.variant === "secondary" ? "secondary-button" : "primary-button"}
              key={action.label}
              onClick={action.onAction}
              type="button"
            >
              {action.label}
            </button>
          ),
        )}
      </div>
    </section>
  );
}
