import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getResumeVersionChoices } from "../../entities/resume/model";
import { useResumeAnalysesQuery } from "../../features/resume-tailor/api/useResumeAnalysesQuery";
import { useJobPostingsQuery } from "../../features/resume-tailor/api/useJobPostingsQuery";
import { useResumeListQuery } from "../../features/resume/api/useResumeListQuery";
import { getErrorDetails } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { EmptyStateCard } from "../../shared/ui/EmptyStateCard";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { MetricCard } from "../../shared/ui/MetricCard";
import { PageContainer } from "../../shared/ui/PageContainer";

export function ResumeTailorLandingPage() {
  const resumeListQuery = useResumeListQuery();
  const jobPostingsQuery = useJobPostingsQuery();
  const resumeChoices = useMemo(
    () => getResumeVersionChoices(resumeListQuery.data),
    [resumeListQuery.data],
  );
  const [selectedVersionId, setSelectedVersionId] = useState<string>("");

  useEffect(() => {
    if (!selectedVersionId && resumeChoices.length > 0) {
      setSelectedVersionId(
        resumeChoices.find((choice) => choice.isActive)?.versionId ?? resumeChoices[0].versionId,
      );
    }
  }, [resumeChoices, selectedVersionId]);

  const analysesQuery = useResumeAnalysesQuery(selectedVersionId || null, Boolean(selectedVersionId));

  return (
    <PageContainer
      description="Pick an immutable resume version, connect it to a saved job posting, review tailored analyses, and export server-generated PDFs."
      eyebrow="Resume Tailor"
      title="Resume tailoring workspace"
    >
      {resumeListQuery.isLoading ? (
        <LoadingStateCard
          body="Loading saved resume versions before opening the tailoring workspace."
          title="Preparing resume tailoring"
        />
      ) : null}

      {resumeListQuery.isError ? (
        <ErrorStateCard
          body={
            resumeListQuery.error instanceof Error
              ? resumeListQuery.error.message
              : "Resume versions could not be loaded."
          }
          details={getErrorDetails(resumeListQuery.error)}
          onAction={() => {
            void resumeListQuery.refetch();
          }}
          title="Unable to load resume tailoring workspace"
        />
      ) : null}

      {!resumeListQuery.isLoading && !resumeListQuery.isError ? (
        <div className="page-stack">
          <section className="page-card">
            <span className="page-card__label">Workspace</span>
            <h2 className="page-card__title">Tailor one immutable resume version at a time</h2>
            <p className="page-card__body">
              Analyses, tailored previews, suggestion acceptance, and PDF exports are saved on top
              of the selected resume version. Your original uploaded resume version stays unchanged.
            </p>
            <div className="stats-grid">
              <MetricCard label="Resume versions" value={String(resumeChoices.length)} />
              <MetricCard
                label="Saved job postings"
                tone="accent"
                value={String(jobPostingsQuery.data?.length ?? 0)}
              />
              <MetricCard
                label="Analyses"
                tone="muted"
                value={String(analysesQuery.data?.length ?? 0)}
              />
            </div>
            <div className="page-card__actions">
              {selectedVersionId ? (
                <Link
                  className="primary-button"
                  to={routeConfig.resumeTailorAnalysisList.buildPath({ versionId: selectedVersionId })}
                >
                  Create analysis
                </Link>
              ) : null}
              <Link className="secondary-button" to={routeConfig.resumeTailorJobPostings.buildPath()}>
                Manage job postings
              </Link>
            </div>
          </section>

          {resumeChoices.length === 0 ? (
            <EmptyStateCard
              action={{ label: "Open resume management", to: routeConfig.resume.buildPath() }}
              body="Upload and parse at least one resume version before creating a tailoring analysis."
              title="No resume versions available"
            />
          ) : (
            <>
              <section className="page-card">
                <span className="page-card__label">Version</span>
                <h2 className="page-card__title">Choose the source resume version</h2>
                <label className="form-field">
                  <span className="form-field__label">Resume version</span>
                  <select
                    className="form-input"
                    onChange={(event) => setSelectedVersionId(event.target.value)}
                    value={selectedVersionId}
                  >
                    {resumeChoices.map((choice) => (
                      <option key={choice.versionId} value={choice.versionId}>
                        {choice.resumeTitle} · {choice.versionNumberLabel}
                        {choice.isActive ? " · Active" : ""}
                      </option>
                    ))}
                  </select>
                </label>
              </section>

              <section className="page-card">
                <div className="section-heading">
                  <div>
                    <p className="section-heading__eyebrow">Analyses</p>
                    <h2 className="page-card__title">Recent analyses for this resume version</h2>
                  </div>
                  <span className="section-heading__count">{analysesQuery.data?.length ?? 0}</span>
                </div>
                {analysesQuery.isLoading ? (
                  <LoadingStateCard
                    body="Loading persisted resume-tailoring runs for the selected version."
                    title="Loading analyses"
                  />
                ) : analysesQuery.isError ? (
                  <ErrorStateCard
                    body={
                      analysesQuery.error instanceof Error
                        ? analysesQuery.error.message
                        : "Resume analyses could not be loaded."
                    }
                    details={getErrorDetails(analysesQuery.error)}
                    onAction={() => {
                      void analysesQuery.refetch();
                    }}
                    title="Unable to load analyses"
                  />
                ) : analysesQuery.data && analysesQuery.data.length > 0 ? (
                  <div className="stack-list">
                    {analysesQuery.data.slice(0, 4).map((analysis) => (
                      <article className="list-item-card" key={analysis.id}>
                        <div className="list-item-card__content">
                          <div className="list-item-card__meta">
                            <span>{analysis.statusLabel}</span>
                            <span>{analysis.generationSourceLabel}</span>
                            {analysis.createdAtLabel ? <span>{analysis.createdAtLabel}</span> : null}
                          </div>
                          <h3 className="list-item-card__title">
                            {analysis.suggestedHeadline ?? analysis.recommendedFormatTypeLabel}
                          </h3>
                          <p className="list-item-card__body">{analysis.matchSummary}</p>
                        </div>
                        <div className="list-item-card__actions">
                          <span className="detail-chip detail-chip--accent">
                            Score {analysis.overallScoreLabel}
                          </span>
                          <Link
                            className="secondary-button"
                            to={routeConfig.resumeTailorAnalysisDetail.buildPath({
                              versionId: selectedVersionId,
                              analysisId: analysis.id,
                            })}
                          >
                            Open workspace
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <EmptyStateCard
                    action={{
                      label: "Create first analysis",
                      to: routeConfig.resumeTailorAnalysisList.buildPath({ versionId: selectedVersionId }),
                    }}
                    body="No tailoring runs exist for this resume version yet."
                    title="No analyses yet"
                  />
                )}
              </section>

              <section className="page-card">
                <div className="section-heading">
                  <div>
                    <p className="section-heading__eyebrow">Job Postings</p>
                    <h2 className="page-card__title">Saved target roles</h2>
                  </div>
                  <span className="section-heading__count">{jobPostingsQuery.data?.length ?? 0}</span>
                </div>
                {jobPostingsQuery.isLoading ? (
                  <LoadingStateCard
                    body="Loading saved job postings for reuse in tailoring analyses."
                    title="Loading job postings"
                  />
                ) : jobPostingsQuery.isError ? (
                  <ErrorStateCard
                    body={
                      jobPostingsQuery.error instanceof Error
                        ? jobPostingsQuery.error.message
                        : "Job postings could not be loaded."
                    }
                    details={getErrorDetails(jobPostingsQuery.error)}
                    onAction={() => {
                      void jobPostingsQuery.refetch();
                    }}
                    title="Unable to load job postings"
                  />
                ) : jobPostingsQuery.data && jobPostingsQuery.data.length > 0 ? (
                  <div className="stack-list">
                    {jobPostingsQuery.data.slice(0, 3).map((jobPosting) => (
                      <article className="list-item-card" key={jobPosting.id}>
                        <div className="list-item-card__content">
                          <div className="list-item-card__meta">
                            <span>{jobPosting.inputTypeLabel}</span>
                            <span>{jobPosting.fetchStatusLabel}</span>
                            {jobPosting.fetchedTitle ? <span>{jobPosting.fetchedTitle}</span> : null}
                          </div>
                          <h3 className="list-item-card__title">{jobPosting.title}</h3>
                          <p className="list-item-card__body">
                            {jobPosting.parsedSummary ?? "No parsed summary is available yet."}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <EmptyStateCard
                    action={{
                      label: "Add job posting",
                      to: routeConfig.resumeTailorJobPostings.buildPath(),
                    }}
                    body="Save a job posting from text or a source link before creating job-aware analyses."
                    title="No job postings yet"
                  />
                )}
              </section>
            </>
          )}
        </div>
      ) : null}
    </PageContainer>
  );
}
