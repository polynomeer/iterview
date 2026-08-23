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
import { MetricCard } from "../../shared/ui/MetricCard";
import { PageContainer } from "../../shared/ui/PageContainer";
import { useLocale } from "../../shared/i18n";
import { SectionPanel } from "../../shared/ui/layout";
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
              <h2 className="interview-result-workspace-surface__title">Review what actually held up under pressure</h2>
              <p className="interview-result-workspace-surface__body">
                This result is not the end of the flow. Use it to identify which branches were defendable, which evidence
                stayed shallow, and what the next pass must revisit.
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
        </section>
        <div className="interview-result-layout__hero-grid">
          <section className="page-card interview-result-layout__hero">
            <div className="interview-result-layout__hero-topline">
              <span className="page-card__label">{t("result.summaryLabel")}</span>
              <span className="question-status-badge question-status-badge--accent">Decision readout</span>
            </div>
            <h2 className="page-card__title">Session {sessionId}</h2>
            <p className="page-card__body">{t("result.summaryBody")}</p>
            <div className="stats-grid">
              <MetricCard label={t("result.questions")} tone="muted" value={String(session.summary.totalQuestions)} />
              <MetricCard label={t("result.answered")} tone="accent" value={String(answeredCount)} />
              <MetricCard label={t("result.skipped")} tone="muted" value={String(skippedCount)} />
              <MetricCard label={t("result.status")} tone="muted" value={session.status} />
              <MetricCard label={t("result.averageScore")} tone="muted" value={averageScoreLabel} />
            </div>
            <div className="interview-result-layout__hero-supporting">
              <article className="interview-result-layout__hero-supporting-item">
                <span>Branch state</span>
                <strong>{session.status}</strong>
              </article>
              <article className="interview-result-layout__hero-supporting-item">
                <span>Weak recovery</span>
                <strong>{weakFacetCount}</strong>
              </article>
              <article className="interview-result-layout__hero-supporting-item">
                <span>Skipped recovery</span>
                <strong>{skippedFacetCount}</strong>
              </article>
            </div>
          </section>
          <SectionPanel className="workspace-note-card workspace-note-card--accent interview-result-layout__brief" variant="muted">
            <div className="interview-result-layout__brief-topline">
              <span className="page-card__label">Result review</span>
              <span className="question-status-badge">Next pass cue</span>
            </div>
            <h2 className="page-card__title">Use this review to choose the next branch, not just to read the score</h2>
            <p className="page-card__body">
              Strong sessions should reveal which resume claims were actually defended, which branches stayed shallow, and where the next DFS pass should continue.
            </p>
            <div className="interview-result-layout__brief-rules">
              <div className="interview-result-layout__brief-rule">
                <strong>1. Evidence first</strong>
                <span>Repeat only the branch that still lacks a concrete resume fact or constraint.</span>
              </div>
              <div className="interview-result-layout__brief-rule">
                <strong>2. Narrow scope</strong>
                <span>Keep the next pass small enough that depth improves before breadth expands.</span>
              </div>
            </div>
          </SectionPanel>
        </div>
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
                <p className="page-card__body interview-result-layout__recap-intro">
                  Treat each question in this recap as a branch checkpoint. Reopen the nodes that were skipped, shallow, or worth defending with cleaner evidence.
                </p>
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
            <SectionPanel className="workspace-note-card interview-result-layout__next-pass" variant="muted">
              <div className="interview-result-layout__next-pass-topline">
                <span className="page-card__label">Next pass</span>
                <span className="question-status-badge question-status-badge--accent">Recovery scope</span>
              </div>
              <h2 className="page-card__title">Turn this review into the next deeper interview pass</h2>
              <p className="page-card__body">
                Re-run weak branches, revisit skipped evidence, and keep the next session scoped enough that you can tell whether the answer improved or only became longer.
              </p>
            </SectionPanel>
            <SectionPanel className="workspace-note-card interview-result-layout__next-rail" variant="muted">
              <div className="interview-result-layout__next-topline">
                <span className="page-card__label">Recovery plan</span>
                <p className="interview-result-layout__next-note">Prioritize the smallest unfinished branches first</p>
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
                      : "No skipped facets are currently waiting for recovery."}
                  </span>
                </div>
                <div className="interview-result-layout__next-item">
                  <strong>Scope rule</strong>
                  <span>Keep the next pass narrow enough that branch depth improves, not just answer length.</span>
                </div>
              </div>
            </SectionPanel>
            <section className="page-card interview-result-layout__actions">
              <span className="page-card__label">Actions</span>
              <h2 className="page-card__title">Start the next interview cycle deliberately</h2>
              <p className="page-card__body">
                Launch another session only after choosing whether you are retesting weak branches, skipped facets, or the same branch with tighter evidence.
              </p>
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
