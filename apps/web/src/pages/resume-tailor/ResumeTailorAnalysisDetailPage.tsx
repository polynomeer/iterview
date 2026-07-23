import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useJobPostingDetailQuery } from "../../features/resume-tailor/api/useJobPostingDetailQuery";
import { useCreateResumeAnalysisExportMutation } from "../../features/resume-tailor/api/useCreateResumeAnalysisExportMutation";
import { useResumeAnalysisDetailQuery } from "../../features/resume-tailor/api/useResumeAnalysisDetailQuery";
import { useResumeAnalysisExportsQuery } from "../../features/resume-tailor/api/useResumeAnalysisExportsQuery";
import { useToggleResumeAnalysisSuggestionMutation } from "../../features/resume-tailor/api/useToggleResumeAnalysisSuggestionMutation";
import { useResumeVersionSnapshotsQuery } from "../../features/resume/api/useResumeVersionSnapshotsQuery";
import { downloadResumeAnalysisExportFileRequest } from "../../shared/api/resumeTailorApi";
import { getErrorDetails } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { EmptyStateCard } from "../../shared/ui/EmptyStateCard";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { MetricCard } from "../../shared/ui/MetricCard";
import { PageContainer } from "../../shared/ui/PageContainer";
import { ResumeExperienceTimeline, ResumeProfileCard, ResumeProjectsCard, ResumeSkillsCard } from "../../widgets/resume";

