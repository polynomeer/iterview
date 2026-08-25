import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  canAdvanceInterviewSession,
  getAnsweredQuestionCount,
  getCurrentInterviewQuestion,
  getSkippedQuestionCount,
} from "../../entities/interview/model";
import { ApiClientError } from "../../shared/api/errors";
import { useAdvanceInterviewSessionMutation } from "../../features/interview/api/useAdvanceInterviewSessionMutation";
import { useInterviewSessionCoverageQuery } from "../../features/interview/api/useInterviewSessionCoverageQuery";
import { useInterviewSessionDetailQuery } from "../../features/interview/api/useInterviewSessionDetailQuery";
import { useInterviewSessionResumeMapQuery } from "../../features/interview/api/useInterviewSessionResumeMapQuery";
import { useSkipInterviewSessionQuestionMutation } from "../../features/interview/api/useSkipInterviewSessionQuestionMutation";
import { useSubmitInterviewSessionAnswerMutation } from "../../features/interview/api/useSubmitInterviewSessionAnswerMutation";
import { useResumeListQuery } from "../../features/resume/api/useResumeListQuery";
import { getActiveResumeVersionId } from "../../entities/resume/model";
import { getErrorDetails } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { EmptyStateCard } from "../../shared/ui/EmptyStateCard";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { FeedbackNotice } from "../../shared/ui/FeedbackNotice";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { PageContainer } from "../../shared/ui/PageContainer";
import { SectionPanel } from "../../shared/ui/layout";
import { WorkspaceContinuityRail } from "../../shared/ui/WorkspaceContinuityRail";
import { AnswerTextEditor } from "../../widgets/answer";
import {
  InterviewCoveragePanel,
  InterviewFacetSummaryPanel,
  InterviewQuestionTimeline,
  InterviewResumeEvidenceBlock,
} from "../../widgets/interview";

