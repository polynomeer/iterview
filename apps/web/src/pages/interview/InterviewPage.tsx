import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getResumeVersionChoices } from "../../entities/resume/model";
import { useCreateInterviewSessionMutation } from "../../features/interview/api/useCreateInterviewSessionMutation";
import { useInterviewSessionsQuery } from "../../features/interview/api/useInterviewSessionsQuery";
import { useLatestResumeQuery } from "../../features/resume/api/useLatestResumeQuery";
import { useResumeListQuery } from "../../features/resume/api/useResumeListQuery";
import { getErrorDetails } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { EmptyStateCard } from "../../shared/ui/EmptyStateCard";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { MetricCard } from "../../shared/ui/MetricCard";
import { PageContainer } from "../../shared/ui/PageContainer";
import { SectionPanel } from "../../shared/ui/layout";
import { InterviewSessionHistoryList } from "../../widgets/interview";

export function InterviewPage() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const [questionCount, setQuestionCount] = useState(3);
  const [startFormOpen, setStartFormOpen] = useState(false);
  const [selectedResumeVersionId, setSelectedResumeVersionId] = useState<string | null>(null);
  const [selectedInterviewMode, setSelectedInterviewMode] = useState<
    "quick_screen" | "mock_30" | "mock_60" | "free_interview" | "full_coverage"
  >("mock_30");
  const resumeListQuery = useResumeListQuery();
  const latestResumeQuery = useLatestResumeQuery();
  const sessionListQuery = useInterviewSessionsQuery();
  const createSessionMutation = useCreateInterviewSessionMutation();
  const interviewModeOptions = useMemo(
    () =>
      [
        {
          id: "quick_screen",
          label: t("interview.modeQuickScreen"),
          description: t("interview.modeQuickScreenDescription"),
        },
        {
          id: "mock_30",
          label: t("interview.modeMock30"),
          description: t("interview.modeMock30Description"),
        },
        {
          id: "mock_60",
          label: t("interview.modeMock60"),
          description: t("interview.modeMock60Description"),
        },
        {
          id: "free_interview",
          label: t("interview.modeFreeInterview"),
          description: t("interview.modeFreeInterviewDescription"),
        },
        {
          id: "full_coverage",
          label: t("interview.modeFullCoverage"),
          description: t("interview.modeFullCoverageDescription"),
        },
      ] as const,
    [t],
  );
  const effectiveResumeList = useMemo(() => {
    if (resumeListQuery.data && resumeListQuery.data.items.length > 0) {
      return resumeListQuery.data;
    }

    return latestResumeQuery.data;
  }, [latestResumeQuery.data, resumeListQuery.data]);
  const resumeVersionChoices = useMemo(
    () => getResumeVersionChoices(effectiveResumeList),
    [effectiveResumeList],
  );

  useEffect(() => {
    if (resumeVersionChoices.length === 0) {
      setSelectedResumeVersionId(null);
      return;
    }

    setSelectedResumeVersionId((current) => {
      if (current && resumeVersionChoices.some((choice) => choice.versionId === current)) {
        return current;
      }

      const activeChoice = resumeVersionChoices.find((choice) => choice.isActive);

      return activeChoice?.versionId ?? resumeVersionChoices[0]?.versionId ?? null;
    });
  }, [resumeVersionChoices]);

  async function handleStartSession() {
    if (!selectedResumeVersionId) {
      return;
    }

    const response = await createSessionMutation.mutateAsync({
      sessionType: "resume_mock",
      interviewMode: selectedInterviewMode,
      questionCount,
      resumeVersionId: selectedResumeVersionId,
    });

    if (response.id !== null && response.id !== undefined) {
      navigate(routeConfig.interviewSession.buildPath({ sessionId: String(response.id) }));
    }
  }

  return (
    <PageContainer
      description={t("interview.pageDescription")}
      eyebrow={t("interview.pageEyebrow")}
      title={t("interview.pageTitle")}
    >
      {resumeListQuery.isLoading || latestResumeQuery.isLoading || sessionListQuery.isLoading ? (
        <LoadingStateCard
          body={t("interview.preparingBody")}
          title={t("interview.preparingTitle")}
        />
      ) : null}

      {resumeListQuery.isError && latestResumeQuery.isError ? (
        <ErrorStateCard
          body={resumeListQuery.error instanceof Error ? resumeListQuery.error.message : t("interview.loadResumeError")}
          details={getErrorDetails(resumeListQuery.error)}
          onAction={() => {
            void Promise.all([resumeListQuery.refetch(), latestResumeQuery.refetch()]);
          }}
          title={t("interview.loadResumeError")}
        />
      ) : null}

      {createSessionMutation.isError ? (
        <ErrorStateCard
          body={createSessionMutation.error instanceof Error ? createSessionMutation.error.message : t("interview.startSessionError")}
          details={getErrorDetails(createSessionMutation.error)}
          onAction={() => {
            createSessionMutation.reset();
          }}
          title={t("interview.startSessionError")}
        />
      ) : null}

      {sessionListQuery.isError ? (
        <ErrorStateCard
          body={sessionListQuery.error instanceof Error ? sessionListQuery.error.message : t("interview.loadSessionError")}
          details={getErrorDetails(sessionListQuery.error)}
          onAction={() => {
            void sessionListQuery.refetch();
          }}
          title={t("interview.loadSessionError")}
        />
      ) : null}

      {!(resumeListQuery.isLoading || latestResumeQuery.isLoading) &&
      !(resumeListQuery.isError && latestResumeQuery.isError) ? (
        <div className="interview-page-layout">
          {!sessionListQuery.isLoading && !sessionListQuery.isError && sessionListQuery.data ? (
            <section className="interview-page-layout__hero">
              {sessionListQuery.data.length > 0 ? (
                <InterviewSessionHistoryList items={sessionListQuery.data} />
              ) : (
                <EmptyStateCard
                  action={{ label: t("interview.startLabel"), to: routeConfig.interview.buildPath() }}
                  body={t("interview.emptyHistoryBody")}
                  title={t("interview.emptyHistoryTitle")}
                />
              )}
              <SectionPanel className="workspace-note-card workspace-note-card--accent" variant="muted">
                <span className="page-card__label">Interview workflow</span>
                <h2 className="page-card__title">Open one grounded session, then let the follow-ups go deeper</h2>
                <p className="page-card__body">
                  Start from one active resume version, keep the mode explicit, and use coverage runs when the goal is to walk the full question tree instead of sampling prompts.
                </p>
              </SectionPanel>
            </section>
          ) : null}
          <div className="interview-page-layout__workspace">
            <div className="interview-page-layout__main">
              <section className="page-card interview-page-layout__start">
                <span className="page-card__label">{t("interview.startLabel")}</span>
                <h2 className="page-card__title">{t("interview.startTitle")}</h2>
                <p className="page-card__body">{t("interview.startBody")}</p>
                <div className="stats-grid">
                  <MetricCard
                    helperText="Choose one stable context before starting."
                    label={t("interview.availableResumeVersions")}
                    value={String(resumeVersionChoices.length)}
                  />
                  <MetricCard
                    helperText="Keep the questioning mode explicit."
                    label={t("interview.interviewModeMetric")}
                    tone="accent"
                    value={interviewModeOptions.find((option) => option.id === selectedInterviewMode)?.label ?? t("interview.modeMock30")}
                  />
                  <MetricCard
                    helperText="Short runs work best for quick calibration."
                    label={t("interview.seedCount")}
                    tone="muted"
                    value={String(questionCount)}
                  />
                </div>
                <div className="page-card__actions">
                  <button
                    className="primary-button"
                    disabled={resumeVersionChoices.length === 0}
                    onClick={() => setStartFormOpen((current) => !current)}
                    type="button"
                  >
                    {startFormOpen ? t("interview.hideStartForm") : t("interview.startInterview")}
                  </button>
                </div>
                {resumeVersionChoices.length === 0 ? (
                  <EmptyStateCard
                    action={{ label: t("common.openResumes"), to: routeConfig.resume.buildPath() }}
                    body={t("interview.noResumeBody")}
                    title={t("interview.noResumeTitle")}
                  />
                ) : null}
              </section>
              {startFormOpen && resumeVersionChoices.length > 0 ? (
                <div className="page-stack interview-page-layout__setup">
                  <div className="page-card page-card--inset">
                    <div className="section-heading">
                      <div>
                        <p className="section-heading__eyebrow">{t("interview.resumeSelectionEyebrow")}</p>
                        <h3 className="page-card__title">{t("interview.chooseResumeTitle")}</h3>
                      </div>
                    </div>
                    <div className="stack-list">
                      {resumeVersionChoices.map((choice) => {
                        const isSelected = choice.versionId === selectedResumeVersionId;

                        return (
                          <button
                            aria-pressed={isSelected}
                            className={`list-item-card interview-resume-choice${isSelected ? " list-item-card--selected" : ""}`}
                            key={choice.versionId}
                            onClick={() => setSelectedResumeVersionId(choice.versionId)}
                            type="button"
                          >
                            <div className="list-item-card__content">
                              <div className="list-item-card__meta">
                                <span>{choice.resumeTitle}</span>
                                <span>{choice.versionNumberLabel}</span>
                                <span>{choice.uploadedAtLabel ?? t("interview.uploadedDateUnknown")}</span>
                                {choice.isActive ? (
                                  <span className="question-status-badge question-status-badge--positive">{t("interview.active")}</span>
                                ) : null}
                              </div>
                              <h3 className="list-item-card__title">{choice.resumeTitle}</h3>
                              <p className="list-item-card__body">
                                {choice.versionNumberLabel}
                                {choice.parsingStatus ? ` / ${choice.parsingStatusLabel}` : ""}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <section className="page-card page-card--inset">
                    <span className="page-card__label">{t("interview.sessionSetupLabel")}</span>
                    <h3 className="page-card__title">{t("interview.sessionSetupTitle")}</h3>
                    <p className="page-card__body">{t("interview.sessionSetupBody")}</p>
                    <div className="stack-list">
                      {interviewModeOptions.map((option) => {
                        const isSelected = option.id === selectedInterviewMode;

                        return (
                          <button
                            aria-pressed={isSelected}
                            className={`list-item-card interview-resume-choice${isSelected ? " list-item-card--selected" : ""}`}
                            key={option.id}
                            onClick={() => setSelectedInterviewMode(option.id)}
                            type="button"
                          >
                            <div className="list-item-card__content">
                              <div className="list-item-card__meta">
                                <span>{option.label}</span>
                                {option.id === "full_coverage" ? (
                                  <span className="question-status-badge question-status-badge--accent">{t("interview.coverageBadge")}</span>
                                ) : null}
                              </div>
                              <h3 className="list-item-card__title">{option.label}</h3>
                              <p className="list-item-card__body">{option.description}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <div className="page-card__actions">
                      <button
                        className={questionCount === 3 ? "primary-button" : "secondary-button"}
                        onClick={() => setQuestionCount(3)}
                        type="button"
                      >
                        3 questions
                      </button>
                      <button
                        className={questionCount === 5 ? "primary-button" : "secondary-button"}
                        onClick={() => setQuestionCount(5)}
                        type="button"
                      >
                        5 questions
                      </button>
                      <button
                        className="primary-button"
                        disabled={createSessionMutation.isPending || !selectedResumeVersionId}
                        onClick={() => {
                          void handleStartSession();
                        }}
                        type="button"
                      >
                        {createSessionMutation.isPending ? t("common.saving") : t("interview.confirmAndStart")}
                      </button>
                    </div>
                  </section>
                </div>
              ) : null}
            </div>
            {resumeVersionChoices.length > 0 ? (
              <aside className="interview-page-layout__rail">
                <SectionPanel className="workspace-note-card" variant="muted">
                  <span className="page-card__label">Source of truth</span>
                  <h2 className="page-card__title">Use one defendable resume version as the interview boundary</h2>
                  <p className="page-card__body">
                    This rail should make it obvious which version is active, which claims were parsed cleanly, and what evidence you will need to defend when the follow-up chain keeps drilling down.
                  </p>
                </SectionPanel>
                <section className="page-card">
                  <div className="section-heading">
                    <div>
                      <p className="section-heading__eyebrow">{t("interview.resumeContextEyebrow")}</p>
                      <h2 className="page-card__title">{t("interview.groundingVersionsTitle")}</h2>
                    </div>
                  </div>
                  <div className="stack-list">
                    {resumeVersionChoices.slice(0, 5).map((choice) => (
                      <article className="list-item-card" key={choice.versionId}>
                        <div className="list-item-card__content">
                          <div className="list-item-card__meta">
                            <span>{choice.resumeTitle}</span>
                            <span>{choice.versionNumberLabel}</span>
                            {choice.uploadedAtLabel ? <span>{choice.uploadedAtLabel}</span> : null}
                            {choice.isActive ? (
                              <span className="question-status-badge question-status-badge--positive">{t("interview.active")}</span>
                            ) : null}
                          </div>
                          <h3 className="list-item-card__title">{choice.resumeTitle}</h3>
                          <p className="list-item-card__body">{choice.parsingStatusLabel}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              </aside>
            ) : null}
          </div>
        </div>
      ) : null}
    </PageContainer>
  );
}
