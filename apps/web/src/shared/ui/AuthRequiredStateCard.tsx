import { Link, useLocation } from "react-router-dom";
import { routeConfig } from "../config/routes";
import { useLocale } from "../i18n";

type AuthRequiredStateCardProps = {
  title: string;
  body: string;
  secondaryAction?: {
    label: string;
    to: string;
  };
};

export function AuthRequiredStateCard({
  title,
  body,
  secondaryAction,
}: AuthRequiredStateCardProps) {
  const location = useLocation();
  const { t } = useLocale();

  return (
    <section className="page-card state-card state-card--empty">
      <span className="page-card__label">{t("auth.loginRequired")}</span>
      <h2 className="page-card__title">{title}</h2>
      <p className="page-card__body">{body}</p>
      <div className="page-card__actions">
        <Link
          className="primary-button"
          state={{ redirectTo: `${location.pathname}${location.search}` }}
          to={routeConfig.login.buildPath()}
        >
          {t("common.login")}
        </Link>
        {secondaryAction ? (
          <Link className="secondary-button" to={secondaryAction.to}>
            {secondaryAction.label}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
