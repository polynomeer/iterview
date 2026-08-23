import type { ReactNode } from "react";
import { ContentGrid, SectionPanel } from "../../shared/ui/layout";

type ReviewQueueLayoutProps = {
  actionError: ReactNode;
  listContent: ReactNode;
};

export function ReviewQueueMobileLayout({
  actionError,
  listContent,
}: ReviewQueueLayoutProps) {
  return (
    <div className="page-stack">
      {actionError}
      {listContent}
    </div>
  );
}

export function ReviewQueueDesktopLayout({
  actionError,
  listContent,
}: ReviewQueueLayoutProps) {
  return (
    <div className="review-queue-layout review-queue-layout--desktop">
      <ContentGrid columns="two">
        <SectionPanel className="review-queue-note-card" variant="muted">
          <div className="review-queue-note-card__header">
            <span className="page-card__label">Queue actions</span>
            <span className="detail-chip detail-chip--accent">Execution lane</span>
          </div>
          <h2 className="page-card__title">Move items forward intentionally</h2>
          <p className="page-card__body">
            Use `Practice now` when you have time to answer, `Done` when the follow-up is complete, and `Skip` when you need to defer.
          </p>
          <p className="review-queue-note-card__body">
            Treat this queue as a short operational list, not as another browsing page.
          </p>
        </SectionPanel>
        <SectionPanel className="review-queue-note-card" variant="muted">
          <div className="review-queue-note-card__header">
            <span className="page-card__label">Desktop workflow</span>
            <span className="detail-chip">Readable controls</span>
          </div>
          <h2 className="page-card__title">Keep action choices readable</h2>
          <p className="page-card__body">
            Desktop uses wider cards so the question title, scheduling context, and actions stay visible together.
          </p>
          <p className="review-queue-note-card__body">
            The goal is fast triage: inspect, act, then return to focused answer work.
          </p>
        </SectionPanel>
      </ContentGrid>
      <div className="page-stack">
        {actionError}
        {listContent}
      </div>
    </div>
  );
}
