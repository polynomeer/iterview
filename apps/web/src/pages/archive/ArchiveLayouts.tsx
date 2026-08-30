import type { ReactNode } from "react";
import { useLocale } from "../../shared/i18n";
import { FilterPanel, SectionPanel, SplitLayout } from "../../shared/ui/layout";

type ArchiveLayoutProps = {
  filterControls: ReactNode;
  listContent: ReactNode;
};

export function ArchiveMobileLayout({
  filterControls,
  listContent,
}: ArchiveLayoutProps) {
  const { locale } = useLocale();
  const isKorean = locale === "ko";

  return (
    <div className="archive-layout archive-layout--mobile">
      <section className="archive-layout__content">{listContent}</section>
      <section className="archive-layout__rail">
        {filterControls}
        <SectionPanel className="workspace-note-card archive-workspace-note" variant="muted">
          <div className="archive-workspace-note__header">
            <span className="page-card__label">{isKorean ? "아카이브 검토" : "Archive review"}</span>
            <span className="detail-chip">{isKorean ? "모바일 라이브러리" : "Mobile library"}</span>
          </div>
          <h2 className="page-card__title">{isKorean ? "아카이브를 작은 답변 선반처럼 다루세요" : "Treat the archive as a compact answer shelf"}</h2>
          <p className="page-card__body">
            {isKorean
              ? "모바일에서는 화면 초점을 유지하기 위해 정리된 질문 목록 다음에 필터를 둡니다. 다시 열고, 복기하고, 면접 세션으로 되돌아갈 항목에 집중하세요."
              : "Filtering comes after the mastered list on mobile so the screen stays focused on what you can reopen, revisit, or map back to interview sessions."}
          </p>
          <div className="archive-workspace-note__rules">
            <article className="archive-workspace-note__rule">
              <span>{isKorean ? "보관" : "Keep"}</span>
              <strong>{isKorean ? "안정된 논리를 가진 재사용 가능한 답변만 남기기" : "Only reusable answers with stable reasoning"}</strong>
            </article>
            <article className="archive-workspace-note__rule">
              <span>{isKorean ? "다시 열기" : "Reopen"}</span>
              <strong>{isKorean ? "어려웠던 성공 답변은 면접 전에 원본 세션까지 역추적하기" : "Trace difficult wins back to the source session before interviews"}</strong>
            </article>
          </div>
        </SectionPanel>
      </section>
    </div>
  );
}

export function ArchiveDesktopLayout({
  filterControls,
  listContent,
}: ArchiveLayoutProps) {
  const { locale } = useLocale();
  const isKorean = locale === "ko";

  return (
    <div className="archive-layout archive-layout--desktop">
      <SplitLayout
        main={<div className="archive-layout__content">{listContent}</div>}
        aside={
          <div className="page-stack archive-layout__rail">
            <SectionPanel className="workspace-note-card archive-workspace-note" variant="muted">
              <div className="archive-workspace-note__header">
                <span className="page-card__label">{isKorean ? "아카이브 탐색" : "Archive browsing"}</span>
                <span className="detail-chip detail-chip--accent">{isKorean ? "고정 레일" : "Pinned rail"}</span>
              </div>
              <h2 className="page-card__title">{isKorean ? "맥락을 잃지 않고 검증된 작업을 훑어보세요" : "Use the extra space to scan proven work without losing context"}</h2>
              <p className="page-card__body">
                {isKorean
                  ? "데스크톱에서는 메인 컬럼이 고신호 요약에 집중하는 동안 필터와 다시 연 세션 맥락을 계속 보이게 유지해야 합니다."
                  : "Desktop should keep filters and reopened-session context visible while the main column stays focused on high-signal summaries."}
              </p>
              <div className="archive-workspace-note__rules">
                <article className="archive-workspace-note__rule">
                  <span>{isKorean ? "선반 품질" : "Shelf quality"}</span>
                  <strong>{isKorean ? "질문 문구를 다시 읽지 않아도 방어할 수 있는 답변만 보관하기" : "Archive only answers you can defend without rereading the prompt"}</strong>
                </article>
                <article className="archive-workspace-note__rule">
                  <span>{isKorean ? "세션 연결" : "Session linkage"}</span>
                  <strong>{isKorean ? "최종 점수만이 아니라 꼬리질문 체인을 복구하기 위해 연결된 세션 사용하기" : "Use linked sessions to recover the follow-up chain, not just the final score"}</strong>
                </article>
              </div>
            </SectionPanel>
            <FilterPanel description={isKorean ? "정리된 질문을 훑고 요약을 다시 여는 동안 아카이브 필터를 계속 보이게 유지합니다." : "Archive filters stay visible while you scan mastered questions and reopen summaries."}>
              {filterControls}
            </FilterPanel>
          </div>
        }
      />
    </div>
  );
}
