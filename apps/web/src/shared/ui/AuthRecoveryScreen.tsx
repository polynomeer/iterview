import { useLocale } from "../i18n";
import { Button, Callout } from "./primitives";
import "./authScreens.css";

type AuthRecoveryScreenProps = {
  title: string;
  description: string;
  errorTitle: string;
  errorBody: string;
  retrySummary?: string;
  onRetry: () => void;
  onClearSession: () => void;
};

/** Full-page stop after automatic session restore gave up: retry, or sign out and start over. */
export function AuthRecoveryScreen({ title, description, errorTitle, errorBody, retrySummary, onRetry, onClearSession }: AuthRecoveryScreenProps) {
  const { t } = useLocale();

  return (
    <main className="auth-status">
      <section className="auth-status__panel">
        <h1 className="auth-status__title">{title}</h1>
        <p className="auth-status__body">{description}</p>
        <Callout title={errorTitle} tone="danger">
          <p>{errorBody}</p>
          {retrySummary ? <p>{retrySummary}</p> : null}
        </Callout>
        <div className="auth-status__actions">
          <Button onClick={onRetry} variant="primary">
            {t("appShell.retryNow")}
          </Button>
          <Button onClick={onClearSession}>{t("appShell.clearSavedSession")}</Button>
        </div>
      </section>
    </main>
  );
}
