import { Link, useParams } from "react-router-dom";
import { getAnsweredQuestionCount } from "../../entities/interview/model";
import { useInterviewSessionCoverageQuery } from "../../features/interview/api/useInterviewSessionCoverageQuery";
import { useInterviewSessionDetailQuery } from "../../features/interview/api/useInterviewSessionDetailQuery";
import { useInterviewSessionResumeMapQuery } from "../../features/interview/api/useInterviewSessionResumeMapQuery";
import { useResumeVersionResultSectionsQuery } from "../../features/resume/api/useResumeVersionResultSectionsQuery";
import { getErrorDetails } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { EmptyStateCard } from "../../shared/ui/EmptyStateCard";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { PageContainer } from "../../shared/ui/PageContainer";
import { useLocale } from "../../shared/i18n";
import { InterviewFullCoverageResultView } from "../../widgets/interview";

export function InterviewResultPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { t } = useLocale();
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
        <EmptyStateCard
          action={{
            label: t("result.startInterview"),
            to: routeConfig.interview.buildPath(),
          }}
          body={t("result.missingBody")}
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
        <ErrorStateCard
          body={sessionQuery.error instanceof Error ? sessionQuery.error.message : t("result.loadErrorBody")}
          details={getErrorDetails(sessionQuery.error)}
          onAction={() => {
            void sessionQuery.refetch();
          }}
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
        <EmptyStateCard
          action={{
            label: t("result.startInterview"),
            to: routeConfig.interview.buildPath(),
          }}
          body={t("result.notFoundBody")}
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
        ? "Weak-branch recovery"
        : "Skipped-facet recovery"
      : "Adjacent branch expansion";

  return (
    <PageContainer
      description={t("result.pageDescription")}
      eyebrow={t("result.pageEyebrow")}
      title={t("result.pageTitle")}
    >
      <div className="interview-result-layout">
        <section className="page-card interview-result-workspace-surface">
          <div className="interview-result-workspace-surface__header">
            <div className="interview-result-workspace-surface__intro">
              <div className="interview-result-workspace-surface__eyebrow-row">
                <span className="page-card__label">Result workspace</span>
                <span className="question-status-badge question-status-badge--accent">Branch review</span>
              </div>
              <p className="interview-result-workspace-surface__breadcrumbs">
                Session recap
                <span>/</span>
                Weak branch recovery
                <span>/</span>
                Next DFS pass
              </p>
              <h2 className="interview-result-workspace-surface__title">Review what held up</h2>
              <p className="interview-result-workspace-surface__body">
                Keep the branches that held up. Re-enter the ones that stayed shallow.
              </p>
            </div>
            <div className="interview-result-workspace-surface__stats">
              <article className="interview-result-workspace-surface__stat">
                <span>Answered</span>
                <strong>{answeredCount}</strong>
              </article>
              <article className="interview-result-workspace-surface__stat">
                <span>Skipped</span>
                <strong>{skippedCount}</strong>
              </article>
              <article className="interview-result-workspace-surface__stat">
                <span>Average score</span>
                <strong>{averageScoreLabel}</strong>
              </article>
              <article className="interview-result-workspace-surface__stat">
                <span>Weak branches</span>
                <strong>{weakFacetCount}</strong>
              </article>
            </div>
          </div>
          <div className="interview-result-workspace-surface__chips">
            <span className="detail-chip">{session.interviewModeLabel}</span>
            <span className="detail-chip detail-chip--accent">{`Session ${sessionId}`}</span>
            {session.endedAt ? <span className="detail-chip">{session.endedAt}</span> : null}
            {skippedFacetCount > 0 ? <span className="detail-chip">{`Skipped facets ${skippedFacetCount}`}</span> : null}
          </div>
          <div className="interview-result-workspace-surface__guidance">
            <article className="interview-result-workspace-surface__guidance-card">
              <span>Keep</span>
              <strong>Carry forward only the branches worth re-testing.</strong>
            </article>
            <article className="interview-result-workspace-surface__guidance-card">
              <span>Recover</span>
              <strong>Use weak and skipped facets to scope the next pass.</strong>
            </article>
          </div>
        </section>
        <section className="page-card interview-result-layout__hero">
          <div className="interview-result-layout__hero-topline">
            <span className="page-card__label">{t("result.summaryLabel")}</span>
            <span className="question-status-badge question-status-badge--accent">Decision readout</span>
          </div>
          <h2 className="page-card__title">Session {sessionId}</h2>
          <p className="page-card__body">Use this pass to choose the next branch, not to admire the last one.</p>
          <div className="interview-result-layout__hero-decision">
            <article className="interview-result-layout__hero-decision-item">
                  <span>Primary recovery</span>
                  <strong>
                    {weakFacetCount > 0
                      ? `${weakFacetCount} weak branches should be revisited first`
                      : "No weak branches are blocking the next pass"}
                  </strong>
                </article>
                <article className="interview-result-layout__hero-decision-item">
                  <span>Pass shape</span>
                  <strong>
                    {skippedFacetCount > 0
                      ? "Run a narrow recovery pass first"
                      : "Expand only after evidence stays concrete"}
                  </strong>
                </article>
            <article className="interview-result-layout__hero-decision-item">
              <span>Recovery signal</span>
              <strong>{recoverySignal}</strong>
            </article>
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
                <p className="page-card__body interview-result-layout__recap-intro">Reopen the skipped or shallow nodes with cleaner evidence.</p>
                <div className="stack-list">
                  {session.questions.map((question) => (
                    <article className="list-item-card interview-result-layout__recap-card" key={question.id}>
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
                <span className="page-card__label">Next cycle</span>
                <span className="question-status-badge question-status-badge--accent">Recovery scope</span>
              </div>
              <h2 className="page-card__title">Choose one next-pass decision</h2>
              <p className="page-card__body">
                Keep the next session narrow enough to see real improvement.
              </p>
              <div className="interview-result-layout__next-pass-signals">
                <article className="interview-result-layout__next-pass-signal">
                  <span>Unresolved branches</span>
                  <strong>{unresolvedBranchCount}</strong>
                </article>
                <article className="interview-result-layout__next-pass-signal">
                  <span>Next action</span>
                  <strong>{weakFacetCount > 0 || skippedFacetCount > 0 ? "Recovery pass" : "Neighbor branch"}</strong>
                </article>
              </div>
              <div className="interview-result-layout__actions-summary">
                <article className="interview-result-layout__actions-summary-item">
                  <span>Recommended action</span>
                  <strong>{weakFacetCount > 0 || skippedFacetCount > 0 ? "Start a narrow recovery pass" : "Continue to a neighboring branch"}</strong>
                </article>
                <article className="interview-result-layout__actions-summary-item">
                  <span>Do not do</span>
                  <strong>Do not restart broad coverage if the branch is still shallow</strong>
                </article>
              </div>
              <div className="interview-result-layout__next-list">
                <div className="interview-result-layout__next-item">
                  <strong>Weak branch recovery</strong>
                  <span>
                    {weakFacetCount > 0
                      ? `${weakFacetCount} weak branches still need stronger evidence.`
                      : "No weak branches are flagged in this result."}
                  </span>
                </div>
                <div className="interview-result-layout__next-item">
                  <strong>Skipped facet recovery</strong>
                  <span>
                    {skippedFacetCount > 0
                      ? `${skippedFacetCount} skipped facets should return in the next session.`
                      : "No skipped facets are waiting for recovery."}
                  </span>
                </div>
                <div className="interview-result-layout__next-item">
                  <strong>Scope rule</strong>
                  <span>Keep the next pass narrow enough to improve branch depth.</span>
                </div>
              </div>
              <div className="interview-result-layout__next-playbook">
                <article className="interview-result-layout__next-playbook-step">
                  <span>1. Pick one failed area</span>
                  <strong>Choose weak recovery or skipped recovery as the goal</strong>
                </article>
                <article className="interview-result-layout__next-playbook-step">
                  <span>2. Re-enter with evidence</span>
                  <strong>Bring the missing fact, constraint, or metric</strong>
                </article>
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
