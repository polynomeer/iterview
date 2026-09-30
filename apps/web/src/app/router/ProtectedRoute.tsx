import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { routeConfig } from "../../shared/config/routes";
import { ApiClientError, userFacingErrorMessage } from "../../shared/api/errors";
import { useAuth } from "../../shared/auth/useAuth";
import { useCurrentUserQuery } from "../../features/auth/api/useCurrentUserQuery";
import { useLogout } from "../../features/auth/useLogout";
import { AuthLoadingScreen } from "../../shared/ui/AuthLoadingScreen";
import { useLocale } from "../../shared/i18n";
import { PageContainer } from "../../shared/ui/PageContainer";

export function ProtectedRoute() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { t } = useLocale();
  const currentUserQuery = useCurrentUserQuery();
  const logout = useLogout();

  useEffect(() => {
    if (currentUserQuery.error instanceof ApiClientError && currentUserQuery.error.status === 401) {
      logout();
    }
  }, [currentUserQuery.error, logout]);

  if (!isAuthenticated) {
    return (
      <Navigate
        replace
        state={{ redirectTo: `${location.pathname}${location.search}` }}
        to={routeConfig.login.buildPath()}
      />
    );
  }

  if (currentUserQuery.error instanceof ApiClientError && currentUserQuery.error.status === 401) {
    return (
      <Navigate
        replace
        state={{ redirectTo: `${location.pathname}${location.search}` }}
        to={routeConfig.login.buildPath()}
      />
    );
  }

  if (currentUserQuery.isLoading) {
    return (
      <AuthLoadingScreen
        description={t("appShell.protectedLoadingDescription")}
        statusBody={t("appShell.protectedLoadingStatusBody")}
        statusTitle={t("appShell.protectedLoadingStatusTitle")}
        title={t("appShell.protectedLoadingTitle")}
      />
    );
  }

  if (currentUserQuery.isError) {
    return (
      <PageContainer
        description={t("appShell.sessionRequiredDescription")}
        eyebrow={t("appShell.sessionRequiredEyebrow")}
        title={t("appShell.sessionRequiredTitle")}
      >
        <section className="page-card">
          <span className="page-card__label">{t("appShell.accessBlocked")}</span>
          <h2 className="page-card__title">{t("appShell.signInAgain")}</h2>
          <p className="page-card__body">
            {userFacingErrorMessage(currentUserQuery.error, t("appShell.sessionVerifyFailed"))}
          </p>
        </section>
      </PageContainer>
    );
  }

  return <Outlet />;
}
