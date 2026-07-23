import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { PageContainer } from "../../shared/ui/PageContainer";
import { routeConfig } from "../../shared/config/routes";
import { useSignupMutation } from "../../features/auth/api/useSignupMutation";
import { useAuth } from "../../shared/auth/useAuth";
import { useCurrentUserQuery } from "../../features/auth/api/useCurrentUserQuery";
import { ApiClientError, getErrorDetails } from "../../shared/api/errors";
import { FeedbackNotice } from "../../shared/ui/FeedbackNotice";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { useLogout } from "../../features/auth/useLogout";
import { useLocale } from "../../shared/i18n";

export function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { accessToken, isAuthenticated } = useAuth();
  const currentUserQuery = useCurrentUserQuery();
  const signupMutation = useSignupMutation();
  const logout = useLogout();
  const { t } = useLocale();
  const [email, setEmail] = useState("learner@example.com");
  const [password, setPassword] = useState("password123");
  const redirectTo =
    typeof location.state === "object" &&
    location.state !== null &&
    "redirectTo" in location.state &&
    typeof location.state.redirectTo === "string"
      ? location.state.redirectTo
      : routeConfig.profile.buildPath();

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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await signupMutation.mutateAsync({
      email,
      password,
    });
  }

  const errorMessage =
    signupMutation.error instanceof ApiClientError
      ? signupMutation.error.message
      : signupMutation.error instanceof Error
        ? signupMutation.error.message
        : null;
  const errorDetails = getErrorDetails(signupMutation.error);

  if (accessToken && currentUserQuery.isLoading) {
    return (
      <PageContainer
        description={t("auth.signupLoadingDescription")}
        eyebrow={t("auth.signupEyebrow")}
        title={t("auth.signupLoadingTitle")}
      >
        <LoadingStateCard
          body={t("auth.signupLoadingCardBody")}
          title={t("auth.signupLoadingCardTitle")}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      description={t("auth.signupDescription")}
      eyebrow={t("auth.signupEyebrow")}
      title={t("auth.signupTitle")}
    >
      <section className="page-card">
        <span className="page-card__label">{t("auth.authFlowLabel")}</span>
        <h2 className="page-card__title">{t("auth.signupCardTitle")}</h2>
        <p className="page-card__body">{t("auth.signupCardBody")}</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span className="form-field__label">{t("common.email")}</span>
            <input
              autoComplete="email"
              className="form-field__input"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              value={email}
            />
          </label>
          <label className="form-field">
            <span className="form-field__label">{t("common.password")}</span>
            <input
              autoComplete="new-password"
              className="form-field__input"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />
          </label>
          {errorMessage ? <FeedbackNotice details={errorDetails} message={errorMessage} tone="error" /> : null}
          <div className="page-card__actions">
            <button className="primary-button" disabled={signupMutation.isPending} type="submit">
              {signupMutation.isPending ? t("auth.creatingAccount") : t("common.signUp")}
            </button>
            <Link className="secondary-button" to={routeConfig.login.buildPath()}>
              {t("auth.alreadyHaveAccount")}
            </Link>
          </div>
        </form>
      </section>
    </PageContainer>
  );
}
