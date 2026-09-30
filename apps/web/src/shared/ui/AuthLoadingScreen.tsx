import { useLocale } from "../i18n";

type AuthLoadingScreenProps = {
  title: string;
  description: string;
  statusTitle: string;
  statusBody: string;
  eyebrow?: string;
  statusEyebrow?: string;
  statusMeta?: string;
  checksEyebrow?: string;
  checks?: string[];
  nextEyebrow?: string;
  nextBody?: string;
};

export function AuthLoadingScreen({
  title,
  description,
  statusTitle,
  statusBody,
  eyebrow,
  statusEyebrow,
  statusMeta,
  checksEyebrow,
  checks,
  nextEyebrow,
  nextBody,
}: AuthLoadingScreenProps) {
  const { t } = useLocale();
  const resolvedEyebrow = eyebrow ?? t("auth.loadingEyebrow");
  const resolvedStatusEyebrow = statusEyebrow ?? t("common.loadingState");
  const resolvedChecksEyebrow = checksEyebrow ?? t("auth.sessionChecks");
  const resolvedChecks = checks ?? [
    t("auth.sessionCheckRestoreToken"),
    t("auth.sessionCheckLoadProfile"),
    t("auth.sessionCheckOpenRoutes"),
  ];
  const resolvedNextEyebrow = nextEyebrow ?? t("auth.whatOpensNext");
  const resolvedNextBody =
    nextBody ??
t("appShell.authLoadingNextBody");

  return (
    <section className="auth-loading-screen">
      <div className="auth-loading-screen__hero">
        <span className="page-card__label">{resolvedEyebrow}</span>
        <h1 className="auth-loading-screen__title">{title}</h1>
        <p className="auth-loading-screen__description">{description}</p>
        <div className="auth-loading-screen__progress">
          <span className="auth-loading-screen__progress-bar" />
        </div>
      </div>

      <div className="auth-loading-screen__grid">
        <section className="auth-loading-screen__panel auth-loading-screen__panel--primary">
          <span className="page-card__label">{resolvedStatusEyebrow}</span>
          <h2 className="page-card__title">{statusTitle}</h2>
          <p className="page-card__body">{statusBody}</p>
          {statusMeta ? <p className="auth-loading-screen__meta">{statusMeta}</p> : null}
        </section>

        <section className="auth-loading-screen__panel">
          <span className="page-card__label">{resolvedChecksEyebrow}</span>
          <ul className="auth-loading-screen__list">
            {resolvedChecks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="auth-loading-screen__panel">
          <span className="page-card__label">{resolvedNextEyebrow}</span>
          <p className="page-card__body">{resolvedNextBody}</p>
        </section>
      </div>
    </section>
  );
}
