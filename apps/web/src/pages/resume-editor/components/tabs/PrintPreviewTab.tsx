import { getErrorDetails, userFacingErrorMessage } from "../../../../shared/api/errors";
import { ErrorStateCard } from "../../../../shared/ui/ErrorStateCard";
import { LoadingStateCard } from "../../../../shared/ui/LoadingStateCard";
import { MetricCard } from "../../../../shared/ui/MetricCard";
import type { EditorControllerProps } from "../../editorViewProps";

export function PrintPreviewTab({ ctrl }: EditorControllerProps) {
  const {
    t,
    printPreviewQuery,
  } = ctrl;

  return (
    <section className="page-card">
      <span className="page-card__label">{t("resumeEditor.printPreview")}</span>
      <h2 className="page-card__title">{t("resumeEditor.serverPrintPreview")}</h2>
      {printPreviewQuery.isLoading ? (
        <LoadingStateCard
          body={t("resumeEditor.loadingPrintPreviewPagesAndLayout")}
          title={t("resumeEditor.preparingPrintPreview")}
        />
      ) : printPreviewQuery.isError ? (
        <ErrorStateCard
          body={userFacingErrorMessage(printPreviewQuery.error, t("resumeEditor.unableToLoadPrintPreview"))}
          details={getErrorDetails(printPreviewQuery.error)}
          onAction={() => {
            void printPreviewQuery.refetch();
          }}
          title={t("resumeEditor.unableToLoadPrintPreviewTitle")}
        />
      ) : printPreviewQuery.data ? (
        <div className="page-stack">
          <div className="stats-grid">
            <MetricCard label={t("resumeEditor.pageEstimate")} value={String(printPreviewQuery.data.pageEstimate)} />
            <MetricCard label={t("resumeEditor.sections")} tone="accent" value={String(printPreviewQuery.data.sections.length)} />
          </div>
          <div className="stack-list">
            {printPreviewQuery.data.pages.map((page) => (
              <article className="page-card page-card--muted" key={page.pageNumber}>
                <div className="section-heading">
                  <div>
                    <p className="section-heading__eyebrow">{t("resumeEditor.page")}</p>
                    <h3 className="page-card__title">{page.pageNumber}</h3>
                  </div>
                  <span className="question-status-badge question-status-badge--neutral">
                    {t("resumeEditor.pageLineCount", { count: page.lineCount })}
                  </span>
                </div>
                <div className="filter-chip-row">
                  {page.sectionKeys.map((sectionKey) => (
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
