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
  eyebrow = "Auth",
  statusEyebrow = "Loading",
  statusMeta,
  checksEyebrow = "Session checks",
  checks = [
    "Restore the saved access token",
    "Load the current user profile",
    "Open protected routes after verification",
  ],
  nextEyebrow = "What opens next",
  nextBody = "Profile, resume intelligence, skill radar, review queue, and interview session tools become available as soon as the session is confirmed.",
}: AuthLoadingScreenProps) {
  return (
    <section className="auth-loading-screen">
      <div className="auth-loading-screen__hero">
        <span className="page-card__label">{eyebrow}</span>
        <h1 className="auth-loading-screen__title">{title}</h1>
        <p className="auth-loading-screen__description">{description}</p>
        <div className="auth-loading-screen__progress">
          <span className="auth-loading-screen__progress-bar" />
        </div>
      </div>

      <div className="auth-loading-screen__grid">
        <section className="auth-loading-screen__panel auth-loading-screen__panel--primary">
          <span className="page-card__label">{statusEyebrow}</span>
          <h2 className="page-card__title">{statusTitle}</h2>
          <p className="page-card__body">{statusBody}</p>
          {statusMeta ? <p className="auth-loading-screen__meta">{statusMeta}</p> : null}
        </section>

        <section className="auth-loading-screen__panel">
          <span className="page-card__label">{checksEyebrow}</span>
          <ul className="auth-loading-screen__list">
            {checks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="auth-loading-screen__panel">
          <span className="page-card__label">{nextEyebrow}</span>
          <p className="page-card__body">{nextBody}</p>
        </section>
      </div>
    </section>
  );
}
