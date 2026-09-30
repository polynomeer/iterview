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
  const { locale } = useLocale();
  const isKorean = locale === "ko";
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
        description={isKorean ? "이 화면을 열기 전에 세션을 확인하고 있습니다." : "Checking your session before opening this screen."}
        statusBody={isKorean ? "보호된 페이지를 열기 전에 계정 세션을 검증하고 있습니다." : "Your account session is being verified before this protected page opens."}
        statusTitle={isKorean ? "접근 권한 확인 중" : "Confirming access"}
        title={isKorean ? "계정 정보를 불러오는 중" : "Loading your account"}
      />
    );
  }

  if (currentUserQuery.isError) {
    return (
      <PageContainer
        description={isKorean ? "이 화면은 유효한 로그인 이후에만 사용할 수 있습니다." : "This screen is only available after a valid sign-in."}
        eyebrow={isKorean ? "인증" : "Auth"}
        title={isKorean ? "세션이 필요합니다" : "Session required"}
      >
        <section className="page-card">
          <span className="page-card__label">{isKorean ? "접근 차단" : "Access blocked"}</span>
          <h2 className="page-card__title">{isKorean ? "다시 로그인해주세요" : "Please sign in again"}</h2>
          <p className="page-card__body">
            {userFacingErrorMessage(currentUserQuery.error, isKorean
                ? "현재 세션을 검증할 수 없습니다."
                : "The current session could not be verified.")}
          </p>
        </section>
      </PageContainer>
    );
  }

  return <Outlet />;
}
