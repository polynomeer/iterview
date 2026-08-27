import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { PageContainer } from "../../shared/ui/PageContainer";
import { routeConfig } from "../../shared/config/routes";
import { useLoginMutation } from "../../features/auth/api/useLoginMutation";
import { useAuth } from "../../shared/auth/useAuth";
import { useCurrentUserQuery } from "../../features/auth/api/useCurrentUserQuery";
import { ApiClientError, getErrorDetails } from "../../shared/api/errors";
import { FeedbackNotice } from "../../shared/ui/FeedbackNotice";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { useLogout } from "../../features/auth/useLogout";
import { useLocale } from "../../shared/i18n";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { accessToken, isAuthenticated } = useAuth();
  const currentUserQuery = useCurrentUserQuery();
  const loginMutation = useLoginMutation();
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
    await loginMutation.mutateAsync({
      email,
      password,
    });
  }

  const errorMessage =
    loginMutation.error instanceof ApiClientError
      ? loginMutation.error.message
      : loginMutation.error instanceof Error
        ? loginMutation.error.message
        : null;
  const errorDetails = getErrorDetails(loginMutation.error);

  if (accessToken && currentUserQuery.isLoading) {
    return (
      <PageContainer
        description={t("auth.loginLoadingDescription")}
        eyebrow={t("auth.loginEyebrow")}
        title={t("auth.loginLoadingTitle")}
      >
        <LoadingStateCard
          body={t("auth.loginLoadingCardBody")}
          title={t("auth.loginLoadingCardTitle")}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      description={t("auth.loginPageDescription")}
      eyebrow={t("auth.workspaceAccess")}
      title={t("auth.loginPageTitle")}
    >
      <div className="auth-access-layout">
        <section className="auth-access-surface">
          <div className="auth-access-surface__header">
            <div className="auth-access-surface__intro">
              <div className="auth-access-surface__eyebrow-row">
                <span className="page-card__label">{t("auth.authFlowLabel")}</span>
                <span className="question-status-badge question-status-badge--accent">
                  {t("auth.workspaceAccess")}
                </span>
              </div>
              <p className="auth-access-surface__breadcrumbs">
                {t("auth.reentry")}
                <span>/</span>
                {t("auth.interviewHistory")}
                <span>/</span>
                {t("auth.resumeContinuity")}
              </p>
              <h2 className="auth-access-surface__title">{t("auth.loginCardTitle")}</h2>
              <p className="auth-access-surface__body">{t("auth.loginCardBody")}</p>
            </div>
            <div className="auth-access-surface__stats">
              <article className="auth-access-surface__stat">
                <span>{t("auth.returnPath")}</span>
                <strong>{t("auth.returnPathValue")}</strong>
              </article>
              <article className="auth-access-surface__stat">
                <span>{t("auth.afterLogin")}</span>
                <strong>{t("auth.afterLoginValue")}</strong>
              </article>
            </div>
          </div>
          <div className="auth-access-surface__chips">
            <span className="detail-chip">{t("auth.reviewHistoryAttached")}</span>
            <span className="detail-chip detail-chip--accent">{t("auth.noOnboardingDetour")}</span>
          </div>
          <div className="auth-access-surface__guidance">
            <article className="auth-access-surface__guidance-card">
              <span>{t("auth.reentryRule")}</span>
              <strong>{t("auth.reentryRuleBody")}</strong>
            </article>
            <article className="auth-access-surface__guidance-card">
              <span>{t("auth.nextDestination")}</span>
              <strong>{t("auth.nextDestinationBody")}</strong>
            </article>
          </div>
        </section>

        <div className="auth-access-grid">
          <section className="page-card auth-access-form-card">
            <span className="page-card__label">{t("auth.authFlowLabel")}</span>
            <h2 className="page-card__title">{t("auth.loginCardTitle")}</h2>
            <p className="page-card__body">{t("auth.loginFormBody")}</p>
            <div className="auth-access-form-card__summary">
              <article className="auth-access-form-card__summary-item">
                <span>{t("auth.whatOpens")}</span>
                <strong>{t("auth.whatOpensValue")}</strong>
              </article>
              <article className="auth-access-form-card__summary-item">
                <span>{t("auth.bestNextStep")}</span>
                <strong>{t("auth.bestNextStepValue")}</strong>
              </article>
            </div>
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
                  autoComplete="current-password"
                  className="form-field__input"
                  name="password"
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  value={password}
                />
              </label>
              {errorMessage ? (
                <FeedbackNotice details={errorDetails} message={errorMessage} tone="error" />
              ) : null}
              <div className="page-card__actions">
                <button className="primary-button" disabled={loginMutation.isPending} type="submit">
                  {loginMutation.isPending ? t("auth.loggingIn") : t("common.login")}
                </button>
                <Link className="secondary-button" to={routeConfig.signup.buildPath()}>
                  {t("common.createAccount")}
                </Link>
              </div>
            </form>
          </section>

          <aside className="auth-access-side">
            <section className="page-card page-card--muted auth-access-note-card">
              <span className="page-card__label">{t("auth.whyThisMatters")}</span>
              <h2 className="page-card__title">{t("auth.whyThisMattersTitle")}</h2>
              <p className="page-card__body">{t("auth.whyThisMattersBody")}</p>
            </section>
            <section className="page-card page-card--muted auth-access-note-card">
              <span className="page-card__label">{t("auth.whatReturns")}</span>
              <div className="stack-list">
                <article className="list-item-card">
                  <div className="list-item-card__content">
                    <h3 className="list-item-card__title">{t("auth.interviewContinuity")}</h3>
                    <p className="list-item-card__body">{t("auth.interviewContinuityBody")}</p>
                  </div>
                </article>
                <article className="list-item-card">
                  <div className="list-item-card__content">
                    <h3 className="list-item-card__title">{t("auth.resumeGroundedPreparation")}</h3>
                    <p className="list-item-card__body">{t("auth.resumeGroundedPreparationBody")}</p>
                  </div>
                </article>
              </div>
            </section>
            <section className="page-card page-card--muted auth-access-note-card">
              <span className="page-card__label">{t("auth.quickPath")}</span>
              <div className="skills-signal-list">
                <div className="skills-signal-list__item">
                  <span>{t("auth.quickPathStep1")}</span>
                  <strong>{t("auth.quickPathStep1Body")}</strong>
                </div>
                <div className="skills-signal-list__item">
                  <span>{t("auth.quickPathStep2")}</span>
                  <strong>{t("auth.quickPathStep2Body")}</strong>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </PageContainer>
  );
}
