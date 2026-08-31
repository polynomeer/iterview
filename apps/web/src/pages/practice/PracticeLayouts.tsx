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
      <div className="practice-layout__workspace practice-layout__workspace--browser">
        <aside className="practice-layout__filters practice-layout__filters--browser">
          <FilterPanel
            description={isKorean ? "샘플처럼 왼쪽 레일에서 질문 풀을 빠르게 좁힙니다." : "Use the left rail to narrow the pool quickly like the reference."}
            title={isKorean ? "필터" : "Filter"}
          >
            {filterControls}
          </FilterPanel>
          {focusSummaryCard}
        </aside>
        <div className="page-stack practice-layout__results practice-layout__results--browser">
          {resultsContent}
        </div>
        <aside className="page-stack practice-layout__cluster practice-layout__cluster--rail practice-layout__cluster--browser">
          {focusQuestionCard}
          {mapLaunchCard}
          {reviewQueueCard}
          <SectionPanel className="workspace-note-card practice-workflow-note" variant="muted">
            <div className="practice-workflow-note__topline">
              <span className="page-card__label">{isKorean ? "연습 워크플로우" : "Practice workflow"}</span>
              <span className="detail-chip">{isKorean ? "진입 레일" : "Entry rail"}</span>
            </div>
            <h2 className="page-card__title">{isKorean ? "선택, 검토, 진입을 한 화면에서 끝내세요" : "Choose, inspect, and enter from one screen"}</h2>
            <p className="page-card__body">
              {isKorean
                ? "중앙은 질문 선택, 오른쪽은 인스펙터와 액션, 왼쪽은 필터만 담당하게 고정합니다."
                : "Keep the center for picking, the right for inspection and actions, and the left for filtering."}
            </p>
          </SectionPanel>
        </aside>
      </div>
    </div>
  );
}
