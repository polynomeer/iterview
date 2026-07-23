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
        <SectionPanel variant="muted">
          <span className="page-card__label">Queue actions</span>
          <h2 className="page-card__title">Move items forward intentionally</h2>
          <p className="page-card__body">
            Use `Practice now` when you have time to answer, `Done` when the follow-up is complete, and `Skip` when you need to defer.
          </p>
        </SectionPanel>
        <SectionPanel variant="muted">
          <span className="page-card__label">Desktop workflow</span>
          <h2 className="page-card__title">Keep action choices readable</h2>
          <p className="page-card__body">
            Desktop uses wider cards so the question title, scheduling context, and actions stay visible together.
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
