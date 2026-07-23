import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { routeConfig } from "../../shared/config/routes";
import { ApiClientError } from "../../shared/api/errors";
import { useAuth } from "../../shared/auth/useAuth";
import { useCurrentUserQuery } from "../../features/auth/api/useCurrentUserQuery";
import { useLogout } from "../../features/auth/useLogout";
import { AuthLoadingScreen } from "../../shared/ui/AuthLoadingScreen";
import { PageContainer } from "../../shared/ui/PageContainer";

export function ProtectedRoute() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
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
        description="Checking your session before opening this screen."
        statusBody="Your account session is being verified before this protected page opens."
        statusTitle="Confirming access"
        title="Loading your account"
      />
    );
  }

  if (currentUserQuery.isError) {
    return (
      <PageContainer
        description="This screen is only available after a valid sign-in."
        eyebrow="Auth"
        title="Session required"
      >
        <section className="page-card">
          <span className="page-card__label">Access blocked</span>
          <h2 className="page-card__title">Please sign in again</h2>
          <p className="page-card__body">
            {currentUserQuery.error instanceof Error
              ? currentUserQuery.error.message
              : "The current session could not be verified."}
          </p>
        </section>
      </PageContainer>
    );
  }

  return <Outlet />;
}
