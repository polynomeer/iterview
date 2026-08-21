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

  return (
    <PageContainer
      description={t("result.pageDescription")}
      eyebrow={t("result.pageEyebrow")}
      title={t("result.pageTitle")}
    >
      <div className="interview-result-layout">
        <div className="interview-result-layout__hero-grid">
          <section className="page-card interview-result-layout__hero">
            <span className="page-card__label">{t("result.summaryLabel")}</span>
            <h2 className="page-card__title">Session {sessionId}</h2>
            <p className="page-card__body">{t("result.summaryBody")}</p>
            <div className="stats-grid">
              <MetricCard label={t("result.questions")} tone="muted" value={String(session.summary.totalQuestions)} />
              <MetricCard label={t("result.answered")} tone="accent" value={String(getAnsweredQuestionCount(session))} />
              <MetricCard label={t("result.skipped")} tone="muted" value={String(session.summary.skippedQuestions)} />
              <MetricCard label={t("result.status")} tone="muted" value={session.status} />
              <MetricCard label={t("result.averageScore")} tone="muted" value={session.summary.averageScoreLabel ?? "-"} />
            </div>
          </section>
          <SectionPanel className="workspace-note-card workspace-note-card--accent interview-result-layout__brief" variant="muted">
            <span className="page-card__label">Result review</span>
            <h2 className="page-card__title">Use the session result as evidence of what you can defend under pressure</h2>
            <p className="page-card__body">
              Strong sessions should reveal which resume claims were actually defended, which branches stayed shallow, and where the next DFS pass should continue.
            </p>
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
                <div className="stack-list">
                  {session.questions.map((question) => (
                    <article className="list-item-card" key={question.id}>
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
            <SectionPanel className="workspace-note-card" variant="muted">
              <span className="page-card__label">Next pass</span>
              <h2 className="page-card__title">Turn this review into the next deeper interview pass</h2>
              <p className="page-card__body">
                Re-run weak branches, revisit skipped evidence, and keep the next session scoped enough that you can tell whether the answer improved or only became longer.
              </p>
            </SectionPanel>
            <section className="page-card interview-result-layout__actions">
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
