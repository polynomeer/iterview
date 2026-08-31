import type { ReactNode } from "react";

type ReviewQueueLayoutProps = {
  actionError: ReactNode;
  supportRail: ReactNode;
  mainContent: ReactNode;
  inspectorRail?: ReactNode;
};

export function ReviewQueueMobileLayout({
  actionError,
  supportRail,
  mainContent,
}: ReviewQueueLayoutProps) {
  return (
    <div className="page-stack">
      {actionError}
      {supportRail}
      {mainContent}
    </div>
  );
}

export function ReviewQueueDesktopLayout({
  actionError,
  supportRail,
  mainContent,
  inspectorRail,
}: ReviewQueueLayoutProps) {
  return (
    <div className="review-queue-layout review-queue-layout--desktop">
      <aside className="review-queue-layout__support">{supportRail}</aside>
      <main className="page-stack review-queue-layout__content">
        {actionError}
        {mainContent}
      </main>
      {inspectorRail ? <aside className="page-stack review-queue-layout__inspector">{inspectorRail}</aside> : null}
    </div>
  );
}
