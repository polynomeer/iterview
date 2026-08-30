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
  InterviewWorkspaceFallback,
} from "../../widgets/interview";

export function InterviewSessionPage() {
  const navigate = useNavigate();
  const { locale, t } = useLocale();
  const isKorean = locale === "ko";
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
        <InterviewWorkspaceFallback
          actions={[
            {
              label: t("interview.startInterview"),
              to: routeConfig.interview.buildPath(),
            },
            {
              label: isKorean ? "복습 큐 열기" : "Open review queue",
              to: routeConfig.reviewQueue.buildPath(),
              variant: "secondary",
            },
          ]}
          badge={isKorean ? "세션 조회" : "Session lookup"}
          body={t("interview.sessionMissingBody")}
          eyebrow={isKorean ? "인터뷰 세션" : "Interview session"}
          signals={[
            { label: isKorean ? "세션 ID" : "Session id", value: isKorean ? "없음" : "Missing", tone: "warning" },
            {
              label: isKorean ? "안전한 다음 단계" : "Safe next move",
              value: isKorean ? "인터뷰 시작 화면으로 다시 진입" : "Re-enter from the interview launcher",
              tone: "accent",
            },
            {
              label: isKorean ? "대체 경로" : "Alternative path",
              value: isKorean ? "복습 큐에서 복구 작업 계속" : "Continue recovery work from the review queue",
            },
          ]}
          summaryBody={
            isKorean
              ? "직접 세션 경로로 들어오려면 구체적인 세션 ID가 필요합니다. 다음 가지가 올바른 이력서와 순회 모드를 상속하도록 실행 화면에서 다시 들어오세요."
              : "A direct session route needs a concrete session id. Re-enter from the launcher so the next branch inherits the right resume and traversal mode."
          }
          summaryTitle={
            isKorean
              ? "이 경로만으로는 DFS 가지를 복원할 수 없습니다."
              : "This route cannot reconstruct a DFS branch on its own."
          }
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
        <InterviewWorkspaceFallback
          actions={[
            {
              label: isKorean ? "세션 다시 조회" : "Retry session lookup",
              onAction: () => {
                void sessionQuery.refetch();
              },
            },
            {
              label: isKorean ? "인터뷰 작업공간으로 돌아가기" : "Back to interview workspace",
              to: routeConfig.interview.buildPath(),
              variant: "secondary",
            },
          ]}
          badge={isKorean ? "복구 필요" : "Recovery needed"}
          body={sessionQuery.error instanceof Error ? sessionQuery.error.message : t("interview.sessionUnavailableBody")}
          details={getErrorDetails(sessionQuery.error)}
          eyebrow={isKorean ? "인터뷰 세션" : "Interview session"}
          signals={[
            {
              label: isKorean ? "현재 상태" : "Current state",
              value: isKorean ? "세션 데이터를 불러오지 못했습니다" : "Session data did not load",
              tone: "warning",
            },
            {
              label: isKorean ? "재시도 경로" : "Retry path",
              value: isKorean ? "넓게 다시 시작하기 전에 이 가지를 새로고침하세요" : "Refresh this branch before restarting broadly",
              tone: "accent",
            },
            {
              label: isKorean ? "대체 경로" : "Fallback path",
              value: isKorean ? "가지가 아직 생성되지 않았다면 실행 화면을 사용하세요" : "Use the launcher if the branch was never created",
            },
          ]}
          summaryBody={
            isKorean
              ? "현재 데이터 응답만으로는 활성 가지를 복원할 수 없습니다. 먼저 다시 시도하고, 이 가지가 더 이상 유효하지 않을 때만 인터뷰 작업공간으로 돌아가세요."
              : "The active branch could not be reconstructed from the current data response. Retry first, then go back to the interview workspace only if this branch is no longer valid."
          }
          summaryTitle={
            isKorean
              ? "세션 껍데기는 열렸지만 가지 데이터는 오지 않았습니다."
              : "The session shell loaded, but the branch payload did not."
          }
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
        <InterviewWorkspaceFallback
          actions={[
            {
              label: t("interview.viewSessionResult"),
              to: routeConfig.interviewSessionResult.buildPath({ sessionId }),
            },
            {
              label: isKorean ? "인터뷰 작업공간으로 돌아가기" : "Back to interview workspace",
              to: routeConfig.interview.buildPath(),
              variant: "secondary",
            },
          ]}
          badge={isKorean ? "가지 완료" : "Branch complete"}
          body={t("interview.noCurrentQuestionBody")}
          eyebrow={isKorean ? "인터뷰 세션" : "Interview session"}
          signals={[
            {
              label: isKorean ? "현재 질문" : "Current question",
              value: isKorean ? "이 세션에는 활성 노드가 남아 있지 않습니다" : "No active node is left in this session",
              tone: "accent",
            },
            {
              label: isKorean ? "가장 좋은 다음 화면" : "Best next surface",
              value: isKorean ? "새 패스를 시작하기 전에 결과를 먼저 읽으세요" : "Read the result before launching a new pass",
            },
            {
              label: isKorean ? "순회 원칙" : "Traversal rule",
              value: isKorean ? "결과를 검토하기 전에는 넓은 범위를 다시 시작하지 마세요" : "Do not restart broad coverage until the result is reviewed",
            },
          ]}
          summaryBody={
            isKorean
              ? "보통은 세션이 이미 활성 가지를 모두 소진했거나 완료 상태로 이동했다는 뜻입니다. 결과를 읽고 다음이 복구인지 확장인지 결정하세요."
              : "This usually means the session has already consumed its active branch or moved into a completed state. Read the result and decide whether recovery or expansion is next."
          }
          summaryTitle={
            isKorean
              ? "이 DFS 패스에는 더 이상 방어할 활성 노드가 없습니다."
              : "The DFS pass no longer has a live node to defend."
          }
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
  const branchDepthLabel = isKorean ? `깊이 ${currentQuestion.depth + 1}` : `Depth ${currentQuestion.depth + 1}`;
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
      ? isKorean
        ? "정확한 주장부터 시작하세요."
        : "Start with the exact claim."
      : trimmedDraftLength < 140
        ? isKorean
          ? "이력서의 사실이나 숫자를 하나 더 붙이세요."
          : "Add one resume fact or number."
        : isKorean
          ? "근거와 트레이드오프를 점검하세요."
          : "Check the evidence and trade-off.";
  const evidenceAnchorCount = currentQuestion.resumeEvidence.length;
  const sessionExecutionSignal =
    !isCurrentQuestionActive
      ? isKorean
        ? "현재 상태 검토"
        : "Review current state"
      : trimmedDraftLength === 0
        ? isKorean
          ? "주장 초안 작성"
          : "Draft the claim"
        : trimmedDraftLength < 140
          ? isKorean
            ? "근거 보강"
            : "Add evidence"
          : canAdvance
            ? isKorean
              ? "이동 준비 완료"
              : "Ready to move"
            : isKorean
              ? "이 노드 방어"
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
            title: isKorean ? "활성 DFS 인터뷰 가지" : "Active DFS interview branch",
            description: isKorean ? "하나의 인터뷰 준비 루프 안에서 계속 진행하세요" : "Stay inside one interview preparation loop",
          }}
          downstream={[
            {
              title: isKorean ? "인터뷰 결과" : "Interview result",
              description: isKorean
                ? "이 가지에 다음으로 복구가 필요한지, 확장이 필요한지 결과 화면에서 판단하세요."
                : "Use the result surface to decide whether this branch needs recovery or expansion next.",
              to: routeConfig.interviewSessionResult.buildPath({ sessionId }),
            },
            {
              title: isKorean ? "노트" : "Notes",
              description: isKorean
                ? "다음 재도전 패스 전에 보강된 설명을 정확히 기록하세요."
                : "Capture the exact repaired explanation before the next retry pass.",
              to: routeConfig.notes.buildPath(),
            },
          ]}
          upstream={[
            {
              title: isKorean ? "인터뷰 시작 화면" : "Interview launcher",
              description: isKorean
                ? "이 활성 가지는 인터뷰 작업공간에서 경계와 순회 모드를 상속받습니다."
                : "This active branch inherits its boundary and traversal mode from the interview workspace.",
              to: routeConfig.interview.buildPath(),
            },
          ]}
        />
        <section className="page-card interview-session-workspace-surface">
          <div className="interview-session-workspace-surface__header">
            <div className="interview-session-workspace-surface__intro">
              <div className="interview-session-workspace-surface__eyebrow-row">
                <span className="page-card__label">{isKorean ? "세션 가지" : "Session branch"}</span>
                <span className="question-status-badge question-status-badge--accent">{branchDepthLabel}</span>
              </div>
              <p className="interview-session-workspace-surface__breadcrumbs">
                {activeSession.interviewModeLabel}
                <span>/</span>
                {currentQuestion.categoryName ?? (isKorean ? "인터뷰 경로" : "Interview path")}
                <span>/</span>
                {currentQuestion.isFollowUp
                  ? isKorean
                    ? "생성된 가지"
                    : "Generated branch"
                  : isKorean
                    ? "루트 가지"
                    : "Root branch"}
              </p>
              <h2 className="interview-session-workspace-surface__title">
                {isKorean ? "이 가지를 먼저 방어하세요" : "Defend this branch first"}
              </h2>
              <p className="interview-session-workspace-surface__body">
                {currentQuestion.title}.{" "}
                {isKorean
                  ? "답변이 구체적이고 근거로 뒷받침될 때까지 이 DFS 경로를 유지하세요."
                  : "Stay on this DFS path until the answer is specific and evidence-backed."}
              </p>
            </div>
            <div
              className="interview-session-workspace-surface__summary-row"
              role="list"
              aria-label={isKorean ? "세션 가지 신호" : "Session branch signals"}
            >
              <span className="interview-session-workspace-surface__summary-item" role="listitem">
                {isKorean ? `범위 ${coveragePercent}%` : `Coverage ${coveragePercent}%`}
              </span>
              <span className="interview-session-workspace-surface__summary-item" role="listitem">
                {isKorean ? `답변 완료 ${answeredQuestionCount}` : `Answered ${answeredQuestionCount}`}
              </span>
              <span className="interview-session-workspace-surface__summary-item" role="listitem">
                {isKorean ? `건너뜀 ${skippedQuestionCount}` : `Skipped ${skippedQuestionCount}`}
              </span>
              <span className="interview-session-workspace-surface__summary-item interview-session-workspace-surface__summary-item--accent" role="listitem">
                {isKorean ? `약한 항목 ${weakFacetCount}` : `Weak facets ${weakFacetCount}`}
              </span>
            </div>
          </div>
          <div className="interview-session-workspace-surface__chips">
            <span className="detail-chip">{currentQuestion.threadLabel ?? branchDepthLabel}</span>
            <span className="detail-chip detail-chip--accent">
              {isKorean ? `출처 ${currentQuestion.sourceLabel}` : `Source ${currentQuestion.sourceLabel}`}
            </span>
            {currentQuestion.contentLocale ? (
              <span className="detail-chip">
                {currentQuestion.contentLocale === "ko" ? t("common.generatedInKorean") : t("common.generatedInEnglish")}
              </span>
            ) : null}
            {activeSession.startedAt ? <span className="detail-chip">{activeSession.startedAt}</span> : null}
            {skippedFacetCount > 0 ? (
              <span className="detail-chip">
                {isKorean ? `건너뜀 항목 ${skippedFacetCount}` : `Skipped facets ${skippedFacetCount}`}
              </span>
            ) : null}
          </div>
          <div
            className="interview-session-workspace-surface__principles"
            role="list"
            aria-label={isKorean ? "세션 가지 원칙" : "Session branch principles"}
          >
            <span role="listitem">
              {isKorean ? "이 주장을 먼저 근거와 함께 마무리하세요." : "Finish this claim with evidence first."}
            </span>
            <span role="listitem">
              {isKorean ? "지금은 옆 가지로 새지 마세요." : "Do not branch sideways yet."}
            </span>
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
                      ? isKorean
                        ? "현재 노드"
                        : "Current node"
                      : question.status === "answered"
                        ? isKorean
                          ? "방어 완료 노드"
                          : "Defended node"
                        : isKorean
                          ? "대기 노드"
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
              <span className="page-card__label">{isKorean ? "현재 방어 노드" : "Current defense node"}</span>
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
                  <span>{isKorean ? "이력서 앵커" : "Resume anchor"}</span>
                  <strong>
                    {currentQuestion.resumeContextSummary ?? (isKorean ? "연결된 이력서 앵커가 아직 없습니다" : "No resume anchor attached yet")}
                  </strong>
                </article>
                <article className="interview-session-current__summary-item">
                  <span>{isKorean ? "꼬리질문 역할" : "Follow-up role"}</span>
                  <strong>
                    {currentQuestion.isFollowUp
                      ? isKorean
                        ? "생성된 가지를 먼저 방어하세요"
                        : "Defend the generated branch first"
                      : isKorean
                        ? "루트 주장을 먼저 고정하세요"
                        : "Lock the root claim first"}
                  </strong>
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
                    {isKorean ? "연결된 질문 열기" : "Open related question"}
                  </Link>
                ) : null}
              </div>
            </section>
            <div className="interview-session-layout__hero-side">
              <SectionPanel className="workspace-note-card workspace-note-card--accent interview-session-side-summary" variant="muted">
                <div className="interview-session-side-summary__topline">
                  <span className="page-card__label">{isKorean ? "활성 가지" : "Active branch"}</span>
                  <span className="question-status-badge question-status-badge--accent">
                    {isKorean ? "DFS 방어" : "DFS defense"}
                  </span>
                </div>
                <h2 className="page-card__title">{isKorean ? "이 노드를 근거로 답변하세요" : "Answer this node with evidence"}</h2>
                <p className="page-card__body">{isKorean ? "다음 가지는 길어지기보다 더 좁아져야 합니다." : "Make the next branch narrower, not longer."}</p>
                <div
                  className="interview-session-side-summary__summary-row"
                  role="list"
                  aria-label={isKorean ? "활성 가지 신호" : "Active branch signals"}
                >
                  <span className="interview-session-side-summary__summary-item" role="listitem">{branchDepthLabel}</span>
                  <span className="interview-session-side-summary__summary-item" role="listitem">
                    {isKorean ? `약한 항목 ${weakFacetCount}` : `Weak facets ${weakFacetCount}`}
                  </span>
                  <span className="interview-session-side-summary__summary-item" role="listitem">
                    {isKorean ? `건너뜀 항목 ${skippedFacetCount}` : `Skipped facets ${skippedFacetCount}`}
                  </span>
                  <span className="interview-session-side-summary__summary-item interview-session-side-summary__summary-item--accent" role="listitem">
                    {sessionExecutionSignal}
                  </span>
                </div>
                <div
                  className="interview-session-side-summary__principles"
                  role="list"
                  aria-label={isKorean ? "활성 가지 원칙" : "Active branch principles"}
                >
                  <span role="listitem">
                    {canAdvance
                      ? isKorean
                        ? "답변이 잠기면 이 노드가 다음 가지를 열 수 있습니다."
                        : "This node can open the next branch once the answer is locked."
                      : isKorean
                        ? "답변하거나 건너뛰기 전까지 이 노드가 가지를 막고 있습니다."
                        : "This node still blocks the branch until you answer or skip it."}
                  </span>
                  <span role="listitem">
                    {evidenceAnchorCount > 0
                      ? isKorean
                        ? `이 가지에는 기준 문서 스니펫 ${evidenceAnchorCount}개가 연결되어 있습니다.`
                        : `${evidenceAnchorCount} source-of-truth snippet${evidenceAnchorCount > 1 ? "s are" : " is"} attached to the branch.`
                      : isKorean
                        ? "이 가지에는 아직 기준 문서 스니펫이 연결되지 않았습니다."
                        : "No source-of-truth snippet is attached to the branch yet."}
                  </span>
                  <span role="listitem">
                    {isKorean ? "주장을 말하고, 근거를 붙이고, 마지막에 트레이드오프를 보여주세요." : "State the claim, attach the evidence, then show the trade-off."}
                  </span>
                  {isFullCoverage ? (
                    <span role="listitem">
                      {isKorean ? "약한 항목과 건너뛴 항목은 DFS 맵에서 의도적으로 다시 방문할 대상이 됩니다." : "Weak and skipped facets become deliberate revisit targets in the DFS map."}
                    </span>
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
                    <span className="page-card__label">{isKorean ? "답변 초안" : "Answer draft"}</span>
                    <span className="question-status-badge question-status-badge--accent">
                      {isKorean ? "실행 레인" : "Execution lane"}
                    </span>
                  </div>
                  <h2 className="page-card__title">
                    {isKorean ? "초안을 현재 가지에 밀착시키세요" : "Keep the draft close to the branch"}
                  </h2>
                </div>
                <div className="interview-session-answer-surface__meta">
                  <span>{currentQuestion.difficultyLabel}</span>
                  <span>{currentQuestion.status}</span>
                  <span>{branchDepthLabel}</span>
                </div>
              </div>
              <p className="page-card__body">
                {isKorean ? "의도를 가지고 답변하고, 건너뛰고, 다음으로 이동하세요." : "Answer, skip, or advance with intent."}
              </p>
              <div
                className="interview-session-answer-surface__summary-row"
                role="list"
                aria-label={isKorean ? "답변 초안 신호" : "Answer draft signals"}
              >
                <span className="interview-session-answer-surface__summary-item" role="listitem">{answerDraftStatus}</span>
                <span className="interview-session-answer-surface__summary-item" role="listitem">
                  {evidenceAnchorCount > 0
                    ? isKorean
                      ? `기준 문서 스니펫 ${evidenceAnchorCount}개 연결됨`
                      : `${evidenceAnchorCount} source-of-truth snippet${evidenceAnchorCount > 1 ? "s" : ""} attached`
                    : isKorean
                      ? "기준 문서 스니펫이 아직 없습니다"
                      : "No source-of-truth snippet yet"}
                </span>
                <span className="interview-session-answer-surface__summary-item interview-session-answer-surface__summary-item--accent" role="listitem">
                  {sessionExecutionSignal}
                </span>
              </div>
              <div
                className="interview-session-answer-surface__principles"
                role="list"
                aria-label={isKorean ? "답변 초안 원칙" : "Answer draft principles"}
              >
                <span role="listitem">
                  {isKorean ? "정확한 결정이나 트레이드오프부터 먼저 답하세요." : "Answer the exact decision or trade-off first."}
                </span>
                <span role="listitem">
                  {isKorean ? "그 사실을 증명하는 수치, 사실, 제약을 붙이세요." : "Attach the fact, metric, or constraint that proves it."}
                </span>
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
                  message={submitMutation.error instanceof Error ? submitMutation.error.message : t("interview.answerSubmissionFailed")}
                  tone="error"
                />
              ) : null}
              {advanceMutation.isError ? (
                <FeedbackNotice
                  details={getErrorDetails(advanceMutation.error)}
                  message={
                    advanceMutation.error instanceof ApiClientError && advanceMutation.error.status === 409
                      ? isKorean
                        ? "이동하기 전에 현재 질문에 답변하거나 건너뛰세요."
                        : "Answer or skip the current question before moving on."
                      : advanceMutation.error instanceof Error
                        ? advanceMutation.error.message
                        : t("interview.advanceFailed")
                  }
                  tone="error"
                />
              ) : null}
              {skipMutation.isError ? (
                <FeedbackNotice
                  details={getErrorDetails(skipMutation.error)}
                  message={skipMutation.error instanceof Error ? skipMutation.error.message : (isKorean ? "현재 질문 건너뛰기에 실패했습니다." : "Skipping the current question failed.")}
                  tone="error"
                />
              ) : null}
              {!canAdvance && isCurrentQuestionActive ? (
                <p className="resume-section__helper interview-session-answer-surface__helper">
                  {isKorean ? "이동하기 전에 현재 질문에 답변하거나 건너뛰세요." : "Answer or skip the current question before moving on."}
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
                    {isKorean ? "질문 건너뛰기" : "Skip question"}
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
                <span className="page-card__label">{isKorean ? "범위 복구" : "Coverage recovery"}</span>
                <h2 className="page-card__title">
                  {isKorean ? "어떤 이력서 사실이 한 번 더 검증돼야 하는지 추적하세요" : "Track which resume facts still need another pass"}
                </h2>
              </div>
              <p className="page-card__body">
                {isKorean
                  ? "약한 항목과 건너뛴 항목은 세션 끝에 남은 찌꺼기가 아닙니다. DFS 패스가 의도적으로 다시 방문해야 하는 가지입니다."
                  : "Weak and skipped facets are not end-of-session leftovers. They are the branches the DFS pass still needs to revisit deliberately."}
              </p>
            </div>
            <div className="interview-facet-panels">
              <InterviewFacetSummaryPanel
                emptyMessage={isKorean ? "이 세션에서 현재 약한 항목은 표시되지 않았습니다." : "No weak facets are currently flagged in this session."}
                eyebrow={isKorean ? "약한 항목" : "Weak facets"}
                helperText={isKorean ? "세션이 더 진행되기 전에 이력서 기반 포인트를 더 강하게 방어해야 합니다." : "These resume-backed points need stronger defense before the session moves on."}
                items={activeSession.summary.weakFacetSummaries}
                title={isKorean ? "추가 방어 필요" : "Needs more defense"}
                tone="warning"
              />
              <InterviewFacetSummaryPanel
                emptyMessage={isKorean ? "이 세션에서 현재 추적 중인 건너뜀 항목이 없습니다." : "No skipped facets are currently tracked in this session."}
                eyebrow={isKorean ? "건너뜀 항목" : "Skipped facets"}
                helperText={isKorean ? "이 영역은 건너뛰었거나 미완료 상태이며, 복구 질문 문구로 다시 돌아올 수 있습니다." : "These areas were skipped or left incomplete and may return as recovery prompts."}
                items={activeSession.summary.skippedFacetSummaries}
                title={isKorean ? "건너뜀 복구" : "Skipped recovery"}
                tone="accent"
              />
            </div>
          </section>
        ) : null}
        {isFullCoverage ? (
          coverageQuery.isLoading || resumeMapQuery.isLoading ? (
            <LoadingStateCard
              body={isKorean ? "이력서 범위 진행도와 플래너 기반 근거 맵을 불러오는 중입니다." : "Loading resume coverage progress and the planner-driven evidence map."}
              title={isKorean ? "범위 패널 준비 중" : "Preparing coverage panel"}
            />
          ) : coverageQuery.isError || resumeMapQuery.isError ? (
            <ErrorStateCard
              body={isKorean ? "이 전체 범위 세션의 범위 패널을 불러오지 못했습니다." : "The coverage panel could not be loaded for this full coverage session."}
              details={getErrorDetails(coverageQuery.error ?? resumeMapQuery.error)}
              onAction={() => {
                void Promise.all([coverageQuery.refetch(), resumeMapQuery.refetch()]);
              }}
              title={isKorean ? "범위 상세를 불러올 수 없습니다" : "Unable to load coverage details"}
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