export function InterviewSessionPage() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const { sessionId } = useParams<{ sessionId: string }>();
  const [draft, setDraft] = useState("");
  const sessionQuery = useInterviewSessionDetailQuery(sessionId);
  const resumeListQuery = useResumeListQuery();
  const submitMutation = useSubmitInterviewSessionAnswerMutation();
  const advanceMutation = useAdvanceInterviewSessionMutation();
  const skipMutation = useSkipInterviewSessionQuestionMutation();
  const activeResumeVersionId = getActiveResumeVersionId(resumeListQuery.data);
  const isFullCoverageSession = sessionQuery.data?.interviewMode === "full_coverage";
  const coverageQuery = useInterviewSessionCoverageQuery(sessionId, isFullCoverageSession);
  const resumeMapQuery = useInterviewSessionResumeMapQuery(sessionId, isFullCoverageSession);

  useEffect(() => {
    if (sessionId && sessionQuery.data?.status === "completed") {
      navigate(routeConfig.interviewSessionResult.buildPath({ sessionId }));
    }
  }, [navigate, sessionId, sessionQuery.data?.status]);

  if (!sessionId) {
    return (
      <PageContainer
        description={t("interview.sessionMissingDescription")}
        eyebrow={t("interview.pageEyebrow")}
        title={t("interview.sessionUnavailableTitle")}
      >
        <EmptyStateCard
          action={{
            label: t("interview.startInterview"),
            to: routeConfig.interview.buildPath(),
          }}
          body={t("interview.sessionMissingBody")}
          title={t("interview.sessionMissingTitle")}
        />
      </PageContainer>
    );
  }

  if (sessionQuery.isLoading) {
    return (
      <PageContainer
        description={t("interview.sessionDescription")}
        eyebrow={t("interview.pageEyebrow")}
        title={t("interview.sessionWorkspaceTitle")}
      >
        <LoadingStateCard body={t("interview.sessionLoadingBody")} title={t("interview.sessionLoadingTitle")} />
      </PageContainer>
    );
  }

  if (sessionQuery.isError) {
    return (
      <PageContainer
        description={t("interview.sessionUnavailableBody")}
        eyebrow={t("interview.pageEyebrow")}
        title={t("interview.sessionUnavailableTitle")}
      >
        <ErrorStateCard
          body={sessionQuery.error instanceof Error ? sessionQuery.error.message : t("interview.sessionUnavailableBody")}
          details={getErrorDetails(sessionQuery.error)}
          onAction={() => {
            void sessionQuery.refetch();
          }}
          title={t("interview.sessionUnavailableTitle")}
        />
      </PageContainer>
    );
  }

  const activeSession = sessionQuery.data;
  const currentQuestion = activeSession ? getCurrentInterviewQuestion(activeSession) : null;
  const isFullCoverage = activeSession?.interviewMode === "full_coverage";

  if (!activeSession || !currentQuestion) {
    return (
      <PageContainer
        description={t("interview.noCurrentQuestionDescription")}
        eyebrow={t("interview.noCurrentQuestionEyebrow")}
        title={t("interview.sessionUnavailableTitle")}
      >
        <EmptyStateCard
          action={{
            label: t("interview.viewSessionResult"),
            to: routeConfig.interviewSessionResult.buildPath({ sessionId }),
          }}
          body={t("interview.noCurrentQuestionBody")}
          title={t("interview.noCurrentQuestionTitle")}
        />
      </PageContainer>
    );
  }

  const currentSessionId = sessionId;
  const sessionQuestion = currentQuestion;
  const canAdvance = canAdvanceInterviewSession(activeSession);
  const isCurrentQuestionActive = currentQuestion.status.toLowerCase() === "current";
  const answeredQuestionCount = getAnsweredQuestionCount(activeSession);
  const skippedQuestionCount = getSkippedQuestionCount(activeSession);
  const branchDepthLabel = `Depth ${currentQuestion.depth + 1}`;
  const coveragePercent =
    activeSession.summary.totalQuestions > 0
      ? Math.round((answeredQuestionCount / activeSession.summary.totalQuestions) * 100)
      : 0;
  const weakFacetCount = activeSession.summary.weakFacetSummaries.length;
  const skippedFacetCount = activeSession.summary.skippedFacetSummaries.length;
  const isFixedQuestionMode =
    activeSession.interviewMode === "full_coverage" ||
    activeSession.interviewMode === "quick_screen" ||
    activeSession.interviewMode === "mock_30" ||
    activeSession.interviewMode === "mock_60";
  const usesFixedQuestionProgress =
    isFixedQuestionMode &&
    activeSession.summary.totalQuestions > 0 &&
    activeSession.summary.totalQuestions >= activeSession.questions.length &&
    activeSession.summary.totalQuestions >= currentQuestion.orderIndex + 1;
  const trimmedDraftLength = draft.trim().length;
  const answerDraftStatus =
    trimmedDraftLength === 0
      ? "Start with the exact claim."
      : trimmedDraftLength < 140
        ? "Add one resume fact or number."
        : "Check the evidence and trade-off.";
  const evidenceAnchorCount = currentQuestion.resumeEvidence.length;
  const sessionExecutionSignal =
    !isCurrentQuestionActive
      ? "Review current state"
      : trimmedDraftLength === 0
        ? "Draft the claim"
        : trimmedDraftLength < 140
          ? "Add evidence"
          : canAdvance
            ? "Ready to move"
            : "Defend this node";
  const statusRailItems = [
    {
      key: "question",
      label: t("interview.metricQuestion"),
      value: usesFixedQuestionProgress
        ? `${currentQuestion.orderIndex + 1}/${activeSession.summary.totalQuestions}`
        : String(activeSession.questions.length),
      tone: "accent",
    },
    {
      key: "mode",
      label: t("interview.metricMode"),
      value: activeSession.interviewModeLabel,
      tone: "neutral",
    },
    {
      key: "answered",
      label: t("interview.metricAnswered"),
      value: String(getAnsweredQuestionCount(activeSession)),
      tone: "neutral",
    },
    {
      key: "skipped",
      label: t("interview.metricSkipped"),
      value: String(getSkippedQuestionCount(activeSession)),
      tone: "neutral",
    },
    {
      key: "remaining",
      label: t("interview.metricRemaining"),
      value: String(activeSession.summary.remainingQuestions),
      tone: "neutral",
    },
    {
      key: "difficulty",
      label: t("interview.metricDifficulty"),
      value: currentQuestion.difficultyLabel,
      tone: "neutral",
    },
    {
      key: "status",
      label: t("interview.metricStatus"),
      value: currentQuestion.status,
      tone: isCurrentQuestionActive ? "accent" : "neutral",
    },
  ] as const;

  async function handleSubmitAnswer() {
    if (draft.trim().length === 0) {
      return;
    }

    const response = await submitMutation.mutateAsync({
      sessionId: currentSessionId,
      payload: {
        sessionQuestionId: sessionQuestion.id,
        answerMode: "text",
        contentText: draft.trim(),
        resumeVersionId: activeResumeVersionId,
      },
    });

    setDraft("");

    if (response.status === "completed") {
      navigate(routeConfig.interviewSessionResult.buildPath({ sessionId: currentSessionId }));
      return;
    }

    await Promise.all([
      sessionQuery.refetch(),
      isFullCoverage ? coverageQuery.refetch() : Promise.resolve(),
      isFullCoverage ? resumeMapQuery.refetch() : Promise.resolve(),
    ]);
  }

  async function handleSkipQuestion() {
    await skipMutation.mutateAsync({
      sessionId: currentSessionId,
      payload: {
        sessionQuestionId: sessionQuestion.id,
      },
    });

    setDraft("");
  }

  async function handleAdvanceQuestion() {
    if (!canAdvance) {
      return;
    }

    try {
      await advanceMutation.mutateAsync(currentSessionId);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 409) {
        return;
      }
    }
  }

  function jumpToSessionQuestion(sessionQuestionId: string) {
    const target = document.getElementById(`session-question-card-${sessionQuestionId}`);
    target?.scrollIntoView?.({ behavior: "smooth", block: "center" });
  }

  return (
    <PageContainer
      description={t("interview.sessionDescription")}
      eyebrow={t("interview.pageEyebrow")}
      title={t("interview.sessionWorkspaceTitle")}
    >
      <div className="page-stack interview-session-layout">
        <WorkspaceContinuityRail
          current={{
            title: "Active DFS interview branch",
            description: "Stay on the current branch until the answer is specific, evidence-backed, and ready to advance.",
          }}
          downstream={[
            {
              title: "Interview result",
              description: "Use the result surface to decide whether this branch needs recovery or expansion next.",
              to: routeConfig.interviewSessionResult.buildPath({ sessionId }),
            },
            {
              title: "Notes",
              description: "Capture the exact repaired explanation before the next retry pass.",
              to: routeConfig.notes.buildPath(),
            },
          ]}
          upstream={[
            {
              title: "Interview launcher",
              description: "This active branch inherits its boundary and traversal mode from the interview workspace.",
              to: routeConfig.interview.buildPath(),
            },
          ]}
        />
        <section className="page-card interview-session-workspace-surface">
          <div className="interview-session-workspace-surface__header">
            <div className="interview-session-workspace-surface__intro">
              <div className="interview-session-workspace-surface__eyebrow-row">
                <span className="page-card__label">Session branch</span>
                <span className="question-status-badge question-status-badge--accent">{branchDepthLabel}</span>
              </div>
              <p className="interview-session-workspace-surface__breadcrumbs">
                {activeSession.interviewModeLabel}
                <span>/</span>
                {currentQuestion.categoryName ?? "Interview path"}
                <span>/</span>
                {currentQuestion.isFollowUp ? "Generated branch" : "Root branch"}
              </p>
              <h2 className="interview-session-workspace-surface__title">Defend this branch first</h2>
              <p className="interview-session-workspace-surface__body">
                {currentQuestion.title}. Stay on this DFS path until the answer is specific and evidence-backed.
              </p>
            </div>
            <div className="interview-session-workspace-surface__stats">
              <article className="interview-session-workspace-surface__stat">
                <span className="interview-session-workspace-surface__stat-label">Coverage</span>
                <strong className="interview-session-workspace-surface__stat-value">{coveragePercent}%</strong>
              </article>
              <article className="interview-session-workspace-surface__stat">
                <span className="interview-session-workspace-surface__stat-label">Answered</span>
                <strong className="interview-session-workspace-surface__stat-value">{answeredQuestionCount}</strong>
              </article>
              <article className="interview-session-workspace-surface__stat">
                <span className="interview-session-workspace-surface__stat-label">Skip count</span>
                <strong className="interview-session-workspace-surface__stat-value">{skippedQuestionCount}</strong>
              </article>
              <article className="interview-session-workspace-surface__stat">
                <span className="interview-session-workspace-surface__stat-label">Weak facets</span>
                <strong className="interview-session-workspace-surface__stat-value">
                  {weakFacetCount}
                </strong>
              </article>
            </div>
          </div>
          <div className="interview-session-workspace-surface__chips">
            <span className="detail-chip">{currentQuestion.threadLabel ?? branchDepthLabel}</span>
            <span className="detail-chip detail-chip--accent">{`Source ${currentQuestion.sourceLabel}`}</span>
            {currentQuestion.contentLocale ? (
              <span className="detail-chip">
                {currentQuestion.contentLocale === "ko" ? t("common.generatedInKorean") : t("common.generatedInEnglish")}
              </span>
            ) : null}
            {activeSession.startedAt ? <span className="detail-chip">{activeSession.startedAt}</span> : null}
            {skippedFacetCount > 0 ? <span className="detail-chip">{`Skipped facets ${skippedFacetCount}`}</span> : null}
          </div>
          <div className="interview-session-workspace-surface__guidance">
            <article className="interview-session-workspace-surface__guidance-card">
              <span>Current node</span>
              <strong>Finish this claim with evidence.</strong>
            </article>
            <article className="interview-session-workspace-surface__guidance-card">
              <span>Branch discipline</span>
              <strong>Do not branch sideways yet.</strong>
            </article>
          </div>
          <div className="interview-session-workspace-surface__branches" role="list">
            {activeSession.questions.slice(0, 4).map((question) => (
              <button
                className={`interview-session-workspace-surface__branch ${
                  question.id === currentQuestion.id ? "interview-session-workspace-surface__branch--active" : ""
                }${
                  question.status === "answered"
                    ? " interview-session-workspace-surface__branch--answered"
                    : question.id === currentQuestion.id
                      ? ""
                      : " interview-session-workspace-surface__branch--queued"
                }`}
                key={question.id}
                onClick={() => {
                  jumpToSessionQuestion(question.id);
                }}
                type="button"
              >
                <span className="interview-session-workspace-surface__branch-step">{question.orderIndex + 1}</span>
                <span className="interview-session-workspace-surface__branch-copy">
                  <strong>{question.title}</strong>
                  <span>
                    {question.id === currentQuestion.id
                      ? "Current node"
                      : question.status === "answered"
                        ? "Defended node"
                        : "Queued node"}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>
        <div className="interview-session-layout__hero">
          <div className="interview-session-layout__main">
            <section className="page-card interview-session-current">
              <span className="page-card__label">Current defense node</span>
              <h2 className="page-card__title">{currentQuestion.title}</h2>
              {currentQuestion.bodyText ? (
                <p className="page-card__body">{currentQuestion.bodyText}</p>
              ) : (
                <p className="page-card__body">{t("interview.currentQuestionFallback")}</p>
              )}
              {currentQuestion.resumeContextSummary ? (
                <p className="resume-section__helper">{currentQuestion.resumeContextSummary}</p>
              ) : null}
              {currentQuestion.revisitLabel ? (
                <p className="resume-section__helper interview-question-revisit-note">
                  {currentQuestion.revisitLabel}
                </p>
              ) : null}
              <p className="resume-section__helper">{t("interview.mixedLanguageNote")}</p>
              <InterviewResumeEvidenceBlock
                items={currentQuestion.resumeEvidence}
                localeLabel={
                  currentQuestion.contentLocale
                    ? currentQuestion.contentLocale === "ko"
                      ? t("common.generatedInKorean")
                      : t("common.generatedInEnglish")
                    : null
                }
              />
              {currentQuestion.focusSkillNames.length > 0 ? (
                <div className="chip-list">
                  {currentQuestion.focusSkillNames.map((skill) => (
                    <span className="detail-chip detail-chip--accent" key={skill}>
                      {skill}
                    </span>
                  ))}
                </div>
              ) : null}
              <div className="interview-session-current__summary">
                <article className="interview-session-current__summary-item">
                  <span>Resume anchor</span>
                  <strong>{currentQuestion.resumeContextSummary ?? "No resume anchor attached yet"}</strong>
                </article>
                <article className="interview-session-current__summary-item">
                  <span>Follow-up role</span>
                  <strong>{currentQuestion.isFollowUp ? "Defend the generated branch first" : "Lock the root claim first"}</strong>
                </article>
              </div>
              <div className="interview-session-current__rail">
                <div className="interview-session-current__rail-items">
                  {statusRailItems.map((item) => (
                    <span
                      className={`interview-session-current__rail-item ${
                        item.tone === "accent"
                          ? "interview-session-current__rail-item--accent"
                          : ""
                      }`}
                      key={item.key}
                    >
                      <span className="interview-session-current__rail-label">{item.label}</span>
                      <strong className="interview-session-current__rail-value">{item.value}</strong>
                    </span>
                  ))}
                </div>
                {currentQuestion.questionId ? (
                  <Link
                    className="secondary-button interview-session-current__rail-link"
                    to={routeConfig.questionDetail.buildPath({ questionId: currentQuestion.questionId })}
                  >
                    Open related question
                  </Link>
                ) : null}
              </div>
            </section>
            <div className="interview-session-layout__hero-side">
              <SectionPanel className="workspace-note-card workspace-note-card--accent interview-session-side-summary" variant="muted">
                <div className="interview-session-side-summary__topline">
                  <span className="page-card__label">Active branch</span>
                  <span className="question-status-badge question-status-badge--accent">DFS defense</span>
                </div>
                <h2 className="page-card__title">
                  Answer this node with evidence
                </h2>
                <p className="page-card__body">
                  Make the next branch narrower, not longer.
                </p>
                <div className="interview-session-side-summary__stats">
                  <article className="interview-session-side-summary__stat">
                    <span>Branch depth</span>
                    <strong>{branchDepthLabel}</strong>
                  </article>
                  <article className="interview-session-side-summary__stat">
                    <span>Weak facets</span>
                    <strong>{weakFacetCount}</strong>
                  </article>
                  <article className="interview-session-side-summary__stat">
                    <span>Skipped facets</span>
                    <strong>{skippedFacetCount}</strong>
                  </article>
                </div>
                <div className="interview-session-side-summary__signals">
                  <article className="interview-session-side-summary__signal">
                    <span>Advance state</span>
                    <strong>{canAdvance ? "Next node can open" : "This node still blocks the branch"}</strong>
                  </article>
                  <article className="interview-session-side-summary__signal">
                    <span>Recovery focus</span>
                    <strong>{weakFacetCount > 0 ? "Tighten weak facets first" : "No weak facets are forcing a retry"}</strong>
                  </article>
                  <article className="interview-session-side-summary__signal">
                    <span>Resume anchors</span>
                    <strong>
                      {evidenceAnchorCount > 0
                        ? `${evidenceAnchorCount} snippet${evidenceAnchorCount > 1 ? "s" : ""} attached`
                        : "No source-of-truth snippet yet"}
                    </strong>
                  </article>
                  <article className="interview-session-side-summary__signal">
                    <span>Execution signal</span>
                    <strong>{sessionExecutionSignal}</strong>
                  </article>
                </div>
                <div className="interview-session-side-panel__list">
                  <div className="interview-session-side-panel__item">
                    <strong>1. Claim</strong>
                    <span>State the decision in one sentence.</span>
                  </div>
                  <div className="interview-session-side-panel__item">
                    <strong>2. Evidence</strong>
                    <span>Attach resume facts, numbers, or constraints.</span>
                  </div>
                  <div className="interview-session-side-panel__item">
                    <strong>3. Trade-off</strong>
                    <span>Show what you accepted and why.</span>
                  </div>
                  <div className="interview-session-side-panel__item">
                    <strong>{canAdvance ? "Advance is unlocked" : "Advance is blocked"}</strong>
                    <span>
                      {canAdvance
                        ? "This branch can move deeper."
                        : "Submit or skip before the next follow-up opens."}
                    </span>
                  </div>
                  <div className="interview-session-side-panel__item">
                    <strong>Weak facet watch</strong>
                    <span>{weakFacetCount > 0 ? `${weakFacetCount} weak facets still need defense.` : "No weak facets are flagged."}</span>
                  </div>
                  {isFullCoverage ? (
                    <div className="interview-session-side-panel__item interview-session-side-panel__item--coverage">
                      <strong>Coverage pass</strong>
                      <span>Weak and skipped facets become revisit targets in the DFS map.</span>
                    </div>
                  ) : null}
                </div>
              </SectionPanel>
            </div>
          </div>
          <div className="interview-session-layout__answer-stack">
            <section className="page-card interview-session-answer-surface">
              <div className="interview-session-answer-surface__header">
                <div>
                  <div className="interview-session-answer-surface__topline">
                    <span className="page-card__label">Answer draft</span>
                    <span className="question-status-badge question-status-badge--accent">Execution lane</span>
                  </div>
                  <h2 className="page-card__title">Keep the draft close to the branch</h2>
                </div>
                <div className="interview-session-answer-surface__meta">
                  <span>{currentQuestion.difficultyLabel}</span>
                  <span>{currentQuestion.status}</span>
                  <span>{branchDepthLabel}</span>
                </div>
              </div>
              <p className="page-card__body">
                Answer, skip, or advance with intent.
              </p>
              <div className="interview-session-answer-surface__draft-status">
                <article className="interview-session-answer-surface__draft-status-card">
                  <span>Draft checkpoint</span>
                  <strong>{answerDraftStatus}</strong>
                </article>
                <article className="interview-session-answer-surface__draft-status-card">
                  <span>Resume anchors</span>
                  <strong>
                    {evidenceAnchorCount > 0
                      ? `${evidenceAnchorCount} source-of-truth snippet${evidenceAnchorCount > 1 ? "s" : ""} attached`
                      : "No source-of-truth snippet yet"}
                  </strong>
                </article>
                <article className="interview-session-answer-surface__draft-status-card">
                  <span>Execution signal</span>
                  <strong>{sessionExecutionSignal}</strong>
                </article>
              </div>
              <div className="interview-session-answer-surface__guidance">
                <article className="interview-session-answer-surface__guidance-card">
                  <span>Branch goal</span>
                  <strong>Make the next follow-up narrower.</strong>
                </article>
                <article className="interview-session-answer-surface__guidance-card">
                  <span>Evidence rule</span>
                  <strong>Use one concrete fact, number, or constraint.</strong>
                </article>
              </div>
              <div className="interview-session-answer-surface__playbook">
                <article className="interview-session-answer-surface__playbook-step">
                  <span>1. State the claim</span>
                  <strong>Answer the exact decision or trade-off first</strong>
                </article>
                <article className="interview-session-answer-surface__playbook-step">
                  <span>2. Lock the evidence</span>
                  <strong>Attach the fact, metric, or constraint that proves it</strong>
                </article>
              </div>
              <AnswerTextEditor
                disabled={submitMutation.isPending || advanceMutation.isPending || skipMutation.isPending}
                mode="workspace"
                onChange={setDraft}
                value={draft}
              />
              {submitMutation.isError ? (
                <FeedbackNotice
                  details={getErrorDetails(submitMutation.error)}
                  message={submitMutation.error instanceof Error ? submitMutation.error.message : "Answer submission failed."}
                  tone="error"
                />
              ) : null}
              {advanceMutation.isError ? (
                <FeedbackNotice
                  details={getErrorDetails(advanceMutation.error)}
                  message={
                    advanceMutation.error instanceof ApiClientError && advanceMutation.error.status === 409
                      ? "Answer or skip the current question before moving on."
                      : advanceMutation.error instanceof Error
                        ? advanceMutation.error.message
                        : "Advancing to the next question failed."
                  }
                  tone="error"
                />
              ) : null}
              {skipMutation.isError ? (
                <FeedbackNotice
                  details={getErrorDetails(skipMutation.error)}
                  message={skipMutation.error instanceof Error ? skipMutation.error.message : "Skipping the current question failed."}
                  tone="error"
                />
              ) : null}
              {!canAdvance && isCurrentQuestionActive ? (
                <p className="resume-section__helper interview-session-answer-surface__helper">
                  Answer or skip the current question before moving on.
                </p>
              ) : null}
              <div className="interview-session-answer-surface__actions">
                <div className="interview-session-answer-surface__primary-actions">
                  <button
                    className="primary-button"
                    disabled={trimmedDraftLength === 0 || submitMutation.isPending || skipMutation.isPending}
                    onClick={() => {
                      void handleSubmitAnswer();
                    }}
                    type="button"
                  >
                    {t("interview.submitAnswer")}
                  </button>
                  <button
                    className="secondary-button"
                    disabled={skipMutation.isPending || submitMutation.isPending || !isCurrentQuestionActive}
                    onClick={() => {
                      void handleSkipQuestion();
                    }}
                    type="button"
                  >
                    Skip question
                  </button>
                </div>
                <div className="interview-session-answer-surface__secondary-actions">
                  {activeSession.summary.remainingQuestions > 0 ? (
                    <button
                      className="secondary-button"
                      disabled={advanceMutation.isPending || skipMutation.isPending || !canAdvance}
                      onClick={() => {
                        void handleAdvanceQuestion();
                      }}
                      type="button"
                    >
                      {t("interview.nextQuestion")}
                    </button>
                  ) : (
                    <Link
                      className="primary-button"
                      to={routeConfig.interviewSessionResult.buildPath({ sessionId })}
                    >
                      {t("interview.finishSession")}
                    </Link>
                  )}
                  <Link className="secondary-button" to={routeConfig.interview.buildPath()}>
                    {t("interview.exitSession")}
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
        <InterviewQuestionTimeline
          currentQuestionId={currentQuestion.id}
          items={activeSession.questions}
        />
        {isFullCoverage ? (
          <section className="page-card interview-facet-panels-shell">
            <div className="interview-facet-panels-shell__header">
              <div>
                <span className="page-card__label">Coverage recovery</span>
                <h2 className="page-card__title">Track which resume facts still need another pass</h2>
              </div>
              <p className="page-card__body">
                Weak and skipped facets are not end-of-session leftovers. They are the branches the DFS pass still needs to revisit deliberately.
              </p>
            </div>
            <div className="interview-facet-panels">
              <InterviewFacetSummaryPanel
                emptyMessage="No weak facets are currently flagged in this session."
                eyebrow="Weak facets"
                helperText="These resume-backed points need stronger defense before the session moves on."
                items={activeSession.summary.weakFacetSummaries}
                title="Needs more defense"
                tone="warning"
              />
              <InterviewFacetSummaryPanel
                emptyMessage="No skipped facets are currently tracked in this session."
                eyebrow="Skipped facets"
                helperText="These areas were skipped or left incomplete and may return as recovery prompts."
                items={activeSession.summary.skippedFacetSummaries}
                title="Skipped recovery"
                tone="accent"
              />
            </div>
          </section>
        ) : null}
        {isFullCoverage ? (
          coverageQuery.isLoading || resumeMapQuery.isLoading ? (
            <LoadingStateCard
              body="Loading resume coverage progress and the planner-driven evidence map."
              title="Preparing coverage panel"
            />
          ) : coverageQuery.isError || resumeMapQuery.isError ? (
            <ErrorStateCard
              body="The coverage panel could not be loaded for this full coverage session."
              details={getErrorDetails(coverageQuery.error ?? resumeMapQuery.error)}
              onAction={() => {
                void Promise.all([coverageQuery.refetch(), resumeMapQuery.refetch()]);
              }}
              title="Unable to load coverage details"
            />
          ) : (
            <InterviewCoveragePanel
              coverage={coverageQuery.data ?? null}
              onJumpToQuestion={jumpToSessionQuestion}
              resumeMap={resumeMapQuery.data ?? null}
            />
          )
        ) : null}
      </div>
    </PageContainer>
  );
}
