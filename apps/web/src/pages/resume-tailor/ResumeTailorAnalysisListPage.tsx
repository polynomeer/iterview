import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCreateResumeAnalysisMutation } from "../../features/resume-tailor/api/useCreateResumeAnalysisMutation";
import { useJobPostingsQuery } from "../../features/resume-tailor/api/useJobPostingsQuery";
import { useResumeAnalysesQuery } from "../../features/resume-tailor/api/useResumeAnalysesQuery";
import { useResumeVersionDetailQuery } from "../../features/resume/api/useResumeVersionDetailQuery";
import { getErrorDetails } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { EmptyStateCard } from "../../shared/ui/EmptyStateCard";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { PageContainer } from "../../shared/ui/PageContainer";

export function ResumeTailorAnalysisListPage() {
  const navigate = useNavigate();
  const { versionId } = useParams<{ versionId: string }>();
  const [jobPostingId, setJobPostingId] = useState("");
  const [preferredFormatType, setPreferredFormatType] = useState("");
  const versionQuery = useResumeVersionDetailQuery(versionId ?? null);
  const analysesQuery = useResumeAnalysesQuery(versionId ?? null);
  const jobPostingsQuery = useJobPostingsQuery();
  const createMutation = useCreateResumeAnalysisMutation(versionId ?? null);

  const selectableJobPostings = useMemo(() => jobPostingsQuery.data ?? [], [jobPostingsQuery.data]);

  async function handleCreateAnalysis() {
    const analysis = await createMutation.mutateAsync({
      jobPostingId: jobPostingId || null,
      preferredFormatType: preferredFormatType.trim() || null,
    });

    navigate(
      routeConfig.resumeTailorAnalysisDetail.buildPath({
        versionId: versionId ?? analysis.resumeVersionId,
        analysisId: analysis.id,
      }),
    );
  }

  return (
    <PageContainer
      description="Review existing persisted tailoring runs for one immutable resume version and create a new job-aware analysis when needed."
      eyebrow="Resume Tailor"
      title="Resume version analyses"
    >
      {versionQuery.isLoading ? (
        <LoadingStateCard
          body="Loading the selected resume version before opening analysis history."
          title="Preparing analysis history"
        />
      ) : versionQuery.isError ? (
        <ErrorStateCard
          body={
            versionQuery.error instanceof Error
              ? versionQuery.error.message
              : "The resume version could not be loaded."
          }
          details={getErrorDetails(versionQuery.error)}
          onAction={() => {
            void versionQuery.refetch();
          }}
          title="Unable to load resume version"
        />
      ) : versionQuery.data ? (
        <div className="page-stack">
          <section className="page-card">
            <span className="page-card__label">Source version</span>
            <h2 className="page-card__title">{versionQuery.data.versionNumberLabel}</h2>
            <p className="page-card__body">
              Tailoring runs are layered on top of this immutable uploaded version. Accepting
              suggestions never overwrites the original source resume.
            </p>
            <div className="chip-list">
              <span className="question-status-badge question-status-badge--neutral">
                Parsing {versionQuery.data.parsingStatusLabel}
              </span>
              {versionQuery.data.extractionStatusLabel ? (
                <span className="question-status-badge question-status-badge--accent">
                  Extraction {versionQuery.data.extractionStatusLabel}
                </span>
              ) : null}
            </div>
          </section>

          <section className="page-card">
            <span className="page-card__label">Create</span>
            <h2 className="page-card__title">Create one tailoring analysis</h2>
            <div className="form-grid">
              <label className="form-field">
                <span className="form-field__label">Saved job posting</span>
                <select
                  className="form-input"
                  onChange={(event) => setJobPostingId(event.target.value)}
                  value={jobPostingId}
                >
                  <option value="">None</option>
                  {selectableJobPostings.map((jobPosting) => (
                    <option key={jobPosting.id} value={jobPosting.id}>
                      {jobPosting.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-field">
                <span className="form-field__label">Preferred format type</span>
                <input
                  className="form-input"
                  onChange={(event) => setPreferredFormatType(event.target.value)}
                  placeholder="Optional, for example technical_focused"
                  type="text"
                  value={preferredFormatType}
                />
              </label>
            </div>
            {createMutation.isError ? (
              <ErrorStateCard
                body={
                  createMutation.error instanceof Error
                    ? createMutation.error.message
                    : "The analysis could not be created."
                }
                details={getErrorDetails(createMutation.error)}
                onAction={() => createMutation.reset()}
                title="Unable to create analysis"
              />
            ) : null}
            <div className="page-card__actions">
              <button
                className="primary-button"
                disabled={createMutation.isPending}
                onClick={() => {
                  void handleCreateAnalysis();
                }}
                type="button"
              >
                {createMutation.isPending ? "Creating..." : "Run analysis"}
              </button>
              <Link className="secondary-button" to={routeConfig.resumeTailorJobPostings.buildPath()}>
                Manage job postings
              </Link>
            </div>
          </section>

          <section className="page-card">
            <div className="section-heading">
              <div>
                <p className="section-heading__eyebrow">History</p>
                <h2 className="page-card__title">Persisted analyses</h2>
              </div>
              <span className="section-heading__count">{analysesQuery.data?.length ?? 0}</span>
            </div>
            {analysesQuery.isLoading ? (
              <LoadingStateCard
                body="Loading older tailoring runs for this resume version."
                title="Loading analyses"
              />
            ) : analysesQuery.isError ? (
              <ErrorStateCard
                body={
                  analysesQuery.error instanceof Error
                    ? analysesQuery.error.message
                    : "Analyses could not be loaded."
                }
                details={getErrorDetails(analysesQuery.error)}
                onAction={() => {
                  void analysesQuery.refetch();
                }}
                title="Unable to load analyses"
              />
            ) : analysesQuery.data && analysesQuery.data.length > 0 ? (
              <div className="stack-list">
                {analysesQuery.data.map((analysis) => (
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
                          versionId: versionId ?? analysis.resumeVersionId,
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
                body="No tailoring runs exist for this resume version yet. Create the first one from the form above."
                title="No analyses yet"
              />
            )}
          </section>
        </div>
      ) : null}
    </PageContainer>
  );
}
