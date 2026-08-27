import type { InterviewFacetSummaryModel } from "../../entities/interview/model";
import { useLocale } from "../../shared/i18n";

type InterviewFacetSummaryPanelProps = {
  title: string;
  eyebrow: string;
  helperText: string;
  items: InterviewFacetSummaryModel[];
  tone: "warning" | "accent" | "neutral";
  emptyMessage: string;
};

function formatFacetList(facets: string[]) {
  return facets.length > 0 ? facets.join(", ") : null;
}

export function InterviewFacetSummaryPanel({
  title,
  eyebrow,
  helperText,
  items,
  tone,
  emptyMessage,
}: InterviewFacetSummaryPanelProps) {
  const { locale, t } = useLocale();
  const isKorean = locale === "ko";
  const safeItems = items ?? [];

  return (
    <section className={`page-card interview-facet-summary-panel interview-facet-summary-panel--${tone}`}>
      <span className="page-card__label">{eyebrow}</span>
      <h2 className="page-card__title">{title}</h2>
      <p className="page-card__body">{helperText}</p>
      {safeItems.length > 0 ? (
        <div
          className="interview-facet-summary-panel__summary-row"
          role="list"
          aria-label={isKorean ? `${title} 요약` : `${title} summary`}
        >
          <span className="interview-facet-summary-panel__summary-item" role="listitem">
            {isKorean ? `항목 ${safeItems.length}개` : `Items ${safeItems.length}`}
          </span>
          <span className="interview-facet-summary-panel__summary-item" role="listitem">
            {isKorean
              ? `약한 항목 ${safeItems.reduce((sum, item) => sum + item.weakFacetCount, 0)}개`
              : `Weak ${safeItems.reduce((sum, item) => sum + item.weakFacetCount, 0)}`}
          </span>
          <span className="interview-facet-summary-panel__summary-item interview-facet-summary-panel__summary-item--accent" role="listitem">
            {isKorean
              ? `건너뜀 ${safeItems.reduce((sum, item) => sum + item.skippedFacetCount, 0)}개`
              : `Skipped ${safeItems.reduce((sum, item) => sum + item.skippedFacetCount, 0)}`}
          </span>
        </div>
      ) : null}
      {safeItems.length === 0 ? (
        <p className="resume-section__helper">{emptyMessage}</p>
      ) : (
        <div className="stack-list">
          {safeItems.map((item) => (
            <article className={`list-item-card interview-facet-card interview-facet-card--${tone}`} key={item.id}>
              <div className="list-item-card__content">
                <div className="list-item-card__meta">
                  <span>{item.sectionLabel}</span>
                  {item.label ? <span>{item.label}</span> : null}
                </div>
                <h3 className="list-item-card__title">
                  {item.label ?? `${item.sectionLabel} ${t("interview.evidenceFallbackSuffix")}`}
                </h3>
                <div className="interview-facet-card__signals">
                  <span className="interview-facet-card__signal">
                    {t("interview.facetDefended")}: {formatFacetList(item.defendedFacets) ?? t("common.none")}
                  </span>
                  {item.weakFacets.length > 0 ? (
                    <span className="interview-facet-card__signal interview-facet-card__signal--warning">
                      {t("interview.facetWeak")}: {formatFacetList(item.weakFacets)}
                    </span>
                  ) : null}
                  {item.skippedFacets.length > 0 ? (
                    <span className="interview-facet-card__signal interview-facet-card__signal--warning">
                      {t("interview.facetSkipped")}: {formatFacetList(item.skippedFacets)}
                    </span>
                  ) : null}
                  {item.unaskedFacets.length > 0 ? (
                    <span className="interview-facet-card__signal">
                      {t("interview.facetUnasked")}: {formatFacetList(item.unaskedFacets)}
                    </span>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
