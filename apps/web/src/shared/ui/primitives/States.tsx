import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

type StateProps = {
  title: ReactNode;
  body?: ReactNode;
  icon?: IconName;
  /** One primary action, optionally followed by a secondary one. */
  actions?: ReactNode;
  /** Extra lines such as validation details. */
  details?: string[];
  /** "section" sits inside a card; "page" stands alone in the content area. */
  size?: "section" | "page";
};

function StatePanel({ tone, title, body, icon, actions, details = [], size = "section" }: StateProps & { tone: "empty" | "error" }) {
  return (
    <div
      aria-live={tone === "error" ? "assertive" : "polite"}
      className={`ui-state ui-state--${tone} ui-state--${size}`}
      role={tone === "error" ? "alert" : "status"}
    >
      <Icon className="ui-state__icon" name={icon ?? (tone === "error" ? "alert" : "info")} size={28} />
      <h2 className="ui-state__title">{title}</h2>
      {body ? <p className="ui-state__body">{body}</p> : null}
      {details.length > 0 ? (
        <ul className="ui-state__details">
          {details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      ) : null}
      {actions ? <div className="ui-state__actions">{actions}</div> : null}
    </div>
  );
}

export function EmptyState(props: StateProps) {
  return <StatePanel tone="empty" {...props} />;
}

export function ErrorState(props: StateProps) {
  return <StatePanel tone="error" {...props} />;
}
