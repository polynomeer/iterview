import type { ReactNode } from "react";
import { useLocale } from "../../shared/i18n";
import { FilterPanel, SectionPanel } from "../../shared/ui/layout";

type PracticeLayoutProps = {
  searchControl: ReactNode;
  filterControls: ReactNode;
  reviewQueueCard: ReactNode;
  focusSummaryCard: ReactNode;
  focusQuestionCard: ReactNode;
  mapLaunchCard: ReactNode;
  resultsContent: ReactNode;
};

export function PracticeMobileLayout({
  searchControl,
  filterControls,
  reviewQueueCard,
  focusSummaryCard,
  focusQuestionCard,
  mapLaunchCard,
  resultsContent,
}: PracticeLayoutProps) {
  return (
    <div className="practice-layout practice-layout--mobile">
      <section className="practice-layout__search">{searchControl}</section>
      <section className="practice-layout__results">{resultsContent}</section>
      <section className="practice-layout__cluster practice-layout__cluster--support">
        {focusQuestionCard}
        {focusSummaryCard}
        {mapLaunchCard}
        {filterControls}
        {reviewQueueCard}
      </section>
    </div>
  );
}

export function PracticeDesktopLayout({
  searchControl,
  filterControls,
  reviewQueueCard,
  focusSummaryCard,
  focusQuestionCard,
  mapLaunchCard,
  resultsContent,
}: PracticeLayoutProps) {
  const { locale } = useLocale();
  const isKorean = locale === "ko";

  return (
    <div className="practice-layout practice-layout--desktop">
      <div className="practice-layout__search practice-layout__search--desktop">{searchControl}</div>
      <div className="practice-layout__workspace">
        <aside className="practice-layout__filters">
          <FilterPanel
            description={isKorean ? "샘플처럼 왼쪽에 필터를 고정해 질문 풀을 빠르게 좁힙니다." : "Pin filters on the left like the reference to narrow the pool quickly."}
            title={isKorean ? "필터" : "Filter"}
          >
            {filterControls}
          </FilterPanel>
          {focusSummaryCard}
        </aside>
        <div className="page-stack practice-layout__results">
          {resultsContent}
        </div>
        <aside className="page-stack practice-layout__cluster practice-layout__cluster--rail">
          {focusQuestionCard}
          {mapLaunchCard}
          {reviewQueueCard}
          <SectionPanel className="workspace-note-card practice-workflow-note" variant="muted">
            <div className="practice-workflow-note__topline">
              <span className="page-card__label">{isKorean ? "연습 워크플로우" : "Practice workflow"}</span>
              <span className="detail-chip">{isKorean ? "진입 레일" : "Entry rail"}</span>
            </div>
            <h2 className="page-card__title">{isKorean ? "잡음을 줄인 뒤 한 가지로 들어가세요" : "Reduce noise, then enter one branch"}</h2>
            <p className="page-card__body">
              {isKorean
                ? "중앙은 질문 선택에만 집중시키고, 필터와 재시도 압박은 좌우 레일에 고정합니다."
                : "Keep the center focused on question choice while filters and retry pressure stay pinned in the side rails."}
            </p>
          </SectionPanel>
        </aside>
      </div>
    </div>
  );
}
