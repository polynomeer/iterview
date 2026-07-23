import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { MetricCard } from "../../shared/ui/MetricCard";

type Props = {
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
  errorDetails: string | null;
  onRetry: () => void;
  data: {
    pageEstimate: number;
    sections: Array<unknown>;
    pages: Array<{
      pageNumber: number;
      sectionKeys: string[] | null;
      lineCount: number;
    }>;
  } | null;
};

export default function ResumeEditorPrintPreviewPanel({
  isLoading,
  isError,
  errorMessage,
  errorDetails,
  onRetry,
  data,
}: Props) {
  return (
    <section className="page-card">
      <span className="page-card__label">Print preview</span>
      <h2 className="page-card__title">Server print preview</h2>
      {isLoading ? (
        <LoadingStateCard body="Loading print preview pages and layout hints." title="Preparing print preview" />
      ) : isError ? (
        <ErrorStateCard
          body={errorMessage}
          details={errorDetails ? [errorDetails] : undefined}
          onAction={onRetry}
          title="Unable to load print preview"
        />
      ) : data ? (
        <div className="page-stack">
          <div className="stats-grid">
            <MetricCard label="Page estimate" value={String(data.pageEstimate)} />
            <MetricCard label="Sections" tone="accent" value={String(data.sections.length)} />
          </div>
          <div className="stack-list">
            {data.pages.map((page) => (
              <article className="page-card page-card--muted" key={page.pageNumber}>
                <div className="section-heading">
                  <div>
                    <p className="section-heading__eyebrow">Page</p>
                    <h3 className="page-card__title">{page.pageNumber}</h3>
                  </div>
                  <span className="question-status-badge question-status-badge--neutral">
                    {page.lineCount} lines
                  </span>
                </div>
                <div className="filter-chip-row">
                  {(page.sectionKeys ?? []).map((sectionKey) => (
                    <span className="detail-chip" key={`${page.pageNumber}-${sectionKey}`}>
                      {sectionKey}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
