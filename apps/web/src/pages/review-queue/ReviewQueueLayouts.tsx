import type { ReactNode } from "react";
import { useLocale } from "../../shared/i18n";
import { ContentGrid, SectionPanel } from "../../shared/ui/layout";

type ReviewQueueLayoutProps = {
  actionError: ReactNode;
  decisionSupport: ReactNode;
  listContent: ReactNode;
};

export function ReviewQueueMobileLayout({
  actionError,
  decisionSupport,
  listContent,
}: ReviewQueueLayoutProps) {
  return (
    <div className="page-stack">
      {actionError}
      {decisionSupport}
      {listContent}
    </div>
  );
}

export function ReviewQueueDesktopLayout({
  actionError,
  decisionSupport,
  listContent,
}: ReviewQueueLayoutProps) {
  const { locale } = useLocale();
  const isKorean = locale === "ko";
  return (
    <div className="review-queue-layout review-queue-layout--desktop">
      <ContentGrid columns="two">
        <SectionPanel className="review-queue-note-card" variant="muted">
          <div className="review-queue-note-card__header">
            <span className="page-card__label">{isKorean ? "큐 작업" : "Queue actions"}</span>
            <span className="detail-chip detail-chip--accent">{isKorean ? "복구 레인" : "Recovery lane"}</span>
          </div>
          <h2 className="page-card__title">{isKorean ? "항목을 의도적으로 앞으로 이동시키세요" : "Move items forward intentionally"}</h2>
          <p className="page-card__body">
            {isKorean
              ? "`지금 연습`은 바로 답할 수 있을 때, `완료`는 재시도가 해소되었을 때, `건너뛰기`는 브랜치를 더 미뤄야 할 때 사용하세요."
              : "Use `Practice now` when you can answer, `Done` when the retry is resolved, and `Skip` when the branch still needs deferment."}
          </p>
          <p className="review-queue-note-card__body">
            {isKorean ? "이 큐를 또 하나의 탐색 페이지가 아니라 짧은 복구 목록으로 다루세요." : "Treat this queue as a short recovery list, not as another browsing page."}
          </p>
          <div className="review-queue-note-card__rules">
            <div className="review-queue-note-card__rule">
              <strong>{isKorean ? "1. 확인" : "1. Inspect"}</strong>
              <span>{isKorean ? "행동 전에 우선순위, 일정, 최신 결과 컨텍스트를 읽으세요." : "Read priority, schedule, and latest result context before acting."}</span>
            </div>
            <div className="review-queue-note-card__rule">
              <strong>{isKorean ? "2. 해결" : "2. Resolve"}</strong>
              <span>{isKorean ? "지금 답변 루프를 끝내거나, 의도적으로 브랜치를 뒤로 미루세요." : "Either finish the answer loop now or deliberately move the branch later."}</span>
            </div>
          </div>
        </SectionPanel>
        {decisionSupport}
      </ContentGrid>
      <div className="page-stack">
        {actionError}
        {listContent}
      </div>
    </div>
  );
}
