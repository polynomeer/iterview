import { Link, useParams } from "react-router-dom";
import { getAnsweredQuestionCount } from "../../entities/interview/model";
import { useInterviewSessionCoverageQuery } from "../../features/interview/api/useInterviewSessionCoverageQuery";
import { useInterviewSessionDetailQuery } from "../../features/interview/api/useInterviewSessionDetailQuery";
import { useInterviewSessionResumeMapQuery } from "../../features/interview/api/useInterviewSessionResumeMapQuery";
import { useResumeVersionResultSectionsQuery } from "../../features/resume/api/useResumeVersionResultSectionsQuery";
import { getErrorDetails } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { PageContainer } from "../../shared/ui/PageContainer";
import { WorkspaceContinuityRail } from "../../shared/ui/WorkspaceContinuityRail";
import { useLocale } from "../../shared/i18n";
import { InterviewFullCoverageResultView, InterviewWorkspaceFallback } from "../../widgets/interview";

export function InterviewResultPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { locale, t } = useLocale();
  const isKorean = locale === "ko";
  const sessionQuery = useInterviewSessionDetailQuery(sessionId);
  const isFullCoverageSession = sessionQuery.data?.interviewMode === "full_coverage";
  const coverageQuery = useInterviewSessionCoverageQuery(sessionId, isFullCoverageSession);
  const resumeMapQuery = useInterviewSessionResumeMapQuery(sessionId, isFullCoverageSession);
  const resultSectionsQuery = useResumeVersionResultSectionsQuery(
    sessionQuery.data?.resumeVersionId ?? undefined,
    isFullCoverageSession && Boolean(sessionQuery.data?.resumeVersionId),
  );

  if (!sessionId) {
    return (
      <PageContainer
        description={t("result.missingDescription")}
        eyebrow={t("result.pageEyebrow")}
        title={t("result.unavailableTitle")}
      >
        <InterviewWorkspaceFallback
          actions={[
            {
              label: t("result.startInterview"),
              to: routeConfig.interview.buildPath(),
            },
            {
              label: isKorean ? "복습 큐 열기" : "Open review queue",
              to: routeConfig.reviewQueue.buildPath(),
              variant: "secondary",
            },
          ]}
          badge={isKorean ? "결과 조회" : "Result lookup"}
          body={t("result.missingBody")}
          eyebrow={isKorean ? "인터뷰 결과" : "Interview result"}
          signals={[
            { label: isKorean ? "세션 id" : "Session id", value: isKorean ? "없음" : "Missing", tone: "warning" },
            { label: isKorean ? "안전한 다음 동작" : "Safe next move", value: isKorean ? "인터뷰 워크스페이스에서 다시 시작" : "Restart from the interview workspace", tone: "accent" },
            { label: isKorean ? "대체 경로" : "Alternative path", value: isKorean ? "복습 큐에서 보강 계속하기" : "Continue remediation from the review queue" },
          ]}
          summaryBody={isKorean ? "결과 경로는 실제 세션만 요약할 수 있습니다. 다음 패스가 실제 가지 맥락에서 시작되도록 런처나 복습 큐를 통해 다시 들어오세요." : "A result route can only summarize a concrete session. Re-enter through the launcher or the review queue so the next pass starts from real branch context."}
          summaryTitle={isKorean ? "이 결과 화면에는 요약할 세션이 없습니다." : "This result surface has no session to summarize."}
          title={t("result.missingTitle")}
        />
      </PageContainer>
    );
  }

  if (sessionQuery.isLoading) {
    return (
      <PageContainer
        description={t("result.loadingDescription")}
        eyebrow={t("result.pageEyebrow")}
        title={t("result.pageTitle")}
      >
        <LoadingStateCard body={t("result.loadingBody")} title={t("result.loadingTitle")} />
      </PageContainer>
    );
  }

  if (sessionQuery.isError) {
    return (
      <PageContainer
        description={t("result.loadErrorDescription")}
        eyebrow={t("result.pageEyebrow")}
        title={t("result.unavailableTitle")}
      >
        <InterviewWorkspaceFallback
          actions={[
            {
              label: isKorean ? "결과 다시 불러오기" : "Retry result lookup",
              onAction: () => {
                void sessionQuery.refetch();
              },
            },
            {
              label: isKorean ? "인터뷰 워크스페이스로 돌아가기" : "Back to interview workspace",
              to: routeConfig.interview.buildPath(),
              variant: "secondary",
            },
          ]}
          badge={isKorean ? "복구 필요" : "Recovery needed"}
          body={sessionQuery.error instanceof Error ? sessionQuery.error.message : t("result.loadErrorBody")}
          details={getErrorDetails(sessionQuery.error)}
          eyebrow={isKorean ? "인터뷰 결과" : "Interview result"}
          signals={[
            { label: isKorean ? "현재 상태" : "Current state", value: isKorean ? "결과 데이터를 불러오지 못함" : "Result data did not load", tone: "warning" },
            { label: isKorean ? "재시도 경로" : "Retry path", value: isKorean ? "새로 시작하기 전에 완료된 패스를 새로고침" : "Refresh the finished pass before starting a new one", tone: "accent" },
            { label: isKorean ? "대체 경로" : "Fallback path", value: isKorean ? "세션이 사라졌다면 런처로 돌아가기" : "Return to the launcher if the session no longer exists" },
          ]}
          summaryBody={isKorean ? "결과 화면 껍데기는 열렸지만 완료된 세션 요약을 재구성하지 못했습니다. 마지막 가지 맥락을 잃지 않도록 먼저 다시 시도하세요." : "The shell is reachable but the completed session summary could not be reconstructed. Retry first so you do not lose the last branch context."}
          summaryTitle={isKorean ? "결과 화면은 열렸지만 세션 요약은 불러오지 못했습니다." : "The result shell loaded, but the session summary did not."}
          title={t("result.loadErrorTitle")}
        />
      </PageContainer>
    );
  }

  const session = sessionQuery.data;
  const shouldRenderFullCoverageResult =
    session?.status === "completed" &&
    session.interviewMode === "full_coverage" &&
    Boolean(session.resumeVersionId);

  if (!session) {
    return (
      <PageContainer
        description={t("result.notFoundDescription")}
        eyebrow={t("result.pageEyebrow")}
        title={t("result.unavailableTitle")}
      >
        <InterviewWorkspaceFallback
          actions={[
            {
              label: t("result.startInterview"),
              to: routeConfig.interview.buildPath(),
            },
            {
              label: isKorean ? "홈 워크스페이스로 돌아가기" : "Back to home workspace",
              to: routeConfig.home.buildPath(),
              variant: "secondary",
            },
          ]}
          badge={isKorean ? "세션 요약 없음" : "No session summary"}
          body={t("result.notFoundBody")}
          eyebrow={isKorean ? "인터뷰 결과" : "Interview result"}
          signals={[
            { label: isKorean ? "세션 상태" : "Session status", value: isKorean ? "완료된 요약이 없습니다" : "No completed summary is available", tone: "warning" },
            { label: isKorean ? "권장 다음 동작" : "Best next move", value: isKorean ? "인터뷰 워크스페이스에서 새 패스를 시작" : "Launch a fresh pass from the interview workspace", tone: "accent" },
            { label: isKorean ? "탐색 대체 경로" : "Navigation fallback", value: isKorean ? "오래된 기록에서 온 경로면 홈으로 돌아가기" : "Return home if this route came from stale history" },
          ]}
          summaryBody={isKorean ? "이 경로는 저장된 세션 요약으로 연결되지 않았습니다. 새 가지를 시작하거나, 이곳으로 연결한 워크스페이스로 돌아가세요." : "This route did not resolve to a stored session summary. Start a fresh branch or step back to the workspace that linked here."}
          summaryTitle={isKorean ? "결과 화면이 완료된 인터뷰 패스를 찾지 못했습니다." : "The result surface cannot find a finished interview pass."}
          title={t("result.notFoundTitle")}
        />
      </PageContainer>
    );
  }

  const answeredCount = getAnsweredQuestionCount(session);
  const skippedCount = session.summary.skippedQuestions;
  const averageScoreLabel = session.summary.averageScoreLabel ?? "-";
  const weakFacetCount =
    shouldRenderFullCoverageResult && coverageQuery.data
      ? coverageQuery.data.weakFacetSummaries.length
      : 0;
  const skippedFacetCount =
    shouldRenderFullCoverageResult && coverageQuery.data
      ? coverageQuery.data.skippedFacetSummaries.length
      : 0;
  const unresolvedBranchCount = weakFacetCount + skippedFacetCount;
  const recoverySignal =
    unresolvedBranchCount > 0
      ? weakFacetCount > 0
        ? (isKorean ? "약한 가지 복구" : "Weak-branch recovery")
        : (isKorean ? "건너뛴 세부 항목 복구" : "Skipped-facet recovery")
      : (isKorean ? "인접 가지 확장" : "Adjacent branch expansion");
  const nextActionLabel = weakFacetCount > 0 || skippedFacetCount > 0 ? (isKorean ? "복구 패스" : "Recovery pass") : (isKorean ? "인접 가지" : "Neighbor branch");
  const recommendedActionLabel =
    weakFacetCount > 0 || skippedFacetCount > 0 ? (isKorean ? "좁은 복구 패스 시작" : "Start a narrow recovery pass") : (isKorean ? "인접 가지로 이어가기" : "Continue to a neighboring branch");
  const recoveryModeTone =
    weakFacetCount > 0 ? "warning" : skippedFacetCount > 0 ? "accent" : "neutral";

  return (
    <PageContainer
      description={t("result.pageDescription")}
      eyebrow={t("result.pageEyebrow")}
      title={t("result.pageTitle")}
    >
      <div className="interview-result-layout">
        <WorkspaceContinuityRail
          current={{
            title: isKorean ? "세션 복구 결정" : "Session recovery decision",
            description: isKorean ? "완료된 세션을 더 좁은 복구 패스나 정당화된 다음 가지로 바꾸세요." : "Translate the finished session into a narrower recovery pass or a justified next branch.",
          }}
          downstream={[
            {
              title: isKorean ? "복습 큐" : "Review queue",
              description: isKorean ? "해결되지 않은 약한 가지와 건너뛴 가지를 의도적인 재시도 작업으로 넘기세요." : "Push unresolved weak or skipped branches into deliberate retry work.",
              to: routeConfig.reviewQueue.buildPath(),
            },
            {
              title: isKorean ? "이력서 분석" : "Resume analysis",
              description: isKorean ? "약한 가지가 빈약한 주장으로 되돌아가면 기준 문서 검토로 돌아가세요." : "Return to source-of-truth review when the weak branch points back to a thin claim.",
              to: routeConfig.resumeAnalysis.buildPath(),
            },
          ]}
          upstream={[
            {
              title: isKorean ? "인터뷰 세션" : "Interview session",
              description: isKorean ? "이 결과는 방금 방어한 가지의 연속으로 읽어야 합니다." : "This result should be read as the continuation of the branch you just defended.",
              to: routeConfig.interviewSession.buildPath({ sessionId }),
            },
          ]}
        />
        <section className="page-card interview-result-workspace-surface">
          <div className="interview-result-workspace-surface__header">
            <div className="interview-result-workspace-surface__intro">
              <div className="interview-result-workspace-surface__eyebrow-row">
                <span className="page-card__label">{isKorean ? "결과 워크스페이스" : "Result workspace"}</span>
                <span className="question-status-badge question-status-badge--accent">{isKorean ? "가지 복기" : "Branch review"}</span>
              </div>
              <p className="interview-result-workspace-surface__breadcrumbs">
                {isKorean ? "세션 회고" : "Session recap"}
                <span>/</span>
                {isKorean ? "약한 가지 복구" : "Weak branch recovery"}
                <span>/</span>
                {isKorean ? "다음 DFS 패스" : "Next DFS pass"}
              </p>
              <h2 className="interview-result-workspace-surface__title">{isKorean ? "버틴 가지를 복기하세요" : "Review what held up"}</h2>
              <p className="interview-result-workspace-surface__body">
                {isKorean ? "버틴 가지는 유지하고, 얕게 남은 가지는 다시 들어가세요." : "Keep the branches that held up. Re-enter the ones that stayed shallow."}
              </p>
            </div>
            <div className="interview-result-workspace-surface__summary-row" role="list" aria-label={isKorean ? "결과 워크스페이스 신호" : "Result workspace signals"}>
              <span className="interview-result-workspace-surface__summary-item" role="listitem">{isKorean ? `답변 ${answeredCount}` : `Answered ${answeredCount}`}</span>
              <span className="interview-result-workspace-surface__summary-item" role="listitem">{isKorean ? `건너뜀 ${skippedCount}` : `Skipped ${skippedCount}`}</span>
              <span className="interview-result-workspace-surface__summary-item" role="listitem">{isKorean ? `평균 점수 ${averageScoreLabel}` : `Average score ${averageScoreLabel}`}</span>
              <span className="interview-result-workspace-surface__summary-item interview-result-workspace-surface__summary-item--accent" role="listitem">{isKorean ? `약한 가지 ${weakFacetCount}` : `Weak branches ${weakFacetCount}`}</span>
            </div>
          </div>
          <div className="interview-result-workspace-surface__chips">
            <span className="detail-chip">{session.interviewModeLabel}</span>
            <span className="detail-chip detail-chip--accent">{isKorean ? `세션 ${sessionId}` : `Session ${sessionId}`}</span>
            {session.endedAt ? <span className="detail-chip">{session.endedAt}</span> : null}
            {skippedFacetCount > 0 ? <span className="detail-chip">{isKorean ? `건너뛴 세부 항목 ${skippedFacetCount}` : `Skipped facets ${skippedFacetCount}`}</span> : null}
          </div>
          <div className="interview-result-workspace-surface__principles" role="list" aria-label={isKorean ? "결과 워크스페이스 원칙" : "Result workspace principles"}>
            <span role="listitem">{isKorean ? "다시 검증할 가치가 있는 가지만 다음으로 가져가세요." : "Carry forward only the branches worth re-testing."}</span>
            <span role="listitem">{isKorean ? "약한 세부 항목과 건너뛴 세부 항목으로 다음 패스 범위를 정하세요." : "Use weak and skipped facets to scope the next pass."}</span>
          </div>
        </section>
        <section className="page-card interview-result-layout__hero">
          <div className="interview-result-layout__hero-topline">
            <span className="page-card__label">{t("result.summaryLabel")}</span>
            <span className="question-status-badge question-status-badge--accent">{isKorean ? "판단 리드아웃" : "Decision readout"}</span>
          </div>
          <h2 className="page-card__title">{isKorean ? `세션 ${sessionId}` : `Session ${sessionId}`}</h2>
          <p className="page-card__body">{isKorean ? "이 패스는 지난 답변을 감상하는 용도가 아니라 다음 가지를 고르는 용도입니다." : "Use this pass to choose the next branch, not to admire the last one."}</p>
          <div className="interview-result-layout__hero-summary-row" role="list" aria-label={isKorean ? "세션 복구 요약" : "Session recovery summary"}>
            <span
              className={`interview-result-layout__hero-summary-item interview-result-layout__hero-summary-item--${recoveryModeTone}`}
              role="listitem"
            >
              {weakFacetCount > 0
                ? isKorean ? `약한 가지 ${weakFacetCount}개 우선` : `${weakFacetCount} weak branches first`
                : isKorean ? "막히는 약한 가지 없음" : "No weak branches blocking"}
            </span>
            <span className="interview-result-layout__hero-summary-item" role="listitem">
              {skippedFacetCount > 0
                ? isKorean ? "좁은 복구 패스를 실행" : "Run a narrow recovery pass"
                : isKorean ? "근거가 버틴 뒤에만 확장" : "Expand only after evidence holds"}
            </span>
            <span className="interview-result-layout__hero-summary-item" role="listitem">{recoverySignal}</span>
          </div>
          <div className="interview-result-layout__hero-principles" role="list" aria-label={isKorean ? "세션 복구 원칙" : "Session recovery principles"}>
            <span role="listitem">{isKorean ? "커버리지를 다시 넓히기 전에 실패한 가지 하나를 먼저 복구하세요." : "Recover one failed branch before widening coverage again."}</span>
            <span role="listitem">{isKorean ? "빠진 사실, 수치, 제약을 다음 패스로 가져가세요." : "Bring the missing fact, metric, or constraint into the next pass."}</span>
          </div>
        </section>
        <div className="interview-result-layout__content">
          <div className="interview-result-layout__main">
            {shouldRenderFullCoverageResult ? (
              coverageQuery.isLoading || resumeMapQuery.isLoading || resultSectionsQuery.isLoading ? (
                <LoadingStateCard
                  body={t("result.fullCoverageLoadingBody")}
                  title={t("result.fullCoverageLoadingTitle")}
                />
              ) : coverageQuery.isError || resumeMapQuery.isError || resultSectionsQuery.isError ? (
                <ErrorStateCard
                  body={t("result.fullCoverageErrorBody")}
                  details={getErrorDetails(coverageQuery.error ?? resumeMapQuery.error ?? resultSectionsQuery.error)}
                  onAction={() => {
                    void Promise.all([
                      coverageQuery.refetch(),
                      resumeMapQuery.refetch(),
                      resultSectionsQuery.refetch(),
                    ]);
                  }}
                  title={t("result.fullCoverageErrorTitle")}
                />
              ) : coverageQuery.data && resumeMapQuery.data && resultSectionsQuery.data ? (
                <InterviewFullCoverageResultView
                  coverage={coverageQuery.data}
                  experiences={resultSectionsQuery.data.experiences}
                  projects={resultSectionsQuery.data.projects}
                  resumeMap={resumeMapQuery.data}
                  session={session}
                />
              ) : null
            ) : (
              <section className="page-card interview-result-layout__recap">
                <div className="section-heading">
                  <div>
                    <p className="section-heading__eyebrow">{t("result.recapEyebrow")}</p>
                    <h2 className="page-card__title">{t("result.recapTitle")}</h2>
                  </div>
                </div>
                <p className="page-card__body interview-result-layout__recap-intro">{isKorean ? "더 선명한 근거로 건너뛴 노드와 얕은 노드를 다시 여세요." : "Reopen the skipped or shallow nodes with cleaner evidence."}</p>
                <div className="stack-list">
                  {session.questions.map((question) => (
                    <article
                      className={`list-item-card interview-result-layout__recap-card${
                        question.status === "skipped"
                          ? " interview-result-layout__recap-card--skipped"
                          : question.status === "answered"
                            ? " interview-result-layout__recap-card--answered"
                            : " interview-result-layout__recap-card--open"
                      }`}
                      key={question.id}
                    >
                      <div className="list-item-card__content">
                        <div className="list-item-card__meta">
                          <span>{question.difficultyLabel}</span>
                          <span>{question.status}</span>
                        </div>
                        <h3 className="list-item-card__title">{question.title}</h3>
                        <p className="list-item-card__body">
                          {question.answerAttemptId ? `${t("result.answerAttemptPrefix")}${question.answerAttemptId}` : t("result.noAnswerRecorded")}
                        </p>
                      </div>
                      <div className="list-item-card__actions">
                        {question.questionId ? (
                          <>
                            <Link
                              className="secondary-button"
                              to={routeConfig.questionDetail.buildPath({ questionId: question.questionId })}
                            >
                              {t("common.openDetail")}
                            </Link>
                            <Link
                              className="primary-button"
                              to={routeConfig.answerEditor.buildPath({ questionId: question.questionId })}
                            >
                              {t("result.practiceAgain")}
                            </Link>
                          </>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </div>
          <aside className="interview-result-layout__side">
            <section className="page-card interview-result-layout__actions">
              <div className="interview-result-layout__next-topline">
                <span className="page-card__label">{isKorean ? "다음 사이클" : "Next cycle"}</span>
                <span className="question-status-badge question-status-badge--accent">{isKorean ? "복구 범위" : "Recovery scope"}</span>
              </div>
              <h2 className="page-card__title">{isKorean ? "다음 패스 결정을 하나 고르세요" : "Choose one next-pass decision"}</h2>
              <p className="page-card__body">
                {isKorean ? "다음 세션은 실제 개선이 보일 만큼만 좁게 유지하세요." : "Keep the next session narrow enough to see real improvement."}
              </p>
              <div className="interview-result-layout__actions-summary-row" role="list" aria-label={isKorean ? "다음 패스 요약" : "Next pass summary"}>
                <span
                  className={`interview-result-layout__actions-summary-chip interview-result-layout__actions-summary-chip--${recoveryModeTone}`}
                  role="listitem"
                >
                  {isKorean ? `미해결 ${unresolvedBranchCount}` : `Unresolved ${unresolvedBranchCount}`}
                </span>
                <span className="interview-result-layout__actions-summary-chip" role="listitem">{nextActionLabel}</span>
                <span className="interview-result-layout__actions-summary-chip" role="listitem">{recommendedActionLabel}</span>
              </div>
              <div className="interview-result-layout__actions-principles" role="list" aria-label={isKorean ? "다음 패스 원칙" : "Next pass principles"}>
                <span role="listitem">{isKorean ? "가지가 아직 얕다면 넓은 커버리지를 다시 시작하지 마세요." : "Do not restart broad coverage while the branch is still shallow."}</span>
                <span role="listitem">{isKorean ? "복구 목표 하나를 고르고, 다음 세션이 그것을 증명하게 하세요." : "Pick one recovery target and make the next session prove it."}</span>
              </div>
              <div className="interview-result-layout__next-list">
                <div className={`interview-result-layout__next-item${weakFacetCount > 0 ? " interview-result-layout__next-item--warning" : ""}`}>
                  <strong>{isKorean ? "약한 가지 복구" : "Weak branch recovery"}</strong>
                  <span>
                    {weakFacetCount > 0
                      ? isKorean ? `약한 가지 ${weakFacetCount}개에 더 강한 근거가 필요합니다.` : `${weakFacetCount} weak branches still need stronger evidence.`
                      : isKorean ? "이 결과에는 표시된 약한 가지가 없습니다." : "No weak branches are flagged in this result."}
                  </span>
                </div>
                <div className={`interview-result-layout__next-item${skippedFacetCount > 0 ? " interview-result-layout__next-item--accent" : ""}`}>
                  <strong>{isKorean ? "건너뛴 세부 항목 복구" : "Skipped facet recovery"}</strong>
                  <span>
                    {skippedFacetCount > 0
                      ? isKorean ? `건너뛴 세부 항목 ${skippedFacetCount}개는 다음 세션에서 다시 다뤄야 합니다.` : `${skippedFacetCount} skipped facets should return in the next session.`
                      : isKorean ? "복구를 기다리는 건너뛴 세부 항목이 없습니다." : "No skipped facets are waiting for recovery."}
                  </span>
                </div>
                <div className="interview-result-layout__next-item interview-result-layout__next-item--neutral">
                  <strong>{isKorean ? "범위 원칙" : "Scope rule"}</strong>
                  <span>{isKorean ? "다음 패스는 가지 깊이가 실제로 좋아질 만큼만 좁게 유지하세요." : "Keep the next pass narrow enough to improve branch depth."}</span>
                </div>
              </div>
              <div className="page-card__actions">
                <Link className="primary-button" to={routeConfig.interview.buildPath()}>
                  {t("result.startAnotherSession")}
                </Link>
                <Link className="secondary-button" to={routeConfig.home.buildPath()}>
                  {t("result.backHome")}
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </PageContainer>
  );
}
