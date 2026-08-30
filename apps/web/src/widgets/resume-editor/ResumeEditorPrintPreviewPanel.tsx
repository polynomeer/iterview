import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { useLocale } from "../../shared/i18n";
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
  const { locale } = useLocale();
  const isKorean = locale === "ko";

  return (
    <section className="page-card">
      <span className="page-card__label">{isKorean ? "출력 미리보기" : "Print preview"}</span>
      <h2 className="page-card__title">{isKorean ? "서버 출력 미리보기" : "Server print preview"}</h2>
      {isLoading ? (
        <LoadingStateCard
          body={isKorean ? "출력 미리보기 페이지와 레이아웃 힌트를 불러오는 중입니다." : "Loading print preview pages and layout hints."}
          title={isKorean ? "출력 미리보기 준비 중" : "Preparing print preview"}
        />
      ) : isError ? (
        <ErrorStateCard
          body={errorMessage}
          details={errorDetails ? [errorDetails] : undefined}
          onAction={onRetry}
          title={isKorean ? "출력 미리보기를 불러올 수 없습니다" : "Unable to load print preview"}
        />
      ) : data ? (
        <div className="page-stack">
          <div className="stats-grid">
            <MetricCard label={isKorean ? "예상 페이지 수" : "Page estimate"} value={String(data.pageEstimate)} />
            <MetricCard label={isKorean ? "섹션" : "Sections"} tone="accent" value={String(data.sections.length)} />
          </div>
          <div className="stack-list">
            {data.pages.map((page) => (
              <article className="page-card page-card--muted" key={page.pageNumber}>
                <div className="section-heading">
                  <div>
                    <p className="section-heading__eyebrow">{isKorean ? "페이지" : "Page"}</p>
                    <h3 className="page-card__title">{page.pageNumber}</h3>
                  </div>
                  <span className="question-status-badge question-status-badge--neutral">
                    {isKorean ? `${page.lineCount}줄` : `${page.lineCount} lines`}
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
