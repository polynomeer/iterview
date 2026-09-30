import { useEffect, type FormEvent, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCurrentUserQuery } from "../../features/auth/api/useCurrentUserQuery";
import { useLogout } from "../../features/auth/useLogout";
import { ApiClientError } from "../../shared/api/errors";
import { useAuth } from "../../shared/auth/useAuth";
import { routeConfig } from "../../shared/config/routes";
import { useLocale, type MessageKey } from "../../shared/i18n";
import { ButtonLink, PageSkeleton } from "../../shared/ui/primitives";
import "./auth.css";

const STEPS: Array<[MessageKey, MessageKey]> = [
  ["authScreen.step1Title", "authScreen.step1Body"],
  ["authScreen.step2Title", "authScreen.step2Body"],
  ["authScreen.step3Title", "authScreen.step3Body"],
];

/**
 * Sends a signed-in user on to where they were headed, and clears a token the API rejects.
 * Returns true while an existing session is still being checked.
 */
export function useAuthRedirect() {
  const navigate = useNavigate();
  const location = useLocation();
  const { accessToken, isAuthenticated } = useAuth();
  const currentUserQuery = useCurrentUserQuery();
  const logout = useLogout();
  const state = location.state as { redirectTo?: unknown } | null;
  const redirectTo = typeof state?.redirectTo === "string" ? state.redirectTo : routeConfig.home.buildPath();

  useEffect(() => {
    if (isAuthenticated && currentUserQuery.data) {
      navigate(redirectTo, { replace: true });
    }
  }, [currentUserQuery.data, isAuthenticated, navigate, redirectTo]);

  useEffect(() => {
    if (currentUserQuery.error instanceof ApiClientError && currentUserQuery.error.status === 401) {
      logout();
    }
  }, [currentUserQuery.error, logout]);

  return Boolean(accessToken) && currentUserQuery.isLoading;
}

/** Login and signup share this page: the value proposition on one side, the form on the other, no app shell. */
export function AuthScreen({ title, switchPrompt, children, onSubmit }: { title: string; switchPrompt: ReactNode; children: ReactNode; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  const { t } = useLocale();
  const checking = useAuthRedirect();

  return (
    <div className="auth-screen">
      <aside className="auth-screen__pitch">
        <p className="auth-screen__brand">
          <span aria-hidden="true">i</span>iterview
        </p>
        <p className="auth-screen__headline">{t("authScreen.headline")}</p>
        <ol className="auth-screen__steps">
          {STEPS.map(([titleKey, bodyKey], index) => (
            <li key={titleKey}>
              <span aria-hidden="true">{index + 1}</span>
              <div>
                <strong>{t(titleKey)}</strong>
                <p>{t(bodyKey)}</p>
              </div>
            </li>
          ))}
        </ol>
      </aside>
      <main className="auth-screen__main">
        {checking ? (
          <PageSkeleton label={t("authScreen.checking")} />
        ) : (
          <div className="auth-screen__panel">
            <h1 className="auth-screen__title">{title}</h1>
            <p className="auth-screen__switch">{switchPrompt}</p>
            <form className="auth-screen__form" noValidate onSubmit={onSubmit}>
              {children}
            </form>
            <div className="auth-screen__divider">
              <span>{t("authScreen.or")}</span>
            </div>
            <ButtonLink fullWidth size="lg" to={routeConfig.practice.buildPath()}>
              {t("authScreen.browse")}
            </ButtonLink>
          </div>
        )}
      </main>
    </div>
  );
}