export function ResumeTailorAnalysisDetailPage() {
  const { versionId, analysisId } = useParams<{ versionId: string; analysisId: string }>();
  const [copiedPlainText, setCopiedPlainText] = useState(false);
  const analysisQuery = useResumeAnalysisDetailQuery(versionId ?? null, analysisId ?? null);
  const exportsQuery = useResumeAnalysisExportsQuery(versionId ?? null, analysisId ?? null);
  const snapshotsQuery = useResumeVersionSnapshotsQuery(versionId ?? null);
  const toggleSuggestionMutation = useToggleResumeAnalysisSuggestionMutation(
    versionId ?? null,
    analysisId ?? null,
  );
  const createExportMutation = useCreateResumeAnalysisExportMutation(versionId ?? null, analysisId ?? null);
  const jobPostingDetailQuery = useJobPostingDetailQuery(
    analysisQuery.data?.jobPostingId ?? null,
    Boolean(analysisQuery.data?.jobPostingId),
  );

  async function handleDownloadExport(exportId: string, fileName: string) {
    const blob = await downloadResumeAnalysisExportFileRequest(versionId ?? "", analysisId ?? "", exportId);
    const objectUrl = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(objectUrl);
  }

  async function handleCopyPlainText() {
    const plainText = analysisQuery.data?.tailoredDocument?.plainText;
    if (!plainText || !navigator.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(plainText);
    setCopiedPlainText(true);
    window.setTimeout(() => setCopiedPlainText(false), 1500);
  }

  return (
    <PageContainer
      description="Review the saved tailoring analysis, accept or reject rewrite suggestions, inspect the persisted tailored document preview, and manage server-side PDF exports."
      eyebrow="Resume Tailor"
      title="Tailored resume analysis"
    >
      {analysisQuery.isLoading ? (
        <LoadingStateCard
          body="Loading the saved tailoring analysis and persisted tailored document."
          title="Preparing tailored resume workspace"
        />
      ) : analysisQuery.isError ? (
        <ErrorStateCard
          body={
            analysisQuery.error instanceof Error
              ? analysisQuery.error.message
              : "The resume analysis could not be loaded."
          }
          details={getErrorDetails(analysisQuery.error)}
          onAction={() => {
            void analysisQuery.refetch();
          }}
          title="Unable to load tailored analysis"
        />
      ) : analysisQuery.data ? (
        <div className="page-stack">
          <section className="page-card">
            <span className="page-card__label">Analysis</span>
            <h2 className="page-card__title">{analysisQuery.data.matchSummary}</h2>
            <p className="page-card__body">
              This workspace is layered on top of the immutable original resume version. Accepted
              suggestions only change the saved tailored preview document and export outputs.
            </p>
            <div className="chip-list">
              <span className="question-status-badge question-status-badge--accent">
                {analysisQuery.data.statusLabel}
              </span>
              <span className="question-status-badge question-status-badge--neutral">
                {analysisQuery.data.generationSourceLabel}
              </span>
              {analysisQuery.data.recommendedFormatType ? (
                <span className="question-status-badge question-status-badge--neutral">
                  {analysisQuery.data.recommendedFormatTypeLabel}
                </span>
              ) : null}
            </div>
            <div className="stats-grid">
              <MetricCard label="Overall score" value={analysisQuery.data.overallScoreLabel} />
              <MetricCard
                label="Suggestions"
                tone="accent"
                value={String(analysisQuery.data.suggestions.length)}
              />
              <MetricCard
                label="Exports"
                tone="muted"
                value={String((exportsQuery.data ?? analysisQuery.data.exports).length)}
              />
              <MetricCard
                label="Created"
                tone="muted"
                value={analysisQuery.data.createdAtLabel ?? "Unknown"}
              />
            </div>
          </section>

          <div className="resume-tailor-workspace">
            <div className="resume-tailor-workspace__primary">
              <section className="page-card">
                <span className="page-card__label">Match insights</span>
                <h2 className="page-card__title">Match gaps and strengths</h2>
                <div className="resume-tailor-card-grid">
                  <InsightListCard
                    items={analysisQuery.data.strongMatches}
                    title="Strong matches"
                  />
                  <InsightListCard
                    items={analysisQuery.data.missingKeywords}
                    title="Missing keywords"
                    tone="warning"
                  />
                  <InsightListCard
                    items={analysisQuery.data.weakSignals}
                    title="Weak signals"
                    tone="warning"
                  />
                  <InsightListCard
                    items={analysisQuery.data.recommendedFocusAreas}
                    title="Recommended focus areas"
                    tone="accent"
                  />
                </div>
                {analysisQuery.data.analysisNotes.length > 0 ? (
                  <div className="page-stack">
                    <h3 className="page-card__title">Analysis notes</h3>
                    <ul className="resume-tailor-list">
                      {analysisQuery.data.analysisNotes.map((note) => (
                        <li key={note}>{note}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </section>

              <section className="page-card">
                <div className="section-heading">
                  <div>
                    <p className="section-heading__eyebrow">Suggestions</p>
                    <h2 className="page-card__title">Section rewrite suggestions</h2>
                  </div>
                  <span className="section-heading__count">{analysisQuery.data.suggestions.length}</span>
                </div>
                {toggleSuggestionMutation.isError ? (
                  <ErrorStateCard
                    body={
                      toggleSuggestionMutation.error instanceof Error
                        ? toggleSuggestionMutation.error.message
                        : "The suggestion acceptance state could not be updated."
                    }
                    details={getErrorDetails(toggleSuggestionMutation.error)}
                    onAction={() => toggleSuggestionMutation.reset()}
                    title="Unable to update suggestion"
                  />
                ) : null}
                {analysisQuery.data.suggestions.length === 0 ? (
                  <EmptyStateCard
                    body="This analysis did not return any section-level rewrite suggestions."
                    title="No suggestions"
                  />
                ) : (
                  <div className="stack-list">
                    {analysisQuery.data.suggestions.map((suggestion) => (
                      <article className="page-card page-card--muted" key={suggestion.id}>
                        <div className="section-heading">
                          <div>
                            <p className="section-heading__eyebrow">{suggestion.sectionLabel}</p>
                            <h3 className="page-card__title">{suggestion.suggestionTypeLabel}</h3>
                          </div>
                          <span
                            className={`question-status-badge ${
                              suggestion.accepted
                                ? "question-status-badge--positive"
                                : "question-status-badge--neutral"
                            }`}
                          >
                            {suggestion.accepted ? "Accepted" : "Not accepted"}
                          </span>
                        </div>
                        {suggestion.originalText ? (
                          <div className="resume-tailor-compare-block">
                            <p className="resume-section__helper">Original source</p>
                            <p className="page-card__body resume-section__body--preserve">
                              {suggestion.originalText}
                            </p>
                          </div>
                        ) : null}
                        <div className="resume-tailor-compare-block">
                          <p className="resume-section__helper">Suggested rewrite</p>
                          <p className="page-card__body resume-section__body--preserve">
                            {suggestion.suggestedText}
                          </p>
                        </div>
                        <p className="resume-tailor-muted">{suggestion.reason}</p>
                        <div className="page-card__actions">
                          <button
                            className={suggestion.accepted ? "secondary-button" : "primary-button"}
                            disabled={toggleSuggestionMutation.isPending}
                            onClick={() => {
                              void toggleSuggestionMutation.mutateAsync({
                                suggestionId: suggestion.id,
                                accepted: !suggestion.accepted,
                              });
                            }}
                            type="button"
                          >
                            {suggestion.accepted ? "Remove acceptance" : "Accept suggestion"}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <div className="resume-tailor-workspace__preview">
              <section className="page-card">
                <div className="section-heading">
                  <div>
                    <p className="section-heading__eyebrow">Preview</p>
                    <h2 className="page-card__title">Persisted tailored document</h2>
                  </div>
                  {analysisQuery.data.tailoredDocument?.formatType ? (
                    <span className="question-status-badge question-status-badge--neutral">
                      {analysisQuery.data.tailoredDocument.formatTypeLabel}
                    </span>
                  ) : null}
                </div>
                {analysisQuery.data.tailoredDocument ? (
                  <div className="resume-tailor-document">
                    <header className="resume-tailor-document__header">
                      <h3 className="page-card__title">{analysisQuery.data.tailoredDocument.title}</h3>
                      <div className="list-item-card__meta">
                        {analysisQuery.data.tailoredDocument.targetCompany ? (
                          <span>{analysisQuery.data.tailoredDocument.targetCompany}</span>
                        ) : null}
                        {analysisQuery.data.tailoredDocument.targetRole ? (
                          <span>{analysisQuery.data.tailoredDocument.targetRole}</span>
                        ) : null}
                      </div>
                    </header>
                    {analysisQuery.data.tailoredDocument.summary ? (
                      <p className="page-card__body resume-section__body--preserve">
                        {analysisQuery.data.tailoredDocument.summary}
                      </p>
                    ) : null}
                    {analysisQuery.data.tailoredDocument.diffSummary ? (
                      <div className="feedback-notice feedback-notice--info">
                        <p className="feedback-notice__message">
                          {analysisQuery.data.tailoredDocument.diffSummary}
                        </p>
                      </div>
                    ) : null}
                    {analysisQuery.data.tailoredDocument.analysisNotes.length > 0 ? (
                      <ul className="resume-tailor-list">
                        {analysisQuery.data.tailoredDocument.analysisNotes.map((note) => (
                          <li key={note}>{note}</li>
                        ))}
                      </ul>
                    ) : null}
                    <div className="stack-list">
                      {analysisQuery.data.tailoredDocument.sections.map((section) => (
                        <article className="page-card page-card--muted" key={section.id}>
                          <p className="section-heading__eyebrow">{section.title}</p>
                          <div className="resume-tailor-section-lines">
                            {section.lines.map((line, index) => (
                              <p
                                className="page-card__body resume-section__body--preserve"
                                key={`${section.id}-${index}`}
                              >
                                {line}
                              </p>
                            ))}
                          </div>
                        </article>
                      ))}
                    </div>
                    {analysisQuery.data.tailoredDocument.plainText ? (
                      <div className="page-card__actions">
                        <button
                          className="secondary-button"
                          onClick={() => {
                            void handleCopyPlainText();
                          }}
                          type="button"
                        >
                          {copiedPlainText ? "Copied" : "Copy plain text"}
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <EmptyStateCard
                    body="The backend has not persisted a tailored preview document for this analysis yet. Review the suggestions first."
                    title="No tailored preview yet"
                  />
                )}
              </section>
            </div>

            <div className="resume-tailor-workspace__aside">
              <section className="page-card">
                <span className="page-card__label">Job posting</span>
                <h2 className="page-card__title">Saved target role context</h2>
                {analysisQuery.data.jobPostingId ? jobPostingDetailQuery.isLoading ? (
                  <LoadingStateCard
                    body="Loading the saved job posting linked to this analysis."
                    title="Loading job posting"
                  />
                ) : jobPostingDetailQuery.isError ? (
                  <ErrorStateCard
                    body={
                      jobPostingDetailQuery.error instanceof Error
                        ? jobPostingDetailQuery.error.message
                        : "The linked job posting could not be loaded."
                    }
                    details={getErrorDetails(jobPostingDetailQuery.error)}
                    onAction={() => {
                      void jobPostingDetailQuery.refetch();
                    }}
                    title="Unable to load job posting"
                  />
                ) : jobPostingDetailQuery.data ? (
                  <>
                    <div className="list-item-card__meta">
                      <span>{jobPostingDetailQuery.data.inputTypeLabel}</span>
                      <span>{jobPostingDetailQuery.data.fetchStatusLabel}</span>
                    </div>
                    <p className="page-card__body">{jobPostingDetailQuery.data.title}</p>
                    {jobPostingDetailQuery.data.parsedSummary ? (
                      <p className="resume-tailor-muted">{jobPostingDetailQuery.data.parsedSummary}</p>
                    ) : null}
                    {jobPostingDetailQuery.data.parsedKeywords.length > 0 ? (
                      <div className="chip-list">
                        {jobPostingDetailQuery.data.parsedKeywords.slice(0, 10).map((keyword) => (
                          <span className="detail-chip detail-chip--accent" key={keyword}>
                            {keyword}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </>
                ) : null : (
                  <EmptyStateCard
                    body="This analysis was created without a saved job posting."
                    title="No linked job posting"
                  />
                )}
              </section>

              <section className="page-card">
                <div className="section-heading">
                  <div>
                    <p className="section-heading__eyebrow">Exports</p>
                    <h2 className="page-card__title">PDF export history</h2>
                  </div>
                  <span className="section-heading__count">
                    {(exportsQuery.data ?? analysisQuery.data.exports).length}
                  </span>
                </div>
                {createExportMutation.isError ? (
                  <ErrorStateCard
                    body={
                      createExportMutation.error instanceof Error
                        ? createExportMutation.error.message
                        : "The PDF export could not be created."
                    }
                    details={getErrorDetails(createExportMutation.error)}
                    onAction={() => createExportMutation.reset()}
                    title="Unable to create export"
                  />
                ) : null}
                <div className="page-card__actions">
                  <button
                    className="primary-button"
                    disabled={createExportMutation.isPending}
                    onClick={() => {
                      void createExportMutation.mutateAsync();
                    }}
                    type="button"
                  >
                    {createExportMutation.isPending ? "Generating PDF..." : "Create PDF export"}
                  </button>
                </div>
                {exportsQuery.isLoading && analysisQuery.data.exports.length === 0 ? (
                  <LoadingStateCard
                    body="Loading export history for this analysis."
                    title="Loading exports"
                  />
                ) : exportsQuery.isError && analysisQuery.data.exports.length === 0 ? (
                  <ErrorStateCard
                    body={
                      exportsQuery.error instanceof Error
                        ? exportsQuery.error.message
                        : "Export history could not be loaded."
                    }
                    details={getErrorDetails(exportsQuery.error)}
                    onAction={() => {
                      void exportsQuery.refetch();
                    }}
                    title="Unable to load exports"
                  />
                ) : (exportsQuery.data ?? analysisQuery.data.exports).length > 0 ? (
                  <div className="stack-list">
                    {(exportsQuery.data ?? analysisQuery.data.exports).map((exportItem) => (
                      <article className="list-item-card" key={exportItem.id}>
                        <div className="list-item-card__content">
                          <div className="list-item-card__meta">
                            <span>{exportItem.exportTypeLabel}</span>
                            {exportItem.formatType ? <span>{exportItem.formatTypeLabel}</span> : null}
                            {exportItem.createdAtLabel ? <span>{exportItem.createdAtLabel}</span> : null}
                          </div>
                          <h3 className="list-item-card__title">{exportItem.fileName}</h3>
                          <p className="resume-tailor-muted">
                            {exportItem.pageCount ? `${exportItem.pageCount} pages` : "Page count unavailable"}
                            {exportItem.fileSizeBytes ? ` · ${exportItem.fileSizeBytes} bytes` : ""}
                          </p>
                        </div>
                        <div className="list-item-card__actions">
                          <button
                            className="secondary-button"
                            onClick={() => {
                              void handleDownloadExport(exportItem.id, exportItem.fileName);
                            }}
                            type="button"
                          >
                            Download PDF
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <EmptyStateCard
                    body="No server-side PDF exports exist for this analysis yet."
                    title="No exports yet"
                  />
                )}
              </section>

              <section className="page-card">
                <span className="page-card__label">Source context</span>
                <h2 className="page-card__title">Original resume evidence</h2>
                {snapshotsQuery.isLoading ? (
                  <LoadingStateCard
                    body="Loading parsed resume snapshots for source comparison."
                    title="Loading source resume"
                  />
                ) : snapshotsQuery.isError ? (
                  <ErrorStateCard
                    body={
                      snapshotsQuery.error instanceof Error
                        ? snapshotsQuery.error.message
                        : "Resume source context could not be loaded."
                    }
                    details={getErrorDetails(snapshotsQuery.error)}
                    onAction={() => {
                      void snapshotsQuery.refetch();
                    }}
                    title="Unable to load source context"
                  />
                ) : snapshotsQuery.data ? (
                  <div className="page-stack">
                    {snapshotsQuery.data.profile ? (
                      <ResumeProfileCard profile={snapshotsQuery.data.profile} />
                    ) : null}
                    <ResumeSkillsCard skills={snapshotsQuery.data.skills.slice(0, 8)} />
                    <ResumeExperienceTimeline experiences={snapshotsQuery.data.experiences} />
                    <ResumeProjectsCard projects={snapshotsQuery.data.projects} />
                  </div>
                ) : null}
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </PageContainer>
  );
}

function InsightListCard({
  title,
  items,
  tone = "neutral",
}: {
  title: string;
  items: string[];
  tone?: "neutral" | "warning" | "accent";
}) {
  return (
    <article className="page-card page-card--muted">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">Insight</p>
          <h3 className="page-card__title">{title}</h3>
        </div>
        <span className={`question-status-badge question-status-badge--${tone}`}>
          {items.length}
        </span>
      </div>
      {items.length > 0 ? (
        <ul className="resume-tailor-list">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="page-card__body">No items were returned for this section.</p>
      )}
    </article>
  );
}
