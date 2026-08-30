import type { ReactNode } from "react";
import { useLocale } from "../../shared/i18n";
import { FilterPanel, SectionPanel, SplitLayout } from "../../shared/ui/layout";

type PracticeLayoutProps = {
  searchControl: ReactNode;
  filterControls: ReactNode;
  reviewQueueCard: ReactNode;
  focusSummaryCard: ReactNode;
  mapLaunchCard: ReactNode;
  resultsContent: ReactNode;
};

export function PracticeMobileLayout({
  searchControl,
  filterControls,
  reviewQueueCard,
  focusSummaryCard,
  mapLaunchCard,
  resultsContent,
}: PracticeLayoutProps) {
  return (
    <div className="practice-layout practice-layout--mobile">
      <section className="practice-layout__search">{searchControl}</section>
      <section className="practice-layout__results">{resultsContent}</section>
      <section className="practice-layout__cluster practice-layout__cluster--support">
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
  mapLaunchCard,
  resultsContent,
}: PracticeLayoutProps) {
  const { locale } = useLocale();
  const isKorean = locale === "ko";

  return (
    <div className="practice-layout practice-layout--desktop">
      <div className="practice-layout__search practice-layout__search--desktop">{searchControl}</div>
      <SplitLayout
        main={
          <div className="page-stack practice-layout__results">
            {resultsContent}
          </div>
        }
        aside={
          <div className="page-stack practice-layout__cluster practice-layout__cluster--rail">
            {focusSummaryCard}
            {mapLaunchCard}
            {reviewQueueCard}
            <FilterPanel
              description={isKorean ? "더 넓은 데스크톱 결과 집합을 살필 때도 필터를 고정해 두세요." : "Keep filters pinned while scanning a larger desktop result set."}
              title={isKorean ? "연습 제어 레일" : "Practice control rail"}
            >
              {filterControls}
            </FilterPanel>
            <SectionPanel className="workspace-note-card practice-workflow-note" variant="muted">
              <div className="practice-workflow-note__topline">
                <span className="page-card__label">{isKorean ? "연습 워크플로우" : "Practice workflow"}</span>
                <span className="detail-chip">{isKorean ? "진입 레일" : "Entry rail"}</span>
              </div>
              <h2 className="page-card__title">{isKorean ? "잡음을 줄인 뒤 한 가지로 들어가세요" : "Reduce noise, then enter one branch"}</h2>
              <p className="page-card__body">
                {isKorean
                  ? "메인 컬럼은 방어 가능한 다음 질문 하나에 집중시키고, 재시도 압박과 필터는 계속 보이게 유지하세요."
                  : "Keep retry pressure and filters visible while the main column stays focused on one defendable next question."}
              </p>
              <div className="practice-workflow-note__steps">
                <div className="practice-workflow-note__step">
                  <strong>{isKorean ? "1. 잡음 줄이기" : "1. Reduce noise"}</strong>
                  <span>{isKorean ? "목록을 신중히 볼 가치가 생길 때까지 카테고리, 회사, 상태를 고정하세요." : "Pin category, company, or status until the list becomes worth reviewing carefully."}</span>
                </div>
                <div className="practice-workflow-note__step">
                  <strong>{isKorean ? "2. 한 노드에 집중" : "2. Commit to one node"}</strong>
                  <span>{isKorean ? "다음 답변이나 분기 방어를 분명히 개선해 주는 질문만 시작하세요." : "Start only the question that clearly improves the next answer or branch defense."}</span>
                </div>
              </div>
            </SectionPanel>
          </div>
        }
      />
    </div>
  );
}
