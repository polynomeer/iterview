import type { ReactNode } from "react";
import { useLocale } from "../../../../shared/i18n";
import { REVIEW_TABS, type ReviewTab } from "../reviewModel";

/** Lane switcher card; the active lane panel is passed as children. */
export function ReviewLaneSwitcher({
  activeTab,
  changeTab,
  children,
}: {
  activeTab: ReviewTab;
  changeTab: (tab: ReviewTab) => void;
  children: ReactNode;
}) {
  const { t } = useLocale();

  return (
    <section className="page-card practical-review-tabs-card">
      <div className="section-heading">
        <div>
          <span className="page-card__label">{t("practicalReview.laneSwitcher")}</span>
          <h2 className="page-card__title">{t("practicalReview.moveThroughTranscriptQuestion")}</h2>
        </div>
        <p className="page-card__body practical-review-tabs-card__summary">
          {t("practicalReview.keepActiveLaneFocused")}
        </p>
      </div>
      <div className="page-card__actions practical-review-tabs-card__actions">
        {REVIEW_TABS.map((tab) => (
          <button
            className={activeTab === tab ? "primary-button" : "secondary-button"}
            key={tab}
            onClick={() => changeTab(tab)}
            type="button"
          >
            {tab === "transcript"
              ? t("practicalReview.transcriptReview")
              : tab === "question"
                ? t("practicalReview.questionReview")
                : t("practicalReview.threadReview")}
          </button>
        ))}
      </div>

      {children}
    </section>
  );
}
