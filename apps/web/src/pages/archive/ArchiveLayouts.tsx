import type { ReactNode } from "react";
import { useLocale } from "../../shared/i18n";
import { FilterPanel, SectionPanel } from "../../shared/ui/layout";

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
      <aside className="page-stack archive-layout__filters">
        <FilterPanel description={isKorean ? "정리된 질문을 훑는 동안 아카이브 필터를 계속 왼쪽에 고정합니다." : "Keep archive filters pinned on the left while scanning mastered questions."}>
          {filterControls}
        </FilterPanel>
        <SectionPanel className="workspace-note-card archive-workspace-note" variant="muted">
          <div className="archive-workspace-note__header">
            <span className="page-card__label">{isKorean ? "아카이브 탐색" : "Archive browsing"}</span>
            <span className="detail-chip detail-chip--accent">{isKorean ? "좌측 레일" : "Left rail"}</span>
          </div>
          <h2 className="page-card__title">{isKorean ? "검증된 답변 선반만 남기세요" : "Keep this shelf limited to proven answers"}</h2>
          <p className="page-card__body">
            {isKorean
              ? "좌측 레일은 필터와 선반 품질 기준을 계속 보여줘야 합니다."
              : "The left rail should keep filter control and shelf quality criteria visible."}
          </p>
        </SectionPanel>
      </aside>
      <div className="archive-layout__content">{listContent}</div>
      <aside className="page-stack archive-layout__rail">
        <SectionPanel className="workspace-note-card archive-workspace-note" variant="muted">
          <div className="archive-workspace-note__header">
            <span className="page-card__label">{isKorean ? "세션 연결" : "Session linkage"}</span>
            <span className="detail-chip">{isKorean ? "우측 레일" : "Right rail"}</span>
          </div>
          <h2 className="page-card__title">{isKorean ? "원래 세션과 꼬리질문 흐름을 복구하세요" : "Recover the original session and follow-up flow"}</h2>
          <p className="page-card__body">
            {isKorean
              ? "우측 레일은 다시 열 가치가 있는 답변과 세션 역추적의 기준을 제공해야 합니다."
              : "The right rail should frame which answers deserve reopening and when to trace back into a session."}
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
      </aside>
    </div>
  );
}
