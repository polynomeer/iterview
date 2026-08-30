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
  const { locale, t } = useLocale();
  const isKorean = locale === "ko";
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
      description={isKorean ? "지속 가능한 하나의 이력서 기반 면접 작업공간에 접근하고, 기준 문서와 연습 연속성에서 바로 시작하세요." : "Create access to one persistent resume-grounded interview workspace, then start from source-of-truth and practice continuity."}
      eyebrow={isKorean ? "작업공간 접근" : "Workspace access"}
      title={isKorean ? "이력서 기반 면접 작업공간으로 들어가기" : "Enter the resume-grounded interview workspace"}
    >
      <div className="auth-access-layout">
        <section className="auth-access-surface">
          <div className="auth-access-surface__header">
            <div className="auth-access-surface__intro">
              <div className="auth-access-surface__eyebrow-row">
                <span className="page-card__label">{t("auth.authFlowLabel")}</span>
                <span className="question-status-badge question-status-badge--accent">
                  {isKorean ? "작업공간 접근" : "Workspace access"}
                </span>
              </div>
              <p className="auth-access-surface__breadcrumbs">
                {isKorean ? "첫 진입" : "First access"}
                <span>/</span>
                {isKorean ? "이력서 정착" : "Resume grounding"}
                <span>/</span>
                {isKorean ? "연습 연속성" : "Practice continuity"}
              </p>
              <h2 className="auth-access-surface__title">{t("auth.signupCardTitle")}</h2>
              <p className="auth-access-surface__body">{t("auth.signupCardBody")}</p>
            </div>
            <div className="auth-access-surface__stats">
              <article className="auth-access-surface__stat">
                <span>{isKorean ? "첫 목적지" : "First destination"}</span>
                <strong>{isKorean ? "하나로 연결된 작업공간" : "One connected workspace"}</strong>
              </article>
              <article className="auth-access-surface__stat">
                <span>{isKorean ? "가입 후" : "After signup"}</span>
                <strong>{isKorean ? "이력서와 연습 맥락부터 시작" : "Start with resume and practice context"}</strong>
              </article>
            </div>
          </div>
          <div className="auth-access-surface__chips">
            <span className="detail-chip">{isKorean ? "면접과 복습이 계속 연결됩니다" : "Interview and review stay connected"}</span>
            <span className="detail-chip detail-chip--accent">{isKorean ? "마케팅식 우회 없이 바로 진입" : "No marketing-style detour"}</span>
          </div>
          <div className="auth-access-surface__guidance">
            <article className="auth-access-surface__guidance-card">
              <span>{isKorean ? "시작 규칙" : "Start rule"}</span>
              <strong>{isKorean ? "계정은 이력서 기반 DFS 면접 연습을 위한 지속 작업공간에 들어가기 위해서만 만드세요." : "Create an account only to enter one persistent workspace for resume-backed DFS interview practice."}</strong>
            </article>
            <article className="auth-access-surface__guidance-card">
              <span>{isKorean ? "첫 행동" : "First move"}</span>
              <strong>{isKorean ? "가입 후에는 작업공간을 특정 이력서 버전에 정착시켜 이후 후속 질문이 항상 기준 문서를 가지게 하세요." : "After signup, ground the workspace in a resume version so later follow-up questions always have a source of truth."}</strong>
            </article>
          </div>
        </section>

        <div className="auth-access-grid">
          <section className="page-card auth-access-form-card">
            <span className="page-card__label">{t("auth.authFlowLabel")}</span>
            <h2 className="page-card__title">{t("auth.signupCardTitle")}</h2>
            <p className="page-card__body">
              {isKorean
                ? "연습, 면접 복기, 기준 문서 준비에 함께 쓰이는 동일한 작업공간 시스템에 접근 권한을 만드세요."
                : "Create access to the same workspace system used for practice, interview review, and source-of-truth preparation."}
            </p>
            <div className="auth-access-form-card__summary">
              <article className="auth-access-form-card__summary-item">
                <span>{isKorean ? "열리는 작업" : "What opens"}</span>
                <strong>{isKorean ? "이력서 작성, 연습 루프, 결과 복기가 하나의 흐름으로 연결됩니다" : "Resume authoring, practice loops, and result review in one connected flow"}</strong>
              </article>
              <article className="auth-access-form-card__summary-item">
                <span>{isKorean ? "가장 좋은 첫 단계" : "Best first step"}</span>
                <strong>{isKorean ? "스킬 범위 확장이나 모의 깊이 확대보다 먼저 이력서 맥락을 세팅하세요" : "Set up resume context before trying to broaden skill coverage or mock depth"}</strong>
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
                  autoComplete="new-password"
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
                <button className="primary-button" disabled={signupMutation.isPending} type="submit">
                  {signupMutation.isPending ? t("auth.creatingAccount") : t("common.signUp")}
                </button>
                <Link className="secondary-button" to={routeConfig.login.buildPath()}>
                  {t("auth.alreadyHaveAccount")}
                </Link>
              </div>
            </form>
          </section>

          <aside className="auth-access-side">
            <section className="page-card page-card--muted auth-access-note-card">
              <span className="page-card__label">{isKorean ? "다음에 열리는 것" : "What opens next"}</span>
              <h2 className="page-card__title">{isKorean ? "계정 생성은 연습까지의 시간을 줄여야 합니다" : "Account creation should shorten time to practice"}</h2>
              <p className="page-card__body">
                {isKorean
                  ? "회원가입은 이력서 기반 질문과 복기 흐름으로 빠르게 들어가게 할 때만 의미가 있습니다."
                  : "Signup is only useful if it gets you into resume-grounded questioning and review quickly."}
              </p>
            </section>
            <section className="page-card page-card--muted auth-access-note-card">
              <span className="page-card__label">{isKorean ? "작업공간 약속" : "Workspace promise"}</span>
              <div className="stack-list">
                <article className="list-item-card">
                  <div className="list-item-card__content">
                    <h3 className="list-item-card__title">{isKorean ? "기준 문서 우선" : "Source-of-truth first"}</h3>
                    <p className="list-item-card__body">
                      {isKorean
                        ? "이력서 버전, 히트맵 연결, 후속 질문 연습은 가입 후 같은 시스템으로 모입니다."
                        : "Resume versions, heatmap links, and follow-up practice all converge in the same system after signup."}
                    </p>
                  </div>
                </article>
                <article className="list-item-card">
                  <div className="list-item-card__content">
                    <h3 className="list-item-card__title">{isKorean ? "DFS 방식 준비" : "DFS-style preparation"}</h3>
                    <p className="list-item-card__body">
                      {isKorean
                        ? "목표는 계정 생성 자체가 아니라 원자 단위 후속 질문 연습에 더 빨리 도달하는 것입니다."
                        : "The goal is not account creation itself, but reaching atomic follow-up practice faster."}
                    </p>
                  </div>
                </article>
              </div>
            </section>
            <section className="page-card page-card--muted auth-access-note-card">
              <span className="page-card__label">{isKorean ? "빠른 경로" : "Quick path"}</span>
              <div className="skills-signal-list">
                <div className="skills-signal-list__item">
                  <span>{isKorean ? "1. 맥락 정착" : "1. Ground context"}</span>
                  <strong>{isKorean ? "질문 트리가 실제 주장부터 시작할 수 있도록 이력서를 연결하세요." : "Connect your resume so the question tree can start from real claims."}</strong>
                </div>
                <div className="skills-signal-list__item">
                  <span>{isKorean ? "2. 연습 진입" : "2. Enter practice"}</span>
                  <strong>{isKorean ? "한 가지로 들어가 원자 단위 후속 질문 깊이까지 방어하세요." : "Move into one branch and defend it down to atomic follow-up depth."}</strong>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </PageContainer>
  );
}
