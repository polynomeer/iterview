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
  const { t } = useLocale();
  const safeItems = items ?? [];

  return (
    <section className="page-card">
      <span className="page-card__label">{eyebrow}</span>
      <h2 className="page-card__title">{title}</h2>
      <p className="page-card__body">{helperText}</p>
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
                <p className="resume-section__helper">{t("interview.facetDefended")}: {formatFacetList(item.defendedFacets) ?? t("common.none")}</p>
                {item.weakFacets.length > 0 ? (
                  <p className="list-item-card__body list-item-card__body--warning">
                    {t("interview.facetWeak")}: {formatFacetList(item.weakFacets)}
                  </p>
                ) : null}
                {item.skippedFacets.length > 0 ? (
                  <p className="list-item-card__body list-item-card__body--warning">
                    {t("interview.facetSkipped")}: {formatFacetList(item.skippedFacets)}
                  </p>
                ) : null}
                {item.unaskedFacets.length > 0 ? (
                  <p className="resume-section__helper">
                    {t("interview.facetUnasked")}: {formatFacetList(item.unaskedFacets)}
                  </p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
