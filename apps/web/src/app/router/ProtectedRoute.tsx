import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { routeConfig } from "../../shared/config/routes";
import { ApiClientError, userFacingErrorMessage } from "../../shared/api/errors";
import { useAuth } from "../../shared/auth/useAuth";
import { useCurrentUserQuery } from "../../features/auth/api/useCurrentUserQuery";
import { useLogout } from "../../features/auth/useLogout";
import { AuthLoadingScreen } from "../../shared/ui/AuthLoadingScreen";
import { useLocale } from "../../shared/i18n";
import { ButtonLink, ErrorState } from "../../shared/ui/primitives";

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
      <AuthLoadingScreen description={t("appShell.protectedLoadingDescription")} title={t("appShell.protectedLoadingTitle")} />
    );
  }

  if (currentUserQuery.isError) {
    return (
      <ErrorState
        actions={
          <ButtonLink to={routeConfig.login.buildPath()} variant="primary">
            {t("appShell.signInAgain")}
          </ButtonLink>
        }
        body={userFacingErrorMessage(currentUserQuery.error, t("appShell.sessionVerifyFailed"))}
        size="page"
        title={t("appShell.sessionRequiredTitle")}
      />
    );
  }

  return <Outlet />;
}
