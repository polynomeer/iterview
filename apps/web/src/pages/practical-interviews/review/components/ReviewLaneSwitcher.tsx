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
  const { locale } = useLocale();
  const isKorean = locale === "ko";

  return (
    <section className="page-card practical-review-tabs-card">
      <div className="section-heading">
        <div>
          <span className="page-card__label">{isKorean ? "레인 전환" : "Lane switcher"}</span>
          <h2 className="page-card__title">{isKorean ? "전사, 질문, 스레드 리뷰를 이동하며 점검하세요" : "Move through transcript, question, and thread review"}</h2>
        </div>
        <p className="page-card__body practical-review-tabs-card__summary">
          {isKorean ? "리플레이 컨텍스트와 선택된 근거를 유지한 채 현재 레인에만 집중하세요." : "Keep the active lane focused while preserving replay context and selected evidence."}
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
              ? isKorean
                ? "전사 리뷰"
                : "Transcript review"
              : tab === "question"
                ? isKorean
                  ? "질문 리뷰"
                  : "Question review"
                : isKorean
                  ? "스레드 리뷰"
                  : "Thread review"}
          </button>
        ))}
      </div>

      {children}
    </section>
  );
}
