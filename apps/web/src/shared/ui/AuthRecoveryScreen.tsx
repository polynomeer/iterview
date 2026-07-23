type AuthRecoveryScreenProps = {
  title: string;
  description: string;
  errorTitle: string;
  errorBody: string;
  retrySummary?: string;
  onRetry: () => void;
  onClearSession: () => void;
};

export function AuthRecoveryScreen({
  title,
  description,
  errorTitle,
  errorBody,
  retrySummary,
  onRetry,
  onClearSession,
}: AuthRecoveryScreenProps) {
  return (
    <section className="auth-recovery-screen">
      <div className="auth-recovery-screen__hero">
        <span className="page-card__label">Auth</span>
        <h1 className="auth-loading-screen__title">{title}</h1>
        <p className="auth-loading-screen__description">{description}</p>
      </div>

      <div className="auth-recovery-screen__grid">
        <section className="auth-loading-screen__panel auth-loading-screen__panel--primary">
          <span className="page-card__label">Recovery</span>
          <h2 className="page-card__title">{errorTitle}</h2>
          <p className="page-card__body">{errorBody}</p>
          {retrySummary ? <p className="auth-loading-screen__meta">{retrySummary}</p> : null}
          <div className="page-card__actions">
            <button className="primary-button" onClick={onRetry} type="button">
              Retry now
            </button>
            <button className="secondary-button" onClick={onClearSession} type="button">
              Clear saved session
            </button>
          </div>
        </section>

        <section className="auth-loading-screen__panel">
          <span className="page-card__label">What to check</span>
          <ul className="auth-loading-screen__list">
            <li>Confirm the backend API is running and reachable from the browser.</li>
            <li>Check whether the saved token belongs to the current local environment.</li>
            <li>Retry after the API recovers instead of refreshing the whole app.</li>
          </ul>
        </section>

        <section className="auth-loading-screen__panel">
          <span className="page-card__label">Desktop workflow</span>
          <p className="page-card__body">
            Keep this recovery screen open while the API starts, then retry from here without
            losing your current tab state.
          </p>
        </section>
      </div>
    </section>
  );
}
